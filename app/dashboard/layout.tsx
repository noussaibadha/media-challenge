'use client'

import { DarkModeProvider } from '@/context/DarkModeContext'
import DashboardNavbar from '@/components/DashboardNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 min-h-screen pt-16 md:pt-0 mb-16 md:mb-0">
      <DarkModeProvider>
        <DashboardNavbar />
        <main className="p-4">{children}</main>
      </DarkModeProvider>
    </div>
  )
}