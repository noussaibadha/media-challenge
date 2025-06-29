// next.config.ts
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
})

const nextConfig = {
  reactStrictMode: true,
  // Ajoute ici d'autres options Next.js si besoin
}

export default withPWA(nextConfig)
