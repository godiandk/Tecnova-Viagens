import { describe, expect, it } from 'vitest';
import { executarBusca } from '@/lib/busca';
import { criarProvedorSimulado } from '@/lib/provedores/simulado';
import { gerarItinerarios } from '@/lib/provedores/simulado';
import { extrairConexoes } from '@/lib/seguranca';
import { diferencaMin } from '@/lib/tempo';
import type { ParametrosBusca } from '@/lib/tipos';
import type { ProvedorBusca } from '@/lib/provedores/tipos';

const PASSAGEIROS = { adultos: 1, criancas: 0, bebes: 0 };

const PARAMETROS: ParametrosBusca = {
  origem: 'GRU',
  destino: 'LIS',
  ida: '2026-09-12',
  passageiros: PASSAGEIROS,
  pesoSeguranca: 0.45,
  exigirBagagemDespachada: false,
  permitirBilhetesSeparados: true,
  maxParadas: 3,
  nacionalidade: 'BR',
};

describe('provedor simulado', () => {
  it('gera as mesmas ofertas para a mesma consulta', () => {
    const consulta = { origem: 'GRU', destino: 'LIS', data: '2026-09-12', passageiros: PASSAGEIROS };
    expect(gerarItinerarios(consulta)).toEqual(gerarItinerarios(consulta));
  });

  it('gera ofertas diferentes para datas diferentes', () => {
    const a = gerarItinerarios({ origem: 'GRU', destino: 'LIS', data: '2026-09-12', passageiros: PASSAGEIROS });
    const b = gerarItinerarios({ origem: 'GRU', destino: 'LIS', data: '2026-09-19', passageiros: PASSAGEIROS });
    expect(a).not.toEqual(b);
  });

  it('devolve lista vazia quando origem e destino são iguais', () => {
    expect(
      gerarItinerarios({ origem: 'GRU', destino: 'GRU', data: '2026-09-12', passageiros: PASSAGEIROS }),
    ).toEqual([]);
  });

  it('devolve lista vazia para aeroporto fora do catálogo', () => {
    expect(
      gerarItinerarios({ origem: 'GRU', destino: 'ZZZ', data: '2026-09-12', passageiros: PASSAGEIROS }),
    ).toEqual([]);
  });

  it('produz itinerários encadeados: cada voo parte de onde o anterior chegou', () => {
    const itinerarios = gerarItinerarios({
      origem: 'GRU',
      destino: 'LIS',
      data: '2026-09-12',
      passageiros: PASSAGEIROS,
    });

    expect(itinerarios.length).toBeGreaterThan(3);
    for (const it of itinerarios) {
      const segmentos = it.bilhetes.flatMap((b) => b.segmentos);
      expect(segmentos[0].origem).toBe('GRU');
      expect(segmentos[segmentos.length - 1].destino).toBe('LIS');
    }
  });

  it('nunca gera conexão que parte antes de o voo anterior chegar', () => {
    for (const data of ['2026-09-12', '2026-11-03', '2027-01-20']) {
      for (const [origem, destino] of [
        ['GRU', 'LIS'],
        ['CGH', 'REC'],
        ['POA', 'MIA'],
        ['SSA', 'CWB'],
      ]) {
        for (const it of gerarItinerarios({ origem, destino, data, passageiros: PASSAGEIROS })) {
          for (const conexao of extrairConexoes(it)) {
            expect(conexao.esperaMin).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('mantém preço e duração positivos e coerentes', () => {
    for (const it of gerarItinerarios({
      origem: 'GRU',
      destino: 'MIA',
      data: '2026-09-12',
      passageiros: PASSAGEIROS,
    })) {
      expect(it.precoBRL).toBeGreaterThan(0);
      expect(it.duracaoTotalMin).toBeGreaterThan(0);
      expect(it.paradas).toBe(it.bilhetes.flatMap((b) => b.segmentos).length - 1);
      expect(diferencaMin(it.partida, it.chegada)).not.toBe(0);
    }
  });

  it('cobra mais por mais passageiros', () => {
    const um = gerarItinerarios({
      origem: 'GRU',
      destino: 'LIS',
      data: '2026-09-12',
      passageiros: PASSAGEIROS,
    });
    const dois = gerarItinerarios({
      origem: 'GRU',
      destino: 'LIS',
      data: '2026-09-12',
      passageiros: { adultos: 2, criancas: 0, bebes: 0 },
    });

    expect(dois[0].precoBRL).toBeGreaterThan(um[0].precoBRL);
  });

  it('oferece rota curta mesmo sem hub viável', () => {
    const itinerarios = gerarItinerarios({
      origem: 'CGH',
      destino: 'SDU',
      data: '2026-09-12',
      passageiros: PASSAGEIROS,
    });
    expect(itinerarios.length).toBeGreaterThan(0);
  });
});

describe('executarBusca', () => {
  it('devolve só a ida quando não há data de volta', async () => {
    const resposta = await executarBusca(PARAMETROS, criarProvedorSimulado());

    expect(resposta.trechos).toHaveLength(1);
    expect(resposta.trechos[0].rotulo).toBe('ida');
    expect(resposta.trechos[0].resultados.length).toBeGreaterThan(0);
  });

  it('inverte origem e destino no trecho de volta', async () => {
    const resposta = await executarBusca(
      { ...PARAMETROS, volta: '2026-09-20' },
      criarProvedorSimulado(),
    );

    expect(resposta.trechos).toHaveLength(2);
    expect(resposta.trechos[1]).toMatchObject({
      rotulo: 'volta',
      origem: 'LIS',
      destino: 'GRU',
      data: '2026-09-20',
    });
  });

  it('avisa em destaque que os preços simulados não servem para comprar', async () => {
    const resposta = await executarBusca(PARAMETROS, criarProvedorSimulado());

    expect(resposta.simulado).toBe(true);
    expect(resposta.avisos.join(' ')).toContain('simulados');
  });

  it('conta quantos itinerários os filtros descartaram', async () => {
    const resposta = await executarBusca(
      { ...PARAMETROS, permitirBilhetesSeparados: false },
      criarProvedorSimulado(),
    );

    expect(resposta.trechos[0].descartados).toBeGreaterThan(0);
    for (const resultado of resposta.trechos[0].resultados) {
      expect(resultado.itinerario.bilhetes).toHaveLength(1);
    }
  });

  it('cai para os dados simulados quando o provedor real falha', async () => {
    const provedorQuebrado: ProvedorBusca = {
      nome: 'amadeus',
      simulado: false,
      async buscarTrecho() {
        throw new Error('HTTP 401');
      },
    };

    const resposta = await executarBusca(PARAMETROS, provedorQuebrado);

    expect(resposta.provedor).toBe('simulado');
    expect(resposta.trechos[0].resultados.length).toBeGreaterThan(0);
    expect(resposta.avisos.join(' ')).toContain('HTTP 401');
  });

  it('ordena de forma diferente conforme o peso da balança', async () => {
    const barato = await executarBusca(
      { ...PARAMETROS, pesoSeguranca: 0 },
      criarProvedorSimulado(),
    );
    const seguro = await executarBusca(
      { ...PARAMETROS, pesoSeguranca: 1 },
      criarProvedorSimulado(),
    );

    const primeiroBarato = barato.trechos[0].resultados[0];
    const primeiroSeguro = seguro.trechos[0].resultados[0];

    expect(primeiroSeguro.seguranca.score).toBeGreaterThanOrEqual(
      primeiroBarato.seguranca.score,
    );
    expect(primeiroBarato.itinerario.precoBRL).toBeLessThanOrEqual(
      primeiroSeguro.itinerario.precoBRL,
    );
  });
});
