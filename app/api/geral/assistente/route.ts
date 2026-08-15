import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getPerfil } from '@/lib/auth/permissions'
import {
  FERRAMENTAS,
  MAX_CARACTERES,
  MAX_MENSAGENS,
  MAX_TOKENS,
  MAX_VOLTAS,
  MODELO,
  executarFerramenta,
  montarSystem,
} from '@/lib/geral/assistente'

// Streaming: a resposta sai token a token, entao a rota nao pode ser cacheada
// nem pre-renderizada.
export const dynamic = 'force-dynamic'

interface MensagemCliente {
  papel: 'user' | 'assistant'
  texto: string
}

/** Uma linha JSON por evento -- o cliente le com split('\n'). */
type Evento =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'ferramenta'; valor: string }
  | { tipo: 'erro'; valor: string }

// Qualquer pessoa logada conversa; a leitura vai pelo client de sessao, entao
// a RLS decide o que cada uma enxerga. Nao existe verbo de escrita aqui.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const chave = process.env.ANTHROPIC_API_KEY
  if (!chave) {
    return Response.json(
      { error: 'Assistente não configurado: falta ANTHROPIC_API_KEY no servidor.' },
      { status: 503 }
    )
  }

  const body = (await request.json()) as { mensagens?: unknown }
  const mensagens = normalizar(body.mensagens)
  if (mensagens.length === 0) {
    return Response.json({ error: 'Envie uma pergunta.' }, { status: 400 })
  }

  const perfil = await getPerfil(supabase, user.id)
  const anthropic = new Anthropic({ apiKey: chave })

  const historico: Anthropic.MessageParam[] = mensagens.map((m) => ({
    role: m.papel,
    content: m.texto,
  }))

  const encoder = new TextEncoder()
  const fluxo = new ReadableStream({
    async start(controller) {
      const enviar = (evento: Evento) =>
        controller.enqueue(encoder.encode(JSON.stringify(evento) + '\n'))

      try {
        for (let volta = 0; volta < MAX_VOLTAS; volta++) {
          const stream = anthropic.messages.stream({
            model: MODELO,
            max_tokens: MAX_TOKENS,
            system: montarSystem(perfil.nome, perfil.papel === 'admin'),
            // Adaptativo com esforco baixo: e conversa sobre cadastro, nao um
            // problema dificil. Desligar o raciocinio deixaria o modelo menos
            // propenso a chamar a ferramenta, que e o que ancora a resposta.
            thinking: { type: 'adaptive' },
            output_config: { effort: 'low' },
            tools: FERRAMENTAS,
            messages: historico,
          })

          stream.on('text', (delta) => enviar({ tipo: 'texto', valor: delta }))
          const resposta = await stream.finalMessage()

          if (resposta.stop_reason === 'refusal') {
            enviar({
              tipo: 'erro',
              valor: 'O modelo recusou responder a esta solicitação. Reformule a pergunta.',
            })
            break
          }

          if (resposta.stop_reason !== 'tool_use') break

          // O turno do assistente volta inteiro (inclusive blocos de raciocinio),
          // sem editar: a API rejeita continuacao com bloco alterado.
          historico.push({ role: 'assistant', content: resposta.content })

          const resultados: Anthropic.ToolResultBlockParam[] = []
          for (const bloco of resposta.content) {
            if (bloco.type !== 'tool_use') continue
            const r = await executarFerramenta(supabase, bloco.name, bloco.input)
            enviar({ tipo: 'ferramenta', valor: r.rotulo })
            resultados.push({
              type: 'tool_result',
              tool_use_id: bloco.id,
              content: r.conteudo,
              is_error: r.erro,
            })
          }

          historico.push({ role: 'user', content: resultados })
        }
      } catch (e) {
        // A chave da API nao pode vazar para a tela em nenhuma hipotese: o
        // detalhe do erro fica no log do servidor, o usuario ve o resumo.
        console.error('[assistente]', e)
        enviar({ tipo: 'erro', valor: 'Falha ao falar com o modelo. Tente de novo.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(fluxo, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      // Sem isto o proxy da frente segura os pedacos e a resposta chega de uma vez.
      'X-Accel-Buffering': 'no',
    },
  })
}

// O corpo vem do navegador, entao nada dele e confiavel: so os dois papeis
// validos passam, o texto e cortado e a conversa e limitada as ultimas voltas.
function normalizar(bruto: unknown): MensagemCliente[] {
  if (!Array.isArray(bruto)) return []

  const limpas: MensagemCliente[] = []
  for (const item of bruto) {
    const papel = (item as MensagemCliente)?.papel
    const texto = (item as MensagemCliente)?.texto
    if (papel !== 'user' && papel !== 'assistant') continue
    if (typeof texto !== 'string' || texto.trim() === '') continue
    limpas.push({ papel, texto: texto.trim().slice(0, MAX_CARACTERES) })
  }

  const recentes = limpas.slice(-MAX_MENSAGENS)

  // A API exige que a conversa comece por 'user'; cortar pelo fim pode deixar
  // uma resposta do assistente na frente.
  while (recentes.length > 0 && recentes[0].papel === 'assistant') recentes.shift()

  return recentes
}
