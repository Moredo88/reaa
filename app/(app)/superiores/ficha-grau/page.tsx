import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil, podeVer } from '@/lib/auth/permissions'
import { carregarFichaGrau, GRAUS_SUPERIORES } from '@/lib/geral/ficha-grau'
import FichaGrauClient from '@/components/geral/FichaGrauClient'

export default async function FichaGrauSuperioresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // O menu lateral ja esconde a area de quem nao tem acesso, mas esconder nao
  // e proteger: a checagem tem que estar em quem renderiza a pagina.
  const perfil = await getPerfil(supabase, user.id)
  if (!podeVer(perfil, 'superiores')) redirect('/')

  const { formulario, graus, resumos } = await carregarFichaGrau(supabase, GRAUS_SUPERIORES)

  return (
    <FichaGrauClient
      formulario={formulario}
      graus={graus}
      resumos={resumos}
      contexto="Superiores — graus 4 a 33"
    />
  )
}
