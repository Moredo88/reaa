import { redirect } from 'next/navigation'
import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPerfil, podeVer } from '@/lib/auth/permissions'
import { SECOES } from '@/lib/secoes'
import BlocoSecao from '@/components/home/BlocoSecao'
import EmptyState from '@/components/ui/EmptyState'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const perfil = await getPerfil(supabase, user.id)

  // Bloco de area a que o membro nao tem acesso nao aparece: nem o conteudo,
  // nem o titulo. Quem tem as duas ve os dois lado a lado.
  const visiveis = SECOES.filter((secao) => podeVer(perfil, secao.area))

  if (visiveis.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-6">
        <EmptyState
          title="Sem acesso liberado"
          description="Seu cadastro ainda não foi vinculado à Simbólica nem aos Superiores. Procure um administrador."
          icon={<Lock className="h-10 w-10" />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Início</h1>
        <p className="mt-1 text-sm text-slate-500">
          {visiveis.length === 2
            ? 'Escolha a área com que deseja trabalhar.'
            : `Área liberada para você: ${visiveis[0].titulo}.`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {visiveis.map((secao) => (
          <BlocoSecao key={secao.area} secao={secao} />
        ))}
      </div>
    </div>
  )
}
