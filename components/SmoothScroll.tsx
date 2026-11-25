'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.35,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.05,
      anchors: true,
    });

    const onTick = (time: number) => lenis.raf(time * 1000);
    const onScroll = () => ScrollTrigger.update();
    const onRefresh = () => lenis.resize();

    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(onTick);
    lenis.on('scroll', onScroll);
    ScrollTrigger.addEventListener('refresh', onRefresh);

    const animationContext = gsap.context(() => {
      const progressBar = document.querySelector<HTMLElement>('.scroll-progress');

      if (progressBar) {
        ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => gsap.set(progressBar, { scaleX: self.progress }),
        });
      }

      const hero = document.querySelector<HTMLElement>('.hero-section');
      const heroArt = document.querySelector<HTMLElement>('.hero-art');
      const heroCopy = document.querySelector<HTMLElement>('.hero-copy');

      if (hero && heroArt) {
        gsap.to(heroArt, {
          y: 115,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.25,
          },
        });
      }

      if (hero && heroCopy) {
        gsap.to(heroCopy, {
          y: -58,
          autoAlpha: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '72% top',
            scrub: 1.1,
          },
        });
      }

      const stillLife = document.querySelector<HTMLElement>('.featured-still-life');
      const stillLifeHalo = stillLife?.querySelector<HTMLElement>('.still-life-halo');
      const stillLifeBox = stillLife?.querySelector<HTMLElement>('.still-life-box');

      if (stillLife && stillLifeHalo) {
        gsap.to(stillLifeHalo, {
          y: -38,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: {
            trigger: stillLife,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      if (stillLife && stillLifeBox) {
        gsap.to(stillLifeBox, {
          y: 24,
          ease: 'none',
          scrollTrigger: {
            trigger: stillLife,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      }

      const innerHeadline = document.querySelector<HTMLElement>('.inner-hero h1');
      const innerHero = document.querySelector<HTMLElement>('.inner-hero');

      if (innerHeadline && innerHero) {
        gsap.to(innerHeadline, {
          y: -24,
          ease: 'none',
          scrollTrigger: {
            trigger: innerHero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    });

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      animationContext.revert();
      gsap.ticker.remove(onTick);
      lenis.off('scroll', onScroll);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === document.documentElement) trigger.kill();
      });
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}
