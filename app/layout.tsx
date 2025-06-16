import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'App Auth',
  description: 'Application avec authentification Supabase',
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