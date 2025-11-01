import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable image optimization for static export
    // Configure domains if using external images
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // If deploying to Vercel, you don't need this
  // But if using static export, uncomment:
  // output: 'export',
};

export default nextConfig;