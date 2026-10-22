#!/usr/bin/env node
/**
 * Confere a nekkora-lib versionada em vendor/ (LIB-RELEASE-001 §3.4 — versão identificável de forma inequívoca):
 *
 * 1. o tarball tem o sha256 e a integridade (sha512) registrados em vendor/nekkora-lib.json;
 * 2. o package-lock.json instala exatamente esse tarball (mesma integridade);
 * 3. com --reconstruir: baixa o código da lib no commit registrado, faz `npm ci` + build + `npm pack` numa pasta
 *    temporária e confirma que o resultado é byte a byte o mesmo tarball (build reproduzível).
 *
 *   node scripts/verificar-lib.mjs [--reconstruir]
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const meta = JSON.parse(readFileSync(resolve('vendor/nekkora-lib.json'), 'utf8'));
const lock = JSON.parse(readFileSync(resolve('package-lock.json'), 'utf8'));
const isWin = process.platform === 'win32';
let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'OK ' : 'FALHA'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const digest = (buf, alg, enc) => createHash(alg).update(buf).digest(enc);

const bytes = readFileSync(resolve('vendor', meta.arquivo));
check('sha256 do tarball', digest(bytes, 'sha256', 'hex') === meta.sha256, meta.sha256);
check('integridade (sha512) do tarball', `sha512-${digest(bytes, 'sha512', 'base64')}` === meta.integridade, meta.integridade);
const locked = lock.packages?.['node_modules/nekkora-lib'];
check('package-lock aponta para o tarball', locked?.resolved === `file:vendor/${meta.arquivo}` && locked?.integrity === meta.integridade, `${locked?.resolved} ${locked?.version}`);
check('versão', locked?.version === meta.versao, `${meta.versao} · commit ${meta.commit}`);

if (process.argv.includes('--reconstruir')) {
  const dir = mkdtempSync(join(tmpdir(), 'nekkora-lib-reconstrucao-'));
  try {
    const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', shell: isWin && cmd === 'npm' });
    run('git', ['init', '-q'], dir);
    run('git', ['fetch', '-q', '--depth', '1', meta.repositorio, meta.commit], dir);
    run('git', ['-c', 'advice.detachedHead=false', 'checkout', '-q', 'FETCH_HEAD'], dir);
    run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], dir);
    run('npm', ['run', 'build'], dir);
    mkdirSync(join(dir, 'out'));
    run('npm', ['pack', '--ignore-scripts', '--pack-destination', join(dir, 'out')], dir);
    const [tgz] = readdirSync(join(dir, 'out')).filter((f) => f.endsWith('.tgz'));
    const rebuilt = digest(readFileSync(join(dir, 'out', tgz)), 'sha256', 'hex');
    check('build reproduzível a partir do commit registrado', rebuilt === meta.sha256, `${tgz} sha256 ${rebuilt}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
process.exit(failed ? 1 : 0);
