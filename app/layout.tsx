import type { Metadata, Viewport } from 'next';
import { Shell } from '@/components/pixel-pilot/shell';
import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const TITLE = 'Pixel Pilot — the autonomous media buyer';
const DESCRIPTION =
  'Pixel Pilot flies Meta, Google & TikTok to real profit — 24/7, hands off the wheel. An immersive 3D platform for the ads / media-buying niche.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Open Graph + Twitter images are auto-attached by Next.js from
  // app/opengraph-image.png and app/twitter-image.png (the Gemini brand ad).
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: 'Pixel Pilot' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: '#05060f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary min-h-full flex flex-col">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
