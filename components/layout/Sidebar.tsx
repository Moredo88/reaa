import { clsx } from 'clsx'
import { LayoutGrid } from 'lucide-react'
import type { Secao } from '@/lib/secoes'
import { GRUPOS_GERAL } from '@/lib/geral'
import SidebarNavLink from './SidebarNavLink'

// Um bloco por area (Simbolica, Superiores), cada um com a cor definida em
// lib/secoes.ts, mais o bloco Geral (Dashboards, Formularios, Parametros)
// sempre na frente. `secoes` ja chega filtrada pelo layout: so o que o
// membro pode ver; Geral aparece para qualquer um que esteja logado.
export default function Sidebar({ secoes }: { secoes: Secao[] }) {
  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:block">
      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-t-4 border-slate-200 border-t-slate-600">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">Geral</h2>
              <p className="text-xs text-slate-500">Dados e telas comuns</p>
            </div>
          </div>

          <div className="space-y-3 p-2">
            {GRUPOS_GERAL.map((grupo) => {
              const IconeGrupo = grupo.icon
              return (
                <div key={grupo.titulo}>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <IconeGrupo className="h-3.5 w-3.5" />
                    {grupo.titulo}
                  </div>
                  {grupo.modulos.length === 0 ? (
                    <p className="px-3 py-1 text-xs text-slate-400">Nenhuma tela publicada</p>
                  ) : (
                    <nav className="space-y-1">
                      {grupo.modulos.map((modulo) => (
                        <SidebarNavLink
                          key={modulo.href}
                          href={modulo.href}
                          nome={modulo.nome}
                          hoverClass="hover:bg-slate-50"
                        />
                      ))}
                    </nav>
                  )}
                </div>
              )
            })}
          </div>
        </div>

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
