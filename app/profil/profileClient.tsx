'use client'
import { useState, useEffect } from 'react'

interface UserProps {
  email: string
  pseudo: string
  avatar: string
  favoris: number
  followers: number
  suivis: number
}

export default function ProfileClient({
  user,
}: {
  user: UserProps
}) {
  const [notif, setNotif] = useState(false)
  const [geo, setGeo] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // --- DARK MODE ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') setDarkMode(true)
  }, [])

  // --- NOTIF & GEO : charger depuis localStorage au montage ---
  useEffect(() => {
    const notifValue = localStorage.getItem('notif')
    if (notifValue !== null) setNotif(notifValue === 'true')
    const geoValue = localStorage.getItem('geo')
    if (geoValue !== null) setGeo(geoValue === 'true')
  }, [])

  // --- NOTIF & GEO : sauvegarder dans localStorage à chaque changement ---
  useEffect(() => {
    localStorage.setItem('notif', notif.toString())
  }, [notif])

  useEffect(() => {
    localStorage.setItem('geo', geo.toString())
  }, [geo])

  return (
    <div className="min-h-screen bg-white transition-colors">
      {/* Header avec fond dégradé */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-400 pb-8 rounded-b-3xl">
        <div className="flex flex-col items-center pt-8">
          {/* Avatar */}
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow"
          />
          {/* Pseudo et email */}
          <div className="mt-4 text-white text-xl font-semibold">{user.pseudo}</div>
          <div className="text-white text-sm opacity-80 mb-4">{user.email}</div>
          {/* Statistiques */}
          <div className="flex justify-center gap-8 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-bold">{user.favoris}</span>
              <span className="text-white text-xs opacity-80">Favoris</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-bold">{user.followers}</span>
              <span className="text-white text-xs opacity-80">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-bold">{user.suivis}</span>
              <span className="text-white text-xs opacity-80">Suivis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres */}
      <div className="px-4 mt-8 pb-20">
        <h2 className="text-lg font-semibold mb-2 text-black">Paramètre</h2>
        <div className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between rounded-xl bg-[#F1F1F1] px-4 py-3 shadow-sm border border-gray-200">
            <div>
              <div className="font-medium text-black">Notifications</div>
              <div className="text-xs text-gray-700 max-w-xs">
                Active les notifications pour recevoir des alertes sur les événements et des recommandations.
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notif}
                onChange={() => setNotif(!notif)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-black transition-colors duration-200"></div>
              <div className={`absolute left-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${notif ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          {/* Géolocalisation */}
          <div className="flex items-center justify-between rounded-xl bg-[#F1F1F1] px-4 py-3 shadow-sm border border-gray-200">
            <div>
              <div className="font-medium text-black">Géolocalisation</div>
              <div className="text-xs text-gray-700 max-w-xs">
                Autorise l’application à accéder à ta position pour améliorer la pertinence.
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={geo}
                onChange={() => setGeo(!geo)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-black transition-colors duration-200"></div>
              <div className={`absolute left-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${geo ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          {/* Dark mode */}
          <div className="flex items-center justify-between rounded-xl bg-[#F1F1F1] px-4 py-3 shadow-sm border border-gray-200">
            <div>
              <div className="font-medium text-black">Mode sombre</div>
              <div className="text-xs text-gray-700 max-w-xs">
                Active le mode sombre pour reposer tes yeux la nuit.
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-black transition-colors duration-200"></div>
              <div className={`absolute left-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${darkMode ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
