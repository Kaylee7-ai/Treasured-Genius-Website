import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';
import ProductForm from '../product-form';

export default async function NewProductPage() {
  const { supabase } = await requireStoreOwner();
  const { data: categories } = await supabase
    .from('categories')
    .select('id,name')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <section className="admin-content">
      <Link href="/admin/products" className="admin-back">← Products & designs</Link>
      <p className="eyebrow">GALLERY MANAGEMENT</p>
      <h1>Add a product or sample</h1>
      <p className="admin-intro">Add approved product information and photographs. New items stay hidden until you choose to publish them.</p>
      <ProductForm categories={categories ?? []} />
    </section>
  );
}
