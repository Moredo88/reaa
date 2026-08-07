import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'
import { listarUsuarios } from '@/lib/admin/usuarios'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const perfil = await getPerfil(supabase, user.id)
  if (perfil.papel !== 'admin') redirect('/')

  // A lista vem pronta do servidor. O cliente so cuida das mutacoes e chama
  // router.refresh() depois de cada uma.
  const usuarios = await listarUsuarios()

  return <UsuariosClient meuId={user.id} usuarios={usuarios} />
}
