"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image'
import {
  HiOutlineHome,
  HiOutlineHeart,
  HiOutlinePlusCircle,
  HiOutlineUser,
} from "react-icons/hi";
import { createClient } from '@/lib/supabase/client'

export default function ResponsiveNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session);
      });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  // Liens avec redirection conditionnelle pour "Compte"
  const navLinks = [
    { href: "/", label: "Accueil", icon: <HiOutlineHome className="text-2xl md:text-lg" /> },
    { href: "/likes", label: "Favoris", icon: <HiOutlineHeart className="text-2xl md:text-lg" /> },
    { href: "/proposition", label: "Ajouter", icon: <HiOutlinePlusCircle className="text-2xl md:text-lg" /> },
    { href: isLoggedIn ? "/profil" : "/auth/login", label: "Compte", icon: <HiOutlineUser className="text-2xl md:text-lg" /> },
  ];

  const linkClasses = "flex items-center gap-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors";

  return (
    <>
      {/* Navbar pour desktop */}
      <nav className="hidden md:flex bg-[#F1F1F1] dark:bg-[#242424] shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Image
            src="/logo_spotin_blanc.svg" // adapte le nom si nécessaire
            alt="Logo SpotIn"
            width={90} // ajuste la taille selon ta maquette
            height={30}
            priority
            className="object-contain"
          />
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={linkClasses}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Link href="/blog" className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full px-4 py-2 flex items-center gap-2">
              <img src="/book_spot.svg" alt="Blog" className="h-5 w-5" />
              <span className="text-white font-semibold">Le blog</span>
            </Link>
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
  );
}
