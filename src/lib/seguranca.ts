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
import { TIPO_CONEXAO } from '@/lib/i18n/textos-alertas';
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

  // A chave distingue duas ocorrências do mesmo código — duas conexões
  // apertadas no mesmo itinerário são dois alertas, não um repetido.
  let sequencia = 0;
  const registrar = (alerta: Omit<Alerta, 'chave'>) => {
    alertas.push({ ...alerta, chave: `${alerta.codigo}-${sequencia++}` });
  };

  // ---- Bilhetes separados: o risco que define o resto ----
  if (itinerario.bilhetes.length > 1) {
    registrar({
      codigo: 'BILHETES_SEPARADOS',
      nivel: 'critico',
      pontos: PENALIDADES.bilhetesSeparados,
      valores: { quantidade: itinerario.bilhetes.length },
    });

    const entreBilhetes = conexoes.filter((c) => !c.mesmoBilhete);
    const apertadas = entreBilhetes
      .filter((c) => c.esperaMin < c.mctMin)
      .sort((a, b) => a.esperaMin - a.mctMin - (b.esperaMin - b.mctMin));

    if (apertadas.length > 0) {
      const pior = apertadas[0];
      registrar({
        codigo: 'AUTOCONEXAO_APERTADA',
        nivel: 'critico',
        pontos: penalidadePorDeficit(
          PENALIDADES.autoconexaoApertada,
          pior.esperaMin,
          pior.mctMin,
        ),
        valores: {
          aeroporto: nomeAeroporto(pior.aeroportoChegada),
          espera: formatarDuracao(pior.esperaMin),
          falta: formatarDuracao(pior.mctMin - pior.esperaMin),
          minimo: formatarDuracao(pior.mctMin),
        },
      });
    }
  }

  // ---- Conexões ----
  for (const conexao of conexoes) {
    const onde = nomeAeroporto(conexao.aeroportoChegada);

    if (conexao.trocaAeroporto) {
      registrar({
        codigo: 'TROCA_AEROPORTO',
        nivel: 'critico',
        pontos: PENALIDADES.trocaDeAeroporto,
        valores: {
          chegada: conexao.aeroportoChegada,
          partida: conexao.aeroportoPartida,
        },
      });
    } else if (conexao.esperaMin < conexao.mctMin && conexao.mesmoBilhete) {
      registrar({
        codigo: 'CONEXAO_ABAIXO_DO_MINIMO',
        nivel: 'critico',
        pontos: penalidadePorDeficit(
          PENALIDADES.conexaoAbaixoDoMinimo,
          conexao.esperaMin,
          conexao.mctMin,
        ),
        valores: {
          aeroporto: onde,
          espera: formatarDuracao(conexao.esperaMin),
          falta: formatarDuracao(conexao.mctMin - conexao.esperaMin),
          minimo: formatarDuracao(conexao.mctMin),
          // Palavra solta que entra no meio da frase: precisa ser traduzida
          // na hora de exibir, por isso vai como chave e não como texto.
          tipo: conexao.internacional
            ? TIPO_CONEXAO.internacional
            : TIPO_CONEXAO.domestica,
        },
      });
    } else if (conexao.esperaMin < conexao.mctMin + 25 && conexao.mesmoBilhete) {
      registrar({
        codigo: 'CONEXAO_JUSTA',
        nivel: 'alto',
        pontos: PENALIDADES.conexaoJustaNoLimite,
        valores: {
          aeroporto: onde,
          espera: formatarDuracao(conexao.esperaMin),
          minimo: formatarDuracao(conexao.mctMin),
        },
      });
    }

    if (conexao.esperaMin >= CONEXAO_MUITO_LONGA_MIN) {
      registrar({
        codigo: 'CONEXAO_MUITO_LONGA',
        nivel: 'medio',
        pontos: PENALIDADES.conexaoMuitoLonga,
        valores: { aeroporto: onde, espera: formatarDuracao(conexao.esperaMin) },
      });
    } else if (conexao.esperaMin >= CONEXAO_LONGA_MIN) {
      registrar({
        codigo: 'CONEXAO_LONGA',
        nivel: 'baixo',
        pontos: PENALIDADES.conexaoLonga,
        valores: { aeroporto: onde, espera: formatarDuracao(conexao.esperaMin) },
      });
    }

    if (
      horaDoDia(conexao.proximo.partida) >= HORA_CONEXAO_NOTURNA &&
      conexao.esperaMin < CONEXAO_LONGA_MIN
    ) {
      registrar({
        codigo: 'CONEXAO_NOTURNA',
        nivel: 'medio',
        pontos: PENALIDADES.conexaoNoturnaSemMargem,
        valores: { aeroporto: onde, hora: horaLocal(conexao.proximo.partida) },
      });
    }

    // ---- Visto de trânsito ----
    const pais = paisDe(conexao.aeroportoChegada);
    for (const regra of regrasParaConexao(pais, opcoes.nacionalidade)) {
      registrar({
        codigo: `VISTO_TRANSITO_${regra.paisIso}`,
        // As regras de trânsito trazem o próprio texto; o modelo só o encaixa.
        modelo: 'VISTO_TRANSITO',
        nivel: regra.nivel,
        pontos: PENALIDADES.vistoTransito[regra.nivel],
        valores: {
          titulo: regra.titulo,
          detalhe: regra.detalhe,
          simples: regra.simples,
          fonte: regra.fonte,
        },
      });
    }
  }

  // ---- Paradas ----
  if (itinerario.paradas > 0) {
    registrar({
      codigo: 'PARADAS',
      modelo: itinerario.paradas === 1 ? 'PARADAS_UMA' : 'PARADAS_VARIAS',
      nivel: itinerario.paradas >= 2 ? 'medio' : 'baixo',
      pontos: PENALIDADES.porParada * itinerario.paradas,
      valores: { quantidade: itinerario.paradas },
    });
  }

  // ---- Horários ruins ----
  const primeiro = segmentos[0];
  const ultimo = segmentos[segmentos.length - 1];

  if (horaDoDia(ultimo.chegada) >= MADRUGADA.inicio && horaDoDia(ultimo.chegada) < MADRUGADA.fim) {
    registrar({
      codigo: 'CHEGADA_MADRUGADA',
      nivel: 'baixo',
      pontos: PENALIDADES.chegadaMadrugada,
      valores: { hora: horaLocal(ultimo.chegada) },
    });
  }

  if (
    horaDoDia(primeiro.partida) >= MADRUGADA.inicio &&
    horaDoDia(primeiro.partida) < MADRUGADA.fim
  ) {
    registrar({
      codigo: 'PARTIDA_MADRUGADA',
      nivel: 'baixo',
      pontos: PENALIDADES.partidaMadrugada,
      valores: { hora: horaLocal(primeiro.partida) },
    });
  }

  // ---- Condições da tarifa ----
  if (itinerario.bilhetes.some((b) => !b.remarcavel)) {
    registrar({
      codigo: 'NAO_REMARCAVEL',
      nivel: 'medio',
      pontos: PENALIDADES.naoRemarcavel,
    });
  }

  if (itinerario.bilhetes.some((b) => !b.reembolsavel)) {
    registrar({
      codigo: 'NAO_REEMBOLSAVEL',
      nivel: 'baixo',
      pontos: PENALIDADES.naoReembolsavel,
    });
  }

  if (itinerario.bilhetes.some((b) => !b.bagagemDespachada)) {
    registrar({
      codigo: 'SEM_BAGAGEM_DESPACHADA',
      nivel: 'info',
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
      Math.round(
        (PENALIDADES.pontualidadeReferencia - piorPontualidade) * PENALIDADES.pontualidadeEscala,
      ),
    );
    if (pontos > 0) {
      registrar({
        codigo: 'PONTUALIDADE',
        nivel: pontos >= 8 ? 'medio' : 'baixo',
        pontos,
        valores: {
          companhia: pior.nome,
          pontuais: Math.round(pior.pontualidade * 100),
          atrasados: Math.round((1 - pior.pontualidade) * 100),
        },
      });
    }
  }

  // ---- Preço bom demais ----
  if (
    opcoes.precoMedianoBRL &&
    opcoes.precoMedianoBRL > 0 &&
    itinerario.precoBRL < opcoes.precoMedianoBRL * FRACAO_PRECO_SUSPEITO
  ) {
    registrar({
      codigo: 'PRECO_SUSPEITO',
      nivel: 'medio',
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
