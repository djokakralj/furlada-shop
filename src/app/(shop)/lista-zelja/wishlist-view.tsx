'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchProductsByIds } from '@/app/actions/catalog';
import { ProductCard } from '@/components/product/product-card';
import { ProductGridSkeleton } from '@/components/product/product-grid';
import { useWishlist } from '@/components/providers/wishlist';
import type { CardProduct } from '@/lib/product';
import gridStyles from '@/components/product/product-grid.module.css';

export function WishlistView() {
  const wishlist = useWishlist();
  const [products, setProducts] = useState<CardProduct[] | null>(null);
  const idsKey = wishlist.ids.join(',');

  useEffect(() => {
    if (!wishlist.hydrated) return;
    const ids = idsKey ? idsKey.split(',') : [];
    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prazna lista, nema zahteva
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetchProductsByIds(ids).then((p) => {
      if (!cancelled) setProducts(p);
    });
    return () => {
      cancelled = true;
    };
  }, [wishlist.hydrated, idsKey]);

  if (products === null) return <ProductGridSkeleton count={4} />;

  // Proizvod uklonjen iz liste nestaje odmah, bez čekanja na server
  const visible = products.filter((p) => wishlist.ids.includes(p.id));

  if (visible.length === 0) {
    return (
      <div className="empty-state">
        <Heart size={44} strokeWidth={1} />
        <h2>Lista želja je prazna</h2>
        <p>Kliknite na srce na proizvodu da ga sačuvate za kasnije.</p>
        <Link href="/prodavnica" className="btn">
          Pogledajte ponudu
        </Link>
      </div>
    );
  }

  return (
    <div className={gridStyles.grid}>
      {visible.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
