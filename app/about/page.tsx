import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { About, CraftPrinting, Experience, Reviews } from '@/components/sections/Sections';
import { getPublicBusinessSettings } from '@/lib/store/public-settings';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Discover the thoughtful gifting, custom craft and printing experience at Treasured Genius, Accra.',
};

export default async function AboutPage() {
  const settings = await getPublicBusinessSettings();

  return (
    <main id="top" className="inner-page">
      <Navigation />
      <section className="inner-hero">
        <p className="eyebrow">THE HEART OF TREASURED GENIUS</p>
        <h1>It begins with<br /><em>thoughtfulness.</em></h1>
        <p>Treasured Genius is an Accra craft and printing studio for thoughtful gifts, personalised pieces and meaningful details. We believe a well-chosen gift can help someone feel remembered.</p>
      </section>
      <About />
      <CraftPrinting serviceInformation={settings.serviceInformation} />
      <Experience />
      <Reviews />
      <section className="inner-cta">
        <h2>Have an idea in <em>mind?</em></h2>
        <p>Tell us what you would like to create. The team can help discuss the available options and next steps.</p>
        <a className="button button-gold" href="/customize">Explore customisation <span>↗</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
