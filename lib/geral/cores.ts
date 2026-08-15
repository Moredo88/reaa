// Paleta fixa das cores de texto do editor. Modulo separado de sanitizar.ts
// de proposito: o editor e 'use client' e importar de la arrastaria o
// sanitize-html (Node) para o bundle do navegador.
//
// Sao os passos 700, e nao os 600 usados em marca grafica: cor de TEXTO precisa
// de 4.5:1 sobre o branco (WCAG AA) e orange-600 (3.56) e emerald-600 (3.77)
// nao alcancam. Paleta fixa em vez de seletor livre para nao existir amarelo
// sobre fundo branco.
export interface CorTexto {
  nome: string
  hex: string
}

export const CORES_TEXTO: CorTexto[] = [
  { nome: 'Padrão', hex: '#0f172a' },
  { nome: 'Azul', hex: '#1d4ed8' },
  { nome: 'Laranja', hex: '#c2410c' },
  { nome: 'Verde', hex: '#047857' },
  { nome: 'Vermelho', hex: '#b91c1c' },
  { nome: 'Violeta', hex: '#6d28d9' },
]

export const HEXES_PERMITIDOS = CORES_TEXTO.map((c) => c.hex)

// O navegador serializa cor inline como "rgb(29, 78, 216)", nao como hex --
// entao a allowlist tem que comparar em forma canonica, senao toda cor
// aplicada pelo editor seria descartada na sanitizacao.
export function normalizarCor(valor: string): string | null {
  const bruto = valor.trim().toLowerCase()

  if (/^#[0-9a-f]{6}$/.test(bruto)) return bruto

  if (/^#[0-9a-f]{3}$/.test(bruto)) {
    return '#' + bruto.slice(1).split('').map((c) => c + c).join('')
  }

  const rgb = /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/][^)]*)?\)$/.exec(bruto)
  if (!rgb) return null

  const canais = [rgb[1], rgb[2], rgb[3]].map(Number)
  if (canais.some((n) => n > 255)) return null

  return '#' + canais.map((n) => n.toString(16).padStart(2, '0')).join('')
}

export function corPermitida(valor: string | undefined): string | null {
  if (!valor) return null
  const hex = normalizarCor(valor)
  return hex && HEXES_PERMITIDOS.includes(hex) ? hex : null
}
