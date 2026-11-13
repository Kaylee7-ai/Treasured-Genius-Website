import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return <StoreMessage title="The gallery is being prepared"
      copy="Our personalised gift gallery is being connected. You can still send a custom request through the form on our homepage." />;
  }

  const [{ data: categories }, { data: products, error }] = await Promise.all([
    supabase.from('categories').select('id,name,slug').eq('is_active', true).order('sort_order'),
    supabase.from('products')
      .select('id,name,slug,short_description,price_mode,price_ghs,availability,is_featured,product_images(image_url,alt_text,sort_order),categories(name,slug)')
      .eq('is_active', true).order('sort_order').order('created_at', { ascending: false }),
  ]);

  if (error) {
    return <StoreMessage title="The gallery is temporarily unavailable"
      copy="Please contact Treasured Genius while we finish connecting the online catalogue." />;
  }

  const query = (params.q ?? '').trim().toLowerCase();
  const selectedCategory = params.category ?? '';
  const visibleProducts = (products ?? []).filter((product) => {
    const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    return (
      (!query || product.name.toLowerCase().includes(query)
        || (product.short_description ?? '').toLowerCase().includes(query))
      && (!selectedCategory || category?.slug === selectedCategory)
    );
  });

  return (
    <main className="store-page">
      <header className="store-topbar">
        <Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link>
        <Link href="/" className="store-back">Return to the atelier ↗</Link>
      </header>

      <section className="store-heading">
        <p className="eyebrow">THE TREASURED EDIT</p>
        <h1>Find something <em>meaningful.</em></h1>
        <p>Browse product examples and discover what you can personalise.</p>
      </section>

      <form className="shop-search" action="/shop">
        <input name="q" defaultValue={params.q ?? ''} placeholder="Search the gallery"
          aria-label="Search products and samples" />
        {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
        <button type="submit">Search ↗</button>
      </form>

      <nav className="shop-categories" aria-label="Gallery categories">
        <Link className={!selectedCategory ? 'selected' : ''} href="/shop">All examples</Link>
        {(categories ?? []).map((category) => (
          <Link className={selectedCategory === category.slug ? 'selected' : ''}
            href={`/shop?category=${encodeURIComponent(category.slug)}`} key={category.id}>
            {category.name}
          </Link>
        ))}
      </nav>

      <div className="shop-result-count">
        {visibleProducts.length} {visibleProducts.length === 1 ? 'example' : 'examples'}
      </div>

      {visibleProducts.length ? (
        <div className="product-grid">
          {visibleProducts.map((product) => {
            const images = [...(product.product_images ?? [])]
              .sort((a, b) => a.sort_order - b.sort_order);
            const category = Array.isArray(product.categories)
              ? product.categories[0] : product.categories;

            return (
              <Link href={`/shop/${product.slug}`} className="product-card" key={product.id}>
                <div className="product-card-image">
                  {images[0]?.image_url
                    ? <Image src={images[0].image_url} alt={images[0].alt_text || product.name}
                        width={900} height={760} unoptimized loading="lazy" />
                    : <div className="product-image-empty">TREASURED GENIUS</div>}
                  {product.is_featured && <span className="featured-tag">FEATURED</span>}
                </div>
                <div className="product-card-meta">
                  <span>{category?.name ?? 'Gift ideas'}</span>
                  <span>{product.availability.replace(/_/g, ' ')}</span>
                </div>
                <h2>{product.name}</h2>
                <p>{product.short_description}</p>
                <strong>{product.price_mode === 'fixed' && product.price_ghs !== null
                  ? `GH₵ ${Number(product.price_ghs).toFixed(2)}`
                  : 'Request a quotation'}</strong>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="store-empty">
          <h2>{products?.length ? 'Nothing in this selection just yet.' : 'The gallery is ready for its first examples.'}</h2>
          <p>{products?.length
            ? 'Try another search or send us a custom gift request.'
            : 'Treasured Genius will add approved product and design examples here.'}</p>
          <Link className="store-whatsapp" href="/#custom-order">Start a custom request ↗</Link>
        </div>
      )}

      <footer className="store-footer">
        <span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link>
      </footer>
    </main>
  );
}

function StoreMessage({ title, copy }: { title: string; copy: string }) {
  return (
    <main className="store-page">
      <header className="store-topbar">
        <Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link>
        <Link href="/">Return to the atelier ↗</Link>
      </header>
      <section className="store-message">
        <p className="eyebrow">THE TREASURED EDIT</p>
        <h1>{title}</h1><p>{copy}</p>
        <Link className="store-whatsapp" href="/#custom-order">Request a personalised gift ↗</Link>
      </section>
    </main>
  );
}
