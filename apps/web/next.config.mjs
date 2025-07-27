/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dopaforge/ui', '@dopaforge/db'],
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion',
    ],
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace react-beautiful-dnd with a lighter alternative in production
        'react-beautiful-dnd': process.env.NODE_ENV === 'production' 
          ? '@/components/drag-drop-wrapper' 
          : 'react-beautiful-dnd',
      };
    }
    
    return config;
  },
};

// Analyze bundle if ANALYZE is set
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}