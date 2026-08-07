import { createAdminClient } from '@/lib/supabase/admin'
import type { Papel } from '@/lib/auth/permissions'

export interface UsuarioAdmin {
  id: string
  email: string
  nome: string
  papel: Papel
  acesso_simbolica: boolean
  acesso_superiores: boolean
  created_at: string
}

// A lista cruza auth.users (e-mail, data de criacao) com perfis (nome, papel,
// acessos). Precisa da service role key: listUsers e uma operacao de admin.
export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers()
  if (error) throw new Error(error.message)

  const { data: perfis } = await admin
    .from('perfis')
    .select('user_id, nome, papel, acesso_simbolica, acesso_superiores')

  const porId = new Map((perfis ?? []).map((p) => [p.user_id, p]))

  return (data?.users ?? []).map((u) => {
    const p = porId.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      nome: p?.nome ?? '',
      papel: (p?.papel as Papel) ?? 'membro',
      acesso_simbolica: p?.acesso_simbolica ?? false,
      acesso_superiores: p?.acesso_superiores ?? false,
      created_at: u.created_at,
    }
  })
}
