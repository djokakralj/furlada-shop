import type { Metadata, Viewport } from 'next';
import { EB_Garamond, Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

// Naslovni font. Cormorant (stari naslovni font) na Google Fonts pogrešno
// pozicionira kvačice na č/š/ž/ć, pa je zamenjen srodnim EB Garamondom.
const garamond = EB_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Furlada — moda koja govori vašim jezikom',
    template: '%s | Furlada',
  },
  description:
    'Furlada online prodavnica — ženska i muška odeća, tašne, ranci i aksesoari. Dostava širom Srbije.',
  openGraph: { type: 'website', locale: 'sr_RS', siteName: 'Furlada' },
};

export const viewport: Viewport = {
  themeColor: '#141414',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${garamond.variable} ${montserrat.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
