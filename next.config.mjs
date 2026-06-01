/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zopsortczgzidgipxzak.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Helps with Vercel deployment
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
