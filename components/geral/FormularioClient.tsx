'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import type { Formulario } from '@/lib/geral'
import type { OpcaoRef } from '@/lib/geral/repositorio'

type ValoresForm = Record<string, string>

interface Props {
  formulario: Formulario
  registros: Record<string, unknown>[]
  opcoes: Record<string, OpcaoRef[]>
  podeEditar: boolean
}

function valoresIniciais(formulario: Formulario, registro?: Record<string, unknown>): ValoresForm {
  const valores: ValoresForm = {}
  for (const campo of formulario.campos) {
    const bruto = registro?.[campo.coluna]
    valores[campo.coluna] = bruto === null || bruto === undefined ? '' : String(bruto)
  }
  return valores
}

function valorExibicao(formulario: Formulario, registro: Record<string, unknown>, coluna: string) {
  const campo = formulario.campos.find((c) => c.coluna === coluna)
  if (!campo) return '—'

  if (campo.tipo === 'lista' || campo.tipo === 'formulario') {
    const ref = registro[campo.refTabela as string] as { nome: string } | null
    return ref?.nome ?? '—'
  }

  const valor = registro[coluna]
  if (valor === null || valor === undefined || valor === '') return '—'
  if (campo.tipo === 'data') return formatDate(String(valor))
  return String(valor)
}

// CRUD generico para os 5 formularios (Obreiros, Notes, Eventos, Cobridor,
// Resumo): os campos e seus tipos vem de lib/geral.ts, entao a mesma tela
// serve pra todos sem repetir JSX por entidade.
export default function FormularioClient({ formulario, registros, opcoes, podeEditar }: Props) {
  const [form, setForm] = useState<{ id: string | null; valores: ValoresForm } | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  function abrirNovo() {
    setErro('')
    setForm({ id: null, valores: valoresIniciais(formulario) })
  }

  function abrirEdicao(registro: Record<string, unknown>) {
    setErro('')
    setForm({ id: String(registro.id), valores: valoresIniciais(formulario, registro) })
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSalvando(true)
    setErro('')

    const novo = form.id === null
    const url = novo
      ? `/api/geral/formularios/${formulario.tabela}`
      : `/api/geral/formularios/${formulario.tabela}/${form.id}`
    const r = await fetch(url, {
      method: novo ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.valores),
    })
    const json = await r.json()

    setSalvando(false)
    if (!r.ok) {
      setErro(json.error ?? 'Não foi possível salvar.')
      return
    }
    setForm(null)
    router.refresh()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este registro? A ação não pode ser desfeita.')) return

    const r = await fetch(`/api/geral/formularios/${formulario.tabela}/${id}`, { method: 'DELETE' })
    const json = await r.json()
    if (!r.ok) {
      setErro(json.error ?? 'Não foi possível excluir.')
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{formulario.nome}</h1>
          <p className="mt-1 text-sm text-slate-500">Formulário de {formulario.nome}</p>
        </div>
        {podeEditar && (
          <Button onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-start justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro('')}
            className="cursor-pointer text-red-400 hover:text-red-600"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {form && (
        <form onSubmit={salvar} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            {form.id === null ? `Novo registro em ${formulario.nome}` : 'Editando registro'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {formulario.campos.map((campo) => {
              const valor = form.valores[campo.coluna]
              const atualizar = (v: string) =>
                setForm({ ...form, valores: { ...form.valores, [campo.coluna]: v } })

              if (campo.tipo === 'texto_longo') {
                return (
                  <div key={campo.coluna} className="sm:col-span-2">
                    <Textarea
                      id={campo.coluna}
                      label={campo.nome}
                      value={valor}
                      onChange={(e) => atualizar(e.target.value)}
                      required={campo.obrigatorio}
                    />
                  </div>
                )
              }

              if (campo.tipo === 'lista' || campo.tipo === 'formulario') {
                return (
                  <Select
                    key={campo.coluna}
                    id={campo.coluna}
                    label={campo.nome}
                    value={valor}
                    onChange={(e) => atualizar(e.target.value)}
                    required={campo.obrigatorio}
                  >
                    <option value="">Selecione…</option>
                    {(opcoes[campo.refTabela as string] ?? []).map((o) => (
                      <option key={o.id} value={o.id}>{o.nome}</option>
                    ))}
                  </Select>
                )
              }

              return (
                <Input
                  key={campo.coluna}
                  id={campo.coluna}
                  label={campo.nome}
                  type={campo.tipo === 'numero' || campo.tipo === 'ano' ? 'number' : campo.tipo === 'data' ? 'date' : 'text'}
                  value={valor}
                  onChange={(e) => atualizar(e.target.value)}
                  required={campo.obrigatorio}
                />
              )
            })}
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={salvando}>Salvar</Button>
            <Button type="button" variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {registros.length === 0 ? (
          <EmptyState title="Nenhum registro cadastrado" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                {formulario.campos.map((campo) => (
                  <th key={campo.coluna} className="px-4 py-3 font-semibold">{campo.nome}</th>
                ))}
                {podeEditar && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((registro) => (
                <tr key={String(registro.id)} className="hover:bg-slate-50">
                  {formulario.campos.map((campo) => (
                    <td key={campo.coluna} className="px-4 py-3 text-slate-900">
                      {valorExibicao(formulario, registro, campo.coluna)}
                    </td>
                  ))}
                  {podeEditar && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(registro)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluir(String(registro.id))}
                        aria-label="Excluir registro"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
