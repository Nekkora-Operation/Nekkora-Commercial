/**
 * URL do Microsoft Bookings (NEKKORA-COM-007): matriz de casos da regra única em src/agendamento-url.js, usada pela
 * página (src/config.ts) e pelo portão (scripts/verificar-publicacao.mjs). Os domínios abaixo são FICTÍCIOS, exceto a
 * URL oficial da Nekkora, conferida em publicacao.json.
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOKINGS_HOSTS, isBookingsUrl } from '../../src/agendamento-url.js';

const NEKKORA = { emailDomain: 'nekkora.com' };
const OFICIAL = 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/';

const aceitas = [
  ['URL oficial no domínio atual', OFICIAL],
  ['"@" codificado como %40', 'https://bookings.cloud.microsoft/book/Nekkora%40nekkora.com/'],
  ['sem a barra final', 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.com'],
  ['página de um serviço da mesma caixa', 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/s/AbC-123_x'],
  ['domínio da caixa com maiúsculas', 'https://bookings.cloud.microsoft/book/Nekkora@Nekkora.com/'],
  ['legado outlook.office365.com', 'https://outlook.office365.com/book/Nekkora@nekkora.com/'],
  ['legado outlook.office.com', 'https://outlook.office.com/book/Nekkora@nekkora.com/'],
  ['legado /owa/calendar/…/bookings/', 'https://outlook.office365.com/owa/calendar/Nekkora@nekkora.com/bookings/'],
];
const recusadas = [
  ['ausente (null)', null],
  ['vazia', ''],
  ['não é texto', 42],
  ['malformada', 'https://'],
  ['malformada (sem esquema)', 'bookings.cloud.microsoft/book/Nekkora@nekkora.com/'],
  ['http', 'http://bookings.cloud.microsoft/book/Nekkora@nekkora.com/'],
  ['credenciais embutidas', 'https://usuario:senha@bookings.cloud.microsoft/book/Nekkora@nekkora.com/'],
  ['só usuário embutido', 'https://Nekkora@bookings.cloud.microsoft/book/Nekkora@nekkora.com/'],
  ['porta explícita', 'https://bookings.cloud.microsoft:8443/book/Nekkora@nekkora.com/'],
  ['página inicial', 'https://bookings.cloud.microsoft/'],
  ['página inicial legada', 'https://outlook.office365.com/'],
  ['/book/ sem caixa', 'https://bookings.cloud.microsoft/book/'],
  ['caminho inválido', 'https://bookings.cloud.microsoft/calendar/Nekkora@nekkora.com/'],
  ['/owa/calendar no domínio novo (formato inexistente)', 'https://bookings.cloud.microsoft/owa/calendar/Nekkora@nekkora.com/bookings/'],
  ['/owa/calendar sem /bookings', 'https://outlook.office365.com/owa/calendar/Nekkora@nekkora.com/'],
  ['caixa de outra organização', 'https://bookings.cloud.microsoft/book/Vendas@outra-empresa.com.br/'],
  ['domínio da Nekkora como prefixo de outro', 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.com.evil.example/'],
  ['domínio da Nekkora como sufixo de outro', 'https://bookings.cloud.microsoft/book/Nekkora@falsonekkora.com/'],
  ['caixa *.onmicrosoft.com sem tenant declarado', 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.onmicrosoft.com/'],
  ['host parecido (microsoft.com)', 'https://bookings.cloud.microsoft.com/book/Nekkora@nekkora.com/'],
  ['host parecido (hífens)', 'https://bookings-cloud-microsoft.com/book/Nekkora@nekkora.com/'],
  ['host parecido (dígito no lugar de letra)', 'https://bookings.cloud.micr0soft/book/Nekkora@nekkora.com/'],
  ['host com letra cirílica (IDN)', 'https://bookings.cloud.micrоsoft/book/Nekkora@nekkora.com/'],
  ['subdomínio malicioso à direita', 'https://bookings.cloud.microsoft.evil.example/book/Nekkora@nekkora.com/'],
  ['subdomínio à esquerda', 'https://evil.bookings.cloud.microsoft/book/Nekkora@nekkora.com/'],
  ['host com ponto final', 'https://bookings.cloud.microsoft./book/Nekkora@nekkora.com/'],
  ['outro host *.microsoft.com', 'https://outlook.microsoft.com/book/Nekkora@nekkora.com/'],
  ['host em maiúsculas (forma não canônica)', 'https://Bookings.Cloud.Microsoft/book/Nekkora@nekkora.com/'],
  ['espaço antes', ` ${OFICIAL}`],
  ['tabulação no meio', 'https://bookings.cloud.microsoft/bo\tok/Nekkora@nekkora.com/'],
  ['barras invertidas', 'https://bookings.cloud.microsoft\\book\\Nekkora@nekkora.com/'],
  ['query', `${OFICIAL}?ismsaljsauthenabled=true`],
  ['fragmento', `${OFICIAL}#x`],
  ['"/" codificado (%2F) para trocar a caixa', 'https://bookings.cloud.microsoft/book/x%2F..%2Fbook%2FNekkora@nekkora.com/'],
  ['"@" de outra caixa escondido antes da barra', 'https://bookings.cloud.microsoft/book/x@evil.example/@nekkora.com/'],
  ['"." codificado (%2E)', 'https://bookings.cloud.microsoft/book/Nekkora@nekkora%2Ecom/'],
  ['barra invertida codificada (%5C)', 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.com%5C..%5C/'],
  ['codificação dupla (%2540)', 'https://bookings.cloud.microsoft/book/Nekkora%2540nekkora.com/'],
  ['segmento ".." resolvido pelo navegador', 'https://bookings.cloud.microsoft/x/../book/Nekkora@nekkora.com/'],
  ['esquema javascript:', 'javascript:alert(1)//bookings.cloud.microsoft/book/Nekkora@nekkora.com/'],
];

for (const [nome, url] of aceitas) test(`aceita: ${nome}`, () => assert.equal(isBookingsUrl(url, NEKKORA), true, url));
for (const [nome, url] of recusadas) test(`recusa: ${nome}`, () => assert.equal(isBookingsUrl(url, NEKKORA), false, String(url)));

test('sem domínio do e-mail comercial, nada é aceito', () => {
  assert.equal(isBookingsUrl(OFICIAL, { emailDomain: null }), false);
  assert.equal(isBookingsUrl(OFICIAL, { emailDomain: '' }), false);
});

test('lista explícita de hosts: só os três oficiais', () => {
  assert.deepEqual([...BOOKINGS_HOSTS].sort(), ['bookings.cloud.microsoft', 'outlook.office.com', 'outlook.office365.com']);
});

test('caixa *.onmicrosoft.com: só a do tenant declarado', () => {
  const url = 'https://bookings.cloud.microsoft/book/Nekkora@nekkora.onmicrosoft.com/';
  assert.equal(isBookingsUrl(url, { ...NEKKORA, tenantDomain: 'nekkora.onmicrosoft.com' }), true);
  assert.equal(isBookingsUrl(url, { ...NEKKORA, tenantDomain: 'outra.onmicrosoft.com' }), false);
  assert.equal(isBookingsUrl('https://bookings.cloud.microsoft/book/X@outra.onmicrosoft.com/', { ...NEKKORA, tenantDomain: 'nekkora.onmicrosoft.com' }), false);
  // o "tenant" declarado precisa ser mesmo um *.onmicrosoft.com
  assert.equal(isBookingsUrl('https://bookings.cloud.microsoft/book/X@outra-empresa.com.br/', { ...NEKKORA, tenantDomain: 'outra-empresa.com.br' }), false);
});

test('domínio fictício: aceito na homologação, recusado em produção', () => {
  const url = 'https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/';
  assert.equal(isBookingsUrl(url, { emailDomain: 'exemplo.invalid' }), true);
  for (const tld of ['invalid', 'example', 'test', 'localhost']) {
    assert.equal(isBookingsUrl(`https://bookings.cloud.microsoft/book/X@empresa.${tld}/`, { emailDomain: `empresa.${tld}`, producao: true }), false, tld);
  }
  assert.equal(isBookingsUrl(OFICIAL, { ...NEKKORA, producao: true }), true);
});

test('publicacao.json: a URL registrada é a oficial, válida em produção, e a aprovação NÃO foi presumida', () => {
  const pub = JSON.parse(readFileSync('publicacao.json', 'utf8'));
  assert.equal(pub.agendamento.url, OFICIAL);
  assert.equal(pub.agendamento.obrigatorio, true);
  assert.equal(pub.aprovacoes.agendamento, false);
  assert.equal(isBookingsUrl(pub.agendamento.url, { emailDomain: pub.canais.email.split('@')[1], producao: true }), true);
});

test('fixtures sintéticas: a da API usa o domínio atual e é aceita; a de outra organização continua recusada', () => {
  const api = JSON.parse(readFileSync('scripts/fixtures/publicacao-homologacao-api.json', 'utf8'));
  assert.equal(new URL(api.agendamento.url).hostname, 'bookings.cloud.microsoft');
  assert.equal(isBookingsUrl(api.agendamento.url, { emailDomain: api.canais.email.split('@')[1] }), true);
  const outra = JSON.parse(readFileSync('scripts/fixtures/publicacao-homologacao-email.json', 'utf8'));
  assert.equal(isBookingsUrl(outra.agendamento.url, { emailDomain: outra.canais.email.split('@')[1] }), false);
});

test('página e portão usam a mesma função (sem cópia da regra)', () => {
  const config = readFileSync('src/config.ts', 'utf8');
  const portao = readFileSync('scripts/verificar-publicacao.mjs', 'utf8');
  assert.match(config, /import \{ isBookingsUrl \} from '\.\/agendamento-url\.js'/);
  assert.match(portao, /import \{ isBookingsUrl \} from '\.\.\/src\/agendamento-url\.js'/);
  for (const fonte of [config, portao]) assert.doesNotMatch(fonte, /'(outlook\.office365\.com|outlook\.office\.com|bookings\.cloud\.microsoft)'/);
});
