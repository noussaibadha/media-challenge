'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function ArticleDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()
      setArticle(data)
    }

    if (id) fetchArticle()
  }, [id])

  if (!article) return <p className="text-center mt-10">Chargement...</p>

  return (
    <div className="min-h-screen bg-white px-4 pt-8 pb-24">
      {/* Retour */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-black text-xl"
      >
        ←
      </button>

      {/* Image */}
      <div className="rounded-3xl overflow-hidden mb-4">
        <img
          src={article.img || '/default.jpg'}
          alt={article.title}
          className="w-full h-60 object-cover"
        />
      </div>

      {/* Titre */}
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        {article.categorie?.split(',').map((tag: string, i: number) => (
          <span key={i} className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {tag}
          </span>
        ))}
      </div>

      {/* Infos principales */}
      <div className="space-y-2 text-sm mb-4">
        <p>📍 <span className="font-medium">{article.adress}</span></p>
        <p>🕒 <span className="font-medium">Fermeture : {article.fermeture || '1h'}</span></p>
        <p>👥 {article.description}</p>
      </div>

      {/* Affluence */}
      <div className="bg-gray-100 p-4 rounded-2xl mb-6">
        <p className="text-sm font-medium mb-2">
          Affluence prévu : <span className="font-bold">{article.affluence || 'Élevée'}</span>
        </p>
        <div className="w-full h-2 rounded-full bg-gray-300 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500" style={{ width: '85%' }} />
        </div>
      </div>

      {/* Description longue */}
      <div className="bg-gray-50 p-5 rounded-2xl">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-gray-800 text-sm">
          {article.description || "Aucune description détaillée disponible."}
        </p>
      </div>
    </div>
  )
}
