import { createClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/auth/api'
import { FORMULARIOS } from '@/lib/geral'
import { montarPayload, camposObrigatoriosFaltando } from '@/lib/geral/repositorio'

// Cria um registro num dos 5 formularios. montarPayload so deixa passar
// colunas descritas em lib/geral.ts, entao o corpo da requisicao nunca
// grava um campo que a tela nao ofereceu.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabela: string }> }
) {
  const guard = await exigirAdmin()
  if (!guard.ok) return guard.resposta

  const { tabela } = await params
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
  const { error } = await supabase.from(tabela).insert(payload)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}
