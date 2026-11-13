#!/usr/bin/env node
/**
 * Código-fonte × artefato de build (COM-RELEASE-005 §3.5): o bundle do build tem a MESMA tabela de src/precos.ts, não
 * tem nenhum percentual de desconto digitado (o defeito "−NN%" fixo de versões anteriores) e o release.json identifica
 * o commit em disco. Complementa a homologação, que confere os valores efetivamente renderizados nos navegadores.
 *
 *   node scripts/verificar-precos-artefato.mjs [--dist dist]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PREVIOUS_PRICE_TABLE, PRICE_TABLE } from '../src/precos.ts';

const argv = process.argv.slice(2);
const dist = resolve(argv.includes('--dist') ? argv[argv.indexOf('--dist') + 1] : 'dist');
const bundle = readdirSync(join(dist, 'assets'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => readFileSync(join(dist, 'assets', f), 'utf8'))
  .join('\n');
let release = {};
try {
  release = JSON.parse(readFileSync(join(dist, 'release.json'), 'utf8'));
} catch {}
let head = null;
try {
  head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {}

/** Número como o minificador escreve (1000 → 1e3). */
const minified = (n) => [String(n), n % 1000 === 0 ? `${n / 1000}e3` : null].filter(Boolean);
const checks = [];
const check = (id, ok, detail) => {
  checks.push({ id, ok });
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${id} — ${detail}`);
};

// COM-VITRINE-001: individual e pacote de 3, iguais aos de src/precos.ts
for (const [tier, { individual, pacote }] of Object.entries(PRICE_TABLE)) {
  const found = minified(individual).some((i) => minified(pacote).some((p) => bundle.includes(`individual:${i},pacote:${p}}`)));
  check(`tabela-no-bundle:${tier}`, found, `individual ${individual}, pacote ${pacote}`);
}
// A tabela anterior só rege compromissos já assumidos (scripts/comercial/regras-delivery.mjs): nunca vai para a página
for (const [tier, { standard, launch }] of Object.entries(PREVIOUS_PRICE_TABLE)) {
  const found = minified(standard).some((s) => minified(launch).some((l) => bundle.includes(`standard:${s},launch:${l}}`)));
  check(`tabela-anterior-fora-do-bundle:${tier}`, !found, found ? `standard ${standard}, launch ${launch} no bundle` : 'ausente');
}
// O sinal de menos tipográfico (U+2212) é o dos selos de desconto; o hífen aparece em CSS/JS (rootMargin '-35%').
const literals = [...bundle.matchAll(/−\s?\d+(?:[.,]\d+)?\s?%/g)].map((m) => m[0]);
check('sem-percentual-digitado', literals.length === 0, literals.length ? literals.join(' ') : 'percentuais só calculados a partir da tabela');
const fixed = /\bdiscount:\s*["'`]/.test(bundle);
check('sem-campo-discount-fixo', !fixed, fixed ? 'campo "discount" com texto fixo no bundle' : 'nenhum "discount: \'…\'" no bundle');
check('release-do-commit-em-disco', release.commit != null && (head == null || release.commit === head), `release.json=${release.commit?.slice(0, 7) ?? 'ausente'}; HEAD=${head?.slice(0, 7) ?? 'git indisponível'}`);

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length} verificações, ${failed} falha(s).`);
process.exit(failed ? 1 : 0);
