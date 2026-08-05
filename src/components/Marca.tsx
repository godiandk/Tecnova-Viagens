/**
 * Assinatura da marca: escudo (a análise de risco) com a silhueta de uma
 * cauda de avião. Usada no cabeçalho das duas áreas do site.
 */
export default function Marca() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--marca)" />
        <path
          d="M16 6l8 3.5v6c0 4.8-3.4 9-8 10.5-4.6-1.5-8-5.7-8-10.5v-6L16 6z"
          fill="none"
          stroke="var(--marca-contraste)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M11.9 16.2l2.8 2.8 5.4-5.7"
          fill="none"
          stroke="var(--marca-contraste)"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-extrabold tracking-tight text-texto">Tecnova Viagens</span>
    </span>
  );
}
