import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'
import AssistenteClient from '@/components/geral/AssistenteClient'

export default async function AssistentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const perfil = await getPerfil(supabase, user.id)

  return <AssistenteClient nome={perfil.nome} />
}
