'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SpotsPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adress: '',
    categorie: '',
    affluence: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 🔹 Upload image si elle existe
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

    // 🔹 Enregistrement dans la table "articles"
    const { error: insertError } = await supabase.from('articles').insert([
      {
        ...formData,
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
        adress: '',
        categorie: '',
        affluence: ''
      })
      setFile(null)
      setPreviewUrl(null)
    }
  }

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
    <input
      name="categorie"
      placeholder="Sélectionnez"
      onChange={handleChange}
      value={formData.categorie}
      className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none"
    />
  </div>

  <div>
    <label className="block font-semibold">Affluence</label>
    <input
      name="affluence"
      placeholder="Sélectionnez"
      onChange={handleChange}
      value={formData.affluence}
      className="w-full p-3 rounded-full border-2 border-purple-500 focus:outline-none"
    />
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
    </div>
  )}

  <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900">
    Ajouter un spot
  </button>
</form>

  )
}
