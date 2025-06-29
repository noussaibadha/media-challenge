'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Facultatif : stocker l'utilisateur si besoin
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        if (data?.session) {
          localStorage.setItem('token', data.session.access_token);
        }

        // ⏳ Attends un peu que Supabase synchronise la session
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms suffit souvent

        // Récupérer les données de l'utilisateur depuis la table users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('visibility')
          .eq('id', data.user?.id)
          .single();

        if (userError) {
          console.error('Erreur lors de la récupération des données utilisateur:', userError);
          throw new Error('Impossible de récupérer les informations utilisateur');
        }

        // Redirection basée sur le rôle (visibility)
        if (userData?.visibility === 1) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              last_name: lastName,
              first_name: firstName,
            },
          },
        })

        if (error) throw error

        if (!data.user?.id || !data.user?.email) {
          throw new Error("Erreur lors de la création de l'utilisateur")
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name: lastName,
              visibility: 0, // Par défaut, nouveau utilisateur a le rôle 0
            },
          ])

        if (insertError) throw insertError

        alert('Vérifiez votre email pour confirmer votre compte!')
      }
    } catch (error: unknown) {
      let errorMsg = "";
      if (error instanceof Error) {
        errorMsg = error.message.toLowerCase();
      } else if (typeof error === 'string') {
        errorMsg = error.toLowerCase();
      } else {
        errorMsg = "une erreur est survenue";
      }

      if (
        errorMsg.includes('already registered') ||
        errorMsg.includes('user already registered') ||
        (errorMsg.includes('email') && errorMsg.includes('exists')) ||
        errorMsg.includes('duplicate key') ||
        errorMsg.includes('unique constraint')
      ) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(errorMsg);
        // Ou, si tu veux toujours afficher "Une erreur est survenue" pour les erreurs non gérées :
        // setError("Une erreur est survenue");
      }
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-12 px-4">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Image
          src="/logo_spottin.webp" // adapte le nom si nécessaire
          alt="Logo SpotIn"
          width={180} // ajuste la taille selon ta maquette
          height={60}
          priority
          className="object-contain"
        />
      </div>

      {/* Tabs */}
      <div className="flex w-80 mb-8 rounded-full border border-gray-300 p-1 bg-white shadow-sm">
        <Link
          href="/auth/login"
          className={`flex-1 py-2 text-center rounded-full font-medium transition-all ${mode === 'login'
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Connexion
        </Link>
        <Link
          href="/auth/signup"
          className={`flex-1 py-2 text-center rounded-full font-medium transition-all ${mode === 'signup'
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          Inscription
        </Link>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="w-80 space-y-4">
        {mode === 'signup' && (
          <>
            {/* Nom */}
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Entrez votre nom"
                className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-gray-400"
                required
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Entrez votre prénom"
                className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-gray-400"
                required
              />
            </div>
          </>
        )}

        {/* E-mail */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez une adresse mail"
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-gray-400"
            required
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? "Entrez un mot de passe" : "Entrez votre mot de passe"}
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition placeholder-gray-400"
            required
            minLength={6}
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Bouton */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 rounded-xl bg-gray-900 text-white font-semibold text-lg shadow-lg transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
        </button>
      </form>
    </div>
  )
}