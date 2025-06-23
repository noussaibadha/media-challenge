'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);
  
    useEffect(() => {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsConnected(true);
          console.log("✅ Utilisateur connecté :", session.user.email);
        } else {
          setIsConnected(false);
          console.log("🚫 Aucun utilisateur connecté");
        }
      };
      checkSession();
    });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bienvenue dans le tableau de bord admin</p>
    </main>
  );
}
