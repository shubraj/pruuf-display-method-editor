/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.pruuf.tech',
      },
      {
        protocol: 'https',
        hostname: 'gateway.filebase.io',
      },
    ],
  },
  env: {
    PUBLIC_IPFS_GATEWAY: process.env.PUBLIC_IPFS_GATEWAY || 'https://ipfs.pruuf.tech/ipfs/',
  },
}

module.exports = nextConfig
