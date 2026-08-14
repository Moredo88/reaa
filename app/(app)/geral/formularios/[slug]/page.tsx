import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'
import { FORMULARIOS } from '@/lib/geral'
import { listarFormulario, listarOpcoes, type OpcaoRef } from '@/lib/geral/repositorio'
import FormularioClient from '@/components/geral/FormularioClient'

export default async function FormularioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const formulario = FORMULARIOS.find((f) => f.slug === slug)
  if (!formulario) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const perfil = await getPerfil(supabase, user.id)

  const tabelasRef = [...new Set(formulario.campos.map((c) => c.refTabela).filter(Boolean))] as string[]
  const [registros, ...listasOpcoes] = await Promise.all([
    listarFormulario(supabase, formulario),
    ...tabelasRef.map((tabela) => listarOpcoes(supabase, tabela)),
  ])

  const opcoes: Record<string, OpcaoRef[]> = {}
  tabelasRef.forEach((tabela, i) => { opcoes[tabela] = listasOpcoes[i] })

  return (
    <FormularioClient
      formulario={formulario}
      registros={registros}
      opcoes={opcoes}
      podeEditar={perfil.papel === 'admin'}
    />
  )
}
