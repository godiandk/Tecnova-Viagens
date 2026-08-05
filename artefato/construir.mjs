import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Gera a versão do site que roda sem servidor.
 *
 * O site normal precisa de servidor para a rota /api/busca. Esta versão troca
 * essa chamada por uma execução em memória e empacota tudo (React, motor de
 * risco, catálogo de aeroportos) com o CSS embutido, sem nenhum recurso
 * externo. Saem dois arquivos do mesmo conteúdo:
 *
 *   artefato/saida/tecnova-viagens.html  fragmento, para publicar como Artifact
 *   site/index.html                      documento completo, para o GitHub Pages
 *
 * Rode com `--site` para gerar também a pasta `site/`.
 */
const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const gerarSite = process.argv.includes('--site');
const temporario = mkdtempSync(join(tmpdir(), 'tecnova-'));

const TITULO = 'Tecnova Viagens — passagem barata sem cair em cilada';
const DESCRICAO =
  'Compare passagens aéreas por preço e por risco. Mostramos conexão apertada, ' +
  'bagagem cobrada à parte, passagens separadas e o custo real de cada opção — ' +
  'em linguagem simples, antes de você comprar.';

try {
  // ---- CSS: Tailwind varre as classes usadas e devolve só o necessário ----
  const arquivoCss = join(temporario, 'estilos.css');
  execFileSync(
    'npx',
    ['@tailwindcss/cli', '-i', join(aqui, 'estilos.css'), '-o', arquivoCss, '--minify'],
    { cwd: raiz, stdio: 'inherit' },
  );
  const css = readFileSync(arquivoCss, 'utf8');

  // ---- JS: um único bundle, sem imports externos ----
  const arquivoJs = join(temporario, 'app.js');
  await build({
    entryPoints: [join(aqui, 'entrada.tsx')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    jsx: 'automatic',
    outfile: arquivoJs,
    absWorkingDir: raiz,
    // Sem servidor não existe `process`; os módulos só o consultam dentro de
    // funções que esta versão nunca chama, mas o objeto precisa existir.
    banner: { js: 'window.process=window.process||{env:{}};' },
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.svg': 'dataurl' },
  });
  const js = readFileSync(arquivoJs, 'utf8');

  const miolo = `<style>${css}</style>\n<div id="raiz"></div>\n<script>${js}</script>`;

  // ---- Saída 1: fragmento para o Artifact, que já monta o documento ----
  const destinoArtefato = join(raiz, 'artefato', 'saida');
  mkdirSync(destinoArtefato, { recursive: true });
  const caminhoArtefato = join(destinoArtefato, 'tecnova-viagens.html');
  writeFileSync(caminhoArtefato, `<title>${TITULO}</title>\n${miolo}\n`);
  relatar(caminhoArtefato);

  // ---- Saída 2: documento completo para hospedagem estática ----
  if (gerarSite) {
    const icone = readFileSync(join(raiz, 'src', 'app', 'icon.svg'), 'utf8');
    const iconeEmbutido = `data:image/svg+xml,${encodeURIComponent(icone)}`;
    const documento = montarDocumento(miolo, iconeEmbutido);

    const destinoSite = join(raiz, 'site');
    mkdirSync(destinoSite, { recursive: true });
    writeFileSync(join(destinoSite, 'index.html'), documento);
    // O Pages serve 404.html em qualquer caminho desconhecido; com o mesmo
    // conteúdo, entrar em /qualquer-coisa abre o site em vez de dar erro.
    writeFileSync(join(destinoSite, '404.html'), documento);
    // Sem isto o Pages passa os arquivos pelo Jekyll e ignora nomes com "_".
    writeFileSync(join(destinoSite, '.nojekyll'), '');

    // Domínio próprio: o Pages lê este arquivo para saber qual endereço servir.
    const dominio = (process.env.DOMINIO ?? '').trim();
    if (dominio) writeFileSync(join(destinoSite, 'CNAME'), `${dominio}\n`);

    relatar(join(destinoSite, 'index.html'));
    console.log(dominio ? `Domínio configurado: ${dominio}` : 'Sem domínio próprio (CNAME não criado)');
  }
} finally {
  rmSync(temporario, { recursive: true, force: true });
}

function montarDocumento(miolo, icone) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITULO}</title>
<meta name="description" content="${DESCRICAO}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#eceff3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b1017" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${icone}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${TITULO}">
<meta property="og:description" content="${DESCRICAO}">
<meta name="twitter:card" content="summary">
</head>
<body>
${miolo}
</body>
</html>
`;
}

function relatar(caminho) {
  const tamanho = (readFileSync(caminho).byteLength / 1024).toFixed(0);
  console.log(`Gerado: ${caminho} (${tamanho} KB)`);
}
