import type { SupabaseServerClient } from '@/lib/supabase/server'
import { FORMULARIOS } from '@/lib/geral'
import { listarFormulario, listarOpcoes, type OpcaoRef } from './repositorio'

// Graus de cada area, na ordem em que devem aparecer no filtro. A tabela
// `graus` tambem tem entradas nomeadas (Perfeicao, Capitulo, Kadosh,
// Consistorio, Inspetoria, Del.Lit., Superiores, Simbolica) que nao pertencem a
// nenhuma das duas fichas e por isso ficam de fora das duas listas.
export const GRAUS_SIMBOLICA = ['1', '2', '3']
export const GRAUS_SUPERIORES = Array.from({ length: 30 }, (_, i) => String(i + 4))

// A ordem sai da lista de nomes, nao do banco: listarOpcoes ordena por nome em
// ordem alfabetica, que poria '10' antes de '2'. Nome ausente da tabela e
// simplesmente ignorado, em vez de virar uma opcao vazia no select.
export function filtrarEOrdenar(opcoes: OpcaoRef[], nomes: string[]): OpcaoRef[] {
  const porNome = new Map(opcoes.map((o) => [o.nome, o]))
  return nomes.map((nome) => porNome.get(nome)).filter((o): o is OpcaoRef => Boolean(o))
}

export async function carregarFichaGrau(
  supabase: SupabaseServerClient,
  nomesPermitidos: string[]
) {
  const formulario = FORMULARIOS.find((f) => f.slug === 'resumo')!

  const [todos, resumos] = await Promise.all([
    listarOpcoes(supabase, 'graus'),
    listarFormulario(supabase, formulario),
  ])

  return { formulario, graus: filtrarEOrdenar(todos, nomesPermitidos), resumos }
}
