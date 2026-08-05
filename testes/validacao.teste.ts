import { describe, expect, it } from 'vitest';
import { validarParametrosBusca } from '@/lib/validacao';

function daquiADias(dias: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

const BASE = {
  origem: 'GRU',
  destino: 'LIS',
  ida: daquiADias(30),
};

function erros(entrada: unknown): string[] {
  const r = validarParametrosBusca(entrada);
  return r.ok ? [] : r.erros;
}

describe('validarParametrosBusca', () => {
  it('aceita o mínimo e completa o resto com padrões', () => {
    const r = validarParametrosBusca(BASE);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.passageiros).toEqual({ adultos: 1, criancas: 0, bebes: 0 });
    expect(r.valor.nacionalidade).toBe('BR');
    expect(r.valor.maxParadas).toBe(2);
    expect(r.valor.permitirBilhetesSeparados).toBe(true);
  });

  it('normaliza códigos IATA para maiúsculas', () => {
    const r = validarParametrosBusca({ ...BASE, origem: 'gru', destino: 'lis' });
    expect(r.ok && r.valor.origem).toBe('GRU');
    expect(r.ok && r.valor.destino).toBe('LIS');
  });

  it('rejeita aeroporto fora do catálogo', () => {
    expect(erros({ ...BASE, destino: 'ZZZ' })[0]).toContain('não está no catálogo');
  });

  it('rejeita origem igual ao destino', () => {
    expect(erros({ ...BASE, destino: 'GRU' })).toContain(
      'Origem e destino precisam ser diferentes.',
    );
  });

  it('rejeita data de ida no passado', () => {
    expect(erros({ ...BASE, ida: daquiADias(-1) })).toContain(
      'A data de ida não pode estar no passado.',
    );
  });

  it('rejeita data inexistente no calendário', () => {
    expect(erros({ ...BASE, ida: '2026-02-31' })[0]).toContain('Data de ida inválida');
  });

  it('rejeita volta anterior à ida', () => {
    const r = erros({ ...BASE, ida: daquiADias(30), volta: daquiADias(20) });
    expect(r).toContain('A volta não pode ser antes da ida.');
  });

  it('aceita volta no mesmo dia da ida', () => {
    const dia = daquiADias(30);
    expect(validarParametrosBusca({ ...BASE, ida: dia, volta: dia }).ok).toBe(true);
  });

  it('trata volta vazia como viagem só de ida', () => {
    const r = validarParametrosBusca({ ...BASE, volta: '' });
    expect(r.ok && r.valor.volta).toBeUndefined();
  });

  it('rejeita mais bebês do que adultos', () => {
    const r = erros({ ...BASE, passageiros: { adultos: 1, criancas: 0, bebes: 2 } });
    expect(r).toContain('Cada bebê de colo precisa de um adulto acompanhante.');
  });

  it('limita o peso da balança ao intervalo de 0 a 1', () => {
    expect(validarParametrosBusca({ ...BASE, pesoSeguranca: 5 })).toMatchObject({
      valor: { pesoSeguranca: 1 },
    });
    expect(validarParametrosBusca({ ...BASE, pesoSeguranca: -3 })).toMatchObject({
      valor: { pesoSeguranca: 0 },
    });
  });

  it('cai no padrão quando o peso não é numérico', () => {
    const r = validarParametrosBusca({ ...BASE, pesoSeguranca: 'talvez' });
    expect(r.ok && r.valor.pesoSeguranca).toBe(0.45);
  });

  it('aceita booleanos vindos como texto do formulário', () => {
    const r = validarParametrosBusca({ ...BASE, exigirBagagemDespachada: 'true' });
    expect(r.ok && r.valor.exigirBagagemDespachada).toBe(true);
  });

  it('ignora nacionalidade malformada em vez de recusar a busca', () => {
    const r = validarParametrosBusca({ ...BASE, nacionalidade: 'brasil' });
    expect(r.ok && r.valor.nacionalidade).toBe('BR');
  });

  it('não quebra com entrada nula', () => {
    expect(validarParametrosBusca(null).ok).toBe(false);
  });

  it('acumula todos os erros de uma vez', () => {
    const r = erros({ origem: 'XX', destino: '', ida: 'ontem' });
    expect(r.length).toBeGreaterThanOrEqual(3);
  });
});
