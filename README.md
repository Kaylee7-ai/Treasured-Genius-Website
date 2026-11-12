# Treasured Genius — The Art of Giving

Premium independent website concept built with Next.js 15, React 19, TypeScript, Tailwind CSS, React Three Fiber, GSAP and Lenis.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Local preview

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verification scripts

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## Deploy to Vercel

Import this repository into Vercel. Framework preset: **Next.js**. Root directory: `./`. Build command: `npm run build`. Install command: `npm install`. Output directory: leave the Next.js default. No environment variables are currently required.

## Notes

- The hero scene is dynamically imported with SSR disabled and has a static CSS fallback for reduced-motion and render failures.
- 3D quality is reduced on narrow/low-memory devices; device pixel ratio is capped at 1.5.
- Smooth scrolling and scroll-linked animations respect reduced-motion preferences and clean up listeners/instances on unmount.
- Business information and contact details shown in this concept should be confirmed by the business before public launch. No customer reviews or product catalogue have been fabricated.
