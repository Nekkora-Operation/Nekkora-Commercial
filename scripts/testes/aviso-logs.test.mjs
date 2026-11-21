// [PV-12] LOG-01: o aviso sobre registros de acesso tem de descrever exatamente a configuração preparada em
// deploy/aws/logs (campos gravados e expiração). Sem rede e sem AWS: compara os arquivos do repositório.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const entrega = JSON.parse(ler('deploy/aws/logs/entrega.json'));
const ciclo = JSON.parse(ler('deploy/aws/logs/ciclo-de-vida.json'));
const content = ler('src/content.ts');
const espelho = ler('docs/com-001/05-texto-comercial.md');

const inicio = content.indexOf("title: 'Registros de acesso'");
const bloco = content.slice(inicio, content.indexOf('\n    },', inicio));
const aviso = (bloco.match(/' Por exigência do Marco Civil[^']*'/) ?? [''])[0].slice(1, -1);

test('o aviso [PV-12] existe e está espelhado no texto comercial', () => {
  assert.ok(aviso.length > 0, 'texto [PV-12] não encontrado em src/content.ts');
  assert.ok(espelho.includes(aviso.trim()), '05-texto-comercial.md diverge de src/content.ts');
});

test('campos gravados: só os cinco que o aviso descreve', () => {
  assert.deepEqual(entrega.delivery.recordFields, ['date', 'time', 'c-ip', 'c-port', 'x-host-header']);
  for (const trecho of ['data', 'horário', 'endereço IP', 'porta de origem', 'domínio acessado']) {
    assert.ok(aviso.includes(trecho), `aviso não cita: ${trecho}`);
  }
  assert.match(aviso, /não indicam a página visitada nem o navegador/);
  for (const proibido of ['cs-uri-stem', 'cs-uri-query', 'cs(User-Agent)', 'cs(Referer)', 'cs(Cookie)']) {
    assert.ok(!entrega.delivery.recordFields.includes(proibido), `campo não descrito no aviso: ${proibido}`);
  }
});

test('retenção: o aviso cita os dias do ciclo de vida e não promete exclusão instantânea', () => {
  const regras = ciclo.Rules.filter((r) => r.Status === 'Enabled');
  assert.equal(regras.length, 1);
  const dias = regras[0].Expiration.Days;
  assert.equal(entrega.retencaoDias, dias);
  assert.ok(dias >= 184, 'a expiração precisa cobrir 6 meses (Marco Civil, art. 15)');
  assert.ok(aviso.includes(`${dias} dias`), `aviso não cita ${dias} dias`);
  assert.match(aviso, /pelo menos 6 meses/);
  assert.match(aviso, /pode levar alguns dias a mais/);
  assert.doesNotMatch(aviso, /apagados automaticamente depois desse prazo/);
});

test('compartilhamento: registros de acesso dependem de ordem judicial; dados cadastrais à parte; base da guarda', () => {
  assert.doesNotMatch(aviso, /só são fornecidos a terceiros mediante ordem judicial/);
  assert.doesNotMatch(aviso, /em regra mediante ordem judicial|sem ordem judicial/, 'nada sugere disponibilização dos registros sem ordem judicial');
  assert.match(aviso, /disponibilização desses registros a terceiros depende de ordem judicial \(Marco Civil da Internet, art\. 10, §1º, e art\. 15, §3º\)/);
  assert.match(aviso, /guardados por mais tempo \(art\. 15, §2º\), mas o acesso continua dependendo de ordem judicial/);
  assert.match(aviso, /não contêm dados cadastrais[^.]*\(art\. 10, §3º\)/);
  assert.match(aviso, /obrigação legal \(LGPD, art\. 7º, II\)/);
});

// [PV-10] revisão interna de 10/11/2026: o item de transferência só afirma o que foi verificado (E3, E4, auditoria) e
// não cita mecanismo do art. 33 sem comprovação (JUR-07).
test('transferência internacional: possível tratamento no exterior informado, sem mecanismo presumido', () => {
  const i = content.indexOf("title: 'Onde os dados são processados'");
  const item = content.slice(i, content.indexOf('\n    },', i));
  assert.match(item, /parte do tratamento pode ocorrer fora do Brasil, inclusive nos Estados Unidos/);
  assert.match(item, /região de São Paulo/);
  // NEKKORA-COM-CANAIS-001: sem Bookings nem Teams; o WhatsApp (Meta) não é dado como no Brasil
  assert.match(item, /As conversas pelo WhatsApp passam pelos servidores da Meta, que podem estar fora do Brasil\./);
  assert.doesNotMatch(item, /Bookings|Teams/);
  assert.doesNotMatch(item, /cláusulas[- ]padrão|CPC|país(es)? adequado|art\. 33|garantid[ao]s? (pel[ao]s?|por) contrato/i);
});
