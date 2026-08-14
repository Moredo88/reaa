import { notFound } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { LISTAS } from '@/lib/geral'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'

export function generateStaticParams() {
  return LISTAS.map((l) => ({ slug: l.slug }))
}

export default async function ParametroPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lista = LISTAS.find((l) => l.slug === slug)
  if (!lista) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{lista.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">Lista de parâmetros: {lista.nome}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="Gestão da lista em construção"
          description="A tela para editar estes valores ainda não foi publicada. Os valores cadastrados na planilha original estão listados abaixo."
          icon={<SlidersHorizontal className="h-10 w-10" />}
        />

        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-5">
          {lista.valores.map((valor) => (
            <Badge key={valor} className="bg-slate-100 text-slate-700">
              {valor}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
