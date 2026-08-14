import { redirect } from 'next/navigation'
import { Users, CalendarDays, UserMinus, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { carregarDashboard } from '@/lib/geral/dashboard'
import CartaoNumero from '@/components/geral/CartaoNumero'
import GraficoBarras from '@/components/geral/GraficoBarras'

export default async function DashboardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const d = await carregarDashboard(supabase)

  // Dimensao com um unico valor nao vira grafico: uma barra sozinha nao
  // permite comparacao nenhuma. Vira linha de contexto no rodape.
  const contexto = [
    d.contexto.corpos.length === 1 ? `Corpo: ${d.contexto.corpos[0]}` : null,
    d.contexto.anos.length === 1 ? `Ano: ${d.contexto.anos[0]}` : null,
    d.contexto.agendas.length === 1 ? `Agenda: ${d.contexto.agendas[0]}` : null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
        <p className="mt-1 text-sm text-slate-500">
          Números dos cadastros de Obreiros e Eventos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoNumero rotulo="Obreiros" valor={d.totalObreiros} icon={Users} />
        <CartaoNumero rotulo="Eventos" valor={d.totalEventos} icon={CalendarDays} />
        <CartaoNumero
          rotulo="Obreiros sem evento"
          valor={d.obreirosSemEvento.length}
          detalhe="Nenhum evento registrado"
          icon={UserMinus}
        />
        <CartaoNumero
          rotulo="Graus com atividade"
          valor={d.grausComAtividade}
          detalhe="Graus que aparecem em eventos"
          icon={Layers}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GraficoBarras
          titulo="Eventos por grau"
          subtitulo="Quantidade de eventos registrados em cada grau"
          fatias={d.eventosPorGrau}
          unidade="evento(s)"
        />
        <GraficoBarras
          titulo="Eventos por data"
          subtitulo="Em ordem cronológica"
          fatias={d.eventosPorData}
          unidade="evento(s)"
        />
        <GraficoBarras
          titulo="Obreiros por cargo"
          subtitulo="Distribuição do quadro"
          fatias={d.obreirosPorCargo}
          unidade="obreiro(s)"
        />
        <GraficoBarras
          titulo="Registros por cadastro"
          subtitulo="Quanto já foi preenchido em cada formulário"
          fatias={d.registrosPorCadastro}
          unidade="registro(s)"
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Obreiros sem evento registrado</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Constam no quadro, mas ainda não aparecem em nenhum evento.
        </p>
        {d.obreirosSemEvento.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Todos os obreiros têm ao menos um evento.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {d.obreirosSemEvento.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate text-slate-900">{o.nome}</span>
                <span className="shrink-0 text-xs text-slate-500">{o.cargo}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {contexto.length > 0 && (
        <p className="text-xs text-slate-400">
          Hoje todos os registros compartilham: {contexto.join(' · ')}. Quando houver mais de um
          valor, cada um vira um gráfico próprio.
        </p>
      )}
    </div>
  )
}
