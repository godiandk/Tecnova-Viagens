/**
 * Aviso permanente de que os dados não são reais.
 *
 * Existe porque um usuário chegou a montar a viagem do sogro aqui e procurou o
 * botão de comprar. O rodapé já dizia que era demonstração, e não bastou: um
 * aviso que só aparece depois da busca, em letra pequena, chega tarde demais.
 * Este fica antes de tudo, em vermelho, e diz para onde ir de verdade — porque
 * apontar o erro sem apontar a saída não resolve o problema de ninguém.
 */
const ONDE_COMPRAR = [
  { nome: 'LATAM', url: 'https://www.latamairlines.com/br/pt' },
  { nome: 'GOL', url: 'https://www.voegol.com.br' },
  { nome: 'Azul', url: 'https://www.voeazul.com.br' },
  { nome: 'TAP', url: 'https://www.flytap.com/pt-br' },
];

/**
 * Com preços reais o texto muda de tom, e isso não é detalhe.
 *
 * Um alarme vermelho dizendo "os preços são inventados" em cima de preços
 * verdadeiros seria pior do que não ter aviso nenhum: ensina a pessoa a passar
 * o olho por cima de qualquer aviso do site, inclusive os que importam.
 */
export default function AvisoDemonstracao({
  simulado = true,
  provedor = 'simulado',
}: {
  simulado?: boolean;
  /** Nome do provedor ativo: distingue "inventado" de "real porém defasado". */
  provedor?: string;
}) {
  if (!simulado) return <AvisoPrecosReais />;
  // Amadeus em ambiente de teste devolve voos que existem com preços velhos:
  // chamar isso de "inventado" seria tão errado quanto chamar de confiável.
  if (provedor !== 'simulado') return <AvisoAmbienteDeTeste />;

  return (
    <aside
      role="alert"
      className="mb-8 overflow-hidden rounded-2xl border-2 border-perigo/50 bg-perigo-suave"
    >
      <div className="border-b border-perigo/30 px-4 py-3 sm:px-5">
        <p className="flex items-center gap-2 text-lg font-extrabold text-perigo">
          <span aria-hidden="true">⚠️</span>
          Este site não vende passagens
        </p>
      </div>

      <div className="space-y-3 px-4 py-4 text-sm leading-relaxed text-texto sm:px-5">
        <p>
          Os voos, horários e preços que aparecem aqui são{' '}
          <strong className="text-perigo">inventados por computador</strong>, só para demonstrar
          como a análise de risco funciona. Esses voos <strong>não existem</strong> e nenhuma
          passagem é emitida. Não coloque dados de ninguém aqui achando que vai comprar.
        </p>

        <div>
          <p className="font-bold text-texto">Para comprar de verdade, vá direto na companhia:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ONDE_COMPRAR.map((empresa) => (
              <li key={empresa.nome}>
                <a
                  href={empresa.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border border-borda-forte bg-superficie px-3 py-1.5 font-bold text-marca"
                >
                  {empresa.nome} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-suave">
            Comprar direto na companhia é o caminho mais seguro: se der problema, você resolve com
            quem opera o voo, sem intermediário no meio.
          </p>
        </div>

        <p className="rounded-lg bg-superficie/70 px-3 py-2.5">
          <strong>Para que serve isto aqui, então:</strong> como uma lista de conferência. Antes de
          fechar a compra no site da companhia, confira as mesmas coisas que a gente checa — se é{' '}
          <strong>uma passagem só</strong> ou duas separadas, se a <strong>conexão</strong> tem
          tempo suficiente, se a <strong>mala</strong> está inclusa e se dá para{' '}
          <strong>mudar a data</strong>.
        </p>
      </div>
    </aside>
  );
}

/**
 * Versão para quando os preços vêm de um provedor real.
 *
 * Continua avisando que a compra acontece em outro lugar — isso não muda com
 * dado real —, mas em tom de informação e não de alarme, e lembrando que
 * preço de passagem muda entre a busca e o pagamento.
 */
function AvisoPrecosReais() {
  return (
    <aside className="mb-8 rounded-2xl border border-marca/30 bg-marca-suave px-4 py-3.5 sm:px-5">
      <p className="font-bold text-texto">
        Comparamos e analisamos — a compra é feita no site da companhia
      </p>
      <p className="mt-1 text-sm leading-relaxed text-suave">
        Os preços aqui vêm de uma fonte real, mas mudam a toda hora e não ficam reservados. Ao
        clicar em comprar você vai para a companhia ou para a agência, e é lá que confere o valor
        final antes de pagar.
      </p>
    </aside>
  );
}

/**
 * Provedor real, mas em ambiente de teste.
 *
 * Os voos existem e os horários batem; os preços vêm de uma base congelada e
 * o inventário é parcial. Serve para conferir se a integração funciona, não
 * para decidir uma compra.
 */
function AvisoAmbienteDeTeste() {
  return (
    <aside
      role="alert"
      className="mb-8 rounded-2xl border-2 border-atencao/50 bg-atencao-suave px-4 py-3.5 sm:px-5"
    >
      <p className="flex items-center gap-2 font-extrabold text-atencao">
        <span aria-hidden="true">⚠️</span>
        Preços de teste — não use para comprar
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-texto">
        Os voos e horários são reais, mas os <strong>preços vêm de uma base de testes</strong> e
        estão defasados. Nem todas as companhias aparecem. Confira o valor de verdade no site da
        companhia antes de decidir qualquer coisa.
      </p>
    </aside>
  );
}
