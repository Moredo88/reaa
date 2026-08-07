'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import type { UsuarioAdmin } from '@/lib/admin/usuarios'

type Form = {
  id: string | null
  email: string
  nome: string
  password: string
  papel: 'admin' | 'membro'
  acesso_simbolica: boolean
  acesso_superiores: boolean
}

const FORM_VAZIO: Form = {
  id: null,
  email: '',
  nome: '',
  password: '',
  papel: 'membro',
  acesso_simbolica: true,
  acesso_superiores: false,
}

interface Props {
  meuId: string
  usuarios: UsuarioAdmin[]
}

export default function UsuariosClient({ meuId, usuarios }: Props) {
  const [form, setForm] = useState<Form | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSalvando(true)
    setErro('')

    const novo = form.id === null
    const r = await fetch(novo ? '/api/admin/usuarios' : `/api/admin/usuarios/${form.id}`, {
      method: novo ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
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

  async function excluir(u: UsuarioAdmin) {
    if (!confirm(`Excluir ${u.email}? A ação não pode ser desfeita.`)) return

    const r = await fetch(`/api/admin/usuarios/${u.id}`, { method: 'DELETE' })
    const json = await r.json()
    if (!r.ok) {
      setErro(json.error ?? 'Não foi possível excluir.')
      return
    }
    router.refresh()
  }

  function editar(u: UsuarioAdmin) {
    setErro('')
    setForm({
      id: u.id,
      email: u.email,
      nome: u.nome,
      password: '',
      papel: u.papel,
      acesso_simbolica: u.acesso_simbolica,
      acesso_superiores: u.acesso_superiores,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quem entra no sistema e a que áreas cada um tem acesso.
          </p>
        </div>
        <Button onClick={() => { setErro(''); setForm({ ...FORM_VAZIO }) }}>
          <Plus className="h-4 w-4" />
          Novo usuário
        </Button>
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
            {form.id === null ? 'Novo usuário' : `Editando ${form.email}`}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="nome"
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do irmão"
            />
            <Input
              id="email"
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              // O e-mail identifica o usuario no Supabase Auth e nao muda por aqui.
              disabled={form.id !== null}
              required
            />
            <Input
              id="password"
              label={form.id === null ? 'Senha' : 'Nova senha (vazio mantém a atual)'}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              required={form.id === null}
            />
            <Select
              id="papel"
              label="Papel"
              value={form.papel}
              onChange={(e) => setForm({ ...form, papel: e.target.value as Form['papel'] })}
            >
              <option value="membro">Membro</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Acesso às áreas</legend>
            {form.papel === 'admin' && (
              <p className="text-sm text-slate-500">
                Administradores enxergam as duas áreas independentemente das marcações abaixo.
              </p>
            )}
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.acesso_simbolica}
                onChange={(e) => setForm({ ...form, acesso_simbolica: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-slate-300"
              />
              Simbólica
            </label>
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.acesso_superiores}
                onChange={(e) => setForm({ ...form, acesso_superiores: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded border-slate-300"
              />
              Superiores
            </label>
          </fieldset>

          <div className="flex gap-2">
            <Button type="submit" loading={salvando}>Salvar</Button>
            <Button type="button" variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {usuarios.length === 0 ? (
          <EmptyState title="Nenhum usuário cadastrado" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Papel</th>
                <th className="px-4 py-3 font-semibold">Áreas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{u.nome || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={u.papel === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}>
                      {u.papel === 'admin' ? 'Administrador' : 'Membro'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.papel === 'admin' || u.acesso_simbolica) && (
                        <Badge className="bg-blue-100 text-blue-800">Simbólica</Badge>
                      )}
                      {(u.papel === 'admin' || u.acesso_superiores) && (
                        <Badge className="bg-red-100 text-red-800">Superiores</Badge>
                      )}
                      {u.papel !== 'admin' && !u.acesso_simbolica && !u.acesso_superiores && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => editar(u)}>
                      Editar
                    </Button>
                    {u.id !== meuId && (
                      <Button variant="ghost" size="sm" onClick={() => excluir(u)} aria-label={`Excluir ${u.email}`}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
