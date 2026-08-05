import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Gera a versão de página única do site.
 *
 * O site normal precisa de servidor para a rota /api/busca. Esta versão
 * substitui essa chamada por uma execução em memória, empacota tudo (React,
 * motor de risco, catálogo de aeroportos) em um arquivo e embute o CSS. O
 * resultado abre offline, sem depender de nenhum recurso externo — que é
 * exatamente o que a política de segurança da publicação exige.
 */
const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');
const temporario = mkdtempSync(join(tmpdir(), 'tecnova-'));

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

  // ---- Montagem do HTML ----
  const html = `<title>Tecnova Viagens — passagem barata sem cair em cilada</title>
<style>${css}</style>
<div id="raiz"></div>
<script>${js}</script>
`;

  const destino = join(raiz, 'artefato', 'saida');
  mkdirSync(destino, { recursive: true });
  const caminhoFinal = join(destino, 'tecnova-viagens.html');
  writeFileSync(caminhoFinal, html);

  const tamanho = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`\nGerado: ${caminhoFinal} (${tamanho} KB)`);
} finally {
  rmSync(temporario, { recursive: true, force: true });
}
