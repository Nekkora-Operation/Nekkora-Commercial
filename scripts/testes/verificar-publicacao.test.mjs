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
import { impressaoDoConteudo } from '../comercial/impressao-conteudo.mjs';

const root = resolve('.');
const dir = mkdtempSync(join(tmpdir(), 'portao-publicacao-'));
after(() => rmSync(dir, { recursive: true, force: true }));
cpSync(join(root, 'vendor'), join(dir, 'vendor'), { recursive: true });
const lib = JSON.parse(readFileSync(join(root, 'vendor/nekkora-lib.json'), 'utf8'));
const HASHES = ["'sha256-JDd2nuaninfZZDJOM3fEvC7cCoIy0w7m1A5JfhKL6tE='"];
const policy = (hashes = HASHES, origens) => `${JSON.stringify(responseHeadersPolicy(hashes, origens), null, 2)}\n`;

// Registro fictício da aprovação da tabela (COM-VITRINE-001 §9.3): data e impressão aprovada citadas pela titular
const REGISTRO = (impressao = impressaoDaTabela(), data = '12/11/2026') => `Titular, ${data} (fictício): tabela aprovada, impressão ${impressao}.`;
// Registros fictícios das aprovações de PUB-17 e PUB-19 (COM-VITRINE-001 §12, forma b): data e impressão do conteúdo
const TEXTOS = impressaoDoConteudo('textosComerciais');
const CONDICOES = impressaoDoConteudo('condicoesComerciais');
const REGISTRO_DE = (impressao, data = '12/11/2026') => `Titular, ${data} (fictício): conteúdo aprovado, impressão ${impressao}.`;
// PUB-18: versão do package.json da cópia e commit homologado (fictícios)
const VERSAO = '9.9.9-teste';
const HOMOLOGADO = 'a'.repeat(40);
writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'copia-de-teste', version: VERSAO }));
const complete = () => ({
  $origem: {
    'tabelaDePrecos.impressao': REGISTRO(),
    'impressoesDeConteudo.textosComerciais': REGISTRO_DE(TEXTOS),
    'impressoesDeConteudo.condicoesComerciais': REGISTRO_DE(CONDICOES),
    // L-02 e V-01 (titular, 12/11/2026): data de início e continuidade da tabela com registro próprio (fictícios)
    'novasCondicoes.inicio': 'Titular, 12/11/2026 (fictício): data de início das novas condições 2026-11-12, data da publicação.',
    'tabelaDePrecos.posCampanha': REGISTRO_DE(impressaoDaTabela()),
    // PUB-18 (titular, 12/11/2026): autorização de UMA versão e UM commit homologado (fictícios)
    publicacaoAutorizada: `Titular, 12/11/2026 (fictício): autorizo a publicação da versão ${VERSAO}, commit homologado ${HOMOLOGADO}.`,
  },
  // NEKKORA-COM-CANAIS-001: WhatsApp obrigatório (único canal de atendimento); sem Bookings nem envio automático
  canais: { whatsapp: '5511987654321', email: 'comercial@empresa-ficticia.com.br', linkedin: 'https://www.linkedin.com/company/empresa-ficticia/', instagram: null },
  agendamento: { url: null, obrigatorio: false },
  envioAutomatico: { endpoint: null, chaveDoSiteTurnstile: null },
  campanhaLancamento: { inicio: '2026-11-01', fim: '2026-12-31' },
  controlador: { nome: 'Empresa Fictícia Ltda.', documento: '11.222.333/0001-81' },
  fornecedor: { endereco: 'Rua Fictícia, 100, Centro, Cidade Fictícia/UF' },
  hospedagem: { provedor: 'Provedor Fictício' },
  aprovacoes: { precos: true, condicoesComerciais: true, textosComerciais: true, avisoDePrivacidade: true, agendamento: true, envioAutomatico: true, publicacao: true },
  avisoHomologacao: false,
  // COM-VITRINE-001: aprovação da tabela do código (impressão digital), data de início e disponibilidade dos serviços
  tabelaDePrecos: { impressao: impressaoDaTabela(), posCampanha: true },
  novasCondicoes: { inicio: '2026-11-12' },
  servicos: { monitor: 'em-preparacao', ai: 'em-preparacao' },
  impressoesDeConteudo: { textosComerciais: TEXTOS, condicoesComerciais: CONDICOES },
  publicacaoAutorizada: { versao: VERSAO, commit: HOMOLOGADO },
});
const release = () => ({ aplicacao: `copia-de-teste@${VERSAO}`, homologacao: false, publicacao: 'publicacao.json', arvoreLimpa: true, nekkoraLib: { integridade: lib.integridade }, cspScriptHashes: HASHES });

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

test('tudo confirmado: libera (WhatsApp, e-mail da empresa e LinkedIn; sem Bookings nem envio automático)', async () => {
  setup(complete());
  const r = await gate();
  assert.equal(r.code, 0, r.stdout);
  assert.match(r.stdout, /Publicação liberada/);
});

test('Instagram institucional (perfil do instagram.com) também é aceito', async () => {
  const p = complete();
  p.canais.instagram = 'https://www.instagram.com/empresa.ficticia/';
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('o publicacao.json versionado: PUB-14/V-01 e PUB-13 preservadas; PUB-17/19 só com a aprovação do conteúdo atual; PUB-18 só com a autorização desta versão', async () => {
  const real = JSON.parse(readFileSync(join(root, 'publicacao.json'), 'utf8'));
  // a cópia usa a versão REAL do package.json e um artefato dessa versão, para a PUB-18 ser conferida como no deploy
  const versaoReal = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'copia-de-teste', version: versaoReal }));
  let r;
  try {
    setup(real, { ...release(), aplicacao: `copia-de-teste@${versaoReal}` });
    r = await gate();
  } finally {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'copia-de-teste', version: VERSAO }));
  }
  const pendencias = [...new Set([...r.stdout.matchAll(/- ([A-Z]+(?:-\d+)?) —/g)].map((m) => m[1]))].sort();
  // A flag aprovacoes.publicacao herdada da v1.0.0 continua true e, sozinha, NÃO autoriza nenhuma versão.
  assert.equal(real.aprovacoes.publicacao, true);
  // PUB-17/PUB-19: cada aprovação vale para UM conteúdo (impressão). Conteúdo novo (a NEKKORA-COM-CANAIS-001 altera src/)
  // fica pendente até a titular aprovar a impressão atual — nunca herda a aprovação anterior.
  const conteudoAprovado =
    real.impressoesDeConteudo.textosComerciais === impressaoDoConteudo('textosComerciais') &&
    real.impressoesDeConteudo.condicoesComerciais === impressaoDoConteudo('condicoesComerciais');
  // Data mínima dos registros de CADA release (titular, 13/11/2026: não aceitar qualquer data a partir de 12/11): as
  // aprovações de conteúdo (PUB-17/19) e a autorização (PUB-18) de uma versão não podem ser anteriores à decisão que a
  // originou. 1.1.0: COM-VITRINE-001 (12/11/2026). 1.1.1: aprovação da implementação da NEKKORA-COM-CANAIS-001
  // (13/11/2026). Versão nova sem entrada aqui falha: a data é decidida junto com a release, nunca herdada.
  const DATA_MINIMA_DA_RELEASE = { '1.1.0': '2026-11-12', '1.1.1': '2026-11-13' };
  const minimaDaRelease = DATA_MINIMA_DA_RELEASE[versaoReal];
  assert.ok(minimaDaRelease, `versão ${versaoReal} sem data mínima de registros definida`);
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const dataDe = (registro) => {
    const m = /^Titular, (\d{2})\/(\d{2})\/(\d{4}) /.exec(registro ?? '');
    return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  };
  // PUB-18: só a autorização DESTA versão (a de outra versão, como a da 1.1.0 já publicada, não vale)
  const autorizada = real.publicacaoAutorizada;
  const autorizadaEstaVersao = autorizada !== undefined && autorizada.versao === versaoReal;
  if (!conteudoAprovado) {
    // Em desenvolvimento: conteúdo novo sem aprovação → bloqueia por PUB-17, PUB-19 e PUB-18, e por nada mais
    assert.equal(r.code, 1, r.stdout);
    assert.deepEqual(pendencias, ['PUB-17', 'PUB-18', 'PUB-19'], r.stdout);
    assert.ok(!autorizadaEstaVersao, 'autorização desta versão só depois da aprovação do conteúdo');
  } else if (!autorizadaEstaVersao) {
    // Estado H (commit homologado): sem a autorização desta versão, o portão bloqueia, e só por ela
    assert.equal(r.code, 1, r.stdout);
    assert.deepEqual(pendencias, ['PUB-18'], r.stdout);
    assert.match(r.stdout, /PUB-18 — autorização desta versão/);
    if (autorizada === undefined) assert.equal(real.$origem.publicacaoAutorizada, undefined, 'registro da PUB-18 sem a autorização');
  } else {
    // Estado C (autorização da titular): autorização completa e válida, sem campos a mais, para a versão do package.json
    // e UM commit homologado (SHA completo), citado exatamente no registro datado
    assert.deepEqual(Object.keys(autorizada).sort(), ['commit', 'versao'], 'só versão e commit');
    assert.match(autorizada.commit ?? '', /^[0-9a-f]{40}$/, 'SHA completo do commit homologado');
    const registro = real.$origem.publicacaoAutorizada;
    assert.equal(typeof registro, 'string', 'registro da titular em $origem["publicacaoAutorizada"]');
    assert.match(registro, /^Titular, \d{2}\/\d{2}\/\d{4} \([A-Z0-9-]+, PUB-18\): /, 'registro "Titular, DD/MM/AAAA (<missão>, PUB-18): "');
    const dataPub = dataDe(registro);
    assert.ok(dataPub >= minimaDaRelease && dataPub <= hoje, `PUB-18 da ${versaoReal}: de ${minimaDaRelease} até hoje (sem autorização futura nem herdada)`);
    for (const item of ['textosComerciais', 'condicoesComerciais']) {
      assert.ok(dataPub >= dataDe(real.$origem[`impressoesDeConteudo.${item}`]), `PUB-18 não anterior à aprovação de ${item}`);
    }
    assert.ok(registro.includes(`versão ${versaoReal}`), 'registro cita a versão');
    assert.deepEqual(registro.match(/(?<![0-9a-f])[0-9a-f]{40}(?![0-9a-f])/g), [autorizada.commit], 'registro cita exatamente o SHA autorizado');
    assert.equal(r.code, 0, r.stdout);
    assert.deepEqual(pendencias, [], r.stdout);
    assert.match(r.stdout, /Publicação liberada/);
  }
  assert.doesNotMatch(r.stdout, /PUB-13 —/);
  // PUB-13: data do Dia D, registro da titular no mesmo dia, citando UMA data (a de início), sem retroatividade e com os
  // compromissos anteriores preservados
  assert.equal(real.novasCondicoes.inicio, '2026-11-12');
  const registroInicio = real.$origem['novasCondicoes.inicio'];
  assert.match(registroInicio, /^Titular, 12\/11\/2026 \(COM-VITRINE-001, PUB-13\)/);
  assert.deepEqual(registroInicio.match(/\d{4}-\d{2}-\d{2}/g), ['2026-11-12']);
  assert.match(registroInicio, /horário de Brasília/);
  assert.match(registroInicio, /Compromissos comerciais anteriores preservados/);
  // as aprovações valem para o conteúdo ATUAL: cada valor aprovado é a impressão calculada agora, e o registro da
  // titular cita exatamente essa impressão, uma única vez (qualquer mudança em arquivo protegido volta a bloquear)
  // PUB-14 e V-01: a tabela de preços NÃO muda (a impressão do código continua a aprovada em 12/11/2026)
  assert.equal(real.tabelaDePrecos.impressao, 'sha256:95a612f7b2528cee48fb4b043b4751d8bca66164e6cade01599832d8cc008f35', 'PUB-14: tabela aprovada em 12/11/2026');
  const aprovadas = [
    ['tabelaDePrecos.impressao', real.tabelaDePrecos.impressao, impressaoDaTabela()],
    ['tabelaDePrecos.posCampanha', real.tabelaDePrecos.impressao, impressaoDaTabela()],
    ...(conteudoAprovado
      ? [
          ['impressoesDeConteudo.textosComerciais', real.impressoesDeConteudo.textosComerciais, impressaoDoConteudo('textosComerciais')],
          ['impressoesDeConteudo.condicoesComerciais', real.impressoesDeConteudo.condicoesComerciais, impressaoDoConteudo('condicoesComerciais')],
        ]
      : []),
  ];
  for (const [chave, aprovada, calculada] of aprovadas) {
    assert.equal(aprovada, calculada, chave);
    const registro = real.$origem[chave];
    const data = dataDe(registro);
    if (chave.startsWith('tabelaDePrecos.')) {
      // PUB-14 e V-01 não mudam: o registro continua o de 12/11/2026, sem reescrita
      assert.equal(data, '2026-11-12', chave);
    } else {
      // PUB-17/19 desta versão: aprovação própria, de a partir da data mínima da release até hoje (nunca a anterior)
      assert.ok(data >= minimaDaRelease && data <= hoje, `${chave}: de ${minimaDaRelease} até hoje`);
    }
    assert.deepEqual(registro.match(/sha256:[0-9a-f]{64}/g), [calculada], chave);
  }
  assert.equal(real.tabelaDePrecos.posCampanha, true);
  // PUB-19 aprova só as condições anunciadas: contratos e pacotes continuam pendentes
  assert.match(real.$origem['impressoesDeConteudo.condicoesComerciais'], /NÃO representa aprovação do contrato-base, anexos, proposta-modelo ou procedimento operacional/);
  assert.match(real.$origem['impressoesDeConteudo.condicoesComerciais'], /DP-01 a DP-05 .* continuam pendentes; não está autorizada a formalização de contratos de pacotes/);
  // Monitor e AI continuam em preparação; as flags da v1.0.0 não são acusadas nem alteradas
  assert.deepEqual(real.servicos, { monitor: 'em-preparacao', ai: 'em-preparacao' });
  assert.doesNotMatch(r.stdout, /PUB-17 — aprovação dos textos comerciais|PUB-19 — aprovação das condições comerciais/);
  // PUB-09 (commit e4bc72c) e PUB-10 (commit 2fdaed6), registradas em $origem: continuam não acusadas
  for (const id of ['PUB-09', 'PUB-10']) assert.doesNotMatch(r.stdout, new RegExp(`${id} —`));
  // PUB-20 (NEKKORA-COM-CANAIS-001): sem Microsoft Bookings na página pública
  assert.equal(real.agendamento.url, null);
  assert.doesNotMatch(r.stdout, /PUB-20/);
  // PUB-22: endereço comercial informado pela titular em 05/11/2026 (cartão CNPJ) — o portão não o acusa mais
  assert.doesNotMatch(r.stdout, /PUB-22/);

  assert.doesNotMatch(r.stdout, /PUB-13 — (datas de início e fim|campanha já encerrada)/);
  // PUB-21 (NEKKORA-COM-CANAIS-001): sem formulário nem envio automático
  assert.deepEqual(real.envioAutomatico, { endpoint: null, chaveDoSiteTurnstile: null });
  assert.doesNotMatch(r.stdout, /PUB-21/);
  // Monitor e AI em preparação: nada a aprovar em PUB-23
  assert.doesNotMatch(r.stdout, /PUB-23/);
  // os dados informados pela titular passam: WhatsApp, e-mail, LinkedIn, Instagram, CNPJ e provedor
  for (const id of ['PUB-01', 'PUB-02', 'PUB-03', 'PUB-11']) assert.doesNotMatch(r.stdout, new RegExp(`${id} —`));
  assert.deepEqual(real.canais, { whatsapp: '5511917724200', email: 'contato@nekkora.com', linkedin: 'https://www.linkedin.com/company/nekkora', instagram: 'https://www.instagram.com/nekkora.br/' });
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
  ['campanha encerrada', (p) => ((p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), (p.tabelaDePrecos.posCampanha = false)), /PUB-13 — campanha já encerrada/],
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
  // PUB-18 (titular, 12/11/2026): a flag herdada não basta; a autorização vale para UMA versão e UM commit homologado
  ['PUB-18: só a flag, sem autorização desta versão', (p) => { delete p.publicacaoAutorizada; delete p.$origem.publicacaoAutorizada; }, /PUB-18 — autorização desta versão/],
  ['PUB-18: autorização de outra versão', (p) => (p.publicacaoAutorizada.versao = '1.0.0'), /PUB-18 — autorização desta versão/],
  ['PUB-18: commit que não é SHA completo', (p) => (p.publicacaoAutorizada.commit = 'a'.repeat(7)), /PUB-18 — autorização desta versão/],
  ['PUB-18: registro cita outro commit', (p) => (p.$origem.publicacaoAutorizada = p.$origem.publicacaoAutorizada.replace(HOMOLOGADO, 'c'.repeat(40))), /PUB-18 — autorização desta versão/],
  ['PUB-18: registro cita dois commits', (p) => (p.$origem.publicacaoAutorizada += ` Também ${'c'.repeat(40)}.`), /PUB-18 — autorização desta versão/],
  ['PUB-18: registro sem a versão', (p) => (p.$origem.publicacaoAutorizada = p.$origem.publicacaoAutorizada.replace(`versão ${VERSAO}`, 'versão atual')), /PUB-18 — autorização desta versão/],
  ['PUB-18: registro anterior a 12/11/2026 (aprovação da v1.0.0)', (p) => (p.$origem.publicacaoAutorizada = p.$origem.publicacaoAutorizada.replace('12/11/2026', '11/11/2026')), /PUB-18 — autorização desta versão/],
  ['PUB-18: registro com data futura', (p) => (p.$origem.publicacaoAutorizada = p.$origem.publicacaoAutorizada.replace('12/11/2026', '16/11/2026')), /PUB-18 — autorização desta versão/],
  // NEKKORA-COM-CANAIS-001 (titular, 13/11/2026): sem autorização retroativa à aprovação do conteúdo publicado
  ['PUB-18: autorização anterior à aprovação dos textos (PUB-17)', (p) => (p.$origem['impressoesDeConteudo.textosComerciais'] = REGISTRO_DE(p.impressoesDeConteudo.textosComerciais, '13/11/2026')), /PUB-18 — autorização desta versão/],
  ['PUB-18: autorização anterior à aprovação das condições (PUB-19)', (p) => (p.$origem['impressoesDeConteudo.condicoesComerciais'] = REGISTRO_DE(p.impressoesDeConteudo.condicoesComerciais, '13/11/2026')), /PUB-18 — autorização desta versão/],
  ['PUB-18: registro sem "Titular, DD/MM/AAAA"', (p) => (p.$origem.publicacaoAutorizada = p.$origem.publicacaoAutorizada.replace('Titular, 12/11/2026', 'Agente')), /PUB-18 — autorização desta versão/],
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
  // COM-VITRINE-001 §12 (forma b): textos (PUB-17) e condições (PUB-19) aprovados por impressão do conteúdo + registro
  ...[['textosComerciais', 'PUB-17', TEXTOS, CONDICOES], ['condicoesComerciais', 'PUB-19', CONDICOES, TEXTOS]].flatMap(([item, id, propria, outra]) => {
    const chave = `impressoesDeConteudo.${item}`;
    const falta = new RegExp(`${id} — (textos|condições) comerciais sem aprovação própria`);
    const registro = new RegExp(`${id} — registro da aprovação`);
    return [
      [`${id}: flag true sem impressão aprovada`, (p) => (p.impressoesDeConteudo[item] = null), falta],
      [`${id}: sem o bloco impressoesDeConteudo`, (p) => delete p.impressoesDeConteudo, falta],
      [`${id}: impressão aprovada de outro conteúdo (texto ou condição alterados)`, (p) => (p.impressoesDeConteudo[item] = `sha256:${'0'.repeat(64)}`), falta],
      [`${id}: impressão do outro item no lugar desta`, (p) => (p.impressoesDeConteudo[item] = outra), falta],
      [`${id}: impressão sem registro da titular`, (p) => delete p.$origem[chave], registro],
      [`${id}: registro citando outra impressão`, (p) => (p.$origem[chave] = REGISTRO_DE(outra)), registro],
      [`${id}: registro citando duas impressões`, (p) => (p.$origem[chave] = `${REGISTRO_DE(propria)} Antes: ${outra}.`), registro],
      [`${id}: registro da época da v1.0.0 (11/11/2026)`, (p) => (p.$origem[chave] = REGISTRO_DE(propria, '11/11/2026')), registro],
      [`${id}: registro com data futura`, (p) => (p.$origem[chave] = REGISTRO_DE(propria, '16/11/2026')), registro],
      [`${id}: registro sem a autoria da titular`, (p) => (p.$origem[chave] = `Equipe, 12/11/2026: impressão ${propria}.`), registro],
      [`${id}: só o registro da flag da v1.0.0`, (p) => (delete p.$origem[chave], (p.$origem[`aprovacoes.${item}`] = `Titular, 11/11/2026: aprovado (commit e4bc72c).`)), registro],
    ];
  }),
  // L-02 (titular, 12/11/2026): data de início com registro da titular, sem retroatividade
  ['data de início sem registro da titular', (p) => delete p.$origem['novasCondicoes.inicio'], /PUB-13 — registro da data de início/],
  ['registro citando outra data de início', (p) => (p.$origem['novasCondicoes.inicio'] = 'Titular, 12/11/2026: data de início 2026-11-13.'), /PUB-13 — registro da data de início/],
  ['registro citando duas datas', (p) => (p.$origem['novasCondicoes.inicio'] = 'Titular, 12/11/2026: data de início 2026-11-12 (antes 2026-11-06).'), /PUB-13 — registro da data de início/],
  ['data de início retroativa ao registro (06/11/2026)', (p) => ((p.novasCondicoes.inicio = '2026-11-06'), (p.$origem['novasCondicoes.inicio'] = 'Titular, 12/11/2026: data de início 2026-11-06.')), /PUB-13 — registro da data de início/],
  ['registro da data de início anterior a 12/11/2026', (p) => ((p.novasCondicoes.inicio = '2026-11-11'), (p.$origem['novasCondicoes.inicio'] = 'Titular, 11/11/2026: data de início 2026-11-11.')), /PUB-13 — registro da data de início/],
  ['registro da data de início sem a autoria da titular', (p) => (p.$origem['novasCondicoes.inicio'] = 'Equipe, 12/11/2026: data de início 2026-11-12.'), /PUB-13 — registro da data de início/],
  ['registro da data de início com data futura', (p) => (p.$origem['novasCondicoes.inicio'] = 'Titular, 16/11/2026: data de início 2026-11-12.'), /PUB-13 — registro da data de início/],
  // V-01 / L-04 (titular, 12/11/2026): a flag sozinha não é aprovação; vale para a tabela aprovada
  ['V-01: flag false (a página anuncia continuidade)', (p) => (p.tabelaDePrecos.posCampanha = false), /V-01 — tabela depois de 06\/01\/2027/],
  ['V-01: flag true sem registro', (p) => delete p.$origem['tabelaDePrecos.posCampanha'], /V-01 — tabela depois de 06\/01\/2027/],
  ['V-01: flag como texto "true"', (p) => (p.tabelaDePrecos.posCampanha = 'true'), /V-01 — tabela depois de 06\/01\/2027/],
  ['V-01: registro citando outra tabela', (p) => (p.$origem['tabelaDePrecos.posCampanha'] = REGISTRO_DE(impressaoDaTabela({ x: 1 }))), /V-01 — tabela depois de 06\/01\/2027/],
  ['V-01: registro de 11/11/2026', (p) => (p.$origem['tabelaDePrecos.posCampanha'] = REGISTRO_DE(impressaoDaTabela(), '11/11/2026')), /V-01 — tabela depois de 06\/01\/2027/],
  ['V-01: registro sem a autoria da titular', (p) => (p.$origem['tabelaDePrecos.posCampanha'] = `Equipe, 12/11/2026: ${impressaoDaTabela()}.`), /V-01 — tabela depois de 06\/01\/2027/],
  // COM-VITRINE-001 §3.1: data de início das novas condições
  ['sem data de início das novas condições', (p) => (p.novasCondicoes.inicio = null), /PUB-13 — data de início das novas condições/],
  ['sem o bloco novasCondicoes', (p) => delete p.novasCondicoes, /PUB-13 — data de início das novas condições/],
  ['data de início no futuro', (p) => (p.novasCondicoes.inicio = '2026-11-16'), /PUB-13 — data de início das novas condições/],
  ['data de início antes da campanha', (p) => (p.novasCondicoes.inicio = '2026-10-31'), /PUB-13 — data de início das novas condições/],
  ['data de início inválida', (p) => (p.novasCondicoes.inicio = '10/11/2026'), /PUB-13 — data de início das novas condições/],
  // COM-VITRINE-001 §3.2 (V-01): campanha encerrada sem a aprovação da tabela pós-campanha
  ['campanha encerrada sem tabela pós-campanha aprovada', (p) => ((p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), (p.novasCondicoes.inicio = '2026-09-01'), (p.tabelaDePrecos.posCampanha = false)), /tabela pós-campanha não aprovada/],
  ['campanha encerrada com flag pós-campanha sem registro', (p) => ((p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-11-13' }), delete p.$origem['tabelaDePrecos.posCampanha']), /tabela pós-campanha não aprovada/],
  ['pós-campanha como texto "true"', (p) => ((p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-09-30' }), (p.novasCondicoes.inicio = '2026-09-01'), (p.tabelaDePrecos.posCampanha = 'true')), /tabela pós-campanha não aprovada/],
  // COM-VITRINE-001 §7 (V-06): Monitor e AI
  ['Monitor disponível sem aprovação', (p) => (p.servicos.monitor = 'disponivel'), /PUB-23 — servicos\.monitor/],
  ['AI disponível sem aprovação', (p) => (p.servicos.ai = 'disponivel'), /PUB-23 — servicos\.ai/],
  ['AI disponível com aprovação de outro serviço', (p) => ((p.servicos.ai = 'disponivel'), (p.aprovacoes.disponibilidade = { monitor: true })), /PUB-23 — servicos\.ai/],
  ['estado de serviço desconhecido', (p) => (p.servicos.monitor = 'contratar'), /PUB-23 — servicos\.monitor/],
  ['sem o bloco servicos', (p) => delete p.servicos, /PUB-23/],
  // NEKKORA-COM-CANAIS-001: WhatsApp é o único canal de atendimento (obrigatório); Instagram só do instagram.com
  ['sem WhatsApp', (p) => (p.canais.whatsapp = null), /PUB-01/],
  ['WhatsApp sem DDI', (p) => (p.canais.whatsapp = '11987654321'), /PUB-01/],
  ['Instagram de outro domínio', (p) => (p.canais.instagram = 'https://www.exemplo.com/empresa.ficticia/'), /PUB-03 — Instagram/],
  ['Instagram na página inicial', (p) => (p.canais.instagram = 'https://www.instagram.com/'), /PUB-03 — Instagram/],
  // Agendamento: o Bookings saiu da página pública — qualquer URL bloqueia, a oficial e as inválidas (antes recusadas por
  // formato, COM-RELEASE-005 §4.5 / NEKKORA-COM-007)
  ['Bookings oficial (domínio atual)', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora da página pública/],
  ['Bookings oficial (formato legado)', (p) => (p.agendamento.url = 'https://outlook.office365.com/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['agendamento marcado como obrigatório', (p) => (p.agendamento.obrigatorio = true), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings de outra organização', (p) => (p.agendamento.url = 'https://outlook.office365.com/book/Vendas@outra-empresa.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings fictício (.example)', (p) => ((p.canais.email = 'a@b.example'), (p.agendamento.url = 'https://outlook.office365.com/book/X@b.example/')), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings na página inicial', (p) => (p.agendamento.url = 'https://outlook.office365.com/'), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings fora da Microsoft', (p) => (p.agendamento.url = 'https://bookings.exemplo.com.br/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings em http', (p) => (p.agendamento.url = 'http://outlook.office365.com/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  // NEKKORA-COM-007: domínio atual (bookings.cloud.microsoft) — mesma regra de src/agendamento-url.js
  ['Bookings novo em http', (p) => (p.agendamento.url = 'http://bookings.cloud.microsoft/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings novo na página inicial', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/'), /PUB-20 — Microsoft Bookings fora/],
  ['Bookings novo de outra organização', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/Vendas@outra-empresa.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['host parecido com o da Microsoft', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft.com/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['subdomínio malicioso', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft.evil.example/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['credenciais embutidas', (p) => (p.agendamento.url = 'https://u:s@bookings.cloud.microsoft/book/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['caminho inválido', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/calendar/AvaliacaoInicial@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['caixa disfarçada com "/" codificado', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/x%2F@empresa-ficticia.com.br/'), /PUB-20 — Microsoft Bookings fora/],
  ['URL malformada', (p) => (p.agendamento.url = 'https://'), /PUB-20 — Microsoft Bookings fora/],
  ['domínio fictício em produção (domínio atual)', (p) => ((p.canais.email = 'a@b.test'), (p.agendamento.url = 'https://bookings.cloud.microsoft/book/X@b.test/')), /PUB-20 — Microsoft Bookings fora/],
  ['caixa *.onmicrosoft.com sem tenant declarado', (p) => (p.agendamento.url = 'https://bookings.cloud.microsoft/book/AvaliacaoInicial@empresaficticia.onmicrosoft.com/'), /PUB-20 — Microsoft Bookings fora/],
  [
    'caixa *.onmicrosoft.com de outro tenant',
    (p) => ((p.agendamento.dominioDoTenant = 'empresaficticia.onmicrosoft.com'), (p.agendamento.url = 'https://bookings.cloud.microsoft/book/X@outra.onmicrosoft.com/')),
    /PUB-20 — Microsoft Bookings fora/,
  ],
  // Recebimento automático: sem formulário, nenhum endpoint (válido ou não) nem chave do desafio
  ['endpoint https completo', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), /PUB-21 — envio automático fora/],
  ['só a chave do Turnstile', (p) => (p.envioAutomatico = { endpoint: null, chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), /PUB-21 — envio automático fora/],
  ['endpoint em http', (p) => (p.envioAutomatico = { endpoint: 'http://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), /PUB-21 — envio automático fora/],
  ['endpoint com outro caminho', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/enviar', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), /PUB-21 — envio automático fora/],
  ['endpoint sem desafio', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: null }), /PUB-21 — envio automático fora/],
  ['chave de teste do Turnstile', (p) => (p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '1x00000000000000000000AA' }), /PUB-21 — envio automático fora/],
  [
    'envio automático sem autorização',
    (p) => ((p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' }), (p.aprovacoes.envioAutomatico = false)),
    /PUB-21 — envio automático fora/,
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
  // campanha terminada em 13/11/2026, deploy em 15/11/2026: V-01 com registro (complete) libera
  p.campanhaLancamento = { inicio: '2026-08-01', fim: '2026-11-13' };
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
  p.$origem['novasCondicoes.inicio'] = 'Titular, 15/11/2026 (fictício): data de início 2026-11-15, data da publicação.';
  setup(p);
  const r = await gate('2026-11-15');
  assert.equal(r.code, 0, r.stdout);
});

test('sem agendamento (NEKKORA-COM-CANAIS-001): sem URL e sem confirmação do Bookings, libera', async () => {
  const p = complete();
  p.agendamento = { url: null, obrigatorio: false };
  p.aprovacoes.agendamento = false;
  setup(p);
  assert.equal((await gate()).code, 0);
});

test('Bookings com a caixa do tenant declarado: bloqueia mesmo assim (sem agendamento público)', async () => {
  const p = complete();
  p.agendamento.dominioDoTenant = 'empresaficticia.onmicrosoft.com';
  p.agendamento.url = 'https://bookings.cloud.microsoft/book/AvaliacaoInicial@empresaficticia.onmicrosoft.com/';
  setup(p);
  const r = await gate();
  assert.equal(r.code, 1);
  assert.match(r.stdout, /PUB-20 — Microsoft Bookings fora da página pública/);
});

test('envio automático completo (com aprovação e CSP correspondente): bloqueia — a página não tem formulário', async () => {
  const p = complete();
  p.envioAutomatico = { endpoint: 'https://api.empresa-ficticia.com.br/v1/commercial/requests', chaveDoSiteTurnstile: '0x4AAAAAAAAbcdefghijklmn' };
  const origens = { connect: ['https://api.empresa-ficticia.com.br'], script: ['https://challenges.cloudflare.com'], frame: ['https://challenges.cloudflare.com'] };
  setup(p, { ...release(), cspOrigens: origens }, { versionedPolicy: policy(HASHES, origens) });
  const r = await gate();
  assert.equal(r.code, 1, r.stdout);
  assert.match(r.stdout, /PUB-21 — envio automático fora da página pública/);
  // a CSP versionada continua conferida contra o build: origens no build sem a política correspondente também bloqueiam
  setup(complete(), { ...release(), cspOrigens: origens }, { versionedPolicy: policy(HASHES) });
  assert.match((await gate()).stdout, /politica-cabecalhos\.json não corresponde/);
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
    // PUB-18: o artefato tem de ser da versão autorizada (a do package.json)
    [{ ...release(), aplicacao: 'copia-de-teste@1.0.0' }, {}, /artefato de outra versão/],
    [{ ...release(), aplicacao: undefined }, {}, /artefato de outra versão \(sem versão/],
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
