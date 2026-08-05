import { describe, expect, it } from 'vitest';
import {
  diasDeDiferenca,
  diferencaMin,
  formatarDuracao,
  horaDoDia,
  horaLocal,
  minutosDoDia,
  montarHorario,
  somarDias,
  somarMinutos,
} from '@/lib/tempo';
import { duracaoIsoParaMinutos } from '@/lib/provedores/amadeus';

describe('leitura de horários locais', () => {
  it('lê hora e minuto sem depender do fuso do servidor', () => {
    expect(horaLocal('2026-09-12T08:30')).toBe('08:30');
    expect(horaDoDia('2026-09-12T23:45')).toBe(23);
    expect(minutosDoDia('2026-09-12T08:30')).toBe(510);
  });

  it('aceita horários com segundos, como os da Amadeus', () => {
    expect(horaLocal('2026-09-12T08:30:00')).toBe('08:30');
  });

  it('recusa texto que não é horário', () => {
    expect(() => horaLocal('amanhã cedo')).toThrow();
  });
});

describe('diferencaMin', () => {
  it('mede o intervalo entre dois horários do mesmo dia', () => {
    expect(diferencaMin('2026-09-12T09:00', '2026-09-12T11:30')).toBe(150);
  });

  it('atravessa a virada do dia', () => {
    expect(diferencaMin('2026-09-12T23:30', '2026-09-13T01:15')).toBe(105);
  });

  it('atravessa a virada do mês', () => {
    expect(diferencaMin('2026-09-30T23:00', '2026-10-01T02:00')).toBe(180);
  });

  it('devolve negativo quando a ordem se inverte', () => {
    expect(diferencaMin('2026-09-12T11:00', '2026-09-12T09:00')).toBe(-120);
  });
});

describe('somarMinutos', () => {
  it('avança dentro do mesmo dia', () => {
    expect(somarMinutos('2026-09-12T09:00', 90)).toBe('2026-09-12T10:30');
  });

  it('vira o dia quando passa da meia-noite', () => {
    expect(somarMinutos('2026-09-12T23:00', 120)).toBe('2026-09-13T01:00');
  });

  it('vira o ano corretamente', () => {
    expect(somarMinutos('2026-12-31T22:00', 180)).toBe('2027-01-01T01:00');
  });

  it('aceita minutos negativos', () => {
    expect(somarMinutos('2026-09-12T01:00', -120)).toBe('2026-09-11T23:00');
  });
});

describe('montarHorario e somarDias', () => {
  it('transborda para o dia seguinte quando passa de 1440 minutos', () => {
    expect(montarHorario('2026-09-12', 1500)).toBe('2026-09-13T01:00');
  });

  it('atravessa fevereiro em ano bissexto', () => {
    expect(somarDias('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('conta a diferença de dias entre horários', () => {
    expect(diasDeDiferenca('2026-09-12T23:00', '2026-09-14T01:00')).toBe(2);
    expect(diasDeDiferenca('2026-09-12T09:00', '2026-09-12T22:00')).toBe(0);
  });
});

describe('formatarDuracao', () => {
  it('mostra só minutos abaixo de uma hora', () => {
    expect(formatarDuracao(45)).toBe('45min');
  });

  it('omite os minutos quando são zero', () => {
    expect(formatarDuracao(120)).toBe('2h');
  });

  it('preenche os minutos com zero à esquerda', () => {
    expect(formatarDuracao(125)).toBe('2h05');
  });

  it('não devolve duração negativa', () => {
    expect(formatarDuracao(-30)).toBe('0min');
  });
});

describe('duracaoIsoParaMinutos', () => {
  it('lê horas e minutos', () => {
    expect(duracaoIsoParaMinutos('PT11H45M')).toBe(705);
  });

  it('lê duração só em horas', () => {
    expect(duracaoIsoParaMinutos('PT2H')).toBe(120);
  });

  it('lê duração com dias', () => {
    expect(duracaoIsoParaMinutos('P1DT3H30M')).toBe(1650);
  });

  it('devolve 0 para formato desconhecido', () => {
    expect(duracaoIsoParaMinutos('onze horas')).toBe(0);
  });
});
