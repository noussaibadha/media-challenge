// lib/auth.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return error || !user ? null : user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return error ? null : session
}
