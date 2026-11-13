const collections = [
  { n: '01', name: 'For the moments', copy: 'A reason to celebrate, and a reason to remember.', tone: 'wine' },
  { n: '02', name: 'For someone special', copy: 'A considered gesture for the people who matter.', tone: 'sand' },
  { n: '03', name: 'Just because', copy: 'The most meaningful gifts need no occasion.', tone: 'rose' },
];

export function About() {
  return <section id="about" className="about-section section-pad">
    <p className="eyebrow">A THOUGHTFUL WAY TO GIVE</p>
    <div className="about-grid">
      <h2>It is never<br />just <em>a gift.</em></h2>
      <div className="about-copy">
        <p className="lead">It is the pause before a smile. The feeling of being remembered. The quiet beauty of getting it just right.</p>
        <p>At Treasured Genius, we believe the most meaningful gifts do more than mark an occasion. They make someone feel seen. Discover thoughtful pieces for the people and moments that matter.</p>
        <a className="text-link" href="#collections">Discover the feeling <span>↗</span></a>
      </div>
    </div>
  </section>;
}

export function Collections() {
  return <section id="collections" className="collections-section section-pad">
    <div className="section-heading">
      <div><p className="eyebrow">THE ART OF CHOOSING</p><h2>Find something<br /><em>worth remembering.</em></h2></div>
      <p className="section-note">A thoughtful beginning to a moment that lasts.</p>
    </div>
    <div className="collection-grid">
      {collections.map((c) => <a href="https://wa.me/233277018939?text=Hello%20Treasured%20Genius%2C%20I%20would%20love%20to%20enquire%20about%20your%20gifts." target="_blank" rel="noreferrer" className={`collection-card ${c.tone}`} key={c.n}>
        <span className="collection-number">{c.n} / 03</span>
        <div className="collection-visual"><div className="visual-ring" /><div className="visual-box"><span /></div></div>
        <div className="collection-meta"><div><h3>{c.name}</h3><p>{c.copy}</p></div><span className="round-arrow">↗</span></div>
      </a>)}
    </div>
  </section>;
}

export function FeaturedProducts() {
  return <section className="featured-section section-pad">
    <div className="featured-copy">
      <p className="eyebrow">THE CONSIDERED GESTURE</p><h2>Beautiful things.<br /><em>Meaningful moments.</em></h2>
      <p>Every great gift begins with a thought. Tell us who you are celebrating and we will help you find a fitting expression.</p>
      <a className="button button-outline" href="https://wa.me/233277018939" target="_blank" rel="noreferrer">Enquire about a gift <span>↗</span></a>
    </div>
    <div className="featured-still-life"><div className="still-life-halo" /><div className="still-life-box"><div className="still-life-lid" /><div className="still-life-ribbon" /></div><span className="still-life-caption">THE BEAUTY IS IN THE THOUGHT</span></div>
  </section>;
}

export function CraftPrinting({ serviceInformation }: { serviceInformation?: string }) {
  return <section id="craft-printing" className="craft-printing-section section-pad">
    <div className="craft-printing-intro">
      <div>
        <p className="eyebrow">CRAFT · PRINT · PERSONALISE</p>
        <h2>Ideas made<br /><em>meaningful.</em></h2>
      </div>
      <div className="craft-printing-copy">
        <p className="lead">A thoughtful idea deserves careful attention.</p>
        <p>{serviceInformation || 'Treasured Genius is an Accra craft and printing shop offering custom designs and printed materials for personal and business projects. Tell us what you have in mind and our team can discuss the available options with you.'}</p>
      </div>
    </div>
    <div className="craft-printing-services">
      <article><span>01</span><h3>Custom printing</h3><p>Share the message, photograph, logo or design you would like to bring to life.</p></article>
      <article><span>02</span><h3>Creative crafts</h3><p>Discuss a personal or business project and the finish you have in mind.</p></article>
      <article><span>03</span><h3>Thoughtful gifting</h3><p>Explore gift ideas and ask the team about custom presentation and delivery options.</p></article>
    </div>
    <p className="craft-printing-note">Every custom project is reviewed individually. Materials, production methods, availability, price and timing are confirmed with the shop before work begins.</p>
  </section>;
}

export function Experience() {
  return <section id="experience" className="experience-section section-pad">
    <p className="eyebrow">THE EXPERIENCE OF GIVING</p>
    <div className="experience-grid">
      <h2>The feeling<br />begins <em>before</em><br />it is opened.</h2>
      <div className="experience-side"><div className="experience-rule" /><p className="lead">A gift is a small ceremony. The anticipation, the presentation, the moment it is received.</p><p>We believe each detail should feel considered. Speak with our team about finding a gift that says what words sometimes cannot.</p><span className="signature">The Art of Giving</span></div>
    </div>
  </section>;
}

export function Reviews() {
  return <section className="reviews-section section-pad">
    <p className="eyebrow">KIND WORDS, REAL MOMENTS</p>
    <div className="review-content"><span className="quote-mark">“</span><blockquote>Every thoughtful gesture has a story. We are honoured when you let us be a small part of yours.</blockquote><p>We would love to hear about your experience.</p><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Treasured+Genius+Accra" target="_blank" rel="noreferrer">Find us on Google <span>↗</span></a></div>
    <p className="review-note">Customer reviews will be featured here once verified and approved for publication.</p>
  </section>;
}

export function Visit({
  contactPhone = '+233277018939',
  openingHours = 'Listed opening time: 8:00 am. Please confirm the day’s hours with the shop.',
  deliveryInformation = 'Ask the team about current delivery and collection options.',
  nfcMobilePayments = true,
}: {
  contactPhone?: string;
  openingHours?: string;
  deliveryInformation?: string;
  nfcMobilePayments?: boolean;
}) {
  const telephoneLink = contactPhone.replace(/[^+0-9]/g, '');
  return <section id="visit" className="visit-section section-pad">
    <div><p className="eyebrow">A LITTLE PLACE TO DISCOVER</p><h2>Come find<br /><em>your moment.</em></h2></div>
    <div className="visit-details">
      <p>Visit us on Nsakina Street or contact the team about your craft and printing project.</p>
      <p className="visit-address">Nsakina Street<br />Accra, Ghana<br /><br />{openingHours}{nfcMobilePayments ? <><br />NFC mobile payments accepted</> : null}</p>
      <p className="visit-delivery">{deliveryInformation}</p>
      <a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Treasured+Genius+Nsakina+Street+Accra" target="_blank" rel="noreferrer">Get directions <span>↗</span></a>
      <a className="visit-phone" href={`tel:${telephoneLink}`}>{contactPhone}</a>
      <span className="visit-footnote">Please confirm the day’s opening hours, product availability and delivery arrangements with the team.</span>
    </div>
  </section>;
}

export function FinalCTA() {
  return <section className="final-cta section-pad">
    <p className="eyebrow">A THOUGHT IS A BEAUTIFUL BEGINNING</p><h2>Make their moment<br /><em>mean something.</em></h2>
    <a className="button button-gold" href="https://wa.me/233277018939?text=Hello%20Treasured%20Genius%2C%20I%20would%20love%20help%20choosing%20a%20thoughtful%20gift." target="_blank" rel="noreferrer">Begin a conversation <span>↗</span></a><div className="final-ornament" />
  </section>;
}
