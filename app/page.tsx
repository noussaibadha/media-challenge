'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useDarkMode } from '@/context/DarkModeContext'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [articles, setArticles] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsConnected(true);
        console.log("✅ Utilisateur connecté :", session.user.email);
      } else {
        setIsConnected(false);
        console.log("🚫 Aucun utilisateur connecté");
      }
    };
    checkSession();
  });
    const handleLike = async (articleId: string) => {
    const userId = user?.id

    if (!userId) {
      alert("Tu dois être connecté pour liker.")
      return
    }

    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle()

    if (existingLike) {
      alert('Tu as déjà liké cet article.')
      return
    }

    const { error } = await supabase.from('likes').insert([
      {
        user_id: userId,
        article_id: articleId,
      },
    ])

    if (error) {
      console.error(error)
      alert('Erreur lors du like.')
    } else {
      alert('Article liké !')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', true)

      setArticles(data || [])
    }

    fetchData()
  }, [])

  // Filtrer les articles selon la catégorie sélectionnée
  const filteredArticles = articles
  .filter(article => selectedCategory === 'Tous' || article.categorie === selectedCategory)
  .filter(article => {
    const search = searchTerm.toLowerCase()
    return (
      article.title?.toLowerCase().includes(search) ||
      article.adress?.toLowerCase().includes(search) ||
      article.categorie?.toLowerCase().includes(search)
    )
  })


  // Liste des catégories (vous pouvez la rendre dynamique si besoin)
  const categories = ['Tous', 'Rock', 'Rap', 'Electro', 'Jazz']

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900/80' : 'bg-gray-100'} overflow-hidden`}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-orange-400 text-3xl font-bold mb-6 text-center">Découvrir</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Rechercher un spot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/80 text-white placeholder-gray-400 px-4 py-3.5 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <svg
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Tags */}
        <div className="flex gap-3 mb-4 overflow-scroll">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-24">
        <div className="space-y-6">
          {filteredArticles.map((article, index) => (
            <div key={article.id} className="bg-gray-900/90 rounded-3xl overflow-hidden">
              {/* Media Section */}
              <div className="relative h-40 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                {article.img ? (
                  <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-white">
                    <div className="text-lg mb-1">📸 Photo/Vidéo</div>
                    <div className="text-sm opacity-70">du lieu</div>
                  </div>
                )}

                {/* Play Button */}
                <button className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title and Heart */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-white text-2xl font-bold">{article.title || 'Le Bataclan'}</h2>
                  <button
                    onClick={() => handleLike(article.id)}
                    className="ml-4 mt-1"
                  >
                    <svg
                      className="w-6 h-6 text-gray-400 hover:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>

                </div>

                {/* Genre Tags */}
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    {article.categorie || 'Rock'}
                  </span>
                  <span className="bg-gray-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">Métal</span>
                </div>

                {/* Location */}
                <div className="flex items-start mb-3">
                  <svg
                    className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-white text-sm">{article.adress || '50 Boulevard Voltaire, Paris'}</span>
                </div>

                {/* Opening Hours */}
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <span className="text-gray-300 text-sm">Fermeture: 02:00</span>
                </div>

                {/* Event Info */}
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-gray-300 text-sm">Concert ce soir - Metallica</span>
                </div>

                {/* Affluence */}
                <div className="mb-2">
                  <span className="text-gray-400 text-sm">Affluence prévue: Élevée</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                    style={{ width: `${75 + (index * 5) % 20}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {filteredArticles.length === 0 && (
            <p className="text-center text-gray-400 mt-10">Aucun article trouvé pour cette catégorie.</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {/* ... votre code de navigation inchangé ... */}
    </div>
  )
}
