import type { SupabaseServerClient } from '@/lib/supabase/server'
import type { Formulario } from '@/lib/geral'

export interface OpcaoRef {
  id: string
  nome: string
}

// Usada para popular os selects de campos 'lista'/'formulario': toda tabela
// referenciavel tem uma coluna 'nome'. Listas ordenam por 'ordem'; formularios
// (ex.: obreiros como origem do select de Eventos) nao tem 'ordem', so 'nome'.
export async function listarOpcoes(
  supabase: SupabaseServerClient,
  tabela: string
): Promise<OpcaoRef[]> {
  const { data, error } = await supabase.from(tabela).select('id, nome').order('nome')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listarParametro(
  supabase: SupabaseServerClient,
  tabela: string
): Promise<OpcaoRef[]> {
  const { data, error } = await supabase
    .from(tabela)
    .select('id, nome')
    .order('ordem')
    .order('nome')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listarFormulario(
  supabase: SupabaseServerClient,
  formulario: Formulario
): Promise<Record<string, unknown>[]> {
  const embeds = formulario.campos
    .filter((c) => c.refTabela)
    .map((c) => `${c.refTabela}(id, nome)`)
  const select = ['*', ...embeds].join(', ')

  const { data, error } = await supabase
    .from(formulario.tabela)
    .select(select)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as unknown as Record<string, unknown>[] | null) ?? []
}

// Converte o corpo do formulario (strings vindas do form HTML) para os tipos
// de coluna certos, e so deixa passar colunas descritas em `campos` -- nunca
// grava o que o cliente mandou sem checar contra a lista permitida.
export function montarPayload(
  formulario: Formulario,
  body: Record<string, unknown>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  for (const campo of formulario.campos) {
    const bruto = body[campo.coluna]

    if (bruto === undefined) continue

    const valor = typeof bruto === 'string' ? bruto.trim() : bruto

    if (valor === '' || valor === null) {
      payload[campo.coluna] = null
      continue
    }

    switch (campo.tipo) {
      case 'numero':
      case 'ano':
        payload[campo.coluna] = Number.isFinite(Number(valor)) ? Number(valor) : null
        break
      default:
        payload[campo.coluna] = valor
    }
  }

  return payload
}

export function camposObrigatoriosFaltando(
  formulario: Formulario,
  payload: Record<string, unknown>
): string[] {
  return formulario.campos
    .filter((c) => c.obrigatorio)
    .filter((c) => !payload[c.coluna])
    .map((c) => c.nome)
}
