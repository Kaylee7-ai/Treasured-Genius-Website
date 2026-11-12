'use server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';
const schema = z.object({
 id:z.string().uuid().optional(), name:z.string().trim().min(2).max(120),
 slug:z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
 short_description:z.string().trim().max(240).optional(), description:z.string().trim().max(5000).optional(),
 price_ghs:z.coerce.number().positive().max(10000000), stock_quantity:z.coerce.number().int().min(0).max(100000),
 category_id:z.string().uuid().optional().or(z.literal('')), sort_order:z.coerce.number().int().min(0).max(10000),
 is_active:z.enum(['on']).optional(), is_featured:z.enum(['on']).optional()
});
export async function saveProductAction(formData:FormData) {
 const parsed=schema.safeParse({id:formData.get('id')||undefined,name:formData.get('name'),slug:formData.get('slug'),short_description:formData.get('short_description')||'',description:formData.get('description')||'',price_ghs:formData.get('price_ghs'),stock_quantity:formData.get('stock_quantity'),category_id:formData.get('category_id')||'',sort_order:formData.get('sort_order')||0,is_active:formData.get('is_active')||undefined,is_featured:formData.get('is_featured')||undefined});
 if(!parsed.success) redirect('/admin?error=invalid-product');
 const files=formData.getAll('images').filter((f):f is File=>f instanceof File&&f.size>0);
 if(files.length>8||files.some(f=>!['image/jpeg','image/png','image/webp','image/avif'].includes(f.type)||f.size>5*1024*1024)) redirect('/admin?error=invalid-image');
 const {supabase}=await requireStoreOwner(); const v=parsed.data;
 const payload={name:v.name,slug:v.slug,short_description:v.short_description||null,description:v.description||null,price_ghs:v.price_ghs,stock_quantity:v.stock_quantity,category_id:v.category_id||null,sort_order:v.sort_order,is_active:Boolean(v.is_active),is_featured:Boolean(v.is_featured),is_demo:false,updated_at:new Date().toISOString()};
 let id=v.id;
 if(id){const {error}=await supabase.from('products').update(payload).eq('id',id);if(error) redirect('/admin?error=save-failed');}
 else {const {data,error}=await supabase.from('products').insert(payload).select('id').single();if(error||!data) redirect('/admin?error=save-failed');id=data.id;}
 if(files.length){
  const {data:old}=await supabase.from('product_images').select('storage_path').eq('product_id',id);
  if(old?.length){await supabase.from('product_images').delete().eq('product_id',id);const paths=old.map(x=>x.storage_path).filter(Boolean);if(paths.length) await supabase.storage.from('product-images').remove(paths);}
  for(const [i,file] of files.entries()){
   const path=`${id}/${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;
   const {error:upErr}=await supabase.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});
   if(upErr) redirect('/admin?error=image-upload-failed');
   const {data:url}=supabase.storage.from('product-images').getPublicUrl(path);
   const {error:rowErr}=await supabase.from('product_images').insert({product_id:id,image_url:url.publicUrl,storage_path:path,alt_text:v.name,sort_order:i});
   if(rowErr) redirect('/admin?error=image-save-failed');
  }
 }
 revalidatePath('/shop');revalidatePath(`/shop/${v.slug}`);revalidatePath('/admin');redirect('/admin?saved=1');
}
export async function toggleProductAction(formData:FormData){
 const id=z.string().uuid().safeParse(formData.get('id'));if(!id.success)redirect('/admin?error=invalid-product');
 const {supabase}=await requireStoreOwner();const {data:p,error}=await supabase.from('products').select('is_active').eq('id',id.data).single();if(error||!p)redirect('/admin?error=update-failed');
 await supabase.from('products').update({is_active:!p.is_active,updated_at:new Date().toISOString()}).eq('id',id.data);revalidatePath('/admin');revalidatePath('/shop');redirect('/admin');
}
export async function deleteProductAction(formData:FormData){
 const id=z.string().uuid().safeParse(formData.get('id'));if(!id.success)redirect('/admin?error=invalid-product');
 const {supabase}=await requireStoreOwner();const {data:imgs}=await supabase.from('product_images').select('storage_path').eq('product_id',id.data);const {error}=await supabase.from('products').delete().eq('id',id.data);if(error)redirect('/admin?error=delete-failed');
 const paths=(imgs??[]).map(x=>x.storage_path).filter(Boolean);if(paths.length)await supabase.storage.from('product-images').remove(paths);revalidatePath('/admin');revalidatePath('/shop');redirect('/admin');
}
export async function reorderProductAction(formData:FormData){
 const p=z.object({id:z.string().uuid(),sort_order:z.coerce.number().int().min(0).max(10000)}).safeParse({id:formData.get('id'),sort_order:formData.get('sort_order')});if(!p.success)redirect('/admin?error=invalid-order');
 const {supabase}=await requireStoreOwner();const {error}=await supabase.from('products').update({sort_order:p.data.sort_order}).eq('id',p.data.id);if(error)redirect('/admin?error=update-failed');revalidatePath('/admin');revalidatePath('/shop');redirect('/admin');
}
