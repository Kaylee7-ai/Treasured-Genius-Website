import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';


export const metadata: Metadata = {
  applicationName: 'Treasured Genius',
  title: {
    default: 'Treasured Genius — The Art of Giving',
    template: '%s | Treasured Genius',
  },
  description: 'Thoughtful gifts for the moments and people that matter. Discover Treasured Genius in Accra, Ghana.',
  openGraph: {
    title: 'Treasured Genius — The Art of Giving',
    description: 'A little more than a gift. A moment to remember.',
    siteName: 'Treasured Genius',
    type: 'website',
    locale: 'en_GH',
  },
  twitter: {
    card: 'summary',
    title: 'Treasured Genius — The Art of Giving',
    description: 'A little more than a gift. A moment to remember.',
  },
};

export const viewport: Viewport = { themeColor: '#110E0D', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" /></head><body><SmoothScroll />{children}</body></html>;
}
