'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // adapte le chemin si besoin
import { useDarkMode } from '@/context/DarkModeContext'

interface Article {
  id: string
  title: string
  img: string
  created_at: string
  status: boolean // ou string selon ta BDD, adapte si besoin
}

interface UserProps {
  id: string
  email: string
  pseudo: string
  avatar: string
  favoris: number
  followers: number
  suivis: number
}

export default function ProfileClient({ user }: { user: UserProps }) {
  const [notif, setNotif] = useState(false)
  const [geo, setGeo] = useState(false)
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [articleCount, setArticleCount] = useState<number>(0)
  const [articles, setArticles] = useState<Article[]>([])

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

  // --- ARTICLES : récupérer le nombre d'articles et les articles de l'utilisateur ---
  useEffect(() => {

    const fetchArticles = async () => {

      const supabase = createClient()

      // Récupère tous les articles de l'utilisateur
      const { data, count, error } = await supabase
        .from('articles')
        .select('id, title, img, created_at, status', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!error && data) {

        setArticles(data as Article[])
        setArticleCount(count ?? 0)
      }

    }
    if (user.id) fetchArticles()
  }, [user.id])

  // Utilitaire pour formater la date
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }
  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-[#242424]' : 'bg-white'}`}>
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
              <span className="text-white text-lg font-bold">{articleCount}</span>
              <span className="text-white text-xs opacity-80">Spot proposé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Propositions de spot */}
      <div className="px-4 mt-6 mb-8">
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Propositions de spot</h2>
        <div className="space-y-4">
          {articles.length === 0 && (
            <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-700'}`}>Aucune proposition pour le moment.</div>
          )}
          {articles.map(article => (
            <div
              key={article.id}
              className={`flex items-center rounded-xl shadow-sm border ${darkMode ? 'bg-[#30313A] border-[#353646]' : 'bg-[#F1F1F1] border-gray-200'} px-4 py-3`}
            >
              {/* Image */}
              <img
                src={article.img}
                alt={article.title}
                className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0"
              />
              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                  {formatDate(article.created_at)} à {formatTime(article.created_at)}
                </div>
                <div className={`font-semibold text-base truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                  {article.title}
                </div>
                {/* Status */}
                <div className="flex items-center mt-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      article.status
                        ? 'bg-green-500'
                        : 'bg-orange-400'
                    }`}
                  ></span>
                  <span className={`text-xs font-medium ${
                    article.status
                      ? (darkMode ? 'text-green-400' : 'text-green-600')
                      : (darkMode ? 'text-orange-300' : 'text-orange-600')
                  }`}>
                    {article.status ? 'validé' : 'en cours de validation'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paramètres */}
      <div className="px-4 pb-20">
        <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Paramètre</h2>
        <div className="space-y-6">
          {/* Notifications */}
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm ${darkMode ? 'bg-[#30313A]' : 'bg-[#F1F1F1]'}`}>
            <div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Notifications</div>
              <div className={`text-xs max-w-xs ${darkMode ? 'text-white' : 'text-[#7C7C7C]'}`}>
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
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-gray-300 transition-colors duration-200"></div>
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'bg-[#242424]' : 'bg-white'} rounded-full shadow transform transition-transform duration-200 ${notif ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          {/* Géolocalisation */}
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm ${darkMode ? 'bg-[#30313A]' : 'bg-[#F1F1F1]'}`}>
            <div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Géolocalisation</div>
              <div className={`text-xs max-w-xs ${darkMode ? 'text-white' : 'text-[#7C7C7C]'}`}>
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
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-gray-300 transition-colors duration-200"></div>
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'bg-[#242424]' : 'bg-white'} rounded-full shadow transform transition-transform duration-200 ${geo ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
          {/* Dark mode */}
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm ${darkMode ? 'bg-[#30313A]' : 'bg-[#F1F1F1]'}`}>
            <div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>Mode sombre</div>
              <div className={`text-xs max-w-xs ${darkMode ? 'text-white' : 'text-[#7C7C7C]'}`}>
                Active le mode sombre pour reposer tes yeux la nuit.
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-black dark:peer-checked:bg-gray-300 transition-colors duration-200"></div>
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'bg-[#242424]' : 'bg-white'} rounded-full shadow transform transition-transform duration-200 ${darkMode ? 'translate-x-5' : ''}`}></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
