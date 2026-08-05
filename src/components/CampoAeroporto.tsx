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
 */
export default function CampoAeroporto({ rotulo, valor, aoMudar, placeholder }: Props) {
  const id = useId();
  const [texto, setTexto] = useState('');
  const [aberto, setAberto] = useState(false);
  const [destacado, setDestacado] = useState(0);
  const container = useRef<HTMLDivElement>(null);

  const selecionado = valor ? buscarAeroporto(valor) : undefined;
  const sugestoes = useMemo(() => (texto.length >= 2 ? pesquisarAeroportos(texto) : []), [texto]);

  // Fecha a lista ao clicar fora, sem prender o foco do usuário.
  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (!container.current?.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  function escolher(aeroporto: Aeroporto) {
    aoMudar(aeroporto.iata);
    setTexto('');
    setAberto(false);
  }

  function aoTeclar(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (!aberto || sugestoes.length === 0) return;

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      setDestacado((i) => (i + 1) % sugestoes.length);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      setDestacado((i) => (i - 1 + sugestoes.length) % sugestoes.length);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      escolher(sugestoes[destacado]);
    } else if (evento.key === 'Escape') {
      setAberto(false);
    }
  }

  return (
    <div className="relative" ref={container}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-suave">
        {rotulo}
      </label>

      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        autoComplete="off"
        className="w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-texto placeholder:text-suave/70"
        placeholder={selecionado ? '' : (placeholder ?? 'Cidade ou código (ex.: GRU)')}
        value={texto || (selecionado ? `${selecionado.cidade} (${selecionado.iata})` : '')}
        onChange={(e) => {
          setTexto(e.target.value);
          setDestacado(0);
          setAberto(true);
        }}
        onFocus={() => {
          // Ao focar em um campo já preenchido, limpa para permitir nova digitação.
          if (selecionado) setTexto('');
          setAberto(true);
        }}
        onKeyDown={aoTeclar}
      />

      {aberto && sugestoes.length > 0 && (
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
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm ${
                  indice === destacado ? 'bg-marca-suave' : ''
                }`}
                onMouseEnter={() => setDestacado(indice)}
                onClick={() => escolher(aeroporto)}
              >
                <span>
                  <span className="font-medium text-texto">{aeroporto.cidade}</span>
                  <span className="ml-2 text-suave">{aeroporto.nome}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-suave">{aeroporto.iata}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
