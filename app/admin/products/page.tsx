import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';
import { deleteProductAction, toggleProductAction } from './actions';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireStoreOwner();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products')
      .select('id,name,slug,price_mode,price_ghs,availability,stock_quantity,is_active,is_featured,created_at,categories(name),product_images(image_url,alt_text,sort_order)')
      .order('sort_order').order('created_at', { ascending: false }),
    supabase.from('categories').select('id,name').eq('is_active', true),
  ]);

  const liveCount = (products ?? []).filter((product) => product.is_active).length;
  const errors: Record<string, string> = {
    'invalid-product': 'Please check the product information and try again.',
    'save-failed': 'The product could not be saved. Check that the database is connected and the page address is unique.',
    'invalid-image': 'One or more images were unsupported or too large.',
    'image-upload-failed': 'The image upload failed. Check the Storage setup and try again.',
    'image-save-failed': 'An uploaded image could not be added to the gallery.',
    'delete-failed': 'The product could not be deleted.',
  };

  return (
    <section className="admin-content">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">GALLERY MANAGEMENT</p>
          <h1>Products & designs</h1>
          <p>Upload sample gifts, product photographs and personalisation examples.</p>
        </div>
        <Link className="admin-primary admin-add" href="/admin/products/new">Add a product +</Link>
      </div>

      {params.saved && <p className="admin-success" role="status">Product saved.</p>}
      {params.deleted && <p className="admin-success" role="status">Product deleted.</p>}
      {params.error && <p className="admin-error" role="alert">{errors[params.error] ?? 'Something went wrong.'}</p>}

      <div className="admin-stats">
        <div><span>Total gallery items</span><strong>{products?.length ?? 0}</strong></div>
        <div><span>Published</span><strong>{liveCount}</strong></div>
        <div><span>Categories</span><strong>{categories?.length ?? 0}</strong></div>
      </div>

      <div className="admin-product-grid">
        {(products ?? []).map((product) => {
          const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
          return (
            <article className="admin-product-card" key={product.id}>
              <div className="admin-product-card-image">
                {images[0]?.image_url
                  ? <img src={images[0].image_url} alt={images[0].alt_text || product.name} />
                  : <span>NO IMAGE YET</span>}
              </div>
              <div className="admin-product-card-body">
                <div className="admin-product-card-topline">
                  <span>{category?.name ?? 'Uncategorised'}</span>
                  <span>{product.is_active ? 'Published' : 'Hidden'}</span>
                </div>
                <h2>{product.name}</h2>
                <p>{product.price_mode === 'fixed' && product.price_ghs !== null
                  ? `GH₵ ${Number(product.price_ghs).toFixed(2)}`
                  : 'Request a quotation'}</p>
                <small>{product.availability.replaceAll('_', ' ')} · {product.stock_quantity} tracked</small>
                <div className="admin-actions">
                  <Link href={`/admin/products/${product.id}`}>Edit</Link>
                  <form action={toggleProductAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <button type="submit">{product.is_active ? 'Hide' : 'Publish'}</button>
                  </form>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <button className="admin-delete" type="submit">Delete</button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!products?.length && (
        <div className="admin-empty">
          <h2>Your gallery is ready for its first item.</h2>
          <p>Add a real sample gift or design, then publish it when the owner has confirmed the details.</p>
          <Link className="admin-primary" href="/admin/products/new">Add the first item</Link>
        </div>
      )}
    </section>
  );
}
