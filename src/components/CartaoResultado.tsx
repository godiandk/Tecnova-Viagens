'use client';

import { useState } from 'react';
import { textoDoAlerta } from '@/lib/i18n/alerta';
import { useT, type Traduzir } from '@/lib/i18n/contexto';
import BagagemDetalhe from '@/components/BagagemDetalhe';
import DetalheItinerario from '@/components/DetalheItinerario';
import MedidorSeguranca from '@/components/MedidorSeguranca';
import { buscarCompanhia } from '@/lib/dados/companhias';
import {
  CLASSES_NIVEL,
  PESO_NIVEL,
  ROTULO_NIVEL,
  SIMBOLO_NIVEL,
  moeda,
  percentual,
} from '@/lib/formato';
import { ROTULOS_SELO } from '@/lib/ranking';
import { diasDeDiferenca, formatarDuracao, horaLocal } from '@/lib/tempo';
import { CLASSES_SINAL, darVeredito } from '@/lib/veredito';
import type { Alerta, Resultado } from '@/lib/tipos';

const CLASSES_SELO: Record<string, string> = {
  'melhor-escolha': 'bg-marca text-marca-contraste',
  'mais-barato': 'border border-borda-forte text-texto',
  'mais-seguro': 'border border-ok/40 bg-ok-suave text-ok',
  'mais-rapido': 'border border-borda-forte text-texto',
};

export default function CartaoResultado({
  resultado,
  aoSalvarCotacao,
}: {
  resultado: Resultado;
  /** Presente só na área do operador: guarda o custo real para precificar. */
  aoSalvarCotacao?: (resultado: Resultado) => void;
}) {
  const t = useT();
  const [aberto, setAberto] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const { itinerario, seguranca, custo } = resultado;

  const veredito = darVeredito(resultado, t);
  const companhias = [
    ...new Set(itinerario.bilhetes.flatMap((b) => b.segmentos.map((s) => s.companhia))),
  ].map((iata) => buscarCompanhia(iata).nome);

  const diasExtras = diasDeDiferenca(itinerario.partida, itinerario.chegada);
  const alertas = [...seguranca.alertas].sort(
    (a, b) => PESO_NIVEL[a.nivel] - PESO_NIVEL[b.nivel] || b.pontos - a.pontos,
  );
  const resumo = alertas.slice(0, 3);

  return (
    <article className="overflow-hidden rounded-2xl border border-borda bg-superficie shadow-[var(--sombra)]">
      {resultado.selos.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-borda px-4 py-2 sm:px-5">
          {resultado.selos.map((selo) => (
            <span
              key={selo}
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CLASSES_SELO[selo]}`}
            >
              {ROTULOS_SELO[selo]}
            </span>
          ))}
        </div>
      )}

      {/* ---- A resposta, antes de qualquer número ---- */}
      <div className={`border-b px-4 py-3 sm:px-5 ${CLASSES_SINAL[veredito.sinal]}`}>
        <p className="text-lg font-bold leading-tight">{veredito.frase}</p>
        <p className="mt-0.5 text-sm opacity-90">{veredito.porque}</p>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto]">
        {/* ---- Corpo do bilhete ---- */}
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="dado text-3xl font-bold leading-none text-texto">
              {horaLocal(itinerario.partida)}
            </span>
            <span className="text-tenue" aria-hidden="true">
              ✈
            </span>
            <span className="dado text-3xl font-bold leading-none text-texto">
              {horaLocal(itinerario.chegada)}
              {diasExtras > 0 && (
                <sup className="ml-0.5 align-super text-xs font-bold text-risco">+{diasExtras}</sup>
              )}
            </span>
            <span className="dado text-sm text-suave">
              {itinerario.origem} → {itinerario.destino}
            </span>
          </div>

          {diasExtras > 0 && (
            <p className="mt-1 text-xs text-risco">
              Chega {diasExtras === 1 ? 'no dia seguinte' : `${diasExtras} dias depois`}.
            </p>
          )}

          <p className="mt-2 text-sm text-suave">
            Passa <strong className="text-texto">{formatarDuracao(itinerario.duracaoTotalMin)}</strong>{' '}
            viajando ·{' '}
            {itinerario.paradas === 0 ? (
              <strong className="text-ok">sem troca de avião</strong>
            ) : (
              <>
                troca de avião{' '}
                <strong className="text-texto">
                  {itinerario.paradas} {itinerario.paradas === 1 ? 'vez' : 'vezes'}
                </strong>
              </>
            )}{' '}
            · {companhias.join(', ')}
          </p>

          {itinerario.bilhetes.length > 1 && (
            <p className="mt-3 rounded-lg border border-perigo/30 bg-perigo-suave px-3 py-2 text-sm font-semibold text-perigo">
              São {itinerario.bilhetes.length} passagens separadas, não uma só. Se perder um voo,
              ninguém é obrigado a te colocar em outro.
            </p>
          )}

          {resumo.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {resumo.map((alerta) => (
                <li key={alerta.chave} className="flex items-start gap-2 text-sm">
                  <SeloNivel alerta={alerta} />
                  <span className="text-texto">{textoDoAlerta(alerta, t).titulo}</span>
                </li>
              ))}
              {alertas.length > resumo.length && (
                <li className="pl-8 text-sm text-tenue">
                  e mais {alertas.length - resumo.length}{' '}
                  {alertas.length - resumo.length === 1 ? 'observação' : 'observações'}
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-medium text-ok">
              Nenhum ponto de atenção: passagem única, conexões folgadas e tarifa flexível.
            </p>
          )}
        </div>

        {/* ---- Canhoto ---- */}
        <div className="picote flex items-center justify-between gap-5 p-4 sm:w-[248px] sm:flex-col sm:items-stretch sm:p-5">
          <div className="sm:text-center">
            <p className="etiqueta text-tenue">Preço anunciado</p>
            <p className="dado text-3xl font-bold leading-tight text-texto">
              {moeda(itinerario.precoBRL)}
            </p>
            <p className="mt-2 text-sm text-suave">
              Na prática você gasta
              <br className="hidden sm:block" />{' '}
              <strong className="dado text-texto">{moeda(custo.totalBRL)}</strong>
            </p>
          </div>

          <div className="sm:mt-auto sm:border-t sm:border-borda sm:pt-4">
            <MedidorSeguranca score={seguranca.score} faixa={seguranca.faixa} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borda px-4 py-2.5 sm:px-5">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="text-sm font-semibold text-marca"
        >
          {aberto ? '− Fechar detalhes' : '+ Ver bagagem, voos e explicação completa'}
        </button>

        {aoSalvarCotacao && (
          <button
            type="button"
            onClick={() => {
              aoSalvarCotacao(resultado);
              setSalvo(true);
              setTimeout(() => setSalvo(false), 2000);
            }}
            className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
          >
            {salvo ? 'Salvo ✓' : 'Salvar no painel'}
          </button>
        )}
      </div>

      {aberto && (
        <div className="space-y-6 border-t border-borda bg-superficie-2/50 p-4 sm:p-5">
          {/* O próprio componente já se identifica; um título aqui duplicaria. */}
          <BagagemDetalhe itinerario={itinerario} />

          <section>
            <h4 className="etiqueta mb-3 text-suave">Como é a viagem</h4>
            <DetalheItinerario itinerario={itinerario} />
          </section>

          <section>
            <h4 className="etiqueta mb-2 text-suave">O que pode dar errado</h4>
            <p className="mb-3 text-sm text-suave">
              De cada 100 viagens como esta, cerca de{' '}
              <strong className="text-texto">
                {Math.round(seguranca.probabilidadeFalha * 100)}
              </strong>{' '}
              têm algum problema no caminho.
            </p>

            <ul className="space-y-2">
              {alertas.map((alerta) => (
                <CartaoAlerta key={alerta.chave} alerta={alerta} t={t} />
              ))}
              {alertas.length === 0 && (
                <li className="rounded-lg border border-ok/30 bg-ok-suave p-3 text-sm text-ok">
                  Não encontramos nenhum problema nesta opção.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h4 className="etiqueta mb-2 text-suave">Quanto custa de verdade</h4>
            <div className="overflow-hidden rounded-xl border border-borda bg-superficie">
              <table className="w-full text-sm">
                <tbody>
                  <LinhaCusto rotulo="Preço da passagem" valor={custo.passagemBRL} />
                  {custo.bagagemBRL > 0 && (
                    <LinhaCusto rotulo="Mala para despachar" valor={custo.bagagemBRL} />
                  )}
                  {custo.trasladoBRL > 0 && (
                    <LinhaCusto rotulo="Ir de um aeroporto ao outro" valor={custo.trasladoBRL} />
                  )}
                  {custo.pernoiteBRL > 0 && (
                    <LinhaCusto rotulo="Dormir fora durante a espera" valor={custo.pernoiteBRL} />
                  )}
                  <LinhaCusto
                    rotulo={`Reserva para imprevisto (${percentual(seguranca.probabilidadeFalha)} de chance)`}
                    valor={custo.riscoBRL}
                  />
                  <tr className="border-t border-borda bg-superficie-2 font-bold text-texto">
                    <td className="px-4 py-2.5">Total</td>
                    <td className="dado px-4 py-2.5 text-right">{moeda(custo.totalBRL)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-tenue">
              A última linha não é uma taxa que você paga. É quanto essa opção custa, em média,
              quando dá errado — serve para comparar de forma justa uma passagem arriscada com uma
              tranquila.
            </p>
          </section>
        </div>
      )}
    </article>
  );
}

/** Alerta em linguagem do dia a dia, com o texto técnico guardado atrás de um clique. */
function CartaoAlerta({ alerta, t }: { alerta: Alerta; t: Traduzir }) {
  const [tecnico, setTecnico] = useState(false);
  const texto = textoDoAlerta(alerta, t);

  return (
    <li className={`rounded-lg border p-3 ${CLASSES_NIVEL[alerta.nivel]}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-start gap-2 text-sm font-bold">
          <SeloNivel alerta={alerta} />
          {texto.titulo}
        </span>
        {alerta.pontos > 0 && (
          <span className="dado text-[11px] font-bold">−{alerta.pontos} pontos</span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed opacity-95">{texto.simples}</p>

      <button
        type="button"
        onClick={() => setTecnico((v) => !v)}
        aria-expanded={tecnico}
        className="mt-2 text-xs font-semibold underline underline-offset-2 opacity-80"
      >
        {tecnico ? t('Ocultar explicação técnica') : t('Explicação técnica')}
      </button>

      {tecnico && <p className="mt-1.5 text-xs leading-relaxed opacity-80">{texto.detalhe}</p>}
    </li>
  );
}

function SeloNivel({ alerta }: { alerta: Alerta }) {
  return (
    <span
      title={ROTULO_NIVEL[alerta.nivel]}
      className={`mt-0.5 flex h-5 w-6 shrink-0 items-center justify-center rounded border text-[11px] font-bold ${CLASSES_NIVEL[alerta.nivel]}`}
    >
      <span aria-hidden="true">{SIMBOLO_NIVEL[alerta.nivel]}</span>
      <span className="sr-only">{ROTULO_NIVEL[alerta.nivel]}</span>
    </span>
  );
}

function LinhaCusto({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <tr className="border-t border-borda text-suave first:border-t-0">
      <td className="px-4 py-2">{rotulo}</td>
      <td className="dado px-4 py-2 text-right">{moeda(valor)}</td>
    </tr>
  );
}
