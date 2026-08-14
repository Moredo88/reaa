import { clsx } from 'clsx'
import type { Secao } from '@/lib/secoes'
import SidebarNavLink from './SidebarNavLink'

// Um bloco por area (Simbolica, Superiores), cada um com a cor definida em
// lib/secoes.ts. `secoes` ja chega filtrada pelo layout: so o que o membro pode ver.
export default function Sidebar({ secoes }: { secoes: Secao[] }) {
  if (secoes.length === 0) return null

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:block">
      <div className="space-y-4 p-4">
        {secoes.map((secao) => {
          const Icone = secao.icon

          return (
            <div
              key={secao.area}
              className={clsx('rounded-xl border border-t-4 border-slate-200', secao.cor.borda)}
            >
              <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
                <div
                  className={clsx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    secao.cor.icone
                  )}
                >
                  <Icone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className={clsx('text-sm font-bold tracking-tight', secao.cor.titulo)}>
                    {secao.titulo}
                  </h2>
                  <p className="text-xs text-slate-500">{secao.subtitulo}</p>
                </div>
              </div>

              <div className="p-2">
                {secao.modulos.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-400">Nenhuma tela publicada</p>
                ) : (
                  <nav className="space-y-1">
                    {secao.modulos.map((modulo) => (
                      <SidebarNavLink
                        key={modulo.href}
                        href={modulo.href}
                        nome={modulo.nome}
                        hoverClass={secao.cor.hover}
                      />
                    ))}
                  </nav>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
