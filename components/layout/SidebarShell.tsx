'use client'

import { useState, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface BlocoTrilha {
  chave: string
  titulo: string
  /** Quadradinho colorido do bloco, ja renderizado no servidor. */
  icone: ReactNode
}

interface SidebarShellProps {
  blocos: BlocoTrilha[]
  children: ReactNode
}

// O menu lateral abre colapsado: so a trilha de icones, um por bloco. O botao
// do topo alterna, e clicar em qualquer icone da trilha tambem expande.
// O estado vive aqui, e nao em Sidebar, para que Sidebar continue Server
// Component (os icones de lib/secoes.ts nao atravessam a fronteira como props).
export default function SidebarShell({ blocos, children }: SidebarShellProps) {
  const [colapsado, setColapsado] = useState(true)

  return (
    <aside
      className={clsx(
        'hidden shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-all duration-200 lg:block',
        colapsado ? 'w-16' : 'w-64'
      )}
    >
      <div
        className={clsx(
          'flex items-center gap-2 px-2 pt-4',
          colapsado ? 'justify-center' : 'justify-between pl-4 pr-2'
        )}
      >
        {!colapsado && (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</span>
        )}
        <button
          type="button"
          onClick={() => setColapsado((atual) => !atual)}
          title={colapsado ? 'Expandir menu' : 'Recolher menu'}
          aria-label={colapsado ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!colapsado}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          {colapsado ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {colapsado ? (
        <div className="flex flex-col items-center gap-2 px-2 py-4">
          {blocos.map((bloco) => (
            <button
              key={bloco.chave}
              type="button"
              onClick={() => setColapsado(false)}
              title={bloco.titulo}
              aria-label={`Expandir menu: ${bloco.titulo}`}
              className="rounded-xl p-1 transition-colors hover:bg-slate-100"
            >
              {bloco.icone}
            </button>
          ))}
        </div>
      ) : (
        children
      )}
    </aside>
  )
}
