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
const { WHATSAPP_GREETING } = await vite.ssrLoadModule('/src/config.ts');
const { buildMessage } = await vite.ssrLoadModule('/src/mensagem.ts');
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
  '# Texto comercial consolidado (modelo C — Poster · NEKKORA-COM-ECOSYSTEM-001)',
  '',
  ...(APROVADO
    ? ['> **Textos e condições públicas aprovados internamente** pela titular para este conteúdo (impressões de PUB-17 e',
       '> PUB-19 e registros em `publicacao.json` $origem), sem parecer jurídico externo. **Não é autorização de',
       '> publicação** (PUB-13 e PUB-18 têm registros próprios) nem aprova contrato-base, anexos, proposta-modelo,',
       '> procedimento ou as propostas DP-01 a DP-05: a contratação de pacotes segue bloqueada.']
    : FLAGS && !process.env.NEKKORA_PUBLICACAO
      ? ['> **Em revisão (NEKKORA-COM-ECOSYSTEM-001).** Textos, preços e condições novos, sem aprovação própria (impressões',
         '> de PUB-14, PUB-17 e PUB-19: `node scripts/comercial/impressao-precos.mjs` e `impressao-conteudo.mjs`).']
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
L.push(`Pilares (${c.HERO.pillarsLabel}):`, '');
list(c.HERO.points.map((p) => p.label));

h('2. Soluções');
header(c.SOLUTIONS);
for (const s of c.SOLUTIONS.cards) {
  L.push('', `### ${s.number} · ${s.name} · _${s.stage}_`, '', s.summary, '');
  list(s.items);
  L.push('', `Botão: "${s.cta}" (abre o formulário de atendimento com o ${s.name} marcado)`);
}
L.push('', c.SOLUTIONS.note);

h('3. Preços (bloco data-pricing)');
header(P);
L.push('', `Vigência: _${P.validity}_`, '', '| Produto | Valor | Observação |', '|---|---|---|');
for (const card of P.cards) {
  const valores = card.rows.map((r) => `${r.prefix ? `${r.prefix} ` : ''}**${r.value}** ${r.unit}`).join(' · ');
  L.push(`| ${card.overline} — ${card.title} | ${valores} | ${card.note} |`);
}
L.push('', 'Valores de src/precos.ts. Sem pacote nem desconto; nenhum produto depende dos outros.');
const Sm = c.SIMULATOR;
L.push('', `### ${Sm.title} (§4 — logo abaixo dos cartões)`, '', Sm.description, '');
list(Sm.fields.map((f) => `${f.group} — ${f.label} (${f.unit}); começa em 0`));
L.push('', Sm.limits, '', `Estimativa ao vivo (sem botão de calcular); "${Sm.clear}" zera tudo. Sem quantidade: _${Sm.empty}_`, '');
list([`${Sm.ai}: "${Sm.aiValue('<valor>')}"`, `${Sm.monitor}: "${Sm.monitorValue('<valor>')}"`, `${Sm.hosting}`, `${Sm.combined} — ${Sm.combinedNote}`]);
L.push('', `> ${Sm.disclaimer}`, '', `Botão: "${Sm.request}" (abre o formulário de atendimento com os serviços da simulação marcados e a opção de incluir o resumo).`);
L.push('', 'Exemplo de homologação: 3 automações no AI Piloto + 2 no Monitor + 10 h Windows + 5 h Linux → a partir de R$ 300 · R$ 150 por mês · Hosting R$ 310 · combinado R$ 760 (inclui o primeiro mês do Monitor; não é mensalidade).');
L.push('', `**${P.conditions.title}**`, '');
list(P.conditions.items);

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

h('7. Contato e formulário de atendimento (NEKKORA-COM-ECOSYSTEM-001 §7 — WhatsApp)');
const F = c.REQUEST_FORM;
L.push(`**${K.title}**`, '', K.description, '', `Botão: "${K.cta}" (abre o formulário) — ${K.note}`, '', `Sem número confirmado: _${K.pendingCaption}_`);
L.push('', `Redes institucionais: "${K.socialTitle}" — LinkedIn · Instagram (@nekkora.br).`);
L.push('', 'Botão flutuante (canto inferior direito, ícone do WhatsApp): "Fale com um analista" — abre o formulário; some no celular enquanto o topo ou o contato estão na tela; sem pulso nem indicador de disponibilidade.');
L.push('', `### ${F.title}`, '', F.description, '');
list([
  `${F.name.label} (obrigatório) — erro: _${F.name.error}_`,
  `${F.company.label} (${F.company.hint.toLowerCase()})`,
  `${F.email.label} (${F.email.hint.toLowerCase()}) — erro: _${F.email.error}_`,
  `${F.description_.label} (obrigatório) — ${F.description_.hint} — erro: _${F.description_.error}_`,
  `${F.services.legend}: ${Object.values(c.SERVICE_NAMES).join(' · ')} — ${F.services.description}`,
  `Vindo do simulador: "${F.simulation.include}" (marcado; ${F.simulation.hint.toLowerCase()})`,
]);
L.push('', `Botões: "${F.cancel}" · "${F.submit}" (abre o WhatsApp em outra aba). Depois: **${F.opened.title}** — ${F.opened.text} · "${F.again}" · "${F.back}" · "${F.close}".`);
L.push('', 'Sem envio automático, banco de dados, e-mail, API do WhatsApp, Microsoft Bookings ou armazenamento persistente.');
L.push('', 'Exemplo de mensagem preparada:', '', '```', buildMessage(WHATSAPP_GREETING, F.message, { name: '[nome]', company: '[empresa, se informada]', email: '[e-mail, se informado]', description: '[descrição]' }, ['[serviços selecionados, quando aplicável]'], '[resumo, quando autorizado pelo visitante]'), '```');
L.push('');

h('7a. Privacidade');
header(c.PRIVACY);
L.push('');
list(c.PRIVACY.items.map((i) => `**${i.title}** — ${i.text}`));

h('8. Barra de navegação');
L.push('Links: Soluções · Preços · Como funciona · Hosting · Transparência. Botão "Entrar" → https://platform.nekkora.com/entrar, na mesma aba (PUB-16, NEKKORA-COM-CANAIS-001; no celular, dentro do menu). A Commercial não autentica.');

h('9. Rodapé');
list(['© Nekkora. Todos os direitos reservados.', `Link "${c.FOOTER.privacy}"`, `${c.FOOTER.preview} (enquanto publicacao.json mantiver avisoHomologacao)`, c.FOOTER.signature]);

writeFileSync(out, L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n');
console.log(`Gerado: ${path.relative(root, out)}`);
