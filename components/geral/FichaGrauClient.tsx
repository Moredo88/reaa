'use client'

import { useState, type ElementType } from 'react'
import {
  Sparkles, Shapes, Scroll, Scale, Users, BookOpen, Landmark,
  FileText, Layers, MousePointerClick, FileQuestion,
} from 'lucide-react'
import Select from '@/components/ui/Select'
import { paraTextoPuro } from '@/lib/utils'
import type { CampoFormulario, Formulario } from '@/lib/geral'
import type { OpcaoRef } from '@/lib/geral/repositorio'

interface Props {
  formulario: Formulario
  graus: OpcaoRef[]
  resumos: Record<string, unknown>[]
}

// Grau ja aparece no cabecalho da ficha; o resto dos campos do Resumo entra
// na visao executiva, agrupado por tema.
const CAMPOS_OCULTOS = ['grau_id']

// Cor por grupo, nao por campo: tres matizes separadas (blue-600 / orange-600 /
// emerald-600) passam o gate de daltonismo em todos os pares -- sete matizes,
// uma por campo, nao passam. Classes literais porque o Tailwind le o codigo
// fonte na compilacao, igual ao `cor` de lib/secoes.ts.
interface GrupoFicha {
  nome: string
  colunas: string[]
  cor: { ponto: string; tile: string; cartao: string }
}

const GRUPOS: GrupoFicha[] = [
  {
    nome: 'Simbolismo',
    colunas: ['alegorias', 'simbolos'],
    cor: {
      ponto: 'bg-blue-600',
      tile: 'bg-blue-600 text-white',
      cartao: 'border-blue-100 bg-blue-50/40',
    },
  },
  {
    nome: 'Doutrina',
    colunas: ['juramento', 'moral', 'livro_da_lei'],
    cor: {
      ponto: 'bg-orange-600',
      tile: 'bg-orange-600 text-white',
      cartao: 'border-orange-100 bg-orange-50/40',
    },
  },
  {
    nome: 'Narrativa',
    colunas: ['personagens', 'contexto_historico'],
    cor: {
      ponto: 'bg-emerald-600',
      tile: 'bg-emerald-600 text-white',
      cartao: 'border-emerald-100 bg-emerald-50/40',
    },
  },
]

// Campo novo em lib/geral.ts que ninguem classificou cai neste grupo, com
// icone generico -- aparece na ficha em vez de sumir.
const GRUPO_PADRAO: GrupoFicha = {
  nome: 'Outros',
  colunas: [],
  cor: {
    ponto: 'bg-slate-400',
    tile: 'bg-slate-600 text-white',
    cartao: 'border-slate-200 bg-slate-50/60',
  },
}

const ICONES: Record<string, ElementType> = {
  alegorias: Sparkles,
  simbolos: Shapes,
  juramento: Scroll,
  moral: Scale,
  personagens: Users,
  livro_da_lei: BookOpen,
  contexto_historico: Landmark,
}

// Devolve o valor bruto (HTML, ver lib/geral/sanitizar.ts) quando ele tem
// conteudo visivel, e null quando esta vazio -- "<div><br></div>" de editor
// vazio nao pode contar como campo preenchido.
function conteudoDe(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null
  const bruto = String(valor)
  return paraTextoPuro(bruto) === '' ? null : bruto
}

export default function FichaGrauClient({ formulario, graus, resumos }: Props) {
  const [grauId, setGrauId] = useState('')

  const grauNome = graus.find((g) => g.id === grauId)?.nome
  const resumo = grauId ? resumos.find((r) => String(r.grau_id ?? '') === grauId) : undefined
  const campos = formulario.campos.filter((c) => !CAMPOS_OCULTOS.includes(c.coluna))

  const preenchidos = resumo ? campos.filter((c) => conteudoDe(resumo[c.coluna])).length : 0
  const porcento = campos.length === 0 ? 0 : Math.round((preenchidos / campos.length) * 100)

  const classificados = new Set(GRUPOS.flatMap((g) => g.colunas))
  const secoes = [
    ...GRUPOS.map((grupo) => ({
      grupo,
      campos: grupo.colunas
        .map((coluna) => campos.find((c) => c.coluna === coluna))
        .filter((c): c is CampoFormulario => Boolean(c)),
    })),
    { grupo: GRUPO_PADRAO, campos: campos.filter((c) => !classificados.has(c.coluna)) },
  ].filter((s) => s.campos.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ficha do Grau</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione um grau para ver a visão executiva do resumo cadastrado.
        </p>
      </div>

      <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-4">
        <Select id="grau" label="Grau" value={grauId} onChange={(e) => setGrauId(e.target.value)}>
          <option value="">Selecione…</option>
          {graus.map((g) => (
            <option key={g.id} value={g.id}>{g.nome}</option>
          ))}
        </Select>
      </div>

      {/* Placeholder tracejado: a area da ficha ja fica reservada antes da
          escolha, entao o conteudo nao "pula" quando o grau e selecionado. */}
      {!grauId && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
          <MousePointerClick className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-500">Nenhum grau selecionado</p>
          <p className="max-w-xs text-xs text-slate-400">
            Escolha um grau acima para abrir a ficha com o resumo correspondente.
          </p>
        </div>
      )}

      {grauId && (
        <div className="max-w-4xl space-y-6">
          <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Layers className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight text-slate-900">
                  {grauNome}
                </h2>
                <p className="text-xs text-slate-500">Visão executiva do Resumo</p>
              </div>
            </div>

            {/* Medidor: preenchimento sobre trilha do mesmo azul, um passo mais
                claro -- o estado se le na barra inteira, nao so na parte cheia. */}
            {resumo && (
              <div className="w-full sm:w-52">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-slate-500">Preenchimento</span>
                  <span className="text-xs font-medium text-slate-700">
                    {preenchidos} de {campos.length}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${porcento}%` }} />
                </div>
              </div>
            )}
          </header>

          {!resumo ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
              <FileQuestion className="h-5 w-5 text-slate-400" />
              <p className="text-sm text-slate-500">Nenhum resumo cadastrado para este grau.</p>
              <p className="text-xs text-slate-400">
                Cadastre em Formulários › Resumo, informando este grau.
              </p>
            </div>
          ) : (
            secoes.map(({ grupo, campos: camposGrupo }) => {
              const cheios = camposGrupo.filter((c) => conteudoDe(resumo[c.coluna])).length

              return (
                <section key={grupo.nome}>
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${grupo.cor.ponto}`} />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {grupo.nome}
                    </h3>
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">
                      {cheios}/{camposGrupo.length}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {camposGrupo.map((campo) => {
                      const Icone = ICONES[campo.coluna] ?? FileText
                      const texto = conteudoDe(resumo[campo.coluna])
                      const longo = campo.tipo === 'texto_longo'

                      return (
                        <article
                          key={campo.coluna}
                          className={`rounded-xl border p-4 ${grupo.cor.cartao} ${longo ? 'sm:col-span-2' : ''}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${grupo.cor.tile}`}
                            >
                              <Icone className="h-4 w-4" />
                            </span>
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {campo.nome}
                            </h4>
                          </div>
                          {texto === null ? (
                            <p className="mt-3 text-sm leading-relaxed text-slate-400">
                              Não informado
                            </p>
                          ) : /<[a-z]/i.test(texto) ? (
                            // Ja sanitizado no servidor, em listarFormulario.
                            // As variantes b/i/u sao explicitas para o estilo
                            // nao depender do preflight do Tailwind.
                            <div
                              className="mt-3 text-sm leading-relaxed text-slate-900 [&_b]:font-semibold [&_strong]:font-semibold [&_i]:italic [&_em]:italic [&_u]:underline"
                              dangerouslySetInnerHTML={{ __html: texto }}
                            />
                          ) : (
                            // Registro antigo, gravado antes do editor: texto
                            // puro, entao as quebras de linha ainda importam.
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                              {texto}
                            </p>
                          )}
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
