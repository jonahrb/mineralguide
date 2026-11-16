export default function robots() {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://mineralguide.us')
  ).replace(/\/$/, '');
  const isProduction =
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV);
  return {
    rules: isProduction ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
