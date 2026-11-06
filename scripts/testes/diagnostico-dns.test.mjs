/**
 * scripts/aws/diagnostico-dns.mjs (NEKKORA-COM-GOLIVE-001): avaliação do DNS do lançamento. As respostas DNS e HTTPS
 * são simuladas; nada sai da máquina.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliarDns, consultar, ipDaCloudflare, ACM_VALIDACAO, CLOUDFRONT_PADRAO } from '../aws/diagnostico-dns.mjs';

const R = (dados) => ({ status: 0, dados });
/** DNS observado em 06/11/2026: Microsoft 365 completo, ACM validado, site ainda fora do DNS. */
function base() {
  return {
    'nekkora.com NS': R(['bethany.ns.cloudflare.com', 'micah.ns.cloudflare.com']),
    'nekkora.com MX': R(['0 nekkora-com.mail.protection.outlook.com']),
    'nekkora.com TXT': R(['ms=ms38126768', 'v=spf1 include:spf.protection.outlook.com ~all']),
    'nekkora.com A': R([]), 'nekkora.com AAAA': R([]), 'nekkora.com CNAME': R([]),
    'www.nekkora.com CNAME': R([]), 'www.nekkora.com A': R([]),
    'autodiscover.nekkora.com CNAME': R(['autodiscover.outlook.com']),
    '_dmarc.nekkora.com TXT': R(['v=dmarc1; p=none']),
    'selector1._domainkey.nekkora.com CNAME': R(['selector1-nekkora-com._domainkey.radiantsai.n-v1.dkim.mail.microsoft']),
    'selector2._domainkey.nekkora.com CNAME': R(['selector2-nekkora-com._domainkey.radiantsai.n-v1.dkim.mail.microsoft']),
    ...Object.fromEntries(ACM_VALIDACAO.map((v) => [`${v.nome} CNAME`, R([v.valor])])),
    [`${CLOUDFRONT_PADRAO} A`]: R(['18.67.162.108', '18.67.162.117']),
  };
}
const nivel = (res, id) => res.find((x) => x.id === id)?.nivel;
const lancado = () => ({
  ...base(),
  'nekkora.com A': R(['18.67.162.108', '18.67.162.117']),
  'www.nekkora.com CNAME': R([CLOUDFRONT_PADRAO]),
  'www.nekkora.com A': R(['18.67.162.108']),
});
const httpsCf = {
  'https://nekkora.com/': { status: 200, via: '1.1 abc.cloudfront.net (CloudFront)', pop: 'GRU1-P7', server: 'AmazonS3' },
  'https://www.nekkora.com/': { status: 301, via: '1.1 abc.cloudfront.net (CloudFront)', pop: 'GRU1-P7', server: '', location: 'https://nekkora.com/' },
};

test('antes: estado de 06/11/2026 — Microsoft 365 e ACM ok, site pendente, nenhuma falha', () => {
  const res = avaliarDns(base(), { fase: 'antes' });
  assert.deepEqual(res.filter((x) => x.nivel === 'falha'), []);
  assert.equal(nivel(res, 'S01'), 'pendente');
  assert.equal(nivel(res, 'S02'), 'pendente');
  for (const id of ['N01', 'M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'K01', 'K02', 'S00']) assert.equal(nivel(res, id), 'ok', id);
});

test('registro do Microsoft 365 removido ou SPF duplicado → falha (em qualquer fase)', () => {
  for (const fase of ['antes', 'depois']) {
    const r = base();
    r['nekkora.com MX'] = R([]);
    r['nekkora.com TXT'] = R(['ms=ms38126768', 'v=spf1 include:spf.protection.outlook.com ~all', 'v=spf1 -all']);
    r['selector2._domainkey.nekkora.com CNAME'] = R([]);
    const res = avaliarDns(r, { fase });
    assert.equal(nivel(res, 'M01'), 'falha');
    assert.equal(nivel(res, 'M03'), 'falha');
    assert.equal(nivel(res, 'M06'), 'falha');
  }
});

test('CNAME de validação do ACM removido → falha (a renovação automática quebraria)', () => {
  const r = base();
  delete r[`${ACM_VALIDACAO[1].nome} CNAME`];
  assert.equal(nivel(avaliarDns(r), 'K02'), 'falha');
});

test('DMARC ausente é só informativo', () => {
  const r = base();
  r['_dmarc.nekkora.com TXT'] = R([]);
  assert.equal(nivel(avaliarDns(r), 'M07'), 'info');
});

test('depois: apex e www no CloudFront, HTTPS com cabeçalhos do CloudFront → ok', () => {
  const res = avaliarDns(lancado(), { fase: 'depois', https: httpsCf });
  assert.deepEqual(res.filter((x) => x.nivel !== 'ok'), []);
});

test('depois: sem registros ainda → falha (aliases do CloudFront não contam)', () => {
  const res = avaliarDns(base(), { fase: 'depois', https: { 'https://nekkora.com/': { erro: 'ENOTFOUND' }, 'https://www.nekkora.com/': { erro: 'ENOTFOUND' } } });
  for (const id of ['S01', 'S02', 'S03', 'S04']) assert.equal(nivel(res, id), 'falha', id);
});

test('depois: proxy da Cloudflare ligado (nuvem laranja) → falha', () => {
  const r = lancado();
  r['nekkora.com A'] = R(['104.21.3.4', '172.67.1.2']);
  const https = { ...httpsCf, 'https://nekkora.com/': { status: 200, via: '', pop: '', server: 'cloudflare' } };
  const res = avaliarDns(r, { fase: 'depois', https });
  assert.equal(nivel(res, 'S01'), 'falha');
  assert.equal(nivel(res, 'S03'), 'falha');
});

test('depois: www apontando para outro destino → falha', () => {
  const r = lancado();
  r['www.nekkora.com CNAME'] = R(['nekkora.pages.dev']);
  assert.equal(nivel(avaliarDns(r, { fase: 'depois', https: httpsCf }), 'S02'), 'falha');
});

test('antes: site já apontado para fora do CloudFront → falha; já no CloudFront → info', () => {
  const r = base();
  r['www.nekkora.com CNAME'] = R(['nekkora.pages.dev']);
  assert.equal(nivel(avaliarDns(r, { fase: 'antes' }), 'S02'), 'falha');
  assert.equal(nivel(avaliarDns(lancado(), { fase: 'antes' }), 'S02'), 'info');
});

test('faixas da Cloudflare', () => {
  assert.equal(ipDaCloudflare('104.21.3.4'), true);
  assert.equal(ipDaCloudflare('172.67.1.2'), true);
  assert.equal(ipDaCloudflare('18.67.162.108'), false);
  assert.equal(ipDaCloudflare('2606:4700::1'), false);
});

test('consultar: só lê por DoH, normaliza aspas e ponto final e filtra o tipo pedido', async () => {
  const urls = [];
  const fetchImpl = async (url, { headers }) => {
    urls.push(url);
    assert.equal(headers.accept, 'application/dns-json');
    return { ok: true, json: async () => ({ Status: 0, Answer: [{ type: 5, data: 'x.cloudfront.net.' }, { type: 16, data: '"MS=ms1"' }, { type: 1, data: '1.2.3.4' }] }) };
  };
  assert.deepEqual((await consultar('www.nekkora.com', 'CNAME', { fetchImpl })).dados, ['x.cloudfront.net']);
  assert.deepEqual((await consultar('nekkora.com', 'TXT', { fetchImpl })).dados, ['ms=ms1']);
  assert.match(urls[0], /^https:\/\/cloudflare-dns\.com\/dns-query\?name=www\.nekkora\.com&type=CNAME$/);
});
