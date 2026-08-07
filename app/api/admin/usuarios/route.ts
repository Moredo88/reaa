import { createAdminClient } from '@/lib/supabase/admin'
import { exigirAdmin } from '@/lib/auth/api'

// A listagem nao passa por aqui: a pagina /admin/usuarios ja monta a lista no
// servidor (lib/admin/usuarios.ts). Esta rota so cria.
export async function POST(request: Request) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const body = await request.json()
  const email = String(body.email ?? '').trim()
  const password = String(body.password ?? '')

  if (!email || password.length < 6) {
    return Response.json(
      { error: 'Informe um e-mail e uma senha de pelo menos 6 caracteres.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return Response.json({ error: error.message }, { status: 400 })
  if (!data.user) return Response.json({ error: 'Usuário não foi criado.' }, { status: 500 })

  // O trigger handle_new_user ja criou a linha em perfis; aqui so gravamos o
  // que o formulario definiu. Upsert para nao depender da ordem dos dois.
  const { error: erroPerfil } = await admin.from('perfis').upsert(
    {
      user_id: data.user.id,
      nome: String(body.nome ?? '').trim(),
      papel: body.papel === 'admin' ? 'admin' : 'membro',
      acesso_simbolica: Boolean(body.acesso_simbolica),
      acesso_superiores: Boolean(body.acesso_superiores),
    },
    { onConflict: 'user_id' }
  )

  if (erroPerfil) return Response.json({ error: erroPerfil.message }, { status: 500 })

  return Response.json({ ok: true, id: data.user.id })
}
