import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const cookieStore = await cookies()

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

  const { data: userRow, error: rowError } = await supabase
    .from('users')
    .select('visibility')
    .eq('id', user.id)
    .single()

  if (rowError || !userRow || userRow.visibility !== 1) {
    redirect('/')
  }

  return (
    <>
      {/* ✅ Logo mobile uniquement */}
      <Link href="/" className="block md:hidden text-center mt-4 mb-6">
        <Image
          src="/logo_spotin_blanc.svg"
          alt="Logo SpotIn"
          width={90}
          height={30}
          priority
          className="mx-auto object-contain"
        />
      </Link>

      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard Administrateur</h1>
        <p className="text-gray-700 mb-8">
          Bienvenue sur le tableau de bord. Ici, tu peux gérer les spots proposés par les utilisateurs,
          valider ou refuser des publications, consulter les statistiques, et superviser l’activité de la plateforme.
          Utilise le menu de navigation pour accéder aux différentes sections d’administration.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Dernières actions</h2>
          <p className="text-gray-600">
            Tu retrouveras ici les derniers spots créés, les demandes en attente et les modifications récentes.
          </p>
        </section>
      </main>
    </>
  )
}
