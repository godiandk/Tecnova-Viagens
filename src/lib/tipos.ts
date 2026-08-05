/**
 * Modelo de domínio da Tecnova Viagens.
 *
 * A ideia central: um "itinerário" pode ser vendido como um bilhete único ou
 * como vários bilhetes separados (autoconexão). Essa distinção é o principal
 * fator de risco de uma passagem barata, então ela é explícita no modelo.
 */

export type Aeroporto = {
  iata: string;
  nome: string;
  cidade: string;
  uf?: string;
  pais: string;
  paisIso: string;
  /** Cidade metropolitana usada para detectar troca de aeroporto na conexão. */
  areaMetropolitana?: string;
};

export type Companhia = {
  iata: string;
  nome: string;
  paisIso: string;
  /** 0..1 — proporção de voos que partem dentro de 15 min do horário. */
  pontualidade: number;
  /** 0..1 — proporção de voos cancelados. */
  cancelamento: number;
  /** Companhia de baixo custo costuma ter menos opções de reacomodação. */
  lowCost: boolean;
};

export type Segmento = {
  companhia: string;
  numeroVoo: string;
  origem: string;
  destino: string;
  /** ISO 8601 no horário local do aeroporto de origem. */
  partida: string;
  /** ISO 8601 no horário local do aeroporto de destino. */
  chegada: string;
  duracaoMin: number;
  aeronave?: string;
};

export type TipoTarifa = 'promo' | 'basica' | 'classica' | 'flex';

/**
 * Um bilhete é a unidade de contrato: tudo dentro dele é protegido pela
 * companhia em caso de atraso. Entre bilhetes diferentes, não há proteção.
 */
export type Bilhete = {
  id: string;
  segmentos: Segmento[];
  precoBRL: number;
  tipoTarifa: TipoTarifa;
  /** Nome do canal de venda (companhia, OTA, consolidador). */
  vendedor: string;
  bagagemDespachada: boolean;
  bagagemMaoKg: number;
  remarcavel: boolean;
  reembolsavel: boolean;
};

export type Itinerario = {
  id: string;
  /** Um elemento = bilhete único. Mais de um = autoconexão (risco alto). */
  bilhetes: Bilhete[];
  origem: string;
  destino: string;
  partida: string;
  chegada: string;
  duracaoTotalMin: number;
  paradas: number;
  precoBRL: number;
};

export type NivelAlerta = 'critico' | 'alto' | 'medio' | 'baixo' | 'info';

/**
 * Um problema encontrado no itinerário.
 *
 * Carrega só o que o motor decidiu — qual problema, quão grave, quanto custa
 * em pontos — e os valores que a frase precisa. O texto em si vive em
 * `i18n/textos-alertas.ts`, para poder ser traduzido. Antes as frases saíam
 * daqui já montadas ("Conexão de 50min em Recife (REC)"), e cada combinação
 * de aeroporto e horário virava uma frase diferente: impossível de traduzir.
 */
export type Alerta = {
  /** Identidade do problema, estável e independente de idioma. */
  codigo: string;
  /** Chave em TEXTOS_ALERTA, quando difere do código (singular x plural). */
  modelo?: string;
  nivel: NivelAlerta;
  /** Pontos descontados do score de segurança (>= 0). */
  pontos: number;
  /** Preenche os marcadores {assim} do texto. */
  valores?: Record<string, string | number>;
  /** Único por alerta: dois trechos podem gerar o mesmo código. */
  chave: string;
};

export type FaixaSeguranca = 'seguro' | 'aceitavel' | 'arriscado' | 'evitar';

export type AnaliseSeguranca = {
  /** 0 a 100 — quanto maior, menor a chance de a viagem dar errado. */
  score: number;
  faixa: FaixaSeguranca;
  alertas: Alerta[];
  /** Probabilidade estimada de o itinerário falhar (perder conexão, cancelar). */
  probabilidadeFalha: number;
};

export type CustoReal = {
  /** Preço anunciado. */
  passagemBRL: number;
  /** Bagagem despachada que não vem inclusa. */
  bagagemBRL: number;
  /** Traslado extra quando a conexão troca de aeroporto. */
  trasladoBRL: number;
  /** Pernoite quando a chegada é de madrugada ou a conexão vira o dia. */
  pernoiteBRL: number;
  /** Valor esperado do prejuízo se a viagem falhar (probabilidade x custo). */
  riscoBRL: number;
  /** Soma de tudo acima — o número honesto para comparar opções. */
  totalBRL: number;
};

export type Selo = 'melhor-escolha' | 'mais-barato' | 'mais-seguro' | 'mais-rapido';

export type Resultado = {
  itinerario: Itinerario;
  seguranca: AnaliseSeguranca;
  custo: CustoReal;
  /** 0..1 — nota final combinando preço e segurança conforme o peso escolhido. */
  pontuacao: number;
  /** Quanto o itinerário é mais barato que a mediana da busca, em %. */
  economiaPercent: number;
  /** Destaques atribuídos dentro do conjunto de resultados. */
  selos: Selo[];
};

export type Passageiros = {
  adultos: number;
  criancas: number;
  bebes: number;
};

export type ParametrosBusca = {
  origem: string;
  destino: string;
  ida: string;
  volta?: string;
  passageiros: Passageiros;
  /** 0 = só preço importa, 1 = só segurança importa. */
  pesoSeguranca: number;
  exigirBagagemDespachada: boolean;
  permitirBilhetesSeparados: boolean;
  maxParadas: number;
  /** ISO do país do passaporte, usado para checar visto de trânsito. */
  nacionalidade: string;
};

/** Um sentido da viagem: ida, ou volta quando houver. */
export type TrechoBusca = {
  rotulo: 'ida' | 'volta';
  origem: string;
  destino: string;
  data: string;
  resultados: Resultado[];
  precoMedianoBRL: number;
  /** Quantos itinerários foram descartados pelos filtros do usuário. */
  descartados: number;
};

export type RespostaBusca = {
  parametros: ParametrosBusca;
  trechos: TrechoBusca[];
  /** De onde vieram as ofertas: 'simulado' ou 'amadeus'. */
  provedor: string;
  /** true quando os preços são simulados e não devem ser levados a sério. */
  simulado: boolean;
  geradoEm: string;
  /** Mensagens não fatais, ex.: provedor real indisponível e queda para simulado. */
  avisos: string[];
};
