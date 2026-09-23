import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = { title: 'Uslovi korišćenja' };

export default function Page() {
  return <InfoPage slug="uslovi" />;
}
