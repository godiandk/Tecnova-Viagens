import { amadeusConfigurado, criarProvedorAmadeus } from '@/lib/provedores/amadeus';
import { criarProvedorSimulado } from '@/lib/provedores/simulado';
import type { ProvedorBusca } from '@/lib/provedores/tipos';

export type { ConsultaTrecho, ProvedorBusca } from '@/lib/provedores/tipos';

/**
 * Escolhe a fonte de ofertas.
 *
 * `PROVEDOR=simulado` força os dados de demonstração mesmo com credenciais
 * configuradas — útil para desenvolver sem gastar cota da API.
 */
export function selecionarProvedor(): ProvedorBusca {
  const preferido = (process.env.PROVEDOR ?? '').toLowerCase();

  if (preferido === 'simulado') return criarProvedorSimulado();
  if (preferido === 'amadeus' || amadeusConfigurado()) {
    if (amadeusConfigurado()) return criarProvedorAmadeus();
  }
  return criarProvedorSimulado();
}

export { criarProvedorSimulado, criarProvedorAmadeus, amadeusConfigurado };
