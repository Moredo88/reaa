'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, Square, Trash2, X } from 'lucide-react'
import { clsx } from 'clsx'
import Button from '@/components/ui/Button'

interface Mensagem {
  papel: 'user' | 'assistant'
  texto: string
}

const SUGESTOES = [
  'Quantos obreiros estão cadastrados?',
  'Liste os eventos por grau.',
  'Quais obreiros ainda não têm evento registrado?',
  'Resuma o que está cadastrado no grau 3.',
]

// Conversa com o assistente. O historico vive so nesta tela: cada pergunta
// manda a conversa inteira para /api/geral/assistente, que e quem fala com o
// modelo -- a chave da API nunca chega ao navegador.
export default function AssistenteClient({ nome }: { nome: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [pergunta, setPergunta] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [ferramenta, setFerramenta] = useState('')
  const [erro, setErro] = useState('')
  const fim = useRef<HTMLDivElement>(null)
  const abortar = useRef<AbortController | null>(null)

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, ferramenta])

  async function perguntar(texto: string) {
    const limpo = texto.trim()
    if (limpo === '' || carregando) return

    const historico: Mensagem[] = [...mensagens, { papel: 'user', texto: limpo }]
    setMensagens([...historico, { papel: 'assistant', texto: '' }])
    setPergunta('')
    setErro('')
    setCarregando(true)

    const controller = new AbortController()
    abortar.current = controller

    try {
      const r = await fetch('/api/geral/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: historico }),
        signal: controller.signal,
      })

      if (!r.ok || !r.body) {
        const json = await r.json().catch(() => ({}))
        throw new Error(json.error ?? 'Não foi possível falar com o assistente.')
      }

      const leitor = r.body.getReader()
      const decoder = new TextDecoder()
      let resto = ''

      while (true) {
        const { done, value } = await leitor.read()
        if (done) break

        // O chunk pode partir uma linha no meio: o pedaco sem \n final fica
        // guardado para juntar com o comeco do proximo chunk.
        resto += decoder.decode(value, { stream: true })
        const linhas = resto.split('\n')
        resto = linhas.pop() ?? ''

        for (const linha of linhas) {
          if (linha.trim() === '') continue
          const evento = JSON.parse(linha) as { tipo: string; valor: string }

          if (evento.tipo === 'texto') {
            setFerramenta('')
            setMensagens((atual) => acrescentar(atual, evento.valor))
          } else if (evento.tipo === 'ferramenta') {
            setFerramenta(evento.valor)
          } else if (evento.tipo === 'erro') {
            setErro(evento.valor)
          }
        }
      }
    } catch (e) {
      // Cancelar e uma acao do usuario, nao um erro: o texto parcial fica na tela.
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        setErro(e instanceof Error ? e.message : 'Falha inesperada.')
      }
    } finally {
      abortar.current = null
      setCarregando(false)
      setFerramenta('')
      // Turno sem nenhum texto (erro logo na primeira volta) nao deve deixar
      // um balao vazio para tras.
      setMensagens((atual) =>
        atual.filter((m, i) => !(i === atual.length - 1 && m.papel === 'assistant' && m.texto === ''))
      )
    }
  }

  function limpar() {
    abortar.current?.abort()
    setMensagens([])
    setErro('')
  }

  const vazio = mensagens.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assistente</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pergunte sobre os cadastros do REAA. As respostas são lidas dos dados que você
            já tem acesso.
          </p>
        </div>
        {!vazio && (
          <Button variant="outline" size="sm" onClick={limpar}>
            <Trash2 className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-start justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro('')}
            className="cursor-pointer text-red-400 hover:text-red-600"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="min-h-[24rem] space-y-4 overflow-y-auto p-6">
          {vazio ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">
                {nome ? `Olá, ${nome}. ` : ''}Comece por uma destas perguntas:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => perguntar(s)}
                    className="cursor-pointer rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            mensagens.map((m, i) => (
              <div
                key={i}
                className={clsx('flex', m.papel === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={clsx(
                    'max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm',
                    m.papel === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-800'
                  )}
                >
                  {m.texto || <span className="text-slate-400">Pensando…</span>}
                </div>
              </div>
            ))
          )}

          {ferramenta && (
            <p className="text-xs text-slate-400">Consultando {ferramenta}…</p>
          )}
          <div ref={fim} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            perguntar(pergunta)
          }}
          className="flex items-end gap-2 border-t border-slate-100 p-4"
        >
          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={(e) => {
              // Enter envia; Shift+Enter quebra linha, como em qualquer chat.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                perguntar(pergunta)
              }
            }}
            rows={2}
            placeholder="Escreva sua pergunta…"
            aria-label="Pergunta"
            className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {carregando ? (
            <Button type="button" variant="outline" onClick={() => abortar.current?.abort()}>
              <Square className="h-4 w-4" />
              Parar
            </Button>
          ) : (
            <Button type="submit" disabled={pergunta.trim() === ''}>
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          )}
        </form>
      </div>

      <p className="text-xs text-slate-400">
        O assistente apenas lê os cadastros. Cadastro, edição e exclusão continuam nas telas de
        Formulários e Parâmetros.
      </p>
    </div>
  )
}

function acrescentar(mensagens: Mensagem[], delta: string): Mensagem[] {
  const ultima = mensagens[mensagens.length - 1]
  if (!ultima || ultima.papel !== 'assistant') {
    return [...mensagens, { papel: 'assistant', texto: delta }]
  }
  return [...mensagens.slice(0, -1), { ...ultima, texto: ultima.texto + delta }]
}
