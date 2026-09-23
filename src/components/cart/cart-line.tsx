'use client';

import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cartKey, MAX_QUANTITY, useCart, type CartItem } from '@/components/providers/cart';
import { capitalize, cx, formatPrice } from '@/lib/utils';
import styles from './cart-line.module.css';

export function QuantityStepper({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={cx(styles.stepper, size === 'sm' && styles.stepperSm)}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Smanji količinu">
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="Povećaj količinu"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CartLine({
  item,
  compact = false,
  onNavigate,
}: {
  item: CartItem;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const cart = useCart();
  const key = cartKey(item);
  const href = `/proizvod/${item.slug}`;

  return (
    <div className={cx(styles.line, compact && styles.compact)}>
      <Link href={href} className={styles.thumb} onClick={onNavigate}>
        {item.image && <Image src={item.image} alt={item.name} fill sizes="120px" />}
      </Link>
      <div className={styles.body}>
        <div className={styles.top}>
          <Link href={href} className={styles.name} onClick={onNavigate}>
            {item.name}
          </Link>
          <button type="button" className={styles.remove} onClick={() => cart.removeItem(key)} aria-label={`Ukloni ${item.name}`}>
            <X size={16} />
          </button>
        </div>
        <div className={styles.meta}>
          {item.size && <span>Veličina: {item.size}</span>}
          <span>Boja: {capitalize(item.color)}</span>
        </div>
        <div className={styles.bottom}>
          <QuantityStepper value={item.quantity} onChange={(q) => cart.updateQuantity(key, q)} size={compact ? 'sm' : 'md'} />
          <div className={styles.price}>
            {formatPrice(item.price * item.quantity)}
            {item.quantity > 1 && <small>{formatPrice(item.price)} / kom</small>}
          </div>
        </div>
      </div>
    </div>
  );
}
