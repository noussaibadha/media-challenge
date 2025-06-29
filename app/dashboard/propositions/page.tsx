'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropositionsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [articleEnCours, setArticleEnCours] = useState<any | null>(null)


  const router = useRouter()

useEffect(() => {
  const checkVisibility = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      router.push('/auth/login') // pas connecté
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('visibility')
      .eq('id', user.id)
      .single()

    if (error || !data || data.visibility !== 1) {
      router.push('/') // pas admin => redirection accueil
    }
  }

  checkVisibility()
}, [router])


  useEffect(() => {
    fetchArticles()
  }, [])

const fetchArticles = async () => {
  const { data } = await supabase
    .from('articles_with_user_email')
    .select('*')
    .eq('status', false)

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
              <p className="text-sm text-gray-500">
                Proposé par : {article.user_email ?? 'Utilisateur inconnu'}
              </p>


              {article.img && <img src={article.img} alt={article.title} className="w-full max-w-md mt-2" />}
              {articleEnCours && (
  <div className="mt-8 border-t pt-6">
    <h2 className="text-xl font-bold mb-4">Modifier le spot</h2>
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await supabase
          .from('articles')
          .update(articleEnCours)
          .eq('id', articleEnCours.id)
        setArticleEnCours(null)
        fetchArticles()
      }}
      className="space-y-4"
    >
      <input
        value={articleEnCours.title}
        onChange={(e) => setArticleEnCours({ ...articleEnCours, title: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Titre"
      />
      <input
        value={articleEnCours.description}
        onChange={(e) => setArticleEnCours({ ...articleEnCours, description: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Description"
      />
      <input
        value={articleEnCours.adress}
        onChange={(e) => setArticleEnCours({ ...articleEnCours, adress: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Adresse"
      />
      <input
        value={articleEnCours.categorie}
        onChange={(e) => setArticleEnCours({ ...articleEnCours, categorie: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Catégorie"
      />

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={() => setArticleEnCours(null)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
)}


              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => validerArticle(article.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Valider
                </button>
                <button
                  onClick={() => setArticleEnCours(article)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Modifier
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
