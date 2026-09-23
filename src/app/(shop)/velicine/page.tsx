import type { Metadata } from 'next';
import { InfoPage } from '@/components/layout/info-page';

export const metadata: Metadata = { title: 'Vodič za veličine' };

export default function Page() {
  return <InfoPage slug="velicine" />;
}
