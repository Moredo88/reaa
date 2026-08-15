import type Anthropic from '@anthropic-ai/sdk'
import type { SupabaseServerClient } from '@/lib/supabase/server'
import type { Formulario } from '@/lib/geral'
import { FORMULARIOS, LISTAS } from '@/lib/geral'
import { listarFormulario, listarParametro } from '@/lib/geral/repositorio'
import { paraTextoPuro } from '@/lib/utils'

// Modelo intermediario da familia Claude: da conta das perguntas sobre esta
// base com latencia e custo bem abaixo do Opus. O nome do modelo mora aqui,
// nao espalhado pela rota, para trocar de versao num lugar so.
export const MODELO = 'claude-sonnet-5'

// Teto de saida por volta. Como a rota responde em streaming, um teto alto nao
// custa nada: ele so existe para o caso patologico de resposta sem fim.
export const MAX_TOKENS = 16000

// Voltas do laco de ferramentas. Cada volta e uma chamada ao modelo; sem teto,
// um modelo teimoso consultaria tabelas indefinidamente.
export const MAX_VOLTAS = 6

// Quanto da conversa volta para o modelo a cada pergunta. Cortar aqui e o que
// impede o custo de crescer sem limite numa conversa longa.
export const MAX_MENSAGENS = 24
export const MAX_CARACTERES = 4000

// Linhas devolvidas por consulta. Acima disso a resposta vira contexto demais
// para pouco ganho -- o total real vai junto, entao contagem continua correta.
const MAX_LINHAS = 200

type Consultavel =
  | { tabela: string; nome: string; tipo: 'formulario'; formulario: Formulario }
  | { tabela: string; nome: string; tipo: 'lista' }

// A lista permitida sai de lib/geral.ts: formulario ou parametro novo la vira
// tabela consultavel aqui sem tocar nesta funcao. Nada fora dessa lista chega
// ao banco -- o modelo escolhe entre opcoes, nao escreve uma query.
export const CONSULTAVEIS: Consultavel[] = [
  ...FORMULARIOS.map(
    (f): Consultavel => ({ tabela: f.tabela, nome: f.nome, tipo: 'formulario', formulario: f })
  ),
  ...LISTAS.map((l): Consultavel => ({ tabela: l.tabela, nome: l.nome, tipo: 'lista' })),
]

export const FERRAMENTAS: Anthropic.Tool[] = [
  {
    name: 'consultar_tabela',
    description:
      'Lê os registros de uma tabela do REAA e devolve os dados em JSON. ' +
      'Use sempre que a resposta depender dos cadastros — contagens, listagens, ' +
      'comparações, "quem", "quantos", "quais". Não responda de memória sobre os ' +
      'dados: consulte primeiro. Pode ser chamada várias vezes para cruzar tabelas.',
    input_schema: {
      type: 'object',
      properties: {
        tabela: {
          type: 'string',
          enum: CONSULTAVEIS.map((c) => c.tabela),
          description: 'Nome da tabela a consultar.',
        },
      },
      required: ['tabela'],
    },
  },
]

function descreverTabelas(): string {
  const formularios = CONSULTAVEIS.filter((c) => c.tipo === 'formulario')
    .map((c) => {
      const campos = (c as Extract<Consultavel, { tipo: 'formulario' }>).formulario.campos
        .map((campo) => campo.nome)
        .join(', ')
      return `- ${c.tabela} (${c.nome}): ${campos}`
    })
    .join('\n')

  const listas = CONSULTAVEIS.filter((c) => c.tipo === 'lista')
    .map((c) => `- ${c.tabela} (${c.nome}): Nome`)
    .join('\n')

  return `Formulários (cadastros):\n${formularios}\n\nParâmetros (listas de apoio):\n${listas}`
}

export function montarSystem(nome: string, isAdmin: boolean): string {
  return [
    'Você é o assistente do REAA, um sistema interno que organiza os cadastros do ' +
      'Rito Escocês Antigo e Aceito: obreiros, graus, corpos, eventos, notes, cobridor e resumos.',
    '',
    `Você conversa com ${nome || 'um membro'}, que tem perfil ${isAdmin ? 'de administrador' : 'de membro'}.`,
    '',
    'Tabelas disponíveis pela ferramenta consultar_tabela:',
    descreverTabelas(),
    '',
    'Como trabalhar:',
    '- Responda sempre em português do Brasil.',
    '- Se a pergunta depende dos dados cadastrados, consulte a tabela antes de responder. ' +
      'Nunca invente registros, nomes ou números.',
    '- Se a consulta vier vazia, diga que não há registros — não preencha a lacuna com suposição.',
    '- Você só lê os dados. Cadastro, edição e exclusão acontecem nas telas de Formulários e ' +
      'Parâmetros, e só administradores podem escrever. Quando o pedido for uma alteração, ' +
      'explique onde fazer.',
    '- Perguntas sobre o Rito que não dependem do banco você pode responder pelo seu ' +
      'conhecimento geral, deixando claro que não veio dos cadastros.',
    '- Seja direto e curto. Texto puro, sem markdown: nada de **negrito**, ### títulos ou tabelas ' +
      'em pipe. Para enumerar, use linhas começando com "- ".',
  ].join('\n')
}

interface ResultadoFerramenta {
  /** Rotulo mostrado na tela enquanto a consulta roda. */
  rotulo: string
  conteudo: string
  erro: boolean
}

// Le pelo client de sessao do proprio usuario, entao a RLS vale igual ao resto
// do app: o assistente nunca ve mais do que a pessoa veria na tela. Passar a
// service role key por aqui transformaria o chat num contorno da RLS.
export async function executarFerramenta(
  supabase: SupabaseServerClient,
  nome: string,
  entrada: unknown
): Promise<ResultadoFerramenta> {
  if (nome !== 'consultar_tabela') {
    return { rotulo: nome, conteudo: `Ferramenta desconhecida: ${nome}`, erro: true }
  }

  const tabela = (entrada as { tabela?: unknown })?.tabela
  const alvo = CONSULTAVEIS.find((c) => c.tabela === tabela)
  if (!alvo) {
    return {
      rotulo: String(tabela ?? '?'),
      conteudo: `Tabela inválida. Use uma destas: ${CONSULTAVEIS.map((c) => c.tabela).join(', ')}.`,
      erro: true,
    }
  }

  try {
    const linhas =
      alvo.tipo === 'formulario'
        ? (await listarFormulario(supabase, alvo.formulario)).map((registro) =>
            projetarFormulario(alvo.formulario, registro)
          )
        : (await listarParametro(supabase, alvo.tabela)).map((o) => ({ Nome: o.nome }))

    return {
      rotulo: alvo.nome,
      conteudo: JSON.stringify({
        tabela: alvo.tabela,
        total: linhas.length,
        mostrando: Math.min(linhas.length, MAX_LINHAS),
        registros: linhas.slice(0, MAX_LINHAS),
      }),
      erro: false,
    }
  } catch (e) {
    // O erro volta como tool_result para o modelo poder contornar (tentar outra
    // tabela, avisar o usuario) em vez de derrubar a conversa inteira.
    return {
      rotulo: alvo.nome,
      conteudo: `Não foi possível ler ${alvo.nome}: ${e instanceof Error ? e.message : 'erro desconhecido'}`,
      erro: true,
    }
  }
}

// Rotulo em vez de coluna, referencia resolvida pelo nome e texto sem HTML: o
// que chega ao modelo e o que a tela mostra, nao a forma crua do banco.
function projetarFormulario(
  formulario: Formulario,
  registro: Record<string, unknown>
): Record<string, string> {
  const linha: Record<string, string> = {}

  for (const campo of formulario.campos) {
    if (campo.tipo === 'lista' || campo.tipo === 'formulario') {
      const ref = registro[campo.refTabela as string] as { nome?: string } | null
      if (ref?.nome) linha[campo.nome] = paraTextoPuro(ref.nome)
      continue
    }

    const valor = registro[campo.coluna]
    if (valor === null || valor === undefined || valor === '') continue

    linha[campo.nome] =
      campo.tipo === 'texto' || campo.tipo === 'texto_longo'
        ? paraTextoPuro(String(valor))
        : String(valor)
  }

  return linha
}
