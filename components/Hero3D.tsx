'use client';

import dynamic from 'next/dynamic';
import { Component, Suspense, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';

type BoundaryProps = { children: ReactNode; fallback: ReactNode };
type BoundaryState = { failed: boolean };

class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Treasured Genius 3D scene unavailable:', error, info.componentStack);
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const GiftScene = dynamic(() => import('@/components/three/GiftScene'), {
  ssr: false,
  loading: () => <div className="hero-scene-loading" role="status"><span className="loading-orbit" /><span>Preparing something thoughtful</span></div>,
});

function StaticSculpture() {
  return <div className="hero-static-fallback" role="img" aria-label="A sculptural burgundy gift box wrapped in champagne satin ribbon">
    <div className="fallback-halo" />
    <div className="fallback-gift">
      <span className="fallback-lid" /><span className="fallback-band" />
      <span className="fallback-bow fallback-bow-left" /><span className="fallback-bow fallback-bow-right" /><span className="fallback-knot" />
    </div>
  </div>;
}

export default function Hero3D() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [active, setActive] = useState(true);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const node = host.current;
    if (!node || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '120px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={host} className="hero-art is-ready" aria-hidden="false">
    {reducedMotion ? <StaticSculpture /> : (
      <SceneBoundary fallback={<StaticSculpture />}>
        <Suspense fallback={<div className="hero-scene-loading" role="status"><span className="loading-orbit" /><span>Preparing something thoughtful</span></div>}>
          <GiftScene active={active} />
        </Suspense>
      </SceneBoundary>
    )}
    <div className="hero-art-grain" aria-hidden="true" />
  </div>;
}
