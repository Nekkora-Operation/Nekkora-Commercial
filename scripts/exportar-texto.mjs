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
const { CONTACT_COPY: K, PRICING: P } = c;

const L = [];
const h = (t) => L.push('', `## ${t}`, '');
const list = (items) => items.forEach((i) => L.push(`- ${i}`));
const header = (s) => L.push(`**${s.eyebrow}** — ${s.title}`, '', s.description ?? '');

L.push(
  '# COM-001 — Texto comercial consolidado (modelo C — Poster)',
  '',
  '> Gerado por `npm run texto` a partir de [`src/content.ts`](../../src/content.ts). Não edite este arquivo: altere',
  '> o `content.ts` (e a [matriz de alegações](03-matriz-alegacoes.md), se a mudança afetar uma promessa) e gere de novo.',
);

h('1. Hero');
L.push(`Selo: ${c.HERO.badge}`, '', `**${c.HERO.titleLead} ${c.HERO.titleAccent}**`, '', c.HERO.lead, '', `CTAs: "${c.HERO.primaryCta}" · "${c.HERO.secondaryCta}"`, '');
list(c.HERO.points.map((p) => p.label));

h('2. Soluções');
header(c.SOLUTIONS);
for (const s of c.SOLUTIONS.cards) {
  L.push('', `### ${s.number} · ${s.name} · _${s.stage}_`, '', s.summary, '');
  list(s.items);
  L.push('', `Link: "${s.cta}" (${s.href})`);
}
L.push('', c.SOLUTIONS.note);

h('3. Preços (bloco data-pricing)');
header(P);
L.push('', `> **${P.launch.badge}** — ${P.launch.text} ${P.launch.condition}`, '', '| Faixa | Para | Valor |', '|---|---|---|');
for (const t of P.tiers) {
  const value = t.price ? `~~${t.price.from}~~ **${t.price.to}** ${t.price.discount} — ${t.price.unit}` : `**${t.negotiated.label}** — ${t.negotiated.unit}`;
  L.push(`| ${t.title} | ${t.fit} | ${value} |`);
}
L.push('');
list(P.notes.map((n) => `**${n.title}** — ${n.text}`));
L.push('', P.hostingNote);

h('4. Como funciona');
header(c.HOW_IT_WORKS);
L.push('');
c.HOW_IT_WORKS.steps.forEach((s, i) => L.push(`${i + 1}. **${s.title}** — ${s.description}`));

h('5. Hosting');
header(c.HOSTING);
L.push('', `> **${c.HOSTING.availability.title}** ${c.HOSTING.availability.text}`, '', `CTA: "${c.HOSTING.cta}"`);

h('6. Transparência');
header(c.TRANSPARENCY);
for (const key of ['defined', 'excluded', 'dependencies']) {
  L.push('', `**${c.TRANSPARENCY[key].title}**`, '');
  list(c.TRANSPARENCY[key].items);
}

h('7. Contato');
L.push(`**${K.title}**`, '', K.description, '', `Botão: "${K.cta}" (abre o diálogo)`, '', `Sem canais confirmados: _${K.pendingCaption}_`);
L.push('', `Diálogo **${K.dialogTitle}** — ${K.dialogDescription}`, '', `Com WhatsApp confirmado: botão "${K.whatsappDirect}" + divisor "${K.orForm}". Sem canal: _${K.pendingCaption}_`);
L.push('', `Formulário: Nome*, E-mail*, Telefone / WhatsApp (opcional), Empresa (opcional), "Descreva o processo"* — ${K.processHint}. Rodapé: "Cancelar" + envio.`);
L.push('', `Modo demonstração: botão "${K.demoSubmit}"; nota "${K.demoNote}"; resultado **${K.demoResult.title}** — ${K.demoResult.text}`);
L.push('', `Com WhatsApp confirmado: botão "${K.whatsappSubmit}"; nota "${K.whatsappNote}"`);
L.push('', `- Após enviar: **${K.whatsappRequested.title}** — ${K.whatsappRequested.text}`, `- Link manual (sempre): "${K.whatsappManual}"`);

h('8. Barra de navegação');
L.push(`Links: Soluções · Preços · Como funciona · Hosting · Transparência. Botão "${c.LOGIN.label}" sem destino (indisponível: "${c.LOGIN.unavailable}").`);

h('9. Rodapé');
list(['© Nekkora. Todos os direitos reservados.', c.FOOTER.preview, c.FOOTER.signature]);

const out = path.join(root, 'docs/com-001/05-texto-comercial.md');
writeFileSync(out, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
console.log(`Gerado: ${path.relative(root, out)}`);
