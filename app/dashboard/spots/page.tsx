'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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



  const router = useRouter()

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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  useEffect(() => {
  const checkVisibility = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('visibility')
      .eq('id', user.id)
      .single()

    if (error || !data || data.visibility !== 1) {
      router.push('/')
    }
  }

  checkVisibility()
}, [router])

  return (
    <form onSubmit={handleSubmit} className="bg-white text-black dark:bg-white dark:text-black p-8 rounded-xl shadow max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold uppercase text-gray-800">Ajoutez un spot</h2>

      <div>
        <label className="block font-semibold">Titre</label>
        <input
          name="title"
          placeholder="Choisissez un titre"
          onChange={handleChange}
          value={formData.title}
          className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-semibold">Description</label>
        <input
          name="description"
          placeholder="Choisissez une description"
          onChange={handleChange}
          value={formData.description}
          className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-semibold">Adresse</label>
        <input
          name="adress"
          placeholder="Entrez une adresse"
          onChange={handleChange}
          value={formData.adress}
          className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-semibold">Catégories</label>
        <select onChange={handleCategoryChange} className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none" value="">
          <option value="">Sélectionnez</option>
          <option value="Rock">Rock</option>
          <option value="Rap">Rap</option>
          <option value="Electro">Electro</option>
          <option value="Jazz">Jazz</option>
          <option value="Rnb">Rnb</option>
          <option value="Pop">Pop</option>
          <option value="Reggae">Reggae</option>
          <option value="Techno">Techno</option>
          <option value="Classique">Classique</option>
          <option value="Hip-hop">Hip-Hop</option>
          <option value="Metal">Métal</option>
          <option value="Kpop">Kpop</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat, index) => (
          <div key={index} className="bg-purple-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
            {cat}
            <button
              type="button"
              onClick={() => removeCategory(cat)}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block font-semibold">Affluence</label>
        <select onChange={handleAffluenceChange} className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none" value="">
          <option value="">Sélectionnez</option>
          <option value="Faible">Faible</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Élevée">Élevée</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {affluences.map((aff, index) => (
          <div key={index} className="bg-purple-400 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
            {aff}
            <button
              type="button"
              onClick={() => removeAffluence(aff)}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block font-semibold">Fichier</label>
        <p className="text-xs text-gray-500 mb-1">Montre le spot en image ou en vidéo pour donner envie d’y être !</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none"
        />
      </div>

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">Aperçu de l’image :</p>
          <img src={previewUrl} alt="Prévisualisation" className="w-60 rounded shadow mt-2" />
          
          <Image
            src={previewUrl}
            alt="Prévisualisation"
            width={240}    // Largeur en pixels (ex : 240px pour w-60 de Tailwind)
            height={180}   // Hauteur à adapter selon le ratio de ton image
            className="rounded shadow mt-2"
            style={{ width: 'auto', height: 'auto' }} // Optionnel, pour garder le responsive
          />
        </div>
      )}

      <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900">
        Ajouter un spot
      </button>
    </form>
  )
}
