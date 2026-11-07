#!/usr/bin/env node
/**
 * Diagnóstico de DNS do lançamento (NEKKORA-COM-GOLIVE-001) — SOMENTE LEITURA.
 *
 * Consulta o DNS público por DNS-over-HTTPS (sem credenciais, sem API da Cloudflare, sem alterar nada) e confere:
 *   - delegação na Cloudflare;
 *   - registros do Microsoft 365 que NÃO podem ser afetados pelo ajuste do site (MX, SPF, MS=, autodiscover, DKIM);
 *   - CNAMEs de validação do certificado ACM (necessários para a renovação automática);
 *   - nekkora.com e www.nekkora.com em relação à distribuição do CloudFront, conforme a fase:
 *       --fase antes   → o site ainda NÃO deve apontar (estado esperado antes da autorização de DNS);
 *       --fase depois  → os dois nomes devem chegar ao CloudFront, sem proxy da Cloudflare (nuvem cinza).
 *
 * Aliases configurados no CloudFront NÃO provam nada sobre o DNS público: este script só olha o que os resolvedores
 * respondem e, na fase "depois", o que o servidor HTTPS realmente devolve (cabeçalhos do CloudFront).
 *
 *   node scripts/aws/diagnostico-dns.mjs [--fase antes|depois] [--cloudfront dnl1wnnmoqhaj.cloudfront.net]
 *                                        [--resolvedor https://cloudflare-dns.com/dns-query] [--json arquivo]
 * Saída 1 se houver "falha". "pendente" e "info" não falham.
 */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const DOMINIO = 'nekkora.com';
export const CLOUDFRONT_PADRAO = 'dnl1wnnmoqhaj.cloudfront.net';

/** Registros do Microsoft 365 observados em 06/11/2026 (NEKKORA-COM-GOLIVE-001 §3). Mudou algum? A titular confere. */
export const M365 = {
  mx: 'nekkora-com.mail.protection.outlook.com',
  verificacao: 'MS=ms38126768',
  spfInclude: 'include:spf.protection.outlook.com',
  autodiscover: 'autodiscover.outlook.com',
  dkim: ['selector1', 'selector2'],
};

/** CNAMEs de validação do ACM listados pela auditoria (run 42223072197, certificado 566da593…). */
export const ACM_VALIDACAO = [
  { nome: '_2bf0f61e202af4ced2281fbfa3dc419b.nekkora.com', valor: '_32e05c72a0ed2d70066a5a797e2f9420.wzccmgtwzk.acm-validations.aws' },
  { nome: '_25da4deff5e993a34181bf930ce79319.www.nekkora.com', valor: '_ec343f04889a25353e6371b6031e3b24.wzccmgtwzk.acm-validations.aws' },
];

/** Faixas IPv4 públicas do proxy da Cloudflare (https://www.cloudflare.com/ips-v4). IP nelas = nuvem laranja. */
const FAIXAS_CLOUDFLARE = ['173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
  '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15',
  '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22'];

const ipNum = (ip) => ip.split('.').reduce((n, p) => n * 256 + Number(p), 0);
export function ipDaCloudflare(ip) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return false;
  return FAIXAS_CLOUDFLARE.some((f) => {
    const [base, bits] = f.split('/');
    const tamanho = 2 ** (32 - Number(bits));
    return Math.floor(ipNum(ip) / tamanho) === Math.floor(ipNum(base) / tamanho);
  });
}

const limpar = (s) => String(s).replace(/^"|"$/g, '').replace(/"\s*"/g, '').replace(/\.$/, '').toLowerCase();
const TIPOS = { A: 1, NS: 2, CNAME: 5, MX: 15, TXT: 16, AAAA: 28 };

/** Uma consulta DoH (formato JSON). Devolve { status, dados: [valores do tipo pedido] }. */
export async function consultar(nome, tipo, { resolvedor = 'https://cloudflare-dns.com/dns-query', fetchImpl = fetch } = {}) {
  const r = await fetchImpl(`${resolvedor}?name=${encodeURIComponent(nome)}&type=${tipo}`, { headers: { accept: 'application/dns-json' } });
  if (!r.ok) throw new Error(`DoH ${nome} ${tipo}: HTTP ${r.status}`);
  const j = await r.json();
  return { status: j.Status, dados: (j.Answer ?? []).filter((a) => a.type === TIPOS[tipo]).map((a) => limpar(a.data)) };
}

/** Todas as consultas de que a avaliação precisa, num mapa "nome TIPO" → { status, dados }. */
export async function coletar({ cloudfront = CLOUDFRONT_PADRAO, ...opcoes } = {}) {
  const pedidos = [
    [DOMINIO, 'NS'], [DOMINIO, 'MX'], [DOMINIO, 'TXT'], [DOMINIO, 'A'], [DOMINIO, 'AAAA'], [DOMINIO, 'CNAME'],
    [`www.${DOMINIO}`, 'CNAME'], [`www.${DOMINIO}`, 'A'], [`autodiscover.${DOMINIO}`, 'CNAME'], [`_dmarc.${DOMINIO}`, 'TXT'],
    ...M365.dkim.map((s) => [`${s}._domainkey.${DOMINIO}`, 'CNAME']),
    ...ACM_VALIDACAO.map((v) => [v.nome, 'CNAME']),
    [cloudfront, 'A'],
  ];
  const r = {};
  for (const [nome, tipo] of pedidos) r[`${nome} ${tipo}`] = await consultar(nome, tipo, opcoes);
  return r;
}

/** O que o HTTPS realmente serve (só na fase "depois"). Nunca segue redirecionamentos. */
export async function sondarHttps(url, { fetchImpl = fetch } = {}) {
  try {
    const r = await fetchImpl(url, { method: 'HEAD', redirect: 'manual' });
    const h = (n) => r.headers.get(n) ?? '';
    return { status: r.status, server: h('server'), via: h('via'), pop: h('x-amz-cf-pop'), location: h('location') };
  } catch (e) {
    return { erro: e.cause?.code ?? e.message };
  }
}

/**
 * Avaliação pura (testável): respostas DNS + sondagens HTTPS → lista de verificações.
 * nivel: ok | pendente | falha | info.
 */
export function avaliarDns(r, { fase = 'antes', cloudfront = CLOUDFRONT_PADRAO, https = {} } = {}) {
  const out = [];
  const add = (id, nivel, titulo, detalhe) => out.push({ id, nivel, titulo, detalhe });
  const d = (nome, tipo) => r[`${nome} ${tipo}`]?.dados ?? [];
  const cf = cloudfront.toLowerCase();

  const ns = d(DOMINIO, 'NS');
  add('N01', ns.length && ns.every((n) => n.endsWith('.ns.cloudflare.com')) ? 'ok' : 'falha', 'Delegação na Cloudflare', ns.join(', ') || 'nenhum NS');

  // Microsoft 365: devem estar presentes ANTES e DEPOIS do ajuste do site
  const mx = d(DOMINIO, 'MX');
  add('M01', mx.some((m) => m.endsWith(` ${M365.mx}`)) ? 'ok' : 'falha', 'MX do Microsoft 365', mx.join(', ') || 'ausente');
  const txt = d(DOMINIO, 'TXT');
  add('M02', txt.includes(M365.verificacao.toLowerCase()) ? 'ok' : 'falha', 'TXT de verificação do domínio no Microsoft 365', txt.find((t) => t.startsWith('ms=')) ?? 'ausente');
  const spf = txt.filter((t) => t.startsWith('v=spf1'));
  add('M03', spf.length === 1 && spf[0].includes(M365.spfInclude) ? 'ok' : 'falha', 'SPF único, incluindo o Microsoft 365', spf.join(' | ') || 'ausente');
  const auto = d(`autodiscover.${DOMINIO}`, 'CNAME');
  add('M04', auto.includes(M365.autodiscover) ? 'ok' : 'falha', 'autodiscover → Microsoft 365', auto.join(', ') || 'ausente');
  for (const [i, s] of M365.dkim.entries()) {
    const v = d(`${s}._domainkey.${DOMINIO}`, 'CNAME');
    add(`M0${5 + i}`, v.some((x) => x.endsWith('.dkim.mail.microsoft') || x.endsWith('.onmicrosoft.com')) ? 'ok' : 'falha', `DKIM ${s} do Microsoft 365`, v.join(', ') || 'ausente');
  }
  const dmarc = d(`_dmarc.${DOMINIO}`, 'TXT');
  add('M07', dmarc.some((t) => t.startsWith('v=dmarc1')) ? 'ok' : 'info', 'DMARC (recomendado, não bloqueia o lançamento)', dmarc.join(', ') || 'ausente');

  for (const [i, v] of ACM_VALIDACAO.entries()) {
    const val = d(v.nome, 'CNAME');
    add(`K0${1 + i}`, val.includes(v.valor) ? 'ok' : 'falha', `CNAME de validação do ACM (renovação automática) — ${v.nome.split('.').slice(1).join('.')}`, val.join(', ') || 'ausente: a renovação de 2027 falharia');
  }

  // Site
  const ipsCf = d(cloudfront, 'A');
  add('S00', ipsCf.length ? 'ok' : 'falha', 'Distribuição do CloudFront resolve', `${cloudfront}: ${ipsCf.length} IPv4`);
  const apexA = d(DOMINIO, 'A');
  const apexAAAA = d(DOMINIO, 'AAAA');
  const apexCname = d(DOMINIO, 'CNAME');
  const wwwCname = d(`www.${DOMINIO}`, 'CNAME');
  const wwwA = d(`www.${DOMINIO}`, 'A');
  const laranja = [...apexA, ...wwwA].filter(ipDaCloudflare);

  if (fase === 'antes') {
    const apexVazio = !apexA.length && !apexAAAA.length && !apexCname.length;
    add('S01', apexVazio ? 'pendente' : laranja.length ? 'falha' : 'info', 'nekkora.com → CloudFront',
      apexVazio ? 'sem A/AAAA/CNAME: o site ainda não está no DNS (esperado antes da autorização; registro a criar)' : `já responde: ${[...apexCname, ...apexA, ...apexAAAA].join(', ')}`);
    const wwwVazio = !wwwCname.length && !wwwA.length;
    add('S02', wwwVazio ? 'pendente' : wwwCname.includes(cf) ? 'info' : 'falha', `www.${DOMINIO} → CloudFront`,
      wwwVazio ? `sem registro: criar CNAME www → ${cloudfront} (DNS only)` : `já responde: ${[...wwwCname, ...wwwA].join(', ')}`);
  } else {
    add('S01', apexA.length && !laranja.some((ip) => apexA.includes(ip)) ? 'ok' : 'falha', 'nekkora.com resolve sem proxy da Cloudflare',
      apexA.length ? `${apexA.join(', ')}${laranja.length ? ' — IP da Cloudflare: desligue o proxy (nuvem cinza)' : ''}` : 'sem A: o registro ainda não existe ou não propagou');
    add('S02', wwwCname.includes(cf) ? 'ok' : 'falha', `www.${DOMINIO} → ${cloudfront}`, [...wwwCname, ...wwwA].join(', ') || 'ausente');
    for (const [id, nome] of [['S03', `https://${DOMINIO}/`], ['S04', `https://www.${DOMINIO}/`]]) {
      const h = https[nome];
      if (!h) { add(id, 'pendente', `HTTPS servido pelo CloudFront — ${nome}`, 'não sondado'); continue; }
      const doCf = !h.erro && /cloudfront/i.test(h.via) && h.pop && !/cloudflare/i.test(h.server);
      add(id, doCf ? 'ok' : 'falha', `HTTPS servido pelo CloudFront — ${nome}`, h.erro ? `erro: ${h.erro}` : `HTTP ${h.status}, via="${h.via}", pop=${h.pop || '—'}, server=${h.server || '—'}${h.location ? `, → ${h.location}` : ''}`);
    }
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const opt = (n, padrao) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : padrao);
  const fase = opt('--fase', 'antes');
  if (!['antes', 'depois'].includes(fase)) { console.error('--fase deve ser "antes" ou "depois"'); process.exit(2); }
  const cloudfront = opt('--cloudfront', CLOUDFRONT_PADRAO);
  const resolvedor = opt('--resolvedor', 'https://cloudflare-dns.com/dns-query');
  const respostas = await coletar({ cloudfront, resolvedor });
  const https = {};
  if (fase === 'depois') for (const u of [`https://${DOMINIO}/`, `https://www.${DOMINIO}/`]) https[u] = await sondarHttps(u);
  const resultado = avaliarDns(respostas, { fase, cloudfront, https });
  console.log(`Diagnóstico de DNS (somente leitura) — fase "${fase}", resolvedor ${resolvedor}, ${new Date().toISOString()}\n`);
  console.log('| ID | Nível | Verificação | Detalhe |\n|---|---|---|---|');
  for (const x of resultado) console.log(`| ${x.id} | ${x.nivel} | ${x.titulo} | ${x.detalhe} |`);
  const conta = (n) => resultado.filter((x) => x.nivel === n).length;
  console.log(`\n${conta('ok')} ok, ${conta('pendente')} pendente(s), ${conta('falha')} falha(s), ${conta('info')} info`);
  if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify({ fase, resolvedor, data: new Date().toISOString(), respostas, https, resultado }, null, 2));
  process.exitCode = conta('falha') ? 1 : 0;
}
