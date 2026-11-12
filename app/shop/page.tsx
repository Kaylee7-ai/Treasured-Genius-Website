import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/server';
type Params = Promise<{ q?: string; category?: string }>;
export default async function ShopPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <StoreMessage title="The shop is being prepared" copy="Our online catalogue is not connected yet. Please contact Treasured Genius on WhatsApp for a personal gift enquiry." />;
  const [{ data: categories }, result] = await Promise.all([
    supabase.from('categories').select('id,name,slug').eq('is_active', true).order('sort_order'),
    supabase.from('products').select('id,name,slug,short_description,price_ghs,stock_quantity,is_demo,is_featured,product_images(image_url,alt_text,sort_order),categories(name,slug)').eq('is_active', true).order('sort_order').order('created_at', { ascending: false }),
  ]);
  if (result.error) return <StoreMessage title="The shop is being prepared" copy="The catalogue is temporarily unavailable. Please contact us directly while we finish setting things up." />;
  const q = (params.q ?? '').trim().toLowerCase();
  const selected = params.category ?? '';
  const products = (result.data ?? []).filter((p) => {
    const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    return (!q || p.name.toLowerCase().includes(q) || (p.short_description ?? '').toLowerCase().includes(q)) && (!selected || category?.slug === selected);
  });
  return <main className="store-page">
    <header className="store-topbar"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><Link href="/" className="store-back">Return to the atelier ↗</Link></header>
    <section className="store-heading"><p className="eyebrow">THE TREASURED EDIT</p><h1>Find something <em>meaningful.</em></h1><p>Thoughtful gifts, beautifully considered.</p></section>
    <form className="shop-search" action="/shop"><input name="q" defaultValue={params.q ?? ''} placeholder="Search the collection" aria-label="Search products" />{selected && <input type="hidden" name="category" value={selected} />}<button type="submit">Search ↗</button></form>
    <nav className="shop-categories" aria-label="Shop categories"><Link className={!selected ? 'selected' : ''} href="/shop">All gifts</Link>{(categories ?? []).map((c) => <Link className={selected === c.slug ? 'selected' : ''} href={`/shop?category=${encodeURIComponent(c.slug)}`} key={c.id}>{c.name}</Link>)}</nav>
    <div className="shop-result-count">{products.length} {products.length === 1 ? 'piece' : 'pieces'} to explore</div>
    {products.length ? <div className="product-grid">{products.map((p) => {
      const imgs = [...(p.product_images ?? [])].sort((a,b) => a.sort_order-b.sort_order);
      const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
      return <Link href={`/shop/${p.slug}`} className="product-card" key={p.id}>
        <div className="product-card-image">{imgs[0]?.image_url ? <Image src={imgs[0].image_url} alt={imgs[0].alt_text || p.name} width={900} height={760} unoptimized /> : <div className="product-image-empty">TREASURED GENIUS</div>}{p.is_demo && <span className="demo-tag">DEMO PLACEHOLDER</span>}{p.stock_quantity < 1 && <span className="stock-tag">Enquire for availability</span>}</div>
        <div className="product-card-meta"><span>{cat?.name ?? 'Thoughtful gifting'}</span>{p.is_featured && <span>FEATURED</span>}</div><h2>{p.name}</h2><p>{p.short_description}</p><strong>GH₵ {Number(p.price_ghs).toFixed(2)}</strong>
      </Link>;
    })}</div> : <div className="store-empty"><h2>Nothing in this selection just yet.</h2><p>Try another search or contact us for a custom gift.</p><a href="https://wa.me/233277018939" target="_blank" rel="noreferrer">Enquire on WhatsApp ↗</a></div>}
    <footer className="store-footer"><span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link></footer>
  </main>;
}
function StoreMessage({ title, copy }: { title: string; copy: string }) {
  return <main className="store-page"><header className="store-topbar"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><Link href="/">Return to the atelier ↗</Link></header><section className="store-message"><p className="eyebrow">THE TREASURED EDIT</p><h1>{title}</h1><p>{copy}</p><a className="store-whatsapp" href="https://wa.me/233277018939" target="_blank" rel="noreferrer">Enquire on WhatsApp ↗</a></section></main>;
}
