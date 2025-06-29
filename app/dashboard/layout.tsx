'use client'

import { DarkModeProvider } from '@/context/DarkModeContext'
import DashboardNavbar from '@/components/DashboardNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <DarkModeProvider>
        <DashboardNavbar />
        <main className="">{children}</main>
      </DarkModeProvider>
    </div>
  )
}