import { createClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/auth/api'
import { LISTAS } from '@/lib/geral'

function tabelaValida(tabela: string) {
  return LISTAS.some((l) => l.tabela === tabela)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tabela: string; id: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { tabela, id } = await params
  if (!tabelaValida(tabela)) {
    return Response.json({ error: 'Lista inválida.' }, { status: 400 })
  }

  const body = await request.json()
  const nome = String(body.nome ?? '').trim()
  if (!nome) {
    return Response.json({ error: 'Informe um nome.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from(tabela).update({ nome }).eq('id', id)

  if (error) {
    const mensagem = error.code === '23505' ? 'Já existe um item com esse nome.' : error.message
    return Response.json({ error: mensagem }, { status: 500 })
  }

  return Response.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tabela: string; id: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { tabela, id } = await params
  if (!tabelaValida(tabela)) {
    return Response.json({ error: 'Lista inválida.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from(tabela).delete().eq('id', id)

  if (error) {
    // 23503 = violacao de foreign key: algum formulario ainda referencia este item.
    const mensagem = error.code === '23503'
      ? 'Este item está em uso por outro cadastro e não pode ser excluído.'
      : error.message
    return Response.json({ error: mensagem }, { status: 500 })
  }

  return Response.json({ ok: true })
}
