import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FORMULARIOS } from '@/lib/geral'
import { listarFormulario, listarOpcoes } from '@/lib/geral/repositorio'
import FichaGrauClient from '@/components/geral/FichaGrauClient'

export default async function FichaGrauPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const formularioResumo = FORMULARIOS.find((f) => f.slug === 'resumo')!

  const [graus, resumos] = await Promise.all([
    listarOpcoes(supabase, 'graus'),
    listarFormulario(supabase, formularioResumo),
  ])

  return <FichaGrauClient formulario={formularioResumo} graus={graus} resumos={resumos} />
}
