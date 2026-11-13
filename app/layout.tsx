import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import type { ReactNode } from 'react';
import './globals.css';
import './store.css';
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

export const viewport: Viewport = { themeColor: '#07120D', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><SmoothScroll />{children}<Analytics /></body></html>;
}
