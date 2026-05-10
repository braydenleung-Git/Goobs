/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/3d/:path*',
        destination: '/3d/:path*',
      },
    ]
  },
}

export default nextConfig
