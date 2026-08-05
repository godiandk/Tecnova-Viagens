/**
 * Limitador de requisições por janela fixa, em memória.
 *
 * Serve para conter abuso trivial e proteger a cota da API do provedor. Como o
 * estado vive no processo, ele NÃO funciona com várias instâncias (serverless,
 * múltiplos contêineres): nesse cenário, troque por Redis ou pelo limitador da
 * borda antes de expor o site publicamente.
 */
type Registro = { contagem: number; reiniciaEm: number };

const registros = new Map<string, Registro>();

/** Evita crescimento sem fim do mapa em processos de vida longa. */
const LIMITE_CHAVES = 10_000;

export type ResultadoLimite = {
  permitido: boolean;
  restantes: number;
  /** Segundos até a janela reiniciar. */
  reiniciaEmSegundos: number;
};

export function verificarLimite(
  chave: string,
  maximo = 30,
  janelaMs = 60_000,
): ResultadoLimite {
  const agora = Date.now();
  const registro = registros.get(chave);

  if (!registro || agora >= registro.reiniciaEm) {
    if (registros.size >= LIMITE_CHAVES) limparExpirados(agora);
    registros.set(chave, { contagem: 1, reiniciaEm: agora + janelaMs });
    return { permitido: true, restantes: maximo - 1, reiniciaEmSegundos: janelaMs / 1000 };
  }

  registro.contagem += 1;
  const reiniciaEmSegundos = Math.ceil((registro.reiniciaEm - agora) / 1000);

  return {
    permitido: registro.contagem <= maximo,
    restantes: Math.max(0, maximo - registro.contagem),
    reiniciaEmSegundos,
  };
}

function limparExpirados(agora: number): void {
  for (const [chave, registro] of registros) {
    if (agora >= registro.reiniciaEm) registros.delete(chave);
  }
}

/** Identifica o cliente pelo cabeçalho de proxy, caindo para um balde comum. */
export function identificarCliente(cabecalhos: Headers): string {
  const encaminhado = cabecalhos.get('x-forwarded-for');
  if (encaminhado) return encaminhado.split(',')[0].trim();
  return cabecalhos.get('x-real-ip') ?? 'desconhecido';
}

/** Apenas para testes: zera o estado entre casos. */
export function reiniciarLimitador(): void {
  registros.clear();
}
