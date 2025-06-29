// app/dashboard/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export default async function DashboardPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const c = cookieStore.get(name)
          return c ? c.value : undefined
        }
      }
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header avec animation */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tableau de Bord
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Bienvenue, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user.email}</span>
          </p>
        </div>

        {/* Cards de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spots</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-500 text-sm font-medium">+12%</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">ce mois</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-yellow-500 text-sm font-medium">En cours</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">de validation</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-500 text-sm font-medium">+8%</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">nouveaux</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Popularité</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">89%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-purple-500 text-sm font-medium">Excellent</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">score</span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/dashboard/spots" className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Ajouter un Spot</h3>
                  <p className="text-indigo-100">Créer un nouveau lieu</p>
                </div>
              </div>
            </a>

            <a href="/dashboard/propositions" className="group bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Gérer Propositions</h3>
                  <p className="text-yellow-100">Valider les demandes</p>
                </div>
              </div>
            </a>

            <a href="/dashboard/users" className="group bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Gérer Utilisateurs</h3>
                  <p className="text-green-100">Administration</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}