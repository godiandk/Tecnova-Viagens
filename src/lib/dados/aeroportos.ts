import type { Aeroporto } from '@/lib/tipos';

/**
 * Aeroportos atendidos pela busca. `areaMetropolitana` agrupa aeroportos da
 * mesma região: se uma conexão chega em um e sai de outro do mesmo grupo,
 * o passageiro precisa atravessar a cidade por conta própria.
 */
export const AEROPORTOS: Aeroporto[] = [
  // ---------- Brasil ----------
  { iata: 'GRU', nome: 'Guarulhos', cidade: 'São Paulo', uf: 'SP', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'SAO' },
  { iata: 'CGH', nome: 'Congonhas', cidade: 'São Paulo', uf: 'SP', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'SAO' },
  { iata: 'VCP', nome: 'Viracopos', cidade: 'Campinas', uf: 'SP', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'SAO' },
  { iata: 'GIG', nome: 'Galeão', cidade: 'Rio de Janeiro', uf: 'RJ', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'RIO' },
  { iata: 'SDU', nome: 'Santos Dumont', cidade: 'Rio de Janeiro', uf: 'RJ', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'RIO' },
  { iata: 'CNF', nome: 'Confins', cidade: 'Belo Horizonte', uf: 'MG', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'BHZ' },
  { iata: 'PLU', nome: 'Pampulha', cidade: 'Belo Horizonte', uf: 'MG', pais: 'Brasil', paisIso: 'BR', areaMetropolitana: 'BHZ' },
  { iata: 'BSB', nome: 'Presidente Juscelino Kubitschek', cidade: 'Brasília', uf: 'DF', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'SSA', nome: 'Deputado Luís Eduardo Magalhães', cidade: 'Salvador', uf: 'BA', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'REC', nome: 'Guararapes', cidade: 'Recife', uf: 'PE', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'FOR', nome: 'Pinto Martins', cidade: 'Fortaleza', uf: 'CE', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'POA', nome: 'Salgado Filho', cidade: 'Porto Alegre', uf: 'RS', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'CWB', nome: 'Afonso Pena', cidade: 'Curitiba', uf: 'PR', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'FLN', nome: 'Hercílio Luz', cidade: 'Florianópolis', uf: 'SC', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'VIX', nome: 'Eurico de Aguiar Salles', cidade: 'Vitória', uf: 'ES', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'BEL', nome: 'Val de Cans', cidade: 'Belém', uf: 'PA', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'MAO', nome: 'Eduardo Gomes', cidade: 'Manaus', uf: 'AM', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'NAT', nome: 'Aluízio Alves', cidade: 'Natal', uf: 'RN', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'MCZ', nome: 'Zumbi dos Palmares', cidade: 'Maceió', uf: 'AL', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'JPA', nome: 'Castro Pinto', cidade: 'João Pessoa', uf: 'PB', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'AJU', nome: 'Santa Maria', cidade: 'Aracaju', uf: 'SE', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'THE', nome: 'Senador Petrônio Portella', cidade: 'Teresina', uf: 'PI', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'SLZ', nome: 'Marechal Cunha Machado', cidade: 'São Luís', uf: 'MA', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'CGB', nome: 'Marechal Rondon', cidade: 'Cuiabá', uf: 'MT', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'CGR', nome: 'Campo Grande', cidade: 'Campo Grande', uf: 'MS', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'GYN', nome: 'Santa Genoveva', cidade: 'Goiânia', uf: 'GO', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'IGU', nome: 'Cataratas', cidade: 'Foz do Iguaçu', uf: 'PR', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'NVT', nome: 'Ministro Victor Konder', cidade: 'Navegantes', uf: 'SC', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'PMW', nome: 'Brigadeiro Lysias Rodrigues', cidade: 'Palmas', uf: 'TO', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'PVH', nome: 'Governador Jorge Teixeira', cidade: 'Porto Velho', uf: 'RO', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'RBR', nome: 'Plácido de Castro', cidade: 'Rio Branco', uf: 'AC', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'BVB', nome: 'Atlas Brasil Cantanhede', cidade: 'Boa Vista', uf: 'RR', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'MCP', nome: 'Alberto Alcolumbre', cidade: 'Macapá', uf: 'AP', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'IOS', nome: 'Jorge Amado', cidade: 'Ilhéus', uf: 'BA', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'BPS', nome: 'Porto Seguro', cidade: 'Porto Seguro', uf: 'BA', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'FEN', nome: 'Fernando de Noronha', cidade: 'Fernando de Noronha', uf: 'PE', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'UDI', nome: 'Ten. Cel. Av. César Bombonato', cidade: 'Uberlândia', uf: 'MG', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'RAO', nome: 'Leite Lopes', cidade: 'Ribeirão Preto', uf: 'SP', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'LDB', nome: 'Governador José Richa', cidade: 'Londrina', uf: 'PR', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'JOI', nome: 'Lauro Carneiro de Loyola', cidade: 'Joinville', uf: 'SC', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'MGF', nome: 'Silvio Name Júnior', cidade: 'Maringá', uf: 'PR', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'CXJ', nome: 'Hugo Cantergiani', cidade: 'Caxias do Sul', uf: 'RS', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'JDO', nome: 'Orlando Bezerra de Menezes', cidade: 'Juazeiro do Norte', uf: 'CE', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'PET', nome: 'João Simões Lopes Neto', cidade: 'Pelotas', uf: 'RS', pais: 'Brasil', paisIso: 'BR' },
  { iata: 'STM', nome: 'Maestro Wilson Fonseca', cidade: 'Santarém', uf: 'PA', pais: 'Brasil', paisIso: 'BR' },

  // ---------- América do Sul ----------
  { iata: 'EZE', nome: 'Ezeiza', cidade: 'Buenos Aires', pais: 'Argentina', paisIso: 'AR', areaMetropolitana: 'BUE' },
  { iata: 'AEP', nome: 'Aeroparque Jorge Newbery', cidade: 'Buenos Aires', pais: 'Argentina', paisIso: 'AR', areaMetropolitana: 'BUE' },
  { iata: 'SCL', nome: 'Arturo Merino Benítez', cidade: 'Santiago', pais: 'Chile', paisIso: 'CL' },
  { iata: 'MVD', nome: 'Carrasco', cidade: 'Montevidéu', pais: 'Uruguai', paisIso: 'UY' },
  { iata: 'LIM', nome: 'Jorge Chávez', cidade: 'Lima', pais: 'Peru', paisIso: 'PE' },
  { iata: 'BOG', nome: 'El Dorado', cidade: 'Bogotá', pais: 'Colômbia', paisIso: 'CO' },
  { iata: 'ASU', nome: 'Silvio Pettirossi', cidade: 'Assunção', pais: 'Paraguai', paisIso: 'PY' },
  { iata: 'VVI', nome: 'Viru Viru', cidade: 'Santa Cruz de la Sierra', pais: 'Bolívia', paisIso: 'BO' },
  { iata: 'UIO', nome: 'Mariscal Sucre', cidade: 'Quito', pais: 'Equador', paisIso: 'EC' },
  { iata: 'CCS', nome: 'Simón Bolívar', cidade: 'Caracas', pais: 'Venezuela', paisIso: 'VE' },
  { iata: 'GEO', nome: 'Cheddi Jagan', cidade: 'Georgetown', pais: 'Guiana', paisIso: 'GY' },

  // ---------- América do Norte e Central ----------
  { iata: 'MIA', nome: 'Miami International', cidade: 'Miami', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'MCO', nome: 'Orlando International', cidade: 'Orlando', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'JFK', nome: 'John F. Kennedy', cidade: 'Nova York', pais: 'Estados Unidos', paisIso: 'US', areaMetropolitana: 'NYC' },
  { iata: 'EWR', nome: 'Newark Liberty', cidade: 'Nova York', pais: 'Estados Unidos', paisIso: 'US', areaMetropolitana: 'NYC' },
  { iata: 'LGA', nome: 'LaGuardia', cidade: 'Nova York', pais: 'Estados Unidos', paisIso: 'US', areaMetropolitana: 'NYC' },
  { iata: 'ORD', nome: "O'Hare", cidade: 'Chicago', pais: 'Estados Unidos', paisIso: 'US', areaMetropolitana: 'CHI' },
  { iata: 'MDW', nome: 'Midway', cidade: 'Chicago', pais: 'Estados Unidos', paisIso: 'US', areaMetropolitana: 'CHI' },
  { iata: 'LAX', nome: 'Los Angeles International', cidade: 'Los Angeles', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'ATL', nome: 'Hartsfield-Jackson', cidade: 'Atlanta', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'DFW', nome: 'Dallas/Fort Worth', cidade: 'Dallas', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'IAH', nome: 'George Bush', cidade: 'Houston', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'BOS', nome: 'Logan', cidade: 'Boston', pais: 'Estados Unidos', paisIso: 'US' },
  { iata: 'YYZ', nome: 'Pearson', cidade: 'Toronto', pais: 'Canadá', paisIso: 'CA' },
  { iata: 'YUL', nome: 'Trudeau', cidade: 'Montreal', pais: 'Canadá', paisIso: 'CA' },
  { iata: 'MEX', nome: 'Benito Juárez', cidade: 'Cidade do México', pais: 'México', paisIso: 'MX' },
  { iata: 'CUN', nome: 'Cancún', cidade: 'Cancún', pais: 'México', paisIso: 'MX' },
  { iata: 'PTY', nome: 'Tocumen', cidade: 'Cidade do Panamá', pais: 'Panamá', paisIso: 'PA' },

  // ---------- Europa ----------
  { iata: 'LIS', nome: 'Humberto Delgado', cidade: 'Lisboa', pais: 'Portugal', paisIso: 'PT' },
  { iata: 'OPO', nome: 'Francisco Sá Carneiro', cidade: 'Porto', pais: 'Portugal', paisIso: 'PT' },
  { iata: 'MAD', nome: 'Barajas', cidade: 'Madri', pais: 'Espanha', paisIso: 'ES' },
  { iata: 'BCN', nome: 'El Prat', cidade: 'Barcelona', pais: 'Espanha', paisIso: 'ES' },
  { iata: 'CDG', nome: 'Charles de Gaulle', cidade: 'Paris', pais: 'França', paisIso: 'FR', areaMetropolitana: 'PAR' },
  { iata: 'ORY', nome: 'Orly', cidade: 'Paris', pais: 'França', paisIso: 'FR', areaMetropolitana: 'PAR' },
  { iata: 'BVA', nome: 'Beauvais-Tillé', cidade: 'Paris', pais: 'França', paisIso: 'FR', areaMetropolitana: 'PAR' },
  { iata: 'LHR', nome: 'Heathrow', cidade: 'Londres', pais: 'Reino Unido', paisIso: 'GB', areaMetropolitana: 'LON' },
  { iata: 'LGW', nome: 'Gatwick', cidade: 'Londres', pais: 'Reino Unido', paisIso: 'GB', areaMetropolitana: 'LON' },
  { iata: 'STN', nome: 'Stansted', cidade: 'Londres', pais: 'Reino Unido', paisIso: 'GB', areaMetropolitana: 'LON' },
  { iata: 'FCO', nome: 'Fiumicino', cidade: 'Roma', pais: 'Itália', paisIso: 'IT', areaMetropolitana: 'ROM' },
  { iata: 'CIA', nome: 'Ciampino', cidade: 'Roma', pais: 'Itália', paisIso: 'IT', areaMetropolitana: 'ROM' },
  { iata: 'MXP', nome: 'Malpensa', cidade: 'Milão', pais: 'Itália', paisIso: 'IT', areaMetropolitana: 'MIL' },
  { iata: 'LIN', nome: 'Linate', cidade: 'Milão', pais: 'Itália', paisIso: 'IT', areaMetropolitana: 'MIL' },
  { iata: 'BGY', nome: 'Orio al Serio', cidade: 'Milão', pais: 'Itália', paisIso: 'IT', areaMetropolitana: 'MIL' },
  { iata: 'FRA', nome: 'Frankfurt am Main', cidade: 'Frankfurt', pais: 'Alemanha', paisIso: 'DE' },
  { iata: 'MUC', nome: 'Franz Josef Strauß', cidade: 'Munique', pais: 'Alemanha', paisIso: 'DE' },
  { iata: 'AMS', nome: 'Schiphol', cidade: 'Amsterdã', pais: 'Países Baixos', paisIso: 'NL' },
  { iata: 'ZRH', nome: 'Kloten', cidade: 'Zurique', pais: 'Suíça', paisIso: 'CH' },
  { iata: 'IST', nome: 'Istanbul Airport', cidade: 'Istambul', pais: 'Turquia', paisIso: 'TR' },
  { iata: 'DUB', nome: 'Dublin', cidade: 'Dublin', pais: 'Irlanda', paisIso: 'IE' },

  // ---------- África, Ásia e Oceania ----------
  { iata: 'JNB', nome: 'O. R. Tambo', cidade: 'Joanesburgo', pais: 'África do Sul', paisIso: 'ZA' },
  { iata: 'CPT', nome: 'Cidade do Cabo', cidade: 'Cidade do Cabo', pais: 'África do Sul', paisIso: 'ZA' },
  { iata: 'CMN', nome: 'Mohammed V', cidade: 'Casablanca', pais: 'Marrocos', paisIso: 'MA' },
  { iata: 'ADD', nome: 'Bole', cidade: 'Adis Abeba', pais: 'Etiópia', paisIso: 'ET' },
  { iata: 'DXB', nome: 'Dubai International', cidade: 'Dubai', pais: 'Emirados Árabes', paisIso: 'AE' },
  { iata: 'DOH', nome: 'Hamad', cidade: 'Doha', pais: 'Catar', paisIso: 'QA' },
  { iata: 'NRT', nome: 'Narita', cidade: 'Tóquio', pais: 'Japão', paisIso: 'JP', areaMetropolitana: 'TYO' },
  { iata: 'HND', nome: 'Haneda', cidade: 'Tóquio', pais: 'Japão', paisIso: 'JP', areaMetropolitana: 'TYO' },
  { iata: 'SIN', nome: 'Changi', cidade: 'Singapura', pais: 'Singapura', paisIso: 'SG' },
  { iata: 'SYD', nome: 'Kingsford Smith', cidade: 'Sydney', pais: 'Austrália', paisIso: 'AU' },
];

const PORdeIATA = new Map(AEROPORTOS.map((a) => [a.iata, a]));

export function buscarAeroporto(iata: string): Aeroporto | undefined {
  return PORdeIATA.get(iata.toUpperCase());
}

/** Normaliza texto para busca: minúsculo e sem acentos. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Autocomplete simples: casa código IATA, cidade ou nome do aeroporto.
 * Resultados com IATA exato ou cidade começando pelo termo vêm primeiro.
 */
export function pesquisarAeroportos(termo: string, limite = 8): Aeroporto[] {
  const t = normalizar(termo);
  if (!t) return [];

  const pontuados = AEROPORTOS.map((a) => {
    const iata = normalizar(a.iata);
    const cidade = normalizar(a.cidade);
    const nome = normalizar(a.nome);

    let peso = -1;
    if (iata === t) peso = 100;
    else if (cidade.startsWith(t)) peso = 80;
    else if (cidade.includes(t)) peso = 60;
    else if (nome.includes(t)) peso = 40;
    else if (normalizar(a.pais).startsWith(t)) peso = 20;

    // Brasil primeiro em caso de empate — é o mercado principal do site.
    if (peso > 0 && a.paisIso === 'BR') peso += 5;
    return { a, peso };
  })
    .filter((x) => x.peso > 0)
    .sort((x, y) => y.peso - x.peso || x.a.iata.localeCompare(y.a.iata));

  return pontuados.slice(0, limite).map((x) => x.a);
}

/** Aeroportos servem a mesma região metropolitana (troca de aeroporto na conexão). */
export function mesmaAreaMetropolitana(iataA: string, iataB: string): boolean {
  const a = buscarAeroporto(iataA);
  const b = buscarAeroporto(iataB);
  if (!a?.areaMetropolitana || !b?.areaMetropolitana) return false;
  return a.areaMetropolitana === b.areaMetropolitana;
}
