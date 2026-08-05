'use client';

import { useState } from 'react';
import { SINAIS_DE_ALERTA, TOPICOS, buscadoresDeVoo, type Fonte } from '@/lib/dados/turismo';

/**
 * Onde procurar cada tipo de viagem.
 *
 * Um botão não consegue consultar todos os sites de uma vez: cada um exige
 * contrato e API próprios, e nem os grandes buscadores fazem isso. O que dá
 * para fazer — e resolve o mesmo problema — é abrir vários de uma vez com a
 * viagem já preenchida, para comparar em abas lado a lado em vez de digitar
 * a mesma coisa quatro vezes.
 */
export default function CentralDeBuscas({
  origem,
  destino,
  ida,
  volta,
}: {
  origem: string;
  destino: string;
  ida: string;
  volta?: string;
}) {
  const [abertos, setAbertos] = useState<string[]>([]);
  const [bloqueado, setBloqueado] = useState(false);

  const buscadores = buscadoresDeVoo(origem, destino, ida, volta);
  const principais = buscadores.filter((f) => f.destaque);

  function abrirTodos() {
    setBloqueado(false);
    // O navegador libera o primeiro pop-up e costuma barrar os seguintes; se
    // isso acontecer, é melhor dizer do que deixar o usuário achando que
    // apenas um site existe.
    for (const fonte of principais) {
      const janela = window.open(fonte.url, '_blank', 'noopener,noreferrer');
      if (!janela) setBloqueado(true);
    }
  }

  function alternar(id: string) {
    setAbertos((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  return (
    <section aria-labelledby="central" className="mt-16">
      <h2 id="central" className="text-2xl font-extrabold text-texto">
        Buscar em todo lugar
      </h2>
      <p className="mt-1.5 max-w-3xl text-suave">
        Nenhum site tem tudo, e nenhum é neutro: cada um mostra primeiro quem paga para aparecer.
        Por isso o jeito de achar o preço bom é abrir uns três e comparar. Aqui estão os endereços
        que valem a pena, por assunto.
      </p>

      {/* ---- Abrir vários de uma vez ---- */}
      <div className="mt-5 rounded-2xl border border-marca/30 bg-marca-suave p-4 sm:p-5">
        <h3 className="font-bold text-texto">
          Comparar {origem} → {destino} em vários sites
        </h3>
        <p className="mt-1 text-sm text-suave">
          Abre {principais.length} buscadores ao mesmo tempo, cada um em uma aba, já com a sua rota
          e as suas datas preenchidas.
        </p>

        <button
          type="button"
          onClick={abrirTodos}
          className="mt-3 rounded-lg bg-marca px-5 py-2.5 font-bold text-marca-contraste transition-colors hover:bg-marca-forte"
        >
          Abrir os {principais.length} principais ↗
        </button>

        {bloqueado && (
          <p role="alert" className="mt-2.5 text-sm font-semibold text-atencao">
            Seu navegador bloqueou algumas abas. Libere os pop-ups deste site, ou abra um por um na
            lista abaixo.
          </p>
        )}

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {buscadores.map((fonte) => (
            <li key={fonte.nome}>
              <LinkFonte fonte={fonte} />
            </li>
          ))}
        </ul>
      </div>

      {/* ---- Tópicos ---- */}
      <div className="mt-4 space-y-3">
        {TOPICOS.map((topico) => {
          const aberto = abertos.includes(topico.id);
          return (
            <div
              key={topico.id}
              className="overflow-hidden rounded-2xl border border-borda bg-superficie"
            >
              <button
                type="button"
                onClick={() => alternar(topico.id)}
                aria-expanded={aberto}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
              >
                <span className="text-2xl" aria-hidden="true">
                  {topico.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-texto">{topico.titulo}</span>
                  <span className="block text-sm text-tenue">
                    {topico.fontes.length} {topico.fontes.length === 1 ? 'site' : 'sites'}
                  </span>
                </span>
                <span className="shrink-0 text-lg font-bold text-marca" aria-hidden="true">
                  {aberto ? '−' : '+'}
                </span>
              </button>

              {aberto && (
                <div className="border-t border-borda bg-superficie-2/50 px-4 py-4 sm:px-5">
                  <p className="mb-4 text-sm leading-relaxed text-suave">{topico.descricao}</p>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {topico.fontes.map((fonte) => (
                      <li key={fonte.nome}>
                        <LinkFonte fonte={fonte} />
                        <p className="mt-1 text-xs leading-relaxed text-suave">{fonte.nota}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Golpes ---- */}
      <div className="mt-6 rounded-2xl border-2 border-perigo/40 bg-perigo-suave p-4 sm:p-5">
        <h3 className="flex items-center gap-2 text-lg font-extrabold text-perigo">
          <span aria-hidden="true">🚨</span>
          Como reconhecer cilada
        </h3>
        <p className="mt-1 text-sm text-texto">
          O mercado de viagem no Brasil já teve empresa grande vendendo passagem que nunca foi
          emitida. Se bater qualquer um destes sinais, pare e confira.
        </p>

        <ul className="mt-4 space-y-3">
          {SINAIS_DE_ALERTA.map((sinal) => (
            <li key={sinal.titulo} className="rounded-xl bg-superficie p-3.5">
              <p className="font-bold text-texto">{sinal.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-suave">{sinal.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LinkFonte({ fonte }: { fonte: Fonte }) {
  return (
    <a
      href={fonte.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
        fonte.destaque
          ? 'border border-marca/40 bg-superficie text-marca hover:bg-marca-suave'
          : 'border border-borda bg-superficie text-texto hover:border-marca hover:text-marca'
      }`}
    >
      <span className="min-w-0 truncate">{fonte.nome}</span>
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
