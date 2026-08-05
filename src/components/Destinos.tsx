'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DESTAQUES,
  REGIOES,
  buscaCivitatis,
  buscaGetYourGuide,
  buscaViator,
  type Lugar,
} from '@/lib/dados/destinos';

const TROCA_MS = 6000;

/**
 * Vitrine de lugares e o catálogo por região.
 *
 * O carrossel mostra nome de lugar, não oferta. Não há preço, contagem
 * regressiva nem "restam 2 lugares" — esse é justamente o repertório que a
 * seção "Como reconhecer cilada" ensina a desconfiar, e um site não pode
 * alertar contra a pressa numa tela e fabricá-la na outra. O lugar da urgência
 * aqui é onde ela é verdade: maré, temporada e ingresso que realmente esgota.
 */
export default function Destinos() {
  return (
    <section aria-labelledby="destinos" className="mt-16">
      <h2 id="destinos" className="text-2xl font-extrabold text-texto">
        Para onde ir e o que fazer lá
      </h2>
      <p className="mt-1.5 max-w-3xl text-suave">
        Passeio, ingresso e parque, com a busca já preenchida nas plataformas que vendem. Os
        avisos são os que mudam a viagem: o que depende de maré, o que só existe em certa época e
        o que esgota se você deixar para depois.
      </p>

      <Vitrine />

      <div className="mt-4 space-y-3">
        {REGIOES.map((regiao) => (
          <Regiao key={regiao.id} regiao={regiao} />
        ))}
      </div>
    </section>
  );
}

function Vitrine() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const avancar = useCallback(() => {
    setIndice((i) => (i + 1) % DESTAQUES.length);
  }, []);

  useEffect(() => {
    // Quem pediu menos movimento no sistema não deve receber carrossel girando.
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semMovimento || pausado) return;

    const relogio = setInterval(avancar, TROCA_MS);
    return () => clearInterval(relogio);
  }, [avancar, pausado]);

  const atual = DESTAQUES[indice];

  return (
    <div
      ref={caixa}
      className="mt-5 overflow-hidden rounded-2xl border border-borda bg-superficie"
      // Parar enquanto a pessoa lê ou navega pelo teclado é o mínimo: texto
      // que troca sozinho no meio da leitura é hostil.
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-borda px-4 py-2 sm:px-5">
        <p className="etiqueta text-marca">Vale a pena conhecer</p>
        <p className="dado text-xs text-tenue">
          {indice + 1}/{DESTAQUES.length}
        </p>
      </div>

      <div className="px-4 py-5 sm:px-5" aria-live="polite" aria-atomic="true">
        <p className="text-xs font-bold uppercase tracking-wide text-tenue">{atual.onde}</p>
        <p className="mt-1 text-2xl font-extrabold leading-tight text-texto">{atual.lugar}</p>
        <p className="mt-1.5 text-suave">{atual.chamada}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={buscaGetYourGuide(atual.busca)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-marca px-4 py-2 text-sm font-bold text-marca-contraste transition-colors hover:bg-marca-forte"
          >
            Ver passeios e preços ↗
          </a>
          <a
            href={buscaCivitatis(atual.busca)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-borda-forte px-4 py-2 text-sm font-bold text-texto transition-colors hover:border-marca hover:text-marca"
          >
            Comparar na Civitatis ↗
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-borda px-4 py-2.5 sm:px-5">
        {DESTAQUES.map((destaque, i) => (
          <button
            key={destaque.lugar}
            type="button"
            onClick={() => setIndice(i)}
            aria-label={`Mostrar ${destaque.lugar}`}
            aria-current={i === indice}
            className={`h-2.5 rounded-full transition-all ${
              i === indice ? 'w-7 bg-marca' : 'w-2.5 bg-borda-forte'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Regiao({ regiao }: { regiao: (typeof REGIOES)[number] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-borda bg-superficie">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="text-2xl" aria-hidden="true">
          {regiao.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-texto">{regiao.titulo}</span>
          <span className="block text-sm text-tenue">{regiao.lugares.length} lugares</span>
        </span>
        <span className="shrink-0 text-lg font-bold text-marca" aria-hidden="true">
          {aberto ? '−' : '+'}
        </span>
      </button>

      {aberto && (
        <div className="border-t border-borda bg-superficie-2/50 px-4 py-4 sm:px-5">
          <p className="mb-4 text-sm leading-relaxed text-suave">{regiao.descricao}</p>
          <ul className="space-y-3">
            {regiao.lugares.map((lugar) => (
              <CartaoLugar key={lugar.nome} lugar={lugar} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CartaoLugar({ lugar }: { lugar: Lugar }) {
  return (
    <li className="rounded-xl border border-borda bg-superficie p-3.5">
      <p className="font-bold text-texto">{lugar.nome}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-tenue">{lugar.onde}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-suave">{lugar.sobre}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {lugar.oficial && (
          <Atalho url={lugar.oficial} rotulo="Site oficial" destaque />
        )}
        <Atalho url={buscaGetYourGuide(lugar.busca)} rotulo="GetYourGuide" />
        <Atalho url={buscaCivitatis(lugar.busca)} rotulo="Civitatis" />
        <Atalho url={buscaViator(lugar.busca)} rotulo="Viator" />
      </div>
    </li>
  );
}

function Atalho({ url, rotulo, destaque = false }: { url: string; rotulo: string; destaque?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
        destaque
          ? 'bg-marca text-marca-contraste hover:bg-marca-forte'
          : 'border border-borda text-suave hover:border-marca hover:text-marca'
      }`}
    >
      {rotulo} ↗
    </a>
  );
}
