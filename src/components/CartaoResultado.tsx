'use client';

import { useState } from 'react';
import DetalheItinerario from '@/components/DetalheItinerario';
import MedidorSeguranca from '@/components/MedidorSeguranca';
import { buscarCompanhia } from '@/lib/dados/companhias';
import {
  CLASSES_NIVEL,
  DESCRICAO_FAIXA,
  PESO_NIVEL,
  ROTULO_NIVEL,
  moeda,
  percentual,
} from '@/lib/formato';
import { ROTULOS_SELO } from '@/lib/ranking';
import { diasDeDiferenca, formatarDuracao, horaLocal } from '@/lib/tempo';
import type { Resultado } from '@/lib/tipos';

const CLASSES_SELO: Record<string, string> = {
  'melhor-escolha': 'bg-marca text-white',
  'mais-barato': 'bg-superficie-2 text-texto border border-borda',
  'mais-seguro': 'bg-seguro-suave text-seguro border border-seguro/30',
  'mais-rapido': 'bg-superficie-2 text-texto border border-borda',
};

export default function CartaoResultado({ resultado }: { resultado: Resultado }) {
  const [aberto, setAberto] = useState(false);
  const { itinerario, seguranca, custo } = resultado;

  const companhias = [
    ...new Set(itinerario.bilhetes.flatMap((b) => b.segmentos.map((s) => s.companhia))),
  ].map((iata) => buscarCompanhia(iata).nome);

  const diasExtras = diasDeDiferenca(itinerario.partida, itinerario.chegada);
  const alertasOrdenados = [...seguranca.alertas].sort(
    (a, b) => PESO_NIVEL[a.nivel] - PESO_NIVEL[b.nivel] || b.pontos - a.pontos,
  );
  // Mostra o que há de mais grave; sem nada grave, os avisos leves ainda
  // informam mais do que um espaço vazio ao lado do medidor.
  const resumoAlertas = alertasOrdenados.slice(0, 3);

  return (
    <article className="overflow-hidden rounded-2xl border border-borda bg-superficie shadow-sm">
      {resultado.selos.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-borda bg-superficie-2/60 px-4 py-2">
          {resultado.selos.map((selo) => (
            <span
              key={selo}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASSES_SELO[selo]}`}
            >
              {ROTULOS_SELO[selo]}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
        {/* ---- Itinerário resumido ---- */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-2xl font-bold text-texto">
              {horaLocal(itinerario.partida)}
            </span>
            <span className="text-suave" aria-hidden="true">
              →
            </span>
            <span className="font-mono text-2xl font-bold text-texto">
              {horaLocal(itinerario.chegada)}
              {diasExtras > 0 && (
                <sup className="ml-0.5 text-xs font-semibold text-risco">+{diasExtras}</sup>
              )}
            </span>
            <span className="text-sm text-suave">
              {itinerario.origem} → {itinerario.destino}
            </span>
          </div>

          <p className="mt-1 text-sm text-suave">
            {formatarDuracao(itinerario.duracaoTotalMin)} ·{' '}
            {itinerario.paradas === 0
              ? 'voo direto'
              : `${itinerario.paradas} ${itinerario.paradas === 1 ? 'parada' : 'paradas'}`}{' '}
            · {companhias.join(', ')}
          </p>

          {itinerario.bilhetes.length > 1 && (
            <p className="mt-2 inline-block rounded-md bg-perigo-suave px-2 py-1 text-xs font-semibold text-perigo">
              Atenção: {itinerario.bilhetes.length} bilhetes separados, sem proteção entre eles
            </p>
          )}

          {resumoAlertas.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {resumoAlertas.map((alerta) => (
                <li key={alerta.codigo} className="flex items-start gap-2 text-sm">
                  <span
                    className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${CLASSES_NIVEL[alerta.nivel]}`}
                  >
                    {ROTULO_NIVEL[alerta.nivel]}
                  </span>
                  <span className="text-texto">{alerta.titulo}</span>
                </li>
              ))}
              {alertasOrdenados.length > resumoAlertas.length && (
                <li className="text-sm text-suave">
                  + {alertasOrdenados.length - resumoAlertas.length} outro
                  {alertasOrdenados.length - resumoAlertas.length > 1 ? 's' : ''} ponto
                  {alertasOrdenados.length - resumoAlertas.length > 1 ? 's' : ''} de atenção
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-seguro">
              Sem pontos de atenção: bilhete único, conexões folgadas e tarifa flexível.
            </p>
          )}
        </div>

        {/* ---- Preço e segurança ---- */}
        <div className="flex items-center justify-between gap-5 border-t border-borda pt-4 sm:min-w-[230px] sm:flex-col sm:items-end sm:justify-start sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-texto">{moeda(itinerario.precoBRL)}</p>
            {resultado.economiaPercent > 0 && (
              <p className="text-xs font-medium text-seguro">
                {resultado.economiaPercent}% abaixo da mediana
              </p>
            )}
            <p className="mt-1 text-xs text-suave">
              Custo real estimado <strong className="text-texto">{moeda(custo.totalBRL)}</strong>
            </p>
          </div>

          <MedidorSeguranca score={seguranca.score} faixa={seguranca.faixa} />
        </div>
      </div>

      {/* ---- Detalhamento ---- */}
      <div className="border-t border-borda px-4 py-2 sm:px-5">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="text-sm font-medium text-marca"
        >
          {aberto ? 'Ocultar detalhes' : 'Ver voos, riscos e custo real'}
        </button>
      </div>

      {aberto && (
        <div className="space-y-6 border-t border-borda bg-superficie-2/40 p-4 sm:p-5">
          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-suave">
              Trajeto
            </h4>
            <DetalheItinerario itinerario={itinerario} />
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-suave">
              Análise de risco
            </h4>
            <p className="mb-3 text-sm text-texto">
              {DESCRICAO_FAIXA[seguranca.faixa]} Chance estimada de algo dar errado no caminho:{' '}
              <strong>{percentual(seguranca.probabilidadeFalha)}</strong>.
            </p>

            <ul className="space-y-2">
              {alertasOrdenados.map((alerta) => (
                <li
                  key={alerta.codigo}
                  className={`rounded-lg border p-3 ${CLASSES_NIVEL[alerta.nivel]}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{alerta.titulo}</span>
                    <span className="text-[11px] font-bold uppercase">
                      {ROTULO_NIVEL[alerta.nivel]}
                      {alerta.pontos > 0 && ` · −${alerta.pontos} pts`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm opacity-90">{alerta.detalhe}</p>
                </li>
              ))}
              {alertasOrdenados.length === 0 && (
                <li className="rounded-lg border border-seguro/30 bg-seguro-suave p-3 text-sm text-seguro">
                  Nenhum ponto de atenção encontrado neste itinerário.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-suave">
              Quanto essa passagem custa de verdade
            </h4>
            <table className="w-full text-sm">
              <tbody>
                <LinhaCusto rotulo="Passagem anunciada" valor={custo.passagemBRL} />
                {custo.bagagemBRL > 0 && (
                  <LinhaCusto rotulo="Bagagem despachada (estimativa)" valor={custo.bagagemBRL} />
                )}
                {custo.trasladoBRL > 0 && (
                  <LinhaCusto rotulo="Traslado entre aeroportos" valor={custo.trasladoBRL} />
                )}
                {custo.pernoiteBRL > 0 && (
                  <LinhaCusto rotulo="Pernoite na conexão" valor={custo.pernoiteBRL} />
                )}
                <LinhaCusto
                  rotulo={`Risco esperado (${percentual(seguranca.probabilidadeFalha)} de chance de prejuízo)`}
                  valor={custo.riscoBRL}
                />
                <tr className="border-t border-borda font-semibold text-texto">
                  <td className="py-2">Total estimado</td>
                  <td className="py-2 text-right">{moeda(custo.totalBRL)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-suave">
              O risco esperado é a média do prejuízo quando a viagem falha, ponderada pela chance de
              falhar. Não é uma taxa que você paga — é o que a opção barata custa, em média, quando
              dá errado.
            </p>
          </section>
        </div>
      )}
    </article>
  );
}

function LinhaCusto({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <tr className="text-suave">
      <td className="py-1">{rotulo}</td>
      <td className="py-1 text-right tabular-nums">{moeda(valor)}</td>
    </tr>
  );
}
