#!/usr/bin/env node
/**
 * Portão de publicação (NEKKORA-RELEASE-001 §6.6/§9, COM-RELEASE-003 §5.5): o deploy de produção só segue se TODOS os
 * itens que dependem da titular estiverem confirmados em publicacao.json e se o artefato for um build de produção
 * limpo, com a nekkora-lib íntegra e a política de cabeçalhos do CloudFront correspondente.
 *
 *   node scripts/verificar-publicacao.mjs [--dist dist] [--hoje AAAA-MM-DD]
 *
 * Sai com código 1 e lista as pendências (com o ID de docs/release/COM-RELEASE-PENDENCIAS.md) se algo faltar.
 * Não altera nada — só lê publicacao.json, vendor/, deploy/aws/politica-cabecalhos.json e o release.json do build.
 * Nenhuma aprovação é presumida: cada uma é um true explícito gravado pela titular.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { responseHeadersPolicy } from '../deploy/aws/cabecalhos.mjs';

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const dist = resolve(opt('--dist', 'dist'));
const today = opt('--hoje', new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()));
const json = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'));

const pub = json('publicacao.json');
const lib = json('vendor/nekkora-lib.json');
const pending = [];
const need = (ok, id, text) => !ok && pending.push(`${id} — ${text}`);

// Mesmas regras de src/config.ts
const isWhatsapp = (n) => typeof n === 'string' && /^\d{12,13}$/.test(n) && !/^\d{2}0+$/.test(n);
const isEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && !/\.(invalid|example|test)$/i.test(e);
const isProfile = (u) => {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && url.pathname.replace(/\/+$/, '').length > 1;
  } catch {
    return false;
  }
};
const iso = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
/** CNPJ (14 dígitos) ou CPF (11) com dígitos verificadores corretos; recusa sequências repetidas (00.000.000/0000-00). */
function isTaxId(doc) {
  const d = String(doc ?? '').replace(/\D/g, '');
  if (!(d.length === 11 || d.length === 14) || /^(\d)\1+$/.test(d)) return false;
  const n = d.split('').map(Number);
  const sum = (weights) => weights.reduce((acc, w, i) => acc + w * n[i], 0);
  if (d.length === 11) {
    const cpf = (weights) => ((sum(weights) * 10) % 11) % 10;
    return cpf([10, 9, 8, 7, 6, 5, 4, 3, 2]) === n[9] && cpf([11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) === n[10];
  }
  const cnpj = (weights) => (sum(weights) % 11 < 2 ? 0 : 11 - (sum(weights) % 11));
  return cnpj([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === n[12] && cnpj([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === n[13];
}

// Canais (COM-RELEASE-002 §5.1). Decisão da titular (22/10/2026): e-mail e LinkedIn obrigatórios; WhatsApp opcional.
need(pub.canais.whatsapp == null || isWhatsapp(pub.canais.whatsapp), 'PUB-01', 'WhatsApp: DDI+DDD+número, só dígitos, ou null (opcional)');
need(isEmail(pub.canais.email), 'PUB-02', 'e-mail comercial');
need(isProfile(pub.canais.linkedin) && /linkedin\.com$/i.test(new URL(pub.canais.linkedin ?? 'https://x/').hostname.replace(/^www\./, '')), 'PUB-03', 'página oficial do LinkedIn (URL de perfil)');
need(pub.canais.instagram == null || isProfile(pub.canais.instagram), 'PUB-03', 'Instagram: URL de perfil ou null (opcional)');
// Campanha (§4.4, COM-RELEASE-003-R1)
const { inicio, fim } = pub.campanhaLancamento;
need(iso(inicio) && iso(fim) && inicio <= fim, 'PUB-13', 'datas de início e fim da campanha de lançamento');
need(!iso(fim) || fim >= today, 'PUB-13', `campanha já encerrada (fim ${fim} < hoje ${today})`);
// Privacidade (§5.4)
need(Boolean(pub.controlador.nome), 'PUB-09', 'controlador dos dados: razão social (ou nome) para o aviso de privacidade');
need(isTaxId(pub.controlador.documento), 'PUB-09', 'controlador dos dados: CNPJ ou CPF válido (dígitos verificadores)');
need(Boolean(pub.hospedagem.provedor), 'PUB-11', 'provedor de hospedagem citado no aviso de privacidade');
// Aprovações da titular — preços e condições são decisões separadas (COM-RELEASE-003-R1 §3.5)
need(pub.aprovacoes.precos === true, 'PUB-14', 'aprovação dos preços');
need(pub.aprovacoes.condicoesComerciais === true, 'PUB-19', 'aprovação das condições comerciais (50/50, fila, reuniões, licenças, garantia e aceite)');
need(pub.aprovacoes.textosComerciais === true, 'PUB-17', 'aprovação dos textos comerciais');
need(pub.aprovacoes.avisoDePrivacidade === true, 'PUB-09', 'aprovação do aviso de privacidade');
need(pub.aprovacoes.publicacao === true, 'PUB-18', 'autorização expressa de publicação em produção');
need(pub.avisoHomologacao === false, 'PUB-10', 'desligar o aviso "Versão para homologação"');

// Dependência da lib: tarball versionado íntegro (LIB-RELEASE-001)
const tarball = resolve('vendor', lib.arquivo);
const sha256 = existsSync(tarball) ? createHash('sha256').update(readFileSync(tarball)).digest('hex') : null;
need(sha256 === lib.sha256, 'LIB', `vendor/${lib.arquivo} com sha256 ${lib.sha256} (obtido: ${sha256 ?? 'arquivo ausente'})`);

// Artefato: build de produção, de árvore limpa, com a mesma lib e a CSP versionada correspondente
const releaseFile = resolve(dist, 'release.json');
if (!existsSync(releaseFile)) {
  pending.push(`BUILD — ${releaseFile} não existe (rode npm run build)`);
} else {
  const rel = JSON.parse(readFileSync(releaseFile, 'utf8'));
  need(rel.homologacao === false && rel.publicacao === 'publicacao.json', 'BUILD', 'artefato feito com dados de homologação (NEKKORA_PUBLICACAO)');
  need(rel.arvoreLimpa === true, 'BUILD', 'artefato gerado com alterações não commitadas');
  need(rel.nekkoraLib?.integridade === lib.integridade, 'BUILD', 'artefato com outra versão da nekkora-lib');
  const policyFile = resolve('deploy/aws/politica-cabecalhos.json');
  const versioned = existsSync(policyFile) ? readFileSync(policyFile, 'utf8') : null;
  let expected = null;
  try {
    expected = `${JSON.stringify(responseHeadersPolicy(rel.cspScriptHashes ?? []), null, 2)}\n`;
  } catch {}
  need(versioned != null && versioned === expected, 'BUILD', 'deploy/aws/politica-cabecalhos.json não corresponde aos scripts inline do artefato (node scripts/aws/gerar-config.mjs)');
  need(!existsSync(resolve(dist, '_headers')), 'BUILD', 'artefato com _headers do Cloudflare Pages (a hospedagem é a AWS)');
}

if (pending.length) {
  console.log(`PUBLICAÇÃO BLOQUEADA — ${pending.length} pendência(s):`);
  for (const p of pending) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('Publicação liberada pelo portão: canais, campanha, privacidade, aprovações, lib e artefato conferidos.');
