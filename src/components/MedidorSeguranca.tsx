import { CLASSES_FAIXA, ROTULO_FAIXA } from '@/lib/formato';
import type { FaixaSeguranca } from '@/lib/tipos';

const CORES: Record<FaixaSeguranca, string> = {
  seguro: 'var(--seguro)',
  aceitavel: 'var(--atencao)',
  arriscado: 'var(--risco)',
  evitar: 'var(--perigo)',
};

/**
 * Anel de progresso com o score de segurança.
 *
 * O número vem acompanhado do rótulo da faixa porque cor sozinha não comunica:
 * não funciona para quem não distingue as cores nem em impressão em preto e branco.
 */
export default function MedidorSeguranca({
  score,
  faixa,
  tamanho = 84,
}: {
  score: number;
  faixa: FaixaSeguranca;
  tamanho?: number;
}) {
  const raio = (tamanho - 10) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (Math.max(0, Math.min(100, score)) / 100) * circunferencia;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: tamanho, height: tamanho }}>
        <svg
          width={tamanho}
          height={tamanho}
          viewBox={`0 0 ${tamanho} ${tamanho}`}
          role="img"
          aria-label={`Segurança ${score} de 100: ${ROTULO_FAIXA[faixa]}`}
        >
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke="var(--borda)"
            strokeWidth="7"
          />
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={CORES[faixa]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${preenchido} ${circunferencia}`}
            transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none text-texto">{score}</span>
          <span className="text-[10px] uppercase tracking-wide text-suave">de 100</span>
        </div>
      </div>

      <span
        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${CLASSES_FAIXA[faixa]}`}
      >
        {ROTULO_FAIXA[faixa]}
      </span>
    </div>
  );
}
