import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';

const display = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600'], display: 'swap' });
const sans = Manrope({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Treasured Genius — The Art of Giving',
  description: 'Thoughtful gifts for the moments and people that matter. Discover Treasured Genius in Accra.',
  openGraph: {
    title: 'Treasured Genius — The Art of Giving',
    description: 'A little more than a gift. A moment to remember.',
    type: 'website',
  },
};

export const viewport: Viewport = { themeColor: '#110E0D', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body><SmoothScroll />{children}</body></html>;
}
