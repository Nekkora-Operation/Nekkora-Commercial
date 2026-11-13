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
// NEKKORA_TEXTO_SAIDA: outro destino (ex.: o texto com envio automático e Bookings, gerado com a fixture da COM-RELEASE-005).
// Os links do cabeçalho são relativos ao arquivo gerado, qualquer que seja a pasta de destino.
const out = path.resolve(root, process.env.NEKKORA_TEXTO_SAIDA ?? 'docs/com-001/05-texto-comercial.md');
const rel = (alvo) => path.relative(path.dirname(out), path.join(root, alvo)).split(path.sep).join('/');
const { createServer } = await import('vite');
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const c = await vite.ssrLoadModule('/src/content.ts');
const { WHATSAPP_MESSAGES } = await vite.ssrLoadModule('/src/config.ts');
await vite.close();
const { CONTACT_COPY: K, PRICING: P } = c;
// Cabeçalho conforme as aprovações reais da configuração usada (publicacao.json ou NEKKORA_PUBLICACAO)
const { readFileSync } = await import('node:fs');
const PUBLICACAO = JSON.parse(readFileSync(path.resolve(root, process.env.NEKKORA_PUBLICACAO ?? 'publicacao.json'), 'utf8'));
const APROVACOES = PUBLICACAO.aprovacoes;
// COM-VITRINE-001 §12 (forma b): as flags herdadas da v1.0.0 não bastam; o conteúdo atual precisa das impressões aprovadas
const { impressaoDoConteudo } = await import('./comercial/impressao-conteudo.mjs');
const IMPRESSOES = ['textosComerciais', 'condicoesComerciais'].every((i) => PUBLICACAO.impressoesDeConteudo?.[i] === impressaoDoConteudo(i));
const FLAGS = APROVACOES.textosComerciais && APROVACOES.condicoesComerciais && APROVACOES.avisoDePrivacidade;
const APROVADO = !process.env.NEKKORA_PUBLICACAO && FLAGS && IMPRESSOES;

const L = [];
const h = (t) => L.push('', `## ${t}`, '');
const list = (items) => items.forEach((i) => L.push(`- ${i}`));
const header = (s) => L.push(`**${s.eyebrow}** — ${s.title}`, '', s.description ?? '');

L.push(
  '# Texto comercial consolidado (modelo C — Poster · COM-RELEASE-001/002/003 · NEKKORA-COM-008-C)',
  '',
  ...(APROVADO
    ? ['> **Textos e condições públicas aprovados internamente** pela titular para este conteúdo (impressões de PUB-17 e',
       '> PUB-19 e registros em `publicacao.json` $origem), sem parecer jurídico externo. **Não é autorização de',
       '> publicação** (PUB-13 e PUB-18 têm registros próprios) nem aprova contrato-base, anexos, proposta-modelo,',
       '> procedimento ou as propostas DP-01 a DP-05: a contratação de pacotes segue bloqueada.']
    : FLAGS && !process.env.NEKKORA_PUBLICACAO
      ? ['> **Em revisão (COM-VITRINE-001).** Textos e condições alterados depois da aprovação da v1.0.0; sem aprovação',
         '> própria (impressões de PUB-17 e PUB-19: `node scripts/comercial/impressao-conteudo.mjs`).']
      : ['> **Em revisão.** Textos ajustados às decisões da COM-008-B; não aprovados (aprovacoes.textosComerciais,',
         '> condicoesComerciais e avisoDePrivacidade = false) e sujeitos a revisão jurídica.']),
  '',
  `> Gerado por \`npm run texto\` a partir de [\`src/content.ts\`](${rel('src/content.ts')}). Não edite este arquivo: altere`,
  `> o \`content.ts\` (e a [matriz de alegações](${rel('docs/com-001/03-matriz-alegacoes.md')}), se a mudança afetar uma promessa) e gere de novo.`,
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
L.push('', `> **${P.launch.badge}** — ${P.launch.text} ${P.launch.condition}`, '', `Sem datas aprovadas (só na versão de homologação): _${P.launch.pendingDates}_`, '', `Sem a data de início das novas condições: _${P.launch.pendingStart}_`, '', ...(P.launch.rules ? [`**${P.launch.rules.title}** (CONTRACT-001, C-10 — recolhível, só com a campanha em vigor):`, '', ...P.launch.rules.items.map((i) => `- ${i}`), ''] : []), '| Faixa | Para | Individual | Pacote de 3 |', '|---|---|---|---|');
for (const t of P.tiers) {
  const individual = `**${t.price.individualLabel}** — ${P.unit}`;
  const pack = `**${t.price.packageLabel}** — ${P.packageUnit} · ${P.savings(t.price.savingsLabel)} ${P.savingsBasis}`;
  L.push(`| ${t.title} | ${t.fit} | ${individual} | ${pack} |`);
}
L.push('', `${P.other.text} — link "${P.other.cta}" (abre a solicitação de avaliação).`);
L.push('', 'Os valores são os mesmos em qualquer data (COM-VITRINE-001, V-01); a campanha controla só a faixa e as regras. Valores de src/precos.ts.');
const Sm = c.SIMULATOR;
L.push('', `### ${Sm.title} (NEKKORA-CALC-001 — logo abaixo dos cartões)`, '', Sm.description, '');
L.push(`Controles: ${Sm.tiers.map((t) => t.label).join(' · ')} — botões "${Sm.decrease('…')}" / "${Sm.increase('…')}", campo numérico (0 a 20), rótulo "${Sm.unit('<individual>', '<pacote>')}", "${Sm.max(20)}"`);
L.push('', `Barra: "${Sm.total(3)}" · botões "${Sm.clear}" e "${Sm.calculate}". Sem seleção: _${Sm.empty}_ Mudou depois de calcular: _${Sm.changed}_`);
L.push('', `**${Sm.resultTitle}** — linhas "4 automações simples: ${Sm.composition(1, 1, '<pacote>', '<individual>')}", depois:`);
list([`"${Sm.estimateLabel}"`, `Com pacote: "${Sm.individualLabel}" e "${Sm.savingsLabel}" — ${Sm.savingsNote}`, Sm.packagesRule]);
L.push('', `> ${Sm.disclaimer}`, '', `${Sm.next}: "${Sm.request}" (abre o WhatsApp em outra aba com a mensagem do Delivery, "${Sm.whatsappIntro}" e o resumo da simulação; o visitante revisa antes de enviar)`);
L.push('', `**${Sm.help.title}** ${Sm.help.text} ${Sm.help.link} (link para os critérios).`, '', 'Exemplo de homologação: 4 simples + 1 média → 1 pacote de 3 simples (R$ 1.500) + 1 simples (R$ 650) + 1 média (R$ 1.400) = R$ 3.550; sem pacotes R$ 4.000; economia R$ 450.');
L.push('');
list(P.notes.map((n) => `**${n.title}** — ${n.text}`));
L.push('', `**${P.criteria.title}**`, '');
list(P.criteria.items);
L.push('', P.criteria.note, '', `**${P.conditions.title}**`, '');
list(P.conditions.items);
const Ps = c.PLANNED_SERVICES;
L.push('', `**${Ps.title}** (COM-VITRINE-001, V-06 — dentro do bloco de preços, sem contratação):`, '');
list(Ps.items.map((s) => `${s.name} — _${Ps.status}_ — **${s.price}** ${s.unit}`));
L.push('', `${Ps.notice} ${Ps.note}`);
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

h('7. Contato e atendimento (NEKKORA-COM-CANAIS-001 — só WhatsApp)');
const W = WHATSAPP_MESSAGES;
L.push(`**${K.title}**`, '', K.description, '', `Botão: "${K.cta}" (abre o WhatsApp em outra aba) — ${K.note}`, '', `Sem número confirmado: _${K.pendingCaption}_`);
L.push('', `Redes institucionais: "${K.socialTitle}" — LinkedIn · Instagram.`);
L.push('', 'Sem formulário, sem envio por e-mail, sem envio automático e sem agendamento (Microsoft Bookings).');
L.push('', 'Botão flutuante (canto inferior direito, ícone do WhatsApp): "Fale com um analista" — some no celular enquanto o contato está na tela; sem pulso nem indicador de disponibilidade.');
L.push('', 'Mensagens iniciais sugeridas (o visitante pode editar; nada é enviado sem ele):');
list([
  `Geral (topo, contato e botão flutuante): _${W.geral}_`,
  `Delivery (outras demandas e simulador): _${W.delivery}_`,
  `Hosting: _${W.hosting}_`,
  `Monitor ("${c.PLANNED_SERVICES.ask('Nekkora Monitor')}"): _${W.monitor}_`,
  `AI ("${c.PLANNED_SERVICES.ask('Nekkora AI')}"): _${W.ai}_`,
]);
L.push('');

h('7a. Privacidade');
header(c.PRIVACY);
L.push('');
list(c.PRIVACY.items.map((i) => `**${i.title}** — ${i.text}`));

h('8. Barra de navegação');
L.push('Links: Soluções · Preços · Como funciona · Hosting · Transparência. Botão "Entrar" → https://platform.nekkora.com/entrar, na mesma aba (NEKKORA-COM-CANAIS-001; no celular, dentro do menu). A Commercial não autentica.');

h('9. Rodapé');
list(['© Nekkora. Todos os direitos reservados.', `Link "${c.FOOTER.privacy}"`, `${c.FOOTER.preview} (enquanto publicacao.json mantiver avisoHomologacao)`, c.FOOTER.signature]);

writeFileSync(out, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
console.log(`Gerado: ${path.relative(root, out)}`);
