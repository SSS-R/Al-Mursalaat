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
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
        {
          source: '/docs',
          destination: 'http://127.0.0.1:8000/docs',
        },
        {
          source: '/openapi.json',
          destination: 'http://127.0.0.1:8000/openapi.json',
        },
        {
          source: '/submit-application',
          destination: 'http://127.0.0.1:8000/submit-application/',
        },
      ]
    },
  };

  export default nextConfig;