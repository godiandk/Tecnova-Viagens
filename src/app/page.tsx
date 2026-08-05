import AplicativoBusca from '@/components/AplicativoBusca';
import PaginaEstatica from '@/components/PaginaEstatica';
import { selecionarProvedor } from '@/lib/provedores';

/**
 * A página lê o provedor a cada requisição porque a resposta depende das
 * credenciais no ambiente: sem elas o site cai no gerador de demonstração e
 * precisa dizer isso em vermelho; com elas, o aviso muda de tom.
 */
export const dynamic = 'force-dynamic';

export default function Pagina() {
  const provedor = selecionarProvedor();

  return (
    <PaginaEstatica simulado={provedor.simulado} provedor={provedor.nome}>
      <AplicativoBusca />
    </PaginaEstatica>
  );
}
