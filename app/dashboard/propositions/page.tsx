'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropositionsPage() {
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', false) // 👈 uniquement les non validés

    setArticles(data || [])
  }

  const validerArticle = async (id: string) => {
    await supabase.from('articles').update({ status: true }).eq('id', id)
    fetchArticles()
  }


  const refuserArticle = async (id: string) => {
    await supabase.from('articles').delete().eq('id', id)
    fetchArticles()
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Propositions en attente</h1>
      {articles.length === 0 ? (
        <p className="text-gray-500">Aucune proposition pour le moment.</p>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <div key={article.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <p>{article.description}</p>
              <p className="text-sm text-gray-500">{article.adress} - {article.categorie}</p>
              {article.img && <img src={article.img} alt={article.title} className="w-full max-w-md mt-2" />}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => validerArticle(article.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Valider
                </button>
                <button
                  onClick={() => refuserArticle(article.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
