'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from './use-local-storage';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  color: string;
  quantity: number;
};

export const MAX_QUANTITY = 10;

// Isti proizvod u različitim veličinama su različite stavke
export const cartKey = (item: Pick<CartItem, 'productId' | 'size'>) =>
  `${item.productId}__${item.size ?? ''}`;

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  replaceItems: (items: CartItem[]) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems, hydrated] = useLocalStorage<CartItem[]>('furlada:cart', []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const key = cartKey(item);
        const existing = prev.find((i) => cartKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            cartKey(i) === key
              ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + quantity) }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setDrawerOpen(true);
    },
    [setItems],
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      setItems((prev) =>
        prev.map((i) =>
          cartKey(i) === key
            ? { ...i, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) }
            : i,
        ),
      );
    },
    [setItems],
  );

  const removeItem = useCallback(
    (key: string) => setItems((prev) => prev.filter((i) => cartKey(i) !== key)),
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      drawerOpen,
      setDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      replaceItems: setItems,
      clear,
    }),
    [items, hydrated, drawerOpen, addItem, updateQuantity, removeItem, setItems, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart mora biti unutar CartProvider');
  return ctx;
}
