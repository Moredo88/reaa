import sanitizeHtml from 'sanitize-html'
import { corPermitida } from './cores'

// Os campos de texto passaram a guardar HTML (negrito, italico, sublinhado e
// cor). Renderizar HTML vindo do banco e XSS armazenado se nao for sanitizado,
// entao todo valor passa por aqui NO SERVIDOR, no caminho de escrita.
//
// Allowlist estrita: o que nao esta descrito abaixo e removido -- script, on*,
// javascript:, img, a, iframe, style arbitrario. Nada de sanitizador escrito a
// mao: parser de HTML feito na regra e furado por construcao.
const CONFIG: sanitizeHtml.IOptions = {
  // div/p entram porque o contenteditable usa bloco para quebra de linha;
  // sem eles o texto de varias linhas viraria um paragrafo unico.
  allowedTags: ['b', 'strong', 'i', 'em', 'u', 'span', 'br', 'div', 'p', 'font'],
  // `style` em toda tag inline, nao so em span: aplicar cor sobre um trecho ja
  // em negrito faz o navegador por o style no proprio <b>, e nao num <span>
  // aninhado -- restrito a span, a cor sumiria ao salvar.
  allowedAttributes: {
    b: ['style'], strong: ['style'], i: ['style'], em: ['style'],
    u: ['style'], span: ['style'], font: ['color'],
  },
  // Sem esquema de URL permitido: nao ha tag que carregue URL na allowlist.
  allowedSchemes: [],
  disallowedTagsMode: 'discard',
  transformTags: {
    // Reescreve o style inteiro a partir da paleta: o atributo que sai daqui e
    // sempre uma string que este codigo montou, nunca a do usuario.
    b: soCor, strong: soCor, i: soCor, em: soCor, u: soCor, span: soCor,
    // Rede de seguranca: se algum navegador emitir <font color> em vez de
    // style inline, a cor e preservada em vez de sumir junto com a tag.
    font: (_tagName, attribs) => comCor('span', corPermitida(attribs.color)),
  },
}

function soCor(tagName: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
  return comCor(tagName, corPermitida(/color\s*:\s*([^;]+)/i.exec(attribs.style ?? '')?.[1]))
}

function comCor(tagName: string, cor: string | null): sanitizeHtml.Tag {
  const attribs: sanitizeHtml.Attributes = {}
  if (cor) attribs.style = `color:${cor}`
  return { tagName, attribs }
}

export function sanitizarHtml(valor: string): string {
  return sanitizeHtml(valor, CONFIG)
}
