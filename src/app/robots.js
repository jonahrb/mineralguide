import { getSiteUrl } from '../lib/site';

export default function robots() {
  const base = getSiteUrl();
  const isProduction =
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV);
  return {
    rules: isProduction
      ? [
          { userAgent: '*', allow: '/' },
          { userAgent: 'OAI-SearchBot', allow: '/' },
        ]
      : { userAgent: '*', disallow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
