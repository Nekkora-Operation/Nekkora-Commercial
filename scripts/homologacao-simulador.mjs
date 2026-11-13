#!/usr/bin/env node
/**
 * Homologação do Simulador de Investimento (NEKKORA-CALC-001) e da conversa pelo WhatsApp que ele abre
 * (NEKKORA-COM-CANAIS-001, titular, 12/11/2026 — substitui o formulário de avaliação da NEKKORA-COM-008-C §8) em
 * navegador real (Playwright: Chromium, Firefox, WebKit).
 *
 * Uso (builds servidos como no CloudFront — veja .github/workflows/ci.yml):
 *   node scripts/homologacao-simulador.mjs <url de produção> <url da fixture com datas> <pasta> [chromium,firefox,webkit]
 *     [<url da fixture pendente> <url da fixture pendente sem aviso>]
 *
 *   - produção (publicacao.json real): campanha aprovada de 06/11/2026 a 06/01/2027 (NEKKORA-COM-RELEASE-FIX-001) →
 *     relógio do navegador fixado na véspera, no primeiro dia, durante, no último dia e no dia seguinte; WhatsApp oficial,
 *     sem Bookings;
 *   - fixture (scripts/fixtures/publicacao-homologacao.json): datas sintéticas 01/11 a 31/12/2026 → relógio do navegador
 *     fixado antes, durante e depois da campanha;
 *   - fixtures pendentes (publicacao-homologacao-pendente*.json): campanha SEM datas → faixa de prévia só com o aviso
 *     de homologação.
 *
 * COM-VITRINE-001: a tabela (individual e pacote de 3) é a mesma em qualquer data (V-01); a campanha controla só a faixa
 * promocional. Sem categoria complexa (V-04).
 *
 * O relógio de cada contexto é sempre fixado (nada depende do dia em que o runner executa). A situação esperada de cada
 * data é derivada de campaignState/todayInBrazil (src/precos.ts) sobre o publicacao.json e conferida contra a tabela
 * explícita da missão.
 *
 * Nada sai do localhost: qualquer outra requisição é abortada e reprova. A aba do WhatsApp aberta pelo CTA do resultado
 * ("Conversar sobre esta simulação") é respondida por uma página local de teste — o wa.me real nunca é acessado. A página
 * não tem formulário nem diálogo: a simulação só segue, como texto editável, na mensagem inicial do WhatsApp.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { campaignState, todayInBrazil } from '../src/precos.ts';

const [
  ,
  ,
  prodUrl = 'http://127.0.0.1:4173/',
  fixtureUrl = 'http://127.0.0.1:4175/',
  outDir = 'evidencias/simulador',
  engineList = 'chromium,firefox,webkit',
  pendingUrl = 'http://127.0.0.1:4179/',
  pendingNoNoticeUrl = 'http://127.0.0.1:4180/',
] = process.argv;
const require = createRequire(import.meta.url);
const playwright = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
mkdirSync(outDir, { recursive: true });

const PUBLICACAO = JSON.parse(readFileSync('publicacao.json', 'utf8'));
/**
 * Mensagens do WhatsApp (NEKKORA-COM-CANAIS-001), digitadas de propósito — iguais a WHATSAPP_MESSAGES (src/config.ts) e
 * SIMULATOR.whatsappIntro (src/content.ts), conferidas contra o código-fonte antes de qualquer navegador abrir.
 */
const MSG_DELIVERY = 'Olá! Tenho interesse em desenvolver automações com a Nekkora.';
const MSG_HOSTING = 'Olá! Tenho interesse em hospedagem de automações com a Nekkora e gostaria de saber como funciona a avaliação de viabilidade.';
const SIM_INTRO = 'Fiz esta simulação na página:';
if (!readFileSync('src/config.ts', 'utf8').includes(`delivery: '${MSG_DELIVERY}'`) || !readFileSync('src/config.ts', 'utf8').includes(`hosting: '${MSG_HOSTING}'`)) {
  throw new Error('src/config.ts: mensagens do WhatsApp divergem da homologação');
}
if (!readFileSync('src/content.ts', 'utf8').includes(`whatsappIntro: '${SIM_INTRO}'`)) throw new Error('src/content.ts: whatsappIntro diverge da homologação');
/** Resumo do exemplo (4 simples + 1 média) como vai para o WhatsApp — digitado de propósito. */
const SUMMARY_LINES = [
  '- 4 automações simples: 1 pacote de 3 (R$ 1.500 cada) + 1 individual (R$ 650 cada) = R$ 2.150',
  '- 1 automação média: 1 individual (R$ 1.400 cada) = R$ 1.400',
  'Investimento estimado: R$ 3.550',
  'Sem pacotes, no preço individual: R$ 4.000 · Economia com pacotes: R$ 450',
];
/** Texto (parâmetro text) de um link wa.me para o número da publicação; null se for outro destino. */
const waText = (href, number) => {
  try {
    const u = new URL(href);
    return u.origin === 'https://wa.me' && u.pathname === `/${number}` ? u.searchParams.get('text').replace(/ /g, ' ') : null;
  } catch {
    return null;
  }
};
const THEME_KEY = 'nekkora-commercial-tema';
const DISCLAIMER =
  'Esta simulação é uma estimativa baseada nas categorias selecionadas. A classificação, o escopo e o investimento definitivo serão confirmados na avaliação e registrados em proposta comercial.';
// Exemplo da COM-VITRINE-001, digitado aqui de propósito (independente do código): 4 simples + 1 média →
// 1 pacote de 3 simples + 1 simples + 1 média
const EXAMPLE = { estimativa: 'R$ 3.550', individual: 'R$ 4.000', economia: 'R$ 450' };
// 2 simples + 1 média: nenhum pacote (categorias não se misturam), sem economia
const EXAMPLE_NO_PACKAGE = { estimativa: 'R$ 2.700' };
// Cartões: a mesma tabela em qualquer data
const TABLE = {
  simples: { individual: 'R$ 650', pacote: 'R$ 1.500', economia: 'Economia de R$ 450' },
  media: { individual: 'R$ 1.400', pacote: 'R$ 3.500', economia: 'Economia de R$ 700' },
};
const UNITS = 'R$ 650 cada · R$ 1.500 o pacote de 3,R$ 1.400 cada · R$ 3.500 o pacote de 3';
const SUMMARY_EXAMPLE = /4 automações simples: 1 pacote de 3 \(R\$ 1\.500 cada\) \+ 1 individual \(R\$ 650 cada\) = R\$ 2\.150/;
/** Valores da tabela anterior e do antigo exemplo: nunca podem aparecer no simulador. */
const PREVIOUS = /R\$ 1\.000|R\$ 2\.800|R\$ 4\.800|R\$ 6\.500|26,15%|lançamento|Desconto/;
/** Fixture sintética (01/11 a 31/12/2026): antes, durante e depois. */
const AT = {
  vigente: new Date('2026-11-15T12:00:00-03:00'),
  futura: new Date('2026-10-31T23:30:00-03:00'),
  encerrada: new Date('2027-01-01T00:30:00-03:00'),
  // fixtures sem datas: qualquer dia
  pendente: new Date('2026-11-15T12:00:00-03:00'),
};
/**
 * Campanha real (publicacao.json), nas bordas do fuso de Brasília: 23h30 de 05/11 já é 06/11 em UTC, e 00h30 de 07/01
 * ainda é 06/01 em UTC — a página precisa seguir o calendário brasileiro.
 */
const PROD_DATES = [
  { id: '2026-11-05-campanha-futura', at: new Date('2026-11-05T23:30:00-03:00'), state: 'futura' },
  { id: '2026-11-06-primeiro-dia', at: new Date('2026-11-06T00:30:00-03:00'), state: 'vigente' },
  { id: '2026-11-15-campanha-vigente', at: new Date('2026-11-15T12:00:00-03:00'), state: 'vigente' },
  { id: '2027-01-06-ultimo-dia', at: new Date('2027-01-06T23:30:00-03:00'), state: 'vigente' },
  { id: '2027-01-07-campanha-encerrada', at: new Date('2027-01-07T00:30:00-03:00'), state: 'encerrada' },
];
// A tabela explícita acima tem de coincidir com as regras de src/precos.ts aplicadas às datas aprovadas
for (const d of PROD_DATES) {
  const derived = campaignState(PUBLICACAO.campanhaLancamento, todayInBrazil(d.at));
  if (derived !== d.state) throw new Error(`${d.id}: publicacao.json + src/precos.ts dão "${derived}", esperado "${d.state}" (datas ${JSON.stringify(PUBLICACAO.campanhaLancamento)})`);
}
const toBr = (iso) => iso.split('-').reverse().join('/');
const PROD_PERIOD = `de ${toBr(PUBLICACAO.campanhaLancamento.inicio)} a ${toBr(PUBLICACAO.campanhaLancamento.fim)}`;

const checks = [];
const check = (engine, id, ok, detail) => {
  checks.push({ engine, id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} [${engine}] ${id}${detail ? ` — ${detail}` : ''}`);
};
const shots = [];

async function run(engine) {
  const browser = await playwright[engine].launch();
  const external = [];
  const waTabs = [];
  const errors = [];
  /** Contexto isolado com relógio fixo; tema opcional; toda requisição fora do localhost é abortada e registrada. */
  async function open(url, { at = AT.vigente, viewport = { width: 1280, height: 900 }, theme = null } = {}) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await ctx.clock.setFixedTime(at);
    if (theme) await ctx.addInitScript(([k, t]) => localStorage.setItem(k, t), [THEME_KEY, theme]);
    const origin = new URL(url).origin;
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
      // Aba do WhatsApp aberta por um CTA: página LOCAL de teste (nada sai da máquina), registrada à parte
      if (u.startsWith('https://wa.me/')) {
        waTabs.push({ url: u, referer: route.request().headers()['referer'] ?? null });
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>wa.me (página de teste local)</title>' });
      }
      external.push(u);
      return route.abort();
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    return { ctx, page, sim: page.locator('[data-simulator]') };
  }
  const shot = async (locator, name) => {
    const file = `${engine}-${name}.png`;
    await locator.screenshot({ path: path.join(outDir, file), style: 'header, nav, .nk-fab { visibility: hidden !important; }' });
    shots.push(file);
  };
  const plus = (sim, tier, times = 1) => Array.from({ length: times }).reduce((p) => p.then(() => sim.locator(`[data-sim-tier="${tier}"] [data-sim-action="aumentar"]`).click()), Promise.resolve());
  const calc = (sim) => sim.getByRole('button', { name: 'Calcular meu investimento' }).click();
  const figures = (sim) => sim.evaluate((el) => Object.fromEntries([...el.querySelectorAll('[data-calc]')].map((e) => [e.dataset.calc, e.textContent.trim()])));
  /** CTA do resultado ("Conversar sobre esta simulação"): destino, isolamento e o texto que vai para o WhatsApp. */
  const simCta = (sim) =>
    sim.locator('[data-sim-result]').evaluate((r) => {
      const a = r.querySelector('a[data-whatsapp]');
      return {
        count: r.querySelectorAll('a[data-whatsapp]').length,
        dialogTriggers: r.querySelectorAll('[aria-haspopup]').length,
        ctx: a?.getAttribute('data-whatsapp') ?? null,
        href: a?.getAttribute('href') ?? '',
        target: a?.getAttribute('target'),
        rel: a?.getAttribute('rel') ?? '',
        label: a?.textContent.replace(/\s+/g, ' ').trim() ?? '',
      };
    });
  /** Clica num link do WhatsApp e espera a aba nova (local): nenhum diálogo, nenhuma requisição da página. */
  async function clickWa(page, locator) {
    const before = waTabs.length;
    const requests = [];
    const onRequest = (r) => requests.push(r.url());
    page.on('request', onRequest);
    const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
    await locator.click();
    const popup = await popupPromise;
    if (popup) await popup.waitForLoadState('load').catch(() => {});
    page.off('request', onRequest);
    const dialogs = await page.evaluate(() => document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open], form').length);
    if (popup) await popup.close();
    const tab = waTabs.slice(before).at(-1) ?? null;
    return { popup: !!popup, tab, dialogs, requests };
  }

  // 1. Integração, estado inicial e consistência com os cartões (produção) -------------------------------------------
  {
    const { ctx, page, sim } = await open(prodUrl);
    const place = await page.evaluate(() => {
      const s = document.querySelector('[data-simulator]');
      const cards = document.querySelector('#precos .price-cards');
      return {
        inPricing: !!s?.closest('[data-pricing]') && !!s?.closest('#precos'),
        afterCards: !!cards && !!s && (cards.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) > 0,
        title: s?.querySelector('h3')?.textContent,
        noForm: !s?.querySelector('form, input[type="email"], input[type="password"]'),
      };
    });
    check(engine, 'integrado-na-secao-de-precos', place.inPricing && place.afterCards && place.title === 'Simulador de Investimento — Nekkora Delivery' && place.noForm, JSON.stringify(place));
    const initial = await sim.evaluate((el) => ({
      values: [...el.querySelectorAll('[data-sim-input]')].map((i) => i.value),
      tiers: [...el.querySelectorAll('[data-sim-tier]')].map((t) => t.dataset.simTier),
      total: el.querySelector('[data-sim-total]')?.getAttribute('data-sim-total'),
      result: !!el.querySelector('[data-sim-result]'),
      minusDisabled: [...el.querySelectorAll('[data-sim-action="diminuir"]')].every((b) => b.getAttribute('aria-disabled') === 'true'),
    }));
    check(engine, 'inicia-com-zero-so-simples-e-media', JSON.stringify(initial.values) === '["0","0"]' && initial.tiers.join() === 'simples,media' && initial.total === '0' && !initial.result && initial.minusDisabled, JSON.stringify(initial));
    await shot(sim, 'simulador-inicial-producao');
    await plus(sim, 'simples', 4);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const res = await sim.locator('[data-sim-result]').evaluate((e) => ({ packages: e.dataset.simPacotes, text: e.innerText }));
    check(engine, 'calculo-exemplo-com-pacote', JSON.stringify(f) === JSON.stringify(EXAMPLE) && res.packages === '1' && !PREVIOUS.test(res.text), `${JSON.stringify(f)} · pacotes=${res.packages}`);
    check(engine, 'aviso-de-transparencia', res.text.includes(DISCLAIMER) && /não é uma economia operacional comprovada/.test(res.text) && /Categorias diferentes não se misturam em um pacote/.test(res.text), 'texto obrigatório, economia comercial ≠ operacional e regra dos pacotes');
    // 19. Consistência com os cartões: os valores de cada categoria são os do cartão
    const cards = await page.evaluate(() => ({
      table: Object.fromEntries([...document.querySelectorAll('[data-price-tier]')].map((el) => [el.dataset.priceTier, Object.fromEntries([...el.querySelectorAll('[data-price]')].map((v) => [v.dataset.price, v.textContent.trim()]))])),
      lines: [...document.querySelectorAll('[data-sim-line]')].map((l) => `${l.dataset.simLine}:${l.innerText.replace(/\s+/g, ' ')}`),
      units: [...document.querySelectorAll('[data-sim-tier] .sim__tier-unit')].map((u) => u.textContent.trim()),
    }));
    const t = cards.table;
    check(
      engine,
      'consistente-com-os-cartoes',
      cards.units[0] === `${t.simples?.individual} cada · ${t.simples?.pacote} o pacote de 3` &&
        cards.units[1] === `${t.media?.individual} cada · ${t.media?.pacote} o pacote de 3` &&
        cards.lines[0].includes(`(${t.simples?.pacote} cada)`) &&
        cards.lines[0].includes(`(${t.simples?.individual} cada)`) &&
        cards.lines[1].includes(`(${t.media?.individual} cada)`),
      `${cards.units.join(' · ')} | ${cards.lines.join(' · ')}`,
    );
    // Caminho após a simulação: só a conversa pelo WhatsApp (NEKKORA-COM-CANAIS-001). Sem agendamento (Bookings saiu da
    // página pública) nem formulário: nenhum link de agendamento, nenhum botão que abra diálogo.
    const semAgenda = await sim.locator('[data-sim-result]').evaluate((e) => ({
      links: e.querySelectorAll('a[data-agendar], a[href*="bookings"], a[href*="/book/"], a[href^="mailto:"]').length,
      text: /Agendar|Bookings|Teams/.test(e.innerText),
      dialogTriggers: e.querySelectorAll('[aria-haspopup]').length,
    }));
    check(engine, 'sem-bookings-nenhum-link-de-agendamento', semAgenda.links === 0 && !semAgenda.text && semAgenda.dialogTriggers === 0, JSON.stringify(semAgenda));
    const status = await page.locator('[data-testid="status-simulador"]').innerText();
    check(engine, 'resultado-anunciado-em-regiao-viva', /Resultado da simulação atualizado\./.test(status) && (await page.locator('[data-testid="status-simulador"]').getAttribute('role')) === 'status', status.slice(0, 120));
    await shot(sim, 'simulador-com-pacote-producao');
    await ctx.close();
  }

  // Campanha real (publicacao.json): véspera, primeiro dia, vigente, último dia e dia seguinte ------------------------
  // A tabela não muda com a data (V-01): só a faixa promocional aparece ou não.
  for (const d of PROD_DATES) {
    const promo = d.state === 'vigente';
    const { ctx, page, sim } = await open(prodUrl, { at: d.at });
    const cards = await page.evaluate(() => {
      const block = document.querySelector('[data-pricing]');
      return {
        table: Object.fromEntries(
          [...block.querySelectorAll('[data-price-tier]')].map((el) => [el.dataset.priceTier, Object.fromEntries([...el.querySelectorAll('[data-price]')].map((v) => [v.dataset.price, v.textContent.trim()]))]),
        ),
        struck: [...block.querySelectorAll('[data-price-tier] s, [data-price-tier] del')].map((s) => s.textContent.trim()),
        strip: block.querySelector('.launch-strip')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
        preview: !!block.querySelector('[data-campanha="pendente"]'),
      };
    });
    const cardsOk = JSON.stringify(cards.table) === JSON.stringify(TABLE) && cards.struck.length === 0 && !cards.preview && (promo ? !!cards.strip?.includes(PROD_PERIOD) : cards.strip === null);
    check(engine, `producao-${d.id}:cartoes`, cardsOk, `${JSON.stringify(cards.table)} · riscados=${cards.struck.join(',') || 'nenhum'} · faixa=${cards.strip ?? 'ausente'}`);
    await plus(sim, 'simples', 4);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const text = await sim.locator('[data-sim-result]').innerText();
    const units = await sim.locator('.sim__tier-unit').allInnerTexts();
    const label = await sim.locator('.sim__figure--main dt').innerText();
    const simOk = JSON.stringify(f) === JSON.stringify(EXAMPLE) && label === 'Investimento estimado' && units.join() === UNITS && !PREVIOUS.test(text);
    check(engine, `producao-${d.id}:simulador`, simOk, `${label}: ${JSON.stringify(f)} · ${units.join(' · ')}`);
    // Resumo levado à mensagem do WhatsApp (NEKKORA-COM-CANAIS-001; antes, ao formulário): os mesmos valores em qualquer
    // data, depois da mensagem do Delivery
    const cta = await simCta(sim);
    const message = waText(cta.href, PUBLICACAO.canais.whatsapp) ?? '';
    const summaryOk =
      cta.count === 1 && cta.ctx === 'delivery' && message === `${MSG_DELIVERY}\n\n${SIM_INTRO}\n${SUMMARY_LINES.join('\n')}` && SUMMARY_EXAMPLE.test(message) && !PREVIOUS.test(message);
    check(engine, `producao-${d.id}:resumo-no-whatsapp`, summaryOk, message.replace(/\n/g, ' / ').slice(0, 220) || `CTA: ${JSON.stringify(cta)}`);
    await shot(sim, `simulador-producao-${d.id}`);
    await ctx.close();
  }

  // 12. Datas pendentes (fixtures sem datas): faixa de prévia só com o aviso de homologação; preços sempre os mesmos ---
  for (const [id, url, withNotice] of [
    ['datas-pendentes-previa-com-aviso', pendingUrl, true],
    ['datas-pendentes-sem-aviso-sem-faixa', pendingNoNoticeUrl, false],
  ]) {
    const { ctx, page, sim } = await open(url, { at: AT.pendente });
    await plus(sim, 'simples', 4);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const text = await sim.locator('[data-sim-result]').innerText();
    const cards = await page.evaluate(() => ({
      struck: document.querySelectorAll('[data-pricing] [data-price-tier] s').length,
      preview: document.querySelectorAll('[data-pricing] [data-campanha="pendente"]').length,
      strip: !!document.querySelector('[data-pricing] .launch-strip'),
    }));
    check(
      engine,
      id,
      JSON.stringify(f) === JSON.stringify(EXAMPLE) && !PREVIOUS.test(text) && cards.struck === 0 && (withNotice ? cards.preview === 1 && cards.strip : cards.preview === 0 && !cards.strip),
      `${JSON.stringify(f)} · ${JSON.stringify(cards)}`,
    );
    if (withNotice) await shot(sim, 'simulador-pendente-previa');
    await ctx.close();
  }

  // 9–11. Estados da campanha com datas (fixture): a mesma tabela antes, durante e depois ------------------------------
  for (const state of ['vigente', 'futura', 'encerrada']) {
    const { ctx, sim } = await open(fixtureUrl, { at: AT[state] });
    await plus(sim, 'simples', 4);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const text = await sim.locator('[data-sim-result]').innerText();
    const units = await sim.locator('.sim__tier-unit').allInnerTexts();
    check(engine, `campanha-${state}-mesma-tabela`, JSON.stringify(f) === JSON.stringify(EXAMPLE) && units.join() === UNITS && !PREVIOUS.test(text), JSON.stringify(f));
    await shot(sim, `simulador-${state}`);
    await ctx.close();
  }

  // 8, 13, 14. Sem complexa, sem pacote misto, seis médias, proteção de entradas, teclado, recalcular, limpar -----------
  {
    const { ctx, page, sim } = await open(fixtureUrl);
    const noComplex = await sim.evaluate((el) => ({ tier: el.querySelectorAll('[data-sim-tier="complexa"], [data-sim-input="complexa"]').length, text: /complexa|sob orçamento/i.test(el.innerText) }));
    check(engine, 'sem-campo-complexa', noComplex.tier === 0 && !noComplex.text, JSON.stringify(noComplex));
    // 2 simples + 1 média: categorias diferentes não formam pacote
    await plus(sim, 'simples', 2);
    await plus(sim, 'media');
    await calc(sim);
    let f = await figures(sim);
    let res = await sim.locator('[data-sim-result]').evaluate((e) => ({ packages: e.dataset.simPacotes, text: e.innerText }));
    check(engine, 'sem-pacote-misto', JSON.stringify(f) === JSON.stringify(EXAMPLE_NO_PACKAGE) && res.packages === '0' && !/Economia com pacotes/.test(res.text), `${JSON.stringify(f)} · pacotes=${res.packages}`);
    await shot(sim, 'simulador-sem-pacote');
    // recalcular: mudar a quantidade esconde o resultado até novo cálculo (nunca um valor desatualizado)
    await plus(sim, 'simples', 2);
    const staleShown = await sim.locator('[data-sim-result]').count();
    const staleNote = await sim.locator('.sim__warning', { hasText: 'As quantidades mudaram.' }).count();
    await calc(sim);
    f = await figures(sim);
    check(engine, 'alterar-e-recalcular', staleShown === 0 && staleNote === 1 && JSON.stringify(f) === JSON.stringify(EXAMPLE), `resultado oculto após mudança=${staleShown === 0}; aviso=${staleNote}`);
    // seis médias: dois pacotes (V-03)
    await sim.getByRole('button', { name: 'Limpar simulação' }).click();
    await plus(sim, 'media', 6);
    await calc(sim);
    f = await figures(sim);
    res = await sim.locator('[data-sim-result]').evaluate((e) => ({ packages: e.dataset.simPacotes, text: e.innerText }));
    check(
      engine,
      'pacotes-seis-medias-dois-pacotes',
      JSON.stringify(f) === JSON.stringify({ estimativa: 'R$ 7.000', individual: 'R$ 8.400', economia: 'R$ 1.400' }) && res.packages === '2' && /6 automações médias: 2 pacotes de 3 \(R\$ 3\.500 cada\)/.test(res.text),
      `${JSON.stringify(f)} · pacotes=${res.packages}`,
    );
    await shot(sim, 'simulador-seis-medias');
    // entradas inválidas: digitação e colagem
    const input = sim.locator('[data-sim-input="simples"]');
    const typed = [];
    for (const [value, expected] of [
      ['-5', '5'],
      ['abc', ''],
      ['2,5', '20'],
      ['1e3', '13'],
      ['999', '20'],
      ['007', '7'],
    ]) {
      await input.fill(value);
      typed.push(`${value}→${await input.inputValue()}${(await input.inputValue()) === expected ? '' : ` (esperado ${expected})`}`);
    }
    await input.fill('');
    await input.blur();
    const afterBlur = await input.inputValue();
    await input.fill('25');
    const plusAtMax = await sim.locator('[data-sim-tier="simples"] [data-sim-action="aumentar"]').getAttribute('aria-disabled');
    await sim.locator('[data-sim-tier="simples"] [data-sim-action="aumentar"]').click({ force: true });
    const atMax = await input.inputValue();
    check(engine, 'protecao-contra-valores-invalidos', typed.every((t) => !t.includes('esperado')) && afterBlur === '0' && atMax === '20' && plusAtMax === 'true', `${typed.join(' · ')} · vazio+saída→${afterBlur} · máximo=${atMax}`);
    // limpar
    await sim.getByRole('button', { name: 'Limpar simulação' }).click();
    const cleared = await sim.evaluate((el) => ({ values: [...el.querySelectorAll('[data-sim-input]')].map((i) => i.value), result: !!el.querySelector('[data-sim-result]') }));
    await calc(sim);
    // visível no simulador (a região viva, oculta, também anuncia o mesmo texto)
    const empty = await sim.locator('.sim__warning', { hasText: 'Selecione ao menos uma automação para calcular.' }).count();
    check(engine, 'limpar-e-calcular-vazio', JSON.stringify(cleared.values) === '["0","0"]' && !cleared.result && empty === 1, JSON.stringify(cleared));
    // teclado: botões por Enter/Espaço, setas no campo, Enter calcula — sem mouse
    await sim.locator('[data-sim-tier="simples"] [data-sim-action="aumentar"]').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await sim.locator('[data-sim-input="media"]').focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    f = await figures(sim);
    const ring = await sim.locator('[data-sim-input="media"]').evaluate((el) => {
      for (let n = el, i = 0; n && i < 3; n = n.parentElement, i++) {
        const cs = getComputedStyle(n);
        if ((cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none')) return true;
      }
      return false;
    });
    const spin = await sim.locator('[data-sim-input="media"]').evaluate((el) => ({ role: el.getAttribute('role'), now: el.getAttribute('aria-valuenow'), max: el.getAttribute('aria-valuemax'), name: el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent }));
    check(engine, 'teclado-completo', JSON.stringify(f) === JSON.stringify(EXAMPLE_NO_PACKAGE) && ring && spin.role === 'spinbutton' && spin.now === '1' && spin.max === '20' && spin.name === 'Automações médias', `${JSON.stringify(f)} · foco visível=${ring} · ${JSON.stringify(spin)}`);
    // Tab percorre os controles do simulador em ordem e com foco visível
    await sim.locator('[data-sim-tier="simples"] [data-sim-action="diminuir"]').focus();
    const order = [];
    for (let i = 0; i < 8; i++) {
      order.push(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.getAttribute('data-sim-input') || document.activeElement?.textContent?.trim()));
      await page.keyboard.press('Tab');
    }
    check(
      engine,
      'ordem-de-tab',
      JSON.stringify(order) ===
        JSON.stringify(['Diminuir automações simples', 'simples', 'Aumentar automações simples', 'Diminuir automações médias', 'media', 'Aumentar automações médias', 'Limpar simulação', 'Calcular meu investimento']),
      order.join(' → '),
    );
    await ctx.close();
  }

  // 15, 16, 17. Celular, tema escuro, armazenamento e rede -------------------------------------------------------------
  for (const [name, viewport, theme] of [
    ['celular-claro', { width: 375, height: 812 }, 'sage-light'],
    ['celular-escuro', { width: 375, height: 812 }, 'sakura-dark'],
    ['tablet-claro', { width: 768, height: 1024 }, 'sage-light'],
    ['desktop-escuro', { width: 1280, height: 900 }, 'sakura-dark'],
  ]) {
    const { ctx, page, sim } = await open(prodUrl, { viewport, theme });
    const before = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie }));
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    await plus(sim, 'simples', 4);
    await plus(sim, 'media');
    await calc(sim);
    await sim.locator('[data-sim-result]').waitFor();
    const after = await page.evaluate(async () => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      cookie: document.cookie,
      idb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((d) => d.name) : [],
    }));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const offscreen = await sim.evaluate((el) => [...el.querySelectorAll('button, a, input')].filter((b) => { const r = b.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).length);
    check(engine, `responsivo-sem-rolagem-horizontal:${name}`, overflow <= 0 && offscreen === 0, `excesso=${overflow}px; controles fora da tela=${offscreen}`);
    check(
      engine,
      `sem-armazenamento:${name}`,
      JSON.stringify(after.local) === JSON.stringify(before.local) && after.local.every((k) => k === 'nekkora-commercial-tema') && after.session.every((k) => k === '__nk_seeded' || before.session.includes(k)) && after.cookie === '' && after.idb.length === 0,
      `localStorage=${after.local.join(',') || '—'}; sessionStorage=${after.session.join(',') || '—'}; cookie=${after.cookie || '—'}; IndexedDB=${after.idb.join(',') || '—'}`,
    );
    check(engine, `sem-envio-externo:${name}`, requests.length === 0, requests.join(' | ') || 'nenhuma requisição durante a simulação');
    // Acessibilidade (axe, WCAG 2.1 AA) do simulador com o resultado aberto
    await page.evaluate(axeSource);
    const axe = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document.querySelector('[data-simulator]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return { violations: r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`), contrast: r.incomplete.filter((i) => i.id === 'color-contrast').length };
    });
    check(engine, `axe-simulador:${name}`, axe.violations.length === 0, axe.violations.join(' | ') || `sem violações (${axe.contrast} nó(s) de contraste indeterminado)`);
    await shot(sim, `simulador-${name}`);
    await ctx.close();
  }

  // 18. Conversa pelo WhatsApp a partir da simulação (NEKKORA-COM-CANAIS-001; substitui a integração com o formulário):
  // a mensagem do Delivery leva o resumo do resultado MOSTRADO; o visitante a revisa e edita no WhatsApp — a página não
  // envia nada, e um resultado desatualizado nunca vira mensagem
  {
    const { ctx, page, sim } = await open(prodUrl);
    await plus(sim, 'simples', 4);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const cta = await simCta(sim);
    const message = waText(cta.href, PUBLICACAO.canais.whatsapp) ?? '';
    const summary = message.startsWith(`${MSG_DELIVERY}\n\n${SIM_INTRO}\n`) ? message.slice(`${MSG_DELIVERY}\n\n${SIM_INTRO}\n`.length) : '';
    check(
      engine,
      'whatsapp-recebe-resumo-da-simulacao',
      cta.count === 1 &&
        cta.ctx === 'delivery' &&
        cta.dialogTriggers === 0 &&
        cta.label.startsWith('Conversar sobre esta simulação') &&
        cta.target === '_blank' &&
        /\bnoopener\b/.test(cta.rel) &&
        /\bnoreferrer\b/.test(cta.rel) &&
        summary === SUMMARY_LINES.join('\n') &&
        // coerente com o resultado na tela
        summary.includes(`Investimento estimado: ${f.estimativa}`) &&
        summary.includes(`Sem pacotes, no preço individual: ${f.individual}`) &&
        summary.includes(`Economia com pacotes: ${f.economia}`),
      `"${cta.label}" → ${message.replace(/\n/g, ' / ').slice(0, 200)} · tela=${JSON.stringify(f)}`,
    );
    const r = await clickWa(page, sim.locator('[data-sim-result] a[data-whatsapp]'));
    check(
      engine,
      'resumo-vai-so-na-mensagem-sem-envio',
      r.popup && r.tab != null && waText(r.tab.url, PUBLICACAO.canais.whatsapp) === message && r.tab.referer == null && r.dialogs === 0 && r.requests.length === 0,
      `aba wa.me (local)=${r.popup}; mesma mensagem=${r.tab != null && waText(r.tab.url, PUBLICACAO.canais.whatsapp) === message}; Referer=${r.tab?.referer ?? 'ausente'}; diálogos/formulários=${r.dialogs}; requisições da página=${r.requests.length}`,
    );
    await shot(sim.locator('[data-sim-result]'), 'simulador-resultado-whatsapp');
    // quantidade alterada: o resultado (e o CTA com o resumo) some até novo cálculo
    await plus(sim, 'simples');
    const stale = await sim.locator('a[data-whatsapp]').count();
    check(engine, 'sem-resumo-desatualizado-no-whatsapp', stale === 0, `CTA com resumo depois de mudar a quantidade: ${stale}`);
    await ctx.close();
  }

  // AUD-25. Hosting: o CTA abre a conversa com a mensagem de hospedagem (NEKKORA-COM-CANAIS-001; substitui o diálogo com
  // o tipo "hospedagem" marcado) — nenhum diálogo nem formulário na página
  {
    const { ctx, page } = await open(prodUrl);
    const hosting = await page.locator('#hosting a[data-whatsapp]').evaluate((a) => ({ ctx: a.dataset.whatsapp, href: a.getAttribute('href'), haspopup: a.getAttribute('aria-haspopup'), target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '' }));
    const page0 = await page.evaluate(() => ({ forms: document.querySelectorAll('form').length, triggers: document.querySelectorAll('[aria-haspopup="dialog"]').length }));
    const r = await clickWa(page, page.locator('#hosting a[data-whatsapp]'));
    check(
      engine,
      'hosting-whatsapp-adequado',
      hosting.ctx === 'hosting' &&
        hosting.haspopup == null &&
        waText(hosting.href, PUBLICACAO.canais.whatsapp) === MSG_HOSTING &&
        hosting.target === '_blank' &&
        /\bnoreferrer\b/.test(hosting.rel) &&
        r.popup &&
        waText(r.tab?.url ?? '', PUBLICACAO.canais.whatsapp) === MSG_HOSTING &&
        r.dialogs === 0 &&
        r.requests.length === 0 &&
        page0.forms === 0 &&
        page0.triggers === 0,
      `mensagem="${waText(hosting.href, PUBLICACAO.canais.whatsapp)}"; aba=${r.popup}; diálogos/formulários=${r.dialogs}; formulários na página=${page0.forms}; botões de diálogo=${page0.triggers}`,
    );
    await ctx.close();
  }

  check(engine, 'sem-requisicoes-externas', external.length === 0, external.join(' | ') || 'nenhuma');
  check(engine, 'console-sem-erros', errors.filter((e) => !/Download the React DevTools/.test(e)).length === 0, errors.join(' | ') || 'limpo');
  await browser.close();
}

for (const engine of engineList.split(',')) await run(engine);
const failed = checks.filter((c) => !c.ok);
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ prodUrl, fixtureUrl, checks, shots }, null, 2));
writeFileSync(
  path.join(outDir, 'resumo.md'),
  [
    `# Homologação do simulador e da conversa pelo WhatsApp — ${new Date().toISOString()}`,
    '',
    `${checks.length} verificações · ${failed.length} falha(s) · ${engineList}`,
    '',
    '| Navegador | Verificação | Resultado | Detalhe |',
    '|---|---|---|---|',
    ...checks.map((c) => `| ${c.engine} | ${c.id} | ${c.ok ? 'OK' : '**FALHA**'} | ${String(c.detail ?? '').replace(/\|/g, '\\|').slice(0, 260)} |`),
    '',
    `Capturas: ${shots.join(', ')}`,
    '',
  ].join('\n'),
);
console.log(`\n${checks.length} verificações, ${failed.length} falha(s). Resultados em ${outDir}`);
process.exit(failed.length ? 1 : 0);
