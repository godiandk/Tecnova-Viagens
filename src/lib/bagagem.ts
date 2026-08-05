import { CUSTOS } from '@/lib/config';
import { buscarAeroporto } from '@/lib/dados/aeroportos';
import type { Itinerario } from '@/lib/tipos';

/**
 * Bagagem explicada do jeito que a pessoa pensa nela: a mala que vai com você
 * e a mala que vai embaixo do avião.
 *
 * Buscadores costumam esconder isso num ícone. Como é o principal custo
 * surpresa de uma passagem barata, aqui vira informação de primeira linha —
 * com o valor estimado, não só um "não incluso".
 */

export type BagagemDeBilhete = {
  bilheteId: string;
  vendedor: string;
  /** Peso permitido na mala de mão. */
  maoKg: number;
  despachadaInclusa: boolean;
  /** Quanto custa despachar neste bilhete, se não vier incluso. */
  custoDespachoBRL: number;
};

export type ResumoBagagem = {
  porBilhete: BagagemDeBilhete[];
  /** Toda a viagem já inclui mala despachada. */
  tudoIncluso: boolean;
  /** Custo total para despachar uma mala na viagem inteira. */
  custoTotalBRL: number;
  /**
   * Bilhetes separados cobram bagagem cada um. É a pegadinha mais cara da
   * autoconexão e quase nunca aparece na comparação de preço.
   */
  cobradaMaisDeUmaVez: boolean;
  /** Entre bilhetes separados, a mala não segue sozinha para o destino. */
  precisaRepegarMala: boolean;
};

function ehInternacional(itinerario: Itinerario): boolean {
  const segmentos = itinerario.bilhetes.flatMap((b) => b.segmentos);
  const paisOrigem = buscarAeroporto(segmentos[0].origem)?.paisIso;
  const paisDestino = buscarAeroporto(segmentos[segmentos.length - 1].destino)?.paisIso;
  return paisOrigem !== paisDestino;
}

export function resumirBagagem(itinerario: Itinerario): ResumoBagagem {
  const precoDespacho = ehInternacional(itinerario)
    ? CUSTOS.bagagemDespachadaInternacional
    : CUSTOS.bagagemDespachadaDomestica;

  const porBilhete: BagagemDeBilhete[] = itinerario.bilhetes.map((bilhete) => ({
    bilheteId: bilhete.id,
    vendedor: bilhete.vendedor,
    maoKg: bilhete.bagagemMaoKg,
    despachadaInclusa: bilhete.bagagemDespachada,
    custoDespachoBRL: bilhete.bagagemDespachada ? 0 : precoDespacho,
  }));

  const cobrancas = porBilhete.filter((b) => !b.despachadaInclusa).length;

  return {
    porBilhete,
    tudoIncluso: cobrancas === 0,
    custoTotalBRL: porBilhete.reduce((soma, b) => soma + b.custoDespachoBRL, 0),
    cobradaMaisDeUmaVez: cobrancas > 1,
    precisaRepegarMala: itinerario.bilhetes.length > 1,
  };
}
