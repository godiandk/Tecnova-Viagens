'use client';

import { useConta } from '@/components/ContextoConta';

/**
 * Atalho de conta no cabeçalho.
 *
 * Quem nunca entrou vê "Entrar"; quem entrou vê o próprio nome. O link do
 * painel administrativo só aparece para a conta de administrador — o que é
 * conveniência, não proteção: quem barra o acesso são as regras do Firestore.
 */
export default function AtalhoConta({
  hrefConta,
  hrefAdmin,
}: {
  hrefConta: string;
  hrefAdmin: string;
}) {
  const { conta } = useConta();

  if (!conta) {
    return (
      <a
        href={hrefConta}
        className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
      >
        Entrar
      </a>
    );
  }

  const primeiroNome = (conta.nome ?? conta.email ?? '').split(/[\s@]/)[0];

  return (
    <div className="flex items-center gap-2">
      {conta.admin && (
        <a
          href={hrefAdmin}
          className="rounded-lg border border-marca/40 bg-marca-suave px-3 py-1.5 text-sm font-bold text-marca"
        >
          Admin
        </a>
      )}
      <a
        href={hrefConta}
        className="max-w-[9rem] truncate rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
      >
        {primeiroNome}
      </a>
    </div>
  );
}
