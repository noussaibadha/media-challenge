'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useDarkMode } from '@/context/DarkModeContext'


const supabase = createClient()

export default function LikesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [user, setUser] = useState<any | null>(null)
  const { darkMode, toggleDarkMode } = useDarkMode()

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      if (!userId) return

      setUser(user)

      const { data: likes } = await supabase
        .from('likes')
        .select('article_id')
        .eq('user_id', userId)

      const articleIds = likes?.map(like => like.article_id) || []
      setLikedIds(articleIds)

      const { data: likedArticles } = await supabase
        .from('articles')
        .select('*')
        .in('id', articleIds)
        .eq('status', true)

      setArticles(likedArticles || [])
    }

    fetchLikes()
  }, [])

  const handleLike = async (articleId: string) => {
    const userId = user?.id
    if (!userId) return

    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle()

    if (existingLike) {
      // Supprimer le like
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId)

      setLikedIds(prev => prev.filter(id => id !== articleId))
    } else {
      // Ajouter le like
      await supabase
        .from('likes')
        .insert({ user_id: userId, article_id: articleId })

      setLikedIds(prev => [...prev, articleId])
    }
  }


  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <h1 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-black'}`}>
        Mes spots favoris
      </h1>

      {articles.length === 0 ? (
        <p className="text-center text-gray-400">Tu n’as pas encore liké de spots.</p>
      ) : (
        <div className="space-y-6">
          {articles.map((article, index) => (
            <Link key={article.id} href={`/articles/${article.id}`} className="block">
              <div className={`rounded-3xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
                {/* Image */}
                <div className="relative h-40 bg-gray-700">
                  {article.img ? (
                    <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`flex items-center justify-center h-full ${darkMode ? 'text-white' : 'text-gray-600'}`}>📸 Aucune image</div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{article.title}</h2>
                    <button onClick={(e) => { e.preventDefault(); handleLike(article.id); }}>
                      <svg className="w-6 h-6 text-red-500 hover:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.categorie && (
                      <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        {article.categorie}
                      </span>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="flex items-start mb-3">
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                    </svg>
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`}>{article.adress}</span>
                  </div>

                  {/* Fermeture */}
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fermeture : 02:00</span>
                  </div>

                  {/* Description rapide */}
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{article.description}</span>
                  </div>

                  {/* Affluence */}
                  <div className="mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Affluence prévue : {article.affluence}</span>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-300'} w-full rounded-full h-2`}>
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                      style={{ width: `${75 + (index * 5) % 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
