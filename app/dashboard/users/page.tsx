'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type UserData = {
  id: string
  name: string
  email: string
  created_at: string
  is_verified: boolean
  role: 'admin' | 'utilisateur'
  visibility: number
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const supabase = createClient()

  // Redirection si pas admin
  useEffect(() => {
    const checkVisibility = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('visibility')
        .eq('id', user.id)
        .single()

      if (error || !data || data.visibility !== 1) {
        router.push('/')
      }
    }

    checkVisibility()
  }, [router, supabase])

  const handleVisibilityChange = async (id: string, visibility: number) => {
    const role = visibility === 1 ? 'admin' : 'utilisateur'

    // Mise à jour dans la table "users"
    await supabase
      .from('users')
      .update({ visibility, role })
      .eq('id', id)

    // Mise à jour dans Supabase Auth (user_metadata)
    await fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, role }),
    })

    // Mise à jour locale
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, visibility, role } : u
      )
    )
  }

  // Récupération des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users')

      try {
        const json = await res.json()

        if (res.ok) {
          const formatted = (json as Partial<UserData>[]).map((u) => ({
            id: u.id ?? '',
            name: u.name ?? '-',
            email: u.email ?? '-',
            created_at: u.created_at ?? '',
            is_verified: u.is_verified ?? false,
            role: u.role ?? 'utilisateur',
            visibility: u.visibility ?? 0,
          }))

          setUsers(formatted)
        } else {
          console.error('Erreur API:', json)
        }
      } catch (err) {
        console.error('Erreur de parsing JSON :', err)
      }
    }

    fetchUsers()
  }, [])

  const deleteUser = async (userId: string) => {
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error('Erreur suppression :', result.error)
    } else {
      console.log('Utilisateur supprimé !')
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }
  }

  const handleRoleChange = async (id: string, newRole: 'admin' | 'utilisateur') => {
    const visibility = newRole === 'admin' ? 1 : 0

    await supabase.from('users').update({ role: newRole, visibility }).eq('id', id)

    await fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, role: newRole }),
    })

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: newRole, visibility } : u
      )
    )
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Utilisateurs</h1>

      <div className="overflow-x-auto rounded-md shadow border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-4 py-2 whitespace-nowrap">Email</th>
              <th className="px-4 py-2 whitespace-nowrap">Inscription</th>
              <th className="px-4 py-2 whitespace-nowrap">Vérifié</th>
              <th className="px-4 py-2 whitespace-nowrap">Rôle</th>
              <th className="px-4 py-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.email || '-'}</td>
                <td className="px-4 py-2">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-4 py-2">
                  {user.is_verified ? '✅ Oui' : '❌ Non'}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={user.visibility === 1 ? 'admin' : 'utilisateur'}
                    onChange={(e) => {
                      const newVisibility = e.target.value === 'admin' ? 1 : 0
                      handleVisibilityChange(user.id, newVisibility)
                    }}
                    className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
                  >
                    <option value="utilisateur">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={async () => {
                      if (!confirm('Supprimer ce compte ?')) return
                      await deleteUser(user.id)
                      setUsers((prev) => prev.filter((u) => u.id !== user.id))
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
