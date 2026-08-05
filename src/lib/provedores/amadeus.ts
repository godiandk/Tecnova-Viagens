import type { Bilhete, Itinerario, Segmento, TipoTarifa } from '@/lib/tipos';
import { diferencaMin } from '@/lib/tempo';
import type { ConsultaTrecho, ProvedorBusca } from '@/lib/provedores/tipos';

/**
 * Provedor real, apoiado na Amadeus Self-Service (Flight Offers Search v2).
 *
 * Ativa-se sozinho quando AMADEUS_CLIENT_ID e AMADEUS_CLIENT_SECRET existem no
 * ambiente. O ambiente `test` da Amadeus é gratuito, mas devolve um subconjunto
 * do inventário com preços defasados — bom para desenvolver, ruim para decidir
 * compra. Para produção, troque AMADEUS_AMBIENTE para `producao`.
 *
 * A API entrega cada oferta como um bilhete único, então itinerários vindos daqui
 * nunca disparam o alerta de bilhetes separados. Isso é fiel à realidade: quem
 * vende autoconexão são agregadores que montam bilhetes avulsos.
 */

const ENDERECOS = {
  test: 'https://test.api.amadeus.com',
  producao: 'https://api.amadeus.com',
} as const;

function enderecoBase(): string {
  return process.env.AMADEUS_AMBIENTE === 'producao' ? ENDERECOS.producao : ENDERECOS.test;
}

export function amadeusConfigurado(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

// O token vale ~30 min; guardar evita uma ida ao servidor de auth por busca.
let tokenCache: { valor: string; expiraEm: number } | null = null;

async function obterToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiraEm) return tokenCache.valor;

  const resposta = await fetch(`${enderecoBase()}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID ?? '',
      client_secret: process.env.AMADEUS_CLIENT_SECRET ?? '',
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao autenticar na Amadeus (HTTP ${resposta.status})`);
  }

  const dados = (await resposta.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    valor: dados.access_token,
    // Margem de 60s para não usar um token que expira no meio da chamada.
    expiraEm: Date.now() + Math.max(0, dados.expires_in - 60) * 1000,
  };
  return tokenCache.valor;
}

/** Converte duração ISO 8601 ("PT11H45M") em minutos. */
export function duracaoIsoParaMinutos(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!m) return 0;
  const [, dias, horas, minutos] = m;
  return Number(dias ?? 0) * 1440 + Number(horas ?? 0) * 60 + Number(minutos ?? 0);
}

// Recorte tipado apenas do que consumimos da resposta da Amadeus.
type SegmentoAmadeus = {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  aircraft?: { code?: string };
  duration?: string;
};

type OfertaAmadeus = {
  id: string;
  itineraries: { duration?: string; segments: SegmentoAmadeus[] }[];
  price: { grandTotal?: string; total?: string; currency?: string };
  pricingOptions?: { refundableFare?: boolean; noPenaltyFare?: boolean };
  validatingAirlineCodes?: string[];
  travelerPricings?: {
    fareDetailsBySegment?: {
      cabin?: string;
      brandedFare?: string;
      includedCheckedBags?: { quantity?: number; weight?: number };
    }[];
  }[];
};

type RespostaAmadeus = {
  data?: OfertaAmadeus[];
  dictionaries?: { carriers?: Record<string, string> };
  errors?: { title?: string; detail?: string }[];
};

function converterSegmento(s: SegmentoAmadeus): Segmento {
  return {
    companhia: s.carrierCode,
    numeroVoo: s.number,
    origem: s.departure.iataCode,
    destino: s.arrival.iataCode,
    partida: s.departure.at,
    chegada: s.arrival.at,
    duracaoMin: s.duration ? duracaoIsoParaMinutos(s.duration) : 0,
    aeronave: s.aircraft?.code,
  };
}

function inferirTarifa(oferta: OfertaAmadeus): TipoTarifa {
  const reembolsavel = oferta.pricingOptions?.refundableFare === true;
  const semMulta = oferta.pricingOptions?.noPenaltyFare === true;
  if (reembolsavel && semMulta) return 'flex';
  if (semMulta) return 'classica';
  const marca = oferta.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare?.toUpperCase();
  if (marca && /BASIC|LIGHT|PROMO/.test(marca)) return 'promo';
  return 'basica';
}

function converterOferta(oferta: OfertaAmadeus, nomesCia: Record<string, string>): Itinerario | null {
  const primeiroItinerario = oferta.itineraries?.[0];
  if (!primeiroItinerario?.segments?.length) return null;

  const segmentos = primeiroItinerario.segments.map(converterSegmento);
  const precoBRL = Number(oferta.price.grandTotal ?? oferta.price.total ?? 0);
  if (!Number.isFinite(precoBRL) || precoBRL <= 0) return null;

  const bagagens = oferta.travelerPricings?.[0]?.fareDetailsBySegment ?? [];
  const bagagemDespachada = bagagens.some(
    (f) => (f.includedCheckedBags?.quantity ?? 0) > 0 || (f.includedCheckedBags?.weight ?? 0) > 0,
  );

  const tipoTarifa = inferirTarifa(oferta);
  const codigoCia = oferta.validatingAirlineCodes?.[0] ?? segmentos[0].companhia;

  const bilhete: Bilhete = {
    id: `amadeus-${oferta.id}`,
    segmentos,
    precoBRL: Math.round(precoBRL),
    tipoTarifa,
    vendedor: nomesCia[codigoCia] ?? codigoCia,
    bagagemDespachada,
    bagagemMaoKg: 10,
    remarcavel: oferta.pricingOptions?.noPenaltyFare === true,
    reembolsavel: oferta.pricingOptions?.refundableFare === true,
  };

  const tempoVoando = segmentos.reduce((s, seg) => s + seg.duracaoMin, 0);
  const tempoEsperando = segmentos
    .slice(0, -1)
    .reduce((s, seg, i) => s + diferencaMin(seg.chegada, segmentos[i + 1].partida), 0);
  const duracaoDeclarada = primeiroItinerario.duration
    ? duracaoIsoParaMinutos(primeiroItinerario.duration)
    : 0;

  return {
    id: `amadeus-${oferta.id}`,
    bilhetes: [bilhete],
    origem: segmentos[0].origem,
    destino: segmentos[segmentos.length - 1].destino,
    partida: segmentos[0].partida,
    chegada: segmentos[segmentos.length - 1].chegada,
    duracaoTotalMin: duracaoDeclarada || tempoVoando + tempoEsperando,
    paradas: segmentos.length - 1,
    precoBRL: Math.round(precoBRL),
  };
}

export function criarProvedorAmadeus(): ProvedorBusca {
  return {
    nome: 'amadeus',
    simulado: process.env.AMADEUS_AMBIENTE !== 'producao',
    async buscarTrecho(consulta: ConsultaTrecho): Promise<Itinerario[]> {
      const token = await obterToken();

      const parametros = new URLSearchParams({
        originLocationCode: consulta.origem,
        destinationLocationCode: consulta.destino,
        departureDate: consulta.data,
        adults: String(Math.max(1, consulta.passageiros.adultos)),
        currencyCode: 'BRL',
        max: '30',
      });
      if (consulta.passageiros.criancas > 0) {
        parametros.set('children', String(consulta.passageiros.criancas));
      }
      if (consulta.passageiros.bebes > 0) {
        parametros.set('infants', String(consulta.passageiros.bebes));
      }

      const resposta = await fetch(
        `${enderecoBase()}/v2/shopping/flight-offers?${parametros.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => null)) as RespostaAmadeus | null;
        const detalhe = corpo?.errors?.[0]?.detail ?? corpo?.errors?.[0]?.title ?? '';
        throw new Error(
          `Amadeus respondeu HTTP ${resposta.status}${detalhe ? `: ${detalhe}` : ''}`,
        );
      }

      const corpo = (await resposta.json()) as RespostaAmadeus;
      const nomesCia = corpo.dictionaries?.carriers ?? {};

      return (corpo.data ?? [])
        .map((oferta) => converterOferta(oferta, nomesCia))
        .filter((it): it is Itinerario => it !== null);
    },
  };
}
