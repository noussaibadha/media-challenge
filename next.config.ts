// next.config.ts
import withPWA from 'next-pwa'

// Configuration PWA à part
const withPwaConfig = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
})

// Configuration Next.js (eslint/typescript + PWA)
const finalConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  ...withPwaConfig,
}

export default finalConfig
