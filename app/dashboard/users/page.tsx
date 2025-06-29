'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserData = {
  id: string
  name: string
  email: string
  created_at: string
  is_verified: boolean
  role: 'admin' | 'utilisateur'
  visibility: number // 👈 ici
}


export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const supabase = createClient()

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
  }
}

  

useEffect(() => {
  const fetchUsers = async () => {
    const res = await fetch('/api/users')

    try {
      const json = await res.json()

      if (res.ok) {
        const formatted = json.map((u: any) => ({
        id: u.id,
        name: u.name || '-',
        email: u.email || '-',
        created_at: u.created_at,
        is_verified: u.is_verified || false,
        role: u.role || 'utilisateur',
        visibility: u.visibility ?? 0, // 👈 ici
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





const handleRoleChange = async (id: string, newRole: 'admin' | 'utilisateur') => {
  const visibility = newRole === 'admin' ? 1 : 0

  // 👉 Mise à jour dans ta table "users"
  await supabase
    .from('users')
    .update({ role: newRole, visibility })
    .eq('id', id)

  // 👉 Mise à jour dans Supabase Auth (user_metadata)
  await fetch('/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, role: newRole }),
  })

  // Mise à jour locale de l'état (pour affichage)
  setUsers((prev) =>
    prev.map((u) =>
      u.id === id ? { ...u, role: newRole, visibility } : u
    )
  )
}



  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce compte ?')) return
   await supabase.from('users').delete().eq('id', id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
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
              {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="px-4 py-2">
              {user.is_verified ? '✅ Oui' : '❌ Non'}
            </td>
            <td className="px-4 py-2">
              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(user.id, e.target.value as 'admin' | 'utilisateur')
                }
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
