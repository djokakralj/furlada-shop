'use client';

import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import Form from 'next/form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/components/providers/cart';
import { useWishlist } from '@/components/providers/wishlist';
import { cx } from '@/lib/utils';
import styles from './header.module.css';

export type MenuSub = {
  slug: string;
  name: string;
  category: 'odeca' | 'aksesoari';
  counts: { all: number; zene: number; muskarci: number };
};

type NavKey = 'zene' | 'muskarci' | 'aksesoari';

const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: 'zene', label: 'Žene', href: '/prodavnica?pol=zene' },
  { key: 'muskarci', label: 'Muškarci', href: '/prodavnica?pol=muskarci' },
  { key: 'aksesoari', label: 'Aksesoari', href: '/prodavnica?kategorija=aksesoari' },
];

function menuColumns(key: NavKey, allSubs: MenuSub[]) {
  // Samo vrste koje imaju bar jedan proizvod za izabrani pol
  const subs = allSubs.filter((s) => (key === 'aksesoari' ? s.counts.all : s.counts[key]) > 0);
  const odeca = subs.filter((s) => s.category === 'odeca');
  const aksesoari = subs.filter((s) => s.category === 'aksesoari');
  const pol = key === 'aksesoari' ? '' : `&pol=${key}`;
  const link = (s: MenuSub) => ({ label: s.name, href: `/prodavnica?vrsta=${s.slug}${pol}` });
  if (key === 'aksesoari') {
    return [{ title: 'Aksesoari', all: '/prodavnica?kategorija=aksesoari', links: aksesoari.map(link) }];
  }
  return [
    { title: 'Odeća', all: `/prodavnica?kategorija=odeca${pol}`, links: odeca.map(link) },
    { title: 'Aksesoari', all: `/prodavnica?kategorija=aksesoari${pol}`, links: aksesoari.map(link) },
  ];
}

export function HeaderClient({
  subcategories,
  user,
}: {
  subcategories: MenuSub[];
  user: { name: string; isAdmin: boolean } | null;
}) {
  const pathname = usePathname();
  const cart = useCart();
  const wishlist = useWishlist();
  const [openMenu, setOpenMenu] = useState<NavKey | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<NavKey | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeAll = () => {
    setOpenMenu(null);
    setSearchOpen(false);
    setMobileOpen(false);
  };

  // Zatvori sve panele pri promeni stranice
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    closeAll();
  }

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const hoverOpen = (key: NavKey) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(key);
    setSearchOpen(false);
  };
  const hoverClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const cartCount = cart.hydrated ? cart.count : 0;
  const wishCount = wishlist.hydrated ? wishlist.ids.length : 0;

  return (
    <>
      <div className={styles.announcement}>
        Dostava širom Srbije za 2–4 radna dana
        <span className={styles.announcementExtra}>
          <span aria-hidden>·</span> Povrat u roku od 14 dana
        </span>
      </div>

      <header className={styles.header} onMouseLeave={hoverClose}>
        <div className={cx('container', styles.inner)}>
          <div className={styles.left}>
            <button
              type="button"
              className={cx(styles.iconBtn, styles.burger)}
              onClick={() => setMobileOpen(true)}
              aria-label="Otvori meni"
            >
              <Menu size={22} strokeWidth={1.6} />
            </button>

            <nav className={styles.nav} aria-label="Glavna navigacija">
              <Link href="/prodavnica?sort=najnovije" className={styles.navLink} onMouseEnter={hoverClose}>
                Novo
              </Link>
              {NAV.map((item) => (
                <div key={item.key} onMouseEnter={() => hoverOpen(item.key)}>
                  <Link
                    href={item.href}
                    className={cx(styles.navLink, openMenu === item.key && styles.navLinkActive)}
                    aria-expanded={openMenu === item.key}
                    onFocus={() => hoverOpen(item.key)}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <Link
                href="/prodavnica?akcija=1"
                className={cx(styles.navLink, styles.sale)}
                onMouseEnter={hoverClose}
              >
                Akcija
              </Link>
            </nav>
          </div>

          <Link href="/" className={styles.logo} aria-label="Furlada — početna">
            FURLADA
          </Link>

          <div className={styles.right}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => {
                setSearchOpen((o) => !o);
                setOpenMenu(null);
              }}
              aria-label="Pretraga"
              aria-expanded={searchOpen}
            >
              <Search size={20} strokeWidth={1.6} />
            </button>
            {user?.isAdmin && (
              <Link href="/admin" className={styles.adminLink}>
                Admin
              </Link>
            )}
            <Link
              href={user ? '/nalog' : '/prijava'}
              className={cx(styles.iconBtn, styles.hideMobile)}
              aria-label={user ? 'Moj nalog' : 'Prijava'}
              title={user ? `Nalog — ${user.name}` : 'Prijava'}
            >
              <User size={20} strokeWidth={1.6} />
            </Link>
            <Link
              href="/lista-zelja"
              className={cx(styles.iconBtn, styles.hideMobile)}
              aria-label={`Lista želja (${wishCount})`}
            >
              <Heart size={20} strokeWidth={1.6} />
              {wishCount > 0 && <span className={styles.count}>{wishCount}</span>}
            </Link>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => cart.setDrawerOpen(true)}
              aria-label={`Korpa (${cartCount})`}
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              {cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Mega meni */}
        {openMenu && (
          <div
            className={styles.mega}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={hoverClose}
          >
            <div className={cx('container', styles.megaInner)}>
              {menuColumns(openMenu, subcategories).map((col) => (
                <div key={col.title} className={styles.megaCol}>
                  <Link href={col.all} className={styles.megaTitle} onClick={closeAll}>
                    {col.title}
                  </Link>
                  <ul className={cx(styles.megaList, col.links.length > 8 && styles.megaListWide)}>
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={closeAll}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link
                href={NAV.find((n) => n.key === openMenu)!.href}
                className={cx(styles.megaPromo, styles[`promo_${openMenu}`])}
                onClick={closeAll}
              >
                <span>Pogledaj sve</span>
              </Link>
            </div>
          </div>
        )}

        {/* Pretraga */}
        {searchOpen && (
          <div className={styles.searchPanel}>
            <Form action="/prodavnica" className={cx('container', styles.searchForm)} onSubmit={closeAll}>
              <Search size={20} strokeWidth={1.6} />
              <input
                ref={searchInput}
                name="q"
                type="search"
                placeholder="Pretražite proizvode, vrste, boje…"
                className={styles.searchInput}
                autoComplete="off"
              />
              <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(false)} aria-label="Zatvori pretragu">
                <X size={20} strokeWidth={1.6} />
              </button>
            </Form>
          </div>
        )}
      </header>

      {/* Mobilni meni */}
      <div className={cx(styles.overlay, mobileOpen && styles.overlayOpen)} onClick={() => setMobileOpen(false)} />
      <aside className={cx(styles.drawer, mobileOpen && styles.drawerOpen)} aria-hidden={!mobileOpen}>
        <div className={styles.drawerHead}>
          <span className={styles.drawerLogo}>FURLADA</span>
          <button type="button" className={styles.iconBtn} onClick={() => setMobileOpen(false)} aria-label="Zatvori meni">
            <X size={22} strokeWidth={1.6} />
          </button>
        </div>

        <Form action="/prodavnica" className={styles.drawerSearch} onSubmit={closeAll}>
          <Search size={18} strokeWidth={1.6} />
          <input name="q" type="search" placeholder="Pretraga" autoComplete="off" />
        </Form>

        <nav className={styles.drawerNav}>
          <Link href="/prodavnica?sort=najnovije" onClick={closeAll} className={styles.drawerLink}>
            Novo
          </Link>
          {NAV.map((item) => (
            <div key={item.key}>
              <button
                type="button"
                className={styles.drawerLink}
                onClick={() => setMobileSection((s) => (s === item.key ? null : item.key))}
                aria-expanded={mobileSection === item.key}
              >
                {item.label}
                <ChevronDown size={18} className={cx(styles.chevron, mobileSection === item.key && styles.chevronOpen)} />
              </button>
              {mobileSection === item.key && (
                <div className={styles.drawerSub}>
                  <Link href={item.href} onClick={closeAll} className={styles.drawerAll}>
                    Sve — {item.label}
                  </Link>
                  {menuColumns(item.key, subcategories).map((col) => (
                    <div key={col.title}>
                      <span className={styles.drawerSubTitle}>{col.title}</span>
                      {col.links.map((l) => (
                        <Link key={l.href} href={l.href} onClick={closeAll}>
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/prodavnica?akcija=1" onClick={closeAll} className={cx(styles.drawerLink, styles.sale)}>
            Akcija
          </Link>
        </nav>

        <div className={styles.drawerFoot}>
          <Link href={user ? '/nalog' : '/prijava'} onClick={closeAll}>
            <User size={18} strokeWidth={1.6} /> {user ? 'Moj nalog' : 'Prijava / registracija'}
          </Link>
          <Link href="/lista-zelja" onClick={closeAll}>
            <Heart size={18} strokeWidth={1.6} /> Lista želja {wishCount > 0 && `(${wishCount})`}
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" onClick={closeAll}>
              Admin panel
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
