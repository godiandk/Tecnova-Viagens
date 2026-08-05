/**
 * Textos dos alertas, em português, com marcadores {assim}.
 *
 * Ficam fora do motor de risco de propósito. O motor decide QUE problema
 * existe e quanto ele custa em pontos; aqui se decide COMO isso é dito. Sem
 * essa separação não haveria tradução possível: as frases eram montadas com
 * os valores já grudados dentro ("Conexão de 50min em Recife (REC)"), e cada
 * combinação virava uma frase única — 490 frases para 84 ideias.
 *
 * Cada alerta tem três textos porque servem a três leitores diferentes:
 *   simples — o que acontece com VOCÊ, em palavras do dia a dia. É o que a
 *             interface mostra por padrão.
 *   titulo  — o resumo de uma linha, para a lista.
 *   detalhe — o vocabulário técnico de aviação, no modo avançado.
 */
export type TextoAlerta = {
  titulo: string;
  detalhe: string;
  simples: string;
};

export const TEXTOS_ALERTA: Record<string, TextoAlerta> = {
  BILHETES_SEPARADOS: {
    titulo: 'Viagem vendida em {quantidade} bilhetes separados',
    detalhe:
      'Cada bilhete é um contrato independente. Se o primeiro voo atrasar e você perder o ' +
      'seguinte, nenhuma companhia é obrigada a reacomodar você: o segundo bilhete vira ' +
      'no-show e você recompra do bolso. A bagagem também não segue direto — precisa ser ' +
      'retirada e despachada de novo.',
    simples:
      'São {quantidade} passagens diferentes, não uma passagem só. Se o primeiro avião atrasar ' +
      'e você perder o próximo, a empresa NÃO te coloca em outro voo. Você vai ter que comprar ' +
      'outra passagem com o seu dinheiro. E a sua mala não vai sozinha: você precisa pegar ela ' +
      'na esteira e despachar de novo.',
  },

  AUTOCONEXAO_APERTADA: {
    titulo: 'Margem curta demais entre bilhetes',
    detalhe:
      'A troca em {aeroporto} tem {espera} de espera, {falta} a menos que o mínimo de {minimo}. ' +
      'Entre bilhetes separados você refaz check-in, despacha bagagem e passa pela segurança ' +
      'outra vez — e ninguém segura o segundo voo por sua causa.',
    simples:
      'Você tem {espera} para descer do avião, pegar a mala, fazer um novo check-in, despachar ' +
      'de novo e passar pela segurança outra vez. É pouco tempo. Se der errado, ninguém segura ' +
      'o segundo avião esperando por você.',
  },

  TROCA_AEROPORTO: {
    titulo: 'Conexão troca de aeroporto: {chegada} → {partida}',
    detalhe:
      'Você desembarca em um aeroporto e embarca em outro, por conta própria, com a bagagem. ' +
      'Trânsito da cidade não é problema da companhia: se atrasar, o prejuízo é seu.',
    simples:
      'Você desce no aeroporto {chegada} e precisa ir até o aeroporto {partida}, que é outro ' +
      'lugar da cidade. Você vai de carro ou ônibus, pagando do seu bolso, carregando as malas. ' +
      'Se pegar trânsito e você perder o voo, o prejuízo é seu.',
  },

  CONEXAO_ABAIXO_DO_MINIMO: {
    titulo: 'Conexão de {espera} em {aeroporto}',
    detalhe:
      'São {falta} a menos que o mínimo de {minimo} para uma conexão {tipo} aqui. Qualquer ' +
      'atraso pequeno na primeira perna já derruba a segunda.',
    simples:
      'Você tem só {espera} para trocar de avião em {aeroporto}. Isso é pouco demais. Se o ' +
      'primeiro voo atrasar um pouquinho, você perde o segundo.',
  },

  CONEXAO_JUSTA: {
    titulo: 'Conexão justa de {espera} em {aeroporto}',
    detalhe:
      'Passa do mínimo de {minimo}, mas sem folga. Funciona se tudo sair no horário — e é a ' +
      'companhia que reacomoda se não sair.',
    simples:
      'Você tem {espera} para trocar de avião em {aeroporto}. Dá, mas é apertado. A boa ' +
      'notícia: como é tudo uma passagem só, se você perder por causa de atraso, a empresa é ' +
      'obrigada a te colocar em outro voo sem cobrar nada.',
  },

  CONEXAO_MUITO_LONGA: {
    titulo: 'Espera de {espera} em {aeroporto}',
    detalhe:
      'Parada longa o bastante para exigir hotel ou uma noite no aeroporto. Conte esse custo e ' +
      'esse desgaste antes de comparar só o preço.',
    simples:
      'Você vai ficar {espera} parado em {aeroporto} esperando o próximo avião. É tempo de ' +
      'precisar de um hotel ou dormir no aeroporto. Isso cansa e custa dinheiro.',
  },

  CONEXAO_LONGA: {
    titulo: 'Espera de {espera} em {aeroporto}',
    detalhe: 'Conexão folgada: seguro contra atrasos, mas cansativo.',
    simples:
      'Você vai esperar {espera} em {aeroporto} até o próximo avião. É bastante tempo parado, ' +
      'mas pelo menos você não corre risco de perder o voo.',
  },

  CONEXAO_NOTURNA: {
    titulo: 'Conexão embarca às {hora} em {aeroporto}',
    detalhe:
      'Sendo um dos últimos voos do dia, perder essa conexão normalmente significa dormir na ' +
      'cidade e seguir só no dia seguinte.',
    simples:
      'O segundo avião sai às {hora}, já de noite. Costuma ser um dos últimos voos do dia. Se ' +
      'você perder, provavelmente vai ter que dormir nessa cidade e viajar só no dia seguinte.',
  },

  VISTO_TRANSITO: {
    titulo: '{titulo}',
    detalhe: '{detalhe} Confirme na fonte oficial: {fonte}',
    simples: '{simples}',
  },

  PARADAS_UMA: {
    titulo: '1 parada no caminho',
    detalhe:
      'Cada troca de avião é uma chance a mais de algo dar errado: atraso, bagagem extraviada, ' +
      'portão trocado. Voo direto é sempre o mais seguro.',
    simples:
      'Esta viagem não é direta: você troca de avião 1 vez. Cada troca é uma chance a mais de ' +
      'atrasar ou da mala se perder. Voo direto é sempre o mais tranquilo.',
  },

  PARADAS_VARIAS: {
    titulo: '{quantidade} paradas no caminho',
    detalhe:
      'Cada troca de avião é uma chance a mais de algo dar errado: atraso, bagagem extraviada, ' +
      'portão trocado. Voo direto é sempre o mais seguro.',
    simples:
      'Esta viagem não é direta: você troca de avião {quantidade} vezes. Cada troca é uma ' +
      'chance a mais de atrasar ou da mala se perder. Voo direto é sempre o mais tranquilo.',
  },

  CHEGADA_MADRUGADA: {
    titulo: 'Chegada às {hora}',
    detalhe:
      'Transporte público costuma não operar nesse horário e a corrida por aplicativo sai mais ' +
      'cara. Some isso ao preço da passagem.',
    simples:
      'Seu avião chega às {hora} da madrugada. Nesse horário quase não tem ônibus nem metrô, e ' +
      'o carro de aplicativo fica bem mais caro. Pense em como você vai do aeroporto até onde ' +
      'vai ficar.',
  },

  PARTIDA_MADRUGADA: {
    titulo: 'Embarque às {hora}',
    detalhe:
      'Você precisa estar no aeroporto de madrugada, o que geralmente significa sair de casa na ' +
      'noite anterior ou pagar transporte caro.',
    simples:
      'Seu avião sai às {hora} da madrugada. Você precisa chegar no aeroporto antes disso, de ' +
      'madrugada. Muita gente acaba tendo que sair de casa na noite anterior ou pagar caro no ' +
      'transporte.',
  },

  NAO_REMARCAVEL: {
    titulo: 'Tarifa sem direito a remarcação',
    detalhe:
      'Mudar data é impossível ou custa quase uma passagem nova. Se sua data não está 100% ' +
      'fechada, a tarifa mais barata pode sair mais cara.',
    simples:
      'Se você precisar mudar a data da viagem, não dá — ou vai custar quase o preço de uma ' +
      'passagem nova. Só compre esta se a sua data já estiver certa.',
  },

  NAO_REEMBOLSAVEL: {
    titulo: 'Tarifa não reembolsável',
    detalhe: 'Desistindo da viagem, você não recebe o valor de volta (só taxas, em alguns casos).',
    simples: 'Se você desistir da viagem, o dinheiro não volta. Você perde o valor que pagou.',
  },

  SEM_BAGAGEM_DESPACHADA: {
    titulo: 'Bagagem despachada não inclusa',
    detalhe:
      'O preço anunciado cobre só a bagagem de mão. Se você vai despachar, o custo real é ' +
      'maior — já embutimos uma estimativa no total abaixo.',
    simples:
      'O preço que aparece é só com a mala pequena, aquela que vai com você dentro do avião. A ' +
      'mala grande, que vai no bagageiro, você paga separado. Veja quanto custa logo abaixo.',
  },

  PONTUALIDADE: {
    titulo: '{companhia} tem histórico de pontualidade abaixo da média',
    detalhe:
      'Cerca de {pontuais}% dos voos partem no horário. Com conexão apertada, isso pesa mais do ' +
      'que o desconto na passagem.',
    simples:
      'A {companhia} atrasa mais que as outras: cerca de {atrasados} de cada 100 voos não saem ' +
      'na hora. Se a sua conexão for apertada, isso aumenta a chance de você perder o voo ' +
      'seguinte.',
  },

  PRECO_SUSPEITO: {
    titulo: 'Preço muito abaixo dos demais',
    detalhe:
      'Bem mais barato que a mediana desta busca. Costuma haver um motivo: bagagem à parte, ' +
      'horário ruim, conexão longa ou tarifa sem nenhuma flexibilidade. Leia as condições antes ' +
      'de fechar.',
    simples:
      'Esta passagem está bem mais barata que todas as outras desta busca. Quando isso acontece, ' +
      'quase sempre tem um porquê escondido: mala cobrada à parte, horário ruim, espera enorme ' +
      'ou regra que não deixa mudar nada. Leia com atenção antes de comprar.',
  },
};

/** Palavras soltas que entram como valor dentro de outra frase. */
export const TIPO_CONEXAO = {
  internacional: 'internacional',
  domestica: 'doméstica',
} as const;
