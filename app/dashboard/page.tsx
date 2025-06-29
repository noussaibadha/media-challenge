import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export default async function DashboardPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const c = cookieStore.get(name)
          return c?.value
        }
      }
    }
  )

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // ✅ Récupère visibility depuis la table users
  const { data: userRow, error: rowError } = await supabase
    .from('users')
    .select('visibility')
    .eq('id', user.id)
    .single()

  if (rowError || !userRow || userRow.visibility !== 1) {
    redirect('/') // redirige vers l'accueil si pas admin
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Salut, {user.email}</p>
    </main>
  )
}
