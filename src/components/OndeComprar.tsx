import { buscarCompanhia } from '@/lib/dados/companhias';
import { buscadores, companhiasDoItinerario, type OpcaoCompra } from '@/lib/dados/compra';
import { dataLocal } from '@/lib/tempo';
import type { Itinerario } from '@/lib/tipos';

/**
 * O passo final: sair daqui e comprar.
 *
 * Os links levam a rota e as datas prontas, mas nunca o voo exato — nenhum
 * site aceita "abra este voo específico" por URL, e mesmo que aceitasse, o
 * preço muda entre a busca e a compra. Por isso o texto manda conferir em vez
 * de prometer: prometer o que não se controla é como a passagem barata vira
 * cilada.
 */
export default function OndeComprar({
  itinerario,
  simulado,
  volta,
}: {
  itinerario: Itinerario;
  /** Com dados simulados, o voo mostrado aqui não existe lá fora. */
  simulado: boolean;
  volta?: string;
}) {
  const codigos = itinerario.bilhetes.flatMap((b) => b.segmentos.map((s) => s.companhia));
  const daCompanhia = companhiasDoItinerario(codigos, (iata) => buscarCompanhia(iata).nome);
  const comparadores = buscadores(
    itinerario.origem,
    itinerario.destino,
    dataLocal(itinerario.partida),
    volta,
  );

  const separados = itinerario.bilhetes.length > 1;

  return (
    <section>
      <h4 className="etiqueta mb-2 text-tenue">Onde comprar</h4>

      {simulado ? (
        <p className="mb-3 rounded-lg border border-perigo/40 bg-perigo-suave px-3 py-2.5 text-sm text-perigo">
          <strong>Este voo específico não existe</strong> — é uma demonstração. Os botões abaixo
          abrem a busca de <strong>{itinerario.origem} → {itinerario.destino}</strong> na data
          escolhida, com voos de verdade. Use a análise desta página como lista de conferência.
        </p>
      ) : (
        <p className="mb-3 text-sm text-suave">
          Você sai daqui e finaliza a compra no site abaixo. Confira se o voo, o horário e o preço
          são os mesmos antes de pagar — preço de passagem muda a toda hora.
        </p>
      )}

      {separados && (
        <p className="mb-3 rounded-lg border border-perigo/40 bg-perigo-suave px-3 py-2.5 text-sm text-perigo">
          Atenção: são <strong>{itinerario.bilhetes.length} passagens separadas</strong>. Você vai
          precisar comprar cada uma por conta, e nenhuma cobre o atraso da outra.
        </p>
      )}

      {daCompanhia.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-sm font-bold text-ok">Melhor caminho — direto na companhia</p>
          <div className="flex flex-wrap gap-2">
            {daCompanhia.map((opcao) => (
              <BotaoCompra key={opcao.nome} opcao={opcao} destaque />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-suave">{daCompanhia[0].observacao}</p>
        </div>
      )}

      <p className="mb-1.5 text-sm font-bold text-texto">
        {daCompanhia.length > 0 ? 'Ou compare preços em:' : 'Compare preços em:'}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {comparadores.map((opcao) => (
          <li key={opcao.nome}>
            <BotaoCompra opcao={opcao} />
            {opcao.observacao && (
              <p className="mt-1 text-xs leading-relaxed text-suave">{opcao.observacao}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-tenue">
        Nenhum buscador é neutro: cada um mostra primeiro quem paga para aparecer, e por isso os
        preços divergem. Abrir dois ou três e comparar é o que evita pagar a mais.
      </p>
    </section>
  );
}

function BotaoCompra({ opcao, destaque = false }: { opcao: OpcaoCompra; destaque?: boolean }) {
  return (
    <a
      href={opcao.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
        destaque
          ? 'bg-marca text-marca-contraste hover:bg-marca-forte'
          : 'border border-borda-forte bg-superficie text-texto hover:border-marca hover:text-marca'
      }`}
    >
      {opcao.nome}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
