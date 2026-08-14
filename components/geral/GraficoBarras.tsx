import type { Fatia } from '@/lib/geral/dashboard'

interface Props {
  titulo: string
  subtitulo?: string
  fatias: Fatia[]
  /** Sufixo do rotulo no tooltip nativo (ex.: "evento"/"eventos"). */
  unidade?: string
  vazio?: string
}

// Barras horizontais de serie unica: o trabalho do leitor e comparar
// magnitude, entao uma cor so (sem legenda) e o rotulo direto na ponta.
// Sem gridline: com valor na ponta ela seria tinta sem informacao.
export default function GraficoBarras({ titulo, subtitulo, fatias, unidade = '', vazio }: Props) {
  const maximo = Math.max(...fatias.map((f) => f.valor), 0)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
      {subtitulo && <p className="mt-0.5 text-xs text-slate-500">{subtitulo}</p>}

      {fatias.length === 0 || maximo === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{vazio ?? 'Sem dados ainda.'}</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {fatias.map((fatia) => {
            const porcento = maximo === 0 ? 0 : (fatia.valor / maximo) * 100
            return (
              // Tres colunas: a barra tem a trilha 1fr so pra ela, entao a
              // largura em % fica proporcional de verdade. Num flex junto do
              // numero ela encolheria, e barras maiores encolheriam mais.
              <li
                key={fatia.rotulo}
                className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3"
              >
                <span className="truncate text-xs text-slate-600" title={fatia.rotulo}>
                  {fatia.rotulo}
                </span>
                <div
                  className="h-5 rounded-r bg-blue-600"
                  style={{ width: `${Math.max(porcento, fatia.valor > 0 ? 2 : 0)}%` }}
                  title={`${fatia.rotulo}: ${fatia.valor}${unidade ? ` ${unidade}` : ''}`}
                />
                <span className="text-right text-xs font-medium tabular-nums text-slate-700">
                  {fatia.valor}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
