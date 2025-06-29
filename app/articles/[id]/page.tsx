'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDarkMode } from '@/context/DarkModeContext'
import Head from 'next/head';

const supabase = createClient()

export default function ArticleDetail() {
  const { id } = useParams()
  const articleId = Array.isArray(id) ? id[0] : id
  const { darkMode } = useDarkMode()

  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchUser()
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

  const fetchComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('id, content, created_at, article_id, user_id, likes, name')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur fetch comments:', error)
      return
    }

    // Ajouter info like par utilisateur
    const enriched = await Promise.all(
      commentsData.map(async (comment) => {
        const { data: like } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', currentUser?.id)
          .single()

        return {
          ...comment,
          likedByCurrentUser: !!like,
        }
      })
    )

    setComments(enriched)
  }


const toggleLike = async (commentId: string, liked: boolean) => {
  if (!currentUser) return

  // 1. Récupère le commentaire pour connaître le nombre de likes actuel
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('likes')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    console.error('Erreur récupération du commentaire:', fetchError)
    return
  }

  const currentLikes = comment.likes || 0

  if (liked) {
    // DISLIKE
    const { error: deleteError } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)

    if (deleteError) {
      console.error('Erreur dislike:', deleteError)
      return
    }

    await supabase
      .from('comments')
      .update({ likes: currentLikes > 0 ? currentLikes - 1 : 0 })
      .eq('id', commentId)

  } else {
    // LIKE
    const { error: insertError } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: currentUser.id,
      })

    if (insertError) {
      console.error('Erreur like:', insertError)
      return
    }

    await supabase
      .from('comments')
      .update({ likes: currentLikes + 1 })
      .eq('id', commentId)
  }

  fetchComments()
}




  

  useEffect(() => {
    if (id) fetchComments()
  }, [id])

  const likeComment = async (commentId: string) => {
    const { error } = await supabase.rpc('increment_like', {
      comment_id: commentId,
    })

    if (!error) {
      fetchComments()
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

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔎 currentUser:', currentUser)

    e.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    const first = currentUser?.user_metadata?.first_name
    const last = currentUser?.user_metadata?.last_name
    const name = `${first ?? ''} ${last ?? ''}`.trim() || 'Utilisateur'

    const { error } = await supabase.from('comments').insert({
      content: trimmedContent,
      user_id: currentUser.id,
      article_id: articleId,
      name,
    })

    if (!error) {
      setContent('')
      fetchComments()
    } else {
      console.error('Erreur Supabase insert commentaire:', JSON.stringify(error, null, 2))
    }
  }
  // fonction de partage 
  const handleShare = () => {
    const articleUrl = window.location.href; // ou `${window.location.origin}/articles/${article.id}` si tu veux être sûr
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: articleUrl,
      }).catch(() => {
        navigator.clipboard.writeText(articleUrl)
          .then(() => alert('Lien copié dans le presse-papier !'))
          .catch(() => alert('Impossible de copier le lien.'));
      });
    } else {
      navigator.clipboard.writeText(
        `${article.title}\n\n${article.description}\n\n${articleUrl}`
      )
        .then(() => alert('Lien copié dans le presse-papier !'))
        .catch(() => alert('Impossible de copier le lien.'));
    }
  };


  if (!mounted || !article) return <p className="text-center mt-10">Chargement...</p>

  const bgPage = darkMode ? 'bg-[#242424]' : 'bg-white'
  const textPage = darkMode ? 'text-white' : 'text-black'
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-gray-100'
  const bgCardLight = darkMode ? 'bg-gray-700' : 'bg-gray-50'
  const textCard = darkMode ? 'text-white' : 'text-gray-800'
  const bgButton = darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
  const borderInput = darkMode ? 'border-gray-600' : 'border-gray-300'
  const bgProgress = darkMode ? 'bg-gray-700' : 'bg-gray-300'
  return (
    <>
      <Head>
        <title>{article.title}</title>
        <meta name="description" content={article.description} />
        
        {/* Balises Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={article.img} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.id}`} />
        <meta property="og:type" content="article" />
        
        {/* Balises Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={article.img} />
      </Head>
      <div className={`min-h-screen ${bgPage} px-4 pt-8 pb-24 ${textPage} md:w-full md:px-[15%]`}>
        <button
          onClick={() => router.back()}
          className={`mb-4 text-xl ${textPage}`}
        >
          ←
        </button>

        {/* Image */}
        <div className="overflow-hidden rounded-t-2xl">
          <img
            src={article.img || '/default.jpg'}
            alt={article.title}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Détails */}
        <div className={`${bgCard} p-4 rounded-b-2xl mb-6 ${textCard}`}>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <div className="flex gap-x-2 items-center">
              <button
                // onClick={() => handleLike(article.id)}
              >
                <svg
                  // className={`w-6 h-6 transition-colors duration-300 ${
                  //   // likedArticles.includes(article.id)
                  //   //   ? 'text-red-500'
                  //   //   : 'text-gray-400 hover:text-red-400'
                  // }`}
                  fill="currentColor"
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
              <img
                src="/share_spot.svg"
                alt="Partager"
                className="h-5 w-5 cursor-pointer"
                onClick={() => handleShare()}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {article.categorie?.split(',').map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="space-y-2 text-sm mb-6">
            <p>📍 <span className="font-medium">{article.adress}</span></p>
          </div>

          <p className="text-sm font-medium mb-2">
            Affluence prévue : <span className="font-bold">{article.affluence || 'Élevée'}</span>
          </p>
          <div className={`w-full h-2 rounded-full ${bgProgress} overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
              style={{
                width:
                  article.affluence === 'Faible'
                    ? '25%'
                    : article.affluence === 'Moyenne'
                    ? '60%'
                    : '85%',
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className={`${bgCardLight} p-5 rounded-2xl ${textCard}`}>
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-sm">{article.description}</p>
        </div>

        {/* Commentaires */}
        <div className={`mt-10 ${bgCard} p-5 rounded-2xl ${textCard}`}>
          <h2 className="text-xl font-semibold mb-4">Commentaires</h2>

          <form onSubmit={handleSubmit} className="mb-6">
            <input
              name="content"
              placeholder="Ajouter un commentaire..."
              className={`w-full border ${borderInput} p-2 rounded ${bgCardLight} ${textCard}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className={`${bgButton} text-white px-4 py-2 rounded disabled:opacity-50 mt-2`}
            >
              Poster
            </button>
          </form>

          {comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p>{c.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(c.id, c.likedByCurrentUser)}
                  className="flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-6 h-6 transition-colors duration-200 ${
                      c.likedByCurrentUser ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                    fill={c.likedByCurrentUser ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="text-sm">{c.likes}</span>
                </button>

                {c.user_id === currentUser?.id && (
                  <button onClick={() => deleteComment(c.id)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1H8a1 1 0 00-1 1h10z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>

  )
}
