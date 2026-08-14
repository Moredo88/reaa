import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'
import { LISTAS } from '@/lib/geral'
import { listarParametro } from '@/lib/geral/repositorio'
import ListaParametroClient from '@/components/geral/ListaParametroClient'

export default async function ParametroPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const lista = LISTAS.find((l) => l.slug === slug)
  if (!lista) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const perfil = await getPerfil(supabase, user.id)
  const registros = await listarParametro(supabase, lista.tabela)

  return (
    <ListaParametroClient
      lista={lista}
      registros={registros}
      podeEditar={perfil.papel === 'admin'}
    />
  )
}
