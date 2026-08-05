import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AplicativoBusca, { ErroDeBusca } from '@/components/AplicativoBusca';
import Marca from '@/components/Marca';
import PaginaEstatica from '@/components/PaginaEstatica';
import PainelRevenda from '@/components/PainelRevenda';
import SeletorIdioma from '@/components/SeletorIdioma';
import { executarBusca } from '@/lib/busca';
import { criarProvedorSimulado } from '@/lib/provedores/simulado';
import { validarParametrosBusca } from '@/lib/validacao';
import { ProvedorIdioma } from '@/lib/i18n/contexto';
import type { ParametrosBusca, RespostaBusca } from '@/lib/tipos';

/**
 * Ponto de entrada da versão publicada como página única.
 *
 * Não há servidor aqui: a mesma validação e o mesmo motor de risco do site
 * rodam no navegador, sobre o provedor simulado. É por isso que esta versão
 * só mostra preços de demonstração — e diz isso em destaque.
 */
async function buscarLocalmente(parametros: ParametrosBusca): Promise<RespostaBusca> {
  const validacao = validarParametrosBusca(parametros);
  if (!validacao.ok) throw new ErroDeBusca(validacao.erros);

  // Uma pausa curta evita que o estado de carregamento pisque de forma estranha.
  await new Promise((resolve) => setTimeout(resolve, 260));
  return executarBusca(validacao.valor, criarProvedorSimulado());
}

/**
 * Sem servidor não há rotas, então a navegação vive no hash da URL. Isso
 * mantém o link compartilhável e faz o botão "voltar" do navegador funcionar.
 */
function Aplicativo() {
  const [tela, setTela] = useState(() =>
    window.location.hash === '#painel' ? 'painel' : 'busca',
  );

  useEffect(() => {
    const aoTrocar = () =>
      setTela(window.location.hash === '#painel' ? 'painel' : 'busca');
    window.addEventListener('hashchange', aoTrocar);
    return () => window.removeEventListener('hashchange', aoTrocar);
  }, []);

  if (tela === 'painel') {
    return (
      <>
        <header className="border-b border-borda bg-superficie">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <Marca />
            <div className="flex items-center gap-2">
              <SeletorIdioma />
              <a
              href="#busca"
              className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
            >
                Voltar à busca
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 max-w-2xl">
            <p className="etiqueta mb-2 text-marca">Área interna</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
              Painel de revenda
            </h1>
            <p className="mt-3 text-lg text-suave">
              Calcule quanto cobrar do cliente partindo do custo real da passagem — o que você
              gasta de verdade, com bagagem e extras — e veja o que sobra depois da taxa do cartão.
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

  return (
    <PaginaEstatica hrefPainel="#painel">
      <AplicativoBusca aoBuscar={buscarLocalmente} />
    </PaginaEstatica>
  );
}

const elemento = document.getElementById('raiz');
if (elemento) {
  createRoot(elemento).render(
    <ProvedorIdioma>
      <Aplicativo />
    </ProvedorIdioma>,
  );
}
