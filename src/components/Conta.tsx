'use client';

import { useState } from 'react';
import { explicarFalha, useConta } from '@/components/ContextoConta';

type Aba = 'entrar' | 'criar' | 'esqueci';

/**
 * Entrar, criar conta e recuperar senha.
 *
 * A conta é a mesma da TECNOVA Digital: quem já tem login lá entra aqui com
 * ele, porque os dois sites usam o mesmo projeto do Firebase.
 */
export default function Conta() {
  const { conta, disponivel, entrar, criarConta, recuperarSenha, sair } = useConta();
  const [aba, setAba] = useState<Aba>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (conta) return <ContaConectada />;

  if (!disponivel) {
    return (
      <div className="rounded-2xl border border-atencao/40 bg-atencao-suave p-5">
        <p className="font-bold text-atencao">Área de conta indisponível aqui</p>
        <p className="mt-1.5 text-sm leading-relaxed text-texto">
          Esta prévia roda sem acesso à internet, e o login precisa falar com o servidor. Abra o
          site publicado para entrar ou criar sua conta — o resto da página funciona normalmente
          por aqui.
        </p>
      </div>
    );
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');
    setAviso('');
    setEnviando(true);

    try {
      if (aba === 'entrar') {
        await entrar(email, senha);
      } else if (aba === 'criar') {
        if (nome.trim().length < 2) throw { code: 'nome-curto' };
        await criarConta(nome, email, senha);
      } else {
        await recuperarSenha(email);
        setAviso('Enviamos um e-mail com o link para criar uma senha nova. Olhe a caixa de entrada e o spam.');
      }
    } catch (falha) {
      setErro(
        (falha as { code?: string })?.code === 'nome-curto'
          ? 'Escreva seu nome para a gente saber como te chamar.'
          : explicarFalha(falha),
      );
    } finally {
      setEnviando(false);
    }
  }

  const abas: { id: Aba; rotulo: string }[] = [
    { id: 'entrar', rotulo: 'Entrar' },
    { id: 'criar', rotulo: 'Criar conta' },
    { id: 'esqueci', rotulo: 'Esqueci a senha' },
  ];

  return (
    <div className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra)] sm:p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {abas.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setAba(item.id);
              setErro('');
              setAviso('');
            }}
            aria-pressed={aba === item.id}
            className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
              aba === item.id
                ? 'bg-marca text-marca-contraste'
                : 'border border-borda text-suave hover:text-marca'
            }`}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="space-y-3">
        {aba === 'criar' && (
          <Campo
            rotulo="Seu nome"
            tipo="text"
            valor={nome}
            aoMudar={setNome}
            dica="Como você quer ser chamado."
            autoComplete="name"
          />
        )}

        <Campo
          rotulo="E-mail"
          tipo="email"
          valor={email}
          aoMudar={setEmail}
          autoComplete="email"
        />

        {aba !== 'esqueci' && (
          <Campo
            rotulo="Senha"
            tipo="password"
            valor={senha}
            aoMudar={setSenha}
            dica={aba === 'criar' ? 'Pelo menos 6 caracteres.' : undefined}
            autoComplete={aba === 'criar' ? 'new-password' : 'current-password'}
          />
        )}

        {erro && (
          <p role="alert" className="rounded-lg bg-perigo-suave px-3 py-2.5 text-sm font-medium text-perigo">
            {erro}
          </p>
        )}
        {aviso && (
          <p className="rounded-lg bg-ok-suave px-3 py-2.5 text-sm font-medium text-ok">{aviso}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-marca px-5 py-3 font-bold text-marca-contraste transition-colors hover:bg-marca-forte disabled:opacity-60"
        >
          {enviando
            ? 'Aguarde…'
            : aba === 'entrar'
              ? 'Entrar'
              : aba === 'criar'
                ? 'Criar minha conta'
                : 'Enviar link de recuperação'}
        </button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-tenue">
        É a mesma conta da TECNOVA Digital: se você já tem login lá, entre com ele aqui. Guardamos
        seu nome e e-mail para identificar suas cotações — nada mais.
      </p>
    </div>
  );

  function ContaConectada() {
    return (
      <div className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra)] sm:p-6">
        <p className="etiqueta text-tenue">Conectado como</p>
        <p className="mt-1 text-xl font-extrabold text-texto">{conta!.nome ?? conta!.email}</p>
        <p className="text-sm text-suave">{conta!.email}</p>

        {conta!.admin && (
          <p className="mt-3 inline-block rounded-lg bg-marca-suave px-3 py-1.5 text-sm font-bold text-marca">
            Você é administrador
          </p>
        )}

        <button
          type="button"
          onClick={() => void sair()}
          className="mt-4 rounded-lg border border-borda px-4 py-2 text-sm font-bold text-suave transition-colors hover:border-perigo hover:text-perigo"
        >
          Sair da conta
        </button>
      </div>
    );
  }
}

function Campo({
  rotulo,
  tipo,
  valor,
  aoMudar,
  dica,
  autoComplete,
}: {
  rotulo: string;
  tipo: 'text' | 'email' | 'password';
  valor: string;
  aoMudar: (v: string) => void;
  dica?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-suave">{rotulo}</span>
      <input
        type={tipo}
        required
        value={valor}
        autoComplete={autoComplete}
        onChange={(e) => aoMudar(e.target.value)}
        className="w-full rounded-lg border border-borda bg-superficie px-3 py-2.5 text-texto"
      />
      {dica && <span className="mt-1 block text-xs text-tenue">{dica}</span>}
    </label>
  );
}
