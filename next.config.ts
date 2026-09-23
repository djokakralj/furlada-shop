import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // slike otpremljene iz admina na Vercelu (Vercel Blob)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
    // /uploads/** servira route handler (lokalni razvoj bez Blob-a)
    localPatterns: [{ pathname: '/uploads/**' }, { pathname: '/**', search: '' }],
    // Svaka kombinacija (slika × širina × format) je posebna transformacija
    // koja se naplaćuje na Vercelu — zato samo WebP, manje širina i dug keš.
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  experimental: {
    serverActions: {
      // slike se šalju jedna po jedna, već smanjene u browseru; Vercel ionako
      // ne prima zahteve veće od 4,5 MB
      bodySizeLimit: '4.5mb',
    },
  },
};

export default nextConfig;
