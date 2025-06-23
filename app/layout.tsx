import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MediaChallenge',
  description: 'on est la',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}