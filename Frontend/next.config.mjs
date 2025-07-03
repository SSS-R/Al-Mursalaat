/** @type {import('next').NextConfig} */
const nextConfig = {
  // ADD THIS LINE
  output: 'export',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;