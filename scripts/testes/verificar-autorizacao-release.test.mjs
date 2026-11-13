/**
 * PUB-18 no deploy (COM-VITRINE-001, titular, 12/11/2026): o commit selecionado para o deploy tem de descender do commit
 * homologado (H) citado na autorização e ter a mesma árvore de H, exceto a própria autorização em publicacao.json.
 * Repositórios git TEMPORÁRIOS com dados FICTÍCIOS: o histórico do projeto não é tocado.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { analisar } from '../verificar-autorizacao-release.mjs';

const SCRIPT = resolve('scripts/verificar-autorizacao-release.mjs');
const raiz = mkdtempSync(join(tmpdir(), 'autorizacao-release-'));
after(() => rmSync(raiz, { recursive: true, force: true }));

const BASE = {
  $origem: { canais: 'Titular, 22/10/2026 (fictício): e-mail e LinkedIn.', 'novasCondicoes.inicio': 'Titular, 20/11/2026 (fictício): data de início 2026-11-20.' },
  aprovacoes: { publicacao: true },
  novasCondicoes: { inicio: '2026-11-20' },
};
const autorizar = (pub, h, versao = '1.1.0') => ({
  ...pub,
  $origem: { ...pub.$origem, publicacaoAutorizada: `Titular, 20/11/2026 (fictício): autorizo a publicação da versão ${versao}, commit homologado ${h}.` },
  publicacaoAutorizada: { versao, commit: h },
});

let n = 0;
/** Repositório novo com o commit homologado H (package.json 1.1.0, publicacao.json definitivo, código). */
function repo() {
  const dir = join(raiz, `r${n++}`);
  mkdirSync(join(dir, 'src'), { recursive: true });
  const g = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'teste@empresa-ficticia.com.br');
  g('config', 'user.name', 'Teste');
  g('config', 'commit.gpgsign', 'false');
  const escreve = (arquivo, conteudo) => writeFileSync(join(dir, arquivo), typeof conteudo === 'string' ? conteudo : `${JSON.stringify(conteudo, null, 2)}\n`);
  const commit = (msg) => {
    g('add', '-A');
    g('commit', '-q', '-m', msg);
    return g('rev-parse', 'HEAD');
  };
  escreve('package.json', { name: 'copia', version: '1.1.0' });
  escreve('publicacao.json', BASE);
  escreve('src/precos.ts', 'export const SIMPLES = 650;\n');
  const H = commit('H: homologado');
  const verifica = (c) => {
    const r = spawnSync(process.execPath, [SCRIPT, '--commit', c], { cwd: dir, encoding: 'utf8' });
    return { code: r.status, out: r.stdout + r.stderr };
  };
  return { dir, g, escreve, commit, H, verifica };
}

test('C de autorização logo depois de H: confere', () => {
  const r = repo();
  r.escreve('publicacao.json', autorizar(BASE, r.H));
  const C = r.commit('C: autorização PUB-18');
  const v = r.verifica(C);
  assert.equal(v.code, 0, v.out);
  assert.match(v.out, /PUB-18 confere/);
});

test('merge de C na main sem outro conteúdo: confere (árvore igual à de H + autorização)', () => {
  const r = repo();
  r.g('checkout', '-q', '-b', 'feat');
  r.escreve('publicacao.json', autorizar(BASE, r.H));
  r.commit('C: autorização');
  r.g('checkout', '-q', 'main');
  r.g('merge', '-q', '--no-ff', '-m', 'merge', 'feat');
  const v = r.verifica(r.g('rev-parse', 'HEAD'));
  assert.equal(v.code, 0, v.out);
});

test('commit intermediário entre H e C (preço alterado): bloqueia', () => {
  const r = repo();
  r.escreve('src/precos.ts', 'export const SIMPLES = 600;\n');
  r.commit('X: intermediário');
  r.escreve('publicacao.json', autorizar(BASE, r.H));
  const v = r.verifica(r.commit('C'));
  assert.equal(v.code, 1, v.out);
  assert.match(v.out, /fora de publicacao\.json: src\/precos\.ts/);
});

test('commit intermediário desfeito depois: árvore igual à de H, confere (o que vale é o conteúdo publicado)', () => {
  const r = repo();
  r.escreve('src/precos.ts', 'export const SIMPLES = 600;\n');
  r.commit('X');
  r.escreve('src/precos.ts', 'export const SIMPLES = 650;\n');
  r.commit('revert X');
  r.escreve('publicacao.json', autorizar(BASE, r.H));
  const v = r.verifica(r.commit('C'));
  assert.equal(v.code, 0, v.out);
});

test('merge com conteúdo adicional da main (arquivo novo): bloqueia', () => {
  const r = repo();
  r.g('checkout', '-q', '-b', 'feat');
  r.escreve('publicacao.json', autorizar(BASE, r.H));
  r.commit('C: autorização');
  r.g('checkout', '-q', 'main');
  r.escreve('src/extra.ts', 'export const OFERTA = "90% de desconto";\n');
  r.commit('outra alteração na main');
  r.g('merge', '-q', '--no-ff', '-m', 'merge', 'feat');
  const v = r.verifica(r.g('rev-parse', 'HEAD'));
  assert.equal(v.code, 1, v.out);
  assert.match(v.out, /fora de publicacao\.json: src\/extra\.ts/);
});

test('SHA inválido, inexistente ou o próprio C: bloqueia', () => {
  const r = repo();
  for (const [h, esperado] of [
    ['abc1234', /sem publicacaoAutorizada\.commit \(SHA completo/],
    ['f'.repeat(40), /não existe no repositório/],
  ]) {
    r.escreve('publicacao.json', autorizar(BASE, h));
    const v = r.verifica(r.commit(`C com ${h}`));
    assert.equal(v.code, 1, v.out);
    assert.match(v.out, esperado);
  }
  assert.equal(r.verifica('0'.repeat(40)).code, 2, 'commit a publicar inexistente');
});

test('versão autorizada diferente da do package.json, ou package.json alterado depois de H: bloqueia', () => {
  const r = repo();
  r.escreve('publicacao.json', autorizar(BASE, r.H, '1.0.0'));
  let v = r.verifica(r.commit('C versão errada'));
  assert.equal(v.code, 1, v.out);
  assert.match(v.out, /versão autorizada 1\.0\.0 diferente da do package\.json/);

  const r2 = repo();
  r2.escreve('package.json', { name: 'copia', version: '1.2.0' });
  r2.escreve('publicacao.json', autorizar(BASE, r2.H, '1.2.0'));
  v = r2.verifica(r2.commit('C muda a versão'));
  assert.equal(v.code, 1, v.out);
  assert.match(v.out, /fora de publicacao\.json: package\.json/);
});

test('campo não permitido alterado junto com a autorização (data de início, registro, canal): bloqueia', () => {
  for (const muda of [
    (p) => (p.novasCondicoes = { inicio: '2026-11-21' }),
    (p) => (p.$origem['novasCondicoes.inicio'] = 'Titular, 21/11/2026 (fictício): data de início 2026-11-21.'),
    (p) => (p.aprovacoes = { publicacao: false }),
  ]) {
    const r = repo();
    const p = autorizar(structuredClone(BASE), r.H);
    muda(p);
    r.escreve('publicacao.json', p);
    const v = r.verifica(r.commit('C com outro campo'));
    assert.equal(v.code, 1, v.out);
    assert.match(v.out, /publicacao\.json diferente do homologado além da própria autorização/);
  }
});

test('commit fora da linha de H (H não é ancestral): bloqueia', () => {
  const r = repo();
  r.g('checkout', '-q', '--orphan', 'outra');
  r.escreve('publicacao.json', autorizar(BASE, r.H));
  const v = r.verifica(r.commit('C órfão'));
  assert.equal(v.code, 1, v.out);
  assert.match(v.out, /não descende do commit homologado/);
});

test('sem autorização (estado atual da branch): bloqueia', () => {
  const r = repo();
  const v = r.verifica(r.H);
  assert.equal(v.code, 1, v.out);
  assert.match(v.out, /sem publicacaoAutorizada\.commit/);
});

test('analisar: H citado como o próprio commit publicado é recusado', () => {
  const h = 'a'.repeat(40);
  const p = analisar({ commit: h, publicacaoEmC: autorizar(BASE, h), versaoEmC: '1.1.0', existeH: true, descende: true, arquivos: [], publicacaoEmH: BASE });
  assert.match(p.join(), /não pode ser o próprio commit publicado/);
});
