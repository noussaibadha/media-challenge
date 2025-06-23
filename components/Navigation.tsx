'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Titre */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="text-xl font-bold text-gray-800 hover:text-gray-600"
            >
              📱 MediaChallenge
            </button>
          </div>

          {/* Navigation principale */}
          <div className="flex items-center space-x-4">
            {/* Liens publics */}
            <button
              onClick={() => router.push('/')}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              🏠 Accueil
            </button>

            <button
              onClick={() => router.push('/lives')}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-1"
            >
              🔴 Lives
            </button>

            <button
              onClick={() => router.push('/proposition')}
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              ➕ Proposer
            </button>

            {/* Actions selon l'état de connexion */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Bouton démarrer live */}
                <button
                  onClick={() => router.push('/live/start')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  🔴 Go Live
                </button>

                {/* Dashboard admin si disponible */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  📊 Dashboard
                </button>

                {/* Profil utilisateur */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(user.user_metadata?.last_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">
                    {user.user_metadata?.last_name || user.email}
                  </span>
                </div>

                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}