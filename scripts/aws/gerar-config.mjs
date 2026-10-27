#!/usr/bin/env node
/**
 * Configuração da AWS gerada a partir do código (COM-RELEASE-003-B/D):
 *
 *   node scripts/aws/gerar-config.mjs [--dist dist]
 *       grava deploy/aws/politica-cabecalhos.json (Response Headers Policy) com a CSP dos scripts inline do build;
 *   node scripts/aws/gerar-config.mjs --verificar [--dist dist]
 *       sai com 1 se o arquivo versionado não corresponder ao build (CI e portão de publicação);
 *   node scripts/aws/gerar-config.mjs --conta 123456789012 --bucket <nome> --distribuicao <ID> \
 *       --politica-cabecalhos <ID> --saida <pasta>
 *       preenche os modelos de deploy/aws/iam/ com os identificadores reais (para colar no console ou na CLI).
 *   node scripts/aws/gerar-config.mjs --solicitacoes --conta 123456789012 --regiao us-east-1 --identidade nekkora.com \
 *       --remetente formulario@nekkora.com --destino contato@nekkora.com --tabela nekkora-commercial-solicitacoes --saida <pasta>
 *       idem para deploy/aws/solicitacoes/ (função de recebimento de solicitações, COM-RELEASE-005 §6).
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { responseHeadersPolicy } from '../../deploy/aws/cabecalhos.mjs';
import { readRelease } from './plano.mjs';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
export const POLICY_FILE = join(root, 'deploy/aws/politica-cabecalhos.json');
const IAM_DIR = join(root, 'deploy/aws/iam');
const LEADS_DIR = join(root, 'deploy/aws/solicitacoes');

export const policyText = (release) => `${JSON.stringify(responseHeadersPolicy(release.cspScriptHashes ?? [], release.cspOrigens), null, 2)}\n`;

const FORMATS = {
  AWS_ACCOUNT_ID: /^\d{12}$/,
  AWS_S3_BUCKET: /^(?!xn--)(?!.*\.\.)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
  AWS_CLOUDFRONT_DISTRIBUTION_ID: /^E[A-Z0-9]{12,13}$/,
  AWS_RESPONSE_HEADERS_POLICY_ID: /^[0-9a-f-]{36}$/,
  AWS_REGION: /^[a-z]{2}-[a-z]+-\d$/,
  SES_IDENTITY: /^[a-z0-9.-]+\.[a-z]{2,}$/,
  SES_FROM: /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
  SES_TO: /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
  DYNAMODB_TABLE: /^[A-Za-z0-9_.-]{3,255}$/,
};

/** Substitui ${VARIAVEL} nos modelos; recusa valor fora do formato e marcador sem valor. */
export function renderTemplate(text, values) {
  for (const [k, v] of Object.entries(values)) if (!FORMATS[k]?.test(v)) throw new Error(`${k} fora do formato esperado: ${v}`);
  const out = text.replace(/\$\{([A-Z0-9_]+)\}/g, (m, k) => {
    if (!(k in values)) throw new Error(`modelo usa \${${k}} sem valor`);
    return values[k];
  });
  JSON.parse(out);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
  if (argv.includes('--solicitacoes')) {
    const values = {
      AWS_ACCOUNT_ID: opt('--conta'),
      AWS_REGION: opt('--regiao') ?? 'us-east-1',
      SES_IDENTITY: opt('--identidade'),
      SES_FROM: opt('--remetente'),
      SES_TO: opt('--destino'),
      DYNAMODB_TABLE: opt('--tabela') ?? 'nekkora-commercial-solicitacoes',
    };
    const out = resolve(opt('--saida') ?? 'aws-config-solicitacoes');
    mkdirSync(out, { recursive: true });
    for (const file of readdirSync(LEADS_DIR).filter((f) => f.endsWith('.json'))) {
      writeFileSync(join(out, file), renderTemplate(readFileSync(join(LEADS_DIR, file), 'utf8'), values));
      console.log(`${join(out, file)}`);
    }
  } else if (opt('--conta')) {
    const values = {
      AWS_ACCOUNT_ID: opt('--conta'),
      AWS_S3_BUCKET: opt('--bucket'),
      AWS_CLOUDFRONT_DISTRIBUTION_ID: opt('--distribuicao'),
      AWS_RESPONSE_HEADERS_POLICY_ID: opt('--politica-cabecalhos'),
    };
    const out = resolve(opt('--saida') ?? 'aws-config');
    mkdirSync(out, { recursive: true });
    for (const file of readdirSync(IAM_DIR).filter((f) => f.endsWith('.json'))) {
      writeFileSync(join(out, file), renderTemplate(readFileSync(join(IAM_DIR, file), 'utf8'), values));
      console.log(`${join(out, file)}`);
    }
  } else {
    const text = policyText(readRelease(resolve(opt('--dist') ?? 'dist')));
    if (argv.includes('--verificar')) {
      const current = readFileSync(POLICY_FILE, 'utf8');
      if (current !== text) {
        console.error('deploy/aws/politica-cabecalhos.json não corresponde ao build (CSP dos scripts inline mudou?). Rode: node scripts/aws/gerar-config.mjs');
        process.exitCode = 1;
      } else console.log('deploy/aws/politica-cabecalhos.json corresponde ao build');
    } else {
      writeFileSync(POLICY_FILE, text);
      console.log(`gravado ${POLICY_FILE}`);
    }
  }
}
