/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'api.qrserver.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // PWA Configuration (opcional - requer next-pwa)
  // pwa: {
  //   dest: 'public',
  //   disable: process.env.NODE_ENV === 'development',
  //   register: true,
  //   skipWaiting: true,
  // },
};

module.exports = nextConfig;
