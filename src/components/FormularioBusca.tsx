'use client';

import { useId, useState } from 'react';
import CampoAeroporto from '@/components/CampoAeroporto';
import type { ParametrosBusca } from '@/lib/tipos';

type Props = {
  parametros: ParametrosBusca;
  aoMudar: (parcial: Partial<ParametrosBusca>) => void;
  aoEnviar: () => void;
  carregando: boolean;
};

const NACIONALIDADES = [
  { iso: 'BR', nome: 'Brasil' },
  { iso: 'PT', nome: 'Portugal' },
  { iso: 'AR', nome: 'Argentina' },
  { iso: 'US', nome: 'Estados Unidos' },
  { iso: 'ES', nome: 'Espanha' },
];

export default function FormularioBusca({ parametros, aoMudar, aoEnviar, carregando }: Props) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const idIda = useId();
  const idVolta = useId();
  const hoje = new Date().toISOString().slice(0, 10);

  const somenteIda = !parametros.volta;

  function inverterRota() {
    aoMudar({ origem: parametros.destino, destino: parametros.origem });
  }

  function alternarSomenteIda(valor: boolean) {
    if (valor) {
      aoMudar({ volta: undefined });
    } else {
      // Sugere uma semana de viagem em vez de deixar o campo vazio.
      const base = new Date(`${parametros.ida}T00:00:00Z`);
      base.setUTCDate(base.getUTCDate() + 7);
      aoMudar({ volta: base.toISOString().slice(0, 10) });
    }
  }

  return (
    <form
      className="rounded-2xl border border-borda bg-superficie p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        aoEnviar();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto]">
        <CampoAeroporto
          rotulo="Saindo de"
          valor={parametros.origem}
          aoMudar={(iata) => aoMudar({ origem: iata })}
        />

        <div className="flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={inverterRota}
            title="Inverter origem e destino"
            aria-label="Inverter origem e destino"
            className="rounded-full border border-borda bg-superficie-2 p-2.5 text-suave transition hover:text-marca"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <CampoAeroporto
          rotulo="Indo para"
          valor={parametros.destino}
          aoMudar={(iata) => aoMudar({ destino: iata })}
        />

        <div className="flex items-end lg:pb-0">
          <button
            type="submit"
            disabled={carregando}
            className="h-[46px] w-full rounded-lg bg-marca px-6 font-semibold text-white transition hover:bg-marca-forte disabled:opacity-60 lg:w-auto"
          >
            {carregando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor={idIda} className="mb-1 block text-sm font-medium text-suave">
            Ida
          </label>
          <input
            id={idIda}
            type="date"
            min={hoje}
            value={parametros.ida}
            onChange={(e) => aoMudar({ ida: e.target.value })}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-texto"
          />
        </div>

        <div>
          <label htmlFor={idVolta} className="mb-1 block text-sm font-medium text-suave">
            Volta
          </label>
          <input
            id={idVolta}
            type="date"
            min={parametros.ida}
            value={parametros.volta ?? ''}
            disabled={somenteIda}
            onChange={(e) => aoMudar({ volta: e.target.value || undefined })}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-texto disabled:opacity-50"
          />
          <label className="mt-1.5 flex items-center gap-2 text-sm text-suave">
            <input
              type="checkbox"
              checked={somenteIda}
              onChange={(e) => alternarSomenteIda(e.target.checked)}
              className="accent-[var(--marca)]"
            />
            Somente ida
          </label>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-suave">Passageiros</span>
          <div className="grid grid-cols-3 gap-2">
            <SeletorQuantidade
              singular="adulto"
              plural="adultos"
              valor={parametros.passageiros.adultos}
              minimo={1}
              maximo={9}
              aoMudar={(v) =>
                aoMudar({ passageiros: { ...parametros.passageiros, adultos: v } })
              }
            />
            <SeletorQuantidade
              singular="criança"
              plural="crianças"
              valor={parametros.passageiros.criancas}
              minimo={0}
              maximo={8}
              aoMudar={(v) =>
                aoMudar({ passageiros: { ...parametros.passageiros, criancas: v } })
              }
            />
            <SeletorQuantidade
              singular="bebê"
              plural="bebês"
              valor={parametros.passageiros.bebes}
              minimo={0}
              maximo={parametros.passageiros.adultos}
              aoMudar={(v) => aoMudar({ passageiros: { ...parametros.passageiros, bebes: v } })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-suave" htmlFor="nacionalidade">
            Passaporte
          </label>
          <select
            id="nacionalidade"
            value={parametros.nacionalidade}
            onChange={(e) => aoMudar({ nacionalidade: e.target.value })}
            className="w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-texto"
          >
            {NACIONALIDADES.map((n) => (
              <option key={n.iso} value={n.iso}>
                {n.nome}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-suave">Usado para checar visto de trânsito.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFiltrosAbertos((v) => !v)}
        aria-expanded={filtrosAbertos}
        className="mt-4 text-sm font-medium text-marca"
      >
        {filtrosAbertos ? '− Ocultar filtros' : '+ Filtros de segurança'}
      </button>

      {filtrosAbertos && (
        <div className="mt-3 grid gap-3 rounded-xl border border-borda bg-superficie-2 p-4 sm:grid-cols-3">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={!parametros.permitirBilhetesSeparados}
              onChange={(e) => aoMudar({ permitirBilhetesSeparados: !e.target.checked })}
              className="mt-0.5 accent-[var(--marca)]"
            />
            <span>
              <span className="font-medium text-texto">Só bilhete único</span>
              <span className="block text-xs text-suave">
                Esconde autoconexões, onde perder um voo não dá direito a reacomodação.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={parametros.exigirBagagemDespachada}
              onChange={(e) => aoMudar({ exigirBagagemDespachada: e.target.checked })}
              className="mt-0.5 accent-[var(--marca)]"
            />
            <span>
              <span className="font-medium text-texto">Com bagagem despachada</span>
              <span className="block text-xs text-suave">
                Só tarifas que já incluem mala no porão.
              </span>
            </span>
          </label>

          <div className="text-sm">
            <label htmlFor="paradas" className="font-medium text-texto">
              Máximo de paradas
            </label>
            <select
              id="paradas"
              value={parametros.maxParadas}
              onChange={(e) => aoMudar({ maxParadas: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-texto"
            >
              <option value={0}>Só voo direto</option>
              <option value={1}>Até 1 parada</option>
              <option value={2}>Até 2 paradas</option>
              <option value={3}>Até 3 paradas</option>
            </select>
          </div>
        </div>
      )}
    </form>
  );
}

function SeletorQuantidade({
  singular,
  plural,
  valor,
  minimo,
  maximo,
  aoMudar,
}: {
  singular: string;
  plural: string;
  valor: number;
  minimo: number;
  maximo: number;
  aoMudar: (valor: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {plural}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(Number(e.target.value))}
        title={plural}
        className="w-full rounded-lg border border-borda bg-superficie px-2 py-2.5 text-sm text-texto"
      >
        {Array.from({ length: maximo - minimo + 1 }, (_, i) => minimo + i).map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? singular : plural}
          </option>
        ))}
      </select>
    </div>
  );
}
