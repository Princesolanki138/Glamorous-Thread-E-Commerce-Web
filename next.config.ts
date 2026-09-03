import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Strip X-Powered-By header
  poweredByHeader: false,

  // Gzip compression
  compress: true,

  images: {
    // Serve modern formats when browser supports them
    formats: ['image/avif', 'image/webp'],

    // Cache optimised images for 30 days
    minimumCacheTTL: 2592000,

    remotePatterns: [
      { protocol: 'https', hostname: 'gemeriahair.in' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  experimental: {
    // Tree-shake large packages to reduce client bundle
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'gsap',
      'recharts',
      'react-icons',
    ],
  },
}

export default nextConfig
