import type { Metadata } from 'next';
import ShopLayout from './(shop)/layout';
import { NotFoundContent } from '@/components/layout/not-found-content';

export const metadata: Metadata = { title: 'Stranica nije pronađena' };

// Nepoznate adrese (van bilo koje rute) — prikaz sa headerom i footerom prodavnice
export default function NotFound() {
  return (
    <ShopLayout>
      <NotFoundContent />
    </ShopLayout>
  );
}
