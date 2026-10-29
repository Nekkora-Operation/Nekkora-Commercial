#!/usr/bin/env node
/**
 * Gera docs/com-001/05-texto-comercial.md a partir de src/content.ts (fonte única do texto da página).
 * Carrega o content.ts pelo próprio Vite (mesmos aliases do build, inclusive @publicacao). Uso: npm run texto
 *   NEKKORA_PUBLICACAO=scripts/fixtures/publicacao-homologacao.json npm run texto   # texto com canais/datas sintéticos
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { createServer } = await import('vite');
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const c = await vite.ssrLoadModule('/src/content.ts');
await vite.close();
const { CONTACT_COPY: K, PRICING: P } = c;

const L = [];
const h = (t) => L.push('', `## ${t}`, '');
const list = (items) => items.forEach((i) => L.push(`- ${i}`));
const header = (s) => L.push(`**${s.eyebrow}** — ${s.title}`, '', s.description ?? '');

L.push(
  '# Texto comercial consolidado (modelo C — Poster · COM-RELEASE-001/002/003 · NEKKORA-COM-008-C)',
  '',
  '> **Em revisão.** Textos ajustados às decisões da COM-008-B; não aprovados (aprovacoes.textosComerciais,',
  '> condicoesComerciais e avisoDePrivacidade = false) e sujeitos a revisão jurídica.',
  '',
  '> Gerado por `npm run texto` a partir de [`src/content.ts`](../../src/content.ts). Não edite este arquivo: altere',
  '> o `content.ts` (e a [matriz de alegações](03-matriz-alegacoes.md), se a mudança afetar uma promessa) e gere de novo.',
  ...(process.env.NEKKORA_PUBLICACAO
    ? ['>', `> **Gerado com dados SINTÉTICOS** (\`${process.env.NEKKORA_PUBLICACAO}\`): e-mail, controlador, provedor e URLs são fictícios — vale o texto, não os valores.`]
    : []),
);

h('1. Hero');
L.push(`Selo: ${c.HERO.badge}`, '', `**${c.HERO.titleLead} ${c.HERO.titleAccent}**`, '', c.HERO.lead, '', `CTAs: "${c.HERO.primaryCta}" · "${c.HERO.secondaryCta}"`, '');
list(c.HERO.points.map((p) => p.label));

h('2. Soluções');
header(c.SOLUTIONS);
for (const s of c.SOLUTIONS.cards) {
  L.push('', `### ${s.number} · ${s.name} · _${s.stage}_`, '', s.summary, '');
  list(s.items);
  if (s.technologies) L.push('', `${s.technologies.label}: ${s.technologies.items.join(' · ')}. _${s.technologies.note}_`);
  L.push('', `Link: "${s.cta}" (${s.href})`);
}
L.push('', c.SOLUTIONS.note);

h('3. Preços (bloco data-pricing)');
header(P);
L.push('', `> **${P.launch.badge}** — ${P.launch.text} ${P.launch.condition}`, '', `Sem datas aprovadas (só na versão de homologação): _${P.launch.pendingDates}_`, '', '| Faixa | Para | Valor (campanha em vigor) | Fora da campanha |', '|---|---|---|---|');
for (const t of P.tiers) {
  const value = t.price
    ? `~~${t.price.standardLabel}~~ **${t.price.launchLabel}** −${t.price.percentLabel} · ${P.savings(t.price.savingsLabel)} — ${P.launchUnit}`
    : `**${t.negotiated.label}** — ${t.negotiated.unit}`;
  const outside = t.price ? `**${t.price.standardLabel}** — ${P.unit}` : `**${t.negotiated.label}**`;
  L.push(`| ${t.title} | ${t.fit} | ${value} | ${outside} |`);
}
L.push('', `Leitor de tela: "${P.srFrom} <preço padrão>", "${P.srTo} <preço de lançamento>", "${P.srPercent} <percentual>". Valores de src/precos.ts.`);
const Sm = c.SIMULATOR;
L.push('', `### ${Sm.title} (NEKKORA-CALC-001 — logo abaixo dos cartões)`, '', Sm.description, '');
L.push(`Controles: ${Sm.tiers.map((t) => t.label).join(' · ')} — botões "${Sm.decrease('…')}" / "${Sm.increase('…')}", campo numérico (0 a 20), "${Sm.max(20)}"`);
L.push('', `Barra: "${Sm.total(3)}" · botões "${Sm.clear}" e "${Sm.calculate}". Sem seleção: _${Sm.empty}_ Mudou depois de calcular: _${Sm.changed}_`);
L.push('', `**${Sm.resultTitle}** — linhas "2 automações simples × <preço>", depois:`);
list([
  `"${Sm.estimateLabel(false, false)}" / "${Sm.estimateLabel(true, false)}" / "${Sm.estimateLabel(false, true)}" / "${Sm.estimateLabel(true, true)}"`,
  `Com a campanha em vigor: "${Sm.standardLabel}", "${Sm.savingsLabel}", "${Sm.percentLabel}" — ${Sm.savingsNote}`,
  `Com complexa: ${Sm.partialNote(1)} Só complexas: ${Sm.onlyComplex}`,
  ...Object.entries(Sm.campaign).map(([k, v]) => `Campanha ${k}: ${v}`),
]);
L.push('', `> ${Sm.disclaimer}`, '', `${Sm.next}: "${Sm.schedule}" (Microsoft Bookings, nova aba) · "${Sm.request}" (abre o formulário; o resumo da simulação é opcional)`);
L.push('', `**${Sm.help.title}** ${Sm.help.text} ${Sm.help.link} (link para os critérios).`, '', 'Exemplo de homologação: 2 simples + 1 média → padrão R$ 6.500; lançamento R$ 4.800; economia R$ 1.700; 26,15% (truncado).');
L.push('');
list(P.notes.map((n) => `**${n.title}** — ${n.text}`));
L.push('', `**${P.criteria.title}**`, '');
list(P.criteria.items);
L.push('', P.criteria.note, '', `**${P.conditions.title}**`, '');
list(P.conditions.items);
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
L.push('', `Diálogo **${K.dialogTitle}** — ${K.dialogDescription}`, '', `Canal da solicitação: WhatsApp, se confirmado; senão o e-mail (publicação atual: e-mail). Sem canal: _${K.pendingCaption}_`);
L.push('', `Formulário: "${K.demand.legend}"* (${K.demand.options.map((o) => o.label).join(' · ')}; o CTA do Hosting abre com a hospedagem), Nome*, Empresa (opcional), E-mail (${K.emailHint}), "${K.messageLabel}"* — ${K.processHint}. Rodapé: "Cancelar" + envio; link "${K.privacyLink}".`);
L.push('', `Segunda linha da mensagem, por tipo: ${K.demand.options.map((o) => `_${o.line}_`).join(' · ')}`);
L.push('', `Vindo do simulador: caixa "${K.simulation.include}" (desmarcada) — ${K.simulation.hint} Na mensagem: "${K.simulation.heading}" + resumo.`);
L.push('', `Modo demonstração: botão "${K.demoSubmit}"; nota "${K.demoNote}"; resultado **${K.demoResult.title}** — ${K.demoResult.text}`);
for (const [label, f] of [['Pelo e-mail (publicação atual)', K.email], ['Pelo WhatsApp (quando houver número confirmado)', K.whatsapp]]) {
  L.push('', `### ${label}`, '', `Link direto: "${f.direct}" + divisor "${K.orForm}". Botão: "${K.reviewSubmit}"; nota "${f.note}"`);
  L.push('', `Etapa de confirmação: **${K.review.title}** — ${f.intro}`, '', `> **Antes de continuar** — ${f.transfer}`, '', `Botões: "${K.review.back}" · "${f.open}". Alternativas: "${K.review.copy}"${f === K.email ? `; "${f.manual} <e-mail>"` : `; "${K.review.manual} <número>"; "${K.review.email} <e-mail>"`}.`);
  L.push('', `- Após abrir: **${f.requested.title}** — ${f.requested.text}`, `- Link manual (sempre): "${f.again}"`);
}
L.push('', `Canais diretos (sem formulário): "${K.directTitle}"`);

h('7b. Envio automático e agendamento (COM-RELEASE-005 — só com endpoint e URL do Bookings confirmados)');
const A = K.api;
L.push(`Precedência: envio automático (se houver endpoint) → WhatsApp → e-mail. Um único mecanismo de envio por vez.`);
L.push('', `Formulário: E-mail obrigatório — "${A.emailHint}" (erro: "${A.emailRequired}"). Nota: "${A.note}"`);
L.push('', `Confirmação: **${K.review.title}** — ${A.intro}`, '', `> **Antes de enviar** — ${A.transfer}`, '', `Desafio: "${A.challenge}" · aguardando: "${A.challengeWaiting}" · indisponível: "${A.challengeUnavailable}"`);
L.push('', `Botões: "${K.review.back}" · "${A.send}" (durante o envio: "${A.sending}"; leitor de tela: "${A.sendingStatus}")`);
L.push('', `- Recebida (só com a confirmação do servidor): **${A.received.title}** — ${A.received.text('NK-XXXXXXXX')}`);
L.push(`- Falha: **${A.failed.title}**`);
list(Object.entries(A.failed).filter(([k]) => k !== 'title').map(([k, v]) => `_${k}_: ${v}`));
L.push('', `Ações na falha: "${A.retry}" (não aparece quando a solicitação é recusada) · "${A.alternative} <e-mail>" · "${A.openEmail}" · "${K.review.copy}"`);
L.push('', `**Agendamento** — botão "${c.SCHEDULE.cta}" (nome acessível: "${c.SCHEDULE.cta} ${c.SCHEDULE.srExternal}") no topo e no contato; no diálogo: "${c.SCHEDULE.dialogPrompt} ${c.SCHEDULE.cta}". Nota no contato: "${c.SCHEDULE.note}"`);

h('7a. Privacidade');
header(c.PRIVACY);
L.push('');
list(c.PRIVACY.items.map((i) => `**${i.title}** — ${i.text}`));

h('8. Barra de navegação');
L.push('Links: Soluções · Preços · Como funciona · Hosting · Transparência. Sem botão "Entrar": oculto enquanto não houver área de clientes (COM-008-B, AUD-26).');

h('9. Rodapé');
list(['© Nekkora. Todos os direitos reservados.', `Link "${c.FOOTER.privacy}"`, `${c.FOOTER.preview} (enquanto publicacao.json mantiver avisoHomologacao)`, c.FOOTER.signature]);

// NEKKORA_TEXTO_SAIDA: outro destino (ex.: o texto com envio automático e Bookings, gerado com a fixture da COM-RELEASE-005)
const out = path.resolve(root, process.env.NEKKORA_TEXTO_SAIDA ?? 'docs/com-001/05-texto-comercial.md');
writeFileSync(out, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
console.log(`Gerado: ${path.relative(root, out)}`);
