/**
 * Portão de publicação (scripts/verificar-publicacao.mjs) numa cópia temporária do projeto: libera só com tudo
 * confirmado e bloqueia cada pendência isoladamente. Os valores "completos" abaixo são FICTÍCIOS e só existem no teste
 * (o CNPJ fictício tem dígitos verificadores válidos, mas não é o da Nekkora).
 */
import { execFile } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { responseHeadersPolicy } from '../../deploy/aws/cabecalhos.mjs';

const root = resolve('.');
const dir = mkdtempSync(join(tmpdir(), 'portao-publicacao-'));
after(() => rmSync(dir, { recursive: true, force: true }));
cpSync(join(root, 'vendor'), join(dir, 'vendor'), { recursive: true });
const lib = JSON.parse(readFileSync(join(root, 'vendor/nekkora-lib.json'), 'utf8'));
const HASHES = ["'sha256-JDd2nuaninfZZDJOM3fEvC7cCoIy0w7m1A5JfhKL6tE='"];
const policy = (hashes = HASHES, origens) => `${JSON.stringify(responseHeadersPolicy(hashes, origens), null, 2)}\n`;

const complete = () => ({
  canais: { whatsapp: null, email: 'comercial@empresa-ficticia.com.br', linkedin: 'https://www.linkedin.com/company/empresa-ficticia/', instagram: null },
  agendamento: { url: 'https://outlook.office365.com/book/AvaliacaoInicial@empresa-ficticia.com.br/', obrigatorio: true },
  envioAutomatico: { endpoint: null, chaveDoSiteTurnstile: null },
  campanhaLancamento: { inicio: '2026-11-01', fim: '2026-12-31' },
  controlador: { nome: 'Empresa Fictícia Ltda.', documento: '11.222.333/0001-81' },
  hospedagem: { provedor: 'Provedor Fictício' },
  aprovacoes: { precos: true, condicoesComerciais: true, textosComerciais: true, avisoDePrivacidade: true, agendamento: true, envioAutomatico: true, publicacao: true },
  avisoHomologacao: false,
});
const release = () => ({ homologacao: false, publicacao: 'publicacao.json', arvoreLimpa: true, nekkoraLib: { integridade: lib.integridade }, cspScriptHashes: HASHES });

function setup(pub, rel = release(), { versionedPolicy = policy(), headersFile = false } = {}) {
  writeFileSync(join(dir, 'publicacao.json'), JSON.stringify(pub));
  rmSync(join(dir, 'dist'), { recursive: true, force: true });
  mkdirSync(join(dir, 'dist'), { recursive: true });
  mkdirSync(join(dir, 'deploy/aws'), { recursive: true });
  writeFileSync(join(dir, 'dist/release.json'), JSON.stringify(rel));
  writeFileSync(join(dir, 'deploy/aws/politica-cabecalhos.json'), versionedPolicy);
  if (headersFile) writeFileSync(join(dir, 'dist/_headers'), "Content-Security-Policy: default-src 'self'");
}
const gate = () =>
  new Promise((done) =>
    execFile(process.execPath, [join(root, 'scripts/verificar-publicacao.mjs'), '--hoje', '2026-10-22'], { cwd: dir, encoding: 'utf8' }, (err, stdout) =>
      done({ code: err ? err.code : 0, stdout }),
    ),
  );

test('tudo confirmado: libera (só e-mail e LinkedIn, sem WhatsApp)', async () => {
  setup(complete());
  const r = await gate();
  assert.equal(r.code, 0, r.stdout);
  assert.match(r.stdout, /Publicação liberada/);
});

test('WhatsApp válido também é aceito', async () => {
  const p = complete();
  p.canais.whatsapp = '5511987654321';
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('o publicacao.json versionado continua bloqueado (nenhuma aprovação presumida)', async () => {
  setup(JSON.parse(readFileSync(join(root, 'publicacao.json'), 'utf8')));
  const r = await gate();
  assert.equal(r.code, 1, r.stdout);
  // PUB-20: o agendamento faz parte do lançamento (COM-RELEASE-005) e a URL oficial do Bookings ainda não foi informada
  for (const id of ['PUB-13', 'PUB-19', 'PUB-17', 'PUB-18', 'PUB-10', 'PUB-20']) assert.match(r.stdout, new RegExp(id));
  // sem endpoint de recebimento automático, a jornada é a do e-mail: nada a aprovar em PUB-21
  assert.doesNotMatch(r.stdout, /PUB-21/);
  // os dados já informados pela titular passam: e-mail, LinkedIn, CNPJ, provedor e preços
  for (const id of ['PUB-02', 'PUB-03', 'PUB-11', 'PUB-14']) assert.doesNotMatch(r.stdout, new RegExp(`${id} —`));
  assert.doesNotMatch(r.stdout, /CNPJ ou CPF válido/);
});

const cases = [
  ['WhatsApp marcador (zeros)', (p) => (p.canais.whatsapp = '5500000000000'), /PUB-01/],
  ['sem e-mail', (p) => (p.canais.email = null), /PUB-02/],
  ['e-mail de domínio reservado (.invalid)', (p) => (p.canais.email = 'contato@exemplo.invalid'), /PUB-02/],
  ['sem LinkedIn', (p) => (p.canais.linkedin = null), /PUB-03/],
  ['LinkedIn na página inicial', (p) => (p.canais.linkedin = 'https://www.linkedin.com/'), /PUB-03/],
  ['LinkedIn de outro domínio', (p) => (p.canais.linkedin = 'https://example.com/company/x'), /PUB-03/],
  ['campanha sem datas', (p) => (p.campanhaLancamento = { inicio: null, fim: null }), /PUB-13/],
  ['campanha encerrada', (p) => (p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), /PUB-13 — campanha já encerrada/],
  ['sem razão social', (p) => (p.controlador.nome = null), /PUB-09 — controlador dos dados: razão social/],
  ['sem documento', (p) => (p.controlador.documento = null), /CNPJ ou CPF válido/],
  ['CNPJ com dígito errado', (p) => (p.controlador.documento = '11.222.333/0001-82'), /CNPJ ou CPF válido/],
  ['CNPJ marcador (zeros)', (p) => (p.controlador.documento = '00.000.000/0000-00'), /CNPJ ou CPF válido/],
  ['sem provedor', (p) => (p.hospedagem.provedor = null), /PUB-11/],
  ['preços não aprovados', (p) => (p.aprovacoes.precos = false), /PUB-14/],
  ['condições não aprovadas', (p) => (p.aprovacoes.condicoesComerciais = false), /PUB-19/],
  ['textos não aprovados', (p) => (p.aprovacoes.textosComerciais = false), /PUB-17/],
  ['privacidade não aprovada', (p) => (p.aprovacoes.avisoDePrivacidade = false), /PUB-09 — aprovação do aviso/],
  ['publicação não autorizada', (p) => (p.aprovacoes.publicacao = false), /PUB-18/],
  ['aprovação como texto "true" (não é aprovação)', (p) => (p.aprovacoes.publicacao = 'true'), /PUB-18/],
  ['aviso de homologação ligado', (p) => (p.avisoHomologacao = true), /PUB-10/],
  // Agendamento (COM-RELEASE-005 §4.5)
  ['agendamento obrigatório sem URL', (p) => (p.agendamento.url = null), /PUB-20 — URL oficial/],
  ['Bookings de outra organização', (p) => (p.agendamento.url = 'https://outlook.office365.com/book/Vendas@outra-empresa.com.br/'), /PUB-20 — URL oficial/],
  ['Bookings fictício (.example)', (p) => ((p.canais.email = 'a@b.example'), (p.agendamento.url = 'https://outlook.office365.com/book/X@b.example/')), /PUB-20 — URL oficial/],
  ['Bookings na página inicial', (p) => (p.agendamento.url = 'https://outlook.office365.com/'), /PUB-20 — URL oficial/],
  ['Bookings fora da Microsoft', (p) => (p.agendamento.url = 'https://bookings.exemplo.com.br/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['Bookings em http', (p) => (p.agendamento.url = 'http://outlook.office365.com/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['Bookings sem confirmação da titular', (p) => (p.aprovacoes.agendamento = false), /PUB-20 — confirmação da titular/],
  // Recebimento automático (COM-RELEASE-005 §5)
  ['endpoint em http', (p) => (p.envioAutomatico = { endpoint: 'http://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), /PUB-21 — endpoint/],
  ['endpoint com outro caminho', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/enviar', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), /PUB-21 — endpoint/],
  ['endpoint sem desafio', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: null }), /PUB-21 — chave do site/],
  ['chave de teste do Turnstile', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '1x00000000000000000000AA' }), /PUB-21 — chave do site/],
  [
    'envio automático sem autorização',
    (p) => ((p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), (p.aprovacoes.envioAutomatico = false)),
    /PUB-21 — autorização/,
  ],
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

test('agendamento fora do lançamento: sem URL, libera (o botão não aparece)', async () => {
  const p = complete();
  p.agendamento = { url: null, obrigatorio: false };
  p.aprovacoes.agendamento = false;
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('Bookings com a caixa do tenant (*.onmicrosoft.com) também é aceito', async () => {
  const p = complete();
  p.agendamento.url = 'https://outlook.office365.com/book/AvaliacaoInicial@empresaficticia.onmicrosoft.com/';
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('envio automático completo: libera só com a CSP do build incluindo a origem da API e o Turnstile', async () => {
  const p = complete();
  p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' };
  const origens = { connect: ['https://api.empresa-ficticia.com.br'], script: ['https://challenges.cloudflare.com'], frame: ['https://challenges.cloudflare.com'] };
  setup(p, { ...release(), cspOrigens: origens }, { versionedPolicy: policy(HASHES, origens) });
  const ok = await gate();
  assert.equal(ok.code, 0, ok.stdout);
  // política versionada sem as origens novas: no CloudFront, a página não conseguiria falar com a API
  setup(p, { ...release(), cspOrigens: origens }, { versionedPolicy: policy(HASHES) });
  const r = await gate();
  assert.equal(r.code, 1);
  assert.match(r.stdout, /politica-cabecalhos\.json não corresponde/);
});

test('aceita CPF válido no lugar do CNPJ', async () => {
  const p = complete();
  p.controlador.documento = '529.982.247-25';
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('bloqueia artefato de homologação, árvore suja, outra lib, CSP divergente e _headers', async () => {
  for (const [rel, opts, expected] of [
    [{ ...release(), homologacao: true, publicacao: 'scripts/fixtures/publicacao-homologacao.json' }, {}, /dados de homologação/],
    [{ ...release(), arvoreLimpa: false }, {}, /não commitadas/],
    [{ ...release(), nekkoraLib: { integridade: 'sha512-outra' } }, {}, /outra versão da nekkora-lib/],
    // script inline mudou e a política versionada não acompanhou: a página quebraria no CloudFront
    [{ ...release(), cspScriptHashes: ["'sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='"] }, {}, /politica-cabecalhos\.json não corresponde/],
    [release(), { versionedPolicy: '{}' }, /politica-cabecalhos\.json não corresponde/],
    [release(), { headersFile: true }, /_headers do Cloudflare Pages/],
  ]) {
    setup(complete(), rel, opts);
    const r = await gate();
    assert.equal(r.code, 1, r.stdout);
    assert.match(r.stdout, expected);
  }
});
