import { CONFIG_FIREBASE, VERSAO_SDK } from '@/lib/firebase/config';

/**
 * Carrega o Firebase só quando alguém realmente vai usar conta.
 *
 * A biblioteca vem de CDN, sob demanda, em vez de entrar no pacote do site.
 * São dois motivos:
 *
 * 1. Peso. A maioria das visitas nunca faz login; carregar meio megabyte de
 *    SDK para todo mundo por causa de uma minoria é conta que não fecha.
 * 2. A versão publicada como página única precisa abrir sem internet. Se o
 *    Firebase fosse obrigatório na inicialização, um bloqueio de rede levaria
 *    o site inteiro junto. Assim, só a área de conta deixa de funcionar — e
 *    ela diz isso com todas as letras.
 */

/** Tipos mínimos do SDK compat: só o que este projeto consome. */
type Usuario = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

type Auth = {
  currentUser: Usuario | null;
  onAuthStateChanged: (ouvinte: (u: Usuario | null) => void) => () => void;
  signInWithEmailAndPassword: (email: string, senha: string) => Promise<{ user: Usuario }>;
  createUserWithEmailAndPassword: (email: string, senha: string) => Promise<{ user: Usuario }>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

type Documento = { id: string; data: () => Record<string, unknown> };
type Consulta = {
  get: () => Promise<{ docs: Documento[]; empty: boolean }>;
  orderBy: (campo: string, direcao?: 'asc' | 'desc') => Consulta;
  where: (campo: string, operador: string, valor: unknown) => Consulta;
  limit: (n: number) => Consulta;
};
type Colecao = Consulta & {
  doc: (id?: string) => {
    set: (dados: unknown, opcoes?: { merge: boolean }) => Promise<void>;
    get: () => Promise<Documento & { exists: boolean }>;
    delete: () => Promise<void>;
    id: string;
  };
  add: (dados: unknown) => Promise<{ id: string }>;
};
type Firestore = { collection: (nome: string) => Colecao };

export type Firebase = { auth: Auth; db: Firestore };

declare global {
  interface Window {
    firebase?: {
      apps: unknown[];
      initializeApp: (config: unknown) => void;
      auth: () => Auth;
      firestore: () => Firestore;
    };
  }
}

const SCRIPTS = [
  `https://www.gstatic.com/firebasejs/${VERSAO_SDK}/firebase-app-compat.js`,
  `https://www.gstatic.com/firebasejs/${VERSAO_SDK}/firebase-auth-compat.js`,
  `https://www.gstatic.com/firebasejs/${VERSAO_SDK}/firebase-firestore-compat.js`,
];

function carregarScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existente) {
      if (existente.dataset.pronto === 'sim') return resolve();
      existente.addEventListener('load', () => resolve());
      existente.addEventListener('error', () => reject(new Error(src)));
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.pronto = 'sim';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(src)));
    document.head.appendChild(script);
  });
}

let promessa: Promise<Firebase> | null = null;

/**
 * Devolve o Firebase pronto, carregando na primeira chamada.
 *
 * A promessa é guardada para que várias telas pedindo ao mesmo tempo não
 * disparem três downloads do SDK.
 */
export function obterFirebase(): Promise<Firebase> {
  if (promessa) return promessa;

  promessa = (async () => {
    // Os scripts dependem uns dos outros: app primeiro, depois auth e store.
    for (const src of SCRIPTS) await carregarScript(src);

    const firebase = window.firebase;
    if (!firebase) throw new Error('SDK do Firebase não ficou disponível');

    if (firebase.apps.length === 0) firebase.initializeApp(CONFIG_FIREBASE);
    return { auth: firebase.auth(), db: firebase.firestore() };
  })();

  // Uma falha de rede não pode envenenar as tentativas seguintes.
  promessa.catch(() => {
    promessa = null;
  });

  return promessa;
}

/** Erros do Firebase vêm em inglês e em código; aqui viram frase útil. */
export function explicarFalha(erro: unknown): string {
  const codigo =
    typeof erro === 'object' && erro !== null && 'code' in erro
      ? String((erro as { code?: unknown }).code ?? '')
      : '';

  const mapa: Record<string, string> = {
    'auth/invalid-email': 'Esse e-mail não parece válido. Confira se está escrito certo.',
    'auth/user-not-found': 'Não existe conta com esse e-mail. Crie uma conta primeiro.',
    'auth/wrong-password': 'Senha errada. Tente de novo ou use "esqueci a senha".',
    'auth/invalid-credential': 'E-mail ou senha não conferem. Tente de novo.',
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Faça login.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas seguidas. Espere alguns minutos.',
    'auth/network-request-failed': 'Sem conexão com o servidor. Verifique sua internet.',
    'permission-denied': 'Esta conta não tem permissão para ver isso.',
  };

  if (mapa[codigo]) return mapa[codigo];
  return 'Não foi possível completar. Tente de novo em instantes.';
}
