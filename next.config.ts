import type { NextConfig } from 'next';
import { validateSiteUrl } from './src/modules/i18n/site-url';

const siteUrlValidation = validateSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.VERCEL_ENV
);

if (process.env.VERCEL_ENV === 'production' && !siteUrlValidation.isValid) {
  throw new Error(`[EasyJev Build Error] ${siteUrlValidation.error}`);
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

