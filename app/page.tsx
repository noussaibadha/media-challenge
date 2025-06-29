'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SplashScreen from '@/components/SplashScreen'
import Link from "next/link"
import dynamic from 'next/dynamic'
import { useDarkMode } from '@/context/DarkModeContext'

// Import dynamique de la carte pour éviter les erreurs SSR
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
      <p>Chargement de la carte...</p>
    </div>
  )
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Article = {
  id: string;
  title: string;
  description: string;
  img: string;
  adress: string;
  categorie: string;
  affluence: string;
};

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [likedArticles, setLikedArticles] = useState<string[]>([])
  const [showMap, setShowMap] = useState(false)
  const [selectedArticleOnMap, setSelectedArticleOnMap] = useState<Article | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionData?.session) {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        console.log('User:', userData?.user)
        setUser(userData?.user)
      } else {
        console.log("🚫 Aucun utilisateur connecté")
        setUser(null)
      }
    }

    checkSession()
  }, [])

  const handleShare = (article: Article) => {
    const articleUrl = `${window.location.origin}/articles/${article.id}`;
    const shareData = {
      title: article.title,
      text: article.description,
      url: articleUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = `${article.title}\n\n${article.description}\n\n${articleUrl}`;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Lien copié dans le presse-papier !');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = `${article.title}\n\n${article.description}\n\n${articleUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleLike = async (articleId: string) => {
    const userId = user?.id

    if (!userId) {
      alert("Tu dois être connecté pour liker.")
      return
    }

    const alreadyLiked = likedArticles.includes(articleId)

    if (alreadyLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId)

      if (!error) {
        setLikedArticles(prev => prev.filter(id => id !== articleId))
      } else {
        alert("Erreur lors du dislike")
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ user_id: userId, article_id: articleId }])

      if (!error) {
        setLikedArticles(prev => [...prev, articleId])
      } else {
        alert("Erreur lors du like")
      }
    }
  }

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('likes')
        .select('article_id')
        .eq('user_id', user.id)

      if (data) {
        const likedIds = data.map((like: any) => like.article_id)
        setLikedArticles(likedIds)
      }
    }

    fetchLikes()
  }, [user?.id])

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

  // Filtrer les articles selon la catégorie sélectionnée et la recherche
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

  // Liste des catégories
  const categories = ['Tous', 'Rock', 'Rap', 'Electro', 'Jazz']

  // Gestion du clic sur un marqueur de la carte
  const handleMarkerClick = (article: Article) => {
    setSelectedArticleOnMap(article)
  }

  // Fermer la carte
  const closeMap = () => {
    setShowMap(false)
    setSearchTerm('')
    setSelectedArticleOnMap(null)
  }

  return (
    <>
      {loading && <SplashScreen onFinish={() => setLoading(false)} />}
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900/80' : 'bg-gray-100'} overflow-hidden`}>
        {/* Header uniquement sur mobile */}
        <header className={`w-full py-4 ${darkMode ? 'bg-gray-900/80' : 'bg-gray-100'} block md:hidden`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <Link href="/">
              <img src="/logo_spottin.webp" alt="SpotIn Logo" className="h-10 w-auto" />
            </Link>
            <Link href="/blog" className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full px-4 py-2 flex items-center gap-2">
              <img src="/book_spot.svg" alt="Blog" className="h-5 w-5" />
              <span className="text-white font-semibold">Le blog</span>
            </Link>
          </div>
        </header>

        {/* Titre avec marge et aligné à gauche */}
        <div className="text-left my-12 max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
            Découvrez les spots les plus tendances à Paris
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un spot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowMap(true)}
              className="w-full bg-gray-800/80 text-white placeholder-gray-400 px-4 py-3.5 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Affichage conditionnel : soit la carte, soit la liste des articles */}
        {showMap ? (
          /* Vue Carte */
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header de la carte avec bouton fermer */}
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                Carte des spots ({filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''})
              </h2>
              <button
                onClick={closeMap}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Fermer
              </button>
            </div>

            {/* Filtres par catégorie */}
            <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
              {/* Carte */}
              <div className="flex-1 rounded-xl overflow-hidden">
                <MapWithNoSSR
                  articles={filteredArticles}
                  onMarkerClick={handleMarkerClick}
                  selectedArticle={selectedArticleOnMap}
                />
              </div>

              {/* Sidebar avec article sélectionné */}
              {selectedArticleOnMap && (
                <div className="lg:w-80 bg-gray-900/90 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-white text-xl font-bold">{selectedArticleOnMap.title}</h3>
                    <button
                      onClick={() => setSelectedArticleOnMap(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Image */}
                  {selectedArticleOnMap.img ? (
                    <img
                      src={selectedArticleOnMap.img}
                      alt={selectedArticleOnMap.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white">📸 Photo du lieu</span>
                    </div>
                  )}

                  {/* Catégorie */}
                  <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium mb-3 inline-block">
                    {selectedArticleOnMap.categorie}
                  </span>

                  {/* Adresse */}
                  <div className="flex items-start mb-3">
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="text-white text-sm">{selectedArticleOnMap.adress}</span>
                  </div>

                  {/* Affluence */}
                  <div className="mb-3">
                    <span className="text-gray-400 text-sm">Affluence prévue: {selectedArticleOnMap.affluence}</span>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${selectedArticleOnMap.affluence === 'Faible' ? 'from-orange-300 to-orange-400' :
                            selectedArticleOnMap.affluence === 'Moyenne' ? 'from-orange-400 to-orange-500' :
                              'from-orange-500 to-orange-600'
                          }`}
                        style={{
                          width:
                            selectedArticleOnMap.affluence === 'Faible' ? '33%' :
                              selectedArticleOnMap.affluence === 'Moyenne' ? '66%' :
                                '100%'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <Link
                      href={`/articles/${selectedArticleOnMap.id}`}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-center font-medium transition-colors"
                    >
                      Voir détails
                    </Link>
                    <button
                      onClick={() => handleLike(selectedArticleOnMap.id)}
                      className={`p-2 rounded-lg transition-colors ${likedArticles.includes(selectedArticleOnMap.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Vue Liste normale */
          <>
            {/* Category Tags */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${selectedCategory === category
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
          <div className="px-4 pb-24 max-w-4xl mx-auto">
            <div className="space-y-6">
              {filteredArticles.map((article, index) => {
                const isLiked = likedArticles.includes(article.id)

                return (
                  <Link key={article.id} href={`/articles/${article.id}`} className="block">
                    <div className="bg-gray-900/90 rounded-3xl overflow-hidden">
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
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-white text-2xl font-bold">{article.title || 'Le Bataclan'}</h2>
                          <div className="flex gap-x-2 items-center">
                            {/* ❤️ Like button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleLike(article.id)
                              }}
                            >
                              <svg
                                className={`w-6 h-6 transition-colors duration-300 ${
                                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                                }`}
                                fill={isLiked ? 'currentColor' : 'none'}
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

                            {/* 🔗 Share button */}
                            <img
                              src="/share_spot.svg"
                              alt="Partager"
                              className="h-5 w-5 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleShare(article)
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                          <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {article.categorie || 'Rock'}
                          </span>
                        </div>

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

                        <div className="mb-2">
                          <span className="text-gray-400 text-sm">
                            Affluence prévue: {article.affluence}
                          </span>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              article.affluence === 'Faible'
                                ? 'from-orange-300 to-orange-400'
                                : article.affluence === 'Moyenne'
                                ? 'from-orange-400 to-orange-500'
                                : 'from-orange-500 to-orange-600'
                            }`}
                            style={{
                              width:
                                article.affluence === 'Faible'
                                  ? '33%'
                                  : article.affluence === 'Moyenne'
                                  ? '66%'
                                  : '100%',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
              
       
        </>
      )}
    </div>
  </>
)
}