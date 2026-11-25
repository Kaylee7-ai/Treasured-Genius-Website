import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import CustomOrderForm from '@/components/CustomOrderForm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Customise a Gift',
  description: 'Make a gift personal with custom printing, names, photographs, messages and artwork from Treasured Genius in Accra.',
};

type SampleProduct = { id: string; name: string; slug: string };
const occasions = [
  'Birthday',
  'Anniversary',
  'Memorial / remembrance',
  'Graduation',
  'Wedding',
  'Business branding',
  'Just because',
  'Other',
];

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; occasion?: string }>;
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
  const initialOccasion = occasions.find((occasion) => occasion.toLowerCase() === params.occasion?.toLowerCase()) ?? 'Birthday';
  const onlineSubmissionEnabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );

  return (
    <main id="top" className="inner-page">
      <Navigation />
      <section className="inner-hero">
        <p className="eyebrow">A GIFT THAT FEELS LIKE THEIRS</p>
        <h1>Your thought.<br /><em>Made personal.</em></h1>
        <p>Choose an item, share your idea and tell us how you would like it personalised. Add a name, photograph, message, logo or your own artwork.</p>
      </section>
      <CustomOrderForm
        sampleProducts={sampleProducts}
        initialProductId={initialProductId}
        initialOccasion={initialOccasion}
        onlineSubmissionEnabled={onlineSubmissionEnabled}
      />
      <section className="inner-content inner-content-white">
        <div className="inner-section-heading">
          <p className="eyebrow">A LITTLE REASSURANCE</p>
          <h2>Thoughtful at <em>every step.</em></h2>
          <p>Every custom project is reviewed individually. The team will confirm the available materials, production method, price and estimated timing with you before work begins. Artwork shared through the secure online request is kept private.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
