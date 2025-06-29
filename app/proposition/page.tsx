import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import PropositionPage from './PropositionPage'

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
    console.log(user)

  // Redirige vers /login si non connecté
  if (!user) {
    redirect('/auth/login')
  }

  // Passe les infos nécessaires au composant client
  return (
    <PropositionPage />
  )
}
