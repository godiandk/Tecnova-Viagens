import type { FaixaSeguranca, NivelAlerta } from '@/lib/tipos';

const MOEDA = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function moeda(valor: number): string {
  return MOEDA.format(Math.round(valor));
}

const DATA_LONGA = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

/** Formata AAAA-MM-DD sem deixar o fuso do navegador puxar a data para o dia anterior. */
export function dataPorExtenso(data: string): string {
  return DATA_LONGA.format(new Date(`${data}T12:00:00Z`));
}

export const ROTULO_FAIXA: Record<FaixaSeguranca, string> = {
  seguro: 'Seguro',
  aceitavel: 'Aceitável',
  arriscado: 'Arriscado',
  evitar: 'Evite',
};

export const DESCRICAO_FAIXA: Record<FaixaSeguranca, string> = {
  seguro: 'Poucos pontos de falha. É o tipo de viagem que costuma sair como planejado.',
  aceitavel: 'Tem pontos de atenção, mas nada que quebre a viagem se você se programar.',
  arriscado: 'Um imprevisto comum já derruba o itinerário. Só compense se a economia for grande.',
  evitar: 'A chance de dar errado é alta e o prejuízo fica com você. Procure outra opção.',
};

/** Ícone que acompanha o nível, para quem não distingue as cores. */
export const SIMBOLO_NIVEL: Record<NivelAlerta, string> = {
  critico: '✕',
  alto: '!',
  medio: '!',
  baixo: '·',
  info: 'i',
};

/** Classes Tailwind por faixa: texto, fundo e borda coerentes com o tema. */
export const CLASSES_FAIXA: Record<FaixaSeguranca, string> = {
  seguro: 'text-ok bg-ok-suave border-ok/30',
  aceitavel: 'text-atencao bg-atencao-suave border-atencao/30',
  arriscado: 'text-risco bg-risco-suave border-risco/30',
  evitar: 'text-perigo bg-perigo-suave border-perigo/30',
};

/** Variável CSS da cor de cada faixa, para desenhar o medidor em SVG. */
export const COR_FAIXA: Record<FaixaSeguranca, string> = {
  seguro: 'var(--ok)',
  aceitavel: 'var(--atencao)',
  arriscado: 'var(--risco)',
  evitar: 'var(--perigo)',
};

export const ROTULO_NIVEL: Record<NivelAlerta, string> = {
  critico: 'Crítico',
  alto: 'Alto',
  medio: 'Médio',
  baixo: 'Baixo',
  info: 'Informação',
};

export const CLASSES_NIVEL: Record<NivelAlerta, string> = {
  critico: 'text-perigo bg-perigo-suave border-perigo/30',
  alto: 'text-risco bg-risco-suave border-risco/30',
  medio: 'text-atencao bg-atencao-suave border-atencao/30',
  baixo: 'text-suave bg-superficie-2 border-borda',
  info: 'text-marca bg-marca-suave border-marca/30',
};

/** Ordem de exibição dos alertas: o que dói mais aparece primeiro. */
export const PESO_NIVEL: Record<NivelAlerta, number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  baixo: 3,
  info: 4,
};

export function percentual(fracao: number): string {
  return `${Math.round(fracao * 100)}%`;
}
