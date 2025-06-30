import ResponsiveNavbar from '@/components/ResponsivNavbar'
import './globals.css'
import type { Metadata } from 'next'
import { DarkModeProvider } from '@/context/DarkModeContext'
export const metadata: Metadata = {
  title: '',
  description: 'application web de référencement des spots pour les fêtes',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon_spotIn.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen mb-16 md:mb-0 md:mt-16">
        <DarkModeProvider>
          <ResponsiveNavbar />
          {children}
        </DarkModeProvider>
      </body>
    </html>
  )
}