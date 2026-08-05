/**
 * Idiomas do site.
 *
 * Mesma filosofia do i18n da TECNOVA Digital: a chave do dicionário é a frase
 * em português, exatamente como aparece na tela. O que não estiver traduzido
 * fica em português — nunca inventamos tradução.
 *
 * A diferença é o mecanismo. Lá o script reescreve o texto direto no HTML e
 * vigia a página com um MutationObserver. Aqui não dá: o React redesenha a
 * lista inteira a cada movimento da balança, sobrescreveria a tradução e os
 * dois ficariam brigando. Então a tradução acontece na hora de renderizar.
 */
export type Idioma = 'pt' | 'en' | 'es';

export type DadosIdioma = {
  nome: string;
  bandeira: string;
  curto: string;
  htmlLang: string;
  /** Locale usado para formatar moeda e datas. */
  locale: string;
};

export const IDIOMAS: Record<Idioma, DadosIdioma> = {
  pt: { nome: 'Português', bandeira: '🇧🇷', curto: 'PT', htmlLang: 'pt-BR', locale: 'pt-BR' },
  en: { nome: 'English', bandeira: '🇬🇧', curto: 'EN', htmlLang: 'en', locale: 'en-US' },
  es: { nome: 'Español', bandeira: '🇪🇸', curto: 'ES', htmlLang: 'es', locale: 'es-ES' },
};

export const IDIOMA_PADRAO: Idioma = 'pt';

/** Mesma chave usada pela TECNOVA Digital, para a escolha valer nos dois sites. */
export const CHAVE_ARMAZENAMENTO = 'tecnova-idioma';

export function ehIdiomaValido(valor: unknown): valor is Idioma {
  return typeof valor === 'string' && valor in IDIOMAS;
}

/**
 * Dicionário de um idioma: frase em português → tradução.
 * Textos com partes variáveis usam marcadores {assim}.
 */
export type Dicionario = Record<string, string>;
