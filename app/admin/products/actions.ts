'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function validSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function saveProductAction(formData: FormData) {
  const id = value(formData, 'id');
  const name = value(formData, 'name');
  const slug = value(formData, 'slug').toLowerCase();
  const shortDescription = value(formData, 'short_description');
  const description = value(formData, 'description');
  const priceMode = value(formData, 'price_mode');
  const rawPrice = value(formData, 'price_ghs');
  const availability = value(formData, 'availability');
  const stockQuantity = Number(value(formData, 'stock_quantity') || '0');
  const categoryId = value(formData, 'category_id');
  const sortOrder = Number(value(formData, 'sort_order') || '0');
  const personalisationOptions = formData
    .getAll('personalisation_options')
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);
  const files = formData.getAll('images').filter(
    (file): file is File => typeof File !== 'undefined' && file instanceof File && file.size > 0,
  );

  if (
    name.length < 2 || name.length > 120
    || !validSlug(slug) || slug.length > 140
    || shortDescription.length > 240 || description.length > 5000
    || !['quote', 'fixed'].includes(priceMode)
    || !['in_stock', 'made_to_order', 'unavailable'].includes(availability)
    || !Number.isInteger(stockQuantity) || stockQuantity < 0 || stockQuantity > 100000
    || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10000
    || (categoryId && !/^[0-9a-f-]{36}$/i.test(categoryId))
    || (priceMode === 'fixed' && (!rawPrice || !Number.isFinite(Number(rawPrice)) || Number(rawPrice) <= 0))
    || files.length > 8
    || files.some((file) => !IMAGE_TYPES[file.type] || file.size > 5 * 1024 * 1024)
  ) {
    redirect('/admin/products?error=invalid-product');
  }

  const { supabase } = await requireStoreOwner();
  const price = priceMode === 'fixed' ? Number(rawPrice) : null;
  const payload = {
    name,
    slug,
    short_description: shortDescription || null,
    description: description || null,
    price_mode: priceMode,
    price_ghs: price,
    availability,
    stock_quantity: stockQuantity,
    category_id: categoryId || null,
    personalisation_options: personalisationOptions,
    sort_order: sortOrder,
    is_active: formData.get('is_active') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    updated_at: new Date().toISOString(),
  };

  let productId = id;
  let oldSlug = '';

  if (productId) {
    const { data: current } = await supabase
      .from('products')
      .select('slug')
      .eq('id', productId)
      .maybeSingle();
    oldSlug = current?.slug ?? '';

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId);

    if (error) redirect('/admin/products?error=save-failed');
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) redirect('/admin/products?error=save-failed');
    productId = data.id;
  }

  for (const [index, file] of files.entries()) {
    const path = `${productId}/${randomUUID()}.${IMAGE_TYPES[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from('tg-product-images')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) redirect('/admin/products?error=image-upload-failed');

    const { data: publicUrl } = supabase.storage
      .from('tg-product-images')
      .getPublicUrl(path);

    const { error: rowError } = await supabase.from('product_images').insert({
      product_id: productId,
      image_url: publicUrl.publicUrl,
      storage_path: path,
      alt_text: name,
      sort_order: index,
    });

    if (rowError) {
      await supabase.storage.from('tg-product-images').remove([path]);
      redirect('/admin/products?error=image-save-failed');
    }
  }

  revalidatePath('/shop');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath(`/shop/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/shop/${oldSlug}`);
  redirect('/admin/products?saved=1');
}

export async function toggleProductAction(formData: FormData) {
  const id = value(formData, 'id');
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin/products?error=invalid-product');

  const { supabase } = await requireStoreOwner();
  const { data: product, error } = await supabase
    .from('products')
    .select('is_active')
    .eq('id', id)
    .single();

  if (error || !product) redirect('/admin/products?error=update-failed');

  const { error: updateError } = await supabase
    .from('products')
    .update({ is_active: !product.is_active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) redirect('/admin/products?error=update-failed');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect('/admin/products');
}

export async function deleteProductAction(formData: FormData) {
  const id = value(formData, 'id');
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin/products?error=invalid-product');

  const { supabase } = await requireStoreOwner();
  const { data: images } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', id);

  const paths = (images ?? []).map((image) => image.storage_path).filter(Boolean);
  if (paths.length) {
    const { error: removeError } = await supabase.storage.from('tg-product-images').remove(paths);
    if (removeError) redirect('/admin/products?error=delete-failed');
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) redirect('/admin/products?error=delete-failed');

  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect('/admin/products?deleted=1');
}
