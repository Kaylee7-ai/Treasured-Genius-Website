import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';
import { deleteProductAction, toggleProductAction, reorderProductAction } from './products/actions';
export default async function AdminHome() {
  const { supabase, user } = await requireStoreOwner();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('id,name,slug,price_ghs,stock_quantity,is_active,is_demo,is_featured,sort_order,categories(name)').order('sort_order').order('created_at',{ascending:false}),
    supabase.from('categories').select('id,name').eq('is_active',true).order('sort_order'),
  ]);
  return <section className="admin-content"><div className="admin-heading"><div><p className="eyebrow">OWNER WORKSPACE</p><h1>Product catalogue</h1><p>Signed in as {user.email}. Manage items shown in your public shop.</p></div><Link className="admin-primary admin-add" href="/admin/products/new">Add a product +</Link></div>
    <div className="admin-stats"><div><span>Products</span><strong>{products?.length ?? 0}</strong></div><div><span>Visible in shop</span><strong>{products?.filter(p=>p.is_active).length ?? 0}</strong></div><div><span>Categories</span><strong>{categories?.length ?? 0}</strong></div></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Order</th><th>Actions</th></tr></thead><tbody>{(products ?? []).map(p=>{const category=Array.isArray(p.categories)?p.categories[0]:p.categories;return <tr key={p.id}><td><strong>{p.name}</strong>{p.is_demo && <small className="admin-demo">Demo placeholder</small>}<small>{category?.name ?? 'Uncategorised'}</small></td><td>GH₵ {Number(p.price_ghs).toFixed(2)}</td><td>{p.stock_quantity}</td><td>{p.is_active?'Visible':'Hidden'}</td><td><form action={reorderProductAction} className="admin-reorder"><input type="hidden" name="id" value={p.id}/><input aria-label={`Sort order for ${p.name}`} type="number" name="sort_order" min="0" max="10000" defaultValue={p.sort_order}/><button type="submit">Save</button></form></td><td className="admin-actions"><Link href={`/admin/products/${p.id}`}>Edit</Link><form action={toggleProductAction}><input type="hidden" name="id" value={p.id}/><button type="submit">{p.is_active?'Hide':'Show'}</button></form><form action={deleteProductAction}><input type="hidden" name="id" value={p.id}/><button type="submit" className="admin-delete">Delete</button></form></td></tr>;})}</tbody></table>{!products?.length && <p className="admin-empty">No products yet. Add your first product to begin.</p>}</div>
  </section>;
}
