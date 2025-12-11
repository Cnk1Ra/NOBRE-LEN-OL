/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dod-dashboard-secret-key-2024-secure-fallback',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    domains: ['cdn.shopify.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
