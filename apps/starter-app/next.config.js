/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@arsi/shared-ui', '@arsi/db', '@arsi/email'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
