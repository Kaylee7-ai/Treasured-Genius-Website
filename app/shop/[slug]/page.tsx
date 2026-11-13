import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: product, error } = await supabase.from('products')
    .select('id,name,slug,description,short_description,price_mode,price_ghs,availability,personalisation_options,product_images(image_url,alt_text,sort_order),categories(name)')
    .eq('slug', slug).eq('is_active', true).maybeSingle();

  if (error || !product) notFound();

  const images = [...(product.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order);
  const category = Array.isArray(product.categories)
    ? product.categories[0] : product.categories;

  return (
    <main className="store-page">
      <header className="store-topbar">
        <Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link>
        <Link href="/shop" className="store-back">← All examples</Link>
      </header>
      <div className="product-detail">
        <div className="product-gallery">
          {images.length ? images.map((image, index) => (
            <div className="product-gallery-image" key={image.id}>
              <img src={image.image_url} alt={image.alt_text || product.name}
                loading={index === 0 ? 'eager' : 'lazy'} />
            </div>
          )) : <div className="product-image-empty">TREASURED GENIUS</div>}
        </div>
        <section className="product-information">
          <p className="eyebrow">{category?.name ?? 'THE TREASURED EDIT'}</p>
          <h1>{product.name}</h1>
          <p className="product-price">
            {product.price_mode === 'fixed' && product.price_ghs !== null
              ? `GH₵ ${Number(product.price_ghs).toFixed(2)}`
              : 'Request a quotation'}
          </p>
          <p className="product-stock">{product.availability.replace(/_/g, ' ')}</p>
          <p className="product-description">{product.description || product.short_description}</p>
          {!!product.personalisation_options?.length && (
            <div className="product-personalisation">
              <strong>Personalisation options</strong>
              <ul>{product.personalisation_options.map((option) => <li key={option}>{option}</li>)}</ul>
            </div>
          )}
          <Link className="store-whatsapp" href={`/?item=${encodeURIComponent(product.slug)}#custom-order`}>
            Request this item ↗
          </Link>
          <p className="product-note">We will confirm what is possible, the final price and the estimated production time before you approve anything.</p>
        </section>
      </div>
      <footer className="store-footer">
        <span>THE ART OF GIVING</span><span>ACCRA, GHANA</span><Link href="/">Back to Treasured Genius</Link>
      </footer>
    </main>
  );
}
