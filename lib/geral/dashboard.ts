import type { SupabaseServerClient } from '@/lib/supabase/server'

export interface Fatia {
  rotulo: string
  valor: number
}

export interface DadosDashboard {
  totalObreiros: number
  totalEventos: number
  obreirosSemEvento: { id: string; nome: string; cargo: string }[]
  grausComAtividade: number
  eventosPorGrau: Fatia[]
  eventosPorData: Fatia[]
  obreirosPorCargo: Fatia[]
  registrosPorCadastro: Fatia[]
  /** Dimensoes que hoje tem valor unico: viram texto de contexto, nao grafico. */
  contexto: { corpos: string[]; anos: string[]; agendas: string[] }
}

interface LinhaObreiro {
  id: string
  nome: string
  ano: number | null
  cargos: { nome: string } | null
  corpos: { nome: string } | null
}

interface LinhaEvento {
  data: string | null
  obreiro_id: string | null
  agendas: { nome: string } | null
  graus: { nome: string } | null
}

function contar(valores: (string | null | undefined)[]): Map<string, number> {
  const mapa = new Map<string, number>()
  for (const bruto of valores) {
    const chave = bruto ?? '(sem valor)'
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1)
  }
  return mapa
}

// Grau pode ser numerico ('1'..'33') ou nominal ('Kadosh'): ordena numero como
// numero e deixa os nominais no fim, em ordem alfabetica.
function ordenarGraus(a: Fatia, b: Fatia): number {
  const na = Number(a.rotulo)
  const nb = Number(b.rotulo)
  const aNum = Number.isFinite(na)
  const bNum = Number.isFinite(nb)
  if (aNum && bNum) return na - nb
  if (aNum) return -1
  if (bNum) return 1
  return a.rotulo.localeCompare(b.rotulo, 'pt-BR')
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

// Uma unica leitura de cada tabela; as agregacoes saem em memoria. O volume
// aqui e de dezenas de linhas, entao nao compensa uma view no banco ainda.
export async function carregarDashboard(
  supabase: SupabaseServerClient
): Promise<DadosDashboard> {
  const [obreirosRes, eventosRes, notesRes, cobridoresRes, resumosRes] = await Promise.all([
    supabase.from('obreiros').select('id, nome, ano, cargos(nome), corpos(nome)'),
    supabase.from('eventos').select('data, obreiro_id, agendas(nome), graus(nome)'),
    supabase.from('notes').select('*', { count: 'exact', head: true }),
    supabase.from('cobridores').select('*', { count: 'exact', head: true }),
    supabase.from('resumos').select('*', { count: 'exact', head: true }),
  ])

  if (obreirosRes.error) throw new Error(obreirosRes.error.message)
  if (eventosRes.error) throw new Error(eventosRes.error.message)

  const obreiros = (obreirosRes.data ?? []) as unknown as LinhaObreiro[]
  const eventos = (eventosRes.data ?? []) as unknown as LinhaEvento[]

  const comEvento = new Set(eventos.map((e) => e.obreiro_id).filter(Boolean))

  const eventosPorGrau = Array.from(contar(eventos.map((e) => e.graus?.nome)))
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort(ordenarGraus)

  const eventosPorData = Array.from(contar(eventos.map((e) => e.data)))
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo))
    .map((f) => ({ ...f, rotulo: f.rotulo === '(sem valor)' ? f.rotulo : formatarData(f.rotulo) }))

  const obreirosPorCargo = Array.from(contar(obreiros.map((o) => o.cargos?.nome)))
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, 'pt-BR'))

  return {
    totalObreiros: obreiros.length,
    totalEventos: eventos.length,
    obreirosSemEvento: obreiros
      .filter((o) => !comEvento.has(o.id))
      .map((o) => ({ id: o.id, nome: o.nome, cargo: o.cargos?.nome ?? '—' }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    grausComAtividade: eventosPorGrau.length,
    eventosPorGrau,
    eventosPorData,
    obreirosPorCargo,
    registrosPorCadastro: [
      { rotulo: 'Obreiros', valor: obreiros.length },
      { rotulo: 'Eventos', valor: eventos.length },
      { rotulo: 'Notes', valor: notesRes.count ?? 0 },
      { rotulo: 'Cobridor', valor: cobridoresRes.count ?? 0 },
      { rotulo: 'Resumo', valor: resumosRes.count ?? 0 },
    ],
    contexto: {
      corpos: Array.from(contar(obreiros.map((o) => o.corpos?.nome)).keys()),
      anos: Array.from(contar(obreiros.map((o) => (o.ano ? String(o.ano) : null))).keys()),
      agendas: Array.from(contar(eventos.map((e) => e.agendas?.nome)).keys()),
    },
  }
}
