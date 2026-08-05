import Marca from '@/components/Marca';

/**
 * Moldura das páginas internas (conta e painel).
 *
 * A página inicial carrega busca, destinos e central de buscas; estas aqui têm
 * uma tarefa só e não devem competir com isso por atenção.
 */
export default function PaginaSimples({
  etiqueta,
  titulo,
  resumo,
  children,
  hrefVoltar = '/',
}: {
  etiqueta: string;
  titulo: string;
  resumo: string;
  children: React.ReactNode;
  hrefVoltar?: string;
}) {
  return (
    <>
      <header className="border-b border-borda bg-superficie">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Marca />
          <a
            href={hrefVoltar}
            className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
          >
            Voltar à busca
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <p className="etiqueta mb-2 text-marca">{etiqueta}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">{titulo}</h1>
        <p className="mt-3 mb-7 text-lg text-suave">{resumo}</p>
        {children}
      </main>
    </>
  );
}
