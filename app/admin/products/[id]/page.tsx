import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';
import ProductForm from '../product-form';
export default async function EditProductPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const {supabase}=await requireStoreOwner();const [{data:p},{data:cats}]=await Promise.all([supabase.from('products').select('id,name,slug,short_description,description,price_ghs,stock_quantity,category_id,sort_order,is_active,is_featured').eq('id',id).maybeSingle(),supabase.from('categories').select('id,name').eq('is_active',true).order('sort_order')]);if(!p)notFound();return <section className="admin-content"><Link href="/admin" className="admin-back">← Products</Link><p className="eyebrow">CATALOGUE MANAGEMENT</p><h1>Edit product</h1><ProductForm categories={cats??[]} product={p}/></section>;}
