import {
  CONEXAO_LONGA_MIN,
  CONEXAO_MUITO_LONGA_MIN,
  CUSTOS,
  FAIXAS,
  FRACAO_PRECO_SUSPEITO,
  HORA_CONEXAO_NOTURNA,
  MADRUGADA,
  MCT,
  PENALIDADES,
} from '@/lib/config';
import { buscarAeroporto, mesmaAreaMetropolitana } from '@/lib/dados/aeroportos';
import { buscarCompanhia } from '@/lib/dados/companhias';
import { regrasParaConexao } from '@/lib/dados/transito';
import { diasDeDiferenca, diferencaMin, formatarDuracao, horaDoDia, horaLocal } from '@/lib/tempo';
import type {
  Alerta,
  AnaliseSeguranca,
  CustoReal,
  FaixaSeguranca,
  Itinerario,
  Segmento,
} from '@/lib/tipos';

export type Conexao = {
  /** Voo que chega. */
  anterior: Segmento;
  /** Voo que parte. */
  proximo: Segmento;
  aeroportoChegada: string;
  aeroportoPartida: string;
  esperaMin: number;
  /** Tempo mínimo considerado viável para essa conexão. */
  mctMin: number;
  /** Falso quando a conexão acontece entre dois bilhetes distintos. */
  mesmoBilhete: boolean;
  trocaAeroporto: boolean;
  internacional: boolean;
};

function paisDe(iata: string): string {
  return buscarAeroporto(iata)?.paisIso ?? '??';
}

/**
 * Uma conexão é internacional quando envolve cruzar fronteira em algum dos dois
 * voos — é isso que obriga a passar por imigração e alfândega, e é isso que faz
 * o tempo mínimo de conexão dobrar.
 */
function conexaoInternacional(anterior: Segmento, proximo: Segmento): boolean {
  return (
    paisDe(anterior.origem) !== paisDe(anterior.destino) ||
    paisDe(proximo.origem) !== paisDe(proximo.destino) ||
    paisDe(anterior.destino) !== paisDe(proximo.origem)
  );
}

function tempoMinimoConexao(params: {
  trocaAeroporto: boolean;
  mesmoBilhete: boolean;
  internacional: boolean;
}): number {
  if (params.trocaAeroporto) return MCT.trocaAeroporto;
  if (!params.mesmoBilhete) return MCT.bilheteSeparado;
  if (params.internacional) return MCT.internacional;
  return MCT.domestico;
}

/** Lista todas as conexões do itinerário, dentro e entre bilhetes. */
export function extrairConexoes(itinerario: Itinerario): Conexao[] {
  const conexoes: Conexao[] = [];

  itinerario.bilhetes.forEach((bilhete, indiceBilhete) => {
    // Conexões internas ao bilhete.
    for (let i = 0; i < bilhete.segmentos.length - 1; i++) {
      conexoes.push(montarConexao(bilhete.segmentos[i], bilhete.segmentos[i + 1], true));
    }
    // Conexão para o bilhete seguinte, quando existir.
    const proximoBilhete = itinerario.bilhetes[indiceBilhete + 1];
    if (proximoBilhete) {
      const ultimo = bilhete.segmentos[bilhete.segmentos.length - 1];
      const primeiro = proximoBilhete.segmentos[0];
      conexoes.push(montarConexao(ultimo, primeiro, false));
    }
  });

  return conexoes;
}

function montarConexao(anterior: Segmento, proximo: Segmento, mesmoBilhete: boolean): Conexao {
  const trocaAeroporto =
    anterior.destino !== proximo.origem && mesmaAreaMetropolitana(anterior.destino, proximo.origem);
  const internacional = conexaoInternacional(anterior, proximo);

  return {
    anterior,
    proximo,
    aeroportoChegada: anterior.destino,
    aeroportoPartida: proximo.origem,
    esperaMin: diferencaMin(anterior.chegada, proximo.partida),
    mctMin: tempoMinimoConexao({ trocaAeroporto, mesmoBilhete, internacional }),
    mesmoBilhete,
    trocaAeroporto,
    internacional,
  };
}

/**
 * Chance de perder uma conexão específica.
 *
 * A margem que interessa não é o tempo total de espera, é o que sobra depois do
 * mínimo necessário. Margem zero ainda dá ~1/3 de chance de dar errado, porque
 * o mínimo pressupõe que tudo saia no horário — e não sai.
 */
function probabilidadePerderConexao(conexao: Conexao): number {
  const margem = conexao.esperaMin - conexao.mctMin;
  const base = margem < 0 ? 0.6 : 0.32 * Math.exp(-margem / 75);

  // Companhia que atrasa mais come a margem antes mesmo de você sair do lugar.
  const pontualidade = buscarCompanhia(conexao.anterior.companhia).pontualidade;
  const ajuste = 1 + (PENALIDADES.pontualidadeReferencia - pontualidade) * 2;

  return Math.min(0.9, Math.max(0, base * ajuste));
}

/**
 * Penalidade proporcional ao tamanho do buraco.
 *
 * Uma conexão de 40 minutos onde o mínimo é 45 é apertada; uma de 45 onde o
 * mínimo é 180 é ficção. Uma penalidade fixa trataria as duas igual, então o
 * desconto cresce com a fração que falta: no limite (espera zero) ele dobra.
 */
function penalidadePorDeficit(base: number, esperaMin: number, mctMin: number): number {
  if (mctMin <= 0) return base;
  const deficitRelativo = Math.min(1, Math.max(0, (mctMin - esperaMin) / mctMin));
  return Math.round(base * (1 + deficitRelativo));
}

function todosSegmentos(itinerario: Itinerario): Segmento[] {
  return itinerario.bilhetes.flatMap((b) => b.segmentos);
}

function nomeAeroporto(iata: string): string {
  const a = buscarAeroporto(iata);
  return a ? `${a.cidade} (${iata})` : iata;
}

export type OpcoesAnalise = {
  /** Passaporte do viajante, para checar visto de trânsito. */
  nacionalidade: string;
  /** Mediana de preços da busca, usada para detectar tarifa boa demais. */
  precoMedianoBRL?: number;
};

export function analisarSeguranca(
  itinerario: Itinerario,
  opcoes: OpcoesAnalise,
): AnaliseSeguranca {
  const alertas: Alerta[] = [];
  const conexoes = extrairConexoes(itinerario);
  const segmentos = todosSegmentos(itinerario);

  // ---- Bilhetes separados: o risco que define o resto ----
  if (itinerario.bilhetes.length > 1) {
    alertas.push({
      codigo: 'BILHETES_SEPARADOS',
      simples:
        `São ${itinerario.bilhetes.length} passagens diferentes, não uma passagem só. Se o primeiro ` +
        'avião atrasar e você perder o próximo, a empresa NÃO te coloca em outro voo. Você vai ' +
        'ter que comprar outra passagem com o seu dinheiro. E a sua mala não vai sozinha: você ' +
        'precisa pegar ela na esteira e despachar de novo.',
      nivel: 'critico',
      titulo: `Viagem vendida em ${itinerario.bilhetes.length} bilhetes separados`,
      detalhe:
        'Cada bilhete é um contrato independente. Se o primeiro voo atrasar e você perder o ' +
        'seguinte, nenhuma companhia é obrigada a reacomodar você: o segundo bilhete vira ' +
        'no-show e você recompra do bolso. A bagagem também não segue direto — precisa ser ' +
        'retirada e despachada de novo.',
      pontos: PENALIDADES.bilhetesSeparados,
    });

    const entreBilhetes = conexoes.filter((c) => !c.mesmoBilhete);
    const apertadas = entreBilhetes
      .filter((c) => c.esperaMin < c.mctMin)
      .sort((a, b) => a.esperaMin - a.mctMin - (b.esperaMin - b.mctMin));

    if (apertadas.length > 0) {
      const pior = apertadas[0];
      alertas.push({
        codigo: 'AUTOCONEXAO_APERTADA',
        simples:
          `Você tem ${formatarDuracao(pior.esperaMin)} para descer do avião, pegar a mala, fazer ` +
          'um novo check-in, despachar de novo e passar pela segurança outra vez. É pouco tempo. ' +
          'Se der errado, ninguém segura o segundo avião esperando por você.',
        nivel: 'critico',
        titulo: 'Margem curta demais entre bilhetes',
        detalhe:
          `A troca em ${nomeAeroporto(pior.aeroportoChegada)} tem ` +
          `${formatarDuracao(pior.esperaMin)} de espera, ` +
          `${formatarDuracao(pior.mctMin - pior.esperaMin)} a menos que o mínimo de ` +
          `${formatarDuracao(pior.mctMin)}. Entre bilhetes separados você refaz check-in, ` +
          'despacha bagagem e passa pela segurança outra vez — e ninguém segura o segundo voo ' +
          'por sua causa.',
        pontos: penalidadePorDeficit(
          PENALIDADES.autoconexaoApertada,
          pior.esperaMin,
          pior.mctMin,
        ),
      });
    }
  }

  // ---- Conexões ----
  for (const conexao of conexoes) {
    const onde = nomeAeroporto(conexao.aeroportoChegada);

    if (conexao.trocaAeroporto) {
      alertas.push({
        codigo: 'TROCA_AEROPORTO',
        simples:
          `Você desce no aeroporto ${conexao.aeroportoChegada} e precisa ir até o aeroporto ` +
          `${conexao.aeroportoPartida}, que é outro lugar da cidade. Você vai de carro ou ônibus, ` +
          'pagando do seu bolso, carregando as malas. Se pegar trânsito e você perder o voo, o ' +
          'prejuízo é seu.',
        nivel: 'critico',
        titulo: `Conexão troca de aeroporto: ${conexao.aeroportoChegada} → ${conexao.aeroportoPartida}`,
        detalhe:
          'Você desembarca em um aeroporto e embarca em outro, por conta própria, com a ' +
          'bagagem. Trânsito da cidade não é problema da companhia: se atrasar, o prejuízo é seu.',
        pontos: PENALIDADES.trocaDeAeroporto,
      });
    } else if (conexao.esperaMin < conexao.mctMin && conexao.mesmoBilhete) {
      alertas.push({
        codigo: 'CONEXAO_ABAIXO_DO_MINIMO',
        simples:
          `Você tem só ${formatarDuracao(conexao.esperaMin)} para trocar de avião em ${onde}. ` +
          'Isso é pouco demais. Se o primeiro voo atrasar um pouquinho, você perde o segundo.',
        nivel: 'critico',
        titulo: `Conexão de ${formatarDuracao(conexao.esperaMin)} em ${onde}`,
        detalhe:
          `São ${formatarDuracao(conexao.mctMin - conexao.esperaMin)} a menos que o mínimo de ` +
          `${formatarDuracao(conexao.mctMin)} para uma conexão ` +
          `${conexao.internacional ? 'internacional' : 'doméstica'} aqui. Qualquer atraso ` +
          'pequeno na primeira perna já derruba a segunda.',
        pontos: penalidadePorDeficit(
          PENALIDADES.conexaoAbaixoDoMinimo,
          conexao.esperaMin,
          conexao.mctMin,
        ),
      });
    } else if (conexao.esperaMin < conexao.mctMin + 25 && conexao.mesmoBilhete) {
      alertas.push({
        codigo: 'CONEXAO_JUSTA',
        simples:
          `Você tem ${formatarDuracao(conexao.esperaMin)} para trocar de avião em ${onde}. Dá, mas ` +
          'é apertado. A boa notícia: como é tudo uma passagem só, se você perder por causa de ' +
          'atraso, a empresa é obrigada a te colocar em outro voo sem cobrar nada.',
        nivel: 'alto',
        titulo: `Conexão justa de ${formatarDuracao(conexao.esperaMin)} em ${onde}`,
        detalhe:
          `Passa do mínimo de ${formatarDuracao(conexao.mctMin)}, mas sem folga. ` +
          'Funciona se tudo sair no horário — e é a companhia que reacomoda se não sair.',
        pontos: PENALIDADES.conexaoJustaNoLimite,
      });
    }

    if (conexao.esperaMin >= CONEXAO_MUITO_LONGA_MIN) {
      alertas.push({
        codigo: 'CONEXAO_MUITO_LONGA',
        simples:
        `Você vai ficar ${formatarDuracao(conexao.esperaMin)} parado em ${onde} esperando o ` +
        'próximo avião. É tempo de precisar de um hotel ou dormir no aeroporto. Isso cansa e ' +
        'custa dinheiro.',
        nivel: 'medio',
        titulo: `Espera de ${formatarDuracao(conexao.esperaMin)} em ${onde}`,
        detalhe:
          'Parada longa o bastante para exigir hotel ou uma noite no aeroporto. ' +
          'Conte esse custo e esse desgaste antes de comparar só o preço.',
        pontos: PENALIDADES.conexaoMuitoLonga,
      });
    } else if (conexao.esperaMin >= CONEXAO_LONGA_MIN) {
      alertas.push({
        codigo: 'CONEXAO_LONGA',
        simples:
        `Você vai esperar ${formatarDuracao(conexao.esperaMin)} em ${onde} até o próximo avião. ` +
        'É bastante tempo parado, mas pelo menos você não corre risco de perder o voo.',
        nivel: 'baixo',
        titulo: `Espera de ${formatarDuracao(conexao.esperaMin)} em ${onde}`,
        detalhe: 'Conexão folgada: seguro contra atrasos, mas cansativo.',
        pontos: PENALIDADES.conexaoLonga,
      });
    }

    if (
      horaDoDia(conexao.proximo.partida) >= HORA_CONEXAO_NOTURNA &&
      conexao.esperaMin < CONEXAO_LONGA_MIN
    ) {
      alertas.push({
        codigo: 'CONEXAO_NOTURNA',
        simples:
        `O segundo avião sai às ${horaLocal(conexao.proximo.partida)}, já de noite. Costuma ser um ` +
        'dos últimos voos do dia. Se você perder, provavelmente vai ter que dormir nessa cidade ' +
        'e viajar só no dia seguinte.',
        nivel: 'medio',
        titulo: `Conexão embarca às ${horaLocal(conexao.proximo.partida)} em ${onde}`,
        detalhe:
          'Sendo um dos últimos voos do dia, perder essa conexão normalmente significa ' +
          'dormir na cidade e seguir só no dia seguinte.',
        pontos: PENALIDADES.conexaoNoturnaSemMargem,
      });
    }

    // ---- Visto de trânsito ----
    const pais = paisDe(conexao.aeroportoChegada);
    for (const regra of regrasParaConexao(pais, opcoes.nacionalidade)) {
      alertas.push({
        codigo: `VISTO_TRANSITO_${regra.paisIso}`,
        simples: regra.simples,
        nivel: regra.nivel,
        titulo: regra.titulo,
        detalhe: `${regra.detalhe} Confirme na fonte oficial: ${regra.fonte}`,
        pontos: PENALIDADES.vistoTransito[regra.nivel],
      });
    }
  }

  // ---- Paradas ----
  if (itinerario.paradas > 0) {
    alertas.push({
      codigo: 'PARADAS',
      simples:
        `Esta viagem não é direta: você troca de avião ${itinerario.paradas} ` +
        `${itinerario.paradas === 1 ? 'vez' : 'vezes'}. Cada troca é uma chance a mais de atrasar ` +
        'ou da mala se perder. Voo direto é sempre o mais tranquilo.',
      nivel: itinerario.paradas >= 2 ? 'medio' : 'baixo',
      titulo: `${itinerario.paradas} ${itinerario.paradas === 1 ? 'parada' : 'paradas'} no caminho`,
      detalhe:
        'Cada troca de avião é uma chance a mais de algo dar errado: atraso, bagagem extraviada, ' +
        'portão trocado. Voo direto é sempre o mais seguro.',
      pontos: PENALIDADES.porParada * itinerario.paradas,
    });
  }

  // ---- Horários ruins ----
  const primeiro = segmentos[0];
  const ultimo = segmentos[segmentos.length - 1];

  if (horaDoDia(ultimo.chegada) >= MADRUGADA.inicio && horaDoDia(ultimo.chegada) < MADRUGADA.fim) {
    alertas.push({
      codigo: 'CHEGADA_MADRUGADA',
      simples:
        `Seu avião chega às ${horaLocal(ultimo.chegada)} da madrugada. Nesse horário quase não tem ` +
        'ônibus nem metrô, e o carro de aplicativo fica bem mais caro. Pense em como você vai ' +
        'do aeroporto até onde vai ficar.',
      nivel: 'baixo',
      titulo: `Chegada às ${horaLocal(ultimo.chegada)}`,
      detalhe:
        'Transporte público costuma não operar nesse horário e a corrida por aplicativo sai ' +
        'mais cara. Some isso ao preço da passagem.',
      pontos: PENALIDADES.chegadaMadrugada,
    });
  }

  if (
    horaDoDia(primeiro.partida) >= MADRUGADA.inicio &&
    horaDoDia(primeiro.partida) < MADRUGADA.fim
  ) {
    alertas.push({
      codigo: 'PARTIDA_MADRUGADA',
      simples:
        `Seu avião sai às ${horaLocal(primeiro.partida)} da madrugada. Você precisa chegar no ` +
        'aeroporto antes disso, de madrugada. Muita gente acaba tendo que sair de casa na noite ' +
        'anterior ou pagar caro no transporte.',
      nivel: 'baixo',
      titulo: `Embarque às ${horaLocal(primeiro.partida)}`,
      detalhe:
        'Você precisa estar no aeroporto de madrugada, o que geralmente significa sair de casa ' +
        'na noite anterior ou pagar transporte caro.',
      pontos: PENALIDADES.partidaMadrugada,
    });
  }

  // ---- Condições da tarifa ----
  const semRemarcacao = itinerario.bilhetes.filter((b) => !b.remarcavel).length;
  if (semRemarcacao > 0) {
    alertas.push({
      codigo: 'NAO_REMARCAVEL',
      simples:
        'Se você precisar mudar a data da viagem, não dá — ou vai custar quase o preço de uma ' +
        'passagem nova. Só compre esta se a sua data já estiver certa.',
      nivel: 'medio',
      titulo: 'Tarifa sem direito a remarcação',
      detalhe:
        'Mudar data é impossível ou custa quase uma passagem nova. Se sua data não está ' +
        '100% fechada, a tarifa mais barata pode sair mais cara.',
      pontos: PENALIDADES.naoRemarcavel,
    });
  }

  const semReembolso = itinerario.bilhetes.filter((b) => !b.reembolsavel).length;
  if (semReembolso > 0) {
    alertas.push({
      codigo: 'NAO_REEMBOLSAVEL',
      simples:
        'Se você desistir da viagem, o dinheiro não volta. Você perde o valor que pagou.',
      nivel: 'baixo',
      titulo: 'Tarifa não reembolsável',
      detalhe: 'Desistindo da viagem, você não recebe o valor de volta (só taxas, em alguns casos).',
      pontos: PENALIDADES.naoReembolsavel,
    });
  }

  const semBagagem = itinerario.bilhetes.filter((b) => !b.bagagemDespachada).length;
  if (semBagagem > 0) {
    alertas.push({
      codigo: 'SEM_BAGAGEM_DESPACHADA',
      simples:
        'O preço que aparece é só com a mala pequena, aquela que vai com você dentro do avião. ' +
        'A mala grande, que vai no bagageiro, você paga separado. Veja quanto custa logo abaixo.',
      nivel: 'info',
      titulo: 'Bagagem despachada não inclusa',
      detalhe:
        'O preço anunciado cobre só a bagagem de mão. Se você vai despachar, o custo real é ' +
        'maior — já embutimos uma estimativa no total abaixo.',
      pontos: 0,
    });
  }

  // ---- Pontualidade das companhias ----
  const companhias = [...new Set(segmentos.map((s) => s.companhia))].map(buscarCompanhia);
  const piorPontualidade = Math.min(...companhias.map((c) => c.pontualidade));
  if (piorPontualidade < PENALIDADES.pontualidadeReferencia) {
    const pior = companhias.find((c) => c.pontualidade === piorPontualidade)!;
    const pontos = Math.min(
      PENALIDADES.pontualidadeMaxima,
      Math.round((PENALIDADES.pontualidadeReferencia - piorPontualidade) * PENALIDADES.pontualidadeEscala),
    );
    if (pontos > 0) {
      alertas.push({
        codigo: 'PONTUALIDADE',
        simples:
          `A ${pior.nome} atrasa mais que as outras: cerca de ` +
          `${Math.round((1 - pior.pontualidade) * 100)} de cada 100 voos não saem na hora. Se a ` +
          'sua conexão for apertada, isso aumenta a chance de você perder o voo seguinte.',
        nivel: pontos >= 8 ? 'medio' : 'baixo',
        titulo: `${pior.nome} tem histórico de pontualidade abaixo da média`,
        detalhe:
          `Cerca de ${Math.round(pior.pontualidade * 100)}% dos voos partem no horário. ` +
          'Com conexão apertada, isso pesa mais do que o desconto na passagem.',
        pontos,
      });
    }
  }

  // ---- Preço bom demais ----
  if (
    opcoes.precoMedianoBRL &&
    opcoes.precoMedianoBRL > 0 &&
    itinerario.precoBRL < opcoes.precoMedianoBRL * FRACAO_PRECO_SUSPEITO
  ) {
    alertas.push({
      codigo: 'PRECO_SUSPEITO',
      simples:
        'Esta passagem está bem mais barata que todas as outras desta busca. Quando isso ' +
        'acontece, quase sempre tem um porquê escondido: mala cobrada à parte, horário ruim, ' +
        'espera enorme ou regra que não deixa mudar nada. Leia com atenção antes de comprar.',
      nivel: 'medio',
      titulo: 'Preço muito abaixo dos demais',
      detalhe:
        'Bem mais barato que a mediana desta busca. Costuma haver um motivo: bagagem à parte, ' +
        'horário ruim, conexão longa ou tarifa sem nenhuma flexibilidade. Leia as condições ' +
        'antes de fechar.',
      pontos: PENALIDADES.precoSuspeito,
    });
  }

  // ---- Consolidação ----
  const desconto = alertas.reduce((soma, a) => soma + a.pontos, 0);
  const score = Math.max(0, Math.min(100, 100 - desconto));

  const probabilidadeCancelamento =
    1 - companhias.reduce((acc, c) => acc * (1 - c.cancelamento), 1);
  const probabilidadeConexoes =
    1 - conexoes.reduce((acc, c) => acc * (1 - probabilidadePerderConexao(c)), 1);
  const probabilidadeFalha = Math.min(
    0.85,
    1 - (1 - probabilidadeCancelamento) * (1 - probabilidadeConexoes),
  );

  alertas.sort((a, b) => b.pontos - a.pontos);

  return { score, faixa: faixaDoScore(score), alertas, probabilidadeFalha };
}

export function faixaDoScore(score: number): FaixaSeguranca {
  if (score >= FAIXAS.seguro) return 'seguro';
  if (score >= FAIXAS.aceitavel) return 'aceitavel';
  if (score >= FAIXAS.arriscado) return 'arriscado';
  return 'evitar';
}

/**
 * Preço honesto: o anunciado mais o que você vai gastar de verdade, incluindo
 * o valor esperado do prejuízo quando o itinerário falha.
 */
export function estimarCusto(itinerario: Itinerario, analise: AnaliseSeguranca): CustoReal {
  const conexoes = extrairConexoes(itinerario);
  const segmentos = todosSegmentos(itinerario);
  const internacional = paisDe(segmentos[0].origem) !== paisDe(segmentos[segmentos.length - 1].destino);

  const bagagemBRL = itinerario.bilhetes
    .filter((b) => !b.bagagemDespachada)
    .reduce(
      (soma) =>
        soma +
        (internacional ? CUSTOS.bagagemDespachadaInternacional : CUSTOS.bagagemDespachadaDomestica),
      0,
    );

  const trasladoBRL =
    conexoes.filter((c) => c.trocaAeroporto).length * CUSTOS.trasladoEntreAeroportos;

  const precisaPernoite = conexoes.some(
    (c) =>
      c.esperaMin >= CONEXAO_MUITO_LONGA_MIN &&
      diasDeDiferenca(c.anterior.chegada, c.proximo.partida) >= 1,
  );
  const pernoiteBRL = precisaPernoite ? CUSTOS.pernoite : 0;

  // Sem proteção entre bilhetes, perder uma conexão significa recomprar a perna.
  const temBilhetesSeparados = itinerario.bilhetes.length > 1;
  const precoUltimaPerna = itinerario.bilhetes[itinerario.bilhetes.length - 1].precoBRL;
  const custoRecuperacao = temBilhetesSeparados
    ? Math.max(
        CUSTOS.recuperacaoDesprotegidaMinima,
        precoUltimaPerna * CUSTOS.multiplicadorRecompra,
      )
    : CUSTOS.recuperacaoProtegida;

  const riscoBRL = Math.round(analise.probabilidadeFalha * custoRecuperacao);

  return {
    passagemBRL: itinerario.precoBRL,
    bagagemBRL,
    trasladoBRL,
    pernoiteBRL,
    riscoBRL,
    totalBRL: itinerario.precoBRL + bagagemBRL + trasladoBRL + pernoiteBRL + riscoBRL,
  };
}
