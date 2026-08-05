import { beforeEach, describe, expect, it, vi } from 'vitest';
import { identificarCliente, reiniciarLimitador, verificarLimite } from '@/lib/limitador';

describe('verificarLimite', () => {
  beforeEach(() => {
    reiniciarLimitador();
    vi.useRealTimers();
  });

  it('permite requisições até o teto da janela', () => {
    for (let i = 0; i < 3; i++) {
      expect(verificarLimite('cliente', 3).permitido).toBe(true);
    }
    expect(verificarLimite('cliente', 3).permitido).toBe(false);
  });

  it('conta clientes separadamente', () => {
    verificarLimite('a', 1);
    expect(verificarLimite('a', 1).permitido).toBe(false);
    expect(verificarLimite('b', 1).permitido).toBe(true);
  });

  it('informa quantas requisições ainda cabem', () => {
    expect(verificarLimite('cliente', 3).restantes).toBe(2);
    expect(verificarLimite('cliente', 3).restantes).toBe(1);
  });

  it('libera de novo quando a janela expira', () => {
    vi.useFakeTimers();
    verificarLimite('cliente', 1, 60_000);
    expect(verificarLimite('cliente', 1, 60_000).permitido).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(verificarLimite('cliente', 1, 60_000).permitido).toBe(true);
  });
});

describe('identificarCliente', () => {
  it('usa o primeiro endereço de x-forwarded-for', () => {
    const cabecalhos = new Headers({ 'x-forwarded-for': '203.0.113.5, 70.41.3.18' });
    expect(identificarCliente(cabecalhos)).toBe('203.0.113.5');
  });

  it('cai para x-real-ip quando não há cadeia de proxy', () => {
    expect(identificarCliente(new Headers({ 'x-real-ip': '198.51.100.9' }))).toBe('198.51.100.9');
  });

  it('devolve um balde comum quando não dá para identificar', () => {
    expect(identificarCliente(new Headers())).toBe('desconhecido');
  });
});
