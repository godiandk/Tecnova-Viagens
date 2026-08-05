/**
 * Constantes de calibração do motor de risco.
 *
 * Estão todas em um lugar só, de propósito: são premissas de negócio, não
 * verdades. Ajuste conforme sua realidade (rotas, época do ano, perfil de
 * passageiro) sem precisar mexer na lógica.
 */

/** Tempo mínimo de conexão (MCT), em minutos. */
export const MCT = {
  /** Dois voos domésticos, mesmo aeroporto. */
  domestico: 45,
  /** Qualquer perna internacional: imigração, alfândega, re-despacho. */
  internacional: 90,
  /** Conexão que exige sair e voltar para o check-in (bilhetes separados). */
  bilheteSeparado: 180,
  /** Conexão trocando de aeroporto na mesma cidade. */
  trocaAeroporto: 300,
} as const;

/** Custos em reais usados para estimar o preço real da viagem. */
export const CUSTOS = {
  bagagemDespachadaDomestica: 180,
  bagagemDespachadaInternacional: 420,
  trasladoEntreAeroportos: 160,
  pernoite: 320,
  /** Prejuízo típico quando a companhia é obrigada a reacomodar você. */
  recuperacaoProtegida: 350,
  /** Multiplicador do preço da perna perdida ao recomprar em cima da hora. */
  multiplicadorRecompra: 2.2,
  /** Piso do prejuízo quando não há proteção entre bilhetes. */
  recuperacaoDesprotegidaMinima: 700,
} as const;

/** Descontos no score de segurança, por tipo de problema. */
export const PENALIDADES = {
  bilhetesSeparados: 30,
  autoconexaoApertada: 16,
  conexaoAbaixoDoMinimo: 22,
  conexaoJustaNoLimite: 11,
  trocaDeAeroporto: 25,
  porParada: 5,
  conexaoLonga: 3,
  conexaoMuitoLonga: 6,
  conexaoNoturnaSemMargem: 5,
  chegadaMadrugada: 5,
  partidaMadrugada: 3,
  naoRemarcavel: 6,
  naoReembolsavel: 3,
  precoSuspeito: 8,
  vistoTransito: { critico: 35, alto: 20, medio: 10, baixo: 4, info: 0 },
  /** Escala aplicada sobre o quanto a pontualidade fica abaixo da referência. */
  pontualidadeReferencia: 0.85,
  pontualidadeEscala: 60,
  pontualidadeMaxima: 12,
} as const;

/** Faixas do score de segurança. */
export const FAIXAS = {
  seguro: 80,
  aceitavel: 60,
  arriscado: 40,
} as const;

/** Janela considerada madrugada (hora local). */
export const MADRUGADA = { inicio: 0, fim: 5 } as const;

/** Conexão que parte depois deste horário vira pernoite se atrasar. */
export const HORA_CONEXAO_NOTURNA = 21;

/** Acima disso a conexão é longa demais para ser confortável (minutos). */
export const CONEXAO_LONGA_MIN = 360;
export const CONEXAO_MUITO_LONGA_MIN = 600;

/** Abaixo desta fração da mediana, o preço merece desconfiança. */
export const FRACAO_PRECO_SUSPEITO = 0.5;

/** Peso padrão do eixo segurança no ranking (0 = só preço, 1 = só segurança). */
export const PESO_SEGURANCA_PADRAO = 0.45;
