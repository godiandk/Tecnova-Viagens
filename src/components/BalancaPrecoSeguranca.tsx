'use client';

import { useId } from 'react';

/**
 * Controle central do site: define para que lado a lista pende.
 *
 * Reordenar acontece no navegador, sobre os itinerários já carregados — mexer
 * aqui é instantâneo e não gasta consulta ao provedor.
 */
const MARCOS = [
  {
    valor: 0,
    rotulo: 'O mais barato, custe o que custar',
    explicacao: 'Mostra primeiro o que sai mais barato, mesmo que tenha risco de dar errado.',
  },
  {
    valor: 0.25,
    rotulo: 'Barato, mas sem loucura',
    explicacao: 'Prioriza o preço, mas deixa para trás as opções mais perigosas.',
  },
  {
    valor: 0.45,
    rotulo: 'Equilibrado',
    explicacao: 'Pesa preço e tranquilidade juntos. É o ajuste que a maioria das pessoas quer.',
  },
  {
    valor: 0.7,
    rotulo: 'Prefiro pagar mais e ir tranquilo',
    explicacao: 'Coloca na frente as viagens com folga, mesmo custando um pouco mais.',
  },
  {
    valor: 1,
    rotulo: 'Sem risco nenhum',
    explicacao: 'Só olha a segurança. O preço deixa de importar na ordem da lista.',
  },
];

function marcoMaisProximo(peso: number) {
  return MARCOS.reduce((maisProximo, marco) =>
    Math.abs(marco.valor - peso) < Math.abs(maisProximo.valor - peso) ? marco : maisProximo,
  );
}

export default function BalancaPrecoSeguranca({
  peso,
  aoMudar,
}: {
  peso: number;
  aoMudar: (peso: number) => void;
}) {
  const id = useId();
  const marco = marcoMaisProximo(peso);

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra)] sm:p-5">
      <label htmlFor={id} className="block text-base font-bold text-texto">
        O que é mais importante para você?
      </label>
      <p className="mt-0.5 text-sm text-suave">
        Arraste a bolinha. A lista se reorganiza na hora.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="etiqueta shrink-0 text-risco">Barato</span>
        <input
          id={id}
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={peso}
          onChange={(e) => aoMudar(Number(e.target.value))}
          aria-valuetext={marco.rotulo}
        />
        <span className="etiqueta shrink-0 text-ok">Seguro</span>
      </div>

      <div className="mt-3 rounded-lg bg-marca-suave px-3 py-2">
        <p className="font-bold text-marca">{marco.rotulo}</p>
        <p className="mt-0.5 text-sm text-suave">{marco.explicacao}</p>
      </div>
    </div>
  );
}
