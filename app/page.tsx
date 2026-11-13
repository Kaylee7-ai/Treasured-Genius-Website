import Hero3D from '@/components/Hero3D';
import Navigation from '@/components/Navigation';
import CustomOrderForm from '@/components/CustomOrderForm';
import { About, Collections, CraftPrinting, Experience, FeaturedProducts, FinalCTA, Reviews, Visit } from '@/components/sections/Sections';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type SampleProduct = { id: string; name: string; slug: string };
type BusinessSettings = {
  contactPhone: string;
  openingHours: string;
  deliveryInformation: string;
  serviceInformation: string;
  nfcMobilePayments: boolean;
};

const defaultBusinessSettings: BusinessSettings = {
  contactPhone: '+233 27 701 8939',
  openingHours: 'Listed opening time: 8:00 am. Please confirm the day’s hours with the shop.',
  deliveryInformation: 'Ask the team about current delivery and collection options.',
  serviceInformation: '',
  nfcMobilePayments: true,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let sampleProducts: SampleProduct[] = [];
  let businessSettings = defaultBusinessSettings;

  if (supabase) {
    const [{ data: products }, { data: settings }] = await Promise.all([
      supabase.from('products')
        .select('id,name,slug')
        .eq('is_active', true)
        .order('sort_order')
        .order('name'),
      supabase.from('settings').select('key,value').in('key', [
        'contact_phone', 'opening_hours', 'delivery_information',
        'service_information', 'nfc_mobile_payments',
      ]),
    ]);
    sampleProducts = products ?? [];
    const readString = (key: string, fallback: string) => {
      const value = settings?.find((row) => row.key === key)?.value;
      return typeof value === 'string' ? value : fallback;
    };
    const nfcValue = settings?.find((row) => row.key === 'nfc_mobile_payments')?.value;
    businessSettings = {
      contactPhone: readString('contact_phone', defaultBusinessSettings.contactPhone),
      openingHours: readString('opening_hours', defaultBusinessSettings.openingHours),
      deliveryInformation: readString('delivery_information', defaultBusinessSettings.deliveryInformation),
      serviceInformation: readString('service_information', defaultBusinessSettings.serviceInformation),
      nfcMobilePayments: typeof nfcValue === 'boolean' ? nfcValue : defaultBusinessSettings.nfcMobilePayments,
    };
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
          <p className="eyebrow hero-eyebrow">A CRAFT & PRINTING STUDIO · ACCRA</p>
          <h1>The art<br />of <em>giving.</em></h1>
          <p className="hero-subtitle">A little more than a gift.<br />A moment to remember.</p>
          <a className="button button-gold" href="#collections">Explore custom work <span>↘</span></a>
          <span className="hero-index">01 <i>—</i> A THOUGHTFUL BEGINNING</span>
        </div>
        <Hero3D />
        <div className="hero-bottomline"><span>THOUGHTFULLY CHOSEN</span><span>BEAUTIFULLY PRESENTED</span><span>ALWAYS MEANINGFUL</span></div>
      </section>
      <About />
      <Collections />
      <FeaturedProducts />
      <CraftPrinting serviceInformation={businessSettings.serviceInformation} />
      <CustomOrderForm
        sampleProducts={sampleProducts}
        initialProductId={initialProductId}
        onlineSubmissionEnabled={onlineSubmissionEnabled}
      />
      <Experience />
      <Reviews />
      <Visit
        contactPhone={businessSettings.contactPhone}
        openingHours={businessSettings.openingHours}
        deliveryInformation={businessSettings.deliveryInformation}
        nfcMobilePayments={businessSettings.nfcMobilePayments}
      />
      <FinalCTA />
      <footer className="site-footer">
        <a href="#top" className="footer-brand">TREASURED <i>GENIUS</i></a>
        <span>THE ART OF GIVING</span>
        <span>ACCRA, GHANA · © {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
