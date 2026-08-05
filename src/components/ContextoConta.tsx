'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { explicarFalha, obterFirebase, type Firebase } from '@/lib/firebase/cliente';
import { COLECOES, ehAdmin } from '@/lib/firebase/config';

export type Conta = {
  uid: string;
  email: string | null;
  nome: string | null;
  admin: boolean;
};

type Estado = {
  conta: Conta | null;
  /** Falso quando o Firebase não pôde ser carregado (offline, prévia sem rede). */
  disponivel: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  criarConta: (nome: string, email: string, senha: string) => Promise<void>;
  recuperarSenha: (email: string) => Promise<void>;
  sair: () => Promise<void>;
  /** Carrega o Firebase sob demanda; usado pelas telas que precisam dele. */
  prepararFirebase: () => Promise<Firebase>;
};

const ContextoConta = createContext<Estado | null>(null);

/**
 * Marca que este navegador já teve login.
 *
 * Serve para decidir se vale carregar o SDK do Firebase logo na abertura. Sem
 * esta marca, a primeira visita não baixa meio megabyte de biblioteca para
 * descobrir que ninguém está logado; com ela, quem tem conta volta e já
 * encontra a sessão de pé.
 */
const MARCA_SESSAO = 'tecnova-tem-conta';

function marcarSessao(tem: boolean) {
  try {
    if (tem) window.localStorage.setItem(MARCA_SESSAO, 'sim');
    else window.localStorage.removeItem(MARCA_SESSAO);
  } catch {
    // Armazenamento bloqueado: a sessão vale só para esta aba.
  }
}

function jaTeveSessao(): boolean {
  try {
    return window.localStorage.getItem(MARCA_SESSAO) === 'sim';
  } catch {
    return false;
  }
}

function montarConta(usuario: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): Conta {
  return {
    uid: usuario.uid,
    email: usuario.email,
    nome: usuario.displayName,
    admin: ehAdmin(usuario.email),
  };
}

/**
 * Assina as mudanças de sessão do Firebase.
 *
 * Fica fora do componente de propósito. Dentro do efeito, a inscrição
 * acontecia depois de um `then`, e daquele ponto em diante nem o React nem o
 * linter conseguem distinguir "reagi a um sistema externo" de "mexi em estado
 * durante a renderização". Aqui a fronteira fica explícita: entra um retorno
 * de chamada, sai um cancelamento.
 */
function assinarSessao(
  preparar: () => Promise<Firebase>,
  aoMudar: (conta: Conta | null) => void,
): () => void {
  let cancelado = false;
  let desinscrever: (() => void) | undefined;

  preparar()
    .then((fb) => {
      if (cancelado) return;
      desinscrever = fb.auth.onAuthStateChanged((usuario) => {
        aoMudar(usuario ? montarConta(usuario) : null);
      });
    })
    .catch(() => {
      // Sem rede a área de conta fica indisponível; o resto do site segue.
    });

  return () => {
    cancelado = true;
    desinscrever?.();
  };
}

export function ProvedorConta({ children }: { children: React.ReactNode }) {
  const [conta, setConta] = useState<Conta | null>(null);
  const [disponivel, setDisponivel] = useState(true);

  const prepararFirebase = useCallback(async () => {
    try {
      const fb = await obterFirebase();
      setDisponivel(true);
      return fb;
    } catch (erro) {
      setDisponivel(false);
      throw erro;
    }
  }, []);

  // Só restaura sessão em navegador que já entrou alguma vez.
  useEffect(() => {
    if (!jaTeveSessao()) return;

    return assinarSessao(prepararFirebase, (proxima) => {
      setConta(proxima);
      if (!proxima) marcarSessao(false);
    });
  }, [prepararFirebase]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const fb = await prepararFirebase();
      const { user } = await fb.auth.signInWithEmailAndPassword(email.trim(), senha);
      setConta(montarConta(user));
      marcarSessao(true);
    },
    [prepararFirebase],
  );

  const criarConta = useCallback(
    async (nome: string, email: string, senha: string) => {
      const fb = await prepararFirebase();
      const { user } = await fb.auth.createUserWithEmailAndPassword(email.trim(), senha);

      // A ficha do cliente é gravada logo na criação: sem ela, o painel do
      // administrador mostraria um uid sem nome nem forma de contato.
      await fb.db
        .collection(COLECOES.clientes)
        .doc(user.uid)
        .set({
          nome: nome.trim(),
          email: user.email,
          criadoEm: new Date().toISOString(),
        });

      setConta({ ...montarConta(user), nome: nome.trim() });
      marcarSessao(true);
    },
    [prepararFirebase],
  );

  const recuperarSenha = useCallback(
    async (email: string) => {
      const fb = await prepararFirebase();
      await fb.auth.sendPasswordResetEmail(email.trim());
    },
    [prepararFirebase],
  );

  const sair = useCallback(async () => {
    const fb = await prepararFirebase();
    await fb.auth.signOut();
    setConta(null);
    marcarSessao(false);
  }, [prepararFirebase]);

  return (
    <ContextoConta.Provider
      value={{
        conta,
        disponivel,
        entrar,
        criarConta,
        recuperarSenha,
        sair,
        prepararFirebase,
      }}
    >
      {children}
    </ContextoConta.Provider>
  );
}

/** Fora do provedor devolve um estado inerte, para nada quebrar em teste. */
export function useConta(): Estado {
  const contexto = useContext(ContextoConta);
  if (contexto) return contexto;

  const indisponivel = async () => {
    throw new Error('Área de conta indisponível');
  };
  return {
    conta: null,
    disponivel: false,
    entrar: indisponivel,
    criarConta: indisponivel,
    recuperarSenha: indisponivel,
    sair: indisponivel,
    prepararFirebase: indisponivel as unknown as () => Promise<Firebase>,
  };
}

export { explicarFalha };
