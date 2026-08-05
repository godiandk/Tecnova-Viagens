import { analisarSeguranca, estimarCusto } from '@/lib/seguranca';
import type { CustoReal, Itinerario, ParametrosBusca, Resultado, Selo } from '@/lib/tipos';

/** Mediana simples; devolve 0 para lista vazia. */
export function mediana(valores: number[]): number {
  if (valores.length === 0) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 0
    ? (ordenados[meio - 1] + ordenados[meio]) / 2
    : ordenados[meio];
}

/**
 * Dinheiro que sai do bolso: preço mais os extras previsíveis. O componente de
 * risco fica de fora de propósito — ele já é contabilizado no eixo segurança,
 * e somá-lo aqui puniria o mesmo problema duas vezes.
 */
export function desembolso(custo: CustoReal): number {
  return custo.passagemBRL + custo.bagagemBRL + custo.trasladoBRL + custo.pernoiteBRL;
}

/**
 * Nota de preço em 0..1, onde 1 é a opção mais barata do conjunto.
 *
 * É a razão em relação ao menor desembolso, não uma normalização min-max. A
 * diferença importa: com min-max, um conjunto onde os preços variam 5% espalha
 * essa variação por toda a escala e faz uma economia irrelevante pesar tanto
 * quanto uma enorme. Pela razão, custar 18% a mais vale 0,85 — sempre, não
 * importa como os outros resultados estão distribuídos.
 */
function notaDePreco(valor: number, minimo: number): number {
  if (valor <= 0 || minimo <= 0) return 1;
  return Math.min(1, minimo / valor);
}

export function aplicarFiltros(
  itinerarios: Itinerario[],
  parametros: ParametrosBusca,
): Itinerario[] {
  return itinerarios.filter((it) => {
    if (!parametros.permitirBilhetesSeparados && it.bilhetes.length > 1) return false;
    if (it.paradas > parametros.maxParadas) return false;
    if (parametros.exigirBagagemDespachada && it.bilhetes.some((b) => !b.bagagemDespachada)) {
      return false;
    }
    return true;
  });
}

/**
 * Transforma itinerários crus em resultados ordenados.
 *
 * O ranking combina dois eixos normalizados dentro do próprio conjunto de
 * resultados: quanto custa e quanto arrisca. `pesoSeguranca` decide para que
 * lado a balança pende — 0 devolve a lista clássica por preço, 1 ignora preço.
 */
export function montarResultados(
  itinerarios: Itinerario[],
  parametros: ParametrosBusca,
): { resultados: Resultado[]; precoMedianoBRL: number } {
  const elegiveis = aplicarFiltros(itinerarios, parametros);
  const precoMedianoBRL = mediana(elegiveis.map((it) => it.precoBRL));

  if (elegiveis.length === 0) return { resultados: [], precoMedianoBRL: 0 };

  const parciais = elegiveis.map((itinerario) => {
    const seguranca = analisarSeguranca(itinerario, {
      nacionalidade: parametros.nacionalidade,
      precoMedianoBRL,
    });
    const custo = estimarCusto(itinerario, seguranca);
    return { itinerario, seguranca, custo };
  });

  const minimo = Math.min(...parciais.map((p) => desembolso(p.custo)));
  const peso = Math.min(1, Math.max(0, parametros.pesoSeguranca));

  const resultados: Resultado[] = parciais.map((p) => {
    const precoNormalizado = notaDePreco(desembolso(p.custo), minimo);
    const segurancaNormalizada = p.seguranca.score / 100;
    return {
      ...p,
      pontuacao: (1 - peso) * precoNormalizado + peso * segurancaNormalizada,
      economiaPercent:
        precoMedianoBRL > 0
          ? Math.round(((precoMedianoBRL - p.itinerario.precoBRL) / precoMedianoBRL) * 100)
          : 0,
      selos: [],
    };
  });

  resultados.sort(
    (a, b) => b.pontuacao - a.pontuacao || desembolso(a.custo) - desembolso(b.custo),
  );

  atribuirSelos(resultados);
  return { resultados, precoMedianoBRL };
}

/** Marca os extremos úteis para o usuário comparar sem reordenar a lista. */
function atribuirSelos(resultados: Resultado[]): void {
  if (resultados.length === 0) return;

  const adicionar = (alvo: Resultado | undefined, selo: Selo) => {
    if (alvo && !alvo.selos.includes(selo)) alvo.selos.push(selo);
  };

  const porPreco = [...resultados].sort((a, b) => desembolso(a.custo) - desembolso(b.custo));
  const porSeguranca = [...resultados].sort(
    (a, b) => b.seguranca.score - a.seguranca.score || desembolso(a.custo) - desembolso(b.custo),
  );
  const porDuracao = [...resultados].sort(
    (a, b) => a.itinerario.duracaoTotalMin - b.itinerario.duracaoTotalMin,
  );

  adicionar(resultados[0], 'melhor-escolha');
  adicionar(porPreco[0], 'mais-barato');
  adicionar(porSeguranca[0], 'mais-seguro');
  adicionar(porDuracao[0], 'mais-rapido');
}

/**
 * "Menor custo real" não é sinônimo de menor preço anunciado: o selo compara o
 * desembolso com bagagem, traslado e pernoite incluídos. Nomear de outro jeito
 * faria o selo contradizer o preço impresso no próprio cartão.
 */
export const ROTULOS_SELO: Record<Selo, string> = {
  'melhor-escolha': 'Melhor escolha',
  'mais-barato': 'Menor custo real',
  'mais-seguro': 'Mais seguro',
  'mais-rapido': 'Mais rápido',
};
