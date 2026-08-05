import { buscarAeroporto } from '@/lib/dados/aeroportos';
import { buscarCompanhia } from '@/lib/dados/companhias';
import { moeda } from '@/lib/formato';
import { extrairConexoes } from '@/lib/seguranca';
import { formatarDuracao, horaLocal } from '@/lib/tempo';
import type { Itinerario, Segmento } from '@/lib/tipos';

function rotuloAeroporto(iata: string): string {
  const a = buscarAeroporto(iata);
  return a ? `${a.cidade} · ${a.nome}` : iata;
}

/**
 * Linha do tempo do itinerário: cada voo e, entre eles, a conexão com o tempo
 * disponível e o mínimo necessário. É onde o usuário vê de onde vem o risco em
 * vez de só ler a nota final.
 */
export default function DetalheItinerario({ itinerario }: { itinerario: Itinerario }) {
  const conexoes = extrairConexoes(itinerario);
  let indiceConexao = 0;

  return (
    <div className="space-y-4">
      {itinerario.bilhetes.map((bilhete, indiceBilhete) => (
        <div key={bilhete.id}>
          {itinerario.bilhetes.length > 1 && (
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-perigo-suave px-2 py-0.5 font-semibold text-perigo">
                Bilhete {indiceBilhete + 1} de {itinerario.bilhetes.length}
              </span>
              <span className="text-suave">
                {bilhete.vendedor} · {moeda(bilhete.precoBRL)}
              </span>
            </div>
          )}

          <ol className="space-y-3">
            {bilhete.segmentos.map((segmento, indiceSegmento) => {
              const conexaoSeguinte =
                indiceSegmento < bilhete.segmentos.length - 1
                  ? conexoes[indiceConexao++]
                  : undefined;

              return (
                <li key={`${segmento.companhia}${segmento.numeroVoo}-${indiceSegmento}`}>
                  <LinhaVoo segmento={segmento} />
                  {conexaoSeguinte && (
                    <LinhaConexao
                      esperaMin={conexaoSeguinte.esperaMin}
                      mctMin={conexaoSeguinte.mctMin}
                      aeroporto={conexaoSeguinte.aeroportoChegada}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Conexão entre este bilhete e o próximo. */}
          {indiceBilhete < itinerario.bilhetes.length - 1 &&
            (() => {
              const entre = conexoes[indiceConexao++];
              return entre ? (
                <LinhaConexao
                  esperaMin={entre.esperaMin}
                  mctMin={entre.mctMin}
                  aeroporto={entre.aeroportoChegada}
                  aeroportoSaida={
                    entre.aeroportoPartida !== entre.aeroportoChegada
                      ? entre.aeroportoPartida
                      : undefined
                  }
                  entreBilhetes
                />
              ) : null;
            })()}
        </div>
      ))}

      {/* A bagagem tem seção própria; aqui ficam só as regras da tarifa. */}
      <div className="border-t border-borda pt-3">
        <p className="etiqueta mb-1.5 text-tenue">Regras desta passagem</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {itinerario.bilhetes.map((bilhete, indice) => (
            <div key={`cond-${bilhete.id}`} className="flex flex-wrap gap-x-4 text-suave">
              {itinerario.bilhetes.length > 1 && (
                <span className="font-semibold text-texto">Passagem {indice + 1}:</span>
              )}
              <span className={bilhete.remarcavel ? 'text-ok' : 'text-atencao'}>
                {bilhete.remarcavel ? '✓ dá para mudar a data' : '✕ não dá para mudar a data'}
              </span>
              <span className={bilhete.reembolsavel ? 'text-ok' : 'text-atencao'}>
                {bilhete.reembolsavel
                  ? '✓ dá para cancelar e receber de volta'
                  : '✕ desistiu, perdeu o dinheiro'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinhaVoo({ segmento }: { segmento: Segmento }) {
  const companhia = buscarCompanhia(segmento.companhia);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-marca" />
        <span className="my-0.5 w-px flex-1 bg-borda" />
        <span className="h-2.5 w-2.5 rounded-full bg-marca" />
      </div>

      <div className="flex-1 pb-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="dado font-semibold text-texto">{horaLocal(segmento.partida)}</span>
          <span className="text-sm text-texto">{rotuloAeroporto(segmento.origem)}</span>
        </div>

        <div className="my-1 flex flex-wrap items-center gap-x-2 pl-1 text-xs text-suave">
          <span>{formatarDuracao(segmento.duracaoMin)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {companhia.nome} {segmento.companhia}
            {segmento.numeroVoo}
          </span>
          {segmento.aeronave && (
            <>
              <span aria-hidden="true">·</span>
              <span>{segmento.aeronave}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="dado font-semibold text-texto">{horaLocal(segmento.chegada)}</span>
          <span className="text-sm text-texto">{rotuloAeroporto(segmento.destino)}</span>
        </div>
      </div>
    </div>
  );
}

function LinhaConexao({
  esperaMin,
  mctMin,
  aeroporto,
  aeroportoSaida,
  entreBilhetes = false,
}: {
  esperaMin: number;
  mctMin: number;
  aeroporto: string;
  aeroportoSaida?: string;
  entreBilhetes?: boolean;
}) {
  const margem = esperaMin - mctMin;
  const critico = margem < 0;
  const justo = !critico && margem < 25;

  const classe = critico
    ? 'border-perigo/40 bg-perigo-suave text-perigo'
    : justo
      ? 'border-risco/40 bg-risco-suave text-risco'
      : 'border-borda bg-superficie-2 text-suave';

  return (
    <div className={`my-2 ml-6 rounded-lg border px-3 py-2 text-xs ${classe}`}>
      <span className="font-bold">
        Espera de {formatarDuracao(esperaMin)} em {aeroporto} para trocar de avião
        {aeroportoSaida && ` — e o próximo voo sai de ${aeroportoSaida}`}
      </span>
      <span className="mt-0.5 block">
        {critico
          ? `Faltam ${formatarDuracao(-margem)}: o recomendado aqui é ${formatarDuracao(mctMin)}.`
          : `Sobra ${formatarDuracao(margem)} além do recomendado (${formatarDuracao(mctMin)}).`}
        {entreBilhetes && ' Como são passagens separadas, você refaz o check-in e despacha a mala de novo.'}
      </span>
    </div>
  );
}
