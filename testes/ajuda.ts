import { diferencaMin, somarMinutos } from '@/lib/tempo';
import type { Bilhete, Itinerario, Segmento, TipoTarifa } from '@/lib/tipos';

/**
 * Construtores de itinerários para os testes.
 *
 * Escrever um itinerário à mão em cada caso esconderia o que está sendo testado
 * atrás de vinte linhas de objeto. Aqui só o que importa para o caso é explícito.
 */

let contador = 0;

export function segmento(opcoes: {
  companhia?: string;
  origem: string;
  destino: string;
  partida: string;
  duracaoMin: number;
}): Segmento {
  const companhia = opcoes.companhia ?? 'LA';
  return {
    companhia,
    numeroVoo: String(1000 + contador++),
    origem: opcoes.origem,
    destino: opcoes.destino,
    partida: opcoes.partida,
    chegada: somarMinutos(opcoes.partida, opcoes.duracaoMin),
    duracaoMin: opcoes.duracaoMin,
  };
}

export function bilhete(opcoes: {
  segmentos: Segmento[];
  precoBRL?: number;
  tipoTarifa?: TipoTarifa;
  bagagemDespachada?: boolean;
  remarcavel?: boolean;
  reembolsavel?: boolean;
}): Bilhete {
  const tipoTarifa = opcoes.tipoTarifa ?? 'classica';
  return {
    id: `bilhete-${contador++}`,
    segmentos: opcoes.segmentos,
    precoBRL: opcoes.precoBRL ?? 1000,
    tipoTarifa,
    vendedor: 'Teste',
    bagagemDespachada: opcoes.bagagemDespachada ?? true,
    bagagemMaoKg: 10,
    remarcavel: opcoes.remarcavel ?? true,
    reembolsavel: opcoes.reembolsavel ?? true,
  };
}

export function itinerario(bilhetes: Bilhete[]): Itinerario {
  const segmentos = bilhetes.flatMap((b) => b.segmentos);
  const tempoVoando = segmentos.reduce((s, seg) => s + seg.duracaoMin, 0);
  const tempoEsperando = segmentos
    .slice(0, -1)
    .reduce((s, seg, i) => s + diferencaMin(seg.chegada, segmentos[i + 1].partida), 0);

  return {
    id: `itinerario-${contador++}`,
    bilhetes,
    origem: segmentos[0].origem,
    destino: segmentos[segmentos.length - 1].destino,
    partida: segmentos[0].partida,
    chegada: segmentos[segmentos.length - 1].chegada,
    duracaoTotalMin: tempoVoando + tempoEsperando,
    paradas: segmentos.length - 1,
    precoBRL: bilhetes.reduce((s, b) => s + b.precoBRL, 0),
  };
}

/** Voo direto seguro, usado como linha de base nas comparações. */
export function vooDireto(precoBRL = 1000): Itinerario {
  return itinerario([
    bilhete({
      precoBRL,
      segmentos: [
        segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
      ],
    }),
  ]);
}

export function temAlerta(alertas: { codigo: string }[], codigo: string): boolean {
  return alertas.some((a) => a.codigo === codigo);
}
