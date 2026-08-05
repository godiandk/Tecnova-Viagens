import { montarResultados } from '@/lib/ranking';
import { criarProvedorSimulado, selecionarProvedor } from '@/lib/provedores';
import type { ProvedorBusca } from '@/lib/provedores/tipos';
import type { Itinerario, ParametrosBusca, RespostaBusca, TrechoBusca } from '@/lib/tipos';

type Perna = { rotulo: 'ida' | 'volta'; origem: string; destino: string; data: string };

function pernasDe(parametros: ParametrosBusca): Perna[] {
  const pernas: Perna[] = [
    { rotulo: 'ida', origem: parametros.origem, destino: parametros.destino, data: parametros.ida },
  ];
  if (parametros.volta) {
    pernas.push({
      rotulo: 'volta',
      origem: parametros.destino,
      destino: parametros.origem,
      data: parametros.volta,
    });
  }
  return pernas;
}

/**
 * Roda a busca completa: consulta o provedor por sentido, analisa risco e
 * ordena.
 *
 * Se o provedor real falhar, a busca não morre: cai para os dados simulados e
 * registra um aviso, que a interface mostra em destaque. Preço simulado exibido
 * como se fosse real seria pior do que não responder.
 */
export async function executarBusca(
  parametros: ParametrosBusca,
  provedorInjetado?: ProvedorBusca,
): Promise<RespostaBusca> {
  const provedor = provedorInjetado ?? selecionarProvedor();
  const avisos: string[] = [];

  let provedorEmUso = provedor;
  const trechos: TrechoBusca[] = [];

  for (const perna of pernasDe(parametros)) {
    let crus: Itinerario[] = [];

    try {
      crus = await provedorEmUso.buscarTrecho({
        origem: perna.origem,
        destino: perna.destino,
        data: perna.data,
        passageiros: parametros.passageiros,
      });
    } catch (erro) {
      const motivo = erro instanceof Error ? erro.message : 'erro desconhecido';
      avisos.push(
        `Não foi possível consultar o provedor "${provedorEmUso.nome}" (${motivo}). ` +
          'Exibindo dados simulados — não use estes preços para comprar.',
      );
      provedorEmUso = criarProvedorSimulado();
      crus = await provedorEmUso.buscarTrecho({
        origem: perna.origem,
        destino: perna.destino,
        data: perna.data,
        passageiros: parametros.passageiros,
      });
    }

    const { resultados, precoMedianoBRL } = montarResultados(crus, {
      ...parametros,
      origem: perna.origem,
      destino: perna.destino,
    });

    trechos.push({
      rotulo: perna.rotulo,
      origem: perna.origem,
      destino: perna.destino,
      data: perna.data,
      resultados,
      precoMedianoBRL,
      descartados: crus.length - resultados.length,
    });
  }

  if (provedorEmUso.simulado) {
    avisos.push(
      'Os preços exibidos são simulados e servem para demonstrar o funcionamento da análise. ' +
        'Confirme valores e condições no site da companhia antes de comprar.',
    );
  }

  return {
    parametros,
    trechos,
    provedor: provedorEmUso.nome,
    simulado: provedorEmUso.simulado,
    geradoEm: new Date().toISOString(),
    avisos: [...new Set(avisos)],
  };
}
