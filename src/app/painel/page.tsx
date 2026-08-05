import Link from 'next/link';
import Marca from '@/components/Marca';
import PainelRevenda from '@/components/PainelRevenda';

export const metadata = {
  title: 'Painel de revenda — Tecnova Viagens',
  // Área interna: não faz sentido em buscador.
  robots: { index: false, follow: false },
};

export default function PaginaPainel() {
  return (
    <>
      <header className="border-b border-borda bg-superficie">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Marca />
          <Link
            href="/"
            className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
          >
            Voltar à busca
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 max-w-2xl">
          <p className="etiqueta mb-2 text-marca">Área interna</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
            Painel de revenda
          </h1>
          <p className="mt-3 text-lg text-suave">
            Calcule quanto cobrar do cliente partindo do custo real da passagem — o que você gasta
            de verdade, com bagagem e extras — e veja o que sobra depois da taxa do cartão.
          </p>
        </div>

        <PainelRevenda />
      </main>

      <footer className="border-t border-borda bg-superficie">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed text-tenue sm:px-6">
          Os valores deste painel são estimativas de custo, não cotações firmes. Para revender
          passagens no Brasil é preciso estar regularizado como agência ou operar sob uma
          consolidadora credenciada — confirme as exigências antes de vender.
        </div>
      </footer>
    </>
  );
}
