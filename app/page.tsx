'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [articles, setArticles] = useState<any[]>([])

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

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Articles</h1>
      <div className="grid gap-4">
        {articles?.map((article) => (
          <div key={article.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p>{article.description}</p>
            <p className="text-sm text-gray-500">{article.adress} - {article.categorie}</p>
            {article.img && <img src={article.img} alt={article.title} className="w-full max-w-md mt-2" />}
          </div>
        ))}
      </div>
    </main>
  )
}
