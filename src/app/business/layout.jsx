import Link from 'next/link';
import BusinessNavigation from '../../components/business/BusinessNavigation';

export const metadata = {
  title: 'Business services',
};

export default function BusinessLayout({ children }) {
  return (
    <div className="business-area">
      <header className="business-header">
        <Link href="/business" className="business-brand">
          <span className="business-brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>
            mineral<span className="business-brand-light">guide</span>
          </span>
        </Link>
        <BusinessNavigation />
        <Link className="business-public-link" href="/">
          Public site
        </Link>
      </header>
      {children}
      <footer className="business-footer">
        <span>Mineral Guide Business</span>
        <span>Private account portal</span>
      </footer>
    </div>
  );
}
