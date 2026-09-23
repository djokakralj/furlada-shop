'use client';

import { Check, ChevronDown, Heart, Ruler, RotateCcw, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { QuantityStepper } from '@/components/cart/cart-line';
import { useCart } from '@/components/providers/cart';
import { useToast } from '@/components/providers/toast';
import { useWishlist } from '@/components/providers/wishlist';
import { COLORS, DELIVERY_COST } from '@/lib/constants';
import { discountPercent } from '@/lib/product';
import { capitalize, cx, formatPrice } from '@/lib/utils';
import styles from './product.module.css';

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    price: number;
    compareAtPrice: number | null;
    description: string;
    details: string | null;
    color: string;
    sizes: string[];
    image: string | null;
    subcategory: string;
  };
};

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordion}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {title}
        <ChevronDown size={18} className={cx(styles.accChevron, open && styles.accChevronOpen)} />
      </button>
      {open && <div className={styles.accBody}>{children}</div>}
    </div>
  );
}

export function ProductInfo({ product }: Props) {
  const cart = useCart();
  const wishlist = useWishlist();
  const { showToast } = useToast();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const liked = wishlist.hydrated && wishlist.has(product.id);
  const needsSize = product.sizes.length > 0;

  const addToCart = () => {
    if (needsSize && !size) {
      setSizeError(true);
      return;
    }
    cart.addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        size: needsSize ? size : null,
        color: product.color,
      },
      quantity,
    );
    setQuantity(1);
  };

  return (
    <div className={styles.info}>
      <span className="eyebrow">{product.brand ?? product.subcategory}</span>
      <h1 className={styles.name}>{product.name}</h1>

      <div className={styles.priceRow}>
        <span className={cx(styles.price, discount !== null && styles.priceSale)}>{formatPrice(product.price)}</span>
        {discount !== null && (
          <>
            <s className={styles.priceOld}>{formatPrice(product.compareAtPrice!)}</s>
            <span className={styles.discount}>−{discount}%</span>
          </>
        )}
      </div>
      <p className={styles.vat}>PDV uračunat u cenu</p>

      <div className={styles.option}>
        <div className={styles.optionLabel}>
          <span>
            Boja: <strong>{capitalize(product.color)}</strong>
          </span>
        </div>
        <span className={styles.swatch} style={{ background: COLORS[product.color] ?? '#ccc' }} title={product.color} />
      </div>

      {needsSize && (
        <div className={styles.option}>
          <div className={styles.optionLabel}>
            <span>
              Veličina: <strong>{size ?? '—'}</strong>
            </span>
            <Link href="/velicine" className={styles.sizeGuide}>
              <Ruler size={14} /> Vodič za veličine
            </Link>
          </div>
          <div className={styles.sizes} role="radiogroup" aria-label="Veličina">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                className={cx(styles.size, size === s && styles.sizeActive)}
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {sizeError && <p className="field-error">Izaberite veličinu pre dodavanja u korpu.</p>}
        </div>
      )}

      <div className={styles.actions}>
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button type="button" className={cx('btn', styles.addBtn)} onClick={addToCart}>
          Dodaj u korpu
        </button>
        <button
          type="button"
          className={cx(styles.wishBtn, liked && styles.wishActive)}
          onClick={() => showToast(wishlist.toggle(product.id) ? 'Dodato u listu želja' : 'Uklonjeno iz liste želja')}
          aria-label={liked ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
          aria-pressed={liked}
        >
          <Heart size={20} strokeWidth={1.6} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <ul className={styles.perks}>
        <li>
          <Check size={16} /> Na stanju — isporuka za 2–4 radna dana
        </li>
        <li>
          <Truck size={16} /> Dostava kurirom {formatPrice(DELIVERY_COST)}, lično preuzimanje besplatno
        </li>
        <li>
          <RotateCcw size={16} /> Povrat ili zamena u roku od 14 dana
        </li>
      </ul>

      <div className={styles.accordions}>
        <Accordion title="Opis" defaultOpen>
          <p>{product.description}</p>
        </Accordion>
        {product.details && (
          <Accordion title="Sastav i održavanje">
            <ul className={styles.detailList}>
              {product.details.split('\n').filter(Boolean).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Accordion>
        )}
        <Accordion title="Dostava i povrat">
          <p>
            Porudžbine šaljemo kurirskom službom na teritoriji cele Srbije, rok isporuke je 2–4 radna dana. Proizvod
            možete vratiti u roku od 14 dana od prijema.{' '}
            <Link href="/dostava" className="link">
              Više informacija
            </Link>
          </p>
        </Accordion>
      </div>
    </div>
  );
}
