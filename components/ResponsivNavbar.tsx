"use client";

import Link from 'next/link';
import { 
  HiOutlineHome, 
  HiOutlineHeart, 
  HiOutlinePlusCircle, 
  HiOutlineUser 
} from 'react-icons/hi';

export default function ResponsiveNavbar() {
  // Données des liens avec icônes
  const navLinks = [
    { href: "/", label: "Accueil", icon: <HiOutlineHome className="text-2xl md:text-lg" /> },
    { href: "#", label: "Favoris", icon: <HiOutlineHeart className="text-2xl md:text-lg" /> },
    { href: "/proposition", label: "Ajouter", icon: <HiOutlinePlusCircle className="text-2xl md:text-lg" /> },
    { href: "/profil", label: "Compte", icon: <HiOutlineUser className="text-2xl md:text-lg" /> },
  ];

  const linkClasses = "flex items-center gap-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors";

  return (
    <>
      {/* Navbar pour desktop (en haut) */}
      <nav className="hidden md:flex bg-[#F1F1F1] dark:bg-[#242424] shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900 dark:text-white">Logo</div>
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
          </div>
        </div>
      </nav>

      {/* Navbar pour mobile (en bas) */}
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
      {/* <div className="pb-16 md:pt-16"></div> */}
    </>
  );
}
