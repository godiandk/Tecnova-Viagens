import type { Itinerario, Passageiros } from '@/lib/tipos';

export type ConsultaTrecho = {
  origem: string;
  destino: string;
  /** Data de partida no formato AAAA-MM-DD. */
  data: string;
  passageiros: Passageiros;
};

/**
 * Fonte de ofertas de voo.
 *
 * O motor de risco e o ranking não sabem de onde vêm os itinerários — trocar de
 * fonte é trocar a implementação desta interface. Provedores devolvem dados
 * crus: nenhuma filtragem ou ordenação acontece aqui.
 */
export interface ProvedorBusca {
  /** Identificador curto exibido na resposta da API. */
  nome: string;
  /** true quando os preços não são reais. */
  simulado: boolean;
  buscarTrecho(consulta: ConsultaTrecho): Promise<Itinerario[]>;
}
