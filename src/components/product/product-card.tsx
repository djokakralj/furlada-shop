'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/providers/cart';
import { useToast } from '@/components/providers/toast';
import { useWishlist } from '@/components/providers/wishlist';
import { discountPercent, type CardProduct } from '@/lib/product';
import { cx, formatPrice } from '@/lib/utils';
import styles from './product-card.module.css';

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const { showToast } = useToast();
  const liked = wishlist.hydrated && wishlist.has(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const href = `/proizvod/${product.slug}`;

  const add = (size: string | null) => {
    cart.addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      size,
      color: product.color,
    });
  };

  const toggleWishlist = () => {
    const added = wishlist.toggle(product.id);
    showToast(added ? 'Dodato u listu želja' : 'Uklonjeno iz liste želja');
  };

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link href={href} className={styles.imageLink} tabIndex={-1} aria-hidden>
          {product.images[0] ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw"
                className={cx(styles.image, product.images[1] && styles.imagePrimary)}
                loading={priority ? 'eager' : 'lazy'}
              />
              {product.images[1] && (
                <Image
                  src={product.images[1]}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw"
                  className={cx(styles.image, styles.imageSecondary)}
                />
              )}
            </>
          ) : (
            <span className={styles.noImage}>Bez slike</span>
          )}
        </Link>

        <div className={styles.badges}>
          {discount && <span className={cx(styles.badge, styles.badgeSale)}>−{discount}%</span>}
          {product.isNew && !discount && <span className={styles.badge}>Novo</span>}
        </div>

        <button
          type="button"
          className={cx(styles.wish, liked && styles.wishActive)}
          onClick={toggleWishlist}
          aria-label={liked ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
          aria-pressed={liked}
        >
          <Heart size={18} strokeWidth={1.6} fill={liked ? 'currentColor' : 'none'} />
        </button>

        <div className={styles.quick}>
          {product.sizes.length > 0 ? (
            <>
              <span className={styles.quickLabel}>Brzo dodavanje</span>
              <div className={styles.quickSizes}>
                {product.sizes.map((s) => (
                  <button key={s} type="button" onClick={() => add(s)} aria-label={`Dodaj veličinu ${s} u korpu`}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button type="button" className={styles.quickAdd} onClick={() => add(null)}>
              Dodaj u korpu
            </button>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.sub}>{product.subcategory}</span>
        <h3 className={styles.name}>
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className={styles.price}>
          <span className={cx(discount !== null && styles.priceSale)}>{formatPrice(product.price)}</span>
          {discount && <s className={styles.priceOld}>{formatPrice(product.compareAtPrice!)}</s>}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={cx(styles.media, 'skeleton')} />
      <div className={styles.info}>
        <span className="skeleton" style={{ height: 10, width: '40%' }} />
        <span className="skeleton" style={{ height: 14, width: '80%', marginTop: 6 }} />
        <span className="skeleton" style={{ height: 12, width: '30%', marginTop: 6 }} />
      </div>
    </div>
  );
}
