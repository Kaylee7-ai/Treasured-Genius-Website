import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCatalogueExample } from '../catalogue';

type ProductImage = { id: string; image_url: string; alt_text: string | null; sort_order: number };
type ProductCategory = { name: string };
type StoreProduct = {
  id: string; name: string; slug: string; description: string | null; short_description: string | null;
  price_mode: string; price_ghs: number | null; availability: string;
  personalisation_options: string[] | null; product_images: ProductImage[];
  categories: ProductCategory | ProductCategory[] | null;
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: product, error } = await supabase.from('products')
      .select('id,name,slug,description,short_description,price_mode,price_ghs,availability,personalisation_options,product_images(id,image_url,alt_text,sort_order),categories(name)')
      .eq('slug', slug).eq('is_active', true).maybeSingle();
    if (!error && product) return <LiveProduct product={product as unknown as StoreProduct} />;
  }
  const example = getCatalogueExample(slug);
  if (!example) notFound();
  return <main className="store-page">
    <header className="store-topbar"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><Link href="/shop" className="store-back">← All examples</Link></header>
    <div className="product-detail"><div className="product-gallery"><div className={`catalogue-art catalogue-art-large catalogue-art-${example.visual}`}><span>{example.visual === 'bible' ? 'NKJV' : 'TG'}</span><small>{example.name}</small></div></div>
      <section className="product-information"><p className="eyebrow">{example.category}</p><h1>{example.name}</h1><p className="product-price">Request a quotation</p>
        <p className="product-stock">Enquire for current availability</p><p className="product-description">{example.description}</p>
        <div className="product-personalisation"><strong>Options shown in catalogue</strong><ul>{example.personalisationOptions.map((option) => <li key={option}>{option}</li>)}</ul><p>Colours shown: {example.colours.join(' and ')}.</p></div>
        <Link className="store-whatsapp" href={`/?item=${encodeURIComponent(example.slug)}#custom-order`}>Enquire about this item ↗</Link>
        <p className="product-note">This is a catalogue example, not a confirmed stock listing. The shop will confirm the final details and price before an order is accepted.</p></section></div>
    <footer className="store-footer"><span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link></footer></main>;
}

function LiveProduct({ product }: { product: StoreProduct }) {
  const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
  return <main className="store-page"><header className="store-topbar"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><Link href="/shop" className="store-back">← All examples</Link></header>
    <div className="product-detail"><div className="product-gallery">{images.map((image, index) => <div className="product-gallery-image" key={image.id}><Image src={image.image_url} alt={image.alt_text || product.name} width={900} height={760} unoptimized priority={index === 0} /></div>)}</div>
      <section className="product-information"><p className="eyebrow">{category?.name ?? 'THE TREASURED EDIT'}</p><h1>{product.name}</h1>
        <p className="product-price">{product.price_mode === 'fixed' && product.price_ghs !== null ? `GH₵ ${Number(product.price_ghs).toFixed(2)}` : 'Request a quotation'}</p>
        <p className="product-stock">{product.availability.replace(/_/g, ' ')}</p><p className="product-description">{product.description || product.short_description}</p>
        {!!product.personalisation_options?.length && <div className="product-personalisation"><strong>Personalisation options</strong><ul>{product.personalisation_options.map((option) => <li key={option}>{option}</li>)}</ul></div>}
        <Link className="store-whatsapp" href={`/?item=${encodeURIComponent(product.slug)}#custom-order`}>Request this item ↗</Link></section></div>
    <footer className="store-footer"><span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link></footer></main>;
}
