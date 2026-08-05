'use client';

import { useEffect, useRef, useState } from 'react';
import { useIdioma } from '@/lib/i18n/contexto';
import { IDIOMAS, type Idioma } from '@/lib/i18n/idiomas';

/**
 * Troca de idioma.
 *
 * Segue o mesmo comportamento do seletor da TECNOVA Digital — bandeira, sigla,
 * menu que fecha ao clicar fora — para quem usa os dois sites reconhecer o
 * controle. A escolha é guardada na mesma chave, então vale nos dois.
 */
export default function SeletorIdioma() {
  const { idioma, definirIdioma } = useIdioma();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (!caixa.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false);
    }

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  const atual = IDIOMAS[idioma];

  return (
    <div className="relative" ref={caixa}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="listbox"
        aria-label={`Idioma: ${atual.nome}`}
        className="flex items-center gap-1.5 rounded-lg border border-borda px-2.5 py-1.5 text-sm font-bold text-suave transition-colors hover:text-marca"
      >
        <span aria-hidden="true">{atual.bandeira}</span>
        <span className="dado">{atual.curto}</span>
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-borda bg-superficie shadow-lg"
        >
          {(Object.keys(IDIOMAS) as Idioma[]).map((codigo) => (
            <li key={codigo}>
              <button
                type="button"
                role="option"
                aria-selected={codigo === idioma}
                onClick={() => {
                  definirIdioma(codigo);
                  setAberto(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  codigo === idioma ? 'bg-marca-suave font-bold text-marca' : 'text-texto'
                }`}
              >
                <span aria-hidden="true">{IDIOMAS[codigo].bandeira}</span>
                {IDIOMAS[codigo].nome}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
