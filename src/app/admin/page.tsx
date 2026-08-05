import PainelAdmin from '@/components/PainelAdmin';
import PaginaSimples from '@/components/PaginaSimples';

export const metadata = { title: 'Painel do administrador — Tecnova Viagens' };

export default function PaginaAdmin() {
  return (
    <PaginaSimples
      etiqueta="Área restrita"
      titulo="Painel do administrador"
      resumo="Clientes cadastrados e cotações salvas. Só a conta de administrador enxerga esta página."
    >
      <PainelAdmin />
    </PaginaSimples>
  );
}
