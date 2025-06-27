// /app/api/users/route.ts

import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // formatage simple
  const users = data.users.map((user) => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    is_verified: !!user.email_confirmed_at,
    name: user.user_metadata?.name || '-',
    role: user.user_metadata?.role || 'utilisateur',
  }))

  return NextResponse.json(users)
}



export async function DELETE(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()
  const userId = body.userId

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'User deleted successfully' })
}

// PATCH route dans /api/users/route.ts
export async function PATCH(req: Request) {
  const { id, role } = await req.json()

  const supabase = createAdminClient()
  const visibility = role === 'admin' ? 1 : 0

  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { role, visibility },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

