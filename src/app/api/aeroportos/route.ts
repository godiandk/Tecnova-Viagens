import { pesquisarAeroportos } from '@/lib/dados/aeroportos';

export async function GET(requisicao: Request) {
  const termo = new URL(requisicao.url).searchParams.get('q') ?? '';
  const aeroportos = pesquisarAeroportos(termo);

  return Response.json(
    { aeroportos },
    // O catálogo é estático: vale cachear na borda por bastante tempo.
    { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } },
  );
}
