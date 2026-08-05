'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buscarAeroporto, pesquisarAeroportos } from '@/lib/dados/aeroportos';
import type { Aeroporto } from '@/lib/tipos';

type Props = {
  rotulo: string;
  valor: string;
  aoMudar: (iata: string) => void;
  placeholder?: string;
};

/**
 * Autocomplete de aeroporto.
 *
 * O catálogo é pequeno e roda inteiro no navegador — sem chamada de rede, a
 * lista responde a cada tecla. O valor entregue ao formulário é sempre um
 * código IATA válido; texto solto nunca vira estado.
 *
 * `rascunho` é `null` quando ninguém está digitando: aí o campo mostra o
 * aeroporto já escolhido. Assim que vira texto — inclusive texto vazio — o
 * campo passa a mostrar exatamente o que foi digitado. A distinção entre
 * "vazio" e "não estou editando" é o que faz o apagar funcionar: antes, campo
 * vazio era tratado como "não editando" e o aeroporto anterior reaparecia
 * sozinho, impossível de apagar.
 */
export default function CampoAeroporto({ rotulo, valor, aoMudar, placeholder }: Props) {
  const id = useId();
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [destacado, setDestacado] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  const selecionado = valor ? buscarAeroporto(valor) : undefined;
  const editando = rascunho !== null;

  const rotuloSelecionado = selecionado
    ? `${selecionado.cidade} (${selecionado.iata})`
    : '';
  const exibido = rascunho ?? rotuloSelecionado;

  const sugestoes = useMemo(
    () => (editando && rascunho.trim().length >= 2 ? pesquisarAeroportos(rascunho) : []),
    [editando, rascunho],
  );
  const aberto = editando && sugestoes.length > 0;

  // Clicar fora encerra a edição e devolve o aeroporto escolhido ao campo.
  useEffect(() => {
    if (!editando) return;

    function aoClicarFora(evento: MouseEvent) {
      if (!container.current?.contains(evento.target as Node)) setRascunho(null);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [editando]);

  function escolher(aeroporto: Aeroporto) {
    aoMudar(aeroporto.iata);
    setRascunho(null);
    setDestacado(0);
    campo.current?.blur();
  }

  function aoTeclar(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Escape') {
      setRascunho(null);
      return;
    }
    if (!aberto) return;

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      setDestacado((i) => (i + 1) % sugestoes.length);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      setDestacado((i) => (i - 1 + sugestoes.length) % sugestoes.length);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      escolher(sugestoes[destacado]);
    }
  }

  return (
    <div className="relative" ref={container}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-suave">
        {rotulo}
      </label>

      <div className="relative">
        <input
          id={id}
          ref={campo}
          type="text"
          role="combobox"
          aria-expanded={aberto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-lg border border-borda bg-superficie py-2.5 pl-3 pr-9 text-texto placeholder:text-suave/70"
          placeholder={placeholder ?? 'Cidade ou código (ex.: GRU)'}
          value={exibido}
          onChange={(e) => {
            setRascunho(e.target.value);
            setDestacado(0);
          }}
          // Focar começa uma edição limpa, em vez de obrigar a apagar o texto.
          onFocus={() => setRascunho('')}
          onKeyDown={aoTeclar}
        />

        {exibido && (
          <button
            type="button"
            aria-label={`Limpar ${rotulo.toLowerCase()}`}
            // Impede o campo de perder o foco antes do clique ser processado.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              aoMudar('');
              setRascunho('');
              campo.current?.focus();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-tenue transition-colors hover:text-texto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {aberto && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-borda bg-superficie shadow-lg"
        >
          {sugestoes.map((aeroporto, indice) => (
            <li key={aeroporto.iata}>
              <button
                type="button"
                role="option"
                aria-selected={indice === destacado}
                // Sem isto o campo perde o foco antes do clique chegar.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(aeroporto)}
                onMouseEnter={() => setDestacado(indice)}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left text-sm ${
                  indice === destacado ? 'bg-marca-suave' : ''
                }`}
              >
                <span>
                  <span className="font-semibold text-texto">{aeroporto.cidade}</span>
                  <span className="ml-2 text-suave">{aeroporto.nome}</span>
                </span>
                <span className="dado shrink-0 text-xs text-suave">{aeroporto.iata}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
