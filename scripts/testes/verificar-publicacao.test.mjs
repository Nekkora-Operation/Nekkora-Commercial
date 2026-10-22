/**
 * Portão de publicação (scripts/verificar-publicacao.mjs) numa cópia temporária do projeto: libera só com tudo
 * confirmado e bloqueia cada pendência isoladamente. Os valores "completos" abaixo são FICTÍCIOS e só existem no teste.
 */
import { execFile } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';

const root = resolve('.');
const dir = mkdtempSync(join(tmpdir(), 'portao-publicacao-'));
after(() => rmSync(dir, { recursive: true, force: true }));
cpSync(join(root, 'vendor'), join(dir, 'vendor'), { recursive: true });
const lib = JSON.parse(readFileSync(join(root, 'vendor/nekkora-lib.json'), 'utf8'));

const complete = () => ({
  canais: { whatsapp: '5511987654321', email: 'comercial@empresa-ficticia.com.br', linkedin: 'https://www.linkedin.com/company/empresa-ficticia/', instagram: null },
  campanhaLancamento: { inicio: '2026-11-01', fim: '2026-12-31' },
  controlador: { nome: 'Empresa Fictícia Ltda.', documento: '00.000.000/0001-00' },
  hospedagem: { provedor: 'Provedor Fictício' },
  aprovacoes: { precosECondicoes: true, textosComerciais: true, avisoDePrivacidade: true, publicacao: true },
  avisoHomologacao: false,
});
const release = () => ({ homologacao: false, publicacao: 'publicacao.json', arvoreLimpa: true, nekkoraLib: { integridade: lib.integridade } });

function setup(pub, rel = release(), headers = 'Content-Security-Policy: default-src \'self\'') {
  writeFileSync(join(dir, 'publicacao.json'), JSON.stringify(pub));
  mkdirSync(join(dir, 'dist'), { recursive: true });
  writeFileSync(join(dir, 'dist/release.json'), JSON.stringify(rel));
  writeFileSync(join(dir, 'dist/_headers'), headers);
}
const gate = () =>
  new Promise((done) =>
    execFile(process.execPath, [join(root, 'scripts/verificar-publicacao.mjs'), '--hoje', '2026-10-22'], { cwd: dir, encoding: 'utf8' }, (err, stdout) =>
      done({ code: err ? err.code : 0, stdout }),
    ),
  );

test('tudo confirmado: libera', async () => {
  setup(complete());
  const r = await gate();
  assert.equal(r.code, 0, r.stdout);
  assert.match(r.stdout, /Publicação liberada/);
});

const cases = [
  ['sem WhatsApp', (p) => (p.canais.whatsapp = null), /PUB-01/],
  ['WhatsApp marcador (zeros)', (p) => (p.canais.whatsapp = '5500000000000'), /PUB-01/],
  ['e-mail de domínio reservado (.invalid)', (p) => (p.canais.email = 'contato@exemplo.invalid'), /PUB-02/],
  ['LinkedIn na página inicial', (p) => (p.canais.linkedin = 'https://www.linkedin.com/'), /PUB-03/],
  ['LinkedIn de outro domínio', (p) => (p.canais.linkedin = 'https://example.com/company/x'), /PUB-03/],
  ['campanha sem datas', (p) => (p.campanhaLancamento = { inicio: null, fim: null }), /PUB-13/],
  ['campanha encerrada', (p) => (p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), /PUB-13 — campanha já encerrada/],
  ['sem controlador', (p) => (p.controlador.documento = null), /PUB-09/],
  ['sem provedor', (p) => (p.hospedagem.provedor = null), /PUB-11/],
  ['preços não aprovados', (p) => (p.aprovacoes.precosECondicoes = false), /PUB-14/],
  ['publicação não autorizada', (p) => (p.aprovacoes.publicacao = false), /PUB-18/],
  ['aviso de homologação ligado', (p) => (p.avisoHomologacao = true), /PUB-10/],
];
for (const [name, mutate, expected] of cases) {
  test(`bloqueia: ${name}`, async () => {
    const p = complete();
    mutate(p);
    setup(p);
    const r = await gate();
    assert.equal(r.code, 1, r.stdout);
    assert.match(r.stdout, expected);
  });
}

test('bloqueia artefato de homologação, árvore suja, outra lib e _headers com marcador', async () => {
  for (const [rel, headers, expected] of [
    [{ ...release(), homologacao: true, publicacao: 'scripts/fixtures/publicacao-homologacao.json' }, undefined, /dados de homologação/],
    [{ ...release(), arvoreLimpa: false }, undefined, /não commitadas/],
    [{ ...release(), nekkoraLib: { integridade: 'sha512-outra' } }, undefined, /outra versão da nekkora-lib/],
    [release(), "script-src 'self' {{SCRIPT_HASHES}}", /marcador não substituído/],
  ]) {
    setup(complete(), rel, headers);
    const r = await gate();
    assert.equal(r.code, 1, r.stdout);
    assert.match(r.stdout, expected);
  }
});
