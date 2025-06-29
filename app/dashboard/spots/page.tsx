'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SpotsPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adress: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [affluences, setAffluences] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Vérification des droits d'accès
  useEffect(() => {
    const checkVisibility = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('visibility')
        .eq('id', user.id)
        .single()

      if (error || !data || data.visibility !== 1) {
        router.push('/') // redirection si pas admin
      }
    }

    checkVisibility()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value && !categories.includes(value)) {
      setCategories(prev => [...prev, value])
    }
  }

  const removeCategory = (catToRemove: string) => {
    setCategories(prev => prev.filter(cat => cat !== catToRemove))
  }

  const handleAffluenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value && !affluences.includes(value)) {
      setAffluences(prev => [...prev, value])
    }
  }

  const removeAffluence = (affToRemove: string) => {
    setAffluences(prev => prev.filter(aff => aff !== affToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null
    setFile(selectedFile)

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let imageUrl = ''

      if (file) {
        const cleanedName = file.name
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9.\-_]/g, '')

        const path = `images/${Date.now()}-${cleanedName}`
        const { data, error } = await supabase.storage
          .from('articles')
          .upload(path, file)

        if (error) {
          alert('Erreur upload : ' + error.message)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('articles')
          .getPublicUrl(data.path)

        imageUrl = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('articles').insert([
        {
          ...formData,
          categorie: categories.join(', '),
          affluence: affluences.join(', '),
          img: imageUrl,
          status: true
        }
      ])

      if (insertError) {
        alert('Erreur : ' + insertError.message)
      } else {
        alert('✅ Article créé avec succès !')
        setFormData({
          title: '',
          description: '',
          adress: ''
        })
        setCategories([])
        setAffluences([])
        setFile(null)
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = [
    'Rock', 'Rap', 'Electro', 'Jazz', 'Rnb', 'Pop', 
    'Reggae', 'Techno', 'Classique', 'Hip-hop', 'Metal', 'Kpop'
  ]

  const affluenceOptions = ['Faible', 'Moyenne', 'Élevée']

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Ajouter un Spot
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Créez un nouveau lieu musical pour la communauté
          </p>
        </div>

        {/* Formulaire */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100 dark:border-gray-700">
            
            {/* Titre */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Titre du spot
              </label>
              <input
                name="title"
                placeholder="Choisissez un titre accrocheur"
                onChange={handleChange}
                value={formData.title}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </label>
              <textarea
                name="description"
                placeholder="Décrivez l'ambiance et les caractéristiques du lieu"
                onChange={handleChange}
                value={formData.description}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                required
              />
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Adresse
              </label>
              <input
                name="adress"
                placeholder="Entrez l'adresse complète du lieu"
                onChange={handleChange}
                value={formData.adress}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Catégories */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Genres musicaux
              </label>
              <select 
                onChange={handleCategoryChange} 
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                value=""
              >
                <option value="">Sélectionnez un genre</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, index) => (
                    <div key={index} className="inline-flex items-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="ml-2 text-purple-200 hover:text-white transition-colors duration-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Affluence */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Niveau d'affluence
              </label>
              <select 
                onChange={handleAffluenceChange} 
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                value=""
              >
                <option value="">Sélectionnez le niveau d'affluence</option>
                {affluenceOptions.map(aff => (
                  <option key={aff} value={aff}>{aff}</option>
                ))}
              </select>
              
              {affluences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {affluences.map((aff, index) => (
                    <div key={index} className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {aff}
                      <button
                        type="button"
                        onClick={() => removeAffluence(aff)}
                        className="ml-2 text-indigo-200 hover:text-white transition-colors duration-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload d'image */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image du spot
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ajoutez une photo qui donne envie de découvrir ce lieu !</p>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200">
                  <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">Cliquez pour sélectionner une image</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG jusqu'à 10MB</p>
                </div>
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Aperçu :</p>
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img src={previewUrl} alt="Prévisualisation" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreviewUrl(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de soumission */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter le spot
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )