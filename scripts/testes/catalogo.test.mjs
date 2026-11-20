/**
 * Catálogo do ecossistema (NEKKORA-COM-ECOSYSTEM-001 §2, §3 e §10): três produtos independentes, nesta ordem, com o
 * estado real de cada um (publicacao.json → servicos, PUB-23); nenhuma integração operacional com a Platform, Monitor ou
 * AI no código da página; só o link do botão "Entrar". A conferência no navegador fica em scripts/homologacao.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = resolve('.');
const content = readFileSync(join(root, 'src/content.ts'), 'utf8');
const solutions = content.slice(content.indexOf('export const SOLUTIONS'), content.indexOf('/* Preços'));

test('três produtos, nesta ordem: Nekkora AI, Nekkora Monitor e Nekkora Hosting (o Delivery não é mais produto)', () => {
  const nomes = [...solutions.matchAll(/name: '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(nomes, ['Nekkora AI', 'Nekkora Monitor', 'Nekkora Hosting']);
  assert.match(solutions, /title: 'Crie\. Monitore\. Execute\.'/);
  assert.match(content, /titleLead: 'Sua operação automatizada,'/);
  assert.match(content, /titleAccent: 'do início à execução\.'/);
});

test('estados reais (PUB-23): AI em piloto; Monitor e Hosting conforme publicacao.json; nada "disponível" sem aprovação', () => {
  const pub = JSON.parse(readFileSync(join(root, 'publicacao.json'), 'utf8'));
  assert.equal(pub.servicos.ai, 'piloto');
  for (const s of ['monitor', 'hosting']) {
    assert.ok(['sob-avaliacao', 'em-preparacao'].includes(pub.servicos[s]) || pub.aprovacoes.disponibilidade?.[s] === true, s);
  }
  // os rótulos vêm do estado gravado, nunca digitados no cartão
  for (const id of ['ai', 'monitor', 'hosting']) assert.match(solutions, new RegExp(`stage: stage\\('${id}'\\)`));
  assert.match(content, /piloto: 'Piloto'/);
  assert.match(content, /'sob-avaliacao': 'Disponibilidade sob avaliação'/);
});

test('independência (§3): cada produto contratado sozinho ou em qualquer combinação, sem pacote nem desconto', () => {
  assert.match(solutions, /'Contratação independente do AI e do Hosting'/);
  assert.match(solutions, /'Contratação independente do AI e do Monitor'/);
  assert.match(solutions, /'Também para automações que não foram criadas pela Nekkora'/);
  assert.match(solutions, /note: 'Nenhum serviço exige os outros e não há pacote obrigatório nem desconto por combinação\.'/);
  assert.doesNotMatch(solutions, /R\$\s?\d/, 'valores só no bloco de preços');
});

test('Hosting (§2.3; titular, 20/11/2026): escolha do sistema operacional, sem franquia mínima, critério de cobrança formalizado depois, sem presumir disponibilidade', () => {
  const hosting = content.slice(content.indexOf('export const HOSTING'), content.indexOf('/* Transparência'));
  assert.match(hosting, /Windows ou Linux/);
  assert.match(hosting, /Sem franquia mínima\. Disponibilidade de infraestrutura, licenciamento Windows, critério de cobrança por hora \(fração e arredondamento\)/);
  // sem desconto nem franquia mínima nesta etapa; o critério de cobrança do Hosting é formalizado depois
  assert.match(content, /'Nekkora Hosting: cobrança por hora-máquina, sem franquia mínima; o critério de cobrança das horas, o licenciamento Windows e a disponibilidade são formalizados antes da contratação'/);
  assert.doesNotMatch(content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''), /franquia mínima de|mínimo de \d+ horas/i);
  assert.match(hosting, /não representa contratação nem reserva de capacidade/);
  assert.doesNotMatch(hosting, /disponível imediatamente|pronta entrega|franquia de \d|arredonda(mos|do) para/i);
});

test('sem integração operacional com a Platform, Monitor ou AI no código da página', () => {
  const src = readdirSync(join(root, 'src'), { recursive: true }).filter((f) => /\.(ts|tsx|js)$/.test(f));
  // NEKKORA-COM-CANAIS-001 (PUB-16): a única referência à Platform é o link de navegação do botão "Entrar"
  // (PLATFORM_LOGIN_URL, em config.ts) — sem fetch, sem autenticação, sem tela de login na Commercial
  const LOGIN = 'https://platform.nekkora.com/entrar';
  for (const f of src) {
    const t = readFileSync(join(root, 'src', f), 'utf8');
    assert.doesNotMatch(t, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/, f);
    assert.doesNotMatch(t.split(LOGIN).join(''), /https?:\/\/[^'"\s]*(platform|monitor)\./i, f);
    assert.doesNotMatch(t, /type="password"|autoComplete="(current|new)-password"|\blogin\(|signIn|sessionStorage|document\.cookie/i, f);
  }
  const config = readFileSync(join(root, 'src/config.ts'), 'utf8');
  assert.match(config, /export const PLATFORM_LOGIN_URL = 'https:\/\/platform\.nekkora\.com\/entrar';/);
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
  assert.match(app, /<Button href=\{PLATFORM_LOGIN_URL\} target="_self" variant="secondary" size="sm" data-entrar="">\s*Entrar\s*<\/Button>/);
});

test('AI Piloto e limites (titular, 20/11/2026): valor maior só com aprovação prévia; propriedade em proposta específica; limites só de simulação', () => {
  assert.match(content, /se o processo exigir investimento maior que o valor inicial, ele é apresentado para sua aprovação antes de qualquer compromisso/);
  assert.match(content, /Se o processo exigir investimento maior, o valor é apresentado para sua aprovação antes de qualquer compromisso\./);
  assert.match(content, /'Propriedade e direitos sobre as automações criadas no Nekkora AI são definidos em proposta contratual específica'/);
  // o "A automação é sua" do Delivery não é herdado
  assert.doesNotMatch(content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''), /automação é sua|código-fonte é seu|propriedade (é|fica) (sua|do cliente)/i);
  assert.match(content, /limits: `Limites provisórios, só desta simulação:/);
});
