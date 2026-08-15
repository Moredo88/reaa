'use client'

import { useEffect, useRef, useState, type ElementType } from 'react'
import { Bold, Italic, Underline } from 'lucide-react'
import { clsx } from 'clsx'
import { CORES_TEXTO } from '@/lib/geral/cores'

interface Props {
  id: string
  label: string
  /** HTML inicial. Lido so na montagem -- ver o comentario do useRef abaixo. */
  valorInicial: string
  onChange: (html: string) => void
  multilinha?: boolean
}

const BOTOES: { comando: string; rotulo: string; icon: ElementType }[] = [
  { comando: 'bold', rotulo: 'Negrito', icon: Bold },
  { comando: 'italic', rotulo: 'Itálico', icon: Italic },
  { comando: 'underline', rotulo: 'Sublinhado', icon: Underline },
]

// styleWithCSS so para cor. Com ele ligado, 'bold' sai como
// <span style="font-weight:bold"> em vez de <b>, e a allowlist da sanitizacao
// (que so aceita `color` em span) descartaria o negrito junto com o estilo.
function comandar(comando: string, valor?: string) {
  document.execCommand('styleWithCSS', false, String(comando === 'foreColor'))
  document.execCommand(comando, false, valor)
}

// Editor de texto com negrito, italico, sublinhado e cor. Grava HTML, que e
// sanitizado no servidor em lib/geral/sanitizar.ts antes de chegar ao banco.
export default function EditorTexto({ id, label, valorInicial, onChange, multilinha }: Props) {
  const caixa = useRef<HTMLDivElement>(null)

  // `useState` sem setter congela o valor da montagem -- por isso
  // FormularioClient da `key` ao <form>, para o editor remontar quando troca o
  // registro em edicao.
  const [inicial] = useState(valorInicial)

  // O HTML inicial entra por aqui, imperativamente, e NAO por
  // dangerouslySetInnerHTML: aquela prop recebe um objeto novo a cada render,
  // o React a trata como alterada por identidade e reaplica setInnerHTML,
  // apagando o que o usuario acabou de digitar ou formatar. Sem children e sem
  // dangerouslySetInnerHTML, o React nao gerencia o conteudo da caixa.
  useEffect(() => {
    if (caixa.current) caixa.current.innerHTML = inicial
  }, [inicial])

  return (
    <div className="flex flex-col gap-1">
      <span id={`${id}-rotulo`} className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="overflow-hidden rounded-lg border border-slate-300 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1">
          {BOTOES.map(({ comando, rotulo, icon: Icone }) => (
            <button
              key={comando}
              type="button"
              title={rotulo}
              aria-label={rotulo}
              // Sem isto o clique tira a selecao do texto antes do comando rodar.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                comandar(comando)
                if (caixa.current) onChange(caixa.current.innerHTML)
              }}
              className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            >
              <Icone className="h-3.5 w-3.5" />
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-slate-300" />

          {CORES_TEXTO.map((cor) => (
            <button
              key={cor.hex}
              type="button"
              title={cor.nome}
              aria-label={`Cor ${cor.nome}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                comandar('foreColor', cor.hex)
                if (caixa.current) onChange(caixa.current.innerHTML)
              }}
              className="cursor-pointer rounded p-1 hover:bg-slate-200"
            >
              <span
                className="block h-3.5 w-3.5 rounded-full ring-1 ring-slate-300"
                style={{ backgroundColor: cor.hex }}
              />
            </button>
          ))}
        </div>

        <div
          id={id}
          ref={caixa}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-labelledby={`${id}-rotulo`}
          aria-multiline={multilinha ? 'true' : 'false'}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className={clsx(
            'px-3 py-2 text-sm text-slate-900 focus:outline-none',
            multilinha ? 'min-h-24' : 'min-h-9'
          )}
        />
      </div>
    </div>
  )
}
