'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/business/dashboard', label: 'Dashboard' },
  { href: '/business/credits', label: 'Credits' },
  { href: '/business/orders', label: 'Service requests' },
];

export default function BusinessNavigation() {
  const pathname = usePathname();

  return (
    <nav className="business-nav" aria-label="Business navigation">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
