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
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Créer un article</h2>

      <input name="title" placeholder="Titre" onChange={handleChange} value={formData.title} className="border p-2 w-full" />
      <input name="description" placeholder="Description" onChange={handleChange} value={formData.description} className="border p-2 w-full" />
      <input name="adress" placeholder="Adresse" onChange={handleChange} value={formData.adress} className="border p-2 w-full" />
      <input name="categorie" placeholder="Catégorie" onChange={handleChange} value={formData.categorie} className="border p-2 w-full" />
      <input name="affluence" placeholder="Affluence" onChange={handleChange} value={formData.affluence} className="border p-2 w-full" />

      <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 w-full" />

      {previewUrl && (
        <div>
          <p className="text-sm text-gray-500">Aperçu de l image :</p>
          <img src={previewUrl} alt="Prévisualisation" className="w-60 rounded shadow mt-2" />
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Créer</button>
    </form>
  )
}
