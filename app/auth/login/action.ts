'use server'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Tu peux renvoyer l'erreur au composant client si besoin
    return { error: error.message }
  }
  // Succès : le cookie est maintenant écrit côté serveur
  return { error: null }
}
