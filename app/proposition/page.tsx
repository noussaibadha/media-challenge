'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropositionPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adress: '',
    categorie: '',
    affluence: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // ✅ Force le light mode pour éviter le mélange
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
        .replace(/[\u0300-\u036f]/g, '')
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
        img: imageUrl,
        status: false
      }
    ])

    if (insertError) {
      alert('Erreur : ' + insertError.message)
    } else {
      alert('Merci pour ta proposition ! Elle sera validée par un admin 👍')
      setFormData({
        title: '',
        description: '',
        adress: '',
        categorie: '',
        affluence: ''
      })
      setFile(null)
      setPreviewUrl(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-1">Ajoutez un spot</h1>
        <p className="mb-6 text-sm text-gray-600">
          T’as un spot qui mérite d’être connu ? Partage-le ici et fais-le monter en influence !
        </p>

        {/* Titre */}
        <label className="block font-semibold mb-1">Titre</label>
        <input
          name="title"
          placeholder="Choisissez un titre"
          value={formData.title}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border-2 border-purple-400 rounded-full outline-none"
        />

        {/* Description */}
        <label className="block font-semibold mb-1">Description</label>
        <input
          name="description"
          placeholder="Choisissez une description"
          value={formData.description}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border-2 border-purple-400 rounded-full outline-none"
        />

        {/* Adresse */}
        <label className="block font-semibold mb-1">Adresse</label>
        <input
          name="adress"
          placeholder="Entrez une adresse"
          value={formData.adress}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border-2 border-purple-400 rounded-full outline-none"
        />

        {/* Catégories */}
        <label className="block font-semibold mb-1">Catégories</label>
        <select
          name="categorie"
          value={formData.categorie}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border-2 border-purple-400 rounded-full outline-none bg-white"
        >
          <option value="">Sélectionnez</option>
          <option value="Bar">Bar</option>
          <option value="Concert">Concert</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Autre">Autre</option>
        </select>

        {/* Affluence */}
        <label className="block font-semibold mb-1">Affluence</label>
        <select
          name="affluence"
          value={formData.affluence}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border-2 border-purple-400 rounded-full outline-none bg-white"
        >
          <option value="">Sélectionnez</option>
          <option value="Faible">Faible</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Élevée">Élevée</option>
        </select>

        {/* Fichier */}
        <label className="block font-semibold mb-1">Fichier</label>
        <p className="text-sm text-gray-500 mb-2">Montre le spot en image ou en vidéo pour donner envie d’y être !</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4 px-4 py-2 border-2 border-purple-400 rounded-full outline-none bg-white"
        />

        {/* Aperçu image */}
        {previewUrl && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Aperçu :</p>
            <img src={previewUrl} alt="Preview" className="w-full rounded-xl mt-2 shadow" />
          </div>
        )}

        {/* Bouton */}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Ajouter un spot
        </button>
      </form>
    </div>
  )
}
