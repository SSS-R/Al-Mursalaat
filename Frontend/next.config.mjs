/** @type {import('next').NextConfig} */
const nextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path',
        destination: 'http://192.168.0.231:8000/api/:path', // Proxy to your backend server
      },
    ];
  },
};

export default nextConfig;