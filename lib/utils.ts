import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

// Campos de texto guardam HTML (ver lib/geral/sanitizar.ts). Onde o valor e
// usado como rotulo -- celula da tabela, opcao de select -- ele precisa virar
// texto puro: o `valor()` do DataTable alimenta tambem a ordenacao e a lista de
// filtros, que ficariam ordenando e listando marcacao.
//
// Isto e projecao para exibicao, nao seguranca: o valor ja foi sanitizado na
// escrita e o resultado daqui e renderizado como texto, que o React escapa.
export function paraTextoPuro(valor: string): string {
  // Abertura de bloco tambem separa palavras: "a<div>b</div>" e "a b", nao "ab".
  const comQuebras = valor
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(div|p)\b[^>]*>/gi, ' ')

  const semTags = comQuebras.replace(/<[^>]*>/g, '')

  const decodificado = semTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')

  return decodificado.replace(/\s+/g, ' ').trim()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
