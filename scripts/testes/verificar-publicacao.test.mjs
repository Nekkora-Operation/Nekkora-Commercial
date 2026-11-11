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
import { impressaoDaTabela } from '../comercial/impressao-precos.mjs';

const root = resolve('.');
const dir = mkdtempSync(join(tmpdir(), 'portao-publicacao-'));
after(() => rmSync(dir, { recursive: true, force: true }));
cpSync(join(root, 'vendor'), join(dir, 'vendor'), { recursive: true });
const lib = JSON.parse(readFileSync(join(root, 'vendor/nekkora-lib.json'), 'utf8'));
const HASHES = ["'sha256-JDd2nuaninfZZDJOM3fEvC7cCoIy0w7m1A5JfhKL6tE='"];
const policy = (hashes = HASHES, origens) => `${JSON.stringify(responseHeadersPolicy(hashes, origens), null, 2)}\n`;

// Registro fictício da aprovação da tabela (COM-VITRINE-001 §9.3): data e impressão aprovada citadas pela titular
const REGISTRO = (impressao = impressaoDaTabela(), data = '12/11/2026') => `Titular, ${data} (fictício): tabela aprovada, impressão ${impressao}.`;
const complete = () => ({
  $origem: { 'tabelaDePrecos.impressao': REGISTRO() },
  canais: { whatsapp: null, email: 'comercial@empresa-ficticia.com.br', linkedin: 'https://www.linkedin.com/company/empresa-ficticia/', instagram: null },
  agendamento: { url: 'https://bookings.cloud.microsoft/book/AvaliacaoInicial@empresa-ficticia.com.br/', obrigatorio: true },
  envioAutomatico: { endpoint: null, chaveDoSiteTurnstile: null },
  campanhaLancamento: { inicio: '2026-11-01', fim: '2026-12-31' },
  controlador: { nome: 'Empresa Fictícia Ltda.', documento: '11.222.333/0001-81' },
  fornecedor: { endereco: 'Rua Fictícia, 100, Centro, Cidade Fictícia/UF' },
  hospedagem: { provedor: 'Provedor Fictício' },
  aprovacoes: { precos: true, condicoesComerciais: true, textosComerciais: true, avisoDePrivacidade: true, agendamento: true, envioAutomatico: true, publicacao: true },
  avisoHomologacao: false,
  // COM-VITRINE-001: aprovação da tabela do código (impressão digital), data de início e disponibilidade dos serviços
  tabelaDePrecos: { impressao: impressaoDaTabela(), posCampanha: false },
  novasCondicoes: { inicio: '2026-11-10' },
  servicos: { monitor: 'em-preparacao', ai: 'em-preparacao' },
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
const gate = (hoje = '2026-11-15') =>
  new Promise((done) =>
    execFile(process.execPath, [join(root, 'scripts/verificar-publicacao.mjs'), '--hoje', hoje], { cwd: dir, encoding: 'utf8' }, (err, stdout) =>
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

test('o publicacao.json versionado: aprovações da v1.0.0 preservadas, mas a tabela nova bloqueia sem aprovação própria', async () => {
  setup(JSON.parse(readFileSync(join(root, 'publicacao.json'), 'utf8')));
  const r = await gate();
  // COM-VITRINE-001: a tabela do código não tem impressão aprovada (PUB-14) e a data de início das novas condições não
  // foi definida (PUB-13) — o portão BLOQUEIA, mesmo com aprovacoes.precos === true da v1.0.0. São as únicas pendências.
  assert.equal(r.code, 1, r.stdout);
  assert.deepEqual([...new Set([...r.stdout.matchAll(/- ([A-Z]+(?:-\d+)?) —/g)].map((m) => m[1]))].sort(), ['PUB-13', 'PUB-14'], r.stdout);
  assert.match(r.stdout, /PUB-14 — tabela de preços do código sem aprovação própria: impressão sha256:[0-9a-f]{64}, aprovada nenhuma/);
  assert.match(r.stdout, /PUB-14 — registro da aprovação da tabela ausente ou divergente/);
  assert.match(r.stdout, /PUB-13 — data de início das novas condições/);
  // PUB-17/19/09 (commit e4bc72c) e PUB-10/18 (commit 2fdaed6), registradas em $origem: continuam não acusadas
  for (const id of ['PUB-19', 'PUB-17', 'PUB-09', 'PUB-18', 'PUB-10']) assert.doesNotMatch(r.stdout, new RegExp(`${id} —`));
  // PUB-20: URL oficial do Bookings válida e aprovação gravada pela titular em 05/11/2026 — o portão não a acusa mais
  assert.doesNotMatch(r.stdout, /PUB-20/);
  // PUB-22: endereço comercial informado pela titular em 05/11/2026 (cartão CNPJ) — o portão não o acusa mais
  assert.doesNotMatch(r.stdout, /PUB-22/);

  assert.doesNotMatch(r.stdout, /PUB-13 — (datas de início e fim|campanha já encerrada)/);
  // sem endpoint de recebimento automático, a jornada é a do e-mail: nada a aprovar em PUB-21
  assert.doesNotMatch(r.stdout, /PUB-21/);
  // Monitor e AI em preparação: nada a aprovar em PUB-23
  assert.doesNotMatch(r.stdout, /PUB-23/);
  // os dados já informados pela titular passam: e-mail, LinkedIn, CNPJ e provedor; a flag de preços da v1.0.0 continua
  for (const id of ['PUB-02', 'PUB-03', 'PUB-11']) assert.doesNotMatch(r.stdout, new RegExp(`${id} —`));
  assert.doesNotMatch(r.stdout, /PUB-14 — aprovação dos preços/);
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
  // Decreto 7.962/2013, art. 2º, II (NEKKORA-COM-LEGAL-BASE-001)
  ['sem endereço do fornecedor', (p) => (p.fornecedor.endereco = null), /PUB-22/],
  ['sem o bloco fornecedor', (p) => delete p.fornecedor, /PUB-22/],
  ['endereço vazio', (p) => (p.fornecedor.endereco = '   '), /PUB-22/],
  ['preços não aprovados', (p) => (p.aprovacoes.precos = false), /PUB-14/],
  ['condições não aprovadas', (p) => (p.aprovacoes.condicoesComerciais = false), /PUB-19/],
  ['textos não aprovados', (p) => (p.aprovacoes.textosComerciais = false), /PUB-17/],
  ['privacidade não aprovada', (p) => (p.aprovacoes.avisoDePrivacidade = false), /PUB-09 — aprovação do aviso/],
  ['publicação não autorizada', (p) => (p.aprovacoes.publicacao = false), /PUB-18/],
  ['aprovação como texto "true" (não é aprovação)', (p) => (p.aprovacoes.publicacao = 'true'), /PUB-18/],
  ['aviso de homologação ligado', (p) => (p.avisoHomologacao = true), /PUB-10/],
  // COM-VITRINE-001 §9.3: a aprovação vale para UMA tabela — preço alterado sem nova aprovação bloqueia, com a flag true
  ['tabela sem impressão aprovada (flag de preços true)', (p) => (p.tabelaDePrecos.impressao = null), /PUB-14 — tabela de preços do código sem aprovação própria/],
  ['tabela aprovada diferente da do código (preço alterado)', (p) => (p.tabelaDePrecos.impressao = impressaoDaTabela({ delivery: { simples: { individual: 600, pacote: 1500 } } })), /PUB-14 — tabela de preços do código sem aprovação própria/],
  ['sem o bloco tabelaDePrecos', (p) => delete p.tabelaDePrecos, /PUB-14 — tabela de preços do código/],
  // Rastreabilidade (autorização da Etapa 2): a impressão sozinha não é aprovação
  ['impressão preenchida sem registro da titular', (p) => delete p.$origem['tabelaDePrecos.impressao'], /PUB-14 — registro da aprovação da tabela ausente ou divergente/],
  ['sem $origem', (p) => delete p.$origem, /PUB-14 — registro da aprovação da tabela/],
  ['registro citando outra impressão', (p) => (p.$origem['tabelaDePrecos.impressao'] = REGISTRO(impressaoDaTabela({ x: 1 }))), /PUB-14 — registro da aprovação da tabela/],
  ['registro citando duas impressões', (p) => (p.$origem['tabelaDePrecos.impressao'] = `${REGISTRO()} Antes: ${impressaoDaTabela({ x: 1 })}.`), /PUB-14 — registro da aprovação da tabela/],
  ['registro sem data', (p) => (p.$origem['tabelaDePrecos.impressao'] = `Titular: tabela aprovada, impressão ${impressaoDaTabela()}.`), /PUB-14 — registro da aprovação da tabela/],
  ['registro com data inexistente', (p) => (p.$origem['tabelaDePrecos.impressao'] = REGISTRO(undefined, '31/11/2026')), /PUB-14 — registro da aprovação da tabela/],
  ['registro anterior à COM-VITRINE-001 (época da v1.0.0)', (p) => (p.$origem['tabelaDePrecos.impressao'] = REGISTRO(undefined, '05/11/2026')), /PUB-14 — registro da aprovação da tabela/],
  ['registro com data futura', (p) => (p.$origem['tabelaDePrecos.impressao'] = REGISTRO(undefined, '16/11/2026')), /PUB-14 — registro da aprovação da tabela/],
  ['registro sem a autoria da titular', (p) => (p.$origem['tabelaDePrecos.impressao'] = `Equipe, 12/11/2026: impressão ${impressaoDaTabela()}.`), /PUB-14 — registro da aprovação da tabela/],
  ['registro de preços da v1.0.0 reaproveitado', (p) => (p.$origem['tabelaDePrecos.impressao'] = 'COM-RELEASE-003-R1 §3.1 (decisão interna de 22/10/2026): simples R$ 1.500 → R$ 1.000'), /PUB-14 — registro da aprovação da tabela/],
  ['impressão em outro formato', (p) => (p.tabelaDePrecos.impressao = impressaoDaTabela().toUpperCase()), /PUB-14 — tabela de preços do código/],
  // COM-VITRINE-001 §3.1: data de início das novas condições
  ['sem data de início das novas condições', (p) => (p.novasCondicoes.inicio = null), /PUB-13 — data de início das novas condições/],
  ['sem o bloco novasCondicoes', (p) => delete p.novasCondicoes, /PUB-13 — data de início das novas condições/],
  ['data de início no futuro', (p) => (p.novasCondicoes.inicio = '2026-11-16'), /PUB-13 — data de início das novas condições/],
  ['data de início antes da campanha', (p) => (p.novasCondicoes.inicio = '2026-10-31'), /PUB-13 — data de início das novas condições/],
  ['data de início inválida', (p) => (p.novasCondicoes.inicio = '10/11/2026'), /PUB-13 — data de início das novas condições/],
  // COM-VITRINE-001 §3.2 (V-01): campanha encerrada sem a aprovação da tabela pós-campanha
  ['campanha encerrada sem tabela pós-campanha aprovada', (p) => ((p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), (p.novasCondicoes.inicio = '2026-09-01')), /tabela pós-campanha não aprovada/],
  ['pós-campanha como texto "true"', (p) => ((p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), (p.novasCondicoes.inicio = '2026-09-01'), (p.tabelaDePrecos.posCampanha = 'true')), /tabela pós-campanha não aprovada/],
  // COM-VITRINE-001 §7 (V-06): Monitor e AI
  ['Monitor disponível sem aprovação', (p) => (p.servicos.monitor = 'disponivel'), /PUB-23 — servicos\.monitor/],
  ['AI disponível sem aprovação', (p) => (p.servicos.ai = 'disponivel'), /PUB-23 — servicos\.ai/],
  ['AI disponível com aprovação de outro serviço', (p) => ((p.servicos.ai = 'disponivel'), (p.aprovacoes.disponibilidade = { monitor: true })), /PUB-23 — servicos\.ai/],
  ['estado de serviço desconhecido', (p) => (p.servicos.monitor = 'contratar'), /PUB-23 — servicos\.monitor/],
  ['sem o bloco servicos', (p) => delete p.servicos, /PUB-23/],
  // Agendamento (COM-RELEASE-005 §4.5)
  ['agendamento obrigatório sem URL', (p) => (p.agendamento.url = null), /PUB-20 — URL oficial/],
  ['Bookings de outra organização', (p) => (p.agendamento.url = 'https://outlook.office365.com/book/Vendas@outra-empresa.com.br/'), /PUB-20 — URL oficial/],
  ['Bookings fictício (.example)', (p) => ((p.canais.email = 'a@b.example'), (p.agendamento.url = 'https://outlook.office365.com/book/X@b.example/')), /PUB-20 — URL oficial/],
  ['Bookings na página inicial', (p) => (p.agendamento.url = 'https://outlook.office365.com/'), /PUB-20 — URL oficial/],
  ['Bookings fora da Microsoft', (p) => (p.agendamento.url = 'https://bookings.exemplo.com.br/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['Bookings em http', (p) => (p.agendamento.url = 'http://outlook.office365.com/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  // NEKKORA-COM-007: domínio atual (bookings.cloud.microsoft) — mesma regra de src/agendamento-url.js
  ['Bookings novo em http', (p) => (p.agendamento.url = 'http://bookings.cloud.microsoft/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['Bookings novo na página inicial', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/'), /PUB-20 — URL oficial/],
  ['Bookings novo de outra organização', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/Vendas@outra-empresa.com.br/'), /PUB-20 — URL oficial/],
  ['host parecido com o da Microsoft', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft.com/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['subdomínio malicioso', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft.evil.example/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['credenciais embutidas', (p) => (p.agendamento.url = 'https://u:s@bookings.cloud.microsoft/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['caminho inválido', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/calendar/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['caixa disfarçada com "/" codificado', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/x%2F@empresa-ficticia.com.br/'), /PUB-20 — URL oficial/],
  ['URL malformada', (p) => (p.agendamento.url = 'https://'), /PUB-20 — URL oficial/],
  ['domínio fictício em produção (domínio atual)', (p) => ((p.canais.email = 'a@b.test'), (p.agendamento.url = 'https://bookings.cloud.microsoft/book/X@b.test/')), /PUB-20 — URL oficial/],
  ['caixa *.onmicrosoft.com sem tenant declarado', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/AvaliacaoInicial@empresaficticia.onmicrosoft.com/'), /PUB-20 — URL oficial/],
  [
    'caixa *.onmicrosoft.com de outro tenant',
    (p) => ((p.agendamento.dominioDoTenant = 'empresaficticia.onmicrosoft.com'), (p.agendamento.url = 'https://bookings.cloud.microsoft/book/X@outra.onmicrosoft.com/')),
    /PUB-20 — URL oficial/,
  ],
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

test('impressão: qualquer valor da tabela alterado muda a impressão (preço novo sem aprovação bloqueia)', async () => {
  const { PRICE_TABLE, PACKAGE_SIZE, PLANNED_RECURRING_PRICES } = await import('../../src/precos.ts');
  const base = { delivery: PRICE_TABLE, tamanhoDoPacote: PACKAGE_SIZE, recorrentesPrevistos: PLANNED_RECURRING_PRICES };
  const atual = impressaoDaTabela();
  assert.equal(impressaoDaTabela(structuredClone(base)), atual, 'a mesma tabela gera a mesma impressão');
  const alteracoes = [
    (t) => (t.delivery.simples.individual += 1),
    (t) => (t.delivery.simples.pacote -= 1),
    (t) => (t.delivery.media.individual += 100),
    (t) => (t.delivery.media.pacote += 1),
    (t) => (t.tamanhoDoPacote = 4),
    (t) => (t.recorrentesPrevistos.monitor.mensal = 80),
    (t) => (t.recorrentesPrevistos.ai.mensal = 90),
  ];
  for (const muda of alteracoes) {
    const t = structuredClone(base);
    muda(t);
    assert.notEqual(impressaoDaTabela(t), atual, String(muda));
  }
});

test('campanha encerrada com a tabela pós-campanha aprovada (V-01): libera', async () => {
  const p = complete();
  p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' };
  p.novasCondicoes.inicio = '2026-09-01';
  p.tabelaDePrecos.posCampanha = true;
  setup(p);
  const r = await gate();
  assert.equal(r.code, 0, r.stdout);
});

test('Monitor disponível com aprovação própria: libera', async () => {
  const p = complete();
  p.servicos.monitor = 'disponivel';
  p.aprovacoes.disponibilidade = { monitor: true };
  setup(p);
  const r = await gate();
  assert.equal(r.code, 0, r.stdout);
});

test('data de início das novas condições no próprio dia do deploy: libera', async () => {
  const p = complete();
  p.novasCondicoes.inicio = '2026-11-15';
  setup(p);
  assert.equal((await gate('2026-11-15')).code, 0);
});

test('agendamento fora do lançamento: sem URL, libera (o botão não aparece)', async () => {
  const p = complete();
  p.agendamento = { url: null, obrigatorio: false };
  p.aprovacoes.agendamento = false;
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('Bookings no formato legado (outlook.office365.com) continua aceito', async () => {
  const p = complete();
  p.agendamento.url = 'https://outlook.office365.com/book/AvaliacaoInicial@empresa-ficticia.com.br/';
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('Bookings com a caixa do tenant (*.onmicrosoft.com): só a do tenant declarado em agendamento.dominioDoTenant', async () => {
  const p = complete();
  p.agendamento.dominioDoTenant = 'empresaficticia.onmicrosoft.com';
  p.agendamento.url = 'https://bookings.cloud.microsoft/book/AvaliacaoInicial@empresaficticia.onmicrosoft.com/';
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
