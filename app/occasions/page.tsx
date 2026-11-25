import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Gift Ideas for Every Occasion',
  description: 'Explore thoughtful gift inspiration for birthdays, anniversaries, graduations, weddings, remembrance and business gifting.',
};

const occasionIdeas = [
  {
    icon: '✦',
    title: 'Birthdays',
    value: 'Birthday',
    description: 'Celebrate a new year with a name, photograph, favourite colours or a personal message.',
    detail: 'A keepsake, drinkware, gift set or another idea you would like to discuss.',
  },
  {
    icon: '♡',
    title: 'Anniversaries',
    value: 'Anniversary',
    description: 'Mark a shared milestone with a personal detail that makes the moment feel even more meaningful.',
    detail: 'Ask about a message, date or photograph on a gift or keepsake.',
  },
  {
    icon: '✧',
    title: 'Graduations',
    value: 'Graduation',
    description: 'Recognise a big achievement with a thoughtful item made to celebrate the journey.',
    detail: 'Share the graduate’s name, colours or a message for the design.',
  },
  {
    icon: '❀',
    title: 'Weddings',
    value: 'Wedding',
    description: 'Explore personalised pieces for a couple, a wedding party or a special day.',
    detail: 'Discuss names, dates, event details and the quantity you have in mind.',
  },
  {
    icon: '☼',
    title: 'Remembrance',
    value: 'Memorial / remembrance',
    description: 'Create a respectful keepsake to honour a memory and celebrate a life.',
    detail: 'You can describe your idea and ask about photographs or wording.',
  },
  {
    icon: '✳',
    title: 'Business gifting',
    value: 'Business branding',
    description: 'Consider branded gifts and printed pieces for teams, clients and business occasions.',
    detail: 'Tell us about your logo, message, quantity and preferred finish.',
  },
  {
    icon: '∞',
    title: 'Just because',
    value: 'Just because',
    description: 'Make an ordinary day feel special with a small and thoughtful gesture.',
    detail: 'No occasion needed. Start with the person and the feeling you want to share.',
  },
];

export default function OccasionsPage() {
  return (
    <main id="top" className="inner-page">
      <Navigation />
      <section className="inner-hero">
        <p className="eyebrow">LITTLE MOMENTS, BIG MEANING</p>
        <h1>For every reason<br /><em>to make someone smile.</em></h1>
        <p>Start with the moment you are celebrating. Then make the gift your own with a name, message, photograph or design idea.</p>
      </section>
      <section className="inner-content inner-content-soft">
        <div className="inner-section-heading">
          <p className="eyebrow">FIND YOUR INSPIRATION</p>
          <h2>What are we <em>celebrating?</em></h2>
          <p>These are starting points for a conversation. Final options, materials, availability, pricing and production timing are confirmed with the shop.</p>
        </div>
        <div className="occasion-grid">
          {occasionIdeas.map((occasion) => (
            <article className="occasion-tile" key={occasion.value}>
              <span className="occasion-icon" aria-hidden="true">{occasion.icon}</span>
              <h3>{occasion.title}</h3>
              <p>{occasion.description}</p>
              <p>{occasion.detail}</p>
              <a href={`/customize?occasion=${encodeURIComponent(occasion.value)}`}>Personalise this idea ↗</a>
            </article>
          ))}
        </div>
      </section>
      <section className="inner-cta">
        <h2>Something a little <em>different?</em></h2>
        <p>Describe the idea you have in mind. The custom request form also lets you choose “Something else” and share your own artwork.</p>
        <a className="button button-gold" href="/customize?occasion=Other">Tell us your idea <span>↗</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
