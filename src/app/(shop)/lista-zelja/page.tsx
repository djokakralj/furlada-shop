import type { Metadata } from 'next';
import { WishlistView } from './wishlist-view';

export const metadata: Metadata = { title: 'Lista želja' };

export default function WishlistPage() {
  return (
    <div className="container page">
      <span className="eyebrow">Sačuvano</span>
      <h1 className="page-title" style={{ margin: '6px 0 32px' }}>
        Lista želja
      </h1>
      <WishlistView />
    </div>
  );
}
