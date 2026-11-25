import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { Visit } from '@/components/sections/Sections';
import { getPublicBusinessSettings } from '@/lib/store/public-settings';

export const metadata: Metadata = {
  title: 'Contact Treasured Genius',
  description: 'Contact Treasured Genius on WhatsApp or visit the craft and printing studio on Nsakina Street, Accra, Ghana.',
};

export default async function ContactPage() {
  const settings = await getPublicBusinessSettings();

  return (
    <main id="top" className="inner-page">
      <Navigation />
      <section className="inner-hero">
        <p className="eyebrow">WE WOULD LOVE TO HEAR YOUR IDEA</p>
        <h1>Let's make it<br /><em>meaningful.</em></h1>
        <p>Have a question about a gift, custom printing or a personal project? Get in touch with the Treasured Genius team or visit the studio in Accra.</p>
      </section>
      <section className="inner-content inner-content-white">
        <div className="contact-grid">
          <article className="contact-card">
            <p className="eyebrow">SPEAK WITH THE TEAM</p>
            <h3>WhatsApp</h3>
            <p>Ask about gift ideas, current options, quotations or the next step for a custom project.</p>
            <a href="https://wa.me/233277018939" target="_blank" rel="noreferrer">Start a WhatsApp chat ↗</a>
          </article>
          <article className="contact-card">
            <p className="eyebrow">CALL THE STUDIO</p>
            <h3>Phone</h3>
            <p>Contact the shop directly to discuss your enquiry and confirm current details.</p>
            <a href={`tel:${settings.contactPhone.replace(/[^+0-9]/g, '')}`}>{settings.contactPhone} ↗</a>
          </article>
          <article className="contact-card">
            <p className="eyebrow">COME BY</p>
            <h3>Accra, Ghana</h3>
            <p>Find Treasured Genius on Nsakina Street. Please confirm opening hours before travelling.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=Treasured+Genius+Nsakina+Street+Accra" target="_blank" rel="noreferrer">Get directions ↗</a>
          </article>
        </div>
      </section>
      <Visit
        contactPhone={settings.contactPhone}
        openingHours={settings.openingHours}
        deliveryInformation={settings.deliveryInformation}
        nfcMobilePayments={settings.nfcMobilePayments}
      />
      <section className="inner-cta">
        <h2>Ready to make it <em>personal?</em></h2>
        <p>Share what you have in mind and include any photograph, message or artwork that will help explain your idea.</p>
        <a className="button button-gold" href="/customize">Start a custom request <span>↗</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
