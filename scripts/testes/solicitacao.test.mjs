/**
 * Formulário de atendimento (NEKKORA-COM-ECOSYSTEM-001 §7 e §8): só prepara a mensagem no navegador e abre o WhatsApp
 * oficial. Sem envio automático, endpoint, banco de dados, e-mail, API do WhatsApp, Microsoft Bookings ou armazenamento
 * persistente. Importa src/mensagem.ts — o mesmo código que a página usa. As jornadas no navegador ficam em
 * scripts/homologacao-canais.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FORM_LIMITS, buildMessage, normalizeFields, validateRequest } from '../../src/mensagem.ts';

const root = resolve('.');
const semComentarios = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const ler = (f) => semComentarios(readFileSync(join(root, f), 'utf8'));
const fontes = readdirSync(join(root, 'src'), { recursive: true })
  .filter((f) => /\.(ts|tsx|js)$/.test(f) && !/\.d\.ts$/.test(f))
  .map((f) => [f, ler(join('src', f))]);
const GREETING = 'Olá! Gostaria de conversar com um analista da Nekkora.';
const LABELS = { name: 'Nome', company: 'Empresa', email: 'E-mail', description: 'Descrição do processo', services: 'Serviços de interesse', simulation: 'Simulação de investimento' };

test('validação: nome e descrição obrigatórios; empresa e e-mail opcionais; e-mail informado precisa ser válido', () => {
  assert.deepEqual(validateRequest({}), { name: true, description: true });
  assert.deepEqual(validateRequest({ name: '  ', description: '\n\t ' }), { name: true, description: true });
  assert.deepEqual(validateRequest({ name: 'Ana', description: 'Conciliação diária' }), {});
  assert.deepEqual(validateRequest({ name: 'Ana', description: 'x', email: 'ana@' }), { email: true });
  assert.deepEqual(validateRequest({ name: 'Ana', description: 'x', email: 'ana@empresa.com.br' }), {});
  assert.deepEqual(validateRequest({ name: 'Ana', description: 'x', email: '   ' }), {}, 'e-mail em branco é opcional');
});

test('mensagem estruturada (exemplo do §7): só os campos informados, na ordem, sem campos vazios', () => {
  const completa = buildMessage(
    GREETING,
    LABELS,
    { name: 'Ana Souza', company: 'Empresa X', email: 'ana@x.com', description: 'Conferimos pagamentos.\nTodo dia.' },
    ['Nekkora AI (piloto)', 'Nekkora Monitor'],
    '- Nekkora AI (piloto): 3 automações × R$ 100 = a partir de R$ 300',
  );
  assert.equal(
    completa,
    [
      GREETING,
      'Nome: Ana Souza\nEmpresa: Empresa X\nE-mail: ana@x.com',
      'Descrição do processo:\nConferimos pagamentos.\nTodo dia.',
      'Serviços de interesse:\n- Nekkora AI (piloto)\n- Nekkora Monitor',
      'Simulação de investimento:\n- Nekkora AI (piloto): 3 automações × R$ 100 = a partir de R$ 300',
    ].join('\n\n'),
  );
  const minima = buildMessage(GREETING, LABELS, { name: 'Ana', company: ' ', email: '', description: 'Preciso de ajuda' });
  assert.equal(minima, `${GREETING}\n\nNome: Ana\n\nDescrição do processo:\nPreciso de ajuda`);
  assert.doesNotMatch(minima, /Empresa|E-mail|Serviços|Simulação/);
});

test('o resumo da simulação só entra se o visitante escolher (o componente passa null ao desmarcar)', () => {
  assert.doesNotMatch(buildMessage(GREETING, LABELS, { name: 'A', description: 'B' }, [], null), /Simulação/);
  assert.doesNotMatch(buildMessage(GREETING, LABELS, { name: 'A', description: 'B' }, [], '   '), /Simulação/);
  const ui = ler('src/atendimento.tsx');
  assert.match(ui, /buildMessage\(WHATSAPP_GREETING, F\.message, fields, chosen, includeSimulation \? simulation : null\)/);
});

test('limites e limpeza: caracteres de controle removidos, tamanhos máximos respeitados', () => {
  const n = normalizeFields({ name: `A\u0000na${'x'.repeat(500)}`, description: `linha 1\r\nlinha 2\u0007${'y'.repeat(5000)}` });
  assert.ok(!/[\u0000-\u0008]/.test(n.name + n.description));
  assert.equal(n.name.length, FORM_LIMITS.name);
  assert.equal(n.description.length, FORM_LIMITS.description);
  assert.match(n.description, /^linha 1\nlinha 2 /, 'quebra de linha preservada só na descrição');
});

test('codificação para o WhatsApp: acentos, quebras de linha e símbolos voltam idênticos', () => {
  const msg = buildMessage(GREETING, LABELS, { name: 'João & Cia', description: 'Conciliação 100% manual?\n#1 + "aspas"' });
  const url = `https://wa.me/5511930597466?text=${encodeURIComponent(msg)}`;
  assert.equal(new URL(url).searchParams.get('text'), msg);
  const config = ler('src/config.ts');
  assert.match(config, /`https:\/\/wa\.me\/\$\{CHANNELS\.whatsapp\}\?text=\$\{encodeURIComponent\(message\)\}`/);
  assert.match(config, /export const WHATSAPP_GREETING = 'Olá! Gostaria de conversar com um analista da Nekkora\.';/);
});

test('sem envio automático, endpoint, e-mail, Bookings, Turnstile nem armazenamento no código da página', () => {
  for (const [f, t] of fontes) {
    assert.doesNotMatch(t, /mailto:|LEAD_API|REQUEST_CHANNEL|BOOKINGS_URL|Turnstile|sendLeadRequest|fetch\(|XMLHttpRequest|sendBeacon|WebSocket/, f);
    assert.doesNotMatch(t, /sessionStorage|indexedDB|document\.cookie/, f);
    // o único uso de localStorage é o tema (THEME_STORAGE_KEY, lido pela nekkora-lib e pelo index.html)
    if (f !== 'config.ts') assert.doesNotMatch(t, /localStorage/, f);
  }
  for (const removido of ['request.tsx', 'agendamento.tsx', 'desafio.tsx', 'envio.ts', 'whatsapp.tsx']) {
    assert.ok(!fontes.some(([f]) => f === removido), `${removido} removido`);
  }
});

test('abertura do WhatsApp: outra aba, sem opener nem Referer; abrir não é recebimento', () => {
  const ui = ler('src/atendimento.tsx');
  assert.match(ui, /window\.open\(url, '_blank', 'noopener,noreferrer'\)/);
  assert.match(ui, /href=\{link\} target="_blank" rel="noopener noreferrer"/);
  const content = ler('src/content.ts');
  assert.match(content, /Ela só chega à Nekkora quando você tocar em enviar — abrir o WhatsApp não é o envio\./);
  assert.match(content, /hint: 'Não informe senhas, credenciais nem dados confidenciais\.'/);
  assert.doesNotMatch(content, /solicitação (foi )?recebida|recebemos sua|mensagem enviada com sucesso/i);
});

test('todos os CTAs comerciais e o botão flutuante abrem o formulário (com o contexto do produto ou da calculadora)', () => {
  const ctas = [
    ['src/sections/Hero.tsx', /<RequestButton size="lg" pill data-atendimento-origem="topo">/],
    ['src/sections/Contact.tsx', /<RequestButton size="lg" pill data-atendimento-origem="contato">/],
    ['src/sections/Hosting.tsx', /<RequestButton options=\{\{ services: \['hosting'\] \}\}/],
    ['src/sections/Solutions.tsx', /<RequestButton options=\{\{ services: \[s\.id\] \}\}/],
    ['src/sections/Simulator.tsx', /<RequestButton options=\{\{ services: servicesOf\(sim\), simulation: summary \}\}/],
  ];
  for (const [f, re] of ctas) assert.match(ler(f), re, f);
  const app = ler('src/App.tsx');
  assert.match(app, /const FAB_TEXT = 'Fale com um analista';/);
  const fab = app.slice(app.indexOf('<FloatingButton'), app.indexOf('</FloatingButton>'));
  assert.match(fab, /\{\.\.\.trigger\}/, 'o botão flutuante abre o formulário');
  assert.match(fab, /icon="whatsapp"/);
  assert.match(fab, /tooltip=\{false\}/);
  assert.doesNotMatch(fab, /\bpulse\b/, 'sem animação que sugira atendimento imediato');
  // nenhum link direto ao WhatsApp fora do formulário
  for (const [f, t] of fontes) if (f !== 'atendimento.tsx' && f !== 'config.ts') assert.doesNotMatch(t, /wa\.me|whatsappUrl\(/, f);
});

test('contato: LinkedIn e Instagram como redes institucionais; e-mail só no rodapé e no aviso de privacidade', () => {
  const contact = ler('src/sections/Contact.tsx');
  assert.match(contact, /CHANNELS\.linkedin && \{ href: CHANNELS\.linkedin, icon: 'linkedin'/);
  assert.match(contact, /CHANNELS\.instagram && \{ href: CHANNELS\.instagram, icon: 'instagram'/);
  const usamEmail = fontes.filter(([, t]) => /CHANNELS\.email/.test(t)).map(([f]) => f).sort();
  assert.deepEqual(usamEmail, ['content.ts'], 'e-mail só em content.ts (rodapé e aviso de privacidade)');
});

test('resumo da simulação começa DESMARCADO (titular, 20/11/2026): só entra na mensagem se o visitante marcar', () => {
  const a = ler('src/atendimento.tsx');
  assert.match(a, /useState\(false\);/);
  assert.match(a, /setIncludeSimulation\(false\);/);
  assert.doesNotMatch(a, /setIncludeSimulation\((true|Boolean\()/);
  assert.match(a, /includeSimulation \? simulation : null/);
});
