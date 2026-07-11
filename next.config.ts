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

  env: {
    NEXT_PUBLIC_APP_NAME: 'Pixel Pilot',
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
