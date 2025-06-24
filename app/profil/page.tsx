import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './profileClient'
import { createServerClient } from '@supabase/ssr'

export default async function ProfilePage() {
    // Récupère l'utilisateur connecté
    //   const supabase = createClient()
      const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
        cookies: {
            get(name: string) {
            const c = cookieStore.get(name)
            return c ? c.value : undefined
            }
        }
        }
    )
  const { data: { user }, error } = await supabase.auth.getUser()

  // Redirige vers /login si non connecté
  if (!user) {
    redirect('/login')
  }

  // Passe les infos nécessaires au composant client
  return (
    <ProfileClient
      user={{
        email: user.email,
        pseudo: user.user_metadata?.last_name || 'Pseudo',
        avatar: user.user_metadata?.avatar_url || '	https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        favoris: 12,
        followers: 8,
        suivis: 2,
      }}
    />
  )
}
