import type { ElementType } from 'react'
import { LayoutDashboard, ClipboardList, SlidersHorizontal } from 'lucide-react'
import type { Modulo } from './secoes'

export type TipoCampo = 'texto' | 'texto_longo' | 'numero' | 'ano' | 'data' | 'lista' | 'formulario'

export interface CampoFormulario {
  /** Nome da coluna na tabela do banco. */
  coluna: string
  /** Rotulo mostrado no formulario e na tabela. */
  nome: string
  tipo: TipoCampo
  /** Para tipo 'lista' ou 'formulario': tabela de onde vem as opcoes do select. */
  refTabela?: string
  obrigatorio?: boolean
}

export interface Formulario {
  slug: string
  tabela: string
  nome: string
  campos: CampoFormulario[]
}

export interface ListaParametro {
  slug: string
  tabela: string
  nome: string
}

export interface GrupoGeral {
  titulo: string
  icon: ElementType
  modulos: Modulo[]
}

// Espelha a planilha "base reaa sistema.xlsx": colunas FORMULARIO viram
// telas de cadastro, colunas LISTA viram parametros. Fonte unica para o
// menu lateral, as paginas em app/(app)/geral e as rotas /api/geral.
export const FORMULARIOS: Formulario[] = [
  {
    slug: 'obreiros',
    tabela: 'obreiros',
    nome: 'Obreiros',
    campos: [
      { coluna: 'nome', nome: 'Nome', tipo: 'texto', obrigatorio: true },
      { coluna: 'cargo_id', nome: 'Cargo', tipo: 'lista', refTabela: 'cargos' },
      { coluna: 'corpo_id', nome: 'Corpo', tipo: 'lista', refTabela: 'corpos' },
      { coluna: 'matricula', nome: 'Matrícula', tipo: 'numero' },
      { coluna: 'ano', nome: 'Ano', tipo: 'ano' },
    ],
  },
  {
    slug: 'notes',
    tabela: 'notes',
    nome: 'Notes',
    campos: [
      { coluna: 'titulo', nome: 'Título', tipo: 'texto', obrigatorio: true },
      { coluna: 'grau_id', nome: 'Grau', tipo: 'lista', refTabela: 'graus' },
      { coluna: 'corpo_id', nome: 'Corpo', tipo: 'lista', refTabela: 'corpos' },
      { coluna: 'texto', nome: 'Texto', tipo: 'texto_longo' },
    ],
  },
  {
    slug: 'eventos',
    tabela: 'eventos',
    nome: 'Eventos',
    campos: [
      { coluna: 'agenda_id', nome: 'Agenda', tipo: 'lista', refTabela: 'agendas' },
      { coluna: 'data', nome: 'Data', tipo: 'data' },
      { coluna: 'obreiro_id', nome: 'Obreiro', tipo: 'formulario', refTabela: 'obreiros' },
      { coluna: 'grau_id', nome: 'Grau', tipo: 'lista', refTabela: 'graus' },
      { coluna: 'impressoes', nome: 'Impressões', tipo: 'texto_longo' },
    ],
  },
  {
    slug: 'cobridor',
    tabela: 'cobridores',
    nome: 'Cobridor',
    campos: [
      { coluna: 'sinal', nome: 'Sinal', tipo: 'texto' },
      // Rotulo renomeado; a coluna continua `alegorias` para nao migrar dados.
      { coluna: 'alegorias', nome: 'Palavras', tipo: 'texto' },
      { coluna: 'simbolos', nome: 'Símbolos', tipo: 'texto' },
      { coluna: 'idade', nome: 'Idade', tipo: 'numero' },
      // Idem: a coluna segue `passos`. Nao confundir com resumos.livro_da_lei,
      // que e outra coluna, em outro formulario, com o mesmo rotulo.
      { coluna: 'passos', nome: 'Livro da Lei', tipo: 'texto' },
      { coluna: 'marcha', nome: 'Marcha', tipo: 'texto' },
      { coluna: 'toques', nome: 'Toques', tipo: 'texto' },
      { coluna: 'outro', nome: 'Outro', tipo: 'texto' },
    ],
  },
  {
    slug: 'resumo',
    tabela: 'resumos',
    nome: 'Resumo',
    campos: [
      { coluna: 'grau_id', nome: 'Grau', tipo: 'lista', refTabela: 'graus' },
      { coluna: 'alegorias', nome: 'Alegorias', tipo: 'texto' },
      { coluna: 'simbolos', nome: 'Símbolos', tipo: 'texto' },
      { coluna: 'juramento', nome: 'Juramento', tipo: 'texto' },
      { coluna: 'moral', nome: 'Moral', tipo: 'texto' },
      { coluna: 'personagens', nome: 'Personagens', tipo: 'texto' },
      { coluna: 'livro_da_lei', nome: 'Livro da Lei', tipo: 'texto' },
      { coluna: 'contexto_historico', nome: 'Contexto Histórico', tipo: 'texto_longo' },
    ],
  },
]

export const LISTAS: ListaParametro[] = [
  { slug: 'corpo', tabela: 'corpos', nome: 'Corpo' },
  { slug: 'graus', tabela: 'graus', nome: 'Graus' },
  { slug: 'agenda', tabela: 'agendas', nome: 'Agenda' },
  { slug: 'cargos', tabela: 'cargos', nome: 'Cargos' },
]

export const GRUPOS_GERAL: GrupoGeral[] = [
  {
    titulo: 'Dashboards',
    icon: LayoutDashboard,
    modulos: [
      { nome: 'Visão Geral', href: '/geral/dashboards' },
      { nome: 'Ficha do Grau', href: '/geral/dashboards/ficha-grau' },
    ],
  },
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
