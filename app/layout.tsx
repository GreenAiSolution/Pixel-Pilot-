import type { Metadata, Viewport } from 'next';
import { Shell } from '@/components/pixel-pilot/shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Pilot — the autonomous media buyer',
  description:
    'Pixel Pilot flies Meta, Google & TikTok to real profit — 24/7, hands off the wheel. An immersive 3D platform for the ads / media-buying niche.',
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
