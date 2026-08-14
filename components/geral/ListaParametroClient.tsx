'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from './DataTable'
import type { ListaParametro } from '@/lib/geral'
import type { OpcaoRef } from '@/lib/geral/repositorio'

interface Props {
  lista: ListaParametro
  registros: OpcaoRef[]
  podeEditar: boolean
}

// CRUD generico para as 4 listas de parametros (Corpo, Graus, Agenda,
// Cargos): todas tem o mesmo formato, so nome. So admin ve os controles
// de edicao -- quem so pode ler nem enxerga os botoes.
export default function ListaParametroClient({ lista, registros, podeEditar }: Props) {
  const [form, setForm] = useState<{ id: string | null; nome: string } | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSalvando(true)
    setErro('')

    const novo = form.id === null
    const url = novo
      ? `/api/geral/parametros/${lista.tabela}`
      : `/api/geral/parametros/${lista.tabela}/${form.id}`
    const r = await fetch(url, {
      method: novo ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: form.nome }),
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

  async function excluir(registro: OpcaoRef) {
    if (!confirm(`Excluir "${registro.nome}"? A ação não pode ser desfeita.`)) return

    const r = await fetch(`/api/geral/parametros/${lista.tabela}/${registro.id}`, {
      method: 'DELETE',
    })
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{lista.nome}</h1>
          <p className="mt-1 text-sm text-slate-500">Lista de parâmetros: {lista.nome}</p>
        </div>
        {podeEditar && (
          <Button onClick={() => { setErro(''); setForm({ id: null, nome: '' }) }}>
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
            {form.id === null ? `Novo item em ${lista.nome}` : 'Editando item'}
          </h2>

          <Input
            id="nome"
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />

          <div className="flex gap-2">
            <Button type="submit" loading={salvando}>Salvar</Button>
            <Button type="button" variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <DataTable
          colunas={[{ chave: 'nome', rotulo: 'Nome', valor: (r: OpcaoRef) => r.nome }]}
          registros={registros}
          chaveLinha={(r) => r.id}
          vazio="Nenhum item cadastrado"
          acoes={
            podeEditar
              ? (r) => (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setErro(''); setForm({ id: r.id, nome: r.nome }) }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => excluir(r)} aria-label={`Excluir ${r.nome}`}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                )
              : undefined
          }
        />
      </div>
    </div>
  )
}
