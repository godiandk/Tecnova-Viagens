import Marca from '@/components/Marca';
import SeletorIdioma from '@/components/SeletorIdioma';

/**
 * Guia de leitura: a página é usada por gente que nunca comprou passagem
 * sozinha. A ordem aqui é real — são os três passos, nesta sequência —, então
 * a numeração carrega informação em vez de enfeitar.
 */
const PASSOS = [
  {
    titulo: 'Diga para onde você vai',
    texto: 'Escreva a cidade de saída e a de chegada, e as datas. Depois clique em Buscar.',
  },
  {
    titulo: 'Escolha o que importa mais',
    texto:
      'Arraste a barrinha. Puxe para a esquerda se você quer o mais barato. Puxe para a direita ' +
      'se você quer o mais tranquilo. A lista se reorganiza sozinha.',
  },
  {
    titulo: 'Leia a frase colorida',
    texto:
      'Cada opção começa com uma frase que já diz se pode comprar ou não. Verde é tranquilo, ' +
      'amarelo é ficar atento, laranja é cuidado, vermelho é não comprar.',
  },
];

const GLOSSARIO = [
  {
    termo: 'Conexão (ou escala)',
    texto:
      'Quando o avião não vai direto. Você desce em uma cidade no meio do caminho e pega outro ' +
      'avião para continuar a viagem.',
  },
  {
    termo: 'Passagens separadas',
    texto:
      'Quando a viagem é vendida como duas compras diferentes em vez de uma só. É mais barato, ' +
      'mas se você perder o segundo avião, ninguém precisa te ajudar: você compra outra passagem.',
  },
  {
    termo: 'Despachar a mala',
    texto:
      'Entregar a mala grande no balcão do aeroporto. Ela viaja embaixo do avião e você pega na ' +
      'esteira quando chegar. Quase sempre é cobrado à parte.',
  },
  {
    termo: 'Remarcar',
    texto:
      'Mudar a data da viagem depois de já ter comprado. Nem toda passagem deixa, e algumas ' +
      'cobram quase o preço de uma passagem nova.',
  },
  {
    termo: 'Visto de trânsito',
    texto:
      'Autorização para passar por um país mesmo sem sair do aeroporto. Alguns países exigem. ' +
      'Sem ela, você é barrado antes de embarcar.',
  },
  {
    termo: 'Nota de segurança',
    texto:
      'Um número de 0 a 100 que criamos para dizer o quanto a viagem tem chance de sair como o ' +
      'planejado. Quanto maior, mais tranquilo.',
  },
];

export default function PaginaEstatica({
  children,
  hrefPainel = '/painel',
}: {
  children: React.ReactNode;
  /** A versão de página única navega por hash, já que não existem rotas lá. */
  hrefPainel?: string;
}) {
  return (
    <>
      <header className="border-b border-borda bg-superficie">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Marca />
          <div className="flex items-center gap-2">
            <SeletorIdioma />
            <a
            href={hrefPainel}
            className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-suave transition-colors hover:text-marca"
          >
              Painel de revenda
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-10 max-w-3xl">
          <p className="etiqueta mb-3 text-marca">Comparador de passagens</p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-texto sm:text-5xl">
            A passagem mais barata nem sempre é a mais barata.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-suave">
            Existe um motivo para uma passagem custar metade da outra: conexão de 30 minutos, mala
            cobrada à parte, duas passagens separadas que ninguém garante. Aqui a gente mostra tudo
            isso <strong className="text-texto">antes</strong> de você comprar — e diz, em uma
            frase, se vale a pena.
          </p>
        </div>

        {/* ---- Como usar ---- */}
        <section aria-labelledby="como-usar" className="mb-10">
          <h2 id="como-usar" className="etiqueta mb-4 text-suave">
            Como usar esta página
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {PASSOS.map((passo, indice) => (
              <li
                key={passo.titulo}
                className="rounded-xl border border-borda bg-superficie p-4 shadow-[var(--sombra)]"
              >
                <span className="dado mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-marca text-sm font-bold text-marca-contraste">
                  {indice + 1}
                </span>
                <h3 className="font-bold text-texto">{passo.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-suave">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {children}

        {/* ---- Glossário ---- */}
        <section aria-labelledby="glossario" className="mt-16">
          <h2 id="glossario" className="text-2xl font-extrabold text-texto">
            O que cada palavra quer dizer
          </h2>
          <p className="mt-1.5 text-suave">
            Sem enrolação. Se apareceu uma palavra que você não conhece, ela está aqui.
          </p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {GLOSSARIO.map((item) => (
              <div key={item.termo} className="rounded-xl border border-borda bg-superficie p-4">
                <dt className="font-bold text-texto">{item.termo}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-suave">{item.texto}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t border-borda bg-superficie">
        <div className="mx-auto max-w-5xl space-y-2.5 px-4 py-8 text-xs leading-relaxed text-tenue sm:px-6">
          <p>
            <strong className="text-suave">Tecnova Viagens</strong> é uma ferramenta de comparação.
            Não vendemos passagens e não emitimos bilhetes: a compra é sempre feita na companhia
            aérea ou na agência.
          </p>
          <p>
            As notas de segurança e os valores de bagagem, traslado e imprevisto são{' '}
            <strong className="text-suave">estimativas</strong> calculadas a partir de regras
            públicas e premissas documentadas no repositório. Regras de visto e condições de tarifa
            mudam sem aviso — confirme na companhia aérea e na fonte oficial antes de comprar.
          </p>
        </div>
      </footer>
    </>
  );
}
