'use client';

import { ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/providers/cart';
import { DELIVERY_COST } from '@/lib/constants';
import { cx, formatPrice, plural } from '@/lib/utils';
import { CartLine } from './cart-line';
import styles from './cart-drawer.module.css';

export function CartDrawer() {
  const cart = useCart();
  const pathname = usePathname();
  const open = cart.drawerOpen;
  const close = () => cart.setDrawerOpen(false);

  // Zatvori pri navigaciji
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) cart.setDrawerOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cart.setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, cart]);

  return (
    <>
      <div className={cx(styles.overlay, open && styles.overlayOpen)} onClick={close} />
      <aside
        className={cx(styles.drawer, open && styles.drawerOpen)}
        aria-hidden={!open}
        aria-label="Korpa"
        role="dialog"
      >
        <div className={styles.head}>
          <h2>
            Korpa{' '}
            {cart.count > 0 && (
              <span>
                ({cart.count} {plural(cart.count, 'artikal', 'artikla', 'artikala')})
              </span>
            )}
          </h2>
          <button type="button" onClick={close} aria-label="Zatvori korpu" className={styles.close}>
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className={cx('empty-state', styles.empty)}>
            <ShoppingBag size={40} strokeWidth={1} />
            <p>Vaša korpa je prazna.</p>
            <Link href="/prodavnica" className="btn btn-outline" onClick={close}>
              Nastavite kupovinu
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {cart.items.map((item) => (
                <CartLine key={`${item.productId}-${item.size}`} item={item} compact onNavigate={close} />
              ))}
            </div>
            <div className={styles.foot}>
              <div className={styles.row}>
                <span>Međuzbir</span>
                <strong>{formatPrice(cart.subtotal)}</strong>
              </div>
              <p className={styles.note}>
                Dostava kurirom {formatPrice(DELIVERY_COST)}, lično preuzimanje besplatno.
              </p>
              <Link href="/porucivanje" className="btn btn-block" onClick={close}>
                Poruči
              </Link>
              <Link href="/korpa" className="btn btn-outline btn-block" onClick={close}>
                Pogledaj korpu
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
