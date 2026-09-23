'use client';

import { CartProvider } from './cart';
import { ToastProvider } from './toast';
import { WishlistProvider } from './wishlist';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
