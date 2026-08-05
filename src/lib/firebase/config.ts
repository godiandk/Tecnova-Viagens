/**
 * Configuração do Firebase.
 *
 * Estes valores são públicos por natureza — o Firebase os expõe no JavaScript
 * de qualquer site que use o serviço, e é assim que ele foi desenhado. Quem
 * protege os dados são as regras do Firestore, que rodam no servidor do Google
 * e não podem ser burladas pelo navegador. Por isso `firestore.rules` é o
 * arquivo que importa de verdade neste projeto, não este aqui.
 *
 * É o mesmo projeto da TECNOVA Digital: uma conta só serve para os dois sites.
 */
export const CONFIG_FIREBASE = {
  apiKey: 'AIzaSyAK82iVEqwbA2KxDzDQQ8ZqIQ9gAvUEYzo',
  authDomain: 'tecnova-digital-159e3.firebaseapp.com',
  projectId: 'tecnova-digital-159e3',
  storageBucket: 'tecnova-digital-159e3.firebasestorage.app',
  messagingSenderId: '880317651454',
  appId: '1:880317651454:web:21ca08b9e90d3bda3088af',
} as const;

/**
 * Quem enxerga o painel administrativo.
 *
 * A lista aqui só decide o que a interface desenha. A permissão de verdade
 * está em `firestore.rules`, que compara o e-mail do token de autenticação
 * antes de devolver qualquer dado. Alterar esta lista no navegador não abre
 * porta nenhuma: o servidor continua negando.
 */
export const EMAILS_ADMIN = ['wly.vianna@gmail.com'] as const;

export function ehAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return EMAILS_ADMIN.includes(email.toLowerCase() as (typeof EMAILS_ADMIN)[number]);
}

/** Coleções deste site, separadas das da TECNOVA Digital pelo prefixo. */
export const COLECOES = {
  clientes: 'viagens_clientes',
  cotacoes: 'viagens_cotacoes',
} as const;

/** Versão da biblioteca carregada sob demanda. */
export const VERSAO_SDK = '10.14.1';
