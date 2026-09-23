'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchProductsByIds } from '@/app/actions/catalog';
import { useCart, type CartItem } from '@/components/providers/cart';
import { useToast } from '@/components/providers/toast';

// Jednom po otvaranju stranice uskladi korpu sa bazom: ažurira cene/nazive,
// izbacuje proizvode koji više nisu u ponudi ili veličine koje su ukinute.
export function useCartSync() {
  const cart = useCart();
  const { showToast } = useToast();
  const [synced, setSynced] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!cart.hydrated || started.current) return;
    started.current = true;
    if (cart.items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nema šta da se sinhronizuje
      setSynced(true);
      return;
    }

    const ids = [...new Set(cart.items.map((i) => i.productId))];
    fetchProductsByIds(ids)
      .then((products) => {
        const byId = new Map(products.map((p) => [p.id, p]));
        let removed = 0;
        let repriced = 0;
        const next: CartItem[] = [];
        for (const item of cart.items) {
          const p = byId.get(item.productId);
          const sizeOk = p && (p.sizes.length === 0 ? item.size === null : item.size !== null && p.sizes.includes(item.size));
          if (!p || !sizeOk) {
            removed++;
            continue;
          }
          if (p.price !== item.price) repriced++;
          next.push({ ...item, name: p.name, slug: p.slug, price: p.price, image: p.images[0] ?? null, color: p.color });
        }
        if (removed || repriced || JSON.stringify(next) !== JSON.stringify(cart.items)) cart.replaceItems(next);
        if (removed) showToast('Neki proizvodi više nisu dostupni i uklonjeni su iz korpe.', 'error');
        else if (repriced) showToast('Cene u korpi su ažurirane.');
      })
      .catch(() => {})
      .finally(() => setSynced(true));
  }, [cart, showToast]);

  return synced;
}
