'use client';

import { useCallback, useEffect, useState } from 'react';
import { explicarFalha, useConta } from '@/components/ContextoConta';
import { COLECOES } from '@/lib/firebase/config';
import { moeda } from '@/lib/formato';

type Cliente = { id: string; nome?: string; email?: string; criadoEm?: string };
type Cotacao = {
  id: string;
  clienteUid?: string;
  clienteEmail?: string;
  rota?: string;
  data?: string;
  precoBRL?: number;
  custoRealBRL?: number;
  nota?: number;
  criadoEm?: string;
};

/**
 * Painel do administrador.
 *
 * Esconder a tela de quem não é administrador é conforto, não segurança: o
 * JavaScript está à vista de qualquer visitante. Quem realmente barra o acesso
 * é `firestore.rules`, que confere o e-mail do token no servidor do Google
 * antes de devolver um único documento. Se alguém forçar esta tela a aparecer,
 * vai encontrar as listas vazias e um erro de permissão.
 */
export default function PainelAdmin() {
  const { conta, disponivel, prepararFirebase } = useConta();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setBuscando(true);
    setErro('');
    try {
      const fb = await prepararFirebase();

      const [listaClientes, listaCotacoes] = await Promise.all([
        fb.db.collection(COLECOES.clientes).limit(200).get(),
        fb.db.collection(COLECOES.cotacoes).orderBy('criadoEm', 'desc').limit(200).get(),
      ]);

      setClientes(listaClientes.docs.map((d) => ({ id: d.id, ...d.data() }) as Cliente));
      setCotacoes(listaCotacoes.docs.map((d) => ({ id: d.id, ...d.data() }) as Cotacao));
    } catch (falha) {
      setErro(explicarFalha(falha));
    } finally {
      setBuscando(false);
    }
  }, [prepararFirebase]);

  useEffect(() => {
    if (!conta?.admin) return;
    let vivo = true;

    void (async () => {
      // Um microtask de distância basta para o primeiro setState não acontecer
      // durante a própria renderização que disparou o efeito.
      await Promise.resolve();
      if (vivo) await carregar();
    })();

    return () => {
      vivo = false;
    };
  }, [conta?.admin, carregar]);

  if (!disponivel) {
    return (
      <Aviso tom="atencao">
        O painel precisa falar com o servidor, e esta prévia roda sem internet. Abra o site
        publicado para usá-lo.
      </Aviso>
    );
  }

  if (!conta) {
    return <Aviso tom="atencao">Entre com a conta de administrador para ver este painel.</Aviso>;
  }

  if (!conta.admin) {
    return (
      <Aviso tom="perigo">
        A conta <strong>{conta.email}</strong> não tem acesso ao painel administrativo.
      </Aviso>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Indicador rotulo="Clientes" valor={clientes.length} />
          <Indicador rotulo="Cotações" valor={cotacoes.length} />
        </div>
        <button
          type="button"
          onClick={() => void carregar()}
          disabled={buscando}
          className="rounded-lg border border-borda px-3.5 py-2 text-sm font-bold text-suave transition-colors hover:text-marca disabled:opacity-60"
        >
          {buscando ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      {erro && <Aviso tom="perigo">{erro}</Aviso>}

      <Secao titulo="Cotações salvas" vazio="Nenhuma cotação salva ainda." itens={cotacoes.length}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-borda text-left text-xs uppercase tracking-wide text-tenue">
                <th className="px-3 py-2">Rota</th>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2 text-right">Anunciado</th>
                <th className="px-3 py-2 text-right">Custo real</th>
                <th className="px-3 py-2 text-right">Nota</th>
              </tr>
            </thead>
            <tbody>
              {cotacoes.map((c) => (
                <tr key={c.id} className="border-b border-borda last:border-0">
                  <td className="dado px-3 py-2 font-semibold text-texto">{c.rota ?? '—'}</td>
                  <td className="dado px-3 py-2 text-suave">{c.data ?? '—'}</td>
                  <td className="px-3 py-2 text-suave">{c.clienteEmail ?? c.clienteUid ?? '—'}</td>
                  <td className="dado px-3 py-2 text-right text-suave">
                    {typeof c.precoBRL === 'number' ? moeda(c.precoBRL) : '—'}
                  </td>
                  <td className="dado px-3 py-2 text-right font-semibold text-texto">
                    {typeof c.custoRealBRL === 'number' ? moeda(c.custoRealBRL) : '—'}
                  </td>
                  <td className="dado px-3 py-2 text-right text-suave">{c.nota ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao titulo="Clientes cadastrados" vazio="Ninguém criou conta ainda." itens={clientes.length}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-borda text-left text-xs uppercase tracking-wide text-tenue">
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Desde</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-borda last:border-0">
                  <td className="px-3 py-2 font-semibold text-texto">{c.nome ?? '—'}</td>
                  <td className="px-3 py-2 text-suave">{c.email ?? '—'}</td>
                  <td className="dado px-3 py-2 text-suave">{c.criadoEm?.slice(0, 10) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>
    </div>
  );
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="rounded-xl border border-borda bg-superficie px-4 py-2.5">
      <p className="dado text-2xl font-bold leading-none text-texto">{valor}</p>
      <p className="etiqueta mt-1 text-tenue">{rotulo}</p>
    </div>
  );
}

function Secao({
  titulo,
  vazio,
  itens,
  children,
}: {
  titulo: string;
  vazio: string;
  itens: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-borda bg-superficie">
      <h2 className="border-b border-borda px-4 py-3 font-bold text-texto">{titulo}</h2>
      {itens === 0 ? <p className="p-4 text-sm text-suave">{vazio}</p> : children}
    </section>
  );
}

function Aviso({
  children,
  tom = 'neutro',
}: {
  children: React.ReactNode;
  tom?: 'neutro' | 'atencao' | 'perigo';
}) {
  const classes = {
    neutro: 'border-borda bg-superficie text-suave',
    atencao: 'border-atencao/40 bg-atencao-suave text-texto',
    perigo: 'border-perigo/40 bg-perigo-suave text-perigo',
  }[tom];

  return <p className={`rounded-2xl border p-5 ${classes}`}>{children}</p>;
}
