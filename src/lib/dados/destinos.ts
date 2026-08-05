/**
 * Lugares para ir, com busca pronta nas plataformas de passeio.
 *
 * O catálogo de sites diz ONDE procurar; isto diz O QUE procurar. Sem essa
 * camada, quem não sabe o nome do passeio fica travado numa caixa de busca
 * vazia — que é o mesmo problema de não ter o site.
 *
 * Cada lugar aponta para uma BUSCA, não para uma página de produto. Link de
 * produto quebra quando o parceiro muda de catálogo, e link quebrado num site
 * que fala sobre confiança é pior do que um clique a mais.
 */

export type Lugar = {
  nome: string;
  /** Onde fica, do jeito que a pessoa diria em voz alta. */
  onde: string;
  /** O que é e por que vale, em uma linha. */
  sobre: string;
  /** Termo usado na busca das plataformas. */
  busca: string;
  /** Site oficial, só quando é o próprio lugar que vende o ingresso. */
  oficial?: string;
};

export type Regiao = {
  id: string;
  titulo: string;
  emoji: string;
  descricao: string;
  lugares: Lugar[];
};

/** Busca na GetYourGuide — maior catálogo, cancelamento grátis na maioria. */
export function buscaGetYourGuide(termo: string): string {
  return `https://www.getyourguide.com.br/s/?q=${encodeURIComponent(termo)}`;
}

/** Busca na Civitatis — mais opções com guia falando português. */
export function buscaCivitatis(termo: string): string {
  return `https://www.civitatis.com/br/busca?q=${encodeURIComponent(termo)}`;
}

/** Busca na Viator — melhor cobertura fora da Europa. */
export function buscaViator(termo: string): string {
  return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(termo)}`;
}

export const REGIOES: Regiao[] = [
  {
    id: 'portugal',
    titulo: 'Portugal',
    emoji: '🇵🇹',
    descricao:
      'Perto do Brasil pela língua e barato perto do resto da Europa. O Porto e o vale do Douro ' +
      'concentram o que mais brasileiro procura.',
    lugares: [
      {
        nome: 'Cruzeiro das Seis Pontes',
        onde: 'Porto, no rio Douro',
        sobre:
          'Passeio de barco de cerca de uma hora que passa por baixo das seis pontes do Porto. ' +
          'É barato, sai o dia inteiro e não precisa reservar com muita antecedência.',
        busca: 'Cruzeiro seis pontes Porto Douro',
      },
      {
        nome: 'Vale do Douro e as vinhas',
        onde: 'a partir do Porto',
        sobre:
          'Dia inteiro subindo o rio entre os vinhedos em terraços, com parada para provar vinho ' +
          'do Porto. Costuma incluir transporte saindo da cidade.',
        busca: 'Vale do Douro passeio vinhas',
      },
      {
        nome: 'Caves de Vinho do Porto',
        onde: 'Vila Nova de Gaia',
        sobre: 'Visita às adegas do outro lado do rio, com prova no fim. Curto, dá para fazer no meio do dia.',
        busca: 'Caves vinho do Porto Gaia',
      },
      {
        nome: 'Parque aquático de Amarante',
        onde: 'Amarante, perto do Porto',
        sobre:
          'Parque com piscinas e escorregas no interior do norte de Portugal. Funciona no verão ' +
          '(junho a setembro) — confira a temporada antes de programar.',
        busca: 'Amarante Portugal parque aquático',
      },
      {
        nome: 'Sintra e Palácio da Pena',
        onde: 'perto de Lisboa',
        sobre: 'Palácio colorido no alto da serra. Dá para ir e voltar de Lisboa no mesmo dia.',
        busca: 'Sintra Palácio da Pena',
      },
      {
        nome: 'Grutas de Benagil',
        onde: 'Algarve',
        sobre: 'Caverna na beira do mar com um buraco no teto, só alcançável de barco ou caiaque.',
        busca: 'Benagil Algarve passeio de barco',
      },
    ],
  },
  {
    id: 'italia',
    titulo: 'Itália',
    emoji: '🇮🇹',
    descricao:
      'Os pontos famosos vivem lotados. Comprar ingresso antes não é luxo: em vários deles a ' +
      'entrada do dia esgota, e a fila sem reserva passa de duas horas.',
    lugares: [
      {
        nome: 'Coliseu, Fórum e Palatino',
        onde: 'Roma',
        sobre:
          'O ingresso é combinado com o Fórum Romano e o Monte Palatino. Compre antes: a ' +
          'entrada tem horário marcado e esgota.',
        busca: 'Coliseu Roma ingresso',
      },
      {
        nome: 'Museus do Vaticano e Capela Sistina',
        onde: 'Roma',
        sobre: 'Um dos lugares mais concorridos do mundo. Sem reserva, a fila toma a manhã inteira.',
        busca: 'Museus Vaticano Capela Sistina',
      },
      {
        nome: 'Passeio de gôndola',
        onde: 'Veneza',
        sobre: 'O clássico pelos canais. Preço é tabelado por gôndola, não por pessoa — divida o valor.',
        busca: 'Veneza passeio de gôndola',
      },
      {
        nome: 'Pompeia',
        onde: 'perto de Nápoles',
        sobre: 'Cidade soterrada pelo Vesúvio e escavada. Vale muito com guia: sem explicação são só ruínas.',
        busca: 'Pompeia visita guiada',
      },
      {
        nome: 'Costa Amalfitana',
        onde: 'sul da Itália',
        sobre: 'Vilarejos pendurados no penhasco à beira-mar. Passeio de dia inteiro, geralmente de barco ou van.',
        busca: 'Costa Amalfitana passeio',
      },
      {
        nome: 'Cinque Terre',
        onde: 'Ligúria',
        sobre: 'Cinco vilas coloridas ligadas por trem e trilha à beira do mar.',
        busca: 'Cinque Terre passeio',
      },
    ],
  },
  {
    id: 'nordeste',
    titulo: 'Nordeste do Brasil',
    emoji: '🏝️',
    descricao:
      'Passeio de piscina natural depende da maré: só dá em certos horários do dia, e eles mudam ' +
      'a cada dia. Reserve antes e confirme o horário da maré na data.',
    lugares: [
      {
        nome: 'Galés de Maragogi',
        onde: 'Maragogi, Alagoas',
        sobre:
          'Piscinas naturais a 6 km da praia, alcançadas de catamarã. Só na maré baixa — o ' +
          'horário muda todo dia, então a data manda mais que a hora.',
        busca: 'Maragogi galés piscinas naturais',
      },
      {
        nome: 'Porto de Galinhas',
        onde: 'Pernambuco',
        sobre: 'Piscinas naturais logo em frente à praia, alcançadas de jangada. Também depende da maré.',
        busca: 'Porto de Galinhas piscinas naturais jangada',
      },
      {
        nome: 'Fernando de Noronha',
        onde: 'Pernambuco',
        sobre:
          'Ilha com número limitado de visitantes. Além da passagem, tem taxa ambiental diária e ' +
          'ingresso do parque nacional — some tudo antes de comparar preço.',
        busca: 'Fernando de Noronha passeio',
      },
      {
        nome: 'Lençóis Maranhenses',
        onde: 'Maranhão',
        sobre:
          'Dunas com lagoas de água doce entre elas. As lagoas só existem de junho a setembro; ' +
          'fora disso a paisagem é só areia.',
        busca: 'Lençóis Maranhenses passeio',
      },
      {
        nome: 'Jericoacoara',
        onde: 'Ceará',
        sobre: 'Vila de areia com dunas e lagoas. O acesso final é de 4x4 — não dá para chegar de carro comum.',
        busca: 'Jericoacoara passeio',
      },
      {
        nome: 'Praia do Forte e Projeto Tamar',
        onde: 'Bahia',
        sobre: 'Vila tranquila perto de Salvador, com o centro de proteção às tartarugas.',
        busca: 'Praia do Forte Projeto Tamar',
      },
    ],
  },
  {
    id: 'parques',
    titulo: 'Parques aquáticos e de diversão',
    emoji: '🎢',
    descricao:
      'Quase todos vendem ingresso no próprio site, quase sempre mais barato que na bilheteria — ' +
      'e alguns só vendem online, com data marcada.',
    lugares: [
      {
        nome: 'Magic City',
        onde: 'Suzano, São Paulo',
        sobre: 'Parque aquático e temático na Grande São Paulo. Dá para ir e voltar no mesmo dia.',
        busca: 'Magic City Suzano ingresso',
        oficial: 'https://www.magiccity.com.br',
      },
      {
        nome: 'Beto Carrero World',
        onde: 'Penha, Santa Catarina',
        sobre: 'O maior parque temático da América Latina. Um dia inteiro não dá para ver tudo.',
        busca: 'Beto Carrero World ingresso',
        oficial: 'https://www.betocarrero.com.br',
      },
      {
        nome: 'Hot Park e Rio Quente',
        onde: 'Goiás',
        sobre: 'Parque de águas quentes naturais. Costuma ser vendido junto com a hospedagem.',
        busca: 'Hot Park Rio Quente ingresso',
        oficial: 'https://www.rioquente.com.br',
      },
      {
        nome: 'Thermas dos Laranjais',
        onde: 'Olímpia, São Paulo',
        sobre: 'Um dos parques aquáticos mais visitados do mundo, com águas termais.',
        busca: 'Thermas dos Laranjais Olímpia ingresso',
        oficial: 'https://www.thermasdoslaranjais.com.br',
      },
      {
        nome: 'Walt Disney World',
        onde: 'Orlando, Estados Unidos',
        sobre:
          'São quatro parques. O ingresso tem data marcada e reserva por parque — planeje antes ' +
          'de comprar a passagem.',
        busca: 'Disney Orlando ingresso',
      },
      {
        nome: 'Universal Orlando',
        onde: 'Orlando, Estados Unidos',
        sobre: 'Parques do Harry Potter e dos estúdios. Vizinho da Disney, ingresso separado.',
        busca: 'Universal Orlando ingresso',
      },
    ],
  },
  {
    id: 'brasil-sudeste',
    titulo: 'Brasil — Sudeste e Sul',
    emoji: '🇧🇷',
    descricao: 'O que mais aparece em roteiro de quem vem de fora, e o que brasileiro costuma deixar para depois.',
    lugares: [
      {
        nome: 'Cristo Redentor e Pão de Açúcar',
        onde: 'Rio de Janeiro',
        sobre: 'Os dois costumam ser vendidos juntos, com transporte incluído.',
        busca: 'Cristo Redentor Pão de Açúcar ingresso',
      },
      {
        nome: 'Cataratas do Iguaçu',
        onde: 'Foz do Iguaçu, Paraná',
        sobre:
          'Tem lado brasileiro e argentino, com ingressos separados. O brasileiro dá a vista ' +
          'panorâmica; o argentino leva você para perto da água.',
        busca: 'Cataratas do Iguaçu ingresso',
      },
      {
        nome: 'Bonito',
        onde: 'Mato Grosso do Sul',
        sobre:
          'Flutuação em rio de água transparente. Cada passeio tem número limitado de pessoas por ' +
          'dia e precisa ser agendado com antecedência.',
        busca: 'Bonito MS flutuação passeio',
      },
      {
        nome: 'Serra Gaúcha — Gramado e Canela',
        onde: 'Rio Grande do Sul',
        sobre: 'Clima europeu no sul do Brasil. Lotado no inverno e no Natal.',
        busca: 'Gramado Canela passeio',
      },
    ],
  },
  {
    id: 'europa-outros',
    titulo: 'Resto da Europa',
    emoji: '🗼',
    descricao: 'Os cartões-postais que quase todo roteiro pela Europa acaba incluindo.',
    lugares: [
      {
        nome: 'Torre Eiffel',
        onde: 'Paris',
        sobre: 'Ingresso com horário marcado. O do topo esgota primeiro.',
        busca: 'Torre Eiffel ingresso',
      },
      {
        nome: 'Museu do Louvre',
        onde: 'Paris',
        sobre: 'Grande demais para um dia só. Com guia, você vê o essencial em três horas.',
        busca: 'Louvre ingresso',
      },
      {
        nome: 'Sagrada Família',
        onde: 'Barcelona',
        sobre: 'Igreja de Gaudí, ainda em obras. Entrada com hora marcada e costuma esgotar.',
        busca: 'Sagrada Família Barcelona ingresso',
      },
      {
        nome: 'Alhambra',
        onde: 'Granada, Espanha',
        sobre:
          'Palácio árabe com limite diário rígido de visitantes. É dos ingressos mais difíceis ' +
          'da Europa: reserve com semanas de antecedência.',
        busca: 'Alhambra Granada ingresso',
      },
      {
        nome: 'Passeio pelos canais',
        onde: 'Amsterdã',
        sobre: 'Uma hora de barco pelo centro histórico. Barato e sai o dia inteiro.',
        busca: 'Amsterdã passeio de barco canais',
      },
    ],
  },
];

/**
 * Destaques do carrossel da página inicial.
 *
 * São nomes de lugar, não ofertas: nenhum preço aparece aqui. Preço que a
 * gente não consultou de verdade é chute, e um banner com valor chutado é
 * exatamente o tipo de anúncio que este site existe para desmontar.
 */
export const DESTAQUES: { lugar: string; onde: string; chamada: string; busca: string }[] = [
  {
    lugar: 'Cruzeiro das Seis Pontes',
    onde: 'Porto, Portugal',
    chamada: 'Uma hora de barco por baixo das pontes do Douro',
    busca: 'Cruzeiro seis pontes Porto Douro',
  },
  {
    lugar: 'Galés de Maragogi',
    onde: 'Alagoas, Brasil',
    chamada: 'Piscinas naturais a 6 km da praia — só na maré baixa',
    busca: 'Maragogi galés piscinas naturais',
  },
  {
    lugar: 'Coliseu',
    onde: 'Roma, Itália',
    chamada: 'Ingresso com hora marcada, e ele esgota',
    busca: 'Coliseu Roma ingresso',
  },
  {
    lugar: 'Lençóis Maranhenses',
    onde: 'Maranhão, Brasil',
    chamada: 'As lagoas entre as dunas só existem de junho a setembro',
    busca: 'Lençóis Maranhenses passeio',
  },
  {
    lugar: 'Vale do Douro',
    onde: 'Portugal',
    chamada: 'Dia inteiro entre vinhedos em terraços, subindo o rio',
    busca: 'Vale do Douro passeio vinhas',
  },
  {
    lugar: 'Bonito',
    onde: 'Mato Grosso do Sul, Brasil',
    chamada: 'Flutuação em água transparente, com vaga limitada por dia',
    busca: 'Bonito MS flutuação passeio',
  },
  {
    lugar: 'Alhambra',
    onde: 'Granada, Espanha',
    chamada: 'Um dos ingressos mais disputados da Europa',
    busca: 'Alhambra Granada ingresso',
  },
  {
    lugar: 'Cataratas do Iguaçu',
    onde: 'Paraná, Brasil',
    chamada: 'Dois lados, dois ingressos, duas vistas diferentes',
    busca: 'Cataratas do Iguaçu ingresso',
  },
];
