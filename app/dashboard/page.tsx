// app/dashboard/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export default async function DashboardPage() {
  // ✅ attendre la promesse
  const cookieStore = await cookies()

  // créer le client Supabase avec les cookies
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


  if (error || !user) {
    redirect('/login')
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Salut, {user.email}</p>
    </main>
  )
}
