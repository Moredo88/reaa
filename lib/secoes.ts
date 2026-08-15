import type { ElementType } from 'react'
import { Compass, Crown } from 'lucide-react'

export type Area = 'simbolica' | 'superiores'

export interface Modulo {
  nome: string
  href: string
  descricao?: string
}

export interface Secao {
  area: Area
  titulo: string
  subtitulo: string
  icon: ElementType
  /** Classes das cores do bloco. Mantidas literais para o Tailwind ver na compilacao. */
  cor: {
    borda: string
    icone: string
    titulo: string
    hover: string
  }
  modulos: Modulo[]
}

// Toda a tela inicial sai daqui: para publicar uma tela nova, basta acrescentar
// um item em `modulos` e criar a rota correspondente. Nada mais precisa mudar.
export const SECOES: Secao[] = [
  {
    area: 'simbolica',
    titulo: 'Simbólica',
    subtitulo: 'Graus 1 a 3',
    icon: Compass,
    cor: {
      borda: 'border-t-blue-600',
      icone: 'bg-blue-600 text-white',
      titulo: 'text-blue-900',
      hover: 'hover:border-blue-400 hover:bg-blue-50/60',
    },
    modulos: [
      {
        nome: 'Ficha do Grau',
        href: '/simbolica/ficha-grau',
        descricao: 'Resumo executivo dos graus 1 a 3',
      },
    ],
  },
  {
    area: 'superiores',
    titulo: 'Superiores',
    subtitulo: 'Graus 4 a 33',
    icon: Crown,
    cor: {
      borda: 'border-t-red-700',
      icone: 'bg-red-700 text-white',
      titulo: 'text-red-900',
      hover: 'hover:border-red-400 hover:bg-red-50/60',
    },
    modulos: [
      {
        nome: 'Ficha do Grau',
        href: '/superiores/ficha-grau',
        descricao: 'Resumo executivo dos graus 4 a 33',
      },
    ],
  },
]
