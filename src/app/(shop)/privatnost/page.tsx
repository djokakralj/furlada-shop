import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = { title: 'Politika privatnosti' };

export default function Page() {
  return <InfoPage slug="privatnost" />;
}
