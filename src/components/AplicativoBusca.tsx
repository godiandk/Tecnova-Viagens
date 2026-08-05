'use client';

import { useCallback, useMemo, useState } from 'react';
import BalancaPrecoSeguranca from '@/components/BalancaPrecoSeguranca';
import CartaoResultado from '@/components/CartaoResultado';
import FormularioBusca from '@/components/FormularioBusca';
import { PESO_SEGURANCA_PADRAO } from '@/lib/config';
import { cotacaoDeResultado, salvarCotacao } from '@/lib/cotacoes';
import { dataPorExtenso, moeda } from '@/lib/formato';
import { montarResultados } from '@/lib/ranking';
import type { ParametrosBusca, RespostaBusca } from '@/lib/tipos';

function daquiADias(dias: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

const PARAMETROS_INICIAIS: ParametrosBusca = {
  origem: 'GRU',
  destino: 'LIS',
  ida: daquiADias(45),
  volta: daquiADias(59),
  passageiros: { adultos: 1, criancas: 0, bebes: 0 },
  pesoSeguranca: PESO_SEGURANCA_PADRAO,
  exigirBagagemDespachada: false,
  permitirBilhetesSeparados: true,
  maxParadas: 2,
  nacionalidade: 'BR',
};

/** Busca padrão: fala com a API do próprio site. */
async function buscarPelaApi(parametros: ParametrosBusca): Promise<RespostaBusca> {
  const requisicao = await fetch('/api/busca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parametros),
  });

  const corpo = await requisicao.json();
  if (!requisicao.ok) {
    throw new ErroDeBusca(corpo?.erros ?? ['Não foi possível completar a busca.']);
  }
  return corpo as RespostaBusca;
}

/** Erro que já carrega mensagens prontas para mostrar ao usuário. */
export class ErroDeBusca extends Error {
  constructor(public readonly mensagens: string[]) {
    super(mensagens.join(' '));
    this.name = 'ErroDeBusca';
  }
}

/**
 * `aoBuscar` existe para a versão do site que roda inteiramente no navegador,
 * sem servidor: lá a busca é resolvida em memória em vez de virar requisição.
 */
export default function AplicativoBusca({
  aoBuscar = buscarPelaApi,
}: {
  aoBuscar?: (parametros: ParametrosBusca) => Promise<RespostaBusca>;
}) {
  const [parametros, setParametros] = useState<ParametrosBusca>(PARAMETROS_INICIAIS);
  const [resposta, setResposta] = useState<RespostaBusca | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [trechoAtivo, setTrechoAtivo] = useState(0);

  const atualizar = useCallback((parcial: Partial<ParametrosBusca>) => {
    setParametros((atual) => {
      const proximo = { ...atual, ...parcial };
      // Bebê de colo precisa de um adulto: reduzir adultos precisa reduzir bebês.
      if (proximo.passageiros.bebes > proximo.passageiros.adultos) {
        proximo.passageiros = { ...proximo.passageiros, bebes: proximo.passageiros.adultos };
      }
      return proximo;
    });
  }, []);

  const buscar = useCallback(async () => {
    setCarregando(true);
    setErros([]);

    try {
      setResposta(await aoBuscar(parametros));
      setTrechoAtivo(0);
    } catch (erro) {
      setErros(
        erro instanceof ErroDeBusca
          ? erro.mensagens
          : ['Falha de conexão. Verifique sua internet e tente de novo.'],
      );
      setResposta(null);
    } finally {
      setCarregando(false);
    }
  }, [parametros, aoBuscar]);

  const trecho = resposta?.trechos[trechoAtivo];

  /**
   * Reordena localmente quando o usuário mexe na balança. Os itinerários já
   * estão no cliente; refazer o ranking aqui evita uma nova consulta ao
   * provedor a cada arrastada do controle.
   */
  const resultadosOrdenados = useMemo(() => {
    if (!trecho) return [];
    return montarResultados(
      trecho.resultados.map((r) => r.itinerario),
      { ...parametros, origem: trecho.origem, destino: trecho.destino },
    ).resultados;
  }, [trecho, parametros]);

  return (
    <div className="space-y-6">
      <FormularioBusca
        parametros={parametros}
        aoMudar={atualizar}
        aoEnviar={buscar}
        carregando={carregando}
      />

      {erros.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-perigo/30 bg-perigo-suave p-4 text-sm text-perigo"
        >
          <ul className="list-inside list-disc space-y-1">
            {erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      {carregando && (
        <div className="space-y-3" aria-live="polite">
          <p className="text-sm text-suave">Consultando ofertas e calculando o risco de cada uma…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-borda bg-superficie" />
          ))}
        </div>
      )}

      {resposta && !carregando && (
        <>
          {resposta.avisos.map((aviso) => (
            <p
              key={aviso}
              className="rounded-xl border border-atencao/30 bg-atencao-suave p-3 text-sm text-atencao"
            >
              {aviso}
            </p>
          ))}

          {resposta.trechos.length > 1 && (
            <div className="flex gap-2" role="tablist" aria-label="Sentido da viagem">
              {resposta.trechos.map((t, indice) => (
                <button
                  key={t.rotulo}
                  role="tab"
                  aria-selected={indice === trechoAtivo}
                  onClick={() => setTrechoAtivo(indice)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    indice === trechoAtivo
                      ? 'border-marca bg-marca text-marca-contraste'
                      : 'border-borda bg-superficie text-suave'
                  }`}
                >
                  {t.rotulo === 'ida' ? 'Ida' : 'Volta'} · {t.origem} → {t.destino}
                  <span className="ml-2 opacity-80">{dataPorExtenso(t.data)}</span>
                </button>
              ))}
            </div>
          )}

          <BalancaPrecoSeguranca
            peso={parametros.pesoSeguranca}
            aoMudar={(peso) => atualizar({ pesoSeguranca: peso })}
          />

          {trecho && resultadosOrdenados.length > 0 && (
            <p className="text-sm text-suave">
              {resultadosOrdenados.length}{' '}
              {resultadosOrdenados.length === 1 ? 'opção encontrada' : 'opções encontradas'} ·
              preço mediano {moeda(trecho.precoMedianoBRL)}
              {trecho.descartados > 0 && ` · ${trecho.descartados} ocultadas pelos seus filtros`}
            </p>
          )}

          <div className="space-y-4">
            {resultadosOrdenados.map((resultado) => (
              <CartaoResultado
                key={resultado.itinerario.id}
                resultado={resultado}
                simulado={resposta.simulado}
                volta={parametros.volta}
                aoSalvarCotacao={
                  trecho
                    ? (r) =>
                        salvarCotacao(
                          cotacaoDeResultado(
                            r,
                            trecho.data,
                            parametros.passageiros.adultos + parametros.passageiros.criancas,
                          ),
                        )
                    : undefined
                }
              />
            ))}
          </div>

          {trecho && resultadosOrdenados.length === 0 && (
            <div className="rounded-2xl border border-borda bg-superficie p-8 text-center">
              <p className="font-medium text-texto">Nenhuma opção sobrou com esses filtros.</p>
              <p className="mt-1 text-sm text-suave">
                Tente permitir mais paradas, aceitar bilhetes separados ou mudar a data.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
