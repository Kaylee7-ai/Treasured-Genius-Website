const footerLinks = [
  ['Home', '/'],
  ['Our story', '/about'],
  ['Gift ideas', '/occasions'],
  ['Shop', '/shop'],
  ['Customise', '/customize'],
  ['Contact', '/contact'],
];

export default function SiteFooter() {
  return (
    <footer className="site-footer premium-footer">
      <div className="footer-brand-block">
        <a href="/" className="footer-brand">TREASURED <i>GENIUS</i></a>
        <p>The art of giving, made personal.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        {footerLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="footer-details">
        <a href="https://wa.me/233277018939" target="_blank" rel="noreferrer">Chat with our team ↗</a>
        <span>NSAKINA STREET · ACCRA, GHANA</span>
        <span>© {new Date().getFullYear()} TREASURED GENIUS</span>
      </div>
    </footer>
  );
}
