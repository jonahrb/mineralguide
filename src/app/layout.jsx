import '../styles.css';
import { Analytics } from '@vercel/analytics/next';
import SiteShell from '../components/SiteShell';

export const metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
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
