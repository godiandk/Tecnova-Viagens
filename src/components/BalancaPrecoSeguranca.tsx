'use client';

import { useId } from 'react';

const MARCOS = [
  { valor: 0, rotulo: 'O mais barato possível' },
  { valor: 0.25, rotulo: 'Barato, com bom senso' },
  { valor: 0.45, rotulo: 'Equilibrado' },
  { valor: 0.7, rotulo: 'Segurança em primeiro' },
  { valor: 1, rotulo: 'Sem correr risco' },
];

function rotuloDoPeso(peso: number): string {
  return MARCOS.reduce((maisProximo, marco) =>
    Math.abs(marco.valor - peso) < Math.abs(maisProximo.valor - peso) ? marco : maisProximo,
  ).rotulo;
}

/**
 * Controle central do site: define para que lado a lista pende.
 *
 * Reordenar acontece no navegador, sobre os itinerários já carregados — mexer
 * aqui é instantâneo e não gasta consulta ao provedor.
 */
export default function BalancaPrecoSeguranca({
  peso,
  aoMudar,
}: {
  peso: number;
  aoMudar: (peso: number) => void;
}) {
  const id = useId();

  return (
    <div className="rounded-xl border border-borda bg-superficie p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-texto">
          O que pesa mais na sua escolha?
        </label>
        <span className="text-sm font-medium text-marca">{rotuloDoPeso(peso)}</span>
      </div>

      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={peso}
        onChange={(e) => aoMudar(Number(e.target.value))}
        aria-valuetext={rotuloDoPeso(peso)}
      />

      <div className="mt-1.5 flex justify-between text-xs text-suave">
        <span>Preço</span>
        <span>Segurança</span>
      </div>
    </div>
  );
}
