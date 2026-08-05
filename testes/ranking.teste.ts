import { describe, expect, it } from 'vitest';
import { aplicarFiltros, desembolso, mediana, montarResultados } from '@/lib/ranking';
import { analisarSeguranca, estimarCusto } from '@/lib/seguranca';
import type { ParametrosBusca } from '@/lib/tipos';
import { bilhete, itinerario, segmento } from './ajuda';

const PARAMETROS: ParametrosBusca = {
  origem: 'GRU',
  destino: 'FOR',
  ida: '2026-09-12',
  passageiros: { adultos: 1, criancas: 0, bebes: 0 },
  pesoSeguranca: 0.45,
  exigirBagagemDespachada: false,
  permitirBilhetesSeparados: true,
  maxParadas: 2,
  nacionalidade: 'BR',
};

/** Voo direto, caro e sem nenhum ponto de atenção. */
function opcaoSegura(precoBRL: number) {
  return itinerario([
    bilhete({
      precoBRL,
      segmentos: [
        segmento({ origem: 'GRU', destino: 'FOR', partida: '2026-09-12T09:00', duracaoMin: 200 }),
      ],
    }),
  ]);
}

/** Dois bilhetes avulsos com conexão impossível — o clássico "barato demais". */
function opcaoArriscada(precoBRL: number) {
  return itinerario([
    bilhete({
      precoBRL: precoBRL / 2,
      bagagemDespachada: false,
      remarcavel: false,
      reembolsavel: false,
      segmentos: [
        segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
      ],
    }),
    bilhete({
      precoBRL: precoBRL / 2,
      bagagemDespachada: false,
      remarcavel: false,
      reembolsavel: false,
      segmentos: [
        segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T11:20', duracaoMin: 160 }),
      ],
    }),
  ]);
}

describe('mediana', () => {
  it('devolve 0 para lista vazia', () => {
    expect(mediana([])).toBe(0);
  });

  it('usa a média dos centrais quando a quantidade é par', () => {
    expect(mediana([10, 20, 30, 40])).toBe(25);
  });

  it('ignora a ordem de entrada', () => {
    expect(mediana([30, 10, 20])).toBe(20);
  });
});

describe('aplicarFiltros', () => {
  it('remove bilhetes separados quando o usuário exige bilhete único', () => {
    const entrada = [opcaoSegura(1200), opcaoArriscada(600)];
    const saida = aplicarFiltros(entrada, { ...PARAMETROS, permitirBilhetesSeparados: false });

    expect(saida).toHaveLength(1);
    expect(saida[0].bilhetes).toHaveLength(1);
  });

  it('remove itinerários com mais paradas que o permitido', () => {
    const entrada = [opcaoSegura(1200), opcaoArriscada(600)];
    expect(aplicarFiltros(entrada, { ...PARAMETROS, maxParadas: 0 })).toHaveLength(1);
  });

  it('remove tarifas sem bagagem quando exigida', () => {
    const entrada = [opcaoSegura(1200), opcaoArriscada(600)];
    const saida = aplicarFiltros(entrada, { ...PARAMETROS, exigirBagagemDespachada: true });
    expect(saida).toHaveLength(1);
  });
});

describe('montarResultados', () => {
  it('coloca a opção mais barata em primeiro quando o peso é todo no preço', () => {
    const { resultados } = montarResultados([opcaoSegura(1200), opcaoArriscada(600)], {
      ...PARAMETROS,
      pesoSeguranca: 0,
    });

    expect(resultados[0].itinerario.precoBRL).toBe(600);
  });

  it('coloca a opção mais segura em primeiro quando o peso é todo na segurança', () => {
    const { resultados } = montarResultados([opcaoArriscada(600), opcaoSegura(1200)], {
      ...PARAMETROS,
      pesoSeguranca: 1,
    });

    expect(resultados[0].itinerario.precoBRL).toBe(1200);
    expect(resultados[0].seguranca.faixa).toBe('seguro');
  });

  it('inverte a ordem conforme a balança se move', () => {
    const entrada = [opcaoArriscada(600), opcaoSegura(1200)];
    const barato = montarResultados(entrada, { ...PARAMETROS, pesoSeguranca: 0 }).resultados;
    const seguro = montarResultados(entrada, { ...PARAMETROS, pesoSeguranca: 1 }).resultados;

    expect(barato[0].itinerario.id).not.toBe(seguro[0].itinerario.id);
  });

  it('devolve lista vazia sem quebrar quando tudo é filtrado', () => {
    const { resultados, precoMedianoBRL } = montarResultados([opcaoArriscada(600)], {
      ...PARAMETROS,
      permitirBilhetesSeparados: false,
    });

    expect(resultados).toEqual([]);
    expect(precoMedianoBRL).toBe(0);
  });

  it('marca os selos de mais barato e mais seguro em opções diferentes', () => {
    const { resultados } = montarResultados([opcaoSegura(1200), opcaoArriscada(600)], PARAMETROS);

    const maisBarato = resultados.find((r) => r.selos.includes('mais-barato'));
    const maisSeguro = resultados.find((r) => r.selos.includes('mais-seguro'));

    expect(maisBarato?.itinerario.precoBRL).toBe(600);
    expect(maisSeguro?.itinerario.precoBRL).toBe(1200);
  });

  it('dá o selo de melhor escolha ao primeiro da lista', () => {
    const { resultados } = montarResultados([opcaoSegura(1200), opcaoArriscada(600)], PARAMETROS);
    expect(resultados[0].selos).toContain('melhor-escolha');
  });

  it('calcula a economia em relação à mediana', () => {
    const { resultados, precoMedianoBRL } = montarResultados(
      [opcaoSegura(1000), opcaoSegura(2000), opcaoArriscada(500)],
      PARAMETROS,
    );

    expect(precoMedianoBRL).toBe(1000);
    const maisBarato = resultados.find((r) => r.itinerario.precoBRL === 500);
    expect(maisBarato?.economiaPercent).toBe(50);
  });

  it('prefere a opção segura quando ela custa pouco mais que a arriscada', () => {
    // 18% mais cara, porém sem nenhum ponto de atenção: no ajuste equilibrado
    // a diferença de risco tem que superar a diferença de preço.
    const { resultados } = montarResultados([opcaoSegura(1180), opcaoArriscada(1000)], {
      ...PARAMETROS,
      pesoSeguranca: 0.45,
    });

    expect(resultados[0].seguranca.faixa).toBe('seguro');
  });

  it('não deixa a ordem depender do leque de preços do conjunto', () => {
    // A nota de preço é uma razão, não uma normalização min-max: incluir uma
    // opção cara e irrelevante não pode inverter a disputa entre as outras duas.
    const disputa = [opcaoSegura(1180), opcaoArriscada(1000)];
    const semRuido = montarResultados(disputa, PARAMETROS).resultados;
    const comRuido = montarResultados([...disputa, opcaoSegura(9000)], PARAMETROS).resultados;

    expect(comRuido[0].itinerario.precoBRL).toBe(semRuido[0].itinerario.precoBRL);
  });

  it('trata itinerários de preço idêntico sem dividir por zero', () => {
    const { resultados } = montarResultados([opcaoSegura(1000), opcaoSegura(1000)], PARAMETROS);

    expect(resultados).toHaveLength(2);
    for (const resultado of resultados) {
      expect(Number.isFinite(resultado.pontuacao)).toBe(true);
    }
  });
});

describe('desembolso', () => {
  it('exclui o componente de risco para não punir o mesmo problema duas vezes', () => {
    const it = opcaoArriscada(600);
    const custo = estimarCusto(it, analisarSeguranca(it, { nacionalidade: 'BR' }));

    expect(custo.riscoBRL).toBeGreaterThan(0);
    expect(desembolso(custo)).toBe(custo.totalBRL - custo.riscoBRL);
  });
});
