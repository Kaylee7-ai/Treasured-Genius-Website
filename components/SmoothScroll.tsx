'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.82, touchMultiplier: 1.05, anchors: true });
    const onTick = (time: number) => lenis.raf(time * 1000);
    const onScroll = () => ScrollTrigger.update();
    const onRefresh = () => lenis.resize();

    gsap.ticker.add(onTick);
    lenis.on('scroll', onScroll);
    ScrollTrigger.addEventListener('refresh', onRefresh);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off('scroll', onScroll);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      lenis.destroy();
    };
  }, []);

  return null;
}
