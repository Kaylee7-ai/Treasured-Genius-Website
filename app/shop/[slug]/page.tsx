import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main className="store-page"><Link href="/shop">← Back to shop</Link><section className="store-message"><h1>Shop not configured yet</h1><p>Please contact Treasured Genius on WhatsApp for a personal enquiry.</p></section></main>;
  const { data: p, error } = await supabase.from('products').select('id,name,slug,description,short_description,price_ghs,stock_quantity,is_demo,product_images(image_url,alt_text,sort_order),categories(name)').eq('slug', slug).eq('is_active', true).maybeSingle();
  if (error || !p) notFound();
  const images = [...(p.product_images ?? [])].sort((a,b) => a.sort_order-b.sort_order);
  const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
  const message = encodeURIComponent(`Hello Treasured Genius, I would like to enquire about ${p.name}.`);
  return <main className="store-page"><header className="store-topbar"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><Link href="/shop" className="store-back">← All gifts</Link></header>
    <div className="product-detail"><div className="product-gallery">{images.length ? images.map((img,i) => <div className="product-gallery-image" key={img.image_url}><Image src={img.image_url} alt={img.alt_text || p.name} width={900} height={760} unoptimized />{i===0 && p.is_demo && <span className="demo-tag">DEMO PLACEHOLDER</span>}</div>) : <div className="product-image-empty">TREASURED GENIUS</div>}</div>
    <section className="product-information"><p className="eyebrow">{category?.name ?? 'THE TREASURED EDIT'}</p><h1>{p.name}</h1><p className="product-price">GH₵ {Number(p.price_ghs).toFixed(2)}</p><p className="product-stock">{p.stock_quantity > 0 ? `Available · ${p.stock_quantity} in stock` : 'Availability confirmed on enquiry'}</p>{p.is_demo && <p className="demo-disclaimer">Demonstration listing. Image and price are placeholders and must be confirmed by the owner before any order.</p>}<p className="product-description">{p.description || p.short_description}</p><a className="store-whatsapp" href={`https://wa.me/233277018939?text=${message}`} target="_blank" rel="noreferrer">Custom order on WhatsApp ↗</a><p className="product-note">Our team will confirm availability, final details and delivery arrangements with you.</p></section></div>
    <footer className="store-footer"><span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link></footer></main>;
}
