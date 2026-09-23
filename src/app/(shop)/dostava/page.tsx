import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = { title: 'Dostava i povrat' };

export default function Page() {
  return <InfoPage slug="dostava" />;
}
