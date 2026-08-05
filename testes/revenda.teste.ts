import { describe, expect, it } from 'vitest';
import { calcularRepasse, margemParaLucroAlvo } from '@/lib/revenda';

const BASE = {
  custoUnitarioBRL: 1000,
  passageiros: 1,
  tipoMargem: 'percentual' as const,
  margem: 20,
  taxaCartaoPercent: 0,
};

describe('calcularRepasse', () => {
  it('aplica margem percentual sobre o custo', () => {
    const r = calcularRepasse(BASE);
    expect(r.precoUnitarioBRL).toBe(1200);
    expect(r.lucroTotalBRL).toBe(200);
    expect(r.prejuizo).toBe(false);
  });

  it('aplica margem como valor fixo por passageiro', () => {
    const r = calcularRepasse({ ...BASE, tipoMargem: 'fixo', margem: 150 });
    expect(r.precoUnitarioBRL).toBe(1150);
    expect(r.lucroUnitarioBRL).toBe(150);
  });

  it('multiplica pelo número de passageiros', () => {
    const r = calcularRepasse({ ...BASE, passageiros: 3 });
    expect(r.custoTotalBRL).toBe(3000);
    expect(r.precoTotalBRL).toBe(3600);
    expect(r.lucroTotalBRL).toBe(600);
  });

  it('desconta a taxa do cartão do lucro', () => {
    const r = calcularRepasse({ ...BASE, taxaCartaoPercent: 5 });
    // Cobra 1200, a maquininha retém 60, o custo é 1000: sobram 140, não 200.
    expect(r.taxaCartaoBRL).toBe(60);
    expect(r.lucroTotalBRL).toBe(140);
  });

  it('mostra a margem que sobra de verdade, não a nominal', () => {
    const r = calcularRepasse({ ...BASE, taxaCartaoPercent: 5 });
    // 140 de lucro sobre 1200 cobrados = 11,7%, e não os 20% da margem.
    expect(r.margemEfetivaPercent).toBeCloseTo(11.7, 1);
  });

  it('acusa prejuízo quando a taxa supera a margem', () => {
    const r = calcularRepasse({ ...BASE, margem: 3, taxaCartaoPercent: 10 });
    expect(r.prejuizo).toBe(true);
    expect(r.lucroTotalBRL).toBeLessThan(0);
  });

  it('trata entradas inválidas sem devolver NaN', () => {
    const r = calcularRepasse({
      custoUnitarioBRL: Number.NaN,
      passageiros: 0,
      tipoMargem: 'percentual',
      margem: Number.NaN,
      taxaCartaoPercent: -5,
    });

    for (const valor of Object.values(r)) {
      if (typeof valor === 'number') expect(Number.isFinite(valor)).toBe(true);
    }
    expect(r.precoTotalBRL).toBe(0);
  });
});

describe('margemParaLucroAlvo', () => {
  it('devolve a margem que entrega o lucro pedido sem taxa', () => {
    expect(margemParaLucroAlvo(1000, 200, 0)).toBe(20);
  });

  it('compensa a taxa do cartão', () => {
    const margem = margemParaLucroAlvo(1000, 200, 5);
    expect(margem).toBeGreaterThan(20);

    // Aplicando a margem sugerida, o lucro tem que bater com o alvo.
    const r = calcularRepasse({
      custoUnitarioBRL: 1000,
      passageiros: 1,
      tipoMargem: 'percentual',
      margem,
      taxaCartaoPercent: 5,
    });
    expect(r.lucroUnitarioBRL).toBeCloseTo(200, 0);
  });

  it('devolve 0 quando não há custo para marcar', () => {
    expect(margemParaLucroAlvo(0, 200, 5)).toBe(0);
  });
});
