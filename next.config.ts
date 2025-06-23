import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configuration Next.js moderne - serverActions n'est plus nécessaire
  eslint: {
  ignoreDuringBuilds: true,
}

}

export default nextConfig