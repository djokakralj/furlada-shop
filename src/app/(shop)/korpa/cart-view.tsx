'use client';

import { ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { CartLine } from '@/components/cart/cart-line';
import { useCartSync } from '@/components/cart/use-cart-sync';
import { useCart } from '@/components/providers/cart';
import { DELIVERY_COST } from '@/lib/constants';
import { cx, formatPrice, plural } from '@/lib/utils';
import styles from './cart.module.css';

export function CartView() {
  const cart = useCart();
  useCartSync();

  if (!cart.hydrated) {
    return <div className={cx('container', 'page', styles.loading)} />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state">
          <ShoppingBag size={48} strokeWidth={1} />
          <h2>Vaša korpa je prazna</h2>
          <p>Pogledajte ponudu i dodajte omiljene komade.</p>
          <Link href="/prodavnica" className="btn">
            Nastavite kupovinu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('container', 'page')}>
      <h1 className="page-title">Korpa</h1>
      <p className={cx('muted', styles.count)}>
        {cart.count} {plural(cart.count, 'artikal', 'artikla', 'artikala')}
      </p>

      <div className={styles.layout}>
        <div className={styles.items}>
          {cart.items.map((item) => (
            <CartLine key={`${item.productId}-${item.size}`} item={item} />
          ))}
          <Link href="/prodavnica" className={styles.continue}>
            ← Nastavite kupovinu
          </Link>
        </div>

        <aside className={styles.summary}>
          <h2>Pregled porudžbine</h2>
          <div className={styles.row}>
            <span>Međuzbir</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className={styles.row}>
            <span>Dostava</span>
            <span className="muted">bira se u sledećem koraku</span>
          </div>
          <ul className={styles.deliveryInfo}>
            <li>Kurirska dostava — {formatPrice(DELIVERY_COST)}</li>
            <li>Lično preuzimanje — besplatno</li>
          </ul>
          <div className={cx(styles.row, styles.total)}>
            <span>Ukupno</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <p className={styles.vat}>PDV je uračunat u cenu. Plaćanje pouzećem.</p>
          <Link href="/porucivanje" className="btn btn-block">
            Nastavi na poručivanje <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
