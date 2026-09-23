'use client';

import { LayoutDashboard, Package, ShoppingBag, SlidersHorizontal, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/utils';
import styles from './admin.module.css';

const ITEMS = [
  { href: '/admin', label: 'Pregled', Icon: LayoutDashboard, exact: true },
  { href: '/admin/porudzbine', label: 'Porudžbine', Icon: ShoppingBag },
  { href: '/admin/proizvodi', label: 'Proizvodi', Icon: Package },
  { href: '/admin/vrste', label: 'Vrste i atributi', Icon: SlidersHorizontal },
  { href: '/admin/korisnici', label: 'Korisnici', Icon: Users },
];

export function AdminNav({ newOrders }: { newOrders: number }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={cx(styles.navLink, active && styles.navActive)}>
            <Icon size={18} strokeWidth={1.6} />
            <span>{label}</span>
            {href === '/admin/porudzbine' && newOrders > 0 && <em className={styles.navBadge}>{newOrders}</em>}
          </Link>
        );
      })}
    </nav>
  );
}
