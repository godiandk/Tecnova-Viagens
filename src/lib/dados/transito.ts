import type { NivelAlerta } from '@/lib/tipos';

/**
 * Regras de visto de trânsito por país de conexão.
 *
 * Conectar em um país pode exigir visto mesmo sem sair do aeroporto. É o erro
 * mais caro que uma busca por preço comete: a passagem é barata, o passageiro
 * é barrado no embarque e perde tudo.
 *
 * IMPORTANTE: esta tabela é um AVISO, não uma consultoria. Regras mudam sem
 * anúncio e dependem de vistos que o passageiro já tenha, do tipo de conexão
 * (mesma área restrita ou re-check-in) e do passaporte. Sempre confirme na
 * fonte oficial — o link vai junto em cada alerta.
 */
export type RegraTransito = {
  /** País da conexão (ISO 3166-1 alfa-2). */
  paisIso: string;
  pais: string;
  /** Nacionalidades afetadas. '*' vale para qualquer passaporte. */
  nacionalidades: string[];
  nivel: NivelAlerta;
  titulo: string;
  detalhe: string;
  fonte: string;
};

export const REGRAS_TRANSITO: RegraTransito[] = [
  {
    paisIso: 'US',
    pais: 'Estados Unidos',
    nacionalidades: ['BR'],
    nivel: 'critico',
    titulo: 'Conexão nos EUA exige visto americano',
    detalhe:
      'Os EUA não têm trânsito sem visto. Mesmo só trocando de avião e sem sair do aeroporto, ' +
      'é preciso visto de trânsito (C-1) ou de turismo (B1/B2) válido. Sem ele, a companhia ' +
      'nega o embarque no Brasil e a passagem é perdida.',
    fonte: 'https://br.usembassy.gov/pt/vistos/',
  },
  {
    paisIso: 'CA',
    pais: 'Canadá',
    nacionalidades: ['BR'],
    nivel: 'alto',
    titulo: 'Conexão no Canadá exige eTA ou visto',
    detalhe:
      'Trânsito aéreo pelo Canadá exige autorização prévia. Brasileiros podem se qualificar ' +
      'para a eTA (mais simples) em algumas condições; fora delas, é necessário visto de ' +
      'visitante. Confirme antes de comprar.',
    fonte: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html',
  },
  {
    paisIso: 'AU',
    pais: 'Austrália',
    nacionalidades: ['BR'],
    nivel: 'alto',
    titulo: 'Conexão na Austrália exige visto',
    detalhe:
      'A Austrália normalmente exige visto de trânsito mesmo para quem apenas troca de voo. ' +
      'Verifique qual subclasse se aplica ao seu caso.',
    fonte: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/transit-771',
  },
  {
    paisIso: 'GB',
    pais: 'Reino Unido',
    nacionalidades: ['BR'],
    nivel: 'baixo',
    titulo: 'Conexão no Reino Unido: confira as regras de trânsito',
    detalhe:
      'Brasileiros costumam poder transitar sem visto quando permanecem na área restrita e não ' +
      'passam pelo controle de fronteira. Se a conexão exige retirar a bagagem, trocar de ' +
      'aeroporto ou passar pela imigração, as regras mudam e pode ser exigida autorização.',
    fonte: 'https://www.gov.uk/transit-visa',
  },
  {
    paisIso: 'ZA',
    pais: 'África do Sul',
    nacionalidades: ['BR'],
    nivel: 'baixo',
    titulo: 'Conexão na África do Sul: confira se há troca de terminal',
    detalhe:
      'O trânsito internacional direto normalmente dispensa visto, mas conexões que passam pela ' +
      'imigração exigem verificação prévia.',
    fonte: 'http://www.dha.gov.za/index.php/immigration-services/types-of-visa',
  },
];

/**
 * Devolve as regras aplicáveis a um país de conexão para uma nacionalidade.
 * Comparações são case-insensitive e aceitam a curinga '*'.
 */
export function regrasParaConexao(paisIso: string, nacionalidade: string): RegraTransito[] {
  const pais = paisIso.toUpperCase();
  const nac = nacionalidade.toUpperCase();
  return REGRAS_TRANSITO.filter(
    (r) =>
      r.paisIso === pais &&
      (r.nacionalidades.includes('*') || r.nacionalidades.map((n) => n.toUpperCase()).includes(nac)),
  );
}
