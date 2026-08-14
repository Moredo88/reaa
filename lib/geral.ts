import type { ElementType } from 'react'
import { LayoutDashboard, ClipboardList, SlidersHorizontal } from 'lucide-react'
import type { Modulo } from './secoes'

export interface CampoFormulario {
  nome: string
  tipo: string
}

export interface Formulario {
  slug: string
  nome: string
  campos: CampoFormulario[]
}

export interface ListaParametro {
  slug: string
  nome: string
  valores: string[]
}

export interface GrupoGeral {
  titulo: string
  icon: ElementType
  modulos: Modulo[]
}

// Espelha a planilha "base reaa sistema.xlsx": colunas FORMULARIO viram
// telas de cadastro, colunas LISTA viram parametros. Fonte unica para o
// menu lateral e para as paginas em app/(app)/geral.
export const FORMULARIOS: Formulario[] = [
  {
    slug: 'obreiros',
    nome: 'Obreiros',
    campos: [
      { nome: 'Nome', tipo: 'Texto' },
      { nome: 'Cargo', tipo: 'Lista "Cargos"' },
      { nome: 'Matrícula', tipo: 'Número' },
      { nome: 'Ano', tipo: 'Data (ano)' },
    ],
  },
  {
    slug: 'notes',
    nome: 'Notes',
    campos: [
      { nome: 'Título', tipo: 'Texto' },
      { nome: 'Texto', tipo: 'Texto' },
    ],
  },
  {
    slug: 'eventos',
    nome: 'Eventos',
    campos: [
      { nome: 'Agenda', tipo: 'Lista "Agenda"' },
      { nome: 'Data', tipo: 'Data' },
      { nome: 'Obreiro', tipo: 'Formulário "Obreiros"' },
      { nome: 'Grau', tipo: 'Lista "Graus"' },
      { nome: 'Impressões', tipo: 'Texto' },
    ],
  },
  {
    slug: 'cobridor',
    nome: 'Cobridor',
    campos: [
      { nome: 'Sinal', tipo: 'Texto' },
      { nome: 'Alegorias', tipo: 'Texto' },
      { nome: 'Símbolos', tipo: 'Texto' },
      { nome: 'Idade', tipo: 'Número' },
      { nome: 'Passos', tipo: 'Texto' },
      { nome: 'Toques', tipo: 'Texto' },
      { nome: 'Outro', tipo: 'Texto' },
    ],
  },
  {
    slug: 'resumo',
    nome: 'Resumo',
    campos: [
      { nome: 'Alegorias', tipo: 'Texto' },
      { nome: 'Símbolos', tipo: 'Texto' },
      { nome: 'Juramento', tipo: 'Texto' },
      { nome: 'Moral', tipo: 'Texto' },
      { nome: 'Personagens', tipo: 'Texto' },
      { nome: 'Contexto Histórico', tipo: 'Texto' },
    ],
  },
]

export const LISTAS: ListaParametro[] = [
  {
    slug: 'corpo',
    nome: 'Corpo',
    valores: [
      'TAR 100',
      'ELP Cavaleiros Chave de Marfim',
      'ELP José Carvalho',
      'SCRC Leopoldo Jorge Cardon',
    ],
  },
  {
    slug: 'graus',
    nome: 'Graus',
    valores: [
      'Perfeição',
      'Capítulo',
      'Kadosh',
      'Consistório',
      'Inspetoria',
      'Del.Lit.',
      'Superiores',
      'Simbólica',
      ...Array.from({ length: 33 }, (_, i) => String(i + 1)),
    ],
  },
  {
    slug: 'agenda',
    nome: 'Agenda',
    valores: ['Iniciação', 'Apres. Trabalho', 'Reflexão', 'Reunião', 'Seminário', 'Posse'],
  },
  {
    slug: 'cargos',
    nome: 'Cargos',
    valores: [
      'Presidente',
      '1. Vig.',
      '2. Vig.',
      'Secretario',
      'Orador',
      'Tesoureiro',
      'Comissão de Grau',
      'Obreiro',
    ],
  },
]

export const GRUPOS_GERAL: GrupoGeral[] = [
  { titulo: 'Dashboards', icon: LayoutDashboard, modulos: [] },
  {
    titulo: 'Formulários',
    icon: ClipboardList,
    modulos: FORMULARIOS.map((f) => ({ nome: f.nome, href: `/geral/formularios/${f.slug}` })),
  },
  {
    titulo: 'Parâmetros',
    icon: SlidersHorizontal,
    modulos: LISTAS.map((l) => ({ nome: l.nome, href: `/geral/parametros/${l.slug}` })),
  },
]
