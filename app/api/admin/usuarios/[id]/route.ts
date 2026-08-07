import { createAdminClient } from '@/lib/supabase/admin'
import { exigirAdmin } from '@/lib/auth/api'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  // Um admin nao pode remover o proprio papel: sem isso da para ficar sem
  // nenhum admin no sistema e so o painel do Supabase resolveria.
  if (id === guard.userId && body.papel && body.papel !== 'admin') {
    return Response.json(
      { error: 'Você não pode retirar o próprio papel de administrador.' },
      { status: 400 }
    )
  }

  const { error } = await admin
    .from('perfis')
    .update({
      nome: String(body.nome ?? '').trim(),
      papel: body.papel === 'admin' ? 'admin' : 'membro',
      acesso_simbolica: Boolean(body.acesso_simbolica),
      acesso_superiores: Boolean(body.acesso_superiores),
    })
    .eq('user_id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (body.password) {
    const senha = String(body.password)
    if (senha.length < 6) {
      return Response.json({ error: 'A senha precisa ter ao menos 6 caracteres.' }, { status: 400 })
    }
    const { error: erroSenha } = await admin.auth.admin.updateUserById(id, { password: senha })
    if (erroSenha) return Response.json({ error: erroSenha.message }, { status: 400 })
  }

  return Response.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { id } = await params
  if (id === guard.userId) {
    return Response.json({ error: 'Você não pode excluir o próprio usuário.' }, { status: 400 })
  }

  const admin = createAdminClient()
  // perfis tem ON DELETE CASCADE em auth.users, entao a linha some junto.
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return Response.json({ error: error.message }, { status: 400 })

  return Response.json({ ok: true })
}
