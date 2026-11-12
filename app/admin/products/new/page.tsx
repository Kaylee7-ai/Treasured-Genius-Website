import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';
import ProductForm from '../product-form';
export default async function NewProductPage(){const {supabase}=await requireStoreOwner();const {data:cats}=await supabase.from('categories').select('id,name').eq('is_active',true).order('sort_order');return <section className="admin-content"><Link href="/admin" className="admin-back">← Products</Link><p className="eyebrow">CATALOGUE MANAGEMENT</p><h1>Add a product</h1><ProductForm categories={cats??[]}/></section>;}
