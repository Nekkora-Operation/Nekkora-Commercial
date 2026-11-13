#!/usr/bin/env node
/**
 * Jornada de atendimento pelo WhatsApp (NEKKORA-COM-CANAIS-001, titular, 12/11/2026) — em Chromium, Firefox e WebKit.
 *
 * O WhatsApp é o único canal público de atendimento comercial: a página não tem formulário, diálogo de solicitação,
 * jornada por e-mail (mailto), agendamento (Microsoft Bookings) nem envio automático (API). Esta homologação substitui a
 * antiga jornada de conversão (formulário → confirmação → WhatsApp/e-mail) e a de scripts/homologacao-leads.mjs
 * (Bookings e envio automático), comprovando a AUSÊNCIA de cada um desses caminhos:
 *
 *   - cada CTA (data-whatsapp = geral, delivery, hosting, monitor, ai) abre wa.me/<número da publicação> com a mensagem
 *     EXATA do contexto, em outra aba, sem opener e sem Referer; o clique não abre diálogo nem envia nada;
 *   - o CTA do simulador leva a mensagem do Delivery + o resumo da simulação mostrada na tela;
 *   - botão flutuante "Fale com um analista": texto, ícone, destino, sem pulso, contraste ≥ 4,5:1 nos dois temas, área
 *     de toque, posição, não cobre o rodapé, recolhido no celular com o contato na tela, foco pelo teclado;
 *   - Monitor e AI "Em preparação", com pedido de informação (nunca contratação);
 *   - LinkedIn e Instagram (redes institucionais) com as URLs exatas da publicação, em outra aba;
 *   - nenhum form, diálogo, mailto, link do Bookings, "Agendar", instrução de envio por e-mail nem requisição a API.
 *
 * Uso (builds servidos como no CloudFront — veja .github/workflows/ci.yml):
 *   node scripts/homologacao-canais.mjs <url> <pasta-de-saida> [chromium,firefox,webkit]
 *
 * Os valores esperados vêm do publicacao.json com que o build servido foi feito (release.json → "publicacao"):
 *   - produção (dist, publicacao.json real);
 *   - fixture sintética (scripts/fixtures/publicacao-homologacao.json): número fictício; Instagram apontando para a
 *     página inicial, que precisa ser REJEITADO (não vira link);
 *   - fixture NEGATIVA (scripts/fixtures/publicacao-homologacao-api.json): URL do Bookings e endpoint de envio automático
 *     configurados, servida com a política do próprio build (--politica-do-build, CSP liberando o endpoint) — mesmo
 *     assim, nenhum formulário, agendamento ou requisição ao endpoint.
 *
 * Nenhuma requisição sai da máquina: o wa.me é respondido por uma página local de teste (registrando URL e Referer) e
 * todo o resto fora da origem servida é abortado e reprova.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { BOOKINGS_HOSTS } from './comercial/agendamento-url.mjs';

const [, , baseUrl = 'http://127.0.0.1:4175/', outDir = 'docs/release/evidencias/conversao', enginesArg = 'chromium,firefox,webkit'] = process.argv;
const modules = process.env.NEKKORA_PW_MODULES;
const require = createRequire(modules ? path.resolve(modules, 'noop.js') : import.meta.url);
const playwright = require('playwright');
mkdirSync(outDir, { recursive: true });

// Publicação com que o artefato servido foi feito
const release = await fetch(new URL('release.json', baseUrl), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
if (!release?.publicacao) throw new Error(`release.json ausente ou sem "publicacao" em ${baseUrl}`);
const publicacao = JSON.parse(readFileSync(release.publicacao, 'utf8'));
const NUMBER = publicacao.canais.whatsapp;
if (!/^\d{12,13}$/.test(NUMBER ?? '')) throw new Error(`${release.publicacao}: WhatsApp ausente ou inválido (${NUMBER}) — a página não teria atendimento`);

/**
 * Mensagens iniciais por contexto — digitadas aqui de propósito (independentes do código), iguais a WHATSAPP_MESSAGES de
 * src/config.ts; conferidas contra o código-fonte antes de qualquer navegador abrir: se o texto mudar, a homologação
 * falha em vez de aceitar a mensagem nova sem revisão.
 */
const MESSAGES = {
  geral: 'Olá! Gostaria de conversar com um analista da Nekkora.',
  delivery: 'Olá! Tenho interesse em desenvolver automações com a Nekkora.',
  hosting: 'Olá! Tenho interesse em hospedagem de automações com a Nekkora e gostaria de saber como funciona a avaliação de viabilidade.',
  monitor: 'Olá! Gostaria de receber informações sobre o Nekkora Monitor quando ele estiver disponível.',
  ai: 'Olá! Gostaria de receber informações sobre o Nekkora AI quando ele estiver disponível.',
};
/** Frase que antecede o resumo da simulação (SIMULATOR.whatsappIntro, src/content.ts). */
const SIM_INTRO = 'Fiz esta simulação na página:';
const SR_SUFFIX = '(abre o WhatsApp em outra aba)';
const FAB_TEXT = 'Fale com um analista';
{
  const config = readFileSync('src/config.ts', 'utf8');
  for (const [ctx, msg] of Object.entries(MESSAGES)) if (!config.includes(`${ctx}: '${msg}'`)) throw new Error(`src/config.ts: mensagem "${ctx}" diverge da homologação`);
  if (!readFileSync('src/content.ts', 'utf8').includes(`whatsappIntro: '${SIM_INTRO}'`)) throw new Error('src/content.ts: whatsappIntro diverge da homologação');
}
/** Onde cada CTA fica (seção:contexto), na ordem do documento — o botão flutuante por último. */
const EXPECTED_CTAS = ['inicio:geral', 'precos:delivery', 'precos:monitor', 'precos:ai', 'hosting:hosting', 'contato:geral', 'flutuante:geral'];
const waHref = (text) => `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
/** Texto (parâmetro text) de um link do wa.me, decodificado. */
const waText = (href) => {
  try {
    const u = new URL(href);
    return u.origin === 'https://wa.me' && u.pathname === `/${NUMBER}` ? u.searchParams.get('text') : null;
  } catch {
    return null;
  }
};

/** Mesma regra de isProfileUrl (src/config.ts): https com caminho além da raiz — só assim a rede vira link. */
const isProfileUrl = (u) => {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && url.pathname.replace(/\/+$/, '').length > 1;
  } catch {
    return false;
  }
};
const SOCIAL = [
  ['LinkedIn', publicacao.canais.linkedin],
  ['Instagram', publicacao.canais.instagram],
];
const EXPECTED_SOCIAL = SOCIAL.filter(([, u]) => u != null && isProfileUrl(u));
const REJECTED_SOCIAL = SOCIAL.filter(([, u]) => u != null && !isProfileUrl(u));

/** Fixture negativa: Bookings e/ou endpoint configurados — a página tem de ignorá-los. */
const BOOKINGS_URL = publicacao.agendamento?.url ?? null;
const ENDPOINT = publicacao.envioAutomatico?.endpoint ?? null;
const ENDPOINT_ORIGIN = ENDPOINT ? new URL(ENDPOINT).origin : null;
const NEGATIVE = BOOKINGS_URL != null || ENDPOINT != null;

const EMAIL_INSTRUCTION = /(?:envie|mande|escreva|solicite|peça|abra)[^.]{0,60}\b(?:por|pelo|no) e-mail|aplicativo de e-mail|Escrever diretamente por e-mail|Abrir no e-mail/i;
const THEME_KEY = 'nekkora-commercial-tema';
const THEMES = ['sage-light', 'sakura-dark'];
const toBr = (iso) => iso.split('-').reverse().join('/');
const { inicio: CAMP_START, fim: CAMP_END } = publicacao.campanhaLancamento;
/** Durante a campanha da publicação servida (meio-dia do primeiro dia, Brasília). */
const IN_CAMPAIGN = CAMP_START ? new Date(`${CAMP_START}T12:00:00-03:00`) : new Date('2026-11-15T12:00:00-03:00');

const checks = [];
const check = (engine, id, ok, detail) => {
  checks.push({ engine, id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} [${engine}] ${id}${detail ? ` — ${detail}` : ''}`);
};
const origin = new URL(baseUrl).origin;
console.log(`Publicação (${release.publicacao}): WhatsApp ${NUMBER}${NEGATIVE ? ` — fixture NEGATIVA (Bookings=${BOOKINGS_URL ?? '—'}, endpoint=${ENDPOINT ?? '—'})` : ''}`);

/** Contraste WCAG entre duas cores CSS rgb()/rgba() (sem transparência no fundo). */
const contrast = (fg, bg) => {
  const parse = (c) => c.match(/[\d.]+/g).map(Number);
  const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const [a, b] = [L(parse(fg)), L(parse(bg))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

async function run(engine) {
  const shot = (name) => path.join(outDir, `${engine}-${name}`);
  const browser = await playwright[engine].launch();
  const aborted = [];
  const waRequests = [];
  /** Toda requisição feita por qualquer página (inclusive as abas do wa.me), para provar que nada vai a uma API. */
  const requests = [];
  const errors = [];
  async function newContext({ viewport = { width: 1280, height: 800 }, at = IN_CAMPAIGN, theme = null, reducedMotion = 'reduce' } = {}) {
    const ctx = await browser.newContext({ viewport, reducedMotion });
    await ctx.clock.setFixedTime(at);
    await ctx.addInitScript(
      ([key, t]) => {
        // A página não pode usar window.open (link comum não é barrado por bloqueador de pop-up): conta qualquer chamada.
        window.__openCalls = 0;
        const original = window.open;
        window.open = (...a) => {
          window.__openCalls++;
          return original.apply(window, a);
        };
        try {
          if (t && !sessionStorage.getItem('__nk_seeded')) {
            localStorage.setItem(key, t);
            sessionStorage.setItem('__nk_seeded', '1');
          }
        } catch {}
      },
      [THEME_KEY, theme],
    );
    ctx.on('request', (r) => requests.push({ url: r.url(), method: r.method() }));
    await ctx.route('**/*', (route) => {
      const req = route.request();
      const url = req.url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank') return route.continue();
      if (url.startsWith('https://wa.me/')) {
        waRequests.push({ url, referer: req.headers()['referer'] ?? null });
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>wa.me (página de teste local)</title><h1>wa.me — página de teste local</h1>' });
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
  async function openPage(opts, url = baseUrl) {
    const ctx = await newContext(opts);
    const page = await ctx.newPage();
    watch(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    return { ctx, page };
  }
  /** Lê os CTAs do WhatsApp na ordem do documento. */
  const readCtas = (page) =>
    page.$$eval('[data-whatsapp]', (els) =>
      els.map((a) => ({
        ctx: a.getAttribute('data-whatsapp'),
        where: a.closest('section')?.id ?? (a.classList.contains('nk-fab') ? 'flutuante' : '?'),
        tag: a.tagName.toLowerCase(),
        href: a.getAttribute('href') ?? '',
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel') ?? '',
        name: (a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim(),
        visibleText: (a.querySelector('.fab__text, .nk-link__label, .nk-button__label')?.firstChild?.textContent ?? a.innerText ?? '').replace(/\s+/g, ' ').trim(),
      })),
    );
  const isolated = (c) => c.target === '_blank' && /\bnoopener\b/.test(c.rel) && /\bnoreferrer\b/.test(c.rel);
  /** Clica num CTA e espera a aba nova; devolve o que a página e a aba mostram. Nada é enviado: a aba é local. */
  async function clickCta(page, locator) {
    const before = { url: page.url(), wa: waRequests.length };
    const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
    await locator.click();
    const popup = await popupPromise;
    if (popup) await popup.waitForLoadState('load').catch(() => {});
    const isolation = popup ? await popup.evaluate(() => ({ opener: window.opener === null, referrer: document.referrer })).catch((e) => ({ error: e.message })) : null;
    const state = await page.evaluate(() => ({
      dialogs: document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]').length,
      forms: document.querySelectorAll('form').length,
      openCalls: window.__openCalls,
    }));
    const req = waRequests.slice(before.wa).at(-1) ?? null;
    if (popup) await popup.close();
    return { popup: !!popup, popupText: req ? waText(req.url) : null, referer: req?.referer ?? null, isolation, sameUrl: page.url() === before.url, ...state };
  }
  const clickOk = (r, expectedText) =>
    r.popup && r.popupText === expectedText && r.referer == null && r.isolation?.opener === true && r.isolation?.referrer === '' && r.dialogs === 0 && r.forms === 0 && r.openCalls === 0 && r.sameUrl;
  const clickDetail = (r) =>
    `aba=${r.popup ? 'wa.me (local)' : 'NENHUMA'}; mensagem exata=${r.popupText != null}; sem opener=${r.isolation?.opener}; Referer=${r.referer ?? 'ausente'}; diálogos=${r.dialogs}; window.open=${r.openCalls}`;

  // 1. CTAs do WhatsApp: contexto, mensagem exata, isolamento, nome acessível --------------------------------------------
  {
    const { ctx, page } = await openPage();
    check(engine, 'status-configurado', (await page.getAttribute('[data-contact-status]', 'data-contact-status')) === 'configurado');
    const ctas = await readCtas(page);
    const where = ctas.map((c) => `${c.where}:${c.ctx}`);
    check(engine, 'ctas-por-contexto', JSON.stringify(where) === JSON.stringify(EXPECTED_CTAS), where.join(', '));
    for (const context of Object.keys(MESSAGES)) {
      const list = ctas.filter((c) => c.ctx === context);
      check(
        engine,
        `mensagem-exata:${context}`,
        list.length > 0 && list.every((c) => c.tag === 'a' && c.href === waHref(MESSAGES[context]) && waText(c.href) === MESSAGES[context] && isolated(c)),
        `${list.length} link(s) → wa.me/${NUMBER} "${list.length ? waText(list[0].href) : '—'}"; outra aba sem opener e sem Referer: ${list.every(isolated)}`,
      );
    }
    check(engine, 'nome-acessivel-avisa-outra-aba', ctas.every((c) => c.name.endsWith(SR_SUFFIX)), ctas.filter((c) => !c.name.endsWith(SR_SUFFIX)).map((c) => c.name).join(' | ') || `todos terminam com "${SR_SUFFIX}"`);
    // Monitor e AI: "Em preparação", pedido de informação — nunca contratação
    const prep = await page.evaluate(() => ({
      cards: [...document.querySelectorAll('#solucoes .offer-card')].filter((c) => /Monitor|AI/.test(c.querySelector('h3')?.textContent ?? '')).map((c) => `${c.querySelector('h3')?.textContent.trim()}:${c.querySelector('.nk-badge')?.textContent.trim()}`),
      planned: [...document.querySelectorAll('[data-servicos-previstos] [data-servico]')].map((s) => `${s.dataset.servico}:${s.querySelector('.nk-badge')?.textContent.trim()}`),
    }));
    const asks = ctas.filter((c) => c.ctx === 'monitor' || c.ctx === 'ai');
    check(
      engine,
      'monitor-ai-em-preparacao-so-informacao',
      JSON.stringify(prep.cards) === JSON.stringify(['Nekkora Monitor:Em preparação', 'Nekkora AI:Em preparação']) &&
        JSON.stringify(prep.planned) === JSON.stringify(['monitor:Em preparação', 'ai:Em preparação']) &&
        JSON.stringify(asks.map((a) => a.visibleText)) === JSON.stringify(['Quero receber informações sobre o Nekkora Monitor', 'Quero receber informações sobre o Nekkora AI']) &&
        asks.every((a) => !/contrat|assin|compr/i.test(`${a.visibleText} ${waText(a.href)}`)),
      `${prep.cards.join(', ')} · ${asks.map((a) => a.visibleText).join(' · ')}`,
    );
    // Clique em cada CTA da página (o flutuante e o simulador têm verificações próprias abaixo)
    const all = page.locator('[data-whatsapp]');
    const n = await all.count();
    for (let i = 0; i < n; i++) {
      const c = ctas[i];
      if (c.where === 'flutuante') continue;
      const r = await clickCta(page, all.nth(i));
      check(engine, `clique-abre-whatsapp:${c.where}-${c.ctx}`, clickOk(r, MESSAGES[c.ctx]), clickDetail(r));
    }
    await page.screenshot({ path: shot('pagina-topo.png') });
    await ctx.close();
  }

  // 2. Ausência: formulário, diálogo, mailto, Bookings, "Agendar", instrução de envio por e-mail ------------------------
  {
    const { ctx, page } = await openPage();
    const a = await page.evaluate(
      ({ hosts, instr }) => {
        const host = (h) => {
          try {
            return new URL(h, location.href).hostname;
          } catch {
            return '';
          }
        };
        const hrefs = [...document.querySelectorAll('a[href]')].map((x) => x.getAttribute('href'));
        const text = (document.body.textContent ?? '').replace(/\s+/g, ' ');
        return {
          forms: document.querySelectorAll('form').length,
          fields: [...document.querySelectorAll('input, textarea, select')].filter((e) => !e.matches('[data-sim-input]')).length,
          dialogs: document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog').length,
          triggers: document.querySelectorAll('[aria-haspopup="dialog"], [aria-haspopup="true"]').length,
          mailto: hrefs.filter((h) => /^mailto:/i.test(h)),
          bookings: hrefs.filter((h) => hosts.includes(host(h)) || /bookings|\/book\//i.test(h)),
          agendar: /\bagendar\b|agende/i.test(text) || document.querySelectorAll('[data-agendamento], [data-agendar]').length > 0,
          emailInstruction: text.match(new RegExp(instr.source, instr.flags))?.[0] ?? null,
          scripts: [...document.scripts].map((s) => s.src).filter((s) => s && !s.startsWith(location.origin)),
          iframes: document.querySelectorAll('iframe').length,
        };
      },
      { hosts: BOOKINGS_HOSTS, instr: { source: EMAIL_INSTRUCTION.source, flags: EMAIL_INSTRUCTION.flags } },
    );
    check(engine, 'sem-formulario', a.forms === 0 && a.fields === 0, `form=${a.forms}; campos fora do simulador=${a.fields}`);
    check(engine, 'sem-dialogo', a.dialogs === 0 && a.triggers === 0, `diálogos=${a.dialogs}; botões que abrem diálogo=${a.triggers}`);
    check(engine, 'sem-mailto', a.mailto.length === 0, a.mailto.join(' | ') || 'nenhum link mailto');
    check(engine, 'sem-link-do-bookings', a.bookings.length === 0, a.bookings.join(' | ') || `nenhum link para ${BOOKINGS_HOSTS.join(', ')}`);
    check(engine, 'sem-agendar', !a.agendar, a.agendar ? '"Agendar" na página' : 'nenhum "Agendar"');
    check(engine, 'sem-instrucao-de-envio-por-email', a.emailInstruction === null, a.emailInstruction ?? 'nenhuma');
    check(engine, 'sem-script-ou-iframe-externo', a.scripts.length === 0 && a.iframes === 0, a.scripts.join(' | ') || 'nenhum (sem Turnstile, sem widget)');
    // E-mail só como texto: identificação do fornecedor (rodapé) e canal dos direitos (privacidade)
    const email = publicacao.canais.email;
    const emailText = await page.evaluate((e) => ({ footer: (document.querySelector('footer [data-supplier]')?.textContent ?? '').includes(e), privacy: (document.querySelector('#privacidade')?.textContent ?? '').includes(e) }), email);
    check(engine, 'email-so-como-texto', emailText.footer && emailText.privacy && a.mailto.length === 0, `${email}: rodapé=${emailText.footer}; privacidade=${emailText.privacy}; sem link`);
    // Redes institucionais (LinkedIn e Instagram): URLs exatas da publicação, outra aba; URL sem perfil não vira link
    const social = await page.evaluate(() => ({
      caption: document.querySelector('[data-redes-institucionais] .contact__caption')?.textContent.trim() ?? null,
      links: [...document.querySelectorAll('[data-redes-institucionais] a')].map((x) => ({ text: x.textContent.trim(), href: x.getAttribute('href'), target: x.getAttribute('target'), rel: x.getAttribute('rel') ?? '' })),
      anywhere: [...document.querySelectorAll('a[href]')].map((x) => x.getAttribute('href')).filter((h) => /linkedin\.com|instagram\.com/i.test(h)),
    }));
    check(
      engine,
      'redes-institucionais-urls-exatas',
      (EXPECTED_SOCIAL.length === 0 || social.caption === 'Acompanhe a Nekkora') &&
        JSON.stringify(social.links.map((l) => [l.text, l.href])) === JSON.stringify(EXPECTED_SOCIAL) &&
        social.links.every(isolated) &&
        JSON.stringify(social.anywhere) === JSON.stringify(EXPECTED_SOCIAL.map(([, u]) => u)),
      `${social.links.map((l) => `${l.text}=${l.href} (${l.target}, ${l.rel})`).join(' · ') || 'nenhuma'}${REJECTED_SOCIAL.length ? `; rejeitada(s): ${REJECTED_SOCIAL.map(([n, u]) => `${n} ${u}`).join(', ')}` : ''}`,
    );
    // #contato por âncora: carregamento novo, nenhum diálogo aparece (espera limitada que falha se aparecer)
    await page.goto('about:blank');
    await page.goto(new URL('#contato', baseUrl).href, { waitUntil: 'networkidle' });
    const dialog = await page.waitForSelector('[role="dialog"], dialog[open]', { state: 'attached', timeout: 1500 }).then(() => true, () => false);
    check(engine, 'contato-por-ancora-sem-dialogo', !dialog, dialog ? 'um diálogo abriu' : 'nenhum diálogo');
    await page.locator('#contato').screenshot({ path: shot('contato.png'), style: '.nk-fab { visibility: hidden !important; }' });
    await ctx.close();
  }

  // 3. Simulador: "Conversar sobre esta simulação" leva a mensagem do Delivery + o resumo mostrado ------------------------
  {
    const { ctx, page } = await openPage();
    const sim = page.locator('[data-simulator]');
    for (let i = 0; i < 4; i++) await sim.locator('[data-sim-tier="simples"] [data-sim-action="aumentar"]').click();
    await sim.locator('[data-sim-tier="media"] [data-sim-action="aumentar"]').click();
    await sim.getByRole('button', { name: 'Calcular meu investimento' }).click();
    await sim.locator('[data-sim-result]').waitFor({ timeout: 5000 });
    const cta = sim.locator('[data-sim-result] a[data-whatsapp="delivery"]');
    const shown = await page.evaluate(() => ({
      figures: Object.fromEntries([...document.querySelectorAll('[data-simulator] [data-calc]')].map((e) => [e.dataset.calc, e.textContent.trim()])),
      status: document.querySelector('[data-testid="status-simulador"]')?.textContent ?? '',
      ctas: document.querySelectorAll('[data-sim-result] a[data-whatsapp], [data-sim-result] button[aria-haspopup]').length,
    }));
    const href = await cta.getAttribute('href');
    const text = (waText(href) ?? '').replace(/ /g, ' ');
    const label = ((await cta.locator('.nk-button__label').count()) ? await cta.locator('.nk-button__label').evaluate((e) => e.firstChild?.textContent ?? '') : await cta.innerText()).trim();
    const prefix = `${MESSAGES.delivery}\n\n${SIM_INTRO}\n`;
    const summary = text.startsWith(prefix) ? text.slice(prefix.length) : null;
    const nb = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    // Exemplo digitado de propósito: 4 simples + 1 média → 1 pacote de 3 simples + 1 simples + 1 média
    const EXPECTED_SUMMARY = [
      '- 4 automações simples: 1 pacote de 3 (R$ 1.500 cada) + 1 individual (R$ 650 cada) = R$ 2.150',
      '- 1 automação média: 1 individual (R$ 1.400 cada) = R$ 1.400',
      'Investimento estimado: R$ 3.550',
      'Sem pacotes, no preço individual: R$ 4.000 · Economia com pacotes: R$ 450',
    ].join('\n');
    const f = Object.fromEntries(Object.entries(shown.figures).map(([k, v]) => [k, nb(v)]));
    check(
      engine,
      'simulador-mensagem-com-resumo',
      label.startsWith('Conversar sobre esta simulação') &&
        shown.ctas === 1 &&
        summary === EXPECTED_SUMMARY &&
        // coerente com o resultado na tela: os mesmos valores e o mesmo resumo anunciado ao leitor de tela
        summary.includes(`Investimento estimado: ${f.estimativa}`) &&
        summary.includes(`Sem pacotes, no preço individual: ${f.individual}`) &&
        summary.includes(`Economia com pacotes: ${f.economia}`) &&
        // a região viva anuncia as mesmas linhas, em frases ("- " removido, separadas por ". ")
        nb(shown.status) === nb(`Resultado da simulação atualizado. ${summary.split('\n').map((l) => l.replace(/^- /, '')).join('. ')}`) &&
        (await cta.getAttribute('target')) === '_blank' &&
        /noopener/.test((await cta.getAttribute('rel')) ?? '') &&
        /noreferrer/.test((await cta.getAttribute('rel')) ?? ''),
      `${label}: ${JSON.stringify(text).slice(0, 220)} · tela=${JSON.stringify(f)}`,
    );
    const r = await clickCta(page, cta);
    check(engine, 'clique-abre-whatsapp:simulador-delivery', clickOk(r, waText(href)), clickDetail(r));
    await sim.locator('[data-sim-result]').screenshot({ path: shot('simulador-resultado-whatsapp.png'), style: 'header, nav, .nk-fab { visibility: hidden !important; }' });
    await ctx.close();
  }

  // 4. Botão flutuante "Fale com um analista": temas × desktop/celular ----------------------------------------------------
  for (const theme of THEMES) {
    for (const vp of [
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'celular', width: 390, height: 844 },
    ]) {
      const tag = `${theme}:${vp.name}`;
      // reducedMotion 'no-preference': o pulso da lib só seria visível assim — prova que não há animação
      const { ctx, page } = await openPage({ viewport: { width: vp.width, height: vp.height }, theme, reducedMotion: 'no-preference' });
      const fab = page.locator('.nk-fab');
      // No celular o botão fica recolhido no topo (os botões do hero já levam ao WhatsApp): as medições começam em
      // Preços, onde ele aparece. Se continuar recolhido, as verificações abaixo falham (sem espera fixa).
      if (vp.name === 'celular') {
        await page.evaluate(() => document.getElementById('precos')?.scrollIntoView({ block: 'start' }));
        // espera o fim da transição de volta (posição e opacidade finais), não um tempo fixo
        await page
          .waitForFunction(() => {
            const el = document.querySelector('.nk-fab');
            return el && !el.classList.contains('fab--tucked') && el.getAnimations({ subtree: true }).length === 0;
          }, null, { timeout: 3000 })
          .catch(() => {});
      }
      const info = async () =>
        fab.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const text = el.querySelector('.fab__text');
          const tr = text?.getBoundingClientRect();
          const icon = el.querySelector('svg');
          const ir = icon?.getBoundingClientRect();
          return {
            count: document.querySelectorAll('.nk-fab').length,
            theme: document.documentElement.getAttribute('data-nk-theme'),
            box: { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height },
            vw: document.documentElement.clientWidth,
            vh: document.documentElement.clientHeight,
            text: text?.textContent.trim() ?? null,
            textVisible: !!tr && tr.width > 0 && tr.height > 0 && getComputedStyle(text).visibility !== 'hidden',
            textColor: text ? getComputedStyle(text).color : null,
            bg: cs.backgroundColor,
            icon: !!icon && ir.width >= 16 && ir.height >= 16,
            aria: el.getAttribute('aria-label'),
            href: el.getAttribute('href'),
            target: el.getAttribute('target'),
            rel: el.getAttribute('rel') ?? '',
            ctx: el.getAttribute('data-whatsapp'),
            classes: el.className,
            tooltip: el.querySelectorAll('.nk-fab__tooltip').length,
            animations: [cs.animationName, getComputedStyle(el, '::before').animationName, getComputedStyle(el, '::after').animationName],
            running: el.getAnimations({ subtree: true }).length,
            tucked: el.classList.contains('fab--tucked'),
            ariaHidden: el.getAttribute('aria-hidden'),
            tabIndex: el.tabIndex,
            opacity: cs.opacity,
            pointer: cs.pointerEvents,
          };
        });
      const i0 = await info();
      check(engine, `flutuante-tema-aplicado:${tag}`, i0.theme === theme, `data-nk-theme=${i0.theme}`);
      check(
        engine,
        `flutuante-texto-e-icone:${tag}`,
        i0.count === 1 && i0.text === FAB_TEXT && i0.textVisible && i0.icon && i0.aria === `${FAB_TEXT} ${SR_SUFFIX}` && i0.tooltip === 0,
        `texto="${i0.text}" visível=${i0.textVisible}; ícone=${i0.icon}; aria-label="${i0.aria}"; tooltip=${i0.tooltip}`,
      );
      check(
        engine,
        `flutuante-destino:${tag}`,
        i0.href === waHref(MESSAGES.geral) && waText(i0.href) === MESSAGES.geral && i0.ctx === 'geral' && isolated(i0),
        `wa.me/${NUMBER} "${waText(i0.href)}"; target=${i0.target}; rel=${i0.rel}`,
      );
      check(
        engine,
        `flutuante-sem-pulso:${tag}`,
        !/nk-fab--pulse/.test(i0.classes) && i0.animations.every((a) => a === 'none') && i0.running === 0,
        `classes="${i0.classes}"; animações=${i0.animations.join(',')}; em execução=${i0.running}`,
      );
      const ratio = i0.textColor && /rgba?\(/.test(i0.bg) && !/rgba\([^)]*,\s*0(\.0+)?\)/.test(i0.bg) ? contrast(i0.textColor, i0.bg) : 0;
      check(engine, `flutuante-contraste:${tag}`, ratio >= 4.5, `texto ${i0.textColor} sobre ${i0.bg}: ${ratio.toFixed(2)}:1 (mín. 4,5)`);
      check(engine, `flutuante-area-de-toque:${tag}`, i0.box.w >= 44 && i0.box.h >= 44, `${i0.box.w.toFixed(0)}×${i0.box.h.toFixed(0)}px (mín. 44×44)`);
      // Posição: dentro da janela, respeitando o afastamento da lib (24 px; 16 px até 640 px de largura)
      const offset = vp.width <= 640 ? 16 : 24;
      const gapR = i0.vw - i0.box.r;
      const gapB = i0.vh - i0.box.b;
      check(
        engine,
        `flutuante-dentro-da-tela:${tag}`,
        i0.box.x >= 0 && i0.box.y >= 0 && Math.abs(gapR - offset) <= 1 && Math.abs(gapB - offset) <= 1,
        `direita ${gapR.toFixed(1)}px, base ${gapB.toFixed(1)}px (esperado ${offset}px); x=${i0.box.x.toFixed(0)}`,
      );
      // Teclado: visível, recebe foco com Tab a partir do último link do rodapé (WebKit: foco programático)
      let focused;
      if (engine === 'webkit') {
        await fab.focus();
        focused = await fab.evaluate((el) => document.activeElement === el && el.tabIndex >= 0);
      } else {
        await page.locator('footer a').last().focus();
        await page.keyboard.press('Tab');
        focused = await fab.evaluate((el) => document.activeElement === el);
      }
      const ring = await fab.evaluate((el) => {
        const cs = getComputedStyle(el);
        return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      });
      check(engine, `flutuante-focavel-por-teclado:${tag}`, focused && ring, `foco=${focused}; indicador=${ring}${engine === 'webkit' ? ' (WebKit: foco programático)' : ''}`);
      await page.evaluate(() => document.activeElement?.blur());
      // Fim da página: o botão não cobre nenhum texto nem link do rodapé
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const atBottom = await page
        .waitForFunction(() => Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1, null, { timeout: 3000 })
        .then(() => true, () => false);
      const cover = await fab.evaluate((el) => {
        const f = el.getBoundingClientRect();
        const hit = [];
        const footer = document.querySelector('footer');
        const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) {
            if (r.width > 0 && r.left < f.right && f.left < r.right && r.top < f.bottom && f.top < r.bottom) hit.push(n.textContent.trim().slice(0, 50));
          }
        }
        for (const a of footer.querySelectorAll('a, button')) {
          const r = a.getBoundingClientRect();
          if (r.width > 0 && r.left < f.right && f.left < r.right && r.top < f.bottom && f.top < r.bottom) hit.push(`[${a.textContent.trim().slice(0, 30)}]`);
        }
        return { hit: [...new Set(hit)], tucked: el.classList.contains('fab--tucked'), fab: `${f.left.toFixed(0)},${f.top.toFixed(0)}–${f.right.toFixed(0)},${f.bottom.toFixed(0)}`, footerPad: getComputedStyle(footer).paddingBottom };
      });
      check(
        engine,
        `flutuante-nao-cobre-o-rodape:${tag}`,
        atBottom && !cover.tucked && cover.hit.length === 0,
        `fim da página=${atBottom}; botão ${cover.fab}; padding-bottom do rodapé=${cover.footerPad}; coberto: ${cover.hit.join(' | ') || 'nada'}`,
      );
      if (theme === 'sage-light' || vp.name === 'celular') await page.screenshot({ path: shot(`flutuante-rodape-${theme}-${vp.name}.png`) });
      // Contato na tela: no celular o botão se recolhe (oculto, fora da ordem de foco); no desktop continua visível
      await page.locator('#contato').evaluate((el) => el.scrollIntoView({ block: 'center' }));
      if (vp.name === 'celular') {
        const tuckedOk = await page
          .waitForFunction(() => {
            const el = document.querySelector('.nk-fab');
            return el?.classList.contains('fab--tucked') && getComputedStyle(el).opacity === '0';
          }, null, { timeout: 3000 })
          .then(() => true, () => false);
        const t = await info();
        check(
          engine,
          `flutuante-recolhido-com-o-contato:${tag}`,
          tuckedOk && t.ariaHidden === 'true' && t.tabIndex === -1 && t.pointer === 'none',
          `recolhido=${t.tucked}; aria-hidden=${t.ariaHidden}; tabIndex=${t.tabIndex}; opacity=${t.opacity}; pointer-events=${t.pointer}`,
        );
        // de volta ao topo, reaparece
        // NEKKORA-COM-CANAIS-001: no topo os botões do hero já levam ao WhatsApp — o flutuante também fica recolhido ali
        await page.evaluate(() => window.scrollTo(0, 0));
        const topo = await page.waitForFunction(() => document.querySelector('.nk-fab')?.classList.contains('fab--tucked'), null, { timeout: 3000 }).then(() => true, () => false);
        const tp = await info();
        check(engine, `flutuante-recolhido-com-o-cta-do-topo:${tag}`, topo && tp.ariaHidden === 'true' && tp.tabIndex === -1, `aria-hidden=${tp.ariaHidden}; tabIndex=${tp.tabIndex}`);
        // fora do topo e do contato (preços), ele volta
        await page.evaluate(() => document.getElementById('precos')?.scrollIntoView({ block: 'start' }));
        const back = await page.waitForFunction(() => !document.querySelector('.nk-fab')?.classList.contains('fab--tucked'), null, { timeout: 3000 }).then(() => true, () => false);
        const b = await info();
        check(engine, `flutuante-volta-fora-do-contato:${tag}`, back && b.ariaHidden == null && b.tabIndex === 0 && b.opacity === '1', `aria-hidden=${b.ariaHidden}; tabIndex=${b.tabIndex}; opacity=${b.opacity}`);
      } else {
        // espera limitada: se o botão se recolher no desktop, a verificação falha
        const tucked = await page.waitForSelector('.nk-fab.fab--tucked', { state: 'attached', timeout: 1500 }).then(() => true, () => false);
        check(engine, `flutuante-visivel-com-o-contato:${tag}`, !tucked, tucked ? 'recolhido no desktop' : 'continua visível');
      }
      // Clique no flutuante (desktop e celular, fora do topo e do contato — em Preços): abre o WhatsApp, nenhum diálogo
      if (theme === 'sage-light') {
        await page.evaluate(() => document.getElementById('precos')?.scrollIntoView({ block: 'start' }));
        await page.waitForFunction(() => !document.querySelector('.nk-fab')?.classList.contains('fab--tucked'), null, { timeout: 3000 }).catch(() => {});
        const r = await clickCta(page, fab);
        check(engine, `clique-abre-whatsapp:flutuante-${vp.name}`, clickOk(r, MESSAGES.geral), clickDetail(r));
      }
      await ctx.close();
    }
  }

  await campaign(engine, newContext);

  // Fixture negativa: a CSP do build libera o endpoint (uma chamada passaria) — e mesmo assim nenhuma é feita
  if (ENDPOINT_ORIGIN) {
    const csp = (await fetch(baseUrl).then((r) => r.headers.get('content-security-policy'))) ?? '';
    check(engine, 'negativa-csp-libera-o-endpoint', csp.includes(ENDPOINT_ORIGIN), `connect-src com ${ENDPOINT_ORIGIN}: ${csp.includes(ENDPOINT_ORIGIN)}`);
  }
  const foreign = requests.filter((r) => !r.url.startsWith(origin) && !r.url.startsWith('https://wa.me/') && !/^(data|blob|about):/.test(r.url));
  const writes = requests.filter((r) => r.method !== 'GET');
  check(
    engine,
    'sem-requisicao-a-api',
    foreign.length === 0 && writes.length === 0 && (!ENDPOINT_ORIGIN || !requests.some((r) => r.url.startsWith(ENDPOINT_ORIGIN))),
    `${requests.length} requisições: só ${origin} e as abas locais do wa.me; fora disso: ${foreign.map((r) => r.url).join(' | ') || 'nenhuma'}; não-GET: ${writes.map((r) => `${r.method} ${r.url}`).join(' | ') || 'nenhuma'}`,
  );
  check(engine, 'sem-requisicao-externa-real', aborted.length === 0, aborted.join(' | ') || 'wa.me respondido localmente; nenhuma outra requisição externa');
  check(engine, 'console-sem-erros', errors.length === 0, errors.join(' | ') || 'limpo');
  const version = browser.version();
  await browser.close();
  return { engine, version, waRequests: waRequests.map((r) => ({ ...r, url: `${r.url.slice(0, 60)}…` })), aborted };
}

/**
 * Vigência (COM-VITRINE-001, V-01): a campanha controla só a comunicação promocional. Antes, durante, no último dia e
 * depois do período da publicação servida os cartões mostram a MESMA tabela (individual, pacote de 3 e economia), sem
 * valor riscado; a faixa com o período por extenso só aparece durante a campanha.
 */
async function campaign(engine, newContext) {
  if (!CAMP_START || !CAMP_END) return;
  const read = async (at) => {
    const ctx = await newContext({ at });
    const p = await ctx.newPage();
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({
      text: document.querySelector('[data-pricing]').innerText,
      strip: document.querySelector('[data-pricing] .launch-strip')?.innerText ?? null,
      struck: document.querySelectorAll('[data-pricing] s, [data-pricing] del').length,
      values: [...document.querySelectorAll('[data-price-tier] [data-price]')].map((e) => `${e.closest('[data-price-tier]').dataset.priceTier}:${e.dataset.price}=${e.textContent.trim()}`),
    }));
    await ctx.close();
    return r;
  };
  // Tabela da COM-VITRINE-001, digitada de propósito (independente do código)
  const table = [
    'simples:individual=R$ 650',
    'simples:pacote=R$ 1.500',
    'simples:economia=Economia de R$ 450',
    'media:individual=R$ 1.400',
    'media:pacote=R$ 3.500',
    'media:economia=Economia de R$ 700',
  ];
  const sameTable = (r) => JSON.stringify(r.values) === JSON.stringify(table) && r.struck === 0 && !/R\$ 1\.000|R\$ 2\.800/.test(r.text);
  const period = `de ${toBr(CAMP_START)} a ${toBr(CAMP_END)}`;
  const novas = publicacao.novasCondicoes?.inicio ? toBr(publicacao.novasCondicoes.inicio) : null;
  const during = await read(IN_CAMPAIGN);
  check(
    engine,
    'vigencia-durante-campanha',
    sameTable(during) &&
      (during.strip ?? '').includes(`Campanha de lançamento para solicitações de avaliação recebidas ${period}.`) &&
      // V-01 (titular, 12/11/2026): a faixa diz que os valores continuam depois da campanha, até nova revisão
      (!novas || (during.strip ?? '').includes(`valem para solicitações recebidas a partir de ${novas} e continuam valendo depois da campanha, até nova revisão.`)) &&
      !/Preços especiais|preço de lançamento/i.test(during.text),
    during.values.join(' · '),
  );
  const dayBefore = new Date(new Date(`${CAMP_START}T12:00:00-03:00`).getTime() - 864e5).toISOString().slice(0, 10);
  const dayAfter = new Date(new Date(`${CAMP_END}T12:00:00-03:00`).getTime() + 864e5).toISOString().slice(0, 10);
  for (const [id, at] of [
    ['vigencia-antes-do-inicio', new Date(`${dayBefore}T23:30:00-03:00`)],
    // 00h30 do dia seguinte ao fim, em Brasília: a campanha já acabou — mesma tabela, sem retorno à tabela anterior (V-01)
    ['vigencia-depois-do-fim', new Date(`${dayAfter}T00:30:00-03:00`)],
  ]) {
    const r = await read(at);
    check(engine, id, sameTable(r) && r.strip === null && !/[Ll]ançamento/.test(r.text), r.values.join(' · '));
  }
  // último dia ainda vale: 23h30 em Brasília já é o dia seguinte em UTC
  const last = await read(new Date(`${CAMP_END}T23:30:00-03:00`));
  check(engine, 'vigencia-ultimo-dia-no-fuso-de-brasilia', sameTable(last) && last.strip != null, `${last.values.join(' · ')} · faixa=${last.strip ? 'presente' : 'ausente'}`);
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
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ baseUrl, publicacao: release.publicacao, negativa: NEGATIVE, at: new Date().toISOString(), runs, checks, summary: { total: checks.length, failed } }, null, 2));
const md = [
  `# Atendimento pelo WhatsApp (NEKKORA-COM-CANAIS-001) — ${new Date().toISOString()}`,
  '',
  `URL: ${baseUrl} (${release.publicacao}${NEGATIVE ? ', fixture NEGATIVA: Bookings e endpoint configurados' : ''}) · ${runs.map((r) => `${r.engine} ${r.version}`).join(' · ')} · ${checks.length} verificações · ${failed} falha(s)`,
  '',
  '| Navegador | Verificação | Resultado | Detalhe |',
  '|---|---|---|---|',
  ...checks.map((c) => `| ${c.engine} | ${c.id} | ${c.ok ? 'OK' : '**FALHA**'} | ${String(c.detail ?? '').replace(/\|/g, '\\|').slice(0, 260)} |`),
].join('\n');
writeFileSync(path.join(outDir, 'resumo.md'), md + '\n');
console.log(`\n${checks.length} verificações, ${failed} falha(s).`);
process.exit(failed ? 1 : 0);
