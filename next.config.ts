import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
    // /uploads/** servira route handler (slike otpremljene iz admin panela)
    localPatterns: [{ pathname: '/uploads/**' }, { pathname: '/**', search: '' }],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb', // upload više slika proizvoda odjednom
    },
  },
};

export default nextConfig;
