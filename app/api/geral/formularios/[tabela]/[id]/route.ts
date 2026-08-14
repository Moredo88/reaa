import { createClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/auth/api'
import { FORMULARIOS } from '@/lib/geral'
import { montarPayload, camposObrigatoriosFaltando } from '@/lib/geral/repositorio'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tabela: string; id: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { tabela, id } = await params
  const formulario = FORMULARIOS.find((f) => f.tabela === tabela)
  if (!formulario) {
    return Response.json({ error: 'Formulário inválido.' }, { status: 400 })
  }

  const body = await request.json()
  const payload = montarPayload(formulario, body)
  const faltando = camposObrigatoriosFaltando(formulario, payload)
  if (faltando.length > 0) {
    return Response.json({ error: `Preencha: ${faltando.join(', ')}.` }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from(tabela).update(payload).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tabela: string; id: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { tabela, id } = await params
  const formulario = FORMULARIOS.find((f) => f.tabela === tabela)
  if (!formulario) {
    return Response.json({ error: 'Formulário inválido.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from(tabela).delete().eq('id', id)

  if (error) {
    const mensagem = error.code === '23503'
      ? 'Este registro está em uso por outro cadastro e não pode ser excluído.'
      : error.message
    return Response.json({ error: mensagem }, { status: 500 })
  }

  return Response.json({ ok: true })
}
