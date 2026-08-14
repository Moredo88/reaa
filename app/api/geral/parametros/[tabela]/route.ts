import { createClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/auth/api'
import { LISTAS } from '@/lib/geral'

function tabelaValida(tabela: string) {
  return LISTAS.some((l) => l.tabela === tabela)
}

// Cria um item numa das 4 listas de parametro. So admin chega aqui
// (exigirAdmin) e a RLS da tabela reforça a mesma regra no banco.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabela: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { tabela } = await params
  if (!tabelaValida(tabela)) {
    return Response.json({ error: 'Lista inválida.' }, { status: 400 })
  }

  const body = await request.json()
  const nome = String(body.nome ?? '').trim()
  if (!nome) {
    return Response.json({ error: 'Informe um nome.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { count } = await supabase.from(tabela).select('*', { count: 'exact', head: true })
  const { error } = await supabase.from(tabela).insert({ nome, ordem: (count ?? 0) + 1 })

  if (error) {
    const mensagem = error.code === '23505' ? 'Já existe um item com esse nome.' : error.message
    return Response.json({ error: mensagem }, { status: 500 })
  }

  return Response.json({ ok: true })
}
