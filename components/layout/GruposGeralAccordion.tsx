'use client'

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { Modulo } from '@/lib/secoes'
import SidebarNavLink from './SidebarNavLink'

interface GrupoGeralProps {
  titulo: string
  /** Icone do grupo ja renderizado no servidor (ElementType nao atravessa a fronteira). */
  icone: ReactNode
  modulos: Modulo[]
}

// Acha o indice do grupo que contem a rota atual, para abrir com ele em vez
// de sempre o primeiro. So roda uma vez, no mount: depois disso quem manda
// e o clique da pessoa, nao a navegacao.
function grupoInicial(grupos: GrupoGeralProps[], pathname: string) {
  const idx = grupos.findIndex((grupo) => grupo.modulos.some((modulo) => modulo.href === pathname))
  return idx === -1 ? 0 : idx
}

// So um grupo aberto por vez (Dashboards, Assistente, Formularios,
// Parametros): clicar no titulo fecha o que estava aberto e abre o outro.
export default function GruposGeralAccordion({ grupos }: { grupos: GrupoGeralProps[] }) {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(() => grupoInicial(grupos, pathname))

  return (
    <div className="space-y-1 p-2">
      {grupos.map((grupo, indice) => {
        const estaAberto = aberto === indice

        return (
          <div key={grupo.titulo}>
            <button
              type="button"
              onClick={() => setAberto(estaAberto ? -1 : indice)}
              aria-expanded={estaAberto}
              className="flex w-full items-center justify-between gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            >
              <span className="flex items-center gap-1.5">
                {grupo.icone}
                {grupo.titulo}
              </span>
              <ChevronDown
                className={clsx('h-3.5 w-3.5 shrink-0 transition-transform', estaAberto && 'rotate-180')}
              />
            </button>

            {estaAberto && (
              grupo.modulos.length === 0 ? (
                <p className="px-3 py-1 text-xs text-slate-400">Nenhuma tela publicada</p>
              ) : (
                <nav className="space-y-1 pb-1">
                  {grupo.modulos.map((modulo) => (
                    <SidebarNavLink
                      key={modulo.href}
                      href={modulo.href}
                      nome={modulo.nome}
                      hoverClass="hover:bg-slate-50"
                    />
                  ))}
                </nav>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}
