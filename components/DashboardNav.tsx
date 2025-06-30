'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
} from 'react-icons/hi'
import { createClient } from '@/lib/supabase/client'

export default function DashboardNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session)
      })
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Accueil',
      icon: <HiOutlineHome className="text-2xl md:text-lg" />,
    },
    {
      href: '/dashboard/spots',
      label: 'Ajout Spot',
      icon: <HiOutlinePlusCircle className="text-2xl md:text-lg" />,
    },
    {
      href: '/dashboard/propositions',
      label: 'Propositions',
      icon: <HiOutlineDocumentText className="text-2xl md:text-lg" />,
    },
    {
      href: '/dashboard/users',
      label: 'Utilisateurs',
      icon: <HiOutlineUserGroup className="text-2xl md:text-lg" />,
    },
  ]

  const linkClasses =
    'flex items-center gap-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'

  return (
    <>
      {/* Navbar pour desktop */}
      <nav className="hidden md:flex bg-[#F1F1F1] dark:bg-[#242424] shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/logo_spotin_blanc.svg" alt="Logo" width={120} height={30} className="h-auto w-auto" />
          </Link>
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={linkClasses}>
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Navbar pour mobile */}
      <nav className="md:hidden bg-[#F1F1F1] dark:bg-[#242424] shadow-lg fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-[#242424]">
        <div className="flex justify-around items-center py-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${linkClasses} flex-col flex-1 items-center`}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
