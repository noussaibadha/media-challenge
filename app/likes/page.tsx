'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LikesPage() {
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      if (!userId) return

      const { data: likes } = await supabase
        .from('likes')
        .select('article_id')
        .eq('user_id', userId)

      const articleIds = likes?.map(like => like.article_id) || []

      const { data: likedArticles } = await supabase
        .from('articles')
        .select('*')
        .in('id', articleIds)

      setArticles(likedArticles || [])
    }

    fetchLikes()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-white text-2xl font-bold mb-6">Mes Likes ❤️</h1>
      {articles.length === 0 ? (
        <p className="text-gray-400">Tu n’as pas encore liké d’articles.</p>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="bg-gray-800 text-white p-4 rounded-xl">
              <h2 className="text-xl font-bold">{article.title}</h2>
              <p className="text-sm text-gray-400">{article.adress}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
