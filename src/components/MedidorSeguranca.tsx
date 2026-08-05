import { CLASSES_FAIXA, COR_FAIXA, ROTULO_FAIXA } from '@/lib/formato';
import type { FaixaSeguranca } from '@/lib/tipos';

/**
 * Anel de progresso com o score de segurança.
 *
 * O número vem sempre acompanhado do rótulo da faixa: cor sozinha não comunica
 * — não funciona para quem não distingue cores, nem impresso em preto e branco,
 * nem para quem simplesmente não sabe se verde é muito ou pouco.
 */
export default function MedidorSeguranca({
  score,
  faixa,
  tamanho = 92,
}: {
  score: number;
  faixa: FaixaSeguranca;
  tamanho?: number;
}) {
  const espessura = 8;
  const raio = (tamanho - espessura - 2) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (Math.max(0, Math.min(100, score)) / 100) * circunferencia;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: tamanho, height: tamanho }}>
        <svg
          width={tamanho}
          height={tamanho}
          viewBox={`0 0 ${tamanho} ${tamanho}`}
          role="img"
          aria-label={`Nota de segurança ${score} de 100: ${ROTULO_FAIXA[faixa]}`}
        >
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke="var(--borda)"
            strokeWidth={espessura}
          />
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={COR_FAIXA[faixa]}
            strokeWidth={espessura}
            strokeLinecap="round"
            strokeDasharray={`${preenchido} ${circunferencia}`}
            transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="dado text-2xl font-bold leading-none text-texto">{score}</span>
          <span className="mt-0.5 text-[10px] text-tenue">de 100</span>
        </div>
      </div>

      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${CLASSES_FAIXA[faixa]}`}>
        {ROTULO_FAIXA[faixa]}
      </span>
    </div>
  );
}
