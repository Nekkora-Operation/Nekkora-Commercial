/**
 * Atendimento comercial (NEKKORA-COM-CANAIS-001, titular, 12/11/2026): o WhatsApp é o único canal público. Sem
 * formulário, diálogo, envio por e-mail, envio automático nem agendamento. Cada CTA abre o WhatsApp com a mensagem do seu
 * contexto; Monitor e AI (em preparação) só pedem informação. Substitui as jornadas do diálogo "Solicitar avaliação"
 * (COM-VITRINE-001, etapa 5). A conferência no navegador fica em scripts/homologacao.mjs e scripts/homologacao-canais.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = resolve('.');
const semComentarios = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const ler = (f) => semComentarios(readFileSync(join(root, f), 'utf8'));
const fontes = readdirSync(join(root, 'src'), { recursive: true })
  // declarações de tipo (publicacao.d.ts descreve o arquivo de configuração, inclusive os campos desativados) ficam fora
  .filter((f) => /\.(ts|tsx|js)$/.test(f) && !/\.d\.ts$/.test(f))
  .map((f) => [f, ler(join('src', f))]);
const config = ler('src/config.ts');
const whatsapp = ler('src/whatsapp.tsx');

test('sem formulário, diálogo, mailto, envio automático nem agendamento no código da página', () => {
  for (const [f, t] of fontes) {
    assert.doesNotMatch(t, /<form\b|<Dialog\b|<Textarea\b|mailto:|LEAD_API|REQUEST_CHANNEL|BOOKINGS_URL|Turnstile|sendLeadRequest/, f);
    // o único campo da página é o de quantidade do simulador: nenhum campo de dado pessoal
    assert.doesNotMatch(t, /type="(email|tel)"|autoComplete="(name|email|tel|organization)"/, f);
  }
  for (const removido of ['request.tsx', 'agendamento.tsx', 'desafio.tsx', 'envio.ts']) {
    assert.ok(!fontes.some(([f]) => f === removido), `${removido} removido`);
  }
});

test('mensagens iniciais: geral, Delivery e Hosting; Monitor e AI só pedem informação (em preparação)', () => {
  const m = config.slice(config.indexOf('export const WHATSAPP_MESSAGES'), config.indexOf('} as const;'));
  assert.match(m, /geral: 'Olá! Gostaria de conversar com um analista da Nekkora\.'/);
  assert.match(m, /delivery: 'Olá! Tenho interesse em desenvolver automações com a Nekkora\.'/);
  assert.match(m, /hosting: '[^']*hospedagem de automações[^']*'/);
  for (const s of ['monitor', 'ai']) assert.match(m, new RegExp(`${s}: 'Olá! Gostaria de receber informações sobre o Nekkora (Monitor|AI) quando ele estiver disponível\\.'`));
  // nenhuma mensagem sugere contratação imediata, preço fechado ou disponibilidade
  assert.doesNotMatch(m, /contratar|assinar|comprar|já disponível|imediat/i);
  assert.match(config, /`https:\/\/wa\.me\/\$\{CHANNELS\.whatsapp\}\?text=\$\{encodeURIComponent\(message\)\}`/);
});

test('links do WhatsApp: outra aba, sem opener e sem Referer, nome acessível avisa a saída', () => {
  assert.match(whatsapp, /target: '_blank',\s*rel: 'noopener noreferrer',/);
  assert.match(whatsapp, /WHATSAPP_SR = '\(abre o WhatsApp em outra aba\)'/);
  assert.match(whatsapp, /if \(!href\) return null;/, 'sem número confirmado, nenhum CTA de WhatsApp');
});

test('cada CTA de atendimento leva ao WhatsApp com o contexto certo', () => {
  const ctas = [
    ['src/sections/Hero.tsx', /<WhatsappButton context="geral"/],
    ['src/sections/Contact.tsx', /<WhatsappButton context="geral"/],
    ['src/sections/Hosting.tsx', /<WhatsappButton context="hosting"/],
    ['src/sections/Pricing.tsx', /<WhatsappLink context="delivery">/],
    ['src/sections/Pricing.tsx', /<WhatsappLink context=\{s\.id\}>\{PLANNED_SERVICES\.ask\(s\.name\)\}<\/WhatsappLink>/],
    ['src/sections/Simulator.tsx', /<WhatsappButton context="delivery" extra=\{summary && `\$\{S\.whatsappIntro\}\\n\$\{summary\}`\}>/],
  ];
  for (const [f, re] of ctas) assert.match(ler(f), re, f);
});

test('botão flutuante: "Fale com um analista", ícone do WhatsApp, sem pulso nem tooltip, outra aba sem opener', () => {
  const app = ler('src/App.tsx');
  assert.match(app, /const FAB_TEXT = 'Fale com um analista';/);
  const fab = app.slice(app.indexOf('<FloatingButton'), app.indexOf('</FloatingButton>'));
  assert.match(fab, /icon="whatsapp"/);
  assert.match(fab, /tooltip=\{false\}/);
  assert.match(fab, /target="_blank"\s*rel="noopener noreferrer"/);
  assert.doesNotMatch(fab, /\bpulse\b/, 'sem animação que sugira atendimento imediato');
  assert.match(fab, /\{FAB_TEXT\}/, 'texto ao lado do ícone');
});

test('contato: LinkedIn e Instagram como redes institucionais; e-mail só no rodapé e no aviso de privacidade', () => {
  const contact = ler('src/sections/Contact.tsx');
  assert.match(contact, /CHANNELS\.linkedin && \{ href: CHANNELS\.linkedin, icon: 'linkedin'/);
  assert.match(contact, /CHANNELS\.instagram && \{ href: CHANNELS\.instagram, icon: 'instagram'/);
  assert.doesNotMatch(contact, /CHANNELS\.email/);
  const usamEmail = fontes.filter(([, t]) => /CHANNELS\.email/.test(t)).map(([f]) => f).sort();
  assert.deepEqual(usamEmail, ['content.ts'], 'e-mail só em content.ts (rodapé, aviso de privacidade e regra da campanha)');
});
