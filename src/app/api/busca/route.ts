import { executarBusca } from '@/lib/busca';
import { identificarCliente, verificarLimite } from '@/lib/limitador';
import { validarParametrosBusca } from '@/lib/validacao';

/** A busca depende de credenciais em runtime, então nunca é pré-renderizada. */
export const dynamic = 'force-dynamic';

export async function POST(requisicao: Request) {
  const limite = verificarLimite(`busca:${identificarCliente(requisicao.headers)}`);
  if (!limite.permitido) {
    return Response.json(
      {
        erros: [
          `Muitas buscas seguidas. Tente de novo em ${limite.reiniciaEmSegundos} segundos.`,
        ],
      },
      { status: 429, headers: { 'Retry-After': String(limite.reiniciaEmSegundos) } },
    );
  }

  let corpo: unknown;
  try {
    corpo = await requisicao.json();
  } catch {
    return Response.json({ erros: ['Corpo da requisição não é um JSON válido.'] }, { status: 400 });
  }

  const validacao = validarParametrosBusca(corpo);
  if (!validacao.ok) {
    return Response.json({ erros: validacao.erros }, { status: 400 });
  }

  try {
    const resposta = await executarBusca(validacao.valor);
    return Response.json(resposta, {
      headers: { 'Cache-Control': 'no-store', 'X-RateLimit-Remaining': String(limite.restantes) },
    });
  } catch (erro) {
    // O detalhe vai para o log do servidor; o cliente recebe algo acionável.
    console.error('Falha na busca:', erro);
    return Response.json(
      { erros: ['Não conseguimos completar a busca agora. Tente novamente em instantes.'] },
      { status: 502 },
    );
  }
}
