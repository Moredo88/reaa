import type { ElementType } from 'react'

interface Props {
  rotulo: string
  valor: number
  detalhe?: string
  icon: ElementType
}

// Stat tile: um numero que se le sozinho, sem grafico. Figuras proporcionais
// (sem tabular-nums) porque e um valor grande e isolado, nao uma coluna.
export default function CartaoNumero({ rotulo, valor, detalhe, icon: Icone }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-400">
        <Icone className="h-4 w-4" />
        <span className="text-xs font-medium text-slate-500">{rotulo}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-slate-500">{detalhe}</p>}
    </div>
  )
}
