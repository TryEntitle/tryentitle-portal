/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/demo/login', destination: '/login', permanent: true },
      { source: '/demo/:path*', destination: '/:path*', permanent: true },
    ]
  },
}

export default nextConfig
