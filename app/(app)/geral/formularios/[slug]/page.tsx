import { notFound } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { FORMULARIOS } from '@/lib/geral'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'

export function generateStaticParams() {
  return FORMULARIOS.map((f) => ({ slug: f.slug }))
}

export default async function FormularioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const formulario = FORMULARIOS.find((f) => f.slug === slug)
  if (!formulario) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{formulario.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">Formulário de {formulario.nome}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="Tela em construção"
          description="O cadastro ainda não foi publicado. Os campos previstos para este formulário estão listados abaixo."
          icon={<ClipboardList className="h-10 w-10" />}
        />

        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-5">
          {formulario.campos.map((campo) => (
            <Badge key={campo.nome} className="bg-slate-100 text-slate-700">
              {campo.nome}
              <span className="ml-1.5 font-normal text-slate-400">{campo.tipo}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
