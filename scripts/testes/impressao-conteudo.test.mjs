/**
 * PUB-17 e PUB-19 por impressão do conteúdo (COM-VITRINE-001 §12, decisão da titular de 12/11/2026, forma b), numa
 * cópia temporária do projeto: com o conteúdo aprovado o portão libera; qualquer texto ou condição alterados, em
 * qualquer arquivo coberto, bloqueiam até nova aprovação. Aprovações e registros abaixo são FICTÍCIOS e só existem no
 * teste — o publicacao.json versionado não é tocado.
 */
import { execFile } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { responseHeadersPolicy } from '../../deploy/aws/cabecalhos.mjs';
import { impressaoDaTabela } from '../comercial/impressao-precos.mjs';
import { ITENS, impressaoDoConteudo, listaCanonica } from '../comercial/impressao-conteudo.mjs';

const root = resolve('.');
const dir = mkdtempSync(join(tmpdir(), 'impressao-conteudo-'));
after(() => rmSync(dir, { recursive: true, force: true }));
for (const p of ['package.json', 'src', 'public', 'index.html', 'vite.config.ts', 'docs/comercial', 'vendor', 'scripts/verificar-publicacao.mjs', 'scripts/comercial', 'deploy/aws/cabecalhos.mjs']) {
  cpSync(join(root, p), join(dir, p), { recursive: true });
}
const lib = JSON.parse(readFileSync(join(root, 'vendor/nekkora-lib.json'), 'utf8'));
const HASHES = ["'sha256-JDd2nuaninfZZDJOM3fEvC7cCoIy0w7m1A5JfhKL6tE='"];
mkdirSync(join(dir, 'dist'), { recursive: true });
writeFileSync(join(dir, 'dist/release.json'), JSON.stringify({ aplicacao: `${JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name}@${JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version}`, homologacao: false, publicacao: 'publicacao.json', arvoreLimpa: true, nekkoraLib: { integridade: lib.integridade }, cspScriptHashes: HASHES }));
writeFileSync(join(dir, 'deploy/aws/politica-cabecalhos.json'), `${JSON.stringify(responseHeadersPolicy(HASHES), null, 2)}\n`);

// Conteúdo "aprovado" no teste = o da cópia, antes de qualquer alteração
const APROVADA = { textosComerciais: impressaoDoConteudo('textosComerciais', dir), condicoesComerciais: impressaoDoConteudo('condicoesComerciais', dir) };
const VERSAO = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const reg = (i) => `Titular, 12/11/2026 (fictício): aprovado, impressão ${i}.`;
writeFileSync(
  join(dir, 'publicacao.json'),
  JSON.stringify({
    $origem: {
      'tabelaDePrecos.impressao': reg(impressaoDaTabela()),
      'impressoesDeConteudo.textosComerciais': reg(APROVADA.textosComerciais),
      'impressoesDeConteudo.condicoesComerciais': reg(APROVADA.condicoesComerciais),
      'novasCondicoes.inicio': 'Titular, 12/11/2026 (fictício): data de início 2026-11-12.',
      'tabelaDePrecos.posCampanha': reg(impressaoDaTabela()),
      publicacaoAutorizada: `Titular, 12/11/2026 (fictício): versão ${VERSAO}, commit homologado ${'b'.repeat(40)}.`,
    },
    canais: { whatsapp: '5511987654321', email: 'comercial@empresa-ficticia.com.br', linkedin: 'https://www.linkedin.com/company/empresa-ficticia/', instagram: null },
    agendamento: { url: null, obrigatorio: false },
    envioAutomatico: { endpoint: null, chaveDoSiteTurnstile: null },
    campanhaLancamento: { inicio: '2026-11-01', fim: '2026-12-31' },
    controlador: { nome: 'Empresa Fictícia Ltda.', documento: '11.222.333/0001-81' },
    fornecedor: { endereco: 'Rua Fictícia, 100, Centro, Cidade Fictícia/UF' },
    hospedagem: { provedor: 'Provedor Fictício' },
    aprovacoes: { precos: true, condicoesComerciais: true, textosComerciais: true, avisoDePrivacidade: true, agendamento: false, envioAutomatico: false, publicacao: true },
    avisoHomologacao: false,
    tabelaDePrecos: { impressao: impressaoDaTabela(), posCampanha: true },
    novasCondicoes: { inicio: '2026-11-12' },
    servicos: { monitor: 'em-preparacao', ai: 'em-preparacao' },
    impressoesDeConteudo: APROVADA,
    publicacaoAutorizada: { versao: VERSAO, commit: 'b'.repeat(40) },
  }),
);

const gate = () =>
  new Promise((done) =>
    execFile(process.execPath, [join(dir, 'scripts/verificar-publicacao.mjs'), '--hoje', '2026-11-15'], { cwd: dir, encoding: 'utf8' }, (err, stdout) =>
      done({ code: err ? err.code : 0, ids: [...new Set([...stdout.matchAll(/- ([A-Z]+(?:-\d+)?) —/g)].map((m) => m[1]))].sort(), stdout }),
    ),
  );

/** Altera um arquivo da cópia, roda o portão e restaura o original (ou apaga o arquivo criado). */
async function alterado(caminho, muda) {
  const abs = join(dir, caminho);
  let antes = null;
  try {
    antes = readFileSync(abs);
  } catch {}
  writeFileSync(abs, muda(antes?.toString('utf8') ?? ''));
  try {
    return await gate();
  } finally {
    if (antes == null) rmSync(abs);
    else writeFileSync(abs, antes);
  }
}
const troca = (de, para) => (t) => {
  assert.ok(t.includes(de), `trecho não encontrado: ${de}`);
  return t.replace(de, para);
};

test('conteúdo aprovado: libera (impressões e registros conferem)', async () => {
  const r = await gate();
  assert.equal(r.code, 0, r.stdout);
});

const casos = [
  // textos e condições exibidos (src/): bloqueiam PUB-17 e PUB-19
  ['texto da página alterado (content.ts)', 'src/content.ts', troca('A automação é sua', 'A automação é nossa'), ['PUB-17', 'PUB-19']],
  ['condição da campanha alterada (content.ts)', 'src/content.ts', troca('Campanha de lançamento para solicitações de avaliação recebidas', 'Campanha de lançamento para todas as solicitações recebidas'), ['PUB-17', 'PUB-19']],
  ['componente deixa de mostrar um texto (Pricing.tsx)', 'src/sections/Pricing.tsx', troca('{PRICING.notes.map((n) => (', '{PRICING.notes.slice(1).map((n) => ('), ['PUB-17', 'PUB-19']],
  ['estilo que esconde conteúdo (styles.css)', 'src/styles.css', (t) => `${t}\n.price-notes { display: none; }\n`, ['PUB-17', 'PUB-19']],
  ['arquivo novo com texto em src/', 'src/sections/Novo.tsx', () => "export const Novo = () => <p>Desconto de 90% para todos.</p>;\n", ['PUB-17', 'PUB-19']],
  // montagem da página, fora de src/: só PUB-17
  ['título da página alterado (index.html)', 'index.html', troca('<title>', '<title>Oferta: '), ['PUB-17']],
  ['arquivo público alterado (public/)', 'public/robots.txt', (t) => `${t}# alterado\n`, ['PUB-17']],
  // documentos das condições oferecidas: só PUB-19
  ['regulamento da campanha alterado', 'docs/comercial/regulamento-campanha-lancamento.md', (t) => `${t}\nNova regra: sem limite de pacotes.\n`, ['PUB-19']],
  ['histórico das condições alterado', 'docs/comercial/condicoes-comerciais-minuta.md', (t) => `${t}\nAlteração.\n`, ['PUB-19']],
];
for (const [nome, caminho, muda, esperado] of casos) {
  test(`bloqueia: ${nome} → ${esperado.join(' e ')}`, async () => {
    const r = await alterado(caminho, muda);
    assert.equal(r.code, 1, r.stdout);
    assert.deepEqual(r.ids, esperado, r.stdout);
    for (const id of esperado) {
      assert.match(r.stdout, new RegExp(`${id} — (textos|condições) comerciais sem aprovação própria`));
      assert.match(r.stdout, new RegExp(`${id} — registro da aprovação`));
    }
  });
}

test('arquivo removido de src/ também muda as impressões', () => {
  const abs = join(dir, 'src/sections/Hosting.tsx');
  const antes = readFileSync(abs);
  rmSync(abs);
  try {
    assert.notEqual(impressaoDoConteudo('textosComerciais', dir), APROVADA.textosComerciais);
    assert.notEqual(impressaoDoConteudo('condicoesComerciais', dir), APROVADA.condicoesComerciais);
  } finally {
    writeFileSync(abs, antes);
  }
});

test('aprovações e registros ficam fora: alterar publicacao.json não muda as impressões', () => {
  const abs = join(dir, 'publicacao.json');
  const antes = readFileSync(abs, 'utf8');
  const p = JSON.parse(antes);
  p.$origem['impressoesDeConteudo.textosComerciais'] = 'outro registro';
  p.impressoesDeConteudo = { textosComerciais: null, condicoesComerciais: null };
  writeFileSync(abs, JSON.stringify(p));
  try {
    assert.equal(impressaoDoConteudo('textosComerciais', dir), APROVADA.textosComerciais);
    assert.equal(impressaoDoConteudo('condicoesComerciais', dir), APROVADA.condicoesComerciais);
    for (const item of Object.keys(ITENS)) assert.doesNotMatch(listaCanonica(item, dir), /publicacao\.json/);
  } finally {
    writeFileSync(abs, antes);
  }
});

test('instrumentos de contratação fora de PUB-19: aprovar as condições oferecidas não aprova o contrato', () => {
  const lista = listaCanonica('condicoesComerciais', dir);
  for (const doc of ['contrato-base-delivery.md', 'proposta-modelo-delivery.md', 'anexo-componentes-delivery.md', 'procedimento-operacional-delivery.md']) {
    assert.doesNotMatch(lista, new RegExp(doc.replace('.', '\\.')), doc);
  }
  assert.match(lista, /docs\/comercial\/regulamento-campanha-lancamento\.md/);
  assert.match(lista, /src\/content\.ts/);
});

test('determinística: mesmo conteúdo, mesma impressão; CRLF e LF equivalem; itens com impressões distintas', () => {
  assert.equal(impressaoDoConteudo('textosComerciais', dir), impressaoDoConteudo('textosComerciais', dir));
  assert.notEqual(APROVADA.textosComerciais, APROVADA.condicoesComerciais);
  const abs = join(dir, 'src/content.ts');
  const antes = readFileSync(abs, 'utf8');
  writeFileSync(abs, antes.replace(/\r?\n/g, '\r\n'));
  try {
    assert.equal(impressaoDoConteudo('textosComerciais', dir), APROVADA.textosComerciais);
  } finally {
    writeFileSync(abs, antes);
  }
  // a cópia é idêntica ao projeto: as impressões do projeto são as mesmas
  assert.equal(impressaoDoConteudo('textosComerciais'), APROVADA.textosComerciais);
  assert.equal(impressaoDoConteudo('condicoesComerciais'), APROVADA.condicoesComerciais);
});
