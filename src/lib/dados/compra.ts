/**
 * Onde comprar cada passagem.
 *
 * Este site não emite bilhete: emitir exige credenciamento IATA ou operar sob
 * uma consolidadora. O que ele faz é o mesmo que Google Flights, Kayak e
 * Skyscanner fazem — encontra, analisa o risco e entrega a compra a quem tem
 * autorização para vender, com a rota e as datas já preenchidas.
 *
 * A ordem importa: a companhia vem primeiro. Comprando direto, um problema se
 * resolve com quem opera o voo, sem intermediário para empurrar a culpa.
 */

/** Sites de venda das companhias do catálogo. */
export const SITES_COMPANHIA: Record<string, string> = {
  G3: 'https://www.voegol.com.br',
  AD: 'https://www.voeazul.com.br',
  LA: 'https://www.latamairlines.com/br/pt',
  '2Z': 'https://www.voepass.com.br',
  TP: 'https://www.flytap.com/pt-br',
  AA: 'https://www.aa.com.br',
  UA: 'https://www.united.com/pt/br',
  DL: 'https://pt.delta.com',
  B6: 'https://www.jetblue.com',
  AC: 'https://www.aircanada.com',
  AM: 'https://www.aeromexico.com',
  CM: 'https://www.copaair.com/pt-gs/',
  AV: 'https://www.avianca.com',
  AR: 'https://www.aerolineas.com.ar',
  H2: 'https://www.skyairline.com',
  JA: 'https://jetsmart.com',
  IB: 'https://www.iberia.com/br/',
  UX: 'https://www.aireuropa.com/br/pt',
  AF: 'https://wwws.airfrance.com.br',
  KL: 'https://www.klm.com.br',
  LH: 'https://www.lufthansa.com/br/pt',
  LX: 'https://www.swiss.com',
  BA: 'https://www.britishairways.com/pt-br/',
  AZ: 'https://www.ita-airways.com',
  FR: 'https://www.ryanair.com',
  U2: 'https://www.easyjet.com',
  TK: 'https://www.turkishairlines.com/pt-br/',
  EK: 'https://www.emirates.com/br/portuguese/',
  QR: 'https://www.qatarairways.com/pt-br/',
  ET: 'https://www.ethiopianairlines.com',
  SA: 'https://www.flysaa.com',
};

export type OpcaoCompra = {
  nome: string;
  url: string;
  /** `companhia` abre o site de quem opera o voo; `busca`, um comparador. */
  tipo: 'companhia' | 'busca';
  observacao?: string;
};

/** AAAA-MM-DD para AAMMDD, formato de URL do Skyscanner. */
function dataCurta(data: string): string {
  return data.slice(2).replace(/-/g, '');
}

/**
 * Buscadores que aceitam rota e data na própria URL.
 *
 * Nenhum deles é neutro: cada um mostra o que os seus parceiros pagam para
 * aparecer, e por isso os preços divergem entre eles. Abrir dois ou três e
 * comparar é o que evita pagar a mais.
 */
export function buscadores(
  origem: string,
  destino: string,
  ida: string,
  volta?: string,
): OpcaoCompra[] {
  const o = origem.toUpperCase();
  const d = destino.toUpperCase();

  const consultaGoogle = volta
    ? `Voos de ${o} para ${d} em ${ida} voltando ${volta}`
    : `Voos de ${o} para ${d} em ${ida} somente ida`;

  return [
    {
      nome: 'Google Flights',
      tipo: 'busca',
      url: `https://www.google.com/travel/flights?q=${encodeURIComponent(consultaGoogle)}`,
      observacao: 'Mostra o preço de várias companhias e leva para o site delas.',
    },
    {
      nome: 'Kayak',
      tipo: 'busca',
      url: `https://www.kayak.com.br/flights/${o}-${d}/${ida}${volta ? `/${volta}` : ''}`,
      observacao: 'Compara companhias e agências ao mesmo tempo.',
    },
    {
      nome: 'Skyscanner',
      tipo: 'busca',
      url: `https://www.skyscanner.com.br/transport/flights/${o.toLowerCase()}/${d.toLowerCase()}/${dataCurta(ida)}/${volta ? `${dataCurta(volta)}/` : ''}`,
      observacao: 'Bom para achar datas mais baratas no mês.',
    },
    {
      nome: 'Kiwi.com',
      tipo: 'busca',
      url: `https://www.kiwi.com/pt/search/results/${o}/${d}/${ida}${volta ? `/${volta}` : ''}`,
      observacao:
        'Costuma ser o mais barato porque junta passagens separadas — leia o alerta de risco antes.',
    },
  ];
}

/**
 * Companhias que operam o itinerário e têm site conhecido.
 *
 * Só vale a pena mandar para a companhia quando um único operador faz a
 * viagem inteira: com duas companhias diferentes, o site de uma delas não
 * vende o trecho da outra.
 */
export function companhiasDoItinerario(
  codigos: string[],
  nomePorCodigo: (iata: string) => string,
): OpcaoCompra[] {
  const unicos = [...new Set(codigos)];
  if (unicos.length !== 1) return [];

  const codigo = unicos[0];
  const url = SITES_COMPANHIA[codigo];
  if (!url) return [];

  return [
    {
      nome: nomePorCodigo(codigo),
      url,
      tipo: 'companhia',
      observacao: 'Comprando direto, um problema se resolve com quem opera o voo.',
    },
  ];
}
