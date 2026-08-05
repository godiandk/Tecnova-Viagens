/**
 * Latitude, longitude e fuso horário padrão de cada aeroporto.
 *
 * Serve para estimar distância, duração de voo e converter horários entre
 * aeroportos. Os fusos ignoram horário de verão — a precisão é suficiente para
 * dimensionar conexões, mas não use isto como fonte de horário oficial.
 */
export type Geo = {
  /** Graus decimais. */
  lat: number;
  lon: number;
  /** Offset UTC em horas, sem horário de verão. */
  fuso: number;
};

export const GEOGRAFIA: Record<string, Geo> = {
  // Brasil
  GRU: { lat: -23.43, lon: -46.47, fuso: -3 },
  CGH: { lat: -23.63, lon: -46.66, fuso: -3 },
  VCP: { lat: -23.01, lon: -47.13, fuso: -3 },
  GIG: { lat: -22.81, lon: -43.25, fuso: -3 },
  SDU: { lat: -22.91, lon: -43.16, fuso: -3 },
  CNF: { lat: -19.63, lon: -43.97, fuso: -3 },
  PLU: { lat: -19.85, lon: -43.95, fuso: -3 },
  BSB: { lat: -15.87, lon: -47.92, fuso: -3 },
  SSA: { lat: -12.91, lon: -38.33, fuso: -3 },
  REC: { lat: -8.13, lon: -34.92, fuso: -3 },
  FOR: { lat: -3.78, lon: -38.53, fuso: -3 },
  POA: { lat: -29.99, lon: -51.17, fuso: -3 },
  CWB: { lat: -25.53, lon: -49.17, fuso: -3 },
  FLN: { lat: -27.67, lon: -48.55, fuso: -3 },
  VIX: { lat: -20.26, lon: -40.29, fuso: -3 },
  BEL: { lat: -1.38, lon: -48.48, fuso: -3 },
  MAO: { lat: -3.04, lon: -60.05, fuso: -4 },
  NAT: { lat: -5.77, lon: -35.37, fuso: -3 },
  MCZ: { lat: -9.51, lon: -35.79, fuso: -3 },
  JPA: { lat: -7.15, lon: -34.95, fuso: -3 },
  AJU: { lat: -10.98, lon: -37.07, fuso: -3 },
  THE: { lat: -5.06, lon: -42.82, fuso: -3 },
  SLZ: { lat: -2.59, lon: -44.23, fuso: -3 },
  CGB: { lat: -15.65, lon: -56.12, fuso: -4 },
  CGR: { lat: -20.47, lon: -54.67, fuso: -4 },
  GYN: { lat: -16.63, lon: -49.22, fuso: -3 },
  IGU: { lat: -25.6, lon: -54.49, fuso: -3 },
  NVT: { lat: -26.88, lon: -48.65, fuso: -3 },
  PMW: { lat: -10.29, lon: -48.36, fuso: -3 },
  PVH: { lat: -8.71, lon: -63.9, fuso: -4 },
  RBR: { lat: -9.87, lon: -67.89, fuso: -5 },
  BVB: { lat: 2.84, lon: -60.69, fuso: -4 },
  MCP: { lat: 0.05, lon: -51.07, fuso: -3 },
  IOS: { lat: -14.82, lon: -39.03, fuso: -3 },
  BPS: { lat: -16.44, lon: -39.08, fuso: -3 },
  FEN: { lat: -3.85, lon: -32.42, fuso: -2 },
  UDI: { lat: -18.88, lon: -48.23, fuso: -3 },
  RAO: { lat: -21.13, lon: -47.77, fuso: -3 },
  LDB: { lat: -23.33, lon: -51.13, fuso: -3 },
  JOI: { lat: -26.22, lon: -48.8, fuso: -3 },
  MGF: { lat: -23.48, lon: -52.01, fuso: -3 },
  CXJ: { lat: -29.2, lon: -51.19, fuso: -3 },
  JDO: { lat: -7.22, lon: -39.27, fuso: -3 },
  PET: { lat: -31.72, lon: -52.33, fuso: -3 },
  STM: { lat: -2.42, lon: -54.79, fuso: -3 },

  // América do Sul
  EZE: { lat: -34.82, lon: -58.54, fuso: -3 },
  AEP: { lat: -34.56, lon: -58.42, fuso: -3 },
  SCL: { lat: -33.39, lon: -70.79, fuso: -4 },
  MVD: { lat: -34.84, lon: -56.03, fuso: -3 },
  LIM: { lat: -12.02, lon: -77.11, fuso: -5 },
  BOG: { lat: 4.7, lon: -74.15, fuso: -5 },
  ASU: { lat: -25.24, lon: -57.52, fuso: -4 },
  VVI: { lat: -17.64, lon: -63.14, fuso: -4 },
  UIO: { lat: -0.13, lon: -78.36, fuso: -5 },
  CCS: { lat: 10.6, lon: -66.99, fuso: -4 },
  GEO: { lat: 6.5, lon: -58.25, fuso: -4 },

  // América do Norte e Central
  MIA: { lat: 25.79, lon: -80.29, fuso: -5 },
  MCO: { lat: 28.43, lon: -81.31, fuso: -5 },
  JFK: { lat: 40.64, lon: -73.78, fuso: -5 },
  EWR: { lat: 40.69, lon: -74.17, fuso: -5 },
  LGA: { lat: 40.78, lon: -73.87, fuso: -5 },
  ORD: { lat: 41.98, lon: -87.9, fuso: -6 },
  MDW: { lat: 41.79, lon: -87.75, fuso: -6 },
  LAX: { lat: 33.94, lon: -118.41, fuso: -8 },
  ATL: { lat: 33.64, lon: -84.43, fuso: -5 },
  DFW: { lat: 32.9, lon: -97.04, fuso: -6 },
  IAH: { lat: 29.98, lon: -95.34, fuso: -6 },
  BOS: { lat: 42.36, lon: -71.01, fuso: -5 },
  YYZ: { lat: 43.68, lon: -79.63, fuso: -5 },
  YUL: { lat: 45.47, lon: -73.74, fuso: -5 },
  MEX: { lat: 19.44, lon: -99.07, fuso: -6 },
  CUN: { lat: 21.04, lon: -86.87, fuso: -5 },
  PTY: { lat: 9.07, lon: -79.38, fuso: -5 },

  // Europa
  LIS: { lat: 38.77, lon: -9.13, fuso: 0 },
  OPO: { lat: 41.24, lon: -8.68, fuso: 0 },
  MAD: { lat: 40.47, lon: -3.56, fuso: 1 },
  BCN: { lat: 41.3, lon: 2.08, fuso: 1 },
  CDG: { lat: 49.01, lon: 2.55, fuso: 1 },
  ORY: { lat: 48.73, lon: 2.37, fuso: 1 },
  BVA: { lat: 49.45, lon: 2.11, fuso: 1 },
  LHR: { lat: 51.47, lon: -0.45, fuso: 0 },
  LGW: { lat: 51.15, lon: -0.19, fuso: 0 },
  STN: { lat: 51.89, lon: 0.24, fuso: 0 },
  FCO: { lat: 41.8, lon: 12.25, fuso: 1 },
  CIA: { lat: 41.8, lon: 12.59, fuso: 1 },
  MXP: { lat: 45.63, lon: 8.72, fuso: 1 },
  LIN: { lat: 45.45, lon: 9.28, fuso: 1 },
  BGY: { lat: 45.67, lon: 9.7, fuso: 1 },
  FRA: { lat: 50.04, lon: 8.56, fuso: 1 },
  MUC: { lat: 48.35, lon: 11.79, fuso: 1 },
  AMS: { lat: 52.31, lon: 4.76, fuso: 1 },
  ZRH: { lat: 47.46, lon: 8.55, fuso: 1 },
  IST: { lat: 41.26, lon: 28.74, fuso: 3 },
  DUB: { lat: 53.43, lon: -6.25, fuso: 0 },

  // África, Ásia e Oceania
  JNB: { lat: -26.13, lon: 28.24, fuso: 2 },
  CPT: { lat: -33.97, lon: 18.6, fuso: 2 },
  CMN: { lat: 33.37, lon: -7.59, fuso: 1 },
  ADD: { lat: 8.98, lon: 38.8, fuso: 3 },
  DXB: { lat: 25.25, lon: 55.36, fuso: 4 },
  DOH: { lat: 25.27, lon: 51.61, fuso: 3 },
  NRT: { lat: 35.76, lon: 140.39, fuso: 9 },
  HND: { lat: 35.55, lon: 139.78, fuso: 9 },
  SIN: { lat: 1.36, lon: 103.99, fuso: 8 },
  SYD: { lat: -33.94, lon: 151.18, fuso: 10 },
};

export function geoDe(iata: string): Geo | undefined {
  return GEOGRAFIA[iata.toUpperCase()];
}

/** Distância em km pela fórmula de haversine. */
export function distanciaKm(iataA: string, iataB: string): number {
  const a = geoDe(iataA);
  const b = geoDe(iataB);
  if (!a || !b) return 0;

  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Duração de voo estimada, em minutos: taxi e subida somados a uma velocidade
 * de cruzeiro média de ~800 km/h.
 */
export function duracaoVooMin(iataA: string, iataB: string): number {
  const km = distanciaKm(iataA, iataB);
  if (km === 0) return 90;
  return Math.round(30 + (km / 800) * 60);
}

/** Diferença de fuso entre dois aeroportos, em minutos. */
export function diferencaFusoMin(origem: string, destino: string): number {
  const a = geoDe(origem);
  const b = geoDe(destino);
  if (!a || !b) return 0;
  return (b.fuso - a.fuso) * 60;
}
