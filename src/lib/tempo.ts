/**
 * Utilidades de tempo.
 *
 * Horários de voo são tratados como "hora de parede" do aeroporto: `2026-09-12T08:30`
 * significa 08:30 no relógio daquele aeroporto, sem fuso embutido. Por isso os
 * cálculos aqui não usam `new Date(...)` diretamente — o resultado mudaria com o
 * fuso do servidor. As diferenças que importam (tempo de conexão) são sempre
 * entre dois instantes do mesmo aeroporto, então a comparação é válida.
 */

const PADRAO_ISO_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/;

/** Converte um horário local ISO em minutos absolutos, ignorando fuso. */
export function paraMinutos(isoLocal: string): number {
  const m = PADRAO_ISO_LOCAL.exec(isoLocal);
  if (!m) throw new Error(`Horário inválido: ${isoLocal}`);
  const [, ano, mes, dia, hora, minuto] = m;
  return (
    Date.UTC(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto)) / 60000
  );
}

/** Minutos de `inicio` até `fim` (negativo se `fim` vier antes). */
export function diferencaMin(inicio: string, fim: string): number {
  return paraMinutos(fim) - paraMinutos(inicio);
}

/** Hora local no formato 24h, ex.: "08:30". */
export function horaLocal(isoLocal: string): string {
  const m = PADRAO_ISO_LOCAL.exec(isoLocal);
  if (!m) throw new Error(`Horário inválido: ${isoLocal}`);
  return `${m[4]}:${m[5]}`;
}

/** Hora do dia (0..23) de um horário local. */
export function horaDoDia(isoLocal: string): number {
  const m = PADRAO_ISO_LOCAL.exec(isoLocal);
  if (!m) throw new Error(`Horário inválido: ${isoLocal}`);
  return Number(m[4]);
}

/** Data no formato AAAA-MM-DD. */
export function dataLocal(isoLocal: string): string {
  const m = PADRAO_ISO_LOCAL.exec(isoLocal);
  if (!m) throw new Error(`Horário inválido: ${isoLocal}`);
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Quantos dias o horário `fim` cai depois do dia de `inicio`. */
export function diasDeDiferenca(inicio: string, fim: string): number {
  const a = Date.parse(`${dataLocal(inicio)}T00:00:00Z`);
  const b = Date.parse(`${dataLocal(fim)}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

/** Minutos decorridos desde a meia-noite local. */
export function minutosDoDia(isoLocal: string): number {
  const m = PADRAO_ISO_LOCAL.exec(isoLocal);
  if (!m) throw new Error(`Horário inválido: ${isoLocal}`);
  return Number(m[4]) * 60 + Number(m[5]);
}

/** Duração legível: 95 -> "1h35", 40 -> "40min". */
export function formatarDuracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const h = Math.floor(total / 60);
  const min = total % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, '0')}`;
}

/** Soma dias a uma data AAAA-MM-DD, devolvendo o mesmo formato. */
export function somarDias(data: string, dias: number): string {
  const base = Date.parse(`${data}T00:00:00Z`);
  return new Date(base + dias * 86400000).toISOString().slice(0, 10);
}

/** Monta um horário local ISO a partir da data e de minutos desde a meia-noite. */
export function montarHorario(data: string, minutos: number): string {
  const diasExtras = Math.floor(minutos / 1440);
  const restante = ((minutos % 1440) + 1440) % 1440;
  const dataFinal = somarDias(data, diasExtras);
  const hh = String(Math.floor(restante / 60)).padStart(2, '0');
  const mm = String(restante % 60).padStart(2, '0');
  return `${dataFinal}T${hh}:${mm}`;
}

/** Avança (ou recua) um horário local em minutos, virando o dia se preciso. */
export function somarMinutos(isoLocal: string, minutos: number): string {
  return montarHorario(dataLocal(isoLocal), minutosDoDia(isoLocal) + minutos);
}
