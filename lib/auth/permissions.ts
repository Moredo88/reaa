import type { SupabaseServerClient } from '@/lib/supabase/server'
import type { Area } from '@/lib/secoes'

export type Papel = 'admin' | 'membro'

export interface Perfil {
  user_id: string
  nome: string
  papel: Papel
  acesso_simbolica: boolean
  acesso_superiores: boolean
}

// Le o proprio perfil pelo client de sessao: a policy "perfis_self_read"
// permite isso sem precisar da service role key em cada render.
export async function getPerfil(
  supabase: SupabaseServerClient,
  userId: string
): Promise<Perfil> {
  const { data } = await supabase
    .from('perfis')
    .select('user_id, nome, papel, acesso_simbolica, acesso_superiores')
    .eq('user_id', userId)
    .maybeSingle()

  // Sem linha em perfis (usuario criado direto no painel do Supabase, antes do
  // trigger existir) o membro entra sem acesso a nenhuma area, nao com acesso total.
  return (
    (data as Perfil | null) ?? {
      user_id: userId,
      nome: '',
      papel: 'membro',
      acesso_simbolica: false,
      acesso_superiores: false,
    }
  )
}

export function podeVer(perfil: Perfil, area: Area): boolean {
  if (perfil.papel === 'admin') return true
  return area === 'simbolica' ? perfil.acesso_simbolica : perfil.acesso_superiores
}
