import { TEXTOS_ALERTA, TIPO_CONEXAO, type TextoAlerta } from '@/lib/i18n/textos-alertas';
import type { Traduzir } from '@/lib/i18n/contexto';
import type { Alerta } from '@/lib/tipos';

/** Palavras soltas que viajam dentro de `valores` e também precisam traduzir. */
const VALORES_TRADUZIVEIS = new Set<string>(Object.values(TIPO_CONEXAO));

/**
 * Monta os três textos de um alerta no idioma atual.
 *
 * O motor entrega código e valores; o texto vem daqui. Um valor que é palavra
 * (o "internacional" de "uma conexão internacional") passa pelo tradutor antes
 * de entrar na frase — senão a frase traduzia e a palavra ficava em português.
 */
export function textoDoAlerta(alerta: Alerta, t: Traduzir): TextoAlerta {
  const modelo = TEXTOS_ALERTA[alerta.modelo ?? alerta.codigo];

  if (!modelo) {
    // Código sem texto cadastrado: mostra o código em vez de sumir com o alerta.
    return { titulo: alerta.codigo, detalhe: '', simples: '' };
  }

  const valores: Record<string, string | number> = {};
  for (const [chave, valor] of Object.entries(alerta.valores ?? {})) {
    valores[chave] =
      typeof valor === 'string' && VALORES_TRADUZIVEIS.has(valor) ? t(valor) : valor;
  }

  return {
    titulo: t(modelo.titulo, valores),
    detalhe: t(modelo.detalhe, valores),
    simples: t(modelo.simples, valores),
  };
}

/** Título sem contexto de React, para código que roda fora de componente. */
export function tituloDoAlerta(alerta: Alerta, t: Traduzir): string {
  return textoDoAlerta(alerta, t).titulo;
}
