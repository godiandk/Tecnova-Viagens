import { buscarAeroporto } from '@/lib/dados/aeroportos';
import { PESO_SEGURANCA_PADRAO } from '@/lib/config';
import type { ParametrosBusca } from '@/lib/tipos';

export type Validacao<T> = { ok: true; valor: T } | { ok: false; erros: string[] };

const PADRAO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const PADRAO_IATA = /^[A-Za-z]{3}$/;
const MAX_PASSAGEIROS = 9;
/** Companhias não vendem com muita antecedência; além disso é ruído. */
const MAX_DIAS_FUTURO = 361;

function ehDataValida(texto: string): boolean {
  if (!PADRAO_DATA.test(texto)) return false;
  const data = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === texto;
}

function hojeIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function diasEntre(inicio: string, fim: string): number {
  return Math.round(
    (Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86400000,
  );
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

function inteiro(valor: unknown, padrao: number): number {
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) ? Math.round(n) : padrao;
}

function booleano(valor: unknown, padrao: boolean): boolean {
  if (typeof valor === 'boolean') return valor;
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  return padrao;
}

/**
 * Valida e normaliza a entrada da busca.
 *
 * Campos opcionais recebem padrões sensatos em vez de rejeitar a requisição;
 * só vira erro o que não dá para adivinhar (rota e data) ou o que estaria
 * errado de qualquer forma (volta antes da ida).
 */
export function validarParametrosBusca(entrada: unknown): Validacao<ParametrosBusca> {
  const erros: string[] = [];
  const corpo = (entrada ?? {}) as Record<string, unknown>;

  const origem = texto(corpo.origem).toUpperCase();
  const destino = texto(corpo.destino).toUpperCase();

  if (!PADRAO_IATA.test(origem)) {
    erros.push('Informe a origem com o código IATA de 3 letras (ex.: GRU).');
  } else if (!buscarAeroporto(origem)) {
    erros.push(`Aeroporto de origem "${origem}" não está no catálogo.`);
  }

  if (!PADRAO_IATA.test(destino)) {
    erros.push('Informe o destino com o código IATA de 3 letras (ex.: LIS).');
  } else if (!buscarAeroporto(destino)) {
    erros.push(`Aeroporto de destino "${destino}" não está no catálogo.`);
  }

  if (origem && destino && origem === destino) {
    erros.push('Origem e destino precisam ser diferentes.');
  }

  const ida = texto(corpo.ida);
  const hoje = hojeIso();
  if (!ehDataValida(ida)) {
    erros.push('Data de ida inválida. Use o formato AAAA-MM-DD.');
  } else if (diasEntre(hoje, ida) < 0) {
    erros.push('A data de ida não pode estar no passado.');
  } else if (diasEntre(hoje, ida) > MAX_DIAS_FUTURO) {
    erros.push('A data de ida está distante demais — busque no máximo com um ano de antecedência.');
  }

  const voltaBruta = texto(corpo.volta);
  let volta: string | undefined;
  if (voltaBruta) {
    if (!ehDataValida(voltaBruta)) {
      erros.push('Data de volta inválida. Use o formato AAAA-MM-DD.');
    } else if (ehDataValida(ida) && diasEntre(ida, voltaBruta) < 0) {
      erros.push('A volta não pode ser antes da ida.');
    } else {
      volta = voltaBruta;
    }
  }

  const passageirosBrutos = (corpo.passageiros ?? {}) as Record<string, unknown>;
  const adultos = Math.min(MAX_PASSAGEIROS, Math.max(1, inteiro(passageirosBrutos.adultos, 1)));
  const criancas = Math.min(MAX_PASSAGEIROS - 1, Math.max(0, inteiro(passageirosBrutos.criancas, 0)));
  const bebes = Math.max(0, inteiro(passageirosBrutos.bebes, 0));

  if (adultos + criancas > MAX_PASSAGEIROS) {
    erros.push(`No máximo ${MAX_PASSAGEIROS} passageiros por busca.`);
  }
  if (bebes > adultos) {
    erros.push('Cada bebê de colo precisa de um adulto acompanhante.');
  }

  const pesoBruto = Number(corpo.pesoSeguranca);
  const pesoSeguranca = Number.isFinite(pesoBruto)
    ? Math.min(1, Math.max(0, pesoBruto))
    : PESO_SEGURANCA_PADRAO;

  const maxParadas = Math.min(3, Math.max(0, inteiro(corpo.maxParadas, 2)));

  const nacionalidadeBruta = texto(corpo.nacionalidade).toUpperCase();
  const nacionalidade = /^[A-Z]{2}$/.test(nacionalidadeBruta) ? nacionalidadeBruta : 'BR';

  if (erros.length > 0) return { ok: false, erros };

  return {
    ok: true,
    valor: {
      origem,
      destino,
      ida,
      volta,
      passageiros: { adultos, criancas, bebes },
      pesoSeguranca,
      exigirBagagemDespachada: booleano(corpo.exigirBagagemDespachada, false),
      permitirBilhetesSeparados: booleano(corpo.permitirBilhetesSeparados, true),
      maxParadas,
      nacionalidade,
    },
  };
}
