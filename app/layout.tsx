import type { Metadata, Viewport } from 'next';
import './globals.css';
import './agentic.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const TITLE = 'PHX Growth Agentic — it rang, someone answered';
const DESCRIPTION =
  'Your phone, always answered. PHX Growth puts an AI receptionist on your line: she answers every call 24/7, books the job onto your calendar, screens sales calls and wakes a human the moment it is an emergency. From $599/month — less than a part-timer who works 40 hours of the week\'s 168.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // Open Graph + Twitter images are auto-attached by Next.js from
  // app/opengraph-image.png and app/twitter-image.png (the Gemini brand ad).
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', siteName: 'PHX Growth Agentic' },
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
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
