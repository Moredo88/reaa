import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'
import Header from '@/components/layout/Header'

// Tudo dentro de (app) exige sessao. O proxy ja redireciona quem nao esta
// logado; esta checagem existe porque o proxy nao substitui a verificacao
// no servidor de quem realmente renderiza a pagina.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const perfil = await getPerfil(supabase, user.id)

  return (
    <div className="flex h-full flex-col">
      <Header
        email={user.email ?? ''}
        nome={perfil.nome}
        isAdmin={perfil.papel === 'admin'}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
