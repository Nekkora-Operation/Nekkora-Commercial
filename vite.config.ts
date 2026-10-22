import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const root = import.meta.dirname;
/** publicacao.json real, ou o arquivo sintético da homologação (NEKKORA_PUBLICACAO). */
const publicacao = resolve(root, process.env.NEKKORA_PUBLICACAO ?? 'publicacao.json');
const homologacao = relative(root, publicacao).replace(/\\/g, '/') !== 'publicacao.json';

const git = (...args: string[]) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
};

/**
 * Gera, junto com o build, o `release.json`: identificação do artefato (commit, árvore limpa, versão e integridade da
 * nekkora-lib, origem dos dados de publicação) e o hash SHA-256 de cada <script> inline do index.html final. A CSP do
 * CloudFront (deploy/aws/politica-cabecalhos.json, gerada por scripts/aws/gerar-config.mjs) autoriza exatamente esses
 * hashes — sem 'unsafe-inline' — e o portão de publicação recusa o artefato se a política não corresponder.
 * scripts/verificar-publicacao.mjs também recusa build de homologação ou de árvore suja.
 */
function releaseFiles(): Plugin {
  return {
    name: 'nekkora-release-files',
    apply: 'build',
    generateBundle: {
      // Depois do plugin de HTML do Vite: o index.html final já está no bundle.
      order: 'post',
      handler(_, bundle) {
        const index = bundle['index.html'];
        if (!index || index.type !== 'asset') throw new Error('index.html não encontrado no bundle');
        // Pré-carrega o subconjunto latin da Inter (vem da nekkora-lib): a página é desenhada pelo JS, e a fonte chega
        // antes do primeiro texto — sem a troca de fonte que deslocava o hero (CLS 0,22 → medido em scripts/desempenho.mjs).
        const font = Object.keys(bundle).find((f) => /inter-latin-wght-normal-[\w-]+\.woff2$/.test(f));
        if (!font) throw new Error('fonte Inter (latin) não encontrada no bundle');
        index.source = String(index.source).replace(
          '</head>',
          `  <link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin />\n  </head>`,
        );
        const html = String(index.source);
        const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
          // O parser HTML converte CRLF em LF antes de o navegador calcular o hash: calcula sobre o texto normalizado.
          (m) => `'sha256-${createHash('sha256').update(m[1].replace(/\r\n?/g, '\n')).digest('base64')}'`,
        );
        const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
        const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
        const lib = lock.packages?.['node_modules/nekkora-lib'] ?? {};
        const release = {
          aplicacao: `${pkg.name}@${pkg.version}`,
          // O commit efetivamente em disco — não GITHUB_SHA, que no deploy de uma tag/commit informado é o da `main`
          // de onde o workflow foi disparado. GITHUB_SHA só como reserva, se o git não estiver disponível.
          commit: git('rev-parse', 'HEAD') ?? process.env.GITHUB_SHA ?? null,
          arvoreLimpa: git('status', '--porcelain') === '',
          nekkoraLib: { versao: lib.version ?? null, origem: lib.resolved ?? null, integridade: lib.integrity ?? null },
          publicacao: relative(root, publicacao).replace(/\\/g, '/'),
          homologacao,
          cspScriptHashes: hashes,
        };
        this.emitFile({ type: 'asset', fileName: 'release.json', source: `${JSON.stringify(release, null, 2)}\n` });
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), releaseFiles()],
  base: '/',
  resolve: {
    alias: { '@publicacao': publicacao },
    // Garante uma única cópia do React mesmo se a nekkora-lib for instalada de uma pasta local.
    dedupe: ['react', 'react-dom'],
  },
});
