'use client'

import { DarkModeProvider } from '@/context/DarkModeContext'
import DashboardNavbar from '@/components/DashboardNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <DarkModeProvider>
        <DashboardNavbar />
        <main className="p-4">{children}</main>
      </DarkModeProvider>
    </div>
  )
}