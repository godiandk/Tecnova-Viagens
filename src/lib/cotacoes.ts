import type { Resultado } from '@/lib/tipos';

/**
 * Cotações guardadas no painel de revenda.
 *
 * Ficam no navegador (localStorage), não em servidor: são dados comerciais do
 * operador e não há nenhum motivo para trafegarem. A consequência é que a
 * lista é por dispositivo — trocou de aparelho, começou do zero.
 */

const CHAVE = 'tecnova.cotacoes.v1';

export type Cotacao = {
  id: string;
  criadaEm: string;
  rota: string;
  data: string;
  /** Custo real por passageiro, já com bagagem e extras. */
  custoUnitarioBRL: number;
  passageiros: number;
  notaSeguranca: number;
  companhias: string;
  observacao?: string;
};

function disponivel(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    // Navegador com armazenamento bloqueado: o painel segue funcionando,
    // só não lembra das cotações entre visitas.
    return false;
  }
}

export function lerCotacoes(): Cotacao[] {
  if (!disponivel()) return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? (dados as Cotacao[]) : [];
  } catch {
    return [];
  }
}

function gravar(cotacoes: Cotacao[]): void {
  if (!disponivel()) return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(cotacoes));
  } catch {
    // Cota de armazenamento estourada: nada a fazer além de não quebrar.
  }
  invalidar();
}

/* ------------------------------------------------------------------ *
 * Assinatura para o React                                             *
 * ------------------------------------------------------------------ *
 * localStorage é uma fonte de dados externa, então a tela se inscreve
 * nela via useSyncExternalStore em vez de copiar para dentro de um
 * estado com efeito. Isso exige um snapshot estável: sem o cache, cada
 * leitura devolveria um array novo e o React re-renderizaria sem fim.  */

let cache: Cotacao[] | null = null;
const ouvintes = new Set<() => void>();
let escutandoOutrasAbas = false;

/** Referência fixa para renderização no servidor, onde não há armazenamento. */
const VAZIO: Cotacao[] = [];

function invalidar(): void {
  cache = null;
  for (const ouvinte of ouvintes) ouvinte();
}

export function assinarCotacoes(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);

  if (!escutandoOutrasAbas && disponivel()) {
    // Outra aba salvou uma cotação: o evento `storage` só chega aqui.
    window.addEventListener('storage', invalidar);
    escutandoOutrasAbas = true;
  }

  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function lerCotacoesSnapshot(): Cotacao[] {
  if (cache === null) cache = lerCotacoes();
  return cache;
}

export function lerCotacoesNoServidor(): Cotacao[] {
  return VAZIO;
}

export function salvarCotacao(cotacao: Cotacao): void {
  gravar([cotacao, ...lerCotacoes()]);
}

export function removerCotacao(id: string): void {
  gravar(lerCotacoes().filter((c) => c.id !== id));
}

export function limparCotacoes(): void {
  gravar([]);
}

/** Converte um resultado da busca em cotação, usando o custo real. */
export function cotacaoDeResultado(
  resultado: Resultado,
  data: string,
  passageiros: number,
): Cotacao {
  const { itinerario, custo, seguranca } = resultado;
  const companhias = [
    ...new Set(itinerario.bilhetes.flatMap((b) => b.segmentos.map((s) => s.companhia))),
  ].join(', ');

  return {
    id: `${itinerario.id}-${Date.now()}`,
    criadaEm: new Date().toISOString(),
    rota: `${itinerario.origem} → ${itinerario.destino}`,
    data,
    // O custo total já inclui bagagem, traslado e reserva de imprevisto: é o
    // número certo para precificar, não o preço anunciado.
    custoUnitarioBRL: Math.round(custo.totalBRL / Math.max(1, passageiros)),
    passageiros,
    notaSeguranca: seguranca.score,
    companhias,
  };
}
