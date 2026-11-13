import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { catalogueExamples } from './catalogue';

type GalleryImage = { id?: string; image_url: string; alt_text: string | null; sort_order: number };
type GalleryCategory = { name: string; slug: string };
type GalleryProduct = {
  id: string; name: string; slug: string; short_description: string | null;
  price_mode: string; price_ghs: number | null; availability: string; is_featured: boolean;
  product_images: GalleryImage[]; categories: GalleryCategory | GalleryCategory[] | null;
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let categories: { id: string; name: string; slug: string }[] = [];
  let products: GalleryProduct[] = [];
  let usingExamples = true;
  if (supabase) {
    const [{ data: liveCategories }, { data: liveProducts, error }] = await Promise.all([
      supabase.from('categories').select('id,name,slug').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('id,name,slug,short_description,price_mode,price_ghs,availability,is_featured,product_images(image_url,alt_text,sort_order),categories(name,slug)')
        .eq('is_active', true).order('sort_order').order('created_at', { ascending: false }),
    ]);
    if (!error && liveProducts?.length) {
      categories = liveCategories ?? [];
      products = liveProducts as unknown as GalleryProduct[];
      usingExamples = false;
    }
  }
  if (usingExamples) {
    categories = [...new Map(catalogueExamples.map((p) => [p.categorySlug, { id: p.categorySlug, name: p.category, slug: p.categorySlug }])).values()];
    products = catalogueExamples.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, short_description: p.shortDescription,
      price_mode: 'quote', price_ghs: null, availability: p.availability, is_featured: true,
      product_images: [], categories: { name: p.category, slug: p.categorySlug },
    }));
  }
  const query = (params.q ?? '').trim().toLowerCase();
  const selectedCategory = params.category ?? '';
  const visibleProducts = products.filter((product) => {
    const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    return (!query || product.name.toLowerCase().includes(query)
      || (product.short_description ?? '').toLowerCase().includes(query))
      && (!selectedCategory || category?.slug === selectedCategory);
  });
  return <main className="store-page">
    <header className="store-topbar"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><Link href="/" className="store-back">Return to the atelier ↗</Link></header>
    <section className="store-heading"><p className="eyebrow">THE TREASURED EDIT</p><h1>Find something <em>meaningful.</em></h1><p>Browse product examples and discover what you can personalise.</p></section>
    {usingExamples && <p className="catalogue-notice">Starter catalogue based on product examples shared with us. Prices and availability are confirmed directly with Treasured Genius.</p>}
    <form className="shop-search" action="/shop"><input name="q" defaultValue={params.q ?? ''} placeholder="Search the gallery" aria-label="Search products and samples" />
      {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}<button type="submit">Search ↗</button></form>
    <nav className="shop-categories" aria-label="Gallery categories"><Link className={!selectedCategory ? 'selected' : ''} href="/shop">All examples</Link>
      {categories.map((category) => <Link className={selectedCategory === category.slug ? 'selected' : ''} href={`/shop?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</nav>
    <div className="shop-result-count">{visibleProducts.length} {visibleProducts.length === 1 ? 'example' : 'examples'}</div>
    {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => {
      const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      const example = catalogueExamples.find((item) => item.slug === product.slug);
      const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
      return <Link href={`/shop/${product.slug}`} className="product-card" key={product.id}>
        <div className="product-card-image">{images[0]?.image_url
          ? <Image src={images[0].image_url} alt={images[0].alt_text || product.name} width={900} height={760} unoptimized loading="lazy" />
          : <div className={`catalogue-art catalogue-art-${example?.visual ?? 'gift-set'}`}><span>{example?.visual === 'bible' ? 'NKJV' : 'TG'}</span><small>{example?.visual === 'bible' ? 'PERSONALISED BIBLE' : 'A GIFT SET, MADE PERSONAL'}</small></div>}
          {product.is_featured && <span className="featured-tag">CATALOGUE PICK</span>}</div>
        <div className="product-card-meta"><span>{category?.name ?? 'Gift ideas'}</span><span>{product.availability.replace(/_/g, ' ')}</span></div>
        <h2>{product.name}</h2><p>{product.short_description}</p><strong>Request a quotation</strong></Link>;
    })}</div> : <div className="store-empty"><h2>Nothing in this selection just yet.</h2><p>Try another search or contact Treasured Genius about a custom gift.</p><Link className="store-whatsapp" href="/#custom-order">Start a custom request ↗</Link></div>}
    <footer className="store-footer"><span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link></footer>
  </main>;
}
