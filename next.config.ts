import type { NextConfig } from 'next';
import { withWorkflow } from 'workflow/next';

const nextConfig: NextConfig = {
  // Security headers — iframe/embed protections are prod-only so local dev
  // previews can render the site in tooling iframes.
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=()' },
          ...(isProd
            ? [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }]
            : []),
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },

  // Every route below sold advertising — a product PHX Growth no longer offers.
  // They are redirected rather than deleted so existing inbound links and any
  // search results still land somewhere truthful instead of 404ing.
  async redirects() {
    const retired = [
      '/growth', '/forge', '/automation', '/automator',
      '/agents', '/results', '/stack', '/film', '/ad-management',
    ];
    return retired.map((source) => ({ source, destination: '/', permanent: false }));
  },

  env: {
    NEXT_PUBLIC_APP_NAME: 'PHX Growth',
  },

  productionBrowserSourceMaps: false,
  compress: true,
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
};

// withWorkflow enables the "use workflow" / "use step" directives (Vercel
// Workflow DevKit) behind workflows/*.ts — durable functions that survive
// redeploys and can sleep for days between steps.
export default withWorkflow(nextConfig);
