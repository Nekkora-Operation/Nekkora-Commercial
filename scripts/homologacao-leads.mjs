#!/usr/bin/env node
/**
 * Homologação dos dois caminhos de contato da COM-RELEASE-005 em Chromium, Firefox e WebKit:
 *   - "Agendar conversa" (Microsoft Bookings, §4): botões, nome acessível, teclado, nova aba sem opener e sem Referer,
 *     serviço indisponível, celular, nenhuma afirmação de reunião marcada;
 *   - "Solicitar avaliação" com envio automático (§5.7): validação, revisão, desafio, envio, recebida, falhas (entrega,
 *     rede, limite, desafio, envio rápido demais), nova tentativa sem duplicidade, dados preservados, logs sem dados
 *     pessoais, celular e axe em cada estado.
 *
 * Tudo LOCAL e SINTÉTICO: build com scripts/fixtures/publicacao-homologacao-api.json, servido pelo CloudFront local com
 * a política gerada do próprio build (CSP com o backend local e o Turnstile), e o backend local com entrega SIMULADA:
 *   NEKKORA_PUBLICACAO=scripts/fixtures/publicacao-homologacao-api.json npx vite build --outDir dist-homologacao-api
 *   node scripts/servidor-cloudfront-local.mjs --dist dist-homologacao-api --porta 4177 --politica-do-build
 *   node scripts/api-local.mjs --porta 4178 --origem http://127.0.0.1:4177
 *   node scripts/homologacao-leads.mjs http://127.0.0.1:4177/ http://127.0.0.1:4178/ <pasta> [chromium,firefox,webkit]
 *
 * Nenhuma requisição sai da máquina: o script do Turnstile é substituído por um equivalente local de teste (que entrega
 * o token de teste da Cloudflare), a página do Bookings é respondida localmente e todo o resto é abortado. É uma
 * simulação: o Bookings real, o Turnstile real e o backend na AWS não foram exercitados.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , baseUrl = 'http://127.0.0.1:4177/', apiBase = 'http://127.0.0.1:4178/', outDir = 'docs/release/evidencias/leads', enginesArg = 'chromium,firefox,webkit'] = process.argv;
const require = createRequire(import.meta.url);
const playwright = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
mkdirSync(outDir, { recursive: true });

const fixture = JSON.parse(readFileSync('scripts/fixtures/publicacao-homologacao-api.json', 'utf8'));
const BOOKINGS = fixture.agendamento.url;
const ENDPOINT = fixture.envioAutomatico.endpoint;
const EMAIL = fixture.canais.email;
const origin = new URL(baseUrl).origin;
const apiOrigin = new URL(ENDPOINT).origin;
const IN_CAMPAIGN = new Date('2026-11-15T12:00:00-03:00');
const FORM = { name: 'Pessoa de Teste', company: 'Empresa Sintética', email: 'pessoa@exemplo.invalid', message: 'Conferimos todo dia os pagamentos do banco com o sistema financeiro, manualmente (teste de homologação).' };
const PII = [FORM.name, FORM.company, FORM.email, 'Conferimos todo dia', '127.0.0.1', 'XXXX.DUMMY.TOKEN.XXXX'];
/** Afirmações de reserva que só o Bookings pode fazer (o aviso de privacidade fala da "conversa agendada" em tese). */
const OVERCLAIM_BOOKING = /reuni[aã]o (foi |est[aá] )?(agendada|marcada|confirmada)|agendamento (confirmado|realizado|conclu[ií]do)|(sua|a) conversa (foi|est[aá]) (agendada|marcada|confirmada)/i;
/** Equivalente LOCAL do script do Turnstile: mesma API (render/reset/remove), entrega o token de teste da Cloudflare. */
const FAKE_TURNSTILE = `window.__turnstile = { renders: 0, resets: 0, opts: {} };
window.turnstile = {
  render(el, o) { const id = 'w' + (++window.__turnstile.renders); window.__turnstile.opts[id] = o; el.setAttribute('data-sitekey', o.sitekey);
    el.textContent = 'Verificação de segurança (simulada)'; setTimeout(() => o.callback('XXXX.DUMMY.TOKEN.XXXX'), 300); return id; },
  reset(id) { window.__turnstile.resets++; const o = window.__turnstile.opts[id]; setTimeout(() => o.callback('XXXX.DUMMY.TOKEN.XXXX'), 300); },
  remove() {},
};`;

const checks = [];
const check = (engine, id, ok, detail) => {
  checks.push({ engine, id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} [${engine}] ${id}${detail ? ` — ${detail}` : ''}`);
};
const api = async (p, init) => (await fetch(new URL(p, apiBase), init)).json();
const resetApi = () => api('/__teste/limpar', { method: 'POST' });
const mode = (q) => api(`/__teste/modo?${q}`, { method: 'POST' });

async function run(engine) {
  const shot = (name) => path.join(outDir, `${engine}-${name}`);
  const browser = await playwright[engine].launch();
  const aborted = [];
  const errors = [];
  const bookingRequests = [];
  const apiRequests = [];
  let bookingDown = false;
  let apiDown = false;
  let turnstileDown = false;

  async function newContext(viewport = { width: 1280, height: 800 }) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    // O relógio anda normalmente (o tempo de preenchimento é medido), a partir de uma data dentro da campanha.
    await ctx.clock.install({ time: IN_CAMPAIGN });
    if (engine === 'chromium') await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
    await ctx.addInitScript(() => {
      window.__openCalls = 0;
      const original = window.open;
      window.open = (...a) => {
        window.__openCalls++;
        return original.apply(window, a);
      };
      // mailto (alternativa por e-mail): registra e impede que um aplicativo real abra
      window.__mailto = [];
      document.addEventListener('click', (e) => {
        const a = e.target instanceof Element ? e.target.closest('a[href^="mailto:"]') : null;
        if (a) {
          window.__mailto.push(a.href);
          e.preventDefault();
        }
      }, true);
    });
    await ctx.route('**/*', async (route) => {
      const req = route.request();
      const url = req.url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank') return route.continue();
      if (url.startsWith(apiOrigin)) {
        apiRequests.push({ url, method: req.method(), headers: req.headers(), body: req.postData() });
        return apiDown ? route.abort('internetdisconnected') : route.continue();
      }
      if (url.startsWith('https://challenges.cloudflare.com/turnstile/v0/api.js')) {
        if (turnstileDown) return route.abort('internetdisconnected');
        return route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: FAKE_TURNSTILE });
      }
      if (url.startsWith('https://outlook.office365.com/')) {
        bookingRequests.push({ url, referer: req.headers()['referer'] ?? null });
        if (bookingDown) return route.abort('internetdisconnected');
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>Bookings (página de teste local)</title><h1>Microsoft Bookings — página de teste local</h1>' });
      }
      aborted.push(url);
      return route.abort();
    });
    return ctx;
  }
  const watch = (page) => {
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  };
  async function axe(page, selector) {
    await page.evaluate(axeSource);
    return page.evaluate(async (sel) => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(sel ? document.querySelector(sel) : document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return r.violations.map((v) => `${v.id}(${v.nodes.length}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
    }, selector);
  }
  async function fillForm(dialog, { email = FORM.email } = {}) {
    const form = dialog.locator('form');
    await form.getByLabel(/^Nome/).fill(FORM.name);
    await form.getByLabel(/^Empresa/).fill(FORM.company);
    await form.getByLabel(/^E-mail/).fill(email);
    await form.getByLabel(/Descreva o processo/).fill(FORM.message);
  }
  /** Abre o diálogo, preenche, revisa e espera o desafio; `wait` respeita o tempo mínimo de preenchimento (3 s). */
  async function toReview(page, { wait = true } = {}) {
    await page.locator('#contato [aria-haspopup="dialog"]').click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await fillForm(dialog);
    await dialog.locator('button[type="submit"]').click();
    await dialog.getByRole('heading', { name: 'Confirme a sua solicitação' }).waitFor();
    await page.waitForFunction(() => !document.querySelector('[data-testid="status-desafio"]')?.textContent.trim(), null, { timeout: 5000 }).catch(() => {});
    if (wait) await page.waitForTimeout(3300);
    return dialog;
  }
  const sendButton = (dialog) => dialog.getByRole('button', { name: /Enviar solicitação|Enviando/ });

  // 1. Agendamento ---------------------------------------------------------------------------------------------
  await resetApi();
  const ctx = await newContext();
  const page = await ctx.newPage();
  watch(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  check(engine, 'agendamento-configurado', (await page.getAttribute('[data-agendamento]', 'data-agendamento')) === 'configurado');
  const sched = await page.$$eval('a[data-agendar]', (els) =>
    els.map((a) => ({ section: a.closest('section')?.id ?? 'dialogo', href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '', name: a.textContent.replace(/\s+/g, ' ').trim() })),
  );
  check(engine, 'agendamento-botoes-nas-areas-de-conversao', JSON.stringify(sched.map((s) => s.section)) === JSON.stringify(['inicio', 'contato']), sched.map((s) => s.section).join(', '));
  check(engine, 'agendamento-url-oficial-configurada', sched.every((s) => s.href === BOOKINGS), BOOKINGS);
  check(engine, 'agendamento-nova-aba-isolada', sched.every((s) => s.target === '_blank' && s.rel.includes('noopener') && s.rel.includes('noreferrer')));
  const accName = await page.getByRole('link', { name: /Agendar conversa \(abre o Microsoft Bookings em outra aba\)/ }).count();
  check(engine, 'agendamento-nome-acessivel', accName === 2, `${accName} link(s) com o nome completo`);
  check(engine, 'agendamento-aviso-de-confirmacao', /A conversa só fica marcada quando o Bookings confirmar/.test(await page.locator('#contato').innerText()));
  await page.locator('#inicio').screenshot({ path: shot('agendamento-hero.png') });
  await page.locator('#contato').screenshot({ path: shot('agendamento-contato.png') });

  // teclado: foco no botão do contato e Enter
  const schedBtn = page.locator('#contato a[data-agendar]');
  await schedBtn.focus();
  const focusRing = await schedBtn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return document.activeElement === el && ((cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none');
  });
  check(engine, 'agendamento-foco-visivel', focusRing);
  const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  if (popup) await popup.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(300);
  const isolation = popup ? await popup.evaluate(() => ({ opener: window.opener === null, referrer: document.referrer, url: location.href })).catch((e) => ({ error: e.message })) : null;
  check(engine, 'agendamento-teclado-abre-bookings', isolation?.url === BOOKINGS, isolation?.url ?? 'nenhuma aba');
  check(engine, 'agendamento-sem-opener-e-sem-referer', isolation?.opener === true && isolation?.referrer === '' && bookingRequests.at(-1)?.referer == null, JSON.stringify({ ...isolation, refererHeader: bookingRequests.at(-1)?.referer ?? null }));
  if (popup) {
    await popup.screenshot({ path: shot('agendamento-bookings-pagina-de-teste.png') });
    await popup.close();
  }
  check(engine, 'agendamento-pagina-de-origem-intacta', page.url() === baseUrl && !OVERCLAIM_BOOKING.test(await page.locator('body').innerText()), 'nenhuma afirmação de reunião marcada');
  check(engine, 'agendamento-sem-window-open', (await page.evaluate(() => window.__openCalls)) === 0);

  // diálogo: o atalho de agendamento também está lá
  await page.locator('#inicio [aria-haspopup="dialog"]').click();
  const d0 = page.getByRole('dialog');
  await d0.waitFor();
  const dialogLink = d0.locator('a[data-agendar]');
  check(engine, 'agendamento-atalho-no-dialogo', (await dialogLink.count()) === 1 && (await dialogLink.getAttribute('href')) === BOOKINGS && (await dialogLink.getAttribute('rel'))?.includes('noreferrer'));
  await page.keyboard.press('Escape');
  await d0.waitFor({ state: 'detached' });

  // Bookings fora do ar: a aba nova falha, a página de origem continua igual e não afirma nada
  bookingDown = true;
  const p2 = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
  await page.locator('#inicio a[data-agendar]').click();
  const failed = await p2;
  if (failed) await failed.waitForLoadState().catch(() => {});
  await page.waitForTimeout(300);
  check(engine, 'agendamento-servico-indisponivel', page.url() === baseUrl && (await page.locator('#inicio a[data-agendar]').isVisible()) && !OVERCLAIM_BOOKING.test(await page.locator('body').innerText()), 'página de origem intacta; botão continua disponível para nova tentativa');
  if (failed) await failed.close();
  bookingDown = false;
  await ctx.close();

  // celular: os dois caminhos cabem, sem rolagem horizontal
  {
    const c = await newContext({ width: 375, height: 812 });
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const fit = await p.evaluate(() => {
      const vw = innerWidth;
      const boxes = [...document.querySelectorAll('#inicio .hero__ctas > *, #contato .contact__ctas > *')].map((e) => e.getBoundingClientRect());
      return { overflow: document.documentElement.scrollWidth - vw, inside: boxes.every((b) => b.left >= 0 && b.right <= vw && b.height >= 44), n: boxes.length };
    });
    check(engine, 'agendamento-celular', fit.overflow <= 0 && fit.inside && fit.n === 4, JSON.stringify(fit));
    await p.locator('#contato').screenshot({ path: shot('agendamento-contato-celular.png') });
    await c.close();
  }
  // axe na página com os botões de agendamento, nos dois temas (página recém-carregada, como na homologação geral)
  for (const theme of ['sage-light', 'sakura-dark']) {
    const c = await newContext();
    await c.addInitScript((t) => localStorage.setItem('nekkora-commercial-tema', t), theme);
    const p = await c.newPage();
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const v = await axe(p);
    check(engine, `pagina-axe-com-agendamento:${theme}`, v.length === 0, v.join(' | ') || 'sem violações');
    await c.close();
  }

  // 2. Envio automático: caminho feliz ---------------------------------------------------------------------------
  await resetApi();
  await mode('atraso=900');
  {
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    await p.locator('#contato [aria-haspopup="dialog"]').click();
    const dialog = p.getByRole('dialog');
    await dialog.waitFor();
    check(engine, 'envio-sem-atalho-de-canal', (await dialog.locator('a[href*="wa.me"], a[href^="mailto:"]').count()) === 0, 'o envio automático é o único mecanismo do formulário');
    await dialog.locator('button[type="submit"]').click();
    check(engine, 'envio-validacao-email-obrigatorio', (await dialog.locator('[aria-invalid="true"]').count()) === 3, 'nome, e-mail e descrição');
    // armadilha para robôs: fora da ordem de foco e escondida de leitores de tela
    const trap = await dialog.evaluate((d) => {
      const i = d.querySelector('input[name="site"]');
      return { tabIndex: i?.tabIndex, hidden: i?.closest('[aria-hidden="true"]') != null, offscreen: (i?.getBoundingClientRect().right ?? 0) < 0 };
    });
    check(engine, 'envio-armadilha-inacessivel-a-pessoas', trap.tabIndex === -1 && trap.hidden && trap.offscreen, JSON.stringify(trap));
    await fillForm(dialog);
    await p.screenshot({ path: shot('envio-1-formulario.png') });
    await dialog.locator('button[type="submit"]').click();
    await dialog.getByRole('heading', { name: 'Confirme a sua solicitação' }).waitFor();
    const reviewText = await dialog.innerText();
    check(engine, 'envio-revisao-mostra-dados-e-destino', reviewText.includes(FORM.name) && reviewText.includes(FORM.email) && /serviço da AWS/.test(reviewText) && /verificação de segurança/i.test(reviewText));
    const disabledBeforeToken = await sendButton(dialog).isDisabled();
    await p.waitForFunction(() => !document.querySelector('[data-testid="status-desafio"]')?.textContent.trim(), null, { timeout: 5000 }).catch(() => {});
    check(engine, 'envio-aguarda-desafio', disabledBeforeToken && (await sendButton(dialog).isEnabled()), 'botão desabilitado até o token do desafio');
    check(engine, 'envio-nada-enviado-antes-de-confirmar', apiRequests.length === 0, `${apiRequests.length} requisição(ões) à API`);
    await p.screenshot({ path: shot('envio-2-revisao.png') });
    {
      const v = await axe(p, '[role="dialog"]');
      check(engine, 'axe-revisao', v.length === 0, v.join(' | ') || 'sem violações');
    }
    await p.waitForTimeout(3300);
    await sendButton(dialog).click();
    // clique duplo durante o envio não gera segunda requisição
    await sendButton(dialog).click({ force: true, timeout: 1000 }).catch(() => {});
    const busy = await dialog.evaluate((d) => ({ busy: d.querySelector('[aria-busy="true"]') != null, status: d.querySelector('[data-testid="status-envio"]')?.textContent }));
    check(engine, 'envio-estado-enviando', busy.busy && /Enviando a solicitação/.test(busy.status ?? ''), JSON.stringify(busy));
    await p.screenshot({ path: shot('envio-3-enviando.png') });
    await dialog.getByTestId('solicitacao-recebida').waitFor({ timeout: 10000 });
    const outbox = await api('/__teste/caixa');
    const text = await dialog.innerText();
    const protocol = /Protocolo (NK-[0-9A-F]{8})/.exec(text)?.[1];
    check(engine, 'envio-recebida-so-com-confirmacao-do-servidor', /Solicitação recebida/.test(text) && protocol && outbox.length === 1 && outbox[0].subject.includes(protocol), `protocolo ${protocol}; ${outbox.length} mensagem(ns) na caixa simulada`);
    check(engine, 'envio-sem-duplicidade', apiRequests.filter((r) => r.method === 'POST').length === 1 && outbox.length === 1, `${apiRequests.filter((r) => r.method === 'POST').length} POST`);
    const post = apiRequests.find((r) => r.method === 'POST');
    const payload = JSON.parse(post?.body ?? '{}');
    check(engine, 'envio-dados-so-no-corpo', post?.url === ENDPOINT && /^application\/json/.test(post.headers['content-type'] ?? '') && ![FORM.name, FORM.company, FORM.email, FORM.message].some((v) => decodeURIComponent(post.url).includes(v)) && post.headers.cookie == null, `${post?.method} ${post?.url}`);
    check(engine, 'envio-conteudo-entregue', outbox[0]?.replyTo === FORM.email && outbox[0]?.text.includes(FORM.message) && payload.nome === FORM.name && payload.site === '' && payload.preenchimentoMs >= 3000, `Reply-To=${outbox[0]?.replyTo}; preenchimento=${payload.preenchimentoMs} ms`);
    await p.screenshot({ path: shot('envio-4-recebida.png') });
    {
      const v = await axe(p, '[role="dialog"]');
      check(engine, 'axe-recebida', v.length === 0, v.join(' | ') || 'sem violações');
    }
    await dialog.locator('.request__actions').getByRole('button', { name: 'Fechar' }).click();
    await dialog.waitFor({ state: 'detached' });
    await p.locator('#contato [aria-haspopup="dialog"]').click();
    await dialog.waitFor();
    check(engine, 'envio-novo-atendimento-com-formulario-vazio', (await dialog.locator('form').getByLabel(/^Nome/).inputValue()) === '');
    await c.close();
  }
  await mode('atraso=0');

  // 3. Falha da entrega → dados preservados → nova tentativa com o mesmo id, uma única entrega --------------------
  await resetApi();
  apiRequests.length = 0;
  {
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    await mode('entrega=temporaria');
    const dialog = await toReview(p);
    await sendButton(dialog).click();
    await dialog.getByTestId('solicitacao-falhou').waitFor({ timeout: 10000 });
    const t = await dialog.innerText();
    check(engine, 'falha-entrega-mensagem-clara', /A solicitação não foi enviada/.test(t) && /falha temporária/.test(t) && !/Solicitação recebida/.test(t));
    check(engine, 'falha-alternativa-por-email', t.includes(EMAIL) && (await dialog.getByRole('link', { name: 'Abrir no e-mail' }).getAttribute('href'))?.startsWith(`mailto:${EMAIL}?`));
    check(engine, 'falha-dados-preservados-no-resumo', t.includes(FORM.name) && t.includes(FORM.message));
    await p.screenshot({ path: shot('falha-1-entrega.png') });
    {
      const v = await axe(p, '[role="dialog"]');
      check(engine, 'axe-falha', v.length === 0, v.join(' | ') || 'sem violações');
    }
    await mode('entrega=ok');
    await dialog.getByRole('button', { name: 'Tentar novamente' }).click();
    await dialog.getByTestId('solicitacao-recebida').waitFor({ timeout: 10000 });
    const ids = apiRequests.filter((r) => r.method === 'POST').map((r) => JSON.parse(r.body).idSolicitacao);
    const outbox = await api('/__teste/caixa');
    check(engine, 'falha-nova-tentativa-mesmo-id-uma-entrega', ids.length === 2 && ids[0] === ids[1] && outbox.length === 1, `ids: ${ids.map((i) => i.slice(0, 8)).join(', ')}; ${outbox.length} entrega(s)`);
    await c.close();
  }

  // 4. Rede fora do ar, voltar e editar preserva os dados ---------------------------------------------------------
  await resetApi();
  {
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    apiDown = true;
    const dialog = await toReview(p);
    await sendButton(dialog).click();
    await dialog.getByTestId('solicitacao-falhou').waitFor({ timeout: 25000 });
    check(engine, 'falha-rede-mensagem-clara', /Não conseguimos falar com o servidor/.test(await dialog.innerText()) && !/Solicitação recebida/.test(await dialog.innerText()));
    await p.screenshot({ path: shot('falha-2-rede.png') });
    apiDown = false;
    await dialog.getByRole('button', { name: 'Voltar e editar' }).click();
    check(engine, 'falha-voltar-e-editar-preserva-dados', (await dialog.locator('form').getByLabel(/Descreva o processo/).inputValue()) === FORM.message && (await dialog.locator('form').getByLabel(/^E-mail/).inputValue()) === FORM.email);
    await c.close();
  }

  // 5. Limite de requisições (429) ----------------------------------------------------------------------------------
  await resetApi();
  {
    // cinco envios diretos à API (mesma origem de rede) esgotam o limite por hora
    for (let i = 1; i <= 5; i++) {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin },
        body: JSON.stringify({ idSolicitacao: `${String(i).padStart(8, '0')}-0000-4000-8000-000000000000`, nome: 'Teste Limite', email: 'limite@exemplo.invalid', empresa: '', descricao: 'Descrição sintética para o teste de limite.', desafio: 'XXXX.DUMMY.TOKEN.XXXX', preenchimentoMs: 9000, site: '' }),
      });
    }
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const dialog = await toReview(p);
    await sendButton(dialog).click();
    await dialog.getByTestId('solicitacao-falhou').waitFor({ timeout: 10000 });
    const t = await dialog.innerText();
    check(engine, 'falha-limite-429', /muitas solicitações em pouco tempo/.test(t) && t.includes(EMAIL));
    await c.close();
  }

  // 6. Desafio recusado → refeito → enviado; envio rápido demais → recusado ----------------------------------------
  await resetApi();
  {
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    await mode('desafio=recusado');
    const dialog = await toReview(p);
    await sendButton(dialog).click();
    await dialog.getByTestId('solicitacao-falhou').waitFor({ timeout: 10000 });
    const retry = dialog.getByRole('button', { name: 'Tentar novamente' });
    // o token recusado é descartado: a nova tentativa espera o desafio ser refeito
    const blocked = await retry.isDisabled();
    check(engine, 'falha-desafio-mensagem', /verificação de segurança/.test(await dialog.innerText()) && blocked, `"Tentar novamente" desabilitado até novo token: ${blocked}`);
    await mode('desafio=ok');
    await p.waitForFunction(() => window.__turnstile.renders + window.__turnstile.resets >= 2 && !document.querySelector('[data-testid="status-desafio"]')?.textContent.trim(), null, { timeout: 5000 }).catch(() => {});
    await retry.click();
    await dialog.getByTestId('solicitacao-recebida').waitFor({ timeout: 10000 });
    const t = await p.evaluate(() => window.__turnstile);
    check(engine, 'falha-desafio-refeito-e-enviado', t.renders + t.resets >= 2 && (await api('/__teste/caixa')).length === 1, `desafio feito ${t.renders + t.resets} vez(es); 1 entrega`);
    await c.close();
  }
  await resetApi();
  {
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const dialog = await toReview(p, { wait: false });
    await sendButton(dialog).click();
    await dialog.getByTestId('solicitacao-falhou').waitFor({ timeout: 10000 });
    const t = await dialog.innerText();
    check(engine, 'envio-rapido-demais-recusado', /Não foi possível enviar esta solicitação/.test(t) && (await dialog.getByRole('button', { name: 'Tentar novamente' }).count()) === 0 && (await api('/__teste/caixa')).length === 0, 'robô simples: recusado sem e-mail; sem "tentar novamente"');
    await c.close();
  }

  // 7. Desafio indisponível (script da Cloudflare fora do ar): sem envio, alternativa por e-mail -------------------
  turnstileDown = true;
  {
    const c = await newContext();
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    await p.locator('#contato [aria-haspopup="dialog"]').click();
    const dialog = p.getByRole('dialog');
    await fillForm(dialog);
    await dialog.locator('button[type="submit"]').click();
    await p.waitForFunction(() => /não carregou/.test(document.querySelector('[data-testid="status-desafio"]')?.textContent ?? ''), null, { timeout: 8000 }).catch(() => {});
    const t = await dialog.innerText();
    check(engine, 'desafio-indisponivel-sem-envio-com-alternativa', /não carregou/.test(t) && (await sendButton(dialog).isDisabled()) && t.includes(EMAIL));
    await p.screenshot({ path: shot('desafio-indisponivel.png') });
    await c.close();
  }
  turnstileDown = false;

  // 8. Celular (375 px): revisão e resultado cabem na tela -------------------------------------------------------
  await resetApi();
  {
    const c = await newContext({ width: 375, height: 812 });
    const p = await c.newPage();
    watch(p);
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const dialog = await toReview(p);
    const fit = async () =>
      p.evaluate(() => {
        const d = document.querySelector('[role="dialog"]').getBoundingClientRect();
        return { page: document.documentElement.scrollWidth - innerWidth, left: Math.round(d.left), right: Math.round(d.right) };
      });
    const review = await fit();
    await p.screenshot({ path: shot('celular-revisao.png') });
    await sendButton(dialog).click();
    await dialog.getByTestId('solicitacao-recebida').waitFor({ timeout: 10000 });
    const done = await fit();
    await p.screenshot({ path: shot('celular-recebida.png') });
    check(engine, 'celular-envio-cabe', [review, done].every((f) => f.page <= 0 && f.left >= 0 && f.right <= 375), JSON.stringify({ review, done }));
    const v = await axe(p, '[role="dialog"]');
    check(engine, 'celular-axe-recebida', v.length === 0, v.join(' | ') || 'sem violações');
    await c.close();
  }

  // 9. Logs do backend sem dados pessoais ----------------------------------------------------------------------------
  const logs = await api('/__teste/logs');
  const leaked = logs.filter((l) => PII.some((v) => l.includes(v)));
  check(engine, 'logs-sem-dados-pessoais', logs.length > 0 && leaked.length === 0, `${logs.length} linha(s); com dado pessoal: ${leaked.length}`);
  check(engine, 'sem-requisicao-externa-real', aborted.length === 0, aborted.join(' | ') || 'Turnstile e Bookings respondidos localmente; nada mais saiu');
  const realErrors = errors.filter((e) => !/Download the React DevTools/.test(e) && !/Failed to load resource|net::ERR_INTERNET_DISCONNECTED|NetworkError|Load failed|internetdisconnected|turnstile|CORS request did not succeed/i.test(e));
  check(engine, 'console-sem-erros', realErrors.length === 0, realErrors.join(' | ') || 'limpo (falhas de rede provocadas pelos testes desconsideradas)');
  const version = browser.version();
  await browser.close();
  return { engine, version };
}

const runs = [];
for (const engine of enginesArg.split(',')) {
  try {
    runs.push(await run(engine));
  } catch (e) {
    check(engine, 'execucao', false, String(e.message).split('\n')[0]);
  }
}
const failed = checks.filter((c) => !c.ok).length;
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ baseUrl, apiBase, at: new Date().toISOString(), runs, checks, summary: { total: checks.length, failed } }, null, 2));
const md = [
  `# Agendamento e envio automático (COM-RELEASE-005) — ${new Date().toISOString()}`,
  '',
  `URL: ${baseUrl} · backend local ${apiBase} (entrega simulada) · ${runs.map((r) => `${r.engine} ${r.version}`).join(' · ')} · ${checks.length} verificações · ${failed} falha(s)`,
  '',
  'Simulação local: Bookings, Turnstile e backend na AWS não foram exercitados.',
  '',
  '| Navegador | Verificação | Resultado | Detalhe |',
  '|---|---|---|---|',
  ...checks.map((c) => `| ${c.engine} | ${c.id} | ${c.ok ? 'OK' : '**FALHA**'} | ${String(c.detail ?? '').replace(/\|/g, '\\|').slice(0, 200)} |`),
].join('\n');
writeFileSync(path.join(outDir, 'resumo.md'), md + '\n');
console.log(`\n${checks.length} verificações, ${failed} falha(s).`);
process.exit(failed ? 1 : 0);
