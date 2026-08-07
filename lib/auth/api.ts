import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'

type Guard =
  | { ok: true; userId: string }
  | { ok: false; resposta: Response }

// Portaria das rotas /api/admin. O papel vem do banco, nunca do corpo da
// requisicao: quem chama a rota nao decide se e admin.
export async function exigirAdmin(): Promise<Guard> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, resposta: Response.json({ error: 'Não autenticado' }, { status: 401 }) }
  }

  const perfil = await getPerfil(supabase, user.id)
  if (perfil.papel !== 'admin') {
    return { ok: false, resposta: Response.json({ error: 'Sem permissão' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}
