import Hero3D from '@/components/Hero3D';
import CustomOrderForm from '@/components/CustomOrderForm';
import Navigation from '@/components/Navigation';
import { About, Collections, Experience, FeaturedProducts, FinalCTA, Reviews, Visit } from '@/components/sections/Sections';

export default function Home() {
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
      <About /><Collections /><FeaturedProducts /><CustomOrderForm /><Experience /><Reviews /><Visit /><FinalCTA />
      <footer className="site-footer">
        <a href="#top" className="footer-brand">TREASURED <i>GENIUS</i></a>
        <span>THE ART OF GIVING</span>
        <span>ACCRA, GHANA · © {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
