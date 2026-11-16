import '../styles.css';
import { Analytics } from '@vercel/analytics/next';
import SiteShell from '../components/SiteShell';
import { getSiteUrl } from '../lib/site';

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  title: { default: 'Mineral Guide — Make sense of what you own', template: '%s | Mineral Guide' },
  description: 'Clear guides and practical tools for mineral and royalty owners.',
  openGraph: {
    title: 'Mineral Guide',
    description: 'Clarity for mineral and royalty owners.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
