import AplicativoBusca from '@/components/AplicativoBusca';

const COMO_FUNCIONA = [
  {
    titulo: 'Lê o itinerário inteiro',
    texto:
      'Cada voo, cada conexão, quem vende cada bilhete e o que a tarifa permite. É aí que mora ' +
      'a diferença entre uma passagem barata e uma armadilha barata.',
  },
  {
    titulo: 'Compara com o mínimo viável',
    texto:
      'Conexão de 35 minutos em voo internacional não é oferta, é aposta. Comparamos o tempo ' +
      'disponível com o mínimo real para aquele tipo de conexão.',
  },
  {
    titulo: 'Mostra o preço de verdade',
    texto:
      'Bagagem, traslado, pernoite e o custo médio de quando dá errado entram na conta. ' +
      'A passagem de R$ 900 às vezes é mais cara que a de R$ 1.200.',
  },
];

export default function Pagina() {
  return (
    <>
      <header className="border-b border-borda bg-superficie">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-marca text-sm font-bold text-white"
              aria-hidden="true"
            >
              TV
            </span>
            <span className="text-lg font-bold tracking-tight text-texto">Tecnova Viagens</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-texto sm:text-4xl">
            Passagem barata sem cair em cilada
          </h1>
          <p className="mt-3 text-lg text-suave">
            A maioria dos buscadores ordena por preço e deixa o risco escondido nas letras miúdas.
            Aqui cada opção vem com uma nota de segurança e o custo real estimado — você escolhe
            quanto risco aceita correr para economizar.
          </p>
        </div>

        <AplicativoBusca />

        <section className="mt-14">
          <h2 className="text-xl font-bold text-texto">Como a nota de segurança é calculada</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {COMO_FUNCIONA.map((item) => (
              <div key={item.titulo} className="rounded-xl border border-borda bg-superficie p-4">
                <h3 className="font-semibold text-texto">{item.titulo}</h3>
                <p className="mt-1.5 text-sm text-suave">{item.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-borda bg-superficie">
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs text-suave sm:px-6">
          <p>
            <strong className="text-texto">Tecnova Viagens</strong> é uma ferramenta de análise, não
            uma agência: não vendemos passagens e não emitimos bilhetes.
          </p>
          <p>
            As notas de segurança e os custos estimados são estimativas baseadas em regras públicas
            e em premissas documentadas no repositório. Regras de visto e condições tarifárias mudam
            sem aviso — confirme sempre na companhia aérea e na fonte oficial antes de comprar.
          </p>
        </div>
      </footer>
    </>
  );
}
