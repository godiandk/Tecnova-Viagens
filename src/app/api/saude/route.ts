import { AEROPORTOS } from '@/lib/dados/aeroportos';
import { selecionarProvedor } from '@/lib/provedores';

export const dynamic = 'force-dynamic';

/** Sonda de saúde: confirma que a app subiu e qual fonte de dados está ativa. */
export async function GET() {
  const provedor = selecionarProvedor();

  return Response.json(
    {
      status: 'ok',
      provedor: provedor.nome,
      precosSimulados: provedor.simulado,
      aeroportosCatalogados: AEROPORTOS.length,
      versao: process.env.npm_package_version ?? 'dev',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
