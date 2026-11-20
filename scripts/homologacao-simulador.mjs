#!/usr/bin/env node
/**
 * Homologação do Simulador de investimento (NEKKORA-COM-ECOSYSTEM-001 §4) e da sua passagem para o formulário de
 * atendimento (§7) em navegador real (Playwright: Chromium, Firefox, WebKit).
 *
 * Uso (builds servidos como no CloudFront — veja .github/workflows/ci.yml):
 *   node scripts/homologacao-simulador.mjs <url de produção> <url da fixture> <pasta> [chromium,firefox,webkit]
 *     [<url da fixture sem datas de campanha> <url da fixture sem datas e sem aviso>]
 *
 * O simulador tem quatro campos (automações no AI Piloto e no Monitor, horas-máquina Windows e Linux), todos começando
 * em zero, só inteiros de 0 ao limite de cada campo; a estimativa acompanha as quantidades na hora (sem botão de
 * calcular). Cada natureza de cobrança aparece separada — inicial (AI, "a partir de"), mensal (Monitor) e por hora
 * (Hosting) — e o combinado (AI + PRIMEIRO mês do Monitor + horas de Hosting) nunca é chamado de mensalidade.
 *
 * Valores esperados digitados aqui de propósito (independentes do código) e conferidos contra src/precos.ts antes de
 * qualquer navegador abrir. A campanha de lançamento ficou só como histórico: o relógio de cada contexto é fixado nas
 * bordas da antiga campanha (produção) e as fixtures com e sem datas de campanha são exercitadas para provar que nada
 * muda com a data nem com a publicação.
 *
 * Nada sai do localhost: qualquer outra requisição é abortada e reprova. window.open é substituído por um registro
 * (nenhuma aba do WhatsApp é aberta aqui — a aba, o isolamento e o botão flutuante estão em homologacao-canais.mjs).
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PRICE_TABLE, SIM_LIMITS } from '../src/precos.ts';

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

/** Tabela e limites digitados de propósito — iguais a PRICE_TABLE e SIM_LIMITS de src/precos.ts. */
const PRICES = { ai: 100, monitor: 75, windows: 25, linux: 12 };
const LIMITS = { ai: 50, monitor: 50, windows: 744, linux: 744 };
{
  const src = { ai: PRICE_TABLE.ai.porAutomacao, monitor: PRICE_TABLE.monitor.porAutomacaoMes, windows: PRICE_TABLE.hosting.windowsPorHora, linux: PRICE_TABLE.hosting.linuxPorHora };
  if (JSON.stringify(src) !== JSON.stringify(PRICES)) throw new Error(`src/precos.ts: tabela diverge da homologação: ${JSON.stringify(src)}`);
  if (JSON.stringify(SIM_LIMITS) !== JSON.stringify(LIMITS)) throw new Error(`src/precos.ts: limites divergem da homologação: ${JSON.stringify(SIM_LIMITS)}`);
}
const FIELDS = ['ai', 'monitor', 'windows', 'linux'];
/** Unidades sob cada campo — iguais às linhas dos cartões de preço. */
const UNITS = ['A partir de R$ 100 por automação', 'R$ 75 por automação, por mês', 'R$ 25 por hora-máquina', 'R$ 12 por hora-máquina'];
/** Rótulos dos resultados (§4): cada natureza de cobrança separada; o combinado nunca é mensalidade. */
const LABELS = {
  ai: 'Investimento inicial estimado no AI Piloto',
  monitor: 'Valor mensal estimado do Monitor',
  hosting: 'Hosting para as horas selecionadas',
  combinado: 'Investimento combinado estimado',
};
const COMBINED_NOTE = 'Soma do AI Piloto, do primeiro mês do Monitor e das horas de Hosting selecionadas. Não é uma mensalidade.';
const DISCLAIMER = 'Esta simulação é só uma estimativa. Não é proposta nem contratação: escopo, condições e valores definitivos são confirmados na avaliação e registrados em proposta comercial.';
const EMPTY_TEXT = 'Informe ao menos uma quantidade para ver a estimativa.';
/** Mensagem do formulário (src/config.ts e src/mensagem.ts), digitada de propósito. */
const GREETING = 'Olá! Gostaria de conversar com um analista da Nekkora.';
if (!readFileSync('src/config.ts', 'utf8').includes(`WHATSAPP_GREETING = '${GREETING}'`)) throw new Error('src/config.ts: WHATSAPP_GREETING diverge da homologação');

/** Exemplo principal: 2 automações no AI, 3 no Monitor, 10 h Windows e 20 h Linux. */
const EXAMPLE_Q = { ai: 2, monitor: 3, windows: 10, linux: 20 };
const EXAMPLE = { ai: 'a partir de R$ 200', monitor: 'R$ 225 por mês', hosting: 'R$ 490', combinado: 'R$ 915' };
const EXAMPLE_SUMMARY = [
  '- Nekkora AI (piloto): 2 automações × R$ 100 = a partir de R$ 200',
  '- Nekkora Monitor: 3 automações × R$ 75 = R$ 225 por mês',
  '- Nekkora Hosting Windows: 10 horas × R$ 25 = R$ 250',
  '- Nekkora Hosting Linux: 20 horas × R$ 12 = R$ 240',
  `Investimento combinado estimado: R$ 915 (${COMBINED_NOTE})`,
].join('\n');
/** Valores da tabela anterior (Delivery e campanha) e restos do modelo anterior: nunca no simulador. */
const PREVIOUS = /R\$ 650|R\$ 1\.500|R\$ 1\.400|R\$ 3\.500|R\$ 1\.000|R\$ 2\.800|pacote|Economia|simples|média|lançamento|Delivery|NaN|undefined|Infinity/;

const THEME_KEY = 'nekkora-commercial-tema';
/** Bordas da antiga campanha de lançamento (06/11/2026 a 06/01/2027) no fuso de Brasília: a estimativa não muda. */
const DATES = [
  { id: '2026-11-05-vespera', at: new Date('2026-11-05T23:30:00-03:00') },
  { id: '2026-11-06-primeiro-dia', at: new Date('2026-11-06T00:30:00-03:00') },
  { id: '2027-01-06-ultimo-dia', at: new Date('2027-01-06T23:30:00-03:00') },
  { id: '2027-01-07-dia-seguinte', at: new Date('2027-01-07T00:30:00-03:00') },
];
const AT = new Date('2026-11-20T12:00:00-03:00');

const checks = [];
const check = (engine, id, ok, detail) => {
  checks.push({ engine, id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} [${engine}] ${id}${detail ? ` — ${detail}` : ''}`);
};
const shots = [];

async function run(engine) {
  const browser = await playwright[engine].launch();
  const external = [];
  const errors = [];
  /** Contexto isolado com relógio fixo; tema opcional; toda requisição fora do localhost é abortada e registrada. */
  async function open(url, { at = AT, viewport = { width: 1280, height: 900 }, theme = null } = {}) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await ctx.clock.setFixedTime(at);
    await ctx.addInitScript(
      ([k, t]) => {
        // Registro de window.open: o envio do formulário prepara o link do WhatsApp; nenhuma aba é aberta aqui
        window.__nkOpen = [];
        window.open = (...a) => {
          window.__nkOpen.push(a);
          return null;
        };
        if (t) localStorage.setItem(k, t);
      },
      [THEME_KEY, theme],
    );
    const origin = new URL(url).origin;
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (u.startsWith(origin) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
      external.push(u);
      return route.abort();
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const sim = page.locator('[data-simulator]');
    await sim.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    return { ctx, page, sim };
  }
  const shot = async (locator, name) => {
    const file = `${engine}-${name}.png`;
    await locator.screenshot({ path: path.join(outDir, file), style: 'header, nav, .nk-fab { visibility: hidden !important; }' });
    shots.push(file);
  };
  const input = (sim, f) => sim.locator(`[data-sim-input="${f}"]`);
  const btn = (sim, f, action) => sim.locator(`[data-sim-campo="${f}"] [data-sim-action="${action}"]`);
  const plus = async (sim, f, times = 1) => {
    for (let i = 0; i < times; i++) await btn(sim, f, 'aumentar').click();
  };
  /** Quantidades pelo campo numérico (digitação), como o visitante faria; Tab confirma o campo. */
  const setQ = async (sim, q) => {
    for (const f of FIELDS) {
      if (q[f] == null) continue;
      await input(sim, f).fill(String(q[f]));
      await input(sim, f).press('Tab');
    }
  };
  const clear = (sim) => sim.locator('[data-sim-action="limpar"]').click();
  const read = (sim) =>
    sim.evaluate((el) => ({
      values: [...el.querySelectorAll('[data-sim-input]')].map((i) => i.value),
      state: el.querySelector('[data-sim-result]')?.getAttribute('data-sim-result') ?? null,
      figures: Object.fromEntries([...el.querySelectorAll('[data-calc]')].map((e) => [e.getAttribute('data-calc'), e.textContent.replace(/\s+/g, ' ').trim()])),
      labels: Object.fromEntries([...el.querySelectorAll('[data-calc]')].map((e) => [e.getAttribute('data-calc'), e.previousElementSibling?.textContent.trim() ?? null])),
      text: el.querySelector('[data-sim-result]')?.innerText ?? '',
      cta: el.querySelectorAll('[data-atendimento-origem="simulador"]').length,
    }));
  /** Espera (até 2 s) a estimativa chegar ao esperado — a atualização é imediata; a espera só evita corrida de leitura. */
  const waitFigures = async (sim, expected) => {
    await sim
      .evaluate(
        (el, exp) =>
          new Promise((resolve) => {
            const t0 = Date.now();
            const tick = () => {
              const f = Object.fromEntries([...el.querySelectorAll('[data-calc]')].map((e) => [e.getAttribute('data-calc'), e.textContent.replace(/\s+/g, ' ').trim()]));
              if (JSON.stringify(f) === exp || Date.now() - t0 > 2000) resolve();
              else requestAnimationFrame(tick);
            };
            tick();
          }),
        JSON.stringify(expected),
      )
      .catch(() => {});
    return read(sim);
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
        noForm: !s?.querySelector('form, input[type="email"], input[type="password"], textarea'),
        calcButton: [...(s?.querySelectorAll('button') ?? [])].filter((b) => /calcular/i.test(b.textContent ?? '')).length,
      };
    });
    check(engine, 'integrado-na-secao-de-precos', place.inPricing && place.afterCards && place.title === 'Simulador de investimento' && place.noForm, JSON.stringify(place));
    const initial = await sim.evaluate((el) => ({
      fields: [...el.querySelectorAll('[data-sim-campo]')].map((t) => t.getAttribute('data-sim-campo')),
      values: [...el.querySelectorAll('[data-sim-input]')].map((i) => i.value),
      state: el.querySelector('[data-sim-result]')?.getAttribute('data-sim-result'),
      calc: el.querySelectorAll('[data-calc]').length,
      cta: el.querySelectorAll('[data-atendimento-origem="simulador"]').length,
      empty: el.querySelector('.sim__warning')?.textContent.trim() ?? null,
      minusDisabled: [...el.querySelectorAll('[data-sim-action="diminuir"]')].map((b) => b.getAttribute('aria-disabled')),
      plusDisabled: [...el.querySelectorAll('[data-sim-action="aumentar"]')].map((b) => b.getAttribute('aria-disabled')),
      max: [...el.querySelectorAll('[data-sim-input]')].map((i) => i.getAttribute('aria-valuemax')),
    }));
    check(
      engine,
      'inicia-com-zero-nos-quatro-campos',
      initial.fields.join() === FIELDS.join() &&
        initial.values.join() === '0,0,0,0' &&
        initial.state === 'vazio' &&
        initial.calc === 0 &&
        initial.cta === 0 &&
        initial.empty === EMPTY_TEXT &&
        initial.minusDisabled.every((d) => d === 'true') &&
        initial.plusDisabled.every((d) => d == null) &&
        initial.max.join() === FIELDS.map((f) => LIMITS[f]).join(),
      JSON.stringify(initial),
    );
    // Consistência com os cartões: a unidade de cada campo é a linha do cartão de preço correspondente
    const cards = await page.evaluate(() => ({
      lines: [...document.querySelectorAll('[data-pricing] .price__line')].map((l) => [...l.children].map((c) => c.textContent.trim()).join(' ')),
      units: [...document.querySelectorAll('[data-sim-campo] .sim__tier-unit')].map((u) => u.textContent.trim()),
    }));
    const cardUnits = cards.lines.map((l) => l.replace(/^(Windows|Linux) /, ''));
    check(engine, 'consistente-com-os-cartoes', same(cards.units, UNITS) && same(cardUnits, UNITS), `${cards.units.join(' · ')} | cartões: ${cards.lines.join(' · ')}`);
    await shot(sim, 'simulador-inicial-producao');
    // Ao vivo: sem botão de calcular; um clique em + já mostra a estimativa
    await plus(sim, 'ai');
    const live = await waitFigures(sim, { ai: 'a partir de R$ 100', combinado: 'R$ 100' });
    check(engine, 'estimativa-ao-vivo-sem-botao-calcular', place.calcButton === 0 && live.state === 'calculado' && same(live.figures, { ai: 'a partir de R$ 100', combinado: 'R$ 100' }), `botões "calcular"=${place.calcButton}; depois de um +: ${JSON.stringify(live.figures)}`);
    // Digitação também atualiza na hora, sem sair do campo
    await input(sim, 'monitor').fill('4');
    const typed = await waitFigures(sim, { ai: 'a partir de R$ 100', monitor: 'R$ 300 por mês', combinado: 'R$ 400' });
    check(engine, 'digitacao-atualiza-sem-sair-do-campo', same(typed.figures, { ai: 'a partir de R$ 100', monitor: 'R$ 300 por mês', combinado: 'R$ 400' }), JSON.stringify(typed.figures));
    await ctx.close();
  }

  // 2. Cada produto sozinho, combinações, todos em zero e a soma correta -------------------------------------------------
  {
    const { ctx, page, sim } = await open(prodUrl);
    const cases = [
      ['so-ai', { ai: 3 }, { ai: 'a partir de R$ 300', combinado: 'R$ 300' }],
      ['so-monitor', { monitor: 4 }, { monitor: 'R$ 300 por mês', combinado: 'R$ 300' }],
      ['so-hosting-windows', { windows: 10 }, { hosting: 'R$ 250', combinado: 'R$ 250' }],
      ['so-hosting-linux', { linux: 7 }, { hosting: 'R$ 84', combinado: 'R$ 84' }],
      ['ai-e-monitor', { ai: 1, monitor: 1 }, { ai: 'a partir de R$ 100', monitor: 'R$ 75 por mês', combinado: 'R$ 175' }],
      ['windows-e-linux', { windows: 1, linux: 1 }, { hosting: 'R$ 37', combinado: 'R$ 37' }],
      ['monitor-e-hosting', { monitor: 2, linux: 5 }, { monitor: 'R$ 150 por mês', hosting: 'R$ 60', combinado: 'R$ 210' }],
      ['os-quatro', EXAMPLE_Q, EXAMPLE],
      ['separador-de-milhar', { ai: 12, windows: 100 }, { ai: 'a partir de R$ 1.200', hosting: 'R$ 2.500', combinado: 'R$ 3.700' }],
    ];
    const out = [];
    for (const [id, q, expected] of cases) {
      await clear(sim);
      await setQ(sim, q);
      const r = await waitFigures(sim, expected);
      const ok = r.state === 'calculado' && same(r.figures, expected) && !PREVIOUS.test(r.text);
      out.push(ok);
      check(engine, `calculo:${id}`, ok, `${JSON.stringify(q)} → ${JSON.stringify(r.figures)}`);
      if (id === 'os-quatro') await shot(sim, 'simulador-quatro-servicos');
    }
    // Separação das naturezas de cobrança (§4): rótulos, "a partir de" só no AI, "por mês" só no Monitor, combinado nunca
    // chamado de mensalidade, com a nota e o aviso de estimativa
    await clear(sim);
    await setQ(sim, EXAMPLE_Q);
    const r = await waitFigures(sim, EXAMPLE);
    const notes = await sim.evaluate((el) => ({ note: [...el.querySelectorAll('.sim__result .sim__note')].map((n) => n.textContent.trim()), disclaimer: el.querySelector('[data-sim-aviso]')?.textContent.trim() ?? '' }));
    check(
      engine,
      'cobrancas-separadas-combinado-nao-e-mensalidade',
      same(r.labels, LABELS) &&
        /^a partir de /.test(r.figures.ai) &&
        / por mês$/.test(r.figures.monitor) &&
        !/mês|mensal|a partir/.test(r.figures.hosting + r.figures.combinado) &&
        !/mensal/i.test(r.labels.combinado) &&
        notes.note.includes(COMBINED_NOTE) &&
        notes.disclaimer === DISCLAIMER,
      `${Object.entries(r.labels).map(([k, v]) => `${v}: ${r.figures[k]}`).join(' · ')} · nota="${notes.note.join(' ')}"`,
    );
    // Todos em zero: de volta ao estado vazio (nenhum valor, nenhum CTA)
    await clear(sim);
    await plus(sim, 'linux');
    await btn(sim, 'linux', 'diminuir').click();
    const zero = await read(sim);
    check(engine, 'todos-em-zero-sem-estimativa', zero.values.join() === '0,0,0,0' && zero.state === 'vazio' && same(zero.figures, {}) && zero.cta === 0 && (await sim.locator('.sim__warning').innerText()) === EMPTY_TEXT, JSON.stringify(zero.figures));
    // Limpar: zera os quatro campos e anuncia
    await setQ(sim, EXAMPLE_Q);
    await clear(sim);
    const cleared = await read(sim);
    const status = page.locator('[data-testid="status-simulador"]');
    const statusText = await status.innerText();
    check(engine, 'limpar-zera-tudo', cleared.values.join() === '0,0,0,0' && cleared.state === 'vazio' && cleared.cta === 0 && /Simulação limpa\./.test(statusText), `${cleared.values.join(',')} · região viva: ${statusText}`);
    await ctx.close();
  }

  // 3. Limites e entradas inválidas -----------------------------------------------------------------------------------
  {
    const { ctx, sim } = await open(fixtureUrl);
    // Digitação: só dígitos, sem sinal, vírgula, ponto ou expoente; acima do limite, o limite
    const typed = [];
    for (const [f, value, expected] of [
      ['ai', '-5', '5'],
      ['ai', 'abc', ''],
      ['ai', '2,5', '25'],
      ['ai', '2.5', '25'],
      ['ai', '1e3', '13'],
      ['ai', '007', '7'],
      ['ai', ' 12 ', '12'],
      ['ai', '999', '50'],
      ['monitor', '51', '50'],
      ['windows', '745', '744'],
      ['windows', '999', '744'],
      ['linux', '744', '744'],
    ]) {
      await input(sim, f).fill(value);
      const got = await input(sim, f).inputValue();
      typed.push(`${f}:${JSON.stringify(value)}→${JSON.stringify(got)}${got === expected ? '' : ` (esperado ${JSON.stringify(expected)})`}`);
    }
    // Números enormes: nunca acima do limite nem fracionários (o campo aceita no máximo 3 dígitos)
    const huge = [];
    for (const [f, value] of [
      ['ai', '100000'],
      ['windows', '99999999'],
      ['linux', '1e308'],
    ]) {
      await input(sim, f).fill(value);
      const got = await input(sim, f).inputValue();
      huge.push(`${f}:${value}→${got}`);
      if (!/^\d+$/.test(got) || Number(got) > LIMITS[f]) huge.push('(FORA DO LIMITE)');
    }
    // Campo vazio vira 0 ao sair dele
    await input(sim, 'ai').fill('');
    await input(sim, 'ai').press('Tab');
    const afterBlur = await input(sim, 'ai').inputValue();
    const text = (await read(sim)).text;
    check(
      engine,
      'protecao-contra-valores-invalidos',
      typed.every((t) => !t.includes('esperado')) && !huge.includes('(FORA DO LIMITE)') && afterBlur === '0' && !/NaN|undefined|Infinity|-R\$/.test(text),
      `${typed.join(' · ')} · enormes: ${huge.join(' ')} · vazio+saída→${afterBlur}`,
    );
    // Todos no limite: + com aria-disabled e sem efeito (clique e seta ↑), − disponível; valores no limite
    await setQ(sim, { ai: '999', monitor: '999', windows: '999', linux: '999' });
    const atMax = await waitFigures(sim, { ai: 'a partir de R$ 5.000', monitor: 'R$ 3.750 por mês', hosting: 'R$ 27.528', combinado: 'R$ 36.278' });
    for (const f of FIELDS) await btn(sim, f, 'aumentar').click({ force: true });
    await input(sim, 'windows').focus();
    await input(sim, 'windows').press('ArrowUp');
    const after = await read(sim);
    const flags = await sim.evaluate((el) => ({
      plus: [...el.querySelectorAll('[data-sim-action="aumentar"]')].map((b) => b.getAttribute('aria-disabled')),
      minus: [...el.querySelectorAll('[data-sim-action="diminuir"]')].map((b) => b.getAttribute('aria-disabled')),
      now: [...el.querySelectorAll('[data-sim-input]')].map((i) => i.getAttribute('aria-valuenow')),
    }));
    check(
      engine,
      'limites-por-campo',
      atMax.values.join() === '50,50,744,744' &&
        after.values.join() === '50,50,744,744' &&
        same(after.figures, { ai: 'a partir de R$ 5.000', monitor: 'R$ 3.750 por mês', hosting: 'R$ 27.528', combinado: 'R$ 36.278' }) &&
        flags.plus.every((d) => d === 'true') &&
        flags.minus.every((d) => d == null) &&
        flags.now.join() === '50,50,744,744',
      `${after.values.join(',')} · ${JSON.stringify(after.figures)} · + aria-disabled=${flags.plus.join(',')}`,
    );
    await shot(sim, 'simulador-no-limite');
    // − no zero: aria-disabled e sem efeito (clique e seta ↓)
    await clear(sim);
    for (const f of FIELDS) await btn(sim, f, 'diminuir').click({ force: true });
    await input(sim, 'ai').focus();
    await input(sim, 'ai').press('ArrowDown');
    const atZero = await read(sim);
    check(engine, 'zero-e-o-minimo', atZero.values.join() === '0,0,0,0' && atZero.state === 'vazio', atZero.values.join(','));
    await ctx.close();
  }

  // 4. Teclado: botões por Enter/Espaço, setas no campo, foco visível, nome acessível e ordem de Tab -------------------
  {
    const { ctx, page, sim } = await open(fixtureUrl);
    await btn(sim, 'ai', 'aumentar').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await input(sim, 'monitor').focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    const r = await waitFigures(sim, { ai: 'a partir de R$ 200', monitor: 'R$ 75 por mês', combinado: 'R$ 275' });
    const ring = await input(sim, 'monitor').evaluate((el) => {
      for (let n = el, i = 0; n && i < 3; n = n.parentElement, i++) {
        const cs = getComputedStyle(n);
        if ((cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none')) return true;
      }
      return false;
    });
    const spin = await input(sim, 'monitor').evaluate((el) => ({
      role: el.getAttribute('role'),
      now: el.getAttribute('aria-valuenow'),
      min: el.getAttribute('aria-valuemin'),
      max: el.getAttribute('aria-valuemax'),
      inputMode: el.getAttribute('inputmode'),
      name: (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent.trim()).join(' '),
      description: document.getElementById(el.getAttribute('aria-describedby') ?? '')?.textContent.trim() ?? '',
    }));
    check(
      engine,
      'teclado-completo',
      same(r.figures, { ai: 'a partir de R$ 200', monitor: 'R$ 75 por mês', combinado: 'R$ 275' }) &&
        ring &&
        spin.role === 'spinbutton' &&
        spin.now === '1' &&
        spin.min === '0' &&
        spin.max === '50' &&
        spin.inputMode === 'numeric' &&
        spin.name === 'Nekkora Monitor Automações monitoradas' &&
        /^Limites provisórios, só desta simulação: até 50 automações por serviço e até 744 horas-máquina por sistema/.test(spin.description),
      `${JSON.stringify(r.figures)} · foco visível=${ring} · ${JSON.stringify(spin)}`,
    );
    // Região viva: anuncia a estimativa atualizada sem mover o foco
    const status = page.locator('[data-testid="status-simulador"]');
    const statusText = await status.innerText();
    check(
      engine,
      'estimativa-anunciada-em-regiao-viva',
      /^Estimativa atualizada\./.test(statusText) && statusText.includes('Investimento combinado estimado: R$ 275') && (await status.getAttribute('role')) === 'status',
      statusText.slice(0, 200),
    );
    // Tab percorre os controles do simulador em ordem (− campo + de cada um, depois "Limpar simulação")
    await btn(sim, 'ai', 'diminuir').focus();
    const order = [];
    for (let i = 0; i < 13; i++) {
      order.push(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.getAttribute('data-sim-input') || document.activeElement?.textContent?.trim()));
      await page.keyboard.press('Tab');
    }
    const expectedOrder = [
      'Diminuir automações solicitadas', 'ai', 'Aumentar automações solicitadas',
      'Diminuir automações monitoradas', 'monitor', 'Aumentar automações monitoradas',
      'Diminuir horas-máquina windows', 'windows', 'Aumentar horas-máquina windows',
      'Diminuir horas-máquina linux', 'linux', 'Aumentar horas-máquina linux',
      'Limpar simulação',
    ];
    check(engine, 'ordem-de-tab', same(order, expectedOrder), order.join(' → '));
    await ctx.close();
  }

  // 5. Celular, tema escuro, armazenamento, rede e acessibilidade ----------------------------------------------------
  for (const [name, viewport, theme] of [
    ['celular-claro', { width: 375, height: 812 }, 'sage-light'],
    ['celular-escuro', { width: 375, height: 812 }, 'sakura-dark'],
    ['celular-320', { width: 320, height: 640 }, 'sage-light'],
    ['tablet-claro', { width: 768, height: 1024 }, 'sage-light'],
    ['desktop-escuro', { width: 1280, height: 900 }, 'sakura-dark'],
  ]) {
    const { ctx, page, sim } = await open(prodUrl, { viewport, theme });
    const before = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie }));
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    await plus(sim, 'ai', 2);
    await plus(sim, 'monitor', 3);
    await setQ(sim, { windows: 10, linux: 20 });
    await waitFigures(sim, EXAMPLE);
    await clear(sim);
    await setQ(sim, EXAMPLE_Q);
    const r = await waitFigures(sim, EXAMPLE);
    const after = await page.evaluate(async () => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      cookie: document.cookie,
      idb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((d) => d.name) : [],
    }));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const offscreen = await sim.evaluate((el) =>
      [...el.querySelectorAll('button, a, input')].filter((b) => {
        const rr = b.getBoundingClientRect();
        return rr.right > innerWidth + 1 || rr.left < -1;
      }).length,
    );
    check(engine, `responsivo-sem-rolagem-horizontal:${name}`, overflow <= 0 && offscreen === 0 && same(r.figures, EXAMPLE), `excesso=${overflow}px; controles fora da tela=${offscreen}`);
    check(
      engine,
      `sem-armazenamento:${name}`,
      same(after.local, before.local) && after.local.every((k) => k === THEME_KEY) && same(after.session, before.session) && after.cookie === '' && after.idb.length === 0,
      `localStorage=${after.local.join(',') || '—'}; sessionStorage=${after.session.join(',') || '—'}; cookie=${after.cookie || '—'}; IndexedDB=${after.idb.join(',') || '—'}`,
    );
    check(engine, `sem-envio-externo:${name}`, requests.length === 0, requests.join(' | ') || 'nenhuma requisição durante a simulação');
    // Acessibilidade (axe, WCAG 2.1 AA) do simulador com a estimativa aberta
    await page.evaluate(axeSource);
    const axe = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const res = await axe.run(document.querySelector('[data-simulator]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return { violations: res.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`), contrast: res.incomplete.filter((i) => i.id === 'color-contrast').length };
    });
    check(engine, `axe-simulador:${name}`, axe.violations.length === 0, axe.violations.join(' | ') || `sem violações (${axe.contrast} nó(s) de contraste indeterminado)`);
    await shot(sim, `simulador-${name}`);
    await ctx.close();
  }

  // 6. Da simulação ao formulário de atendimento (§7): "Solicitar atendimento com esta simulação" abre o formulário com os
  // serviços que têm quantidade já marcados e a opção de incluir o resumo MOSTRADO, DESMARCADA por padrão (titular,
  // 20/11/2026): só entra na mensagem se o visitante marcar.
  // Nada é enviado pela página: o envio só prepara o link do WhatsApp (window.open registrado, nenhuma aba aqui).
  {
    const { ctx, page, sim } = await open(prodUrl);
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    const openFromSim = async () => {
      const cta = sim.locator('[data-atendimento-origem="simulador"]');
      await cta.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const attrs = await cta.evaluate((a) => ({ tag: a.tagName.toLowerCase(), href: a.getAttribute('href'), haspopup: a.getAttribute('aria-haspopup'), text: a.querySelector('.nk-button__label')?.textContent.trim() ?? a.textContent.trim() }));
      await cta.click();
      await page.waitForSelector('[data-atendimento]', { state: 'visible', timeout: 3000 });
      const d = await page.evaluate(() => {
        const dlg = document.querySelector('[data-atendimento]');
        return {
          services: [...dlg.querySelectorAll('[data-servico-interesse]')].filter((c) => c.checked).map((c) => c.getAttribute('data-servico-interesse')),
          include: dlg.querySelector('[data-incluir-simulacao]')?.checked ?? null,
          summary: dlg.querySelector('.request__message')?.textContent ?? null,
        };
      });
      return { attrs, ...d };
    };
    const submit = async (fields) => {
      await page.locator('[data-atendimento] [data-campo="name"]').fill(fields.name);
      await page.locator('[data-atendimento] [data-campo="description"]').fill(fields.description);
      const n = await page.evaluate(() => window.__nkOpen.length);
      await page.locator('[data-atendimento] button[type="submit"]').click();
      await page.waitForSelector('[data-atendimento-aberto]', { timeout: 3000 }).catch(() => {});
      const calls = await page.evaluate(() => window.__nkOpen);
      const call = calls.slice(n).at(-1) ?? null;
      const text = call ? new URL(call[0]).searchParams.get('text') : null;
      return { calls: calls.length - n, call, text };
    };
    const closeDialog = async () => {
      await page.keyboard.press('Escape');
      await page.waitForSelector('[data-atendimento]', { state: 'detached', timeout: 3000 });
    };
    const fields = { name: 'Ana Teste', description: 'Quero automatizar a conciliação.' };
    const base = `${GREETING}\n\nNome: Ana Teste\n\nDescrição do processo:\nQuero automatizar a conciliação.`;

    await setQ(sim, EXAMPLE_Q);
    await waitFigures(sim, EXAMPLE);
    const o1 = await openFromSim();
    check(
      engine,
      'formulario-recebe-servicos-e-resumo',
      o1.attrs.tag === 'a' &&
        o1.attrs.href === '#contato' &&
        o1.attrs.haspopup === 'dialog' &&
        o1.attrs.text.startsWith('Solicitar atendimento com esta simulação') &&
        same(o1.services, ['ai', 'monitor', 'hosting']) &&
        o1.include === false &&
        o1.summary === EXAMPLE_SUMMARY,
      `${o1.attrs.text}: serviços=[${o1.services.join(',')}]; incluir=${o1.include}; resumo=${JSON.stringify(o1.summary).slice(0, 160)}`,
    );
    await page.locator('[data-atendimento] [data-incluir-simulacao]').check();
    const s1 = await submit(fields);
    const expectedWith = `${base}\n\nServiços de interesse:\n- Nekkora AI (piloto)\n- Nekkora Monitor\n- Nekkora Hosting\n\nSimulação de investimento:\n${EXAMPLE_SUMMARY}`;
    check(engine, 'mensagem-com-a-simulacao', s1.calls === 1 && s1.text === expectedWith, `${s1.calls} chamada(s); ${JSON.stringify(s1.text).slice(0, 240)}`);
    await closeDialog();
    // Sem marcar (padrão): a simulação não entra na mensagem
    await page.locator('[data-atendimento-origem="simulador"]').click();
    await page.waitForSelector('[data-atendimento]', { state: 'visible' });
    const s2 = await submit(fields);
    const expectedWithout = `${base}\n\nServiços de interesse:\n- Nekkora AI (piloto)\n- Nekkora Monitor\n- Nekkora Hosting`;
    check(engine, 'mensagem-sem-a-simulacao-por-padrao', s2.calls === 1 && s2.text === expectedWithout && !/Simulação de investimento/.test(s2.text ?? ''), JSON.stringify(s2.text).slice(0, 240));
    await closeDialog();
    // Quantidades mudadas: o resumo e os serviços acompanham a estimativa da tela (nunca um resumo desatualizado)
    await clear(sim);
    await setQ(sim, { linux: 5 });
    const shown = await waitFigures(sim, { hosting: 'R$ 60', combinado: 'R$ 60' });
    const o3 = await openFromSim();
    const linuxSummary = `- Nekkora Hosting Linux: 5 horas × R$ 12 = R$ 60\nInvestimento combinado estimado: R$ 60 (${COMBINED_NOTE})`;
    check(
      engine,
      'resumo-acompanha-a-estimativa',
      same(shown.figures, { hosting: 'R$ 60', combinado: 'R$ 60' }) && same(o3.services, ['hosting']) && o3.include === false && o3.summary === linuxSummary,
      `serviços=[${o3.services.join(',')}]; resumo=${JSON.stringify(o3.summary)}`,
    );
    await shot(page.locator('[data-atendimento]'), 'formulario-com-simulacao');
    await closeDialog();
    // Só o AI: só o AI marcado
    await clear(sim);
    await plus(sim, 'ai');
    const o4 = await openFromSim();
    check(engine, 'servicos-marcados-pela-simulacao:so-ai', same(o4.services, ['ai']) && o4.summary?.startsWith('- Nekkora AI (piloto): 1 automação × R$ 100 = a partir de R$ 100\n'), `serviços=[${o4.services.join(',')}]`);
    await closeDialog();
    // Sem quantidade, sem CTA da simulação
    await clear(sim);
    check(engine, 'sem-simulacao-sem-cta', (await sim.locator('[data-atendimento-origem="simulador"]').count()) === 0, 'estimativa vazia: nenhum CTA com simulação');
    check(engine, 'formulario-sem-envio-pela-pagina', requests.length === 0, requests.join(' | ') || 'nenhuma requisição da página (o link do WhatsApp só é preparado)');
    // Sem agendamento nem e-mail no resultado
    await plus(sim, 'monitor');
    const semAgenda = await sim.locator('[data-sim-result]').evaluate((e) => ({
      links: e.querySelectorAll('a[data-agendar], a[href*="bookings"], a[href*="/book/"], a[href^="mailto:"], a[href*="wa.me"]').length,
      text: /Agendar|Bookings|Teams/.test(e.innerText),
    }));
    check(engine, 'resultado-sem-agendamento-nem-link-direto', semAgenda.links === 0 && !semAgenda.text, JSON.stringify(semAgenda));
    await ctx.close();
  }

  // 7. A mesma estimativa em qualquer data e em qualquer publicação (a campanha de lançamento é só histórico) -----------
  {
    const runs = [
      ...DATES.map((d) => [`producao-${d.id}`, prodUrl, d.at]),
      ['fixture-sintetica', fixtureUrl, AT],
      ['fixture-sem-datas-de-campanha', pendingUrl, AT],
      ['fixture-sem-datas-sem-aviso', pendingNoNoticeUrl, AT],
    ];
    for (const [id, url, at] of runs) {
      if (!url) continue;
      const { ctx, page, sim } = await open(url, { at });
      const cards = await page.evaluate(() => [...document.querySelectorAll('[data-pricing] [data-price]')].map((e) => `${e.getAttribute('data-price')}=${e.textContent.trim()}`).join(','));
      await setQ(sim, EXAMPLE_Q);
      const r = await waitFigures(sim, EXAMPLE);
      const campaign = await page.evaluate(() => document.querySelectorAll('.launch-strip, [data-campanha], [data-campanha-regras]').length);
      check(
        engine,
        `mesma-estimativa:${id}`,
        cards === 'ai=R$ 100,monitor=R$ 75,windows=R$ 25,linux=R$ 12' && same(r.figures, EXAMPLE) && campaign === 0 && !PREVIOUS.test(r.text),
        `${cards} · ${JSON.stringify(r.figures)} · marcadores de campanha=${campaign}`,
      );
      await ctx.close();
    }
  }

  check(engine, 'sem-requisicoes-externas', external.length === 0, external.join(' | ') || 'nenhuma');
  check(engine, 'console-sem-erros', errors.filter((e) => !/Download the React DevTools/.test(e)).length === 0, errors.join(' | ') || 'limpo');
  await browser.close();
}

for (const engine of engineList.split(',')) {
  try {
    await run(engine);
  } catch (e) {
    check(engine, 'execucao', false, String(e.message).split('\n')[0]);
  }
}
const failed = checks.filter((c) => !c.ok);
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ prodUrl, fixtureUrl, pendingUrl, pendingNoNoticeUrl, checks, shots }, null, 2));
writeFileSync(
  path.join(outDir, 'resumo.md'),
  [
    `# Homologação do simulador de investimento e da passagem ao formulário — ${new Date().toISOString()}`,
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
