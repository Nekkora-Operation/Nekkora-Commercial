#!/usr/bin/env node
/**
 * Homologação do Simulador de Investimento (NEKKORA-CALC-001) e do formulário de avaliação (NEKKORA-COM-008-C §8) em
 * navegador real (Playwright: Chromium, Firefox, WebKit).
 *
 * Uso (dois builds servidos como no CloudFront — veja .github/workflows/ci.yml):
 *   node scripts/homologacao-simulador.mjs <url de produção> <url da fixture com datas> <pasta> [chromium,firefox,webkit]
 *
 *   - produção (publicacao.json real): campanha SEM datas → prévia de homologação; e-mail e Bookings oficiais;
 *   - fixture (scripts/fixtures/publicacao-homologacao.json): datas sintéticas 01/11 a 31/12/2026 → relógio do navegador
 *     fixado antes, durante e depois da campanha.
 *
 * Nada sai do localhost: qualquer outra requisição é abortada e reprova. Nenhum formulário é enviado: a jornada para na
 * etapa de confirmação, antes de abrir o e-mail ou o WhatsApp.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , prodUrl = 'http://127.0.0.1:4173/', fixtureUrl = 'http://127.0.0.1:4175/', outDir = 'evidencias/simulador', engineList = 'chromium,firefox,webkit'] = process.argv;
const require = createRequire(import.meta.url);
const playwright = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
mkdirSync(outDir, { recursive: true });

const OFFICIAL_BOOKINGS = JSON.parse(readFileSync('publicacao.json', 'utf8')).agendamento.url;
const THEME_KEY = 'nekkora-commercial-tema';
const DISCLAIMER =
  'Esta simulação é uma estimativa baseada nas categorias selecionadas. A classificação, o escopo e o investimento definitivo serão confirmados na avaliação e registrados em proposta comercial.';
// Exemplo obrigatório da missão, digitado aqui de propósito (independente do código)
const EXAMPLE = { estimativa: 'R$ 4.800', padrao: 'R$ 6.500', economia: 'R$ 1.700', percentual: '26,15%' };
const AT = {
  vigente: new Date('2026-11-15T12:00:00-03:00'),
  futura: new Date('2026-10-31T23:30:00-03:00'),
  encerrada: new Date('2027-01-01T00:30:00-03:00'),
  // produção sem datas: qualquer dia
  pendente: new Date('2026-11-15T12:00:00-03:00'),
};

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
  async function open(url, { at = AT.vigente, viewport = { width: 1280, height: 900 }, theme = null } = {}) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await ctx.clock.setFixedTime(at);
    if (theme) await ctx.addInitScript(([k, t]) => localStorage.setItem(k, t), [THEME_KEY, theme]);
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

  // 1. Integração, estado inicial e consistência com os cartões (produção) -------------------------------------------
  {
    const { ctx, page, sim } = await open(prodUrl);
    const place = await page.evaluate(() => {
      const s = document.querySelector('[data-simulator]');
      const cards = document.querySelector('#precos .cards--3');
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
      total: el.querySelector('[data-sim-total]')?.getAttribute('data-sim-total'),
      result: !!el.querySelector('[data-sim-result]'),
      minusDisabled: [...el.querySelectorAll('[data-sim-action="diminuir"]')].every((b) => b.getAttribute('aria-disabled') === 'true'),
    }));
    check(engine, 'inicia-com-zero', JSON.stringify(initial.values) === '["0","0","0"]' && initial.total === '0' && !initial.result && initial.minusDisabled, JSON.stringify(initial));
    await shot(sim, 'simulador-inicial-producao');
    // 12. Datas pendentes (produção): prévia de homologação, sem elegibilidade
    await plus(sim, 'simples', 2);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const res = await sim.locator('[data-sim-result]').evaluate((e) => ({ state: e.dataset.simResult, launch: e.dataset.simLaunch, text: e.innerText }));
    check(engine, 'calculo-exemplo-obrigatorio', JSON.stringify(f) === JSON.stringify(EXAMPLE), JSON.stringify(f));
    check(engine, 'datas-pendentes-previa-sem-elegibilidade', res.state === 'pendente' && res.launch === 'sim' && /Prévia para revisão: as datas da campanha ainda não foram definidas\. Nenhuma solicitação é elegível antes do início oficial\./.test(res.text), res.state);
    check(engine, 'aviso-de-transparencia', res.text.includes(DISCLAIMER) && /não é uma economia operacional comprovada/.test(res.text), 'texto obrigatório e economia comercial ≠ operacional');
    // 19. Consistência com os cartões: o preço unitário de cada linha é o do cartão
    const cards = await page.evaluate(() => ({
      simples: document.querySelector('[data-price-tier="simples"] [data-price="lancamento"]')?.textContent.trim(),
      media: document.querySelector('[data-price-tier="media"] [data-price="lancamento"]')?.textContent.trim(),
      lines: [...document.querySelectorAll('[data-sim-line]')].map((l) => `${l.dataset.simLine}:${l.innerText.replace(/\s+/g, ' ')}`),
      units: [...document.querySelectorAll('[data-sim-tier] .sim__tier-unit')].map((u) => u.textContent.trim()),
    }));
    check(
      engine,
      'consistente-com-os-cartoes',
      cards.units[0] === `${cards.simples} cada` && cards.units[1] === `${cards.media} cada` && cards.lines[0].includes(`× ${cards.simples}`) && cards.lines[1].includes(`× ${cards.media}`),
      `${cards.units.join(' · ')} | ${cards.lines.join(' · ')}`,
    );
    // Caminhos após a simulação: Bookings oficial em nova aba, sem opener/Referer; avaliação abre o formulário
    const bookings = await sim.locator('[data-sim-result] a[data-agendar]').evaluate((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel, text: a.textContent }));
    check(engine, 'agendar-uma-conversa-bookings-oficial', bookings.href === OFFICIAL_BOOKINGS && bookings.target === '_blank' && /noopener/.test(bookings.rel) && /noreferrer/.test(bookings.rel) && /Agendar uma conversa/.test(bookings.text), JSON.stringify(bookings));
    const status = await page.locator('[data-testid="status-simulador"]').innerText();
    check(engine, 'resultado-anunciado-em-regiao-viva', /Resultado da simulação atualizado\./.test(status) && (await page.locator('[data-testid="status-simulador"]').getAttribute('role')) === 'status', status.slice(0, 120));
    await shot(sim, 'simulador-pendente-producao');
    await ctx.close();
  }

  // 9–11. Estados da campanha com datas (fixture) -------------------------------------------------------------------
  for (const state of ['vigente', 'futura', 'encerrada']) {
    const { ctx, sim } = await open(fixtureUrl, { at: AT[state] });
    await plus(sim, 'simples', 2);
    await plus(sim, 'media');
    await calc(sim);
    const f = await figures(sim);
    const res = await sim.locator('[data-sim-result]').evaluate((e) => ({ state: e.dataset.simResult, launch: e.dataset.simLaunch, text: e.innerText }));
    const units = await sim.locator('.sim__tier-unit').allInnerTexts();
    if (state === 'vigente') {
      check(engine, 'campanha-vigente-precos-de-lancamento', res.state === 'vigente' && res.launch === 'sim' && JSON.stringify(f) === JSON.stringify(EXAMPLE) && units[0] === 'R$ 1.000 cada', JSON.stringify(f));
    } else {
      check(
        engine,
        `campanha-${state}-so-preco-padrao`,
        res.state === state && res.launch === 'nao' && JSON.stringify(f) === JSON.stringify({ estimativa: 'R$ 6.500' }) && !/Economia|Desconto|lançamento em vigor|R\$ 1\.000|R\$ 2\.800/.test(res.text) && units[0] === 'R$ 1.500 cada',
        `${JSON.stringify(f)} · ${res.text.split('\n')[1]}`,
      );
    }
    await shot(sim, `simulador-${state}`);
    await ctx.close();
  }

  // 8, 13, 14. Complexas, proteção de entradas, teclado, recalcular, limpar --------------------------------------------
  {
    const { ctx, page, sim } = await open(fixtureUrl);
    // só complexas: nenhum valor
    await plus(sim, 'complexa', 2);
    await calc(sim);
    let f = await figures(sim);
    let text = await sim.locator('[data-sim-result]').innerText();
    check(engine, 'so-complexas-sem-valor-inventado', JSON.stringify(f) === JSON.stringify({ 'sob-orcamento': 'Automações complexas têm orçamento individual, definido na avaliação. Por isso, esta simulação não mostra um valor.' }) && !/R\$/.test(text), text.split('\n').slice(1, 4).join(' · '));
    await shot(sim, 'simulador-so-complexas');
    // recalcular: mudar a quantidade esconde o resultado até novo cálculo (nunca um valor desatualizado)
    await plus(sim, 'simples', 2);
    await plus(sim, 'media');
    const staleShown = await sim.locator('[data-sim-result]').count();
    const staleNote = await sim.locator('.sim__warning', { hasText: 'As quantidades mudaram.' }).count();
    await calc(sim);
    f = await figures(sim);
    text = await sim.locator('[data-sim-result]').innerText();
    check(engine, 'alterar-e-recalcular', staleShown === 0 && staleNote === 1 && f.estimativa === 'R$ 4.800', `resultado oculto após mudança=${staleShown === 0}; aviso=${staleNote}`);
    check(
      engine,
      'complexas-com-outras-subtotal-estimado',
      /Subtotal estimado com preços de lançamento/.test(text) && /não é o preço completo da contratação/.test(text) && /2 automações complexas\s+sob orçamento individual/.test(text),
      text.match(/As automações complexas[^.]*\./)?.[0],
    );
    await shot(sim, 'simulador-misto-com-complexas');
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
    check(engine, 'limpar-e-calcular-vazio', JSON.stringify(cleared.values) === '["0","0","0"]' && !cleared.result && empty === 1, JSON.stringify(cleared));
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
    check(engine, 'teclado-completo', f.estimativa === 'R$ 4.800' && ring && spin.role === 'spinbutton' && spin.now === '1' && spin.max === '20' && spin.name === 'Automações médias', `${JSON.stringify(f)} · foco visível=${ring} · ${JSON.stringify(spin)}`);
    // Tab percorre os controles do simulador em ordem e com foco visível
    await sim.locator('[data-sim-tier="simples"] [data-sim-action="diminuir"]').focus();
    const order = [];
    for (let i = 0; i < 11; i++) {
      order.push(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.getAttribute('data-sim-input') || document.activeElement?.textContent?.trim()));
      await page.keyboard.press('Tab');
    }
    check(
      engine,
      'ordem-de-tab',
      JSON.stringify(order.slice(0, 11)) ===
        JSON.stringify(['Diminuir automações simples', 'simples', 'Aumentar automações simples', 'Diminuir automações médias', 'media', 'Aumentar automações médias', 'Diminuir automações complexas', 'complexa', 'Aumentar automações complexas', 'Limpar simulação', 'Calcular meu investimento']),
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
    await plus(sim, 'simples', 2);
    await plus(sim, 'media');
    await plus(sim, 'complexa');
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

  // 18. Integração com o formulário de avaliação (produção: e-mail) -------------------------------------------------
  {
    const { ctx, page, sim } = await open(prodUrl);
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    await plus(sim, 'simples', 2);
    await plus(sim, 'media');
    await calc(sim);
    await sim.locator('[data-sim-result]').getByRole('link', { name: 'Solicitar avaliação' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    const offer = dialog.locator('[data-testid="resumo-simulacao"]');
    // o resumo entra no diálogo logo depois da abertura (efeito do React): espera o bloco antes de ler
    await offer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const box = offer.getByRole('checkbox');
    const offered = { visible: await offer.isVisible(), checked: await box.isChecked(), text: await offer.locator('pre').innerText() };
    check(
      engine,
      'formulario-recebe-resumo-opcional',
      offered.visible && !offered.checked && /2 automações simples \(R\$ 1\.000 cada\)/.test(offered.text) && /1 automação média \(R\$ 2\.800 cada\)/.test(offered.text) && /R\$ 4\.800/.test(offered.text),
      `desmarcado por padrão=${!offered.checked}`,
    );
    await shot(dialog, 'formulario-com-resumo-da-simulacao');
    const form = dialog.locator('form');
    await form.getByLabel(/^Nome/).fill('Pessoa de Teste');
    await form.getByLabel(/Descreva o processo/).fill('Conciliação manual diária entre banco e sistema financeiro (teste).');
    await dialog.locator('button[type="submit"]').click();
    let msg = await dialog.locator('[data-testid="mensagem-solicitacao"]').innerText();
    const without = !/Simulação feita no site/.test(msg);
    await dialog.getByRole('button', { name: 'Voltar e editar' }).click();
    await dialog.locator('[data-testid="resumo-simulacao"]').getByRole('checkbox').check();
    await dialog.locator('button[type="submit"]').click();
    msg = await dialog.locator('[data-testid="mensagem-solicitacao"]').innerText();
    const mailto = await dialog.getByRole('link', { name: 'Abrir no e-mail' }).getAttribute('href');
    check(
      engine,
      'resumo-so-com-a-escolha-e-revisado-antes',
      without && /Simulação feita no site \(estimativa, sujeita à avaliação\):\n- 2 automações simples/.test(msg) && decodeURIComponent(mailto).includes('Simulação feita no site') && requests.length === 0,
      `sem marcar: ausente=${without}; marcado: na mensagem e no mailto; requisições=${requests.length}`,
    );
    await shot(dialog, 'formulario-confirmacao-com-simulacao');
    await ctx.close();
  }

  // AUD-25. Hosting: o diálogo abre com a hospedagem marcada e a mensagem diz o tipo de solicitação --------------------
  {
    const { ctx, page } = await open(prodUrl);
    await page.locator('#hosting [aria-haspopup="dialog"]').click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    const checked = await dialog.getByRole('radio', { name: 'Hospedar uma automação existente' }).isChecked();
    // fechado e reaberto por outro CTA (sem tipo), a escolha continua
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    await page.locator('#inicio [aria-haspopup="dialog"]').click();
    await dialog.waitFor();
    const hostingKept = await dialog.getByRole('radio', { name: 'Hospedar uma automação existente' }).isChecked();
    check(engine, 'tipo-escolhido-preservado-ao-reabrir', hostingKept, 'reaberto pelo topo, a escolha anterior continua');
    const description = await dialog.evaluate((d) => (d.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' '));
    const form = dialog.locator('form');
    await form.getByLabel(/^Nome/).fill('Pessoa de Teste');
    await form.getByLabel(/Descreva o processo/).fill('Temos um robô em Python que roda num computador do escritório (teste).');
    await dialog.locator('button[type="submit"]').click();
    const msg = await dialog.locator('[data-testid="mensagem-solicitacao"]').innerText();
    check(
      engine,
      'hosting-formulario-adequado',
      checked && /hospedagem de uma automação existente/.test(description) && /Quero solicitar uma avaliação de viabilidade para hospedar uma automação existente \(Nekkora Hosting\)\./.test(msg),
      `hospedagem marcada=${checked}`,
    );
    await shot(dialog, 'formulario-hosting');
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
    `# Homologação do simulador e do formulário — ${new Date().toISOString()}`,
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
