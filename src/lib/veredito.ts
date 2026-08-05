import type { Resultado } from '@/lib/tipos';

/**
 * A frase que a pessoa lê primeiro.
 *
 * A nota de 0 a 100 é precisa, mas número não decide nada sozinho: alguém com
 * pressa ou pouca familiaridade precisa de uma frase que diga o que fazer.
 * O veredito responde "eu compro ou não?" antes de qualquer detalhe.
 */

export type Veredito = {
  /** Resposta curta, em letras grandes. */
  frase: string;
  /** Uma linha explicando de onde veio a resposta. */
  porque: string;
  /** Sinal de trânsito: nunca só cor, sempre acompanhado de palavra. */
  sinal: 'verde' | 'amarelo' | 'laranja' | 'vermelho';
};

export function darVeredito(resultado: Resultado): Veredito {
  const { seguranca, itinerario } = resultado;
  const separados = itinerario.bilhetes.length > 1;

  // O problema que mais pesou é o que explica a nota para quem só lê uma linha.
  const principal = [...seguranca.alertas].sort((a, b) => b.pontos - a.pontos)[0];

  if (seguranca.faixa === 'seguro') {
    return {
      frase: 'Pode comprar tranquilo',
      porque: separados
        ? 'Mesmo com mais de um bilhete, as folgas aqui são grandes.'
        : 'É uma passagem só, com tempo de sobra para tudo. Difícil dar errado.',
      sinal: 'verde',
    };
  }

  if (seguranca.faixa === 'aceitavel') {
    return {
      frase: 'Dá para comprar, mas se programe',
      porque: principal
        ? `Tem um ponto a observar: ${primeiraLetraMinuscula(principal.titulo)}.`
        : 'Nada grave, só detalhes para conferir antes de fechar.',
      sinal: 'amarelo',
    };
  }

  if (seguranca.faixa === 'arriscado') {
    return {
      frase: 'Cuidado com essa',
      porque: principal
        ? `Um imprevisto comum já derruba a viagem: ${primeiraLetraMinuscula(principal.titulo)}.`
        : 'Um imprevisto comum já derruba a viagem.',
      sinal: 'laranja',
    };
  }

  return {
    frase: 'Melhor não comprar essa',
    porque: separados
      ? 'São bilhetes separados e sem folga: se atrasar, o prejuízo é todo seu.'
      : 'A chance de dar errado é alta e você fica no prejuízo.',
    sinal: 'vermelho',
  };
}

function primeiraLetraMinuscula(texto: string): string {
  // Códigos de aeroporto e nomes próprios continuam maiúsculos.
  if (/^[A-Z]{2,}/.test(texto)) return texto;
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

export const CLASSES_SINAL: Record<Veredito['sinal'], string> = {
  verde: 'bg-ok-suave text-ok border-ok/30',
  amarelo: 'bg-atencao-suave text-atencao border-atencao/30',
  laranja: 'bg-risco-suave text-risco border-risco/30',
  vermelho: 'bg-perigo-suave text-perigo border-perigo/30',
};
