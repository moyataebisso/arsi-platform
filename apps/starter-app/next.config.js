/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@arsi/shared-ui', '@arsi/db', '@arsi/email'],
}

module.exports = nextConfig
