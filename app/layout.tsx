import ResponsiveNavbar from '@/components/ResponsivNavbar'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '',
  description: 'on est la',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen mb-16 md:mb-0 md:mt-16">
        <ResponsiveNavbar />
        {children}
      </body>
    </html>
  )
}