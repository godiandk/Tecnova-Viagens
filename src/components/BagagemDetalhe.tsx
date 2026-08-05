import { resumirBagagem } from '@/lib/bagagem';
import { moeda } from '@/lib/formato';
import type { Itinerario } from '@/lib/tipos';

/**
 * A bagagem apresentada como uma etiqueta de mala.
 *
 * Duas linhas, sempre nesta ordem: a mala que viaja com você e a mala que vai
 * embaixo do avião. Cada uma diz se está inclusa e, quando não está, quanto
 * custa — porque "bagagem não inclusa" sozinho não ajuda ninguém a decidir.
 */
export default function BagagemDetalhe({ itinerario }: { itinerario: Itinerario }) {
  const bagagem = resumirBagagem(itinerario);
  const primeiro = bagagem.porBilhete[0];

  return (
    <div className="overflow-hidden rounded-xl border border-borda bg-superficie">
      <div className="flex items-center justify-between gap-3 border-b border-borda bg-superficie-2 px-4 py-2">
        <span className="etiqueta text-suave">Bagagem</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            bagagem.tudoIncluso ? 'bg-ok-suave text-ok' : 'bg-atencao-suave text-atencao'
          }`}
        >
          {bagagem.tudoIncluso ? 'Tudo incluído' : `+ ${moeda(bagagem.custoTotalBRL)} para despachar`}
        </span>
      </div>

      <ul className="divide-y divide-borda">
        <ItemBagagem
          icone={<IconeMochila />}
          nome="Mala de mão"
          descricao={`A que vai com você dentro do avião, até ${primeiro.maoKg} kg.`}
          incluso
          valor="Já está no preço"
        />

        <ItemBagagem
          icone={<IconeMala />}
          nome="Mala grande (despachada)"
          descricao="A que você entrega no balcão e vai embaixo do avião."
          incluso={bagagem.tudoIncluso}
          valor={
            bagagem.tudoIncluso
              ? 'Já está no preço'
              : `Você paga mais ${moeda(bagagem.custoTotalBRL)}`
          }
        />
      </ul>

      {(bagagem.cobradaMaisDeUmaVez || bagagem.precisaRepegarMala) && (
        <div className="space-y-2 border-t border-borda bg-atencao-suave px-4 py-3 text-sm text-atencao">
          {bagagem.cobradaMaisDeUmaVez && (
            <p>
              <strong>Você paga a mala {bagagem.porBilhete.length} vezes.</strong> Como são
              passagens de empresas diferentes, cada uma cobra a sua. Por isso o valor acima é maior
              do que parece na hora de comprar.
            </p>
          )}
          {bagagem.precisaRepegarMala && (
            <p>
              <strong>Sua mala não vai direto até o destino.</strong> Na parada do meio você precisa
              pegar a mala na esteira e despachar de novo no balcão da outra empresa. Reserve tempo
              para isso.
            </p>
          )}
        </div>
      )}

      <p className="border-t border-borda px-4 py-2 text-xs text-tenue">
        Valor estimado com base no que as companhias costumam cobrar. Confirme no site da empresa
        antes de comprar.
      </p>
    </div>
  );
}

function ItemBagagem({
  icone,
  nome,
  descricao,
  incluso,
  valor,
}: {
  icone: React.ReactNode;
  nome: string;
  descricao: string;
  incluso: boolean;
  valor: string;
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-suave" aria-hidden="true">
        {icone}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-texto">{nome}</span>
        <span className="block text-sm text-suave">{descricao}</span>
      </span>

      <span
        className={`shrink-0 text-right text-sm font-bold ${incluso ? 'text-ok' : 'text-atencao'}`}
      >
        <span className="mr-1" aria-hidden="true">
          {incluso ? '✓' : '+'}
        </span>
        {valor}
      </span>
    </li>
  );
}

function IconeMochila() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 9V7a5 5 0 0 1 10 0v2M5 9h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Zm4 4h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeMala() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6m-11 0h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm5 3v8m6-8v8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
