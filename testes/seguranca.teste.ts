import { describe, expect, it } from 'vitest';
import { analisarSeguranca, estimarCusto, extrairConexoes } from '@/lib/seguranca';
import { MCT } from '@/lib/config';
import { bilhete, itinerario, segmento, temAlerta, vooDireto } from './ajuda';

const BR = { nacionalidade: 'BR' };

describe('extrairConexoes', () => {
  it('não encontra conexão em voo direto', () => {
    expect(extrairConexoes(vooDireto())).toHaveLength(0);
  });

  it('marca conexão interna ao bilhete como protegida', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T12:00', duracaoMin: 160 }),
        ],
      }),
    ]);

    const conexoes = extrairConexoes(it);
    expect(conexoes).toHaveLength(1);
    expect(conexoes[0].mesmoBilhete).toBe(true);
    expect(conexoes[0].mctMin).toBe(MCT.domestico);
    expect(conexoes[0].esperaMin).toBe(75);
  });

  it('exige mais tempo quando a conexão é internacional', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'LIS', partida: '2026-09-12T22:00', duracaoMin: 580 }),
          segmento({ origem: 'LIS', destino: 'MAD', partida: '2026-09-13T09:00', duracaoMin: 80 }),
        ],
      }),
    ]);

    expect(extrairConexoes(it)[0].mctMin).toBe(MCT.internacional);
  });

  it('exige o maior tempo quando a conexão troca de aeroporto', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'BSB', destino: 'GRU', partida: '2026-09-12T08:00', duracaoMin: 105 }),
        ],
      }),
      bilhete({
        segmentos: [
          segmento({ origem: 'CGH', destino: 'POA', partida: '2026-09-12T15:00', duracaoMin: 100 }),
        ],
      }),
    ]);

    const conexao = extrairConexoes(it)[0];
    expect(conexao.trocaAeroporto).toBe(true);
    expect(conexao.mctMin).toBe(MCT.trocaAeroporto);
  });
});

describe('analisarSeguranca', () => {
  it('dá nota máxima a um voo direto sem restrição de tarifa', () => {
    const analise = analisarSeguranca(vooDireto(), BR);
    expect(analise.score).toBe(100);
    expect(analise.faixa).toBe('seguro');
    expect(analise.alertas).toHaveLength(0);
  });

  it('penaliza bilhetes separados mesmo com espera confortável', () => {
    const it = itinerario([
      bilhete({
        precoBRL: 500,
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T08:00', duracaoMin: 105 }),
        ],
      }),
      bilhete({
        precoBRL: 500,
        segmentos: [
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T14:00', duracaoMin: 160 }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, BR);
    expect(temAlerta(analise.alertas, 'BILHETES_SEPARADOS')).toBe(true);
    // Espera de 4h15 está acima do mínimo de 3h, então não é "apertada".
    expect(temAlerta(analise.alertas, 'AUTOCONEXAO_APERTADA')).toBe(false);
    expect(analise.score).toBeLessThan(70);
  });

  it('acumula alerta de margem quando os bilhetes separados são colados', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T08:00', duracaoMin: 105 }),
        ],
      }),
      bilhete({
        segmentos: [
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T10:30', duracaoMin: 160 }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, BR);
    expect(temAlerta(analise.alertas, 'AUTOCONEXAO_APERTADA')).toBe(true);
    expect(analise.faixa).toBe('evitar');
  });

  it('reprova conexão abaixo do mínimo do aeroporto', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T11:15', duracaoMin: 160 }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, BR);
    expect(temAlerta(analise.alertas, 'CONEXAO_ABAIXO_DO_MINIMO')).toBe(true);
  });

  it('avisa sobre conexão que passa raspando pelo mínimo', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T11:45', duracaoMin: 160 }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, BR);
    expect(temAlerta(analise.alertas, 'CONEXAO_JUSTA')).toBe(true);
    expect(temAlerta(analise.alertas, 'CONEXAO_ABAIXO_DO_MINIMO')).toBe(false);
  });

  it('alerta sobre visto de trânsito para brasileiro conectando nos EUA', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'MIA', partida: '2026-09-12T23:00', duracaoMin: 500 }),
          segmento({ origem: 'MIA', destino: 'MEX', partida: '2026-09-13T11:00', duracaoMin: 210 }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, BR);
    expect(temAlerta(analise.alertas, 'VISTO_TRANSITO_US')).toBe(true);
  });

  it('não alerta sobre visto americano para quem tem passaporte dos EUA', () => {
    const it = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'MIA', partida: '2026-09-12T23:00', duracaoMin: 500 }),
          segmento({ origem: 'MIA', destino: 'MEX', partida: '2026-09-13T11:00', duracaoMin: 210 }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, { nacionalidade: 'US' });
    expect(temAlerta(analise.alertas, 'VISTO_TRANSITO_US')).toBe(false);
  });

  it('desconfia de preço muito abaixo da mediana da busca', () => {
    const analise = analisarSeguranca(vooDireto(400), {
      nacionalidade: 'BR',
      precoMedianoBRL: 1200,
    });
    expect(temAlerta(analise.alertas, 'PRECO_SUSPEITO')).toBe(true);
  });

  it('mantém o score dentro de 0 e 100 mesmo empilhando problemas', () => {
    const it = itinerario([
      bilhete({
        remarcavel: false,
        reembolsavel: false,
        bagagemDespachada: false,
        segmentos: [
          segmento({
            companhia: '2Z',
            origem: 'GRU',
            destino: 'MIA',
            partida: '2026-09-12T01:00',
            duracaoMin: 500,
          }),
        ],
      }),
      bilhete({
        remarcavel: false,
        reembolsavel: false,
        bagagemDespachada: false,
        segmentos: [
          segmento({
            companhia: '2Z',
            origem: 'MIA',
            destino: 'MEX',
            partida: '2026-09-12T10:30',
            duracaoMin: 210,
          }),
        ],
      }),
    ]);

    const analise = analisarSeguranca(it, { nacionalidade: 'BR', precoMedianoBRL: 10000 });
    expect(analise.score).toBeGreaterThanOrEqual(0);
    expect(analise.score).toBeLessThanOrEqual(100);
    expect(analise.faixa).toBe('evitar');
  });

  it('mantém a probabilidade de falha entre 0 e 1', () => {
    const seguro = analisarSeguranca(vooDireto(), BR);
    expect(seguro.probabilidadeFalha).toBeGreaterThan(0);
    expect(seguro.probabilidadeFalha).toBeLessThan(0.1);
  });

  it('atribui mais risco à conexão apertada do que à folgada', () => {
    const apertado = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T11:10', duracaoMin: 160 }),
        ],
      }),
    ]);
    const folgado = itinerario([
      bilhete({
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T13:30', duracaoMin: 160 }),
        ],
      }),
    ]);

    const a = analisarSeguranca(apertado, BR);
    const f = analisarSeguranca(folgado, BR);
    expect(a.probabilidadeFalha).toBeGreaterThan(f.probabilidadeFalha);
    expect(a.score).toBeLessThan(f.score);
  });
});

describe('estimarCusto', () => {
  it('não cobra extras de um voo direto com bagagem inclusa', () => {
    const it = vooDireto(1000);
    const custo = estimarCusto(it, analisarSeguranca(it, BR));

    expect(custo.bagagemBRL).toBe(0);
    expect(custo.trasladoBRL).toBe(0);
    expect(custo.pernoiteBRL).toBe(0);
    expect(custo.totalBRL).toBe(1000 + custo.riscoBRL);
  });

  it('soma bagagem por bilhete quando a tarifa não inclui despacho', () => {
    const it = itinerario([
      bilhete({
        precoBRL: 400,
        bagagemDespachada: false,
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T08:00', duracaoMin: 105 }),
        ],
      }),
      bilhete({
        precoBRL: 400,
        bagagemDespachada: false,
        segmentos: [
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T14:00', duracaoMin: 160 }),
        ],
      }),
    ]);

    const custo = estimarCusto(it, analisarSeguranca(it, BR));
    // Dois bilhetes sem bagagem: duas cobranças, porque são contratos distintos.
    expect(custo.bagagemBRL).toBe(360);
  });

  it('cobra traslado quando a conexão troca de aeroporto', () => {
    const it = itinerario([
      bilhete({
        precoBRL: 300,
        segmentos: [
          segmento({ origem: 'BSB', destino: 'GRU', partida: '2026-09-12T08:00', duracaoMin: 105 }),
        ],
      }),
      bilhete({
        precoBRL: 300,
        segmentos: [
          segmento({ origem: 'CGH', destino: 'POA', partida: '2026-09-12T16:00', duracaoMin: 100 }),
        ],
      }),
    ]);

    expect(estimarCusto(it, analisarSeguranca(it, BR)).trasladoBRL).toBe(160);
  });

  it('cobra prejuízo maior quando não há proteção entre bilhetes', () => {
    const protegido = itinerario([
      bilhete({
        precoBRL: 1000,
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T12:00', duracaoMin: 160 }),
        ],
      }),
    ]);
    const desprotegido = itinerario([
      bilhete({
        precoBRL: 500,
        segmentos: [
          segmento({ origem: 'GRU', destino: 'BSB', partida: '2026-09-12T09:00', duracaoMin: 105 }),
        ],
      }),
      bilhete({
        precoBRL: 500,
        segmentos: [
          segmento({ origem: 'BSB', destino: 'FOR', partida: '2026-09-12T12:00', duracaoMin: 160 }),
        ],
      }),
    ]);

    const a = estimarCusto(protegido, analisarSeguranca(protegido, BR));
    const b = estimarCusto(desprotegido, analisarSeguranca(desprotegido, BR));
    expect(b.riscoBRL).toBeGreaterThan(a.riscoBRL);
  });
});
