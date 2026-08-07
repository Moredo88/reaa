import { createClient } from '@supabase/supabase-js'

// Ignora RLS. So pode ser importado de codigo que roda no servidor
// (rotas /api/admin) e nunca de um componente 'use client'.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
