'use client';

import { useState } from 'react';

const links = [['The Atelier', '#about'], ['Collections', '#collections'], ['Our Promise', '#experience'], ['Visit', '#visit']];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a href="#top" className="brand-mark" aria-label="Treasured Genius home">
        <span className="brand-monogram">TG</span><span className="brand-name">TREASURED <i>GENIUS</i></span>
      </a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation"><span /><span /></button>
      <nav aria-label="Main navigation" className={open ? 'nav-links is-open' : 'nav-links'}>
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-contact" href="https://wa.me/233277018939" target="_blank" rel="noreferrer">Enquire <span>↗</span></a>
      </nav>
    </header>
  );
}
