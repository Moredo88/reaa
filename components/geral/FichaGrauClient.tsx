'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
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

export default function FichaGrauClient({ formulario, graus, resumos }: Props) {
  const [grauId, setGrauId] = useState('')

  const grauNome = graus.find((g) => g.id === grauId)?.nome
  const resumo = grauId ? resumos.find((r) => String(r.grau_id ?? '') === grauId) : undefined
  const campos = formulario.campos.filter((c) => !CAMPOS_OCULTOS.includes(c.coluna))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ficha do Grau</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione um grau para ver a visão executiva do resumo cadastrado.
        </p>
      </div>

      <div className="max-w-xs">
        <Select id="grau" label="Grau" value={grauId} onChange={(e) => setGrauId(e.target.value)}>
          <option value="">Selecione…</option>
          {graus.map((g) => (
            <option key={g.id} value={g.id}>{g.nome}</option>
          ))}
        </Select>
      </div>

      {grauId && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{grauNome}</h2>
              <p className="text-xs text-slate-500">Visão executiva do Resumo</p>
            </div>
          </div>

          {!resumo ? (
            <p className="mt-4 text-sm text-slate-400">Nenhum resumo cadastrado para este grau.</p>
          ) : (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {campos.map((campo) => {
                const valor = resumo[campo.coluna]
                const texto = valor === null || valor === undefined || valor === '' ? '—' : String(valor)
                return (
                  <div key={campo.coluna} className={campo.tipo === 'texto_longo' ? 'sm:col-span-2' : ''}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {campo.nome}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{texto}</dd>
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
