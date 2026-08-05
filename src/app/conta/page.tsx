import Conta from '@/components/Conta';
import PaginaSimples from '@/components/PaginaSimples';

export const metadata = { title: 'Sua conta — Tecnova Viagens' };

export default function PaginaConta() {
  return (
    <PaginaSimples
      etiqueta="Sua conta"
      titulo="Entrar ou criar conta"
      resumo="Com conta você guarda as passagens que pesquisou e volta nelas depois, de qualquer aparelho."
    >
      <Conta />
    </PaginaSimples>
  );
}
