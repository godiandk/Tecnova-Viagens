/**
 * Central de buscas: onde procurar cada tipo de viagem.
 *
 * Nenhum botão consulta todos os sites de uma vez — isso exigiria contrato e
 * API com cada um deles, e nem os grandes buscadores fazem. O que este
 * catálogo faz é reunir os endereços que valem a pena, agrupados por assunto,
 * já com a rota e as datas preenchidas quando o site aceita isso na URL.
 *
 * A lista é curada, não exaustiva: entra quem tem operação estabelecida. Um
 * site a mais que ninguém conhece não ajuda a decidir, e a promessa de preço
 * baixo de quem não tem lastro já custou caro a muita gente no Brasil.
 */

export type Fonte = {
  nome: string;
  url: string;
  /** Uma linha dizendo para que serve e quando escolher. */
  nota: string;
  /** Marca quem costuma valer a primeira olhada. */
  destaque?: boolean;
};

export type Topico = {
  id: string;
  titulo: string;
  /** Explica o assunto em linguagem do dia a dia, antes da lista. */
  descricao: string;
  emoji: string;
  fontes: Fonte[];
};

/** AAAA-MM-DD para AAMMDD, formato de URL do Skyscanner. */
function dataCurta(data: string): string {
  return data.slice(2).replace(/-/g, '');
}

/**
 * Buscadores de voo que aceitam rota e data na URL.
 *
 * São os únicos que dá para abrir com a viagem já preenchida — por isso ficam
 * separados do catálogo geral, que é só uma lista de endereços.
 */
export function buscadoresDeVoo(
  origem: string,
  destino: string,
  ida: string,
  volta?: string,
): Fonte[] {
  const o = origem.toUpperCase();
  const d = destino.toUpperCase();
  const consulta = volta
    ? `Voos de ${o} para ${d} em ${ida} voltando ${volta}`
    : `Voos de ${o} para ${d} em ${ida} somente ida`;

  return [
    {
      nome: 'Google Flights',
      destaque: true,
      url: `https://www.google.com/travel/flights?q=${encodeURIComponent(consulta)}`,
      nota: 'O mais rápido para ter uma noção do preço justo. Leva para o site da companhia.',
    },
    {
      nome: 'Kayak',
      destaque: true,
      url: `https://www.kayak.com.br/flights/${o}-${d}/${ida}${volta ? `/${volta}` : ''}`,
      nota: 'Compara companhias e agências lado a lado.',
    },
    {
      nome: 'Skyscanner',
      destaque: true,
      url: `https://www.skyscanner.com.br/transport/flights/${o.toLowerCase()}/${d.toLowerCase()}/${dataCurta(ida)}/${volta ? `${dataCurta(volta)}/` : ''}`,
      nota: 'Tem o calendário do mês inteiro: bom quando a data é flexível.',
    },
    {
      nome: 'Kiwi.com',
      url: `https://www.kiwi.com/pt/search/results/${o}/${d}/${ida}${volta ? `/${volta}` : ''}`,
      nota: 'Costuma ser o mais barato porque junta passagens separadas — leia o alerta de risco.',
    },
    {
      nome: 'Momondo',
      url: `https://www.momondo.com.br/flight-search/${o}-${d}/${ida}${volta ? `/${volta}` : ''}`,
      nota: 'Mesmo grupo do Kayak, mas às vezes mostra tarifas diferentes. Vale conferir.',
    },
  ];
}

export const TOPICOS: Topico[] = [
  {
    id: 'companhias-brasil',
    titulo: 'Companhias aéreas do Brasil',
    emoji: '🇧🇷',
    descricao:
      'Comprar direto com quem opera o voo é o caminho mais seguro. Se der problema, você ' +
      'resolve com a própria empresa, sem ninguém no meio empurrando a culpa.',
    fontes: [
      { nome: 'LATAM', url: 'https://www.latamairlines.com/br/pt', nota: 'Maior malha internacional saindo do Brasil.', destaque: true },
      { nome: 'GOL', url: 'https://www.voegol.com.br', nota: 'Forte no doméstico e em voos para a América do Sul.', destaque: true },
      { nome: 'Azul', url: 'https://www.voeazul.com.br', nota: 'Chega a cidades menores que as outras não atendem.', destaque: true },
      { nome: 'Voepass', url: 'https://www.voepass.com.br', nota: 'Regional, complementa trechos curtos.' },
    ],
  },
  {
    id: 'companhias-mundo',
    titulo: 'Companhias aéreas de fora',
    emoji: '🌍',
    descricao:
      'Para voos internacionais, às vezes a companhia estrangeira sai melhor que a brasileira. ' +
      'Vale abrir o site dela e comparar com o que o buscador mostrou.',
    fontes: [
      { nome: 'TAP (Portugal)', url: 'https://www.flytap.com/pt-br', nota: 'Porta de entrada mais comum para a Europa.' },
      { nome: 'Iberia (Espanha)', url: 'https://www.iberia.com/br/', nota: 'Conexão por Madri para a Europa toda.' },
      { nome: 'Air Europa (Espanha)', url: 'https://www.aireuropa.com/br/pt', nota: 'Costuma ter tarifa boa via Madri.' },
      { nome: 'Air France', url: 'https://wwws.airfrance.com.br', nota: 'Conexão por Paris.' },
      { nome: 'KLM (Países Baixos)', url: 'https://www.klm.com.br', nota: 'Conexão por Amsterdã.' },
      { nome: 'Lufthansa (Alemanha)', url: 'https://www.lufthansa.com/br/pt', nota: 'Conexão por Frankfurt ou Munique.' },
      { nome: 'ITA Airways (Itália)', url: 'https://www.ita-airways.com', nota: 'Voo direto para Roma.' },
      { nome: 'British Airways', url: 'https://www.britishairways.com/pt-br/', nota: 'Conexão por Londres.' },
      { nome: 'Turkish Airlines', url: 'https://www.turkishairlines.com/pt-br/', nota: 'Istambul conecta Europa, Ásia e África.' },
      { nome: 'Emirates', url: 'https://www.emirates.com/br/portuguese/', nota: 'Via Dubai, para Ásia e Oceania.' },
      { nome: 'Qatar Airways', url: 'https://www.qatarairways.com/pt-br/', nota: 'Via Doha, muito bem avaliada em serviço.' },
      { nome: 'Ethiopian Airlines', url: 'https://www.ethiopianairlines.com', nota: 'Melhor caminho para a África.' },
      { nome: 'Copa Airlines (Panamá)', url: 'https://www.copaair.com/pt-gs/', nota: 'Conecta quase toda a América pelo Panamá.' },
      { nome: 'American Airlines', url: 'https://www.aa.com.br', nota: 'Estados Unidos e Caribe.' },
      { nome: 'United Airlines', url: 'https://www.united.com/pt/br', nota: 'Estados Unidos.' },
      { nome: 'Delta', url: 'https://pt.delta.com', nota: 'Estados Unidos.' },
      { nome: 'Air Canada', url: 'https://www.aircanada.com', nota: 'Canadá.' },
      { nome: 'Aeroméxico', url: 'https://www.aeromexico.com', nota: 'México e Caribe.' },
      { nome: 'Avianca', url: 'https://www.avianca.com', nota: 'Colômbia e norte da América do Sul.' },
      { nome: 'Aerolíneas Argentinas', url: 'https://www.aerolineas.com.ar', nota: 'Argentina e Patagônia.' },
    ],
  },
  {
    id: 'low-cost',
    titulo: 'Companhias baratas dentro da Europa',
    emoji: '💸',
    descricao:
      'Voar entre cidades europeias pode custar muito pouco. O preço anunciado é só o assento: ' +
      'mala, escolher poltrona e até imprimir o cartão de embarque podem ser cobrados à parte. ' +
      'Some tudo antes de comemorar.',
    fontes: [
      { nome: 'Ryanair', url: 'https://www.ryanair.com', nota: 'A mais barata e a mais rígida. Voa para aeroportos afastados — confira a distância até o centro.', destaque: true },
      { nome: 'easyJet', url: 'https://www.easyjet.com', nota: 'Um pouco mais cara que a Ryanair, costuma usar aeroportos melhores.' },
      { nome: 'Vueling', url: 'https://www.vueling.com', nota: 'Boa malha na Espanha e Itália.' },
      { nome: 'Wizz Air', url: 'https://wizzair.com', nota: 'Forte no Leste Europeu.' },
      { nome: 'Transavia', url: 'https://www.transavia.com', nota: 'Do grupo Air France-KLM.' },
    ],
  },
  {
    id: 'cruzeiros-mar',
    titulo: 'Cruzeiros marítimos',
    emoji: '🚢',
    descricao:
      'O navio é hotel, restaurante e transporte ao mesmo tempo. O preço quase nunca inclui ' +
      'bebida, gorjeta obrigatória e passeios em terra — pergunte o que está dentro antes de fechar.',
    fontes: [
      { nome: 'MSC Cruzeiros', url: 'https://www.msccruzeiros.com.br', nota: 'A maior operação na costa do Brasil.', destaque: true },
      { nome: 'Costa Cruzeiros', url: 'https://www.costacruzeiros.com', nota: 'Italiana, opera no Brasil e no Mediterrâneo.', destaque: true },
      { nome: 'Royal Caribbean', url: 'https://www.royalcaribbean.com', nota: 'Navios enormes, muita atração a bordo. Caribe e Mediterrâneo.' },
      { nome: 'Norwegian (NCL)', url: 'https://www.ncl.com', nota: 'Formato mais livre, sem horário fixo de jantar.' },
      { nome: 'Celebrity Cruises', url: 'https://www.celebritycruises.com', nota: 'Perfil mais adulto e sofisticado.' },
      { nome: 'Princess Cruises', url: 'https://www.princess.com', nota: 'Boa para Alasca e roteiros longos.' },
      { nome: 'Disney Cruise Line', url: 'https://disneycruise.disney.go.com', nota: 'Voltado para família com criança.' },
    ],
  },
  {
    id: 'cruzeiros-rio',
    titulo: 'Cruzeiros de rio — Douro, Reno, Danúbio, Nilo',
    emoji: '⛵',
    descricao:
      'Barco pequeno navegando devagar por dentro do continente, parando em cidade a cada dia. ' +
      'O Douro, em Portugal, é dos mais procurados: sai do Porto e sobe entre as vinhas. ' +
      'Costuma incluir mais coisa no preço que o cruzeiro de mar — inclusive passeios e bebida.',
    fontes: [
      { nome: 'Douro Azul', url: 'https://www.douroazul.com', nota: 'Operadora portuguesa, a maior do rio Douro. Sai do Porto.', destaque: true },
      { nome: 'CroisiEurope', url: 'https://www.croisieurope.com', nota: 'Francesa, cobre Douro, Reno, Danúbio, Sena e Ródano. Boa relação preço/serviço.', destaque: true },
      { nome: 'Viking River Cruises', url: 'https://www.vikingrivercruises.com', nota: 'A mais conhecida em rios europeus. Padrão alto.', destaque: true },
      { nome: 'AmaWaterways', url: 'https://www.amawaterways.com', nota: 'Douro, Danúbio e Reno. Navios menores.' },
      { nome: 'Uniworld', url: 'https://www.uniworld.com', nota: 'Faixa de luxo, quase tudo incluído.' },
      { nome: 'Scenic', url: 'https://www.scenic.com.au', nota: 'Tudo incluído, inclusive passeios particulares.' },
      { nome: 'Riviera Travel', url: 'https://www.rivieratravel.co.uk', nota: 'Britânica, preços costumam ser competitivos.' },
      { nome: 'Nile Cruises (Egito)', url: 'https://www.viator.com/Egypt/d43-ttd', nota: 'Para o Nilo, quase sempre se compra dentro de um pacote com guia.' },
    ],
  },
  {
    id: 'passeios',
    titulo: 'Passeios, ingressos e barcos de um dia',
    emoji: '🎟️',
    descricao:
      'Passeio de barco em Veneza, ingresso do Coliseu, tour nas vinhas do Douro, city tour. ' +
      'Comprar antes evita fila e costuma sair mais barato que na hora, no local.',
    fontes: [
      { nome: 'GetYourGuide', url: 'https://www.getyourguide.com.br', nota: 'O maior catálogo da Europa. Cancelamento grátis na maioria.', destaque: true },
      { nome: 'Civitatis', url: 'https://www.civitatis.com/br/', nota: 'Muita coisa em português e com guia que fala português.', destaque: true },
      { nome: 'Viator', url: 'https://www.viator.com', nota: 'Do grupo TripAdvisor. Bom para passeios fora da Europa.' },
      { nome: 'Klook', url: 'https://www.klook.com/pt-BR/', nota: 'Melhor cobertura de Ásia.' },
      { nome: 'Musement', url: 'https://www.musement.com/br/', nota: 'Forte em museu e atração cultural na Itália.' },
      { nome: 'Tiqets', url: 'https://www.tiqets.com/pt/', nota: 'Especializado em ingresso de museu, entra direto pelo celular.' },
    ],
  },
  {
    id: 'trem-onibus',
    titulo: 'Trem e ônibus',
    emoji: '🚆',
    descricao:
      'Na Europa, trem entre cidades próximas costuma ganhar do avião: você não precisa chegar ' +
      'duas horas antes nem sair para aeroporto longe do centro. Comprar com antecedência derruba muito o preço.',
    fontes: [
      { nome: 'Trainline', url: 'https://www.thetrainline.com/pt', nota: 'Compra trem de quase toda a Europa em um lugar só.', destaque: true },
      { nome: 'Rail Europe', url: 'https://www.raileurope.com', nota: 'Passes de vários dias, bom para roteiro longo.' },
      { nome: 'Rome2Rio', url: 'https://www.rome2rio.com/pt/', nota: 'Diz como ir de A a B de qualquer jeito: avião, trem, ônibus, balsa. Ótimo para planejar.', destaque: true },
      { nome: 'FlixBus', url: 'https://www.flixbus.com.br', nota: 'Ônibus barato pela Europa e também no Brasil.' },
      { nome: 'ClickBus', url: 'https://www.clickbus.com.br', nota: 'Ônibus rodoviário no Brasil.' },
      { nome: 'Buser', url: 'https://www.buser.com.br', nota: 'Alternativa de ônibus no Brasil, geralmente mais barata.' },
    ],
  },
  {
    id: 'hospedagem',
    titulo: 'Onde dormir',
    emoji: '🏨',
    descricao:
      'Compare o preço no buscador e depois abra o site do próprio hotel: às vezes ele cobra ' +
      'menos para quem reserva direto, ou dá café da manhã incluso.',
    fontes: [
      { nome: 'Booking.com', url: 'https://www.booking.com/index.pt-br.html', nota: 'Maior catálogo, muita opção com cancelamento grátis.', destaque: true },
      { nome: 'Airbnb', url: 'https://www.airbnb.com.br', nota: 'Casa e apartamento inteiro. Bom para família e estadia longa.', destaque: true },
      { nome: 'Hostelworld', url: 'https://www.hostelworld.com', nota: 'Albergues, para quem viaja gastando pouco.' },
      { nome: 'Trivago', url: 'https://www.trivago.com.br', nota: 'Compara o preço do mesmo hotel em vários sites.' },
    ],
  },
  {
    id: 'carro-seguro',
    titulo: 'Carro alugado e seguro de viagem',
    emoji: '🚗',
    descricao:
      'Seguro de viagem não é frescura: em vários países da Europa ele é exigido para entrar, e ' +
      'uma consulta médica lá fora custa mais que a viagem inteira. Compre antes de embarcar.',
    fontes: [
      { nome: 'Seguros Promo', url: 'https://www.segurospromo.com.br', nota: 'Compara seguradoras de viagem. Confira se cobre o valor exigido pelo destino.', destaque: true },
      { nome: 'Rentcars', url: 'https://www.rentcars.com', nota: 'Compara locadoras, com atendimento em português.', destaque: true },
      { nome: 'Discover Cars', url: 'https://www.discovercars.com/pt', nota: 'Bom para aluguel de carro na Europa.' },
      { nome: 'Localiza', url: 'https://www.localiza.com', nota: 'Aluguel no Brasil.' },
    ],
  },
];

/**
 * Sinais de que a oferta é golpe ou vai dar problema.
 *
 * Entra no site porque o mercado brasileiro de viagem já teve operadoras
 * grandes quebrando com passagem vendida e não emitida. Preço muito abaixo do
 * mercado não é sorte: é alguém usando o seu dinheiro para pagar a viagem de
 * outro, apostando que a próxima venda cobre a sua.
 */
export const SINAIS_DE_ALERTA = [
  {
    titulo: 'Pagamento por Pix ou transferência para uma pessoa física',
    texto:
      'Empresa de verdade recebe no CNPJ e emite nota. Pix para conta de pessoa não tem ' +
      'estorno: mandou, acabou. É o golpe mais comum e o mais difícil de reverter.',
  },
  {
    titulo: 'Preço absurdamente abaixo de todos os outros',
    texto:
      'Se um site cobra metade do que todos os outros cobram pelo mesmo voo, desconfie. ' +
      'Ou tem pegadinha nas condições, ou o dinheiro está sendo usado para tapar outro buraco.',
  },
  {
    titulo: '"Compre agora, escolha a data depois"',
    texto:
      'Pacote sem data marcada já quebrou empresa grande no Brasil e deixou muita gente sem ' +
      'viagem e sem o dinheiro. Se a data não está no bilhete, você não tem passagem: tem promessa.',
  },
  {
    titulo: 'Endereço do site parecido, mas não igual',
    texto:
      'Confira letra por letra o endereço na barra do navegador. Golpistas registram domínios ' +
      'parecidos com o da companhia. Na dúvida, digite o endereço você mesmo em vez de clicar em link.',
  },
  {
    titulo: 'Bilhete que não aparece no site da companhia',
    texto:
      'Depois de comprar, entre no site da companhia aérea com o código da reserva. Se o voo ' +
      'não aparecer lá em até 48 horas, o bilhete não foi emitido. Cobre imediatamente.',
  },
  {
    titulo: 'Pressão para decidir na hora',
    texto:
      'Contador regressivo e "última unidade" existem para você não pensar. Passagem cara hoje ' +
      'costuma estar igual amanhã — e se subir, ainda assim você não vai perder dinheiro por esperar.',
  },
];
