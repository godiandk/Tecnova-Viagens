'use client';

import { useId, useMemo, useState, useSyncExternalStore } from 'react';
import {
  assinarCotacoes,
  type Cotacao,
  lerCotacoesNoServidor,
  lerCotacoesSnapshot,
  limparCotacoes,
  removerCotacao,
} from '@/lib/cotacoes';
import { moeda } from '@/lib/formato';
import { calcularRepasse, margemParaLucroAlvo, type TipoMargem } from '@/lib/revenda';

/**
 * Painel de revenda — área interna do operador.
 *
 * Parte do custo REAL (com bagagem e extras), não do preço anunciado: quem
 * revende precifica sobre o que vai gastar de fato. A taxa do meio de
 * pagamento entra na conta porque é ela que transforma "15% de margem" em
 * algo bem menor no fim do mês.
 */
export default function PainelRevenda() {
  const cotacoes = useSyncExternalStore(
    assinarCotacoes,
    lerCotacoesSnapshot,
    lerCotacoesNoServidor,
  );
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const [custoUnitario, setCustoUnitario] = useState(1200);
  const [passageiros, setPassageiros] = useState(1);
  const [tipoMargem, setTipoMargem] = useState<TipoMargem>('percentual');
  const [margem, setMargem] = useState(15);
  const [taxaCartao, setTaxaCartao] = useState(4.99);
  const [lucroAlvo, setLucroAlvo] = useState(150);
  const [copiado, setCopiado] = useState(false);

  const repasse = useMemo(
    () =>
      calcularRepasse({
        custoUnitarioBRL: custoUnitario,
        passageiros,
        tipoMargem,
        margem,
        taxaCartaoPercent: taxaCartao,
      }),
    [custoUnitario, passageiros, tipoMargem, margem, taxaCartao],
  );

  const margemSugerida = useMemo(
    () => margemParaLucroAlvo(custoUnitario, lucroAlvo, taxaCartao),
    [custoUnitario, lucroAlvo, taxaCartao],
  );

  const cotacaoAtiva = cotacoes.find((c) => c.id === selecionada);

  function usarCotacao(cotacao: Cotacao) {
    setSelecionada(cotacao.id);
    setCustoUnitario(cotacao.custoUnitarioBRL);
    setPassageiros(cotacao.passageiros);
  }

  const mensagem = [
    cotacaoAtiva ? `Passagem ${cotacaoAtiva.rota} — ${cotacaoAtiva.data}` : 'Passagem aérea',
    `${passageiros} ${passageiros === 1 ? 'passageiro' : 'passageiros'}`,
    `Valor por pessoa: ${moeda(repasse.precoUnitarioBRL)}`,
    `Total: ${moeda(repasse.precoTotalBRL)}`,
  ].join('\n');

  async function copiarMensagem() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-atencao/30 bg-atencao-suave px-4 py-3 text-sm text-atencao">
        <strong>Área interna.</strong> Estes valores são só para você. As cotações ficam salvas
        neste navegador e não são enviadas a lugar nenhum.
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ---- Calculadora ---- */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra)] sm:p-5">
            <h2 className="text-lg font-bold text-texto">Quanto cobrar</h2>
            <p className="mt-0.5 text-sm text-suave">
              {cotacaoAtiva
                ? `Usando a cotação ${cotacaoAtiva.rota} (${cotacaoAtiva.data}).`
                : 'Digite o custo ou escolha uma cotação salva ao lado.'}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo
                rotulo="Custo real por passageiro"
                dica="O que você paga, já com bagagem e extras."
                prefixo="R$"
                valor={custoUnitario}
                aoMudar={setCustoUnitario}
                passo={10}
              />
              <Campo
                rotulo="Quantos passageiros"
                valor={passageiros}
                aoMudar={(v) => setPassageiros(Math.max(1, Math.round(v)))}
                passo={1}
              />
            </div>

            <fieldset className="mt-4">
              <legend className="mb-1.5 text-sm font-semibold text-suave">Sua margem</legend>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-borda">
                  {(['percentual', 'fixo'] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoMargem(tipo)}
                      aria-pressed={tipoMargem === tipo}
                      className={`px-3 py-2 text-sm font-semibold transition ${
                        tipoMargem === tipo
                          ? 'bg-marca text-marca-contraste'
                          : 'bg-superficie text-suave'
                      }`}
                    >
                      {tipo === 'percentual' ? 'Porcentagem' : 'Valor fixo'}
                    </button>
                  ))}
                </div>

                <Campo
                  rotulo=""
                  compacto
                  prefixo={tipoMargem === 'percentual' ? '%' : 'R$'}
                  valor={margem}
                  aoMudar={setMargem}
                  passo={tipoMargem === 'percentual' ? 1 : 10}
                />
              </div>
            </fieldset>

            <div className="mt-4 sm:w-1/2">
              <Campo
                rotulo="Taxa do cartão / maquininha"
                dica="Percentual que o meio de pagamento retém."
                prefixo="%"
                valor={taxaCartao}
                aoMudar={setTaxaCartao}
                passo={0.5}
              />
            </div>
          </div>

          {/* ---- Resultado ---- */}
          <div
            className={`overflow-hidden rounded-2xl border shadow-[var(--sombra)] ${
              repasse.prejuizo ? 'border-perigo/40' : 'border-borda'
            }`}
          >
            <div className="grid gap-px bg-borda sm:grid-cols-2">
              <Destaque
                rotulo="Você cobra por passageiro"
                valor={moeda(repasse.precoUnitarioBRL)}
                enfase
              />
              <Destaque rotulo="Total a cobrar" valor={moeda(repasse.precoTotalBRL)} enfase />
            </div>

            <table className="w-full bg-superficie text-sm">
              <tbody>
                <Linha rotulo="Seu custo total" valor={moeda(repasse.custoTotalBRL)} />
                <Linha
                  rotulo={`Taxa do cartão (${taxaCartao}%)`}
                  valor={`− ${moeda(repasse.taxaCartaoBRL)}`}
                />
                <tr
                  className={`border-t border-borda font-bold ${
                    repasse.prejuizo ? 'bg-perigo-suave text-perigo' : 'bg-ok-suave text-ok'
                  }`}
                >
                  <td className="px-4 py-3">
                    {repasse.prejuizo ? 'Prejuízo nesta venda' : 'Seu lucro nesta venda'}
                  </td>
                  <td className="dado px-4 py-3 text-right">{moeda(repasse.lucroTotalBRL)}</td>
                </tr>
                <Linha
                  rotulo="Lucro por passageiro"
                  valor={moeda(repasse.lucroUnitarioBRL)}
                />
                <Linha
                  rotulo="Margem que sobra de verdade"
                  valor={`${repasse.margemEfetivaPercent}%`}
                />
              </tbody>
            </table>

            {repasse.prejuizo && (
              <p className="border-t border-borda bg-perigo-suave px-4 py-3 text-sm font-semibold text-perigo">
                Com essa margem, a taxa do cartão come todo o ganho e você paga para vender. Aumente
                a margem.
              </p>
            )}
          </div>

          {/* ---- Margem alvo ---- */}
          <div className="rounded-2xl border border-borda bg-superficie p-4 sm:p-5">
            <h3 className="font-bold text-texto">Quero ganhar um valor certo</h3>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <Campo
                rotulo="Lucro desejado por passageiro"
                prefixo="R$"
                valor={lucroAlvo}
                aoMudar={setLucroAlvo}
                passo={10}
              />
              <button
                type="button"
                onClick={() => {
                  setTipoMargem('percentual');
                  setMargem(margemSugerida);
                }}
                className="h-[42px] rounded-lg bg-marca px-4 font-bold text-marca-contraste transition hover:bg-marca-forte"
              >
                Aplicar {margemSugerida}%
              </button>
            </div>
            <p className="mt-2 text-sm text-suave">
              Para sobrar {moeda(lucroAlvo)} por passageiro depois da taxa de {taxaCartao}%, cobre{' '}
              <strong className="text-texto">{margemSugerida}%</strong> sobre o custo.
            </p>
          </div>

          {/* ---- Mensagem pro cliente ---- */}
          <div className="rounded-2xl border border-borda bg-superficie p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-texto">Mensagem para o cliente</h3>
              <button
                type="button"
                onClick={copiarMensagem}
                className="rounded-lg border border-borda px-3 py-1.5 text-sm font-semibold text-marca"
              >
                {copiado ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-superficie-2 p-3 text-sm text-texto">
              {mensagem}
            </pre>
          </div>
        </section>

        {/* ---- Cotações salvas ---- */}
        <aside className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-texto">Cotações salvas</h2>
            {cotacoes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  limparCotacoes();
                  setSelecionada(null);
                }}
                className="text-sm font-semibold text-suave underline underline-offset-2"
              >
                Limpar tudo
              </button>
            )}
          </div>

          {cotacoes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borda-forte bg-superficie p-4 text-sm text-suave">
              Nenhuma cotação ainda. Faça uma busca e clique em{' '}
              <strong className="text-texto">Salvar no painel</strong> na opção que interessar.
            </p>
          ) : (
            <ul className="space-y-2">
              {cotacoes.map((cotacao) => (
                <li key={cotacao.id}>
                  <div
                    className={`rounded-xl border bg-superficie p-3 transition ${
                      cotacao.id === selecionada ? 'border-marca' : 'border-borda'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => usarCotacao(cotacao)}
                      className="w-full text-left"
                    >
                      <span className="dado block font-bold text-texto">{cotacao.rota}</span>
                      <span className="block text-xs text-suave">
                        {cotacao.data} · {cotacao.companhias} · nota {cotacao.notaSeguranca}
                      </span>
                      <span className="dado mt-1 block text-sm text-texto">
                        {moeda(cotacao.custoUnitarioBRL)} por passageiro
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removerCotacao(cotacao.id);
                        if (selecionada === cotacao.id) setSelecionada(null);
                      }}
                      className="mt-2 text-xs font-semibold text-perigo"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function Campo({
  rotulo,
  dica,
  prefixo,
  valor,
  aoMudar,
  passo = 1,
  compacto = false,
}: {
  rotulo: string;
  dica?: string;
  prefixo?: string;
  valor: number;
  aoMudar: (valor: number) => void;
  passo?: number;
  compacto?: boolean;
}) {
  const id = useId();
  return (
    <div className={compacto ? 'w-32' : ''}>
      {rotulo && (
        <label htmlFor={id} className="mb-1 block text-sm font-semibold text-suave">
          {rotulo}
        </label>
      )}
      <div className="flex items-center gap-1.5 rounded-lg border border-borda bg-superficie px-3">
        {prefixo && <span className="text-sm text-tenue">{prefixo}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={passo}
          min={0}
          value={Number.isFinite(valor) ? valor : 0}
          onChange={(e) => aoMudar(Number(e.target.value))}
          className="dado w-full bg-transparent py-2.5 text-texto outline-none"
        />
      </div>
      {dica && <p className="mt-1 text-xs text-tenue">{dica}</p>}
    </div>
  );
}

function Destaque({
  rotulo,
  valor,
  enfase = false,
}: {
  rotulo: string;
  valor: string;
  enfase?: boolean;
}) {
  return (
    <div className={`p-4 ${enfase ? 'bg-marca text-marca-contraste' : 'bg-superficie'}`}>
      <p className="etiqueta opacity-80">{rotulo}</p>
      <p className="dado mt-1 text-2xl font-bold">{valor}</p>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <tr className="border-t border-borda text-suave first:border-t-0">
      <td className="px-4 py-2">{rotulo}</td>
      <td className="dado px-4 py-2 text-right">{valor}</td>
    </tr>
  );
}
