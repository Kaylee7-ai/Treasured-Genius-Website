import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';
import ProductForm from '../product-form';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireStoreOwner();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products')
      .select('id,name,slug,short_description,description,price_mode,price_ghs,availability,stock_quantity,category_id,personalisation_options,sort_order,is_active,is_featured')
      .eq('id', id).maybeSingle(),
    supabase.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
  ]);

  if (!product) notFound();

  return (
    <section className="admin-content">
      <Link href="/admin/products" className="admin-back">← Products & designs</Link>
      <p className="eyebrow">GALLERY MANAGEMENT</p>
      <h1>Edit product or sample</h1>
      <ProductForm categories={categories ?? []} product={product} />
    </section>
  );
}
