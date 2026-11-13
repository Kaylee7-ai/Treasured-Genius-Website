import Hero3D from '@/components/Hero3D';
import Navigation from '@/components/Navigation';
import CustomOrderForm from '@/components/CustomOrderForm';
import { About, Collections, Experience, FeaturedProducts, FinalCTA, Reviews, Visit } from '@/components/sections/Sections';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type SampleProduct = { id: string; name: string; slug: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let sampleProducts: SampleProduct[] = [];

  if (supabase) {
    const { data } = await supabase.from('products')
      .select('id,name,slug')
      .eq('is_active', true)
      .order('sort_order')
      .order('name');
    sampleProducts = data ?? [];
  }

  const initialProductId = sampleProducts.find((product) => product.slug === params.item)?.id;
  const onlineSubmissionEnabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  return (
    <main id="top">
      <Navigation />
      <section id="hero" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">A PRIVATE GIFTING ATELIER · ACCRA</p>
          <h1>The art<br />of <em>giving.</em></h1>
          <p className="hero-subtitle">A little more than a gift.<br />A moment to remember.</p>
          <a className="button button-gold" href="#collections">Discover the art <span>↘</span></a>
          <span className="hero-index">01 <i>—</i> A THOUGHTFUL BEGINNING</span>
        </div>
        <Hero3D />
        <div className="hero-bottomline"><span>THOUGHTFULLY CHOSEN</span><span>BEAUTIFULLY PRESENTED</span><span>ALWAYS MEANINGFUL</span></div>
      </section>
      <About />
      <Collections />
      <FeaturedProducts />
      <CustomOrderForm
        sampleProducts={sampleProducts}
        initialProductId={initialProductId}
        onlineSubmissionEnabled={onlineSubmissionEnabled}
      />
      <Experience />
      <Reviews />
      <Visit />
      <FinalCTA />
      <footer className="site-footer">
        <a href="#top" className="footer-brand">TREASURED <i>GENIUS</i></a>
        <span>THE ART OF GIVING</span>
        <span>ACCRA, GHANA · © {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
