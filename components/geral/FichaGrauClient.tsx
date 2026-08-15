'use client'

import { useState } from 'react'
import { Layers, MousePointerClick, FileQuestion } from 'lucide-react'
import Select from '@/components/ui/Select'
import type { Formulario } from '@/lib/geral'
import type { OpcaoRef } from '@/lib/geral/repositorio'

interface Props {
  formulario: Formulario
  graus: OpcaoRef[]
  resumos: Record<string, unknown>[]
}

// Grau ja aparece no cabecalho da ficha; o resto dos campos do Resumo entra
// na visao executiva, na mesma ordem definida em lib/geral.ts.
const CAMPOS_OCULTOS = ['grau_id']

function textoDe(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null
  const texto = String(valor).trim()
  return texto === '' ? null : texto
}

export default function FichaGrauClient({ formulario, graus, resumos }: Props) {
  const [grauId, setGrauId] = useState('')

  const grauNome = graus.find((g) => g.id === grauId)?.nome
  const resumo = grauId ? resumos.find((r) => String(r.grau_id ?? '') === grauId) : undefined
  const campos = formulario.campos.filter((c) => !CAMPOS_OCULTOS.includes(c.coluna))
  const preenchidos = resumo ? campos.filter((c) => textoDe(resumo[c.coluna])).length : 0

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
        <section className="max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white">
          <header className="flex items-center gap-3 border-b border-slate-200 bg-blue-50/50 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold tracking-tight text-slate-900">
                {grauNome}
              </h2>
              <p className="text-xs text-slate-500">Visão executiva do Resumo</p>
            </div>
            {resumo && (
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {preenchidos} de {campos.length} campos
              </span>
            )}
          </header>

          {!resumo ? (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <FileQuestion className="h-5 w-5 text-slate-400" />
              <p className="text-sm text-slate-500">Nenhum resumo cadastrado para este grau.</p>
              <p className="text-xs text-slate-400">
                Cadastre em Formulários › Resumo, informando este grau.
              </p>
            </div>
          ) : (
            <dl className="divide-y divide-slate-100 px-6">
              {campos.map((campo) => {
                const texto = textoDe(resumo[campo.coluna])
                const longo = campo.tipo === 'texto_longo'

                return (
                  <div
                    key={campo.coluna}
                    className={
                      longo
                        ? 'py-4'
                        : 'grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-4'
                    }
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {campo.nome}
                    </dt>
                    <dd
                      className={
                        longo
                          ? 'mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700'
                          : 'text-sm text-slate-900'
                      }
                    >
                      {texto ?? <span className="text-slate-300">Não informado</span>}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}
        </section>
      )}
    </div>
  )
}
