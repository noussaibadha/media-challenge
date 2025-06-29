'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useDarkMode } from '@/context/DarkModeContext'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PropositionPage() {
  const { darkMode } = useDarkMode()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adress: '',
    categorie: '',
    affluence: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  // Utilitaires pour les classes input/select
  const inputClass = `w-full mb-4 px-4 py-2 border-2 rounded-full outline-none transition
    ${darkMode
      ? 'bg-[#23232b] border-purple-700 text-white placeholder-gray-400 focus:border-purple-400'
      : 'bg-white border-purple-400 text-black placeholder-gray-500 focus:border-purple-600'
    }`

  const selectClass = `w-full mb-4 px-4 py-2 border-2 rounded-full outline-none transition
    ${darkMode
      ? 'bg-[#23232b] border-purple-700 text-white focus:border-purple-400'
      : 'bg-white border-purple-400 text-black focus:border-purple-600'
    }`

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors ${darkMode ? 'bg-[#242424] text-white' : 'bg-white text-black'}`}>
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded-xl shadow-xl w-full max-w-md transition-colors
          ${darkMode ? 'bg-[#23232b] text-white' : 'bg-white text-black'}`}
      >
        <h1 className="text-3xl font-bold mb-1">Ajoutez un spot</h1>
        <p className={`mb-6 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          T’as un spot qui mérite d’être connu ? Partage-le ici et fais-le monter en influence !
        </p>

        {/* Titre */}
        <label className="block font-semibold mb-1">Titre</label>
        <input
          name="title"
          placeholder="Choisissez un titre"
          value={formData.title}
          onChange={handleChange}
          className={inputClass}
        />

        {/* Description */}
        <label className="block font-semibold mb-1">Description</label>
        <input
          name="description"
          placeholder="Choisissez une description"
          value={formData.description}
          onChange={handleChange}
          className={inputClass}
        />

        {/* Adresse */}
        <label className="block font-semibold mb-1">Adresse</label>
        <input
          name="adress"
          placeholder="Entrez une adresse"
          value={formData.adress}
          onChange={handleChange}
          className={inputClass}
        />

        {/* Catégories */}
        <label className="block font-semibold mb-1">Catégories</label>
        <select
          name="categorie"
          value={formData.categorie}
          onChange={handleChange}
          className={selectClass}
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
          className={selectClass}
        >
          <option value="">Sélectionnez</option>
          <option value="Faible">Faible</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Élevée">Élevée</option>
        </select>

        {/* Fichier */}
        <label className="block font-semibold mb-1">Fichier</label>
        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Montre le spot en image ou en vidéo pour donner envie d’y être !
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={inputClass}
        />

        {/* Aperçu image */}
        {previewUrl && (
          <div className="mb-4">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aperçu :</p>
            <img src={previewUrl} alt="Preview" className="w-full rounded-xl mt-2 shadow" />
          </div>
        )}

        {/* Bouton */}
        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-semibold hover:opacity-90 transition
            ${darkMode ? 'bg-purple-700 text-white' : 'bg-black text-white'}`}
        >
          Ajouter un spot
        </button>
      </form>
    </div>
  )
}