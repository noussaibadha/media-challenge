'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function ArticleDetail() {
  const { id } = useParams()
  const articleId = Array.isArray(id) ? id[0] : id

  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const name = currentUser?.user_metadata?.name
const [content, setContent] = useState('')
const fullName = currentUser?.user_metadata?.name || 'Utilisateur'


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()
      setArticle(data)
    }
    if (id) fetchArticle()
  }, [id])

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }

    fetchUser()
  }, [])
   const fetchComments = async () => {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })

      setComments(commentsData || [])
    }


  useEffect(() => {
   

    if (id) fetchComments()
  }, [id])

  // 👉 Place tous tes return APRÈS les useEffect
  if (!mounted || !article) return <p className="text-center mt-10">Chargement...</p>

    

  const likeComment = async (commentId: string) => {
  const { data, error } = await supabase.rpc('increment_like', {
    comment_id: commentId,
  })

  if (!error) {
    fetchComments() // 🔁 recharge pour mettre à jour les likes
  } else {
    console.error('Erreur like:', error)
  }
}

const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (!error) {
    fetchComments()
  } else {
    console.error('Erreur suppression:', error)
  }
}
  return (
    <div className="min-h-screen bg-white px-4 pt-8 pb-24 text-black">
  {/* Flèche de retour */}
  <button
    onClick={() => router.back()}
    className="mb-4 text-xl"
  >
    ←
  </button>


  
    {/* Image */}
    <div className=" overflow-hidden rounded-t-2xl ">
      <img
        src={article.img || '/default.jpg'}
        alt={article.title}
        className="w-full h-96 object-cover"
      />
    </div>

    <div className="bg-gray-100 p-4 rounded-b-2xl mb-6">

    {/* Titre */}
    <h1 className="text-2xl font-bold mb-4">{article.title}</h1>

    {/* Tags (catégories) */}
    <div className="flex flex-wrap gap-2 mb-4">
      {article.categorie?.split(',').map((tag: string, i: number) => (
        <span key={i} className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {tag.trim()}
        </span>
      ))}
    </div>

    {/* Infos principales */}
    <div className="space-y-2 text-sm mb-6">
      <p>📍 <span className="font-medium">{article.adress}</span></p>
    </div>

  
    <p className="text-sm font-medium mb-2">
      Affluence prévu : <span className="font-bold">{article.affluence || 'Élevée'}</span>
    </p>
    <div className="w-full h-2 rounded-full bg-gray-300 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
        style={{ width: article.affluence === 'Faible' ? '25%' : article.affluence === 'Moyenne' ? '60%' : '85%' }}
      />
    </div>
  </div>

  {/* Description détaillée */}
  <div className="bg-gray-50 p-5 rounded-2xl">
    <h2 className="text-lg font-semibold mb-2">Description</h2>
    <p className="text-gray-800 text-sm">
      {article.description}
    </p>
  </div>

 {/* Commentaires */}
  <div className="mt-10 bg-gray-100 p-5 rounded-2xl">
    <h2 className="text-xl font-semibold mb-4">Commentaires</h2>

    {/* ✅ Formulaire de commentaire */}
    <form
      onSubmit={async (e) => {
  e.preventDefault()
  const trimmedContent = content.trim()
  if (!trimmedContent) return

  const prenom = currentUser?.user_metadata?.prenom
  const nom = currentUser?.user_metadata?.nom

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content: trimmedContent,
      user_id: currentUser.id,
      article_id: articleId,
      name: fullName,
    })
    .select()



  if (!error && data && data.length > 0) {
    setContent('') // reset le champ
   setComments([
  {
    ...data[0],
    name: `${prenom} ${nom}`,
  },
  ...comments,
])

  } else {
    console.error('Erreur Supabase insert commentaire:', JSON.stringify(error, null, 2))

  }
}}

      className="mb-6"
    >
      <input
        name="content"
        placeholder="Ajouter un commentaire..."
        className="w-full border p-2 rounded"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />


      <button
        type="submit"
        disabled={!content.trim()}
        className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Poster
      </button>

    </form>

    {/* 🗨️ Liste des commentaires */}
    {comments.map((c) => (
      <div key={c.id} className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold">{c.name || 'Utilisateur'}</p>
          <p>{c.content}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => likeComment(c.id)}>❤️ {c.likes}</button>
          {c.user_id === currentUser?.id && (
            <button onClick={() => deleteComment(c.id)}>⋯</button>
          )}
        </div>
      </div>
    ))}

  </div>



  
</div>
  )
}
