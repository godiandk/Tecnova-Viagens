/**
 * Cálculo de repasse para revenda.
 *
 * A conta que importa não é "custo + margem". É quanto sobra no bolso depois
 * da taxa da maquininha e depois do custo REAL da passagem — o que inclui
 * bagagem e traslado. Vender com 15% de margem e pagar 5% de taxa não é
 * ganhar 15%: é ganhar bem menos, e é isso que este módulo mostra.
 */

export type TipoMargem = 'percentual' | 'fixo';

export type EntradaRepasse = {
  /** Custo real da passagem por passageiro, já com bagagem e extras. */
  custoUnitarioBRL: number;
  passageiros: number;
  tipoMargem: TipoMargem;
  /** Percentual (ex.: 15 para 15%) ou valor fixo em reais por passageiro. */
  margem: number;
  /** Taxa do meio de pagamento sobre o valor recebido, em % (ex.: 4.99). */
  taxaCartaoPercent: number;
};

export type Repasse = {
  custoTotalBRL: number;
  precoUnitarioBRL: number;
  precoTotalBRL: number;
  taxaCartaoBRL: number;
  lucroUnitarioBRL: number;
  lucroTotalBRL: number;
  /** Lucro sobre o que o cliente paga — a margem que sobra de verdade. */
  margemEfetivaPercent: number;
  /** true quando a taxa come tudo e a venda dá prejuízo. */
  prejuizo: boolean;
};

function positivo(valor: number): number {
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

export function calcularRepasse(entrada: EntradaRepasse): Repasse {
  const custoUnitario = positivo(entrada.custoUnitarioBRL);
  const passageiros = Math.max(1, Math.round(positivo(entrada.passageiros) || 1));
  const margem = Number.isFinite(entrada.margem) ? entrada.margem : 0;
  const taxa = Math.min(100, Math.max(0, positivo(entrada.taxaCartaoPercent)));

  const precoUnitario =
    entrada.tipoMargem === 'percentual'
      ? custoUnitario * (1 + margem / 100)
      : custoUnitario + margem;

  const precoTotal = precoUnitario * passageiros;
  const custoTotal = custoUnitario * passageiros;
  const taxaCartao = precoTotal * (taxa / 100);
  const lucroTotal = precoTotal - custoTotal - taxaCartao;

  return {
    custoTotalBRL: arredondar(custoTotal),
    precoUnitarioBRL: arredondar(precoUnitario),
    precoTotalBRL: arredondar(precoTotal),
    taxaCartaoBRL: arredondar(taxaCartao),
    lucroUnitarioBRL: arredondar(lucroTotal / passageiros),
    lucroTotalBRL: arredondar(lucroTotal),
    margemEfetivaPercent: precoTotal > 0 ? arredondar((lucroTotal / precoTotal) * 100, 1) : 0,
    prejuizo: lucroTotal < 0,
  };
}

/**
 * Margem percentual necessária para sobrar exatamente o lucro desejado por
 * passageiro depois da taxa. Serve para responder "quanto eu cobro para
 * ganhar R$ 120 nesta venda?" sem tentativa e erro.
 */
export function margemParaLucroAlvo(
  custoUnitarioBRL: number,
  lucroDesejadoUnitarioBRL: number,
  taxaCartaoPercent: number,
): number {
  const custo = positivo(custoUnitarioBRL);
  const taxa = Math.min(99.9, Math.max(0, positivo(taxaCartaoPercent)));
  if (custo === 0) return 0;

  // preco * (1 - taxa) - custo = lucro  =>  preco = (custo + lucro) / (1 - taxa)
  const preco = (custo + lucroDesejadoUnitarioBRL) / (1 - taxa / 100);
  return arredondar(((preco - custo) / custo) * 100, 1);
}

function arredondar(valor: number, casas = 0): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}
