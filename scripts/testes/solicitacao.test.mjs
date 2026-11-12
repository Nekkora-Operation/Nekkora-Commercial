/**
 * Jornadas de solicitação (COM-VITRINE-001, etapa 5): Delivery e Hosting pelo diálogo e pelos canais já autorizados
 * (e-mail e LinkedIn), sem campo novo, sem tipo de solicitação para Monitor ou AI e sem checkout, cadastro, assinatura ou
 * integração com a Platform. A orientação de cada serviço só aparece na tela e não entra na mensagem.
 * A conferência no navegador fica em scripts/homologacao.mjs e scripts/homologacao-canais.mjs.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = resolve('.');
const semComentarios = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const content = semComentarios(readFileSync(join(root, 'src/content.ts'), 'utf8'));
const contact = semComentarios(readFileSync(join(root, 'src/sections/Contact.tsx'), 'utf8'));
const request = semComentarios(readFileSync(join(root, 'src/request.tsx'), 'utf8'));
const pricing = semComentarios(readFileSync(join(root, 'src/sections/Pricing.tsx'), 'utf8'));
const copy = content.slice(content.indexOf('export const CONTACT_COPY'));

test('etapa 5. só três tipos de solicitação: automação (Delivery), hospedagem e infraestrutura (Hosting)', () => {
  assert.match(request, /export type Demand = 'automacao' \| 'hospedagem' \| 'infraestrutura';/);
  const opcoes = copy.slice(copy.indexOf('options: ['), copy.indexOf('],', copy.indexOf('options: [')));
  assert.deepEqual([...opcoes.matchAll(/value: '([^']+)'/g)].map((m) => m[1]), ['automacao', 'hospedagem', 'infraestrutura']);
  assert.doesNotMatch(opcoes, /Monitor|Nekkora AI|inteligência artificial/);
  assert.match(opcoes, /line: 'Quero solicitar uma avaliação de automação \(Nekkora Delivery\)\.'/);
  assert.match(opcoes, /\(Nekkora Hosting\)\.'/);
});

test('etapa 5. orientação por serviço só na tela: interesse em pacote na descrição, sem campo novo', () => {
  assert.match(copy, /automacao:\s*'Nekkora Delivery: por automação ou em pacote de 3 automações da mesma categoria\. Se tiver interesse no pacote, conte na descrição quantas automações você tem em mente; categoria e composição são confirmadas na avaliação\.'/);
  assert.match(copy, /hospedagem: 'Nekkora Hosting: sob avaliação e orçamento\./);
  assert.match(contact, /<p className="request__hint" data-dica-servico=\{demand\} aria-live="polite">\s*\{CONTACT_COPY\.demandHints\[demand\]\}/);
  // a mensagem continua montada só com tipo, nome, empresa, e-mail, descrição e simulação: a orientação não entra
  const build = contact.slice(contact.indexOf('export function buildMessage'), contact.indexOf('export const apiDescription'));
  assert.ok(build.length > 0, 'buildMessage encontrado');
  assert.doesNotMatch(build + contact.slice(contact.indexOf('export const apiDescription'), contact.indexOf('export const apiDescription') + 300), /demandHints/);
  // nenhum campo novo no formulário: os mesmos controles de antes
  const inputs = [...contact.matchAll(/<(Input|Textarea|RadioGroup|Checkbox)\b[^>]*?(label|legend)=\{?['"]?([^'"}]+)/g)].map((m) => m[3]);
  assert.deepEqual(inputs.sort(), ['CONTACT_COPY.demand.legend', 'CONTACT_COPY.messageLabel', 'CONTACT_COPY.simulation.include', 'E-mail', 'Empresa', 'Nome'].sort());
});

test('etapa 5. demandas fora das categorias (V-04) abrem a solicitação de automação', () => {
  assert.match(pricing, /const trigger = useRequestTrigger\(\{ demand: 'automacao' \}\);/);
});

test('etapa 5. sem checkout, cadastro, assinatura ou integração com a Platform na jornada', () => {
  for (const [nome, src] of [['Contact.tsx', contact], ['request.tsx', request], ['CONTACT_COPY', copy]]) {
    assert.doesNotMatch(src, /checkout|assinatura|cadastr(o|ar)|criar conta|pagamento online|cartão de crédito/i, nome);
    assert.doesNotMatch(src, /platform\./i, nome);
  }
});
