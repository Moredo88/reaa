import Link from 'next/link'
import { clsx } from 'clsx'
import { ChevronRight } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import type { Secao } from '@/lib/secoes'

// Um dos dois blocos da tela inicial. Recebe a secao inteira e so desenha:
// o que aparece dentro dele vem de lib/secoes.ts.
export default function BlocoSecao({ secao }: { secao: Secao }) {
  const Icone = secao.icon

  return (
    <section
      className={clsx(
        'flex flex-col rounded-xl border border-t-4 border-slate-200 bg-white shadow-sm',
        secao.cor.borda
      )}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div
          className={clsx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
            secao.cor.icone
          )}
        >
          <Icone className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className={clsx('text-lg font-bold tracking-tight', secao.cor.titulo)}>
            {secao.titulo}
          </h2>
          <p className="text-sm text-slate-500">{secao.subtitulo}</p>
        </div>
      </div>

      <div className="flex-1 p-4">
        {secao.modulos.length === 0 ? (
          <EmptyState
            title="Nenhuma tela publicada ainda"
            description={`As telas da ${secao.titulo} aparecem aqui assim que forem cadastradas.`}
            icon={<Icone className="h-10 w-10" />}
          />
        ) : (
          <ul className="space-y-2">
            {secao.modulos.map((modulo) => (
              <li key={modulo.href}>
                <Link
                  href={modulo.href}
                  className={clsx(
                    'flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors',
                    secao.cor.hover
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
                      {modulo.nome}
                    </span>
                    {modulo.descricao && (
                      <span className="block text-sm text-slate-500">
                        {modulo.descricao}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
