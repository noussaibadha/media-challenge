import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Protection des routes dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('🔍 Vérification accès dashboard:', request.nextUrl.pathname)

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('❌ Pas d\'utilisateur connecté')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    console.log('✅ Utilisateur connecté:', user.email)

    // ✅ Lire directement depuis votre table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('visibility')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.log('❌ Erreur lecture table users:', userError.message)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (!userData) {
      console.log('❌ Utilisateur non trouvé dans table users')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    console.log('🔍 Données utilisateur:', {
      visibility: userData.visibility
    })

    // Vérifier les permissions - seulement visibility
    if (userData.visibility !== 1) {
      console.log('❌ Accès refusé - visibility !== 1 (valeur actuelle:', userData.visibility, ')')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    console.log('✅ Accès autorisé au dashboard!')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}