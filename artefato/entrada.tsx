import { createRoot } from 'react-dom/client';
import AplicativoBusca, { ErroDeBusca } from '@/components/AplicativoBusca';
import { executarBusca } from '@/lib/busca';
import { criarProvedorSimulado } from '@/lib/provedores/simulado';
import { validarParametrosBusca } from '@/lib/validacao';
import PaginaEstatica from '@/components/PaginaEstatica';
import type { ParametrosBusca, RespostaBusca } from '@/lib/tipos';

/**
 * Ponto de entrada da versão publicada como página única.
 *
 * Não há servidor aqui: a mesma validação e o mesmo motor de risco do site
 * rodam no navegador, sobre o provedor simulado. É por isso que esta versão
 * só mostra preços de demonstração — e diz isso em letras garrafais.
 */
async function buscarLocalmente(parametros: ParametrosBusca): Promise<RespostaBusca> {
  const validacao = validarParametrosBusca(parametros);
  if (!validacao.ok) throw new ErroDeBusca(validacao.erros);

  // Uma pausa curta para o estado de carregamento não piscar de forma estranha.
  await new Promise((resolve) => setTimeout(resolve, 260));
  return executarBusca(validacao.valor, criarProvedorSimulado());
}

const elemento = document.getElementById('raiz');
if (elemento) {
  createRoot(elemento).render(
    <PaginaEstatica>
      <AplicativoBusca aoBuscar={buscarLocalmente} />
    </PaginaEstatica>,
  );
}
