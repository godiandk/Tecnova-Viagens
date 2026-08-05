/**
 * Verifica se os dicionários cobrem todos os textos de alerta.
 *
 * Uma chave que não bate não quebra nada — o texto só volta para o português,
 * em silêncio. Este script transforma esse silêncio em erro visível.
 */
import { TEXTOS_ALERTA } from '@/lib/i18n/textos-alertas';
import { EN } from '@/lib/i18n/en';
import { ES } from '@/lib/i18n/es';
import type { Dicionario } from '@/lib/i18n/idiomas';

const frases = new Set<string>();
for (const texto of Object.values(TEXTOS_ALERTA)) {
  // O modelo do visto só encaixa texto que já vem traduzido de outro lugar.
  for (const parte of [texto.titulo, texto.detalhe, texto.simples]) {
    if (parte && !/^\{\w+\}$/.test(parte.trim())) frases.add(parte);
  }
}

let faltando = 0;
for (const [nome, dicionario] of Object.entries({ en: EN, es: ES }) as [string, Dicionario][]) {
  const ausentes = [...frases].filter((f) => !dicionario[f]);
  console.log(`${nome}: ${frases.size - ausentes.length}/${frases.size} traduzidas`);
  for (const a of ausentes) console.log(`  falta [${nome}] ${a.slice(0, 70)}…`);
  faltando += ausentes.length;
}

process.exit(faltando === 0 ? 0 : 1);
