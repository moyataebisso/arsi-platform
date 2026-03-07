import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@arsi/shared-ui', '@arsi/db', '@arsi/email'],
}

export default nextConfig
