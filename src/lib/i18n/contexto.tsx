'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  CHAVE_ARMAZENAMENTO,
  IDIOMAS,
  IDIOMA_PADRAO,
  ehIdiomaValido,
  type Dicionario,
  type Idioma,
} from '@/lib/i18n/idiomas';
import { EN } from '@/lib/i18n/en';
import { ES } from '@/lib/i18n/es';

const DICIONARIOS: Partial<Record<Idioma, Dicionario>> = { en: EN, es: ES };

/** Valores que podem entrar num marcador {assim}. */
export type Variaveis = Record<string, string | number>;

export type Traduzir = (frase: string, variaveis?: Variaveis) => string;

type Contexto = {
  idioma: Idioma;
  definirIdioma: (idioma: Idioma) => void;
  t: Traduzir;
  /** Locale para Intl (moeda, datas), derivado do idioma. */
  locale: string;
};

const ContextoIdioma = createContext<Contexto | null>(null);

function preencher(texto: string, variaveis?: Variaveis): string {
  if (!variaveis) return texto;
  return texto.replace(/\{(\w+)\}/g, (original, chave: string) =>
    chave in variaveis ? String(variaveis[chave]) : original,
  );
}

/** Descobre o idioma inicial: ?lang= na URL, escolha salva, idioma do navegador. */
function idiomaInicial(): Idioma {
  if (typeof window === 'undefined') return IDIOMA_PADRAO;

  try {
    const daUrl = new URLSearchParams(window.location.search).get('lang');
    if (ehIdiomaValido(daUrl)) return daUrl;

    const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (ehIdiomaValido(salvo)) return salvo;
  } catch {
    // Navegador com armazenamento bloqueado: segue no padrão.
  }

  const doNavegador = (navigator.language || 'pt').slice(0, 2).toLowerCase();
  return ehIdiomaValido(doNavegador) ? doNavegador : IDIOMA_PADRAO;
}

/**
 * O idioma escolhido vive fora do React, num pequeno depósito.
 *
 * Ele precisa ser lido de `localStorage` e da URL, que só existem no
 * navegador — enquanto o HTML do servidor tem de sair sempre em português,
 * senão a hidratação encontra dois textos diferentes. `useSyncExternalStore`
 * resolve exatamente isso: entrega o português no servidor e o idioma real no
 * cliente, sem precisar mexer em estado dentro de um efeito.
 */
let idiomaAtual: Idioma | null = null;
const ouvintes = new Set<() => void>();

function inscrever(aoMudar: () => void): () => void {
  ouvintes.add(aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
  };
}

function lerNoCliente(): Idioma {
  if (idiomaAtual === null) idiomaAtual = idiomaInicial();
  return idiomaAtual;
}

function lerNoServidor(): Idioma {
  return IDIOMA_PADRAO;
}

function escrever(novo: Idioma): void {
  if (idiomaAtual === novo) return;
  idiomaAtual = novo;
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, novo);
  } catch {
    // Sem armazenamento a escolha vale só para esta visita.
  }
  for (const aoMudar of ouvintes) aoMudar();
}

export function ProvedorIdioma({ children }: { children: React.ReactNode }) {
  const idioma = useSyncExternalStore(inscrever, lerNoCliente, lerNoServidor);

  useEffect(() => {
    document.documentElement.lang = IDIOMAS[idioma].htmlLang;
  }, [idioma]);

  const definirIdioma = useCallback((novo: Idioma) => {
    escrever(novo);
  }, []);

  const t = useCallback<Traduzir>(
    (frase, variaveis) => {
      const dicionario = DICIONARIOS[idioma];
      if (!dicionario) return preencher(frase, variaveis);

      const traducao = dicionario[frase];
      if (traducao) return preencher(traducao, variaveis);

      // Sem tradução, fica o português. Melhor do que inventar ou mostrar a chave.
      return preencher(frase, variaveis);
    },
    [idioma],
  );

  const valor = useMemo<Contexto>(
    () => ({ idioma, definirIdioma, t, locale: IDIOMAS[idioma].locale }),
    [idioma, definirIdioma, t],
  );

  return <ContextoIdioma.Provider value={valor}>{children}</ContextoIdioma.Provider>;
}

/**
 * Acesso à tradução. Fora do provedor devolve o português sem quebrar, para
 * que um componente isolado (ou um teste) continue renderizando.
 */
export function useIdioma(): Contexto {
  const contexto = useContext(ContextoIdioma);
  if (contexto) return contexto;

  return {
    idioma: IDIOMA_PADRAO,
    definirIdioma: () => {},
    t: (frase, variaveis) => preencher(frase, variaveis),
    locale: IDIOMAS[IDIOMA_PADRAO].locale,
  };
}

/** Atalho para quem só precisa traduzir. */
export function useT(): Traduzir {
  return useIdioma().t;
}
