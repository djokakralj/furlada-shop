'use client';

import { KeyRound, Package, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/utils';
import styles from './account.module.css';

const LINKS = [
  { href: '/nalog', label: 'Porudžbine', Icon: Package },
  { href: '/nalog/podaci', label: 'Lični podaci i adresa', Icon: UserRound },
  { href: '/nalog/lozinka', label: 'Lozinka', Icon: KeyRound },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={cx(styles.navLink, pathname === href && styles.navActive)}>
          <Icon size={17} strokeWidth={1.6} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
