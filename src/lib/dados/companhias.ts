import type { Companhia } from '@/lib/tipos';

/**
 * Indicadores operacionais por companhia.
 *
 * ATENÇÃO: os valores de `pontualidade` e `cancelamento` são estimativas de
 * referência para alimentar o cálculo de risco, não estatísticas oficiais.
 * Para uso sério, substitua por dados da ANAC (voos domésticos) ou de um
 * provedor de dados operacionais, e atualize `ATUALIZADO_EM`.
 */
export const ATUALIZADO_EM = '2026-01-01';

export const COMPANHIAS: Companhia[] = [
  { iata: 'G3', nome: 'GOL', paisIso: 'BR', pontualidade: 0.82, cancelamento: 0.02, lowCost: false },
  { iata: 'AD', nome: 'Azul', paisIso: 'BR', pontualidade: 0.83, cancelamento: 0.02, lowCost: false },
  { iata: 'LA', nome: 'LATAM', paisIso: 'BR', pontualidade: 0.85, cancelamento: 0.015, lowCost: false },
  { iata: '2Z', nome: 'Voepass', paisIso: 'BR', pontualidade: 0.72, cancelamento: 0.05, lowCost: false },
  { iata: 'AR', nome: 'Aerolíneas Argentinas', paisIso: 'AR', pontualidade: 0.76, cancelamento: 0.03, lowCost: false },
  { iata: 'H2', nome: 'SKY Airline', paisIso: 'CL', pontualidade: 0.8, cancelamento: 0.025, lowCost: true },
  { iata: 'JA', nome: 'JetSMART', paisIso: 'CL', pontualidade: 0.75, cancelamento: 0.035, lowCost: true },
  { iata: 'AV', nome: 'Avianca', paisIso: 'CO', pontualidade: 0.79, cancelamento: 0.025, lowCost: false },
  { iata: 'CM', nome: 'Copa Airlines', paisIso: 'PA', pontualidade: 0.88, cancelamento: 0.012, lowCost: false },
  { iata: 'AA', nome: 'American Airlines', paisIso: 'US', pontualidade: 0.8, cancelamento: 0.02, lowCost: false },
  { iata: 'UA', nome: 'United Airlines', paisIso: 'US', pontualidade: 0.81, cancelamento: 0.02, lowCost: false },
  { iata: 'DL', nome: 'Delta Air Lines', paisIso: 'US', pontualidade: 0.86, cancelamento: 0.01, lowCost: false },
  { iata: 'B6', nome: 'JetBlue', paisIso: 'US', pontualidade: 0.71, cancelamento: 0.03, lowCost: true },
  { iata: 'AC', nome: 'Air Canada', paisIso: 'CA', pontualidade: 0.77, cancelamento: 0.025, lowCost: false },
  { iata: 'AM', nome: 'Aeroméxico', paisIso: 'MX', pontualidade: 0.82, cancelamento: 0.02, lowCost: false },
  { iata: 'TP', nome: 'TAP Air Portugal', paisIso: 'PT', pontualidade: 0.74, cancelamento: 0.03, lowCost: false },
  { iata: 'IB', nome: 'Iberia', paisIso: 'ES', pontualidade: 0.83, cancelamento: 0.015, lowCost: false },
  { iata: 'UX', nome: 'Air Europa', paisIso: 'ES', pontualidade: 0.78, cancelamento: 0.025, lowCost: false },
  { iata: 'AF', nome: 'Air France', paisIso: 'FR', pontualidade: 0.79, cancelamento: 0.02, lowCost: false },
  { iata: 'KL', nome: 'KLM', paisIso: 'NL', pontualidade: 0.81, cancelamento: 0.02, lowCost: false },
  { iata: 'LH', nome: 'Lufthansa', paisIso: 'DE', pontualidade: 0.75, cancelamento: 0.035, lowCost: false },
  { iata: 'LX', nome: 'Swiss', paisIso: 'CH', pontualidade: 0.82, cancelamento: 0.02, lowCost: false },
  { iata: 'BA', nome: 'British Airways', paisIso: 'GB', pontualidade: 0.76, cancelamento: 0.03, lowCost: false },
  { iata: 'AZ', nome: 'ITA Airways', paisIso: 'IT', pontualidade: 0.84, cancelamento: 0.015, lowCost: false },
  { iata: 'FR', nome: 'Ryanair', paisIso: 'IE', pontualidade: 0.79, cancelamento: 0.01, lowCost: true },
  { iata: 'U2', nome: 'easyJet', paisIso: 'GB', pontualidade: 0.72, cancelamento: 0.02, lowCost: true },
  { iata: 'TK', nome: 'Turkish Airlines', paisIso: 'TR', pontualidade: 0.8, cancelamento: 0.02, lowCost: false },
  { iata: 'EK', nome: 'Emirates', paisIso: 'AE', pontualidade: 0.85, cancelamento: 0.01, lowCost: false },
  { iata: 'QR', nome: 'Qatar Airways', paisIso: 'QA', pontualidade: 0.87, cancelamento: 0.01, lowCost: false },
  { iata: 'ET', nome: 'Ethiopian Airlines', paisIso: 'ET', pontualidade: 0.78, cancelamento: 0.025, lowCost: false },
  { iata: 'SA', nome: 'South African Airways', paisIso: 'ZA', pontualidade: 0.76, cancelamento: 0.03, lowCost: false },
];

const PORdeIATA = new Map(COMPANHIAS.map((c) => [c.iata, c]));

/** Companhia desconhecida recebe valores medianos em vez de quebrar a busca. */
export const COMPANHIA_PADRAO: Companhia = {
  iata: '??',
  nome: 'Companhia não catalogada',
  paisIso: '??',
  pontualidade: 0.78,
  cancelamento: 0.025,
  lowCost: false,
};

export function buscarCompanhia(iata: string): Companhia {
  return PORdeIATA.get(iata.toUpperCase()) ?? { ...COMPANHIA_PADRAO, iata: iata.toUpperCase() };
}
