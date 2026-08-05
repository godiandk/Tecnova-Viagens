import { AEROPORTOS, buscarAeroporto } from '@/lib/dados/aeroportos';
import { COMPANHIAS } from '@/lib/dados/companhias';
import { diferencaFusoMin, distanciaKm, duracaoVooMin } from '@/lib/dados/geografia';
import { diferencaMin, montarHorario, somarMinutos } from '@/lib/tempo';
import type { Bilhete, Companhia, Itinerario, Segmento, TipoTarifa } from '@/lib/tipos';
import type { ConsultaTrecho, ProvedorBusca } from '@/lib/provedores/tipos';

/**
 * Provedor de demonstração.
 *
 * Gera ofertas plausíveis para qualquer par de aeroportos do catálogo, sempre
 * as mesmas para a mesma consulta (o sorteio é semeado pela rota e pela data).
 * O objetivo é reproduzir a tensão real do mercado: as opções mais baratas são
 * justamente as que concentram risco — conexão apertada, bilhete separado,
 * troca de aeroporto, madrugada.
 *
 * Os preços NÃO são reais. Para dados de verdade, configure o provedor Amadeus.
 */

// ---------------------------------------------------------------- aleatório

/** PRNG determinístico (mulberry32) — mesma consulta, mesmo resultado. */
function criarSorteio(semente: string) {
  let h = 1779033703 ^ semente.length;
  for (let i = 0; i < semente.length; i++) {
    h = Math.imul(h ^ semente.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;

  return {
    /** Float em [0, 1). */
    proximo(): number {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** Float em [min, max). */
    entre(min: number, max: number): number {
      return min + this.proximo() * (max - min);
    },
    /** Inteiro em [min, max]. */
    inteiro(min: number, max: number): number {
      return Math.floor(this.entre(min, max + 1));
    },
    escolher<T>(lista: readonly T[]): T {
      return lista[Math.floor(this.proximo() * lista.length)];
    },
    /** true com probabilidade `p`. */
    chance(p: number): boolean {
      return this.proximo() < p;
    },
  };
}

type Sorteio = ReturnType<typeof criarSorteio>;

// ---------------------------------------------------------------- catálogo

/** Aeroportos que costumam operar como ponto de conexão. */
const HUBS = [
  'GRU', 'VCP', 'CGH', 'GIG', 'BSB', 'CNF', 'CWB', 'REC', 'SSA', 'FOR', 'POA', 'MAO', 'BEL',
  'PTY', 'BOG', 'LIM', 'SCL', 'EZE', 'MVD',
  'MIA', 'JFK', 'ATL', 'ORD', 'DFW', 'IAH', 'MEX', 'YYZ',
  'LIS', 'MAD', 'CDG', 'AMS', 'FRA', 'LHR', 'FCO', 'MXP', 'IST', 'MUC',
  'DXB', 'DOH', 'ADD', 'JNB', 'CMN',
];

const COMPANHIAS_GLOBAIS = ['LA', 'TP', 'AF', 'KL', 'LH', 'IB', 'AA', 'UA', 'CM', 'TK', 'EK', 'QR'];

const VENDEDORES_TERCEIROS = [
  'Consolidador Voa+',
  'Agência OnlineTrip',
  'Portal PassagemJá',
  'Marketplace RotaCerta',
];

const AERONAVES = ['A320', 'A321neo', 'B737-800', 'B737 MAX 8', 'E195-E2', 'A330-900', 'B787-9'];

function paisDe(iata: string): string {
  return buscarAeroporto(iata)?.paisIso ?? '??';
}

/** Companhias com presença plausível nos países envolvidos na rota. */
function companhiasDaRota(paises: string[], sorteio: Sorteio): Companhia[] {
  const locais = COMPANHIAS.filter((c) => paises.includes(c.paisIso));
  const globais = COMPANHIAS.filter((c) => COMPANHIAS_GLOBAIS.includes(c.iata));
  const conjunto = new Map<string, Companhia>();
  for (const c of [...locais, ...globais]) conjunto.set(c.iata, c);
  const lista = [...conjunto.values()];
  // Embaralhamento determinístico para variar quem aparece primeiro.
  return lista.sort(() => sorteio.proximo() - 0.5);
}

/** Hubs que não desviam demais da rota direta. */
function hubsViaveis(origem: string, destino: string): string[] {
  const direto = distanciaKm(origem, destino);
  if (direto === 0) return [];

  return HUBS.filter((h) => h !== origem && h !== destino)
    .map((h) => ({
      h,
      desvio: (distanciaKm(origem, h) + distanciaKm(h, destino)) / direto,
      perna: distanciaKm(origem, h),
    }))
    .filter((x) => x.desvio <= 1.6 && x.perna >= 150)
    .sort((a, b) => a.desvio - b.desvio)
    .slice(0, 8)
    .map((x) => x.h);
}

/** Aeroporto irmão na mesma região metropolitana, se existir. */
function aeroportoIrmao(iata: string): string | undefined {
  const base = buscarAeroporto(iata);
  if (!base?.areaMetropolitana) return undefined;
  return AEROPORTOS.find(
    (a) => a.iata !== iata && a.areaMetropolitana === base.areaMetropolitana,
  )?.iata;
}

// ---------------------------------------------------------------- preços

/** Preço de referência da rota, por adulto, em reais. */
function precoBase(origem: string, destino: string): number {
  const km = distanciaKm(origem, destino);
  if (km === 0) return 900;
  return 240 + Math.pow(km, 0.9) * 0.75;
}

/** Crianças pagam menos, bebês de colo quase nada. */
function multiplicadorPassageiros(p: ConsultaTrecho['passageiros']): number {
  return p.adultos + p.criancas * 0.75 + p.bebes * 0.1;
}

// ---------------------------------------------------------------- montagem

function montarSegmento(
  companhia: Companhia,
  origem: string,
  destino: string,
  partida: string,
  sorteio: Sorteio,
): Segmento {
  const duracaoMin = duracaoVooMin(origem, destino);
  return {
    companhia: companhia.iata,
    numeroVoo: String(sorteio.inteiro(100, 9899)),
    origem,
    destino,
    partida,
    chegada: somarMinutos(partida, duracaoMin + diferencaFusoMin(origem, destino)),
    duracaoMin,
    aeronave: sorteio.escolher(AERONAVES),
  };
}

function montarBilhete(params: {
  id: string;
  segmentos: Segmento[];
  precoBRL: number;
  tipoTarifa: TipoTarifa;
  vendedor: string;
  bagagemDespachada: boolean;
  sorteio: Sorteio;
}): Bilhete {
  const { tipoTarifa } = params;
  return {
    id: params.id,
    segmentos: params.segmentos,
    precoBRL: Math.round(params.precoBRL),
    tipoTarifa,
    vendedor: params.vendedor,
    bagagemDespachada: params.bagagemDespachada,
    bagagemMaoKg: tipoTarifa === 'promo' ? 10 : 12,
    remarcavel: tipoTarifa === 'flex' || tipoTarifa === 'classica',
    reembolsavel: tipoTarifa === 'flex',
  };
}

function montarItinerario(id: string, bilhetes: Bilhete[]): Itinerario {
  const segmentos = bilhetes.flatMap((b) => b.segmentos);
  const primeiro = segmentos[0];
  const ultimo = segmentos[segmentos.length - 1];

  // Duração somando voos e esperas: imune a diferença de fuso entre pontas.
  const tempoVoando = segmentos.reduce((s, seg) => s + seg.duracaoMin, 0);
  const tempoEsperando = segmentos
    .slice(0, -1)
    .reduce((s, seg, i) => s + diferencaMin(seg.chegada, segmentos[i + 1].partida), 0);

  return {
    id,
    bilhetes,
    origem: primeiro.origem,
    destino: ultimo.destino,
    partida: primeiro.partida,
    chegada: ultimo.chegada,
    duracaoTotalMin: tempoVoando + tempoEsperando,
    paradas: segmentos.length - 1,
    precoBRL: bilhetes.reduce((s, b) => s + b.precoBRL, 0),
  };
}

/** Horários de partida plausíveis, em minutos desde a meia-noite. */
const SLOTS_PARTIDA = [345, 420, 480, 540, 615, 690, 750, 840, 900, 990, 1080, 1140, 1215, 1290];
const SLOTS_MADRUGADA = [15, 75, 130, 190];

type Molde =
  | 'direto'
  | 'conexao-folgada'
  | 'conexao-justa'
  | 'conexao-impossivel'
  | 'duas-paradas'
  | 'bilhetes-separados'
  | 'troca-aeroporto'
  | 'madrugada';

/** Faixa de preço de cada molde, como fração do preço de referência. */
const FATOR_PRECO: Record<Molde, [number, number]> = {
  direto: [1.0, 1.3],
  'conexao-folgada': [0.82, 0.98],
  'conexao-justa': [0.7, 0.82],
  'conexao-impossivel': [0.62, 0.72],
  'duas-paradas': [0.6, 0.72],
  'bilhetes-separados': [0.46, 0.6],
  'troca-aeroporto': [0.5, 0.62],
  madrugada: [0.66, 0.8],
};

export function criarProvedorSimulado(): ProvedorBusca {
  return {
    nome: 'simulado',
    simulado: true,
    async buscarTrecho(consulta: ConsultaTrecho): Promise<Itinerario[]> {
      return gerarItinerarios(consulta);
    },
  };
}

export function gerarItinerarios(consulta: ConsultaTrecho): Itinerario[] {
  const { origem, destino, data } = consulta;
  if (origem === destino) return [];
  if (!buscarAeroporto(origem) || !buscarAeroporto(destino)) return [];

  const sorteio = criarSorteio(`${origem}-${destino}-${data}`);
  const hubs = hubsViaveis(origem, destino);
  const paises = [paisDe(origem), paisDe(destino), ...hubs.map(paisDe)];
  const companhias = companhiasDaRota(paises, sorteio);
  const base = precoBase(origem, destino) * multiplicadorPassageiros(consulta.passageiros);
  const distancia = distanciaKm(origem, destino);

  // Rotas curtas raramente têm conexão; rotas longas raramente têm voo direto.
  const moldes: Molde[] = [];
  const temDireto = distancia < 11000;
  if (temDireto) moldes.push('direto', 'direto');
  if (hubs.length > 0) {
    moldes.push('conexao-folgada', 'conexao-folgada', 'conexao-justa', 'conexao-impossivel');
    moldes.push('bilhetes-separados', 'bilhetes-separados', 'madrugada');
    if (hubs.length > 1) moldes.push('duas-paradas');
    if (hubs.some((h) => aeroportoIrmao(h))) moldes.push('troca-aeroporto');
  }
  if (moldes.length === 0) moldes.push('direto');

  const itinerarios: Itinerario[] = [];
  moldes.forEach((molde, indice) => {
    const it = gerarPorMolde({
      molde,
      indice,
      origem,
      destino,
      data,
      hubs,
      companhias,
      base,
      sorteio,
    });
    if (it) itinerarios.push(it);
  });

  return itinerarios;
}

type ContextoGeracao = {
  molde: Molde;
  indice: number;
  origem: string;
  destino: string;
  data: string;
  hubs: string[];
  companhias: Companhia[];
  base: number;
  sorteio: Sorteio;
};

function gerarPorMolde(ctx: ContextoGeracao): Itinerario | null {
  const { molde, indice, origem, destino, data, hubs, companhias, base, sorteio } = ctx;
  const id = `${molde}-${indice}`;
  const [fatorMin, fatorMax] = FATOR_PRECO[molde];
  const preco = base * sorteio.entre(fatorMin, fatorMax);
  const cia = sorteio.escolher(companhias);

  const partida = montarHorario(
    data,
    molde === 'madrugada' ? sorteio.escolher(SLOTS_MADRUGADA) : sorteio.escolher(SLOTS_PARTIDA),
  );

  if (molde === 'direto') {
    return montarItinerario(id, [
      montarBilhete({
        id: `${id}-b1`,
        segmentos: [montarSegmento(cia, origem, destino, partida, sorteio)],
        precoBRL: preco,
        tipoTarifa: sorteio.chance(0.4) ? 'classica' : 'basica',
        vendedor: cia.nome,
        bagagemDespachada: sorteio.chance(0.55),
        sorteio,
      }),
    ]);
  }

  if (hubs.length === 0) return null;

  // ---- Molde com troca de aeroporto na conexão ----
  if (molde === 'troca-aeroporto') {
    const hub = hubs.find((h) => aeroportoIrmao(h));
    const irmao = hub ? aeroportoIrmao(hub) : undefined;
    if (!hub || !irmao) return null;

    const perna1 = montarSegmento(cia, origem, hub, partida, sorteio);
    const ciaB = sorteio.escolher(companhias);
    const perna2 = montarSegmento(
      ciaB,
      irmao,
      destino,
      somarMinutos(perna1.chegada, sorteio.inteiro(210, 330)),
      sorteio,
    );

    // Aeroportos diferentes só se conectam por bilhetes separados.
    return montarItinerario(id, [
      montarBilhete({
        id: `${id}-b1`,
        segmentos: [perna1],
        precoBRL: preco * 0.45,
        tipoTarifa: 'promo',
        vendedor: cia.nome,
        bagagemDespachada: false,
        sorteio,
      }),
      montarBilhete({
        id: `${id}-b2`,
        segmentos: [perna2],
        precoBRL: preco * 0.55,
        tipoTarifa: 'promo',
        vendedor: sorteio.escolher(VENDEDORES_TERCEIROS),
        bagagemDespachada: false,
        sorteio,
      }),
    ]);
  }

  // ---- Molde com dois bilhetes independentes no mesmo aeroporto ----
  if (molde === 'bilhetes-separados') {
    const hub = sorteio.escolher(hubs);
    const perna1 = montarSegmento(cia, origem, hub, partida, sorteio);
    const ciaB = sorteio.escolher(companhias.filter((c) => c.iata !== cia.iata).concat(cia));
    // Metade das ofertas com margem confortável, metade com margem irreal.
    const espera = sorteio.chance(0.5) ? sorteio.inteiro(80, 165) : sorteio.inteiro(200, 380);
    const perna2 = montarSegmento(
      ciaB,
      hub,
      destino,
      somarMinutos(perna1.chegada, espera),
      sorteio,
    );

    return montarItinerario(id, [
      montarBilhete({
        id: `${id}-b1`,
        segmentos: [perna1],
        precoBRL: preco * 0.48,
        tipoTarifa: 'promo',
        vendedor: sorteio.escolher(VENDEDORES_TERCEIROS),
        bagagemDespachada: false,
        sorteio,
      }),
      montarBilhete({
        id: `${id}-b2`,
        segmentos: [perna2],
        precoBRL: preco * 0.52,
        tipoTarifa: 'promo',
        vendedor: sorteio.escolher(VENDEDORES_TERCEIROS),
        bagagemDespachada: false,
        sorteio,
      }),
    ]);
  }

  // ---- Moldes de bilhete único com uma ou duas conexões ----
  const hubsEscolhidos =
    molde === 'duas-paradas'
      ? [hubs[0], hubs.find((h) => h !== hubs[0]) ?? hubs[0]]
      : [sorteio.escolher(hubs)];

  const segmentos: Segmento[] = [];
  let atual = origem;
  let horario = partida;

  hubsEscolhidos.forEach((hub, i) => {
    const seg = montarSegmento(i === 0 ? cia : sorteio.escolher(companhias), atual, hub, horario, sorteio);
    segmentos.push(seg);
    atual = hub;
    horario = somarMinutos(seg.chegada, esperaDoMolde(molde, atual, sorteio));
  });

  segmentos.push(montarSegmento(cia, atual, destino, horario, sorteio));

  const tarifa: TipoTarifa =
    molde === 'conexao-folgada' && sorteio.chance(0.35) ? 'classica' : 'basica';

  return montarItinerario(id, [
    montarBilhete({
      id: `${id}-b1`,
      segmentos,
      precoBRL: preco,
      tipoTarifa: tarifa,
      vendedor: sorteio.chance(0.7) ? cia.nome : sorteio.escolher(VENDEDORES_TERCEIROS),
      bagagemDespachada: tarifa === 'classica' ? true : sorteio.chance(0.3),
      sorteio,
    }),
  ]);
}

/** Espera de conexão característica de cada molde, em minutos. */
function esperaDoMolde(molde: Molde, hub: string, sorteio: Sorteio): number {
  const internacional = paisDe(hub) !== 'BR';
  switch (molde) {
    case 'conexao-impossivel':
      return internacional ? sorteio.inteiro(45, 80) : sorteio.inteiro(25, 42);
    case 'conexao-justa':
      return internacional ? sorteio.inteiro(95, 110) : sorteio.inteiro(50, 66);
    case 'madrugada':
      return sorteio.inteiro(70, 150);
    case 'duas-paradas':
      return sorteio.inteiro(75, 200);
    default:
      return internacional ? sorteio.inteiro(150, 420) : sorteio.inteiro(90, 300);
  }
}
