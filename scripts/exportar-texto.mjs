#!/usr/bin/env node
/**
 * Gera docs/com-001/05-texto-comercial.md a partir de src/content.ts (fonte única do texto da página).
 * Requer Node ≥ 23.6 (remoção nativa de tipos TypeScript). Uso: npm run texto
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const c = await import(new URL('../src/content.ts', import.meta.url));
const { CONTACT_COPY: K } = c;

const L = [];
const h = (t) => L.push('', `## ${t}`, '');
const list = (items) => items.forEach((i) => L.push(`- ${i}`));
const header = (s) => L.push(`**${s.eyebrow}** — ${s.title}`, '', s.description ?? '');

L.push(
  '# COM-001 — Texto comercial consolidado',
  '',
  '> Gerado por `npm run texto` a partir de [`src/content.ts`](../../src/content.ts). Não edite este arquivo: altere',
  '> o `content.ts` (e a [matriz de alegações](03-matriz-alegacoes.md), se a mudança afetar uma promessa) e gere de novo.',
);

h('1. Hero');
L.push(`Selo: ${c.HERO.badge}`, '', `**${c.HERO.titleLead} ${c.HERO.titleAccent}**`, '', c.HERO.lead, '', `CTAs: "${c.HERO.primaryCta}" · "${c.HERO.secondaryCta}"`, '');
list(c.HERO.points.map((p) => p.label));
L.push('', `Ilustração (selo "${c.HERO.journey.label}") — ${c.HERO.journey.title}: ${c.HERO.journey.steps.join(' → ')}. ${c.HERO.journey.execution}.`);

h('2. Soluções');
header(c.SOLUTIONS);
for (const s of c.SOLUTIONS.cards) {
  L.push('', `### ${s.name} · _${s.stage}_`, '', s.summary, '');
  list(s.items);
  L.push('', `Link: "${s.cta}"`);
}
L.push('', `${c.SOLUTIONS.note} (${c.SOLUTIONS.noteLink})`);

h('3. Delivery');
header(c.DELIVERY);
L.push('');
list(c.DELIVERY.features.map((f) => `**${f.title}** — ${f.text}`));
L.push('', c.DELIVERY.licenses, '', `**${c.DELIVERY.applications.title}** — _${c.DELIVERY.applications.caption}_`, '');
list(c.DELIVERY.applications.items);
L.push('', `CTA: "${c.DELIVERY.cta}"`);

h('4. Como funciona');
header(c.HOW_IT_WORKS);
L.push('');
c.HOW_IT_WORKS.steps.forEach((s, i) => L.push(`${i + 1}. **${s.title}** — ${s.description}`));
L.push('', `**${c.HOW_IT_WORKS.timing.title}** — ${c.HOW_IT_WORKS.timing.text}`, '');
list(c.HOW_IT_WORKS.timing.items);

h('5. Hosting');
header(c.HOSTING);
L.push('', `> **${c.HOSTING.availability.title}** — ${c.HOSTING.availability.text}`, '', `**${c.HOSTING.catalogTitle}**`, '', `| Serviço | O que significa | ${c.HOSTING.termsLabel} |`, '|---|---|---|');
c.HOSTING.services.forEach((s) => L.push(`| ${s.title} | ${s.text} | ${s.terms} |`));
L.push('', `No celular (acordeão): _${c.HOSTING.accordionHint}_`);
L.push('', `CTA: "${c.HOSTING.cta}"`);

h('6. Solução combinada');
header(c.COMBINED);
for (const o of c.COMBINED.options) {
  L.push('', `### ${o.title}`, '', o.text, '', `_${o.fit}_`);
  if (o.condition) L.push('', `Condição: ${o.condition}`);
}
L.push('', `**${c.COMBINED.limits.title}**`, '');
list(c.COMBINED.limits.items);

h('7. Diferenciais');
header(c.DIFFERENTIALS);
L.push('');
list(c.DIFFERENTIALS.items.map((f) => `**${f.title}** — ${f.text}`));
L.push('', `Manifesto: "${c.DIFFERENTIALS.manifesto.lead} ${c.DIFFERENTIALS.manifesto.accent}"`);

h('8. Transparência');
header(c.TRANSPARENCY);
for (const key of ['defined', 'excluded', 'dependencies']) {
  L.push('', `**${c.TRANSPARENCY[key].title}**`, '');
  list(c.TRANSPARENCY[key].items);
}
L.push('', `**${c.TRANSPARENCY.products.title}** — ${c.TRANSPARENCY.products.text}`);

h('9. Contato');
header(K);
L.push('', `Sem canais confirmados: **${K.pending.title}** — ${K.pending.text}`, '', `**${K.next.title}**`, '');
K.next.items.forEach((s, i) => L.push(`${i + 1}. ${s}`));
L.push('', `Formulário "${K.formTitle}": Nome*, E-mail*, Telefone (opcional), Empresa (opcional), "O que você quer avaliar?"*, "Descreva o processo"* — ${K.processHint}`, '');
list(K.interests.map((i) => `${i.label} — ${i.description}`));
L.push('', `Modo demonstração: botão "${K.demoSubmit}"; nota "${K.demoNote}"; resultado **${K.demoResult.title}** — ${K.demoResult.text}`);
L.push('', `Com WhatsApp confirmado: botão "${K.whatsappSubmit}"; nota "${K.whatsappNote}"`);
L.push('', `- Aba aberta: **${K.whatsappOpened.title}** — ${K.whatsappOpened.text}`, `- Aba bloqueada: **${K.whatsappBlocked.title}** — ${K.whatsappBlocked.text}`, `- Link manual (sempre): "${K.whatsappManual}"`);

h('10. Rodapé');
list([c.FOOTER.tagline, c.FOOTER.pendingChannels, c.FOOTER.preview, c.FOOTER.signature]);

const out = path.join(root, 'docs/com-001/05-texto-comercial.md');
writeFileSync(out, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
console.log(`Gerado: ${path.relative(root, out)}`);
