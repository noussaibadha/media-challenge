'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDarkMode } from '@/context/DarkModeContext'

const supabase = createClient()

export default function ArticleDetail() {
  const params = useParams()
  const articleId = Array.isArray(params.id) ? params.id[0] : params.id
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
      if (!articleId) return

      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      setArticle(data)

      // Mettre à jour les métadonnées de la page
      if (data) {
        document.title = data.title

        // Mise à jour des meta tags
        updateMetaTags(data)
      }
    }

    if (articleId) fetchArticle()
  }, [articleId])

  const updateMetaTags = (articleData: any) => {
    // Description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', articleData.description)
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      metaDescription.setAttribute('content', articleData.description)
      document.head.appendChild(metaDescription)
    }

    // Open Graph
    const ogTags = [
      { property: 'og:title', content: articleData.title },
      { property: 'og:description', content: articleData.description },
      { property: 'og:image', content: articleData.img },
      { property: 'og:url', content: `${window.location.origin}/articles/${articleData.id}` },
      { property: 'og:type', content: 'article' }
    ]

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`)
      if (metaTag) {
        metaTag.setAttribute('content', tag.content)
      } else {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('property', tag.property)
        metaTag.setAttribute('content', tag.content)
        document.head.appendChild(metaTag)
      }
    })

    // Twitter
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: articleData.title },
      { name: 'twitter:description', content: articleData.description },
      { name: 'twitter:image', content: articleData.img }
    ]

    twitterTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`)
      if (metaTag) {
        metaTag.setAttribute('content', tag.content)
      } else {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', tag.name)
        metaTag.setAttribute('content', tag.content)
        document.head.appendChild(metaTag)
      }
    })
  }

  const fetchComments = async () => {
    if (!articleId || !currentUser) return

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
    if (articleId && currentUser) {
      fetchComments()
    }
  }, [articleId, currentUser])

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
    e.preventDefault()

    if (!currentUser) {
      alert('Vous devez être connecté pour commenter')
      return
    }

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
    if (!article) return

    const articleUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: articleUrl,
      }).catch(() => {
        navigator.clipboard.writeText(articleUrl)
          .then(() => alert('Lien copié dans le presse-papier !'))
          .catch(() => alert('Impossible de copier le lien.'))
      })
    } else {
      navigator.clipboard.writeText(
        `${article.title}\n\n${article.description}\n\n${articleUrl}`
      )
        .then(() => alert('Lien copié dans le presse-papier !'))
        .catch(() => alert('Impossible de copier le lien.'))
    }
  }

  if (!mounted || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  const bgPage = darkMode ? 'bg-[#242424]' : 'bg-white'
  const textPage = darkMode ? 'text-white' : 'text-black'
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-gray-100'
  const bgCardLight = darkMode ? 'bg-gray-700' : 'bg-gray-50'
  const textCard = darkMode ? 'text-white' : 'text-gray-800'
  const bgButton = darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
  const borderInput = darkMode ? 'border-gray-600' : 'border-gray-300'
  const bgProgress = darkMode ? 'bg-gray-700' : 'bg-gray-300'

  return (
    <div className={`min-h-screen ${bgPage} px-4 pt-8 pb-24 ${textPage} md:w-full md:px-[15%]`}>
      <button
        onClick={() => router.back()}
        className={`mb-4 text-xl ${textPage} flex items-center gap-2 hover:opacity-70 transition-opacity`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour
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
            <button className="text-gray-400 hover:text-red-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button onClick={handleShare} className="text-gray-400 hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
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
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{article.adress}</span>
          </p>
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
      <div className={`${bgCardLight} p-5 rounded-2xl mb-6 ${textCard}`}>
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Description
        </h2>
        <p className="text-sm leading-relaxed">{article.description}</p>
      </div>

      {/* Commentaires */}
      <div className={`${bgCard} p-5 rounded-2xl ${textCard}`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Commentaires ({comments.length})
        </h2>

        {currentUser ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-3">
              <input
                name="content"
                placeholder="Ajouter un commentaire..."
                className={`flex-1 border ${borderInput} px-4 py-2 rounded-lg ${bgCardLight} ${textCard} focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button
                type="submit"
                disabled={!content.trim()}
                className={`${bgButton} text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105`}
              >
                Poster
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">Connectez-vous pour laisser un commentaire</p>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Aucun commentaire pour le moment. Soyez le premier à commenter !
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`p-4 ${bgCardLight} rounded-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold">{comment.name}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="ml-10">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(comment.id, comment.likedByCurrentUser)}
                      className="flex items-center gap-1 hover:scale-110 transition-transform"
                    >
                      <svg
                        className={`w-5 h-5 transition-colors duration-200 ${comment.likedByCurrentUser ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                          }`}
                        fill={comment.likedByCurrentUser ? 'currentColor' : 'none'}
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
                      <span className="text-sm">{comment.likes || 0}</span>
                    </button>

                    {comment.user_id === currentUser?.id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}