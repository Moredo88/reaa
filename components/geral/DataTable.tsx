'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, ListFilter } from 'lucide-react'
import { clsx } from 'clsx'
import EmptyState from '@/components/ui/EmptyState'

export interface ColunaTabela<T> {
  chave: string
  rotulo: string
  /** Texto exibido na celula; tambem usado como chave de ordenacao e de filtro. */
  valor: (registro: T) => string
}

interface Props<T> {
  colunas: ColunaTabela<T>[]
  registros: T[]
  chaveLinha: (registro: T) => string
  acoes?: (registro: T) => React.ReactNode
  vazio?: string
}

type Ordenacao = { chave: string; direcao: 'asc' | 'desc' } | null
type PosicaoPopover = { chave: string; top: number; left: number }

const LARGURA_POPOVER = 224

// Tabela generica usada nas telas de Geral (Parametros e Formularios): cada
// coluna ganha ordenacao (clique no rotulo) e filtro por selecao multipla
// (icone ao lado). O popover usa position:fixed pra nao ser cortado pelo
// overflow-x-auto do cartao que envolve a tabela.
export default function DataTable<T>({
  colunas,
  registros,
  chaveLinha,
  acoes,
  vazio = 'Nenhum registro cadastrado',
}: Props<T>) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>(null)
  const [filtros, setFiltros] = useState<Record<string, Set<string>>>({})
  const [popover, setPopover] = useState<PosicaoPopover | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!popover) return
    function aoClicarFora(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [popover])

  const opcoesPorColuna = useMemo(() => {
    const mapa: Record<string, string[]> = {}
    for (const coluna of colunas) {
      const valores = new Set(registros.map((r) => coluna.valor(r)))
      mapa[coluna.chave] = Array.from(valores).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))
    }
    return mapa
  }, [colunas, registros])

  const registrosVisiveis = useMemo(() => {
    let lista = registros.filter((registro) =>
      colunas.every((coluna) => {
        const selecionados = filtros[coluna.chave]
        if (!selecionados || selecionados.size === 0) return true
        return selecionados.has(coluna.valor(registro))
      })
    )

    if (ordenacao) {
      const coluna = colunas.find((c) => c.chave === ordenacao.chave)
      if (coluna) {
        const direcao = ordenacao.direcao
        lista = [...lista].sort((a, b) => {
          const cmp = coluna.valor(a).localeCompare(coluna.valor(b), 'pt-BR', { numeric: true })
          return direcao === 'asc' ? cmp : -cmp
        })
      }
    }

    return lista
  }, [registros, colunas, filtros, ordenacao])

  function alternarOrdenacao(chave: string) {
    setOrdenacao((atual) => {
      if (!atual || atual.chave !== chave) return { chave, direcao: 'asc' }
      if (atual.direcao === 'asc') return { chave, direcao: 'desc' }
      return null
    })
  }

  function alternarFiltro(chave: string, valor: string) {
    setFiltros((atual) => {
      const selecionados = new Set(atual[chave] ?? [])
      if (selecionados.has(valor)) selecionados.delete(valor)
      else selecionados.add(valor)
      return { ...atual, [chave]: selecionados }
    })
  }

  function limparFiltro(chave: string) {
    setFiltros((atual) => {
      const copia = { ...atual }
      delete copia[chave]
      return copia
    })
  }

  function abrirPopover(chave: string, botao: HTMLElement) {
    if (popover?.chave === chave) {
      setPopover(null)
      return
    }
    const rect = botao.getBoundingClientRect()
    const left = Math.min(rect.left, window.innerWidth - LARGURA_POPOVER - 8)
    setPopover({ chave, top: rect.bottom + 4, left: Math.max(8, left) })
  }

  if (registros.length === 0) {
    return <EmptyState title={vazio} />
  }

  const colunaPopover = colunas.find((c) => c.chave === popover?.chave)

  return (
    <>
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {colunas.map((coluna) => {
              const filtroAtivo = (filtros[coluna.chave]?.size ?? 0) > 0
              const ordenandoPor = ordenacao?.chave === coluna.chave
              return (
                <th key={coluna.chave} className="px-4 py-3 font-semibold">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => alternarOrdenacao(coluna.chave)}
                      className="flex cursor-pointer items-center gap-1 hover:text-slate-700"
                    >
                      {coluna.rotulo}
                      {ordenandoPor ? (
                        ordenacao!.direcao === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => abrirPopover(coluna.chave, e.currentTarget)}
                      className={clsx(
                        'cursor-pointer rounded p-0.5 hover:bg-slate-200',
                        filtroAtivo ? 'text-slate-900' : 'text-slate-400'
                      )}
                      aria-label={`Filtrar ${coluna.rotulo}`}
                    >
                      <ListFilter className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              )
            })}
            {acoes && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {registrosVisiveis.length === 0 ? (
            <tr>
              <td
                colSpan={colunas.length + (acoes ? 1 : 0)}
                className="px-4 py-10 text-center text-sm text-slate-400"
              >
                Nenhum registro corresponde aos filtros.
              </td>
            </tr>
          ) : (
            registrosVisiveis.map((registro) => (
              <tr key={chaveLinha(registro)} className="hover:bg-slate-50">
                {colunas.map((coluna) => (
                  <td key={coluna.chave} className="px-4 py-3 text-slate-900">
                    {coluna.valor(registro)}
                  </td>
                ))}
                {acoes && <td className="px-4 py-3 text-right whitespace-nowrap">{acoes(registro)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {popover && colunaPopover && (
        <div
          ref={popoverRef}
          style={{ top: popover.top, left: popover.left, width: LARGURA_POPOVER }}
          className="fixed z-20 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 text-sm normal-case shadow-lg"
        >
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-semibold text-slate-500">Filtrar {colunaPopover.rotulo}</span>
            {(filtros[colunaPopover.chave]?.size ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => limparFiltro(colunaPopover.chave)}
                className="cursor-pointer text-xs text-slate-500 hover:text-slate-900"
              >
                Limpar
              </button>
            )}
          </div>
          {opcoesPorColuna[colunaPopover.chave].map((valor) => (
            <label
              key={valor}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 font-normal text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={filtros[colunaPopover.chave]?.has(valor) ?? false}
                onChange={() => alternarFiltro(colunaPopover.chave, valor)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300"
              />
              <span className="truncate">{valor}</span>
            </label>
          ))}
        </div>
      )}
    </>
  )
}
