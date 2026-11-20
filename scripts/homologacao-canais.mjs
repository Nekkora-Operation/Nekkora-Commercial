#!/usr/bin/env node
/**
 * Jornada de atendimento: formulário → WhatsApp (NEKKORA-COM-ECOSYSTEM-001 §7 e §8; WhatsApp como único canal público,
 * NEKKORA-COM-CANAIS-001) — em Chromium, Firefox e WebKit.
 *
 * Todo CTA comercial (topo, cartões do AI, Monitor e Hosting, faixa do Hosting, contato, simulador e o botão flutuante)
 * abre o formulário de atendimento (diálogo da nekkora-lib). O formulário só prepara a mensagem no navegador e abre o
 * WhatsApp em outra aba (window.open, sem opener e sem Referer); nada é enviado pela página. Esta homologação comprova:
 *
 *   - CTAs: âncora #contato com aria-haspopup="dialog", serviços já marcados conforme a origem; nenhum link direto ao wa.me;
 *   - campos, aviso de não informar senhas, validação (nome e descrição obrigatórios; e-mail validado só se informado);
 *   - mensagem estruturada EXATA (saudação, só os campos preenchidos, descrição, serviços de interesse), com acentos,
 *     quebras de linha e caracteres especiais codificados no link e recuperados intactos;
 *   - a aba do WhatsApp sem opener e sem Referer; o link de reserva; nenhuma afirmação de recebimento;
 *   - foco preso no diálogo, Esc devolvendo o foco; nada no armazenamento além do tema; nenhuma requisição da página;
 *   - botão flutuante "Fale com um analista": abre o formulário; texto, ícone, sem pulso, contraste ≥ 4,5:1 nos dois
 *     temas, área de toque, posição, não cobre o rodapé, recolhido no celular com o topo ou o contato na tela, teclado;
 *   - LinkedIn e Instagram (redes institucionais) com as URLs exatas da publicação, em outra aba;
 *   - nenhum mailto, link do Bookings, "Agendar", instrução de envio por e-mail, Turnstile ou requisição a API.
 *
 * Uso (builds servidos como no CloudFront — veja .github/workflows/ci.yml):
 *   node scripts/homologacao-canais.mjs <url> <pasta-de-saida> [chromium,firefox,webkit]
 *
 * Os valores esperados vêm do publicacao.json com que o build servido foi feito (release.json → "publicacao"):
 *   - produção (dist, publicacao.json real: WhatsApp oficial 5511930597466);
 *   - fixture sintética (scripts/fixtures/publicacao-homologacao.json): número fictício; Instagram apontando para a
 *     página inicial, que precisa ser REJEITADO (não vira link);
 *   - fixture NEGATIVA (scripts/fixtures/publicacao-homologacao-api.json): URL do Bookings e endpoint de envio automático
 *     configurados, servida com a política do próprio build (--politica-do-build, CSP liberando o endpoint) — mesmo
 *     assim, nenhum agendamento, Turnstile ou requisição ao endpoint, nem ao enviar o formulário.
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
/** WhatsApp oficial (NEKKORA-COM-ECOSYSTEM-001 §5), digitado de propósito; o anterior não pode aparecer em lugar nenhum. */
const OFFICIAL_WHATSAPP = '5511930597466';
const PREVIOUS_WHATSAPP = ['5511917724200', '91772-4200', '917724200'];
const PRODUCTION = release.publicacao === 'publicacao.json';
if (PRODUCTION && NUMBER !== OFFICIAL_WHATSAPP) throw new Error(`publicacao.json: WhatsApp ${NUMBER} diverge do oficial ${OFFICIAL_WHATSAPP}`);

/**
 * Textos do formulário — digitados aqui de propósito (independentes do código) e conferidos contra o código-fonte antes de
 * qualquer navegador abrir: se o texto mudar, a homologação falha em vez de aceitar a mensagem nova sem revisão.
 */
const GREETING = 'Olá! Gostaria de conversar com um analista da Nekkora.';
const SERVICE_NAMES = { ai: 'Nekkora AI (piloto)', monitor: 'Nekkora Monitor', hosting: 'Nekkora Hosting' };
const NO_SECRETS = 'Não informe senhas, credenciais nem dados confidenciais.';
const OPENED_TEXT = 'Abrimos o WhatsApp em outra aba com a sua mensagem. Ela só chega à Nekkora quando você tocar em enviar — abrir o WhatsApp não é o envio.';
const SR_SUFFIX = '(abre o WhatsApp em outra aba)';
const FAB_TEXT = 'Fale com um analista';
{
  const config = readFileSync('src/config.ts', 'utf8');
  const content = readFileSync('src/content.ts', 'utf8');
  if (!config.includes(`WHATSAPP_GREETING = '${GREETING}'`)) throw new Error('src/config.ts: WHATSAPP_GREETING diverge da homologação');
  if (!content.includes(`SERVICE_NAMES: Record<ServiceId, string> = { ai: '${SERVICE_NAMES.ai}', monitor: '${SERVICE_NAMES.monitor}', hosting: '${SERVICE_NAMES.hosting}' }`)) throw new Error('src/content.ts: SERVICE_NAMES diverge da homologação');
  for (const t of [NO_SECRETS, OPENED_TEXT]) if (!content.includes(t)) throw new Error(`src/content.ts: texto do formulário diverge da homologação: ${t}`);
}
/** Origens dos CTAs na ordem do documento (o do simulador só aparece com estimativa) e os serviços que cada uma marca. */
const EXPECTED_ORIGINS = ['topo', 'ai', 'monitor', 'hosting', 'hosting-faixa', 'contato', 'flutuante'];
const PRESELECTED = { topo: [], ai: ['ai'], monitor: ['monitor'], hosting: ['hosting'], 'hosting-faixa': ['hosting'], contato: [], flutuante: [] };
const waHref = (text) => `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
/** Texto (parâmetro text) de um link do wa.me, decodificado; null se for outro destino. */
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
/** Abrir o WhatsApp não é o recebimento: nenhuma frase pode dizer que a solicitação foi recebida ou enviada. */
const RECEIPT_CLAIM = /recebid[ao]s? com sucesso|recebemos (?:a |sua )|solicitação (?:foi )?(?:recebida|enviada|registrada)|mensagem (?:foi )?enviada|enviad[ao] com sucesso|entraremos em contato/i;
const THEME_KEY = 'nekkora-commercial-tema';
const THEMES = ['sage-light', 'sakura-dark'];
const AT = new Date('2026-11-20T12:00:00-03:00');

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
  async function newContext({ viewport = { width: 1280, height: 800 }, at = AT, theme = null, reducedMotion = 'reduce' } = {}) {
    const ctx = await browser.newContext({ viewport, reducedMotion });
    await ctx.clock.setFixedTime(at);
    await ctx.addInitScript(
      ([key, t]) => {
        // Registra cada window.open (só o envio do formulário pode chamá-lo) e segue com a chamada original: a aba do
        // wa.me é respondida por uma página local de teste. sendBeacon também é contado (não pode ser usado).
        window.__nkOpen = [];
        const original = window.open;
        window.open = (...a) => {
          window.__nkOpen.push(a);
          return original.apply(window, a);
        };
        window.__nkBeacon = 0;
        if (navigator.sendBeacon) {
          const beacon = navigator.sendBeacon.bind(navigator);
          navigator.sendBeacon = (...a) => {
            window.__nkBeacon++;
            return beacon(...a);
          };
        }
        try {
          if (t && !sessionStorage.getItem('__nk_seeded')) {
            localStorage.setItem(key, t);
            sessionStorage.setItem('__nk_seeded', '1');
          }
        } catch {}
      },
      [THEME_KEY, theme],
    );
    ctx.on('request', (r) => requests.push({ url: r.url(), method: r.method(), type: r.resourceType() }));
    await ctx.route('**/*', (route) => {
      const req = route.request();
      const url = req.url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank') return route.continue();
      if (url.startsWith('https://wa.me/')) {
        // O WebKit informa o Referer suprimido (noreferrer) como texto vazio; Chromium e Firefox, como ausente. Vazio não
        // revela nenhum endereço e conta como ausente; qualquer valor não vazio continua reprovando.
        waRequests.push({ url, referer: req.headers()['referer'] || null });
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
  const isolated = (c) => c.target === '_blank' && /\bnoopener\b/.test(c.rel) && /\bnoreferrer\b/.test(c.rel);
  const dialog = (page) => page.locator('[data-atendimento]');
  const field = (page, name) => page.locator(`[data-atendimento] [data-campo="${name}"]`);
  /** Abre o formulário por um CTA (clique ou Enter) e espera o diálogo. */
  async function openForm(page, origem, how = 'clique') {
    const cta = page.locator(`[data-atendimento-origem="${origem}"]`);
    await cta.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    if (how === 'teclado') {
      await cta.focus();
      await page.keyboard.press('Enter');
    } else {
      await cta.click();
    }
    return page.waitForSelector('[data-atendimento]', { state: 'visible', timeout: 3000 }).then(() => true, () => false);
  }
  async function closeForm(page) {
    await page.keyboard.press('Escape');
    return page.waitForSelector('[data-atendimento]', { state: 'detached', timeout: 3000 }).then(() => true, () => false);
  }
  const checkedServices = (page) => page.$$eval('[data-atendimento] [data-servico-interesse]', (els) => els.filter((c) => c.checked).map((c) => c.getAttribute('data-servico-interesse')));
  /**
   * Preenche e envia o formulário; devolve a chamada a window.open, a aba aberta (página local), o isolamento da aba e o
   * estado do diálogo depois do envio. Nada sai da máquina: a aba do wa.me é local.
   */
  async function submitForm(page, fields = {}) {
    for (const [k, v] of Object.entries(fields)) await field(page, k).fill(v);
    const before = { open: await page.evaluate(() => window.__nkOpen.length), wa: waRequests.length };
    const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await page.locator('[data-atendimento] button[type="submit"]').click();
    const opened = await page.waitForSelector('[data-atendimento-aberto]', { timeout: 3000 }).then(() => true, () => false);
    const calls = (await page.evaluate(() => window.__nkOpen)).slice(before.open);
    let popup = null;
    let isolation = null;
    if (calls.length) {
      popup = await popupPromise;
      if (popup) {
        await popup.waitForLoadState('load').catch(() => {});
        isolation = await popup.evaluate(() => ({ opener: window.opener === null, referrer: document.referrer })).catch((e) => ({ error: e.message }));
        await popup.close();
      }
    }
    const state = await page.evaluate(() => {
      const d = document.querySelector('[data-atendimento]');
      const link = d?.querySelector('[data-whatsapp="formulario"]');
      return {
        text: d?.innerText ?? '',
        errors: [...(d?.querySelectorAll('[aria-invalid="true"]') ?? [])].map((e) => e.getAttribute('data-campo')),
        focus: document.activeElement?.getAttribute('data-campo') ?? document.activeElement?.tagName.toLowerCase() ?? null,
        focusInside: !!d?.contains(document.activeElement),
        link: link ? { href: link.getAttribute('href'), target: link.getAttribute('target'), rel: link.getAttribute('rel') ?? '' } : null,
      };
    });
    const req = waRequests.slice(before.wa).at(-1) ?? null;
    return { opened, calls, popup: !!popup, isolation, referer: req?.referer ?? null, tabUrl: req?.url ?? null, ...state };
  }
  /** O envio abriu o WhatsApp com a mensagem exata, codificada no link, numa aba isolada. */
  const sentOk = (s, expected) =>
    s.opened &&
    s.calls.length === 1 &&
    s.calls[0][0] === waHref(expected) &&
    waText(s.calls[0][0]) === expected &&
    s.calls[0][1] === '_blank' &&
    /\bnoopener\b/.test(s.calls[0][2] ?? '') &&
    /\bnoreferrer\b/.test(s.calls[0][2] ?? '') &&
    s.popup &&
    s.tabUrl === waHref(expected) &&
    s.referer == null &&
    s.isolation?.opener === true &&
    s.isolation?.referrer === '' &&
    s.link?.href === waHref(expected) &&
    isolated(s.link);
  const sentDetail = (s) =>
    `window.open=${s.calls.length} ${s.calls[0] ? `(${s.calls[0][1]}, "${s.calls[0][2]}")` : ''}; mensagem=${JSON.stringify(s.calls[0] ? waText(s.calls[0][0]) : null)?.slice(0, 200)}; aba=${s.popup ? 'wa.me (local)' : 'NENHUMA'}; sem opener=${s.isolation?.opener}; Referer=${s.referer ?? 'ausente'}; link de reserva=${s.link ? 'sim' : 'não'}`;

  // 1. CTAs: todos abrem o formulário; nenhum link direto ao WhatsApp --------------------------------------------------
  {
    const { ctx, page } = await openPage();
    check(engine, 'status-configurado', (await page.getAttribute('[data-contact-status]', 'data-contact-status')) === 'configurado');
    const ctas = await page.$$eval('[data-atendimento-origem]', (els) =>
      els.map((a) => ({
        origem: a.getAttribute('data-atendimento-origem'),
        tag: a.tagName.toLowerCase(),
        href: a.getAttribute('href'),
        haspopup: a.getAttribute('aria-haspopup'),
        target: a.getAttribute('target'),
        name: (a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim(),
      })),
    );
    check(
      engine,
      'ctas-abrem-o-formulario',
      JSON.stringify(ctas.map((c) => c.origem)) === JSON.stringify(EXPECTED_ORIGINS) && ctas.every((c) => c.tag === 'a' && c.href === '#contato' && c.haspopup === 'dialog' && c.target == null),
      ctas.map((c) => `${c.origem}: "${c.name}"`).join(' · '),
    );
    // O CTA abre um diálogo, não outra aba: o nome acessível não promete o WhatsApp em outra aba
    check(engine, 'ctas-nome-acessivel-sem-outra-aba', ctas.every((c) => c.name.length > 0 && !c.name.includes('outra aba')), ctas.filter((c) => c.name.includes('outra aba')).map((c) => c.name).join(' | ') || 'nenhum CTA anuncia outra aba');
    const direct = await page.evaluate(() => ({
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /wa\.me|whatsapp\.com|api\.whatsapp/i.test(h)),
      markers: document.querySelectorAll('[data-whatsapp]').length,
    }));
    check(engine, 'sem-link-direto-ao-whatsapp', direct.links.length === 0 && direct.markers === 0, direct.links.join(' | ') || 'o WhatsApp só abre a partir do formulário');
    // Cada CTA: diálogo, serviços pré-marcados conforme a origem, sem a opção da simulação; Esc fecha e devolve o foco
    const results = [];
    for (const origem of EXPECTED_ORIGINS) {
      const how = origem === 'topo' || origem === 'flutuante' ? 'teclado' : 'clique';
      const ok = await openForm(page, origem, how);
      const services = ok ? await checkedServices(page) : null;
      const sim = await page.locator('[data-atendimento] [data-incluir-simulacao]').count();
      const closed = await closeForm(page);
      const focusBack = await page.locator(`[data-atendimento-origem="${origem}"]`).evaluate((a) => document.activeElement === a);
      results.push({ origem, how, ok, services, sim, closed, focusBack });
    }
    check(
      engine,
      'cada-cta-abre-com-os-servicos-da-origem',
      results.every((r) => r.ok && JSON.stringify(r.services) === JSON.stringify(PRESELECTED[r.origem]) && r.sim === 0),
      results.map((r) => `${r.origem} (${r.how}): ${r.ok ? `[${r.services.join(',')}]` : 'NÃO ABRIU'}`).join(' · '),
    );
    check(engine, 'esc-fecha-e-devolve-o-foco', results.every((r) => r.closed && r.focusBack), results.map((r) => `${r.origem}: fechou=${r.closed} foco=${r.focusBack}`).join(' · '));
    check(engine, 'ctas-nao-abrem-o-whatsapp', (await page.evaluate(() => window.__nkOpen.length)) === 0 && page.url() === baseUrl, `window.open=${await page.evaluate(() => window.__nkOpen.length)}; endereço=${page.url()}`);
    await ctx.close();
  }

  // 2. Campos, aviso, validação e foco -------------------------------------------------------------------------------
  {
    const { ctx, page } = await openPage();
    const pageRequests = [];
    page.on('request', (r) => pageRequests.push(`${r.method()} ${r.resourceType()} ${r.url()}`));
    await openForm(page, 'topo');
    const form = await page.evaluate(() => {
      const d = document.querySelector('[data-atendimento]');
      const lab = (el) => (el ? document.querySelector(`label[for="${el.id}"]`)?.textContent.replace(/\*$/, '').trim() : null);
      const desc = (el) => (el?.getAttribute('aria-describedby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent.trim()).filter(Boolean).join(' ');
      const f = (k) => d.querySelector(`[data-campo="${k}"]`);
      return {
        title: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent.trim(),
        description: document.getElementById(d.getAttribute('aria-describedby') ?? '')?.textContent.trim() ?? null,
        fields: ['name', 'company', 'email', 'description'].map((k) => ({ k, tag: f(k)?.tagName.toLowerCase(), type: f(k)?.getAttribute('type'), label: lab(f(k)), required: f(k)?.required ?? null, hint: desc(f(k)), autocomplete: f(k)?.getAttribute('autocomplete'), max: f(k)?.maxLength })),
        services: [...d.querySelectorAll('[data-servico-interesse]')].map((c) => `${c.getAttribute('data-servico-interesse')}:${document.querySelector(`label[for="${c.id}"]`)?.textContent.trim()}`),
        legend: d.querySelector('fieldset legend')?.textContent.trim(),
        submit: d.querySelector('button[type="submit"]')?.textContent.replace(/\s+/g, ' ').trim(),
        forbidden: d.querySelectorAll('input[type="password"], input[type="file"], input[type="hidden"], iframe, .cf-turnstile').length,
        forms: document.querySelectorAll('form').length,
        focus: document.activeElement?.getAttribute('data-campo'),
      };
    });
    const byKey = Object.fromEntries(form.fields.map((x) => [x.k, x]));
    check(
      engine,
      'formulario-campos',
      form.title === 'Fale com um analista' &&
        form.description === 'Preencha os campos e revise a mensagem no WhatsApp antes de enviar. Nada é enviado pela página.' &&
        byKey.name.label === 'Nome' && byKey.name.required === true && byKey.name.autocomplete === 'name' &&
        byKey.company.label === 'Empresa' && byKey.company.required === false && byKey.company.hint === 'Opcional' &&
        byKey.email.label === 'E-mail' && byKey.email.type === 'email' && byKey.email.required === false && byKey.email.hint === 'Opcional' &&
        byKey.description.tag === 'textarea' && byKey.description.label === 'Descrição do processo ou necessidade' && byKey.description.required === true &&
        JSON.stringify(form.services) === JSON.stringify(Object.entries(SERVICE_NAMES).map(([k, v]) => `${k}:${v}`)) &&
        form.legend === 'Serviços de interesse' &&
        form.submit === `Abrir o WhatsApp ${SR_SUFFIX}` &&
        form.forbidden === 0 &&
        form.forms === 1 &&
        form.focus === 'name',
      `${form.fields.map((x) => `${x.label}${x.required ? '*' : ''}${x.hint ? ` (${x.hint})` : ''}`).join(' · ')} · ${form.services.join(', ')} · "${form.submit}" · foco inicial=${form.focus}`,
    );
    check(engine, 'formulario-aviso-sem-senhas', byKey.description.hint === NO_SECRETS, byKey.description.hint);
    // Nome e descrição obrigatórios: envio vazio mostra os dois erros, foco no primeiro, nada abre
    let s = await submitForm(page);
    check(
      engine,
      'validacao-campos-obrigatorios',
      !s.opened && s.calls.length === 0 && JSON.stringify(s.errors) === '["name","description"]' && s.focus === 'name' && /Informe o seu nome\./.test(s.text) && /Descreva o processo ou a necessidade\./.test(s.text),
      `erros=${s.errors.join(',')}; foco=${s.focus}; window.open=${s.calls.length}`,
    );
    // Só espaços não contam como preenchido
    s = await submitForm(page, { name: '   ', description: '  \n  ' });
    check(engine, 'validacao-espacos-nao-contam', !s.opened && s.calls.length === 0 && JSON.stringify(s.errors) === '["name","description"]', `erros=${s.errors.join(',')}`);
    // E-mail opcional, mas validado se informado
    const badEmails = [];
    for (const email of ['abc', 'nome@empresa', 'nome empresa@x.com', '@empresa.com']) {
      s = await submitForm(page, { name: 'Ana', description: 'Teste', email });
      badEmails.push(`${email}: erros=${s.errors.join(',')} foco=${s.focus} aberto=${s.calls.length}`);
      if (s.opened || s.calls.length || JSON.stringify(s.errors) !== '["email"]' || s.focus !== 'email' || !/Informe um e-mail válido ou deixe o campo em branco\./.test(s.text)) badEmails.push('(FALHOU)');
    }
    check(engine, 'validacao-email-se-informado', !badEmails.includes('(FALHOU)'), badEmails.join(' · '));
    // Corrigido: abre o WhatsApp
    s = await submitForm(page, { email: 'ana@empresa.com.br' });
    const expected = `${GREETING}\n\nNome: Ana\nE-mail: ana@empresa.com.br\n\nDescrição do processo:\nTeste`;
    check(engine, 'validacao-corrigida-abre-o-whatsapp', sentOk(s, expected), sentDetail(s));
    check(engine, 'formulario-sem-requisicao', pageRequests.length === 0 && (await page.evaluate(() => window.__nkBeacon)) === 0, pageRequests.join(' | ') || 'nenhuma requisição da página (fetch, XHR, beacon ou envio de formulário)');
    await ctx.close();
  }

  // 3. Mensagens: exatas, só os campos preenchidos, codificadas no link e recuperadas intactas --------------------------
  {
    const { ctx, page } = await openPage();
    const pageRequests = [];
    page.on('request', (r) => pageRequests.push(`${r.method()} ${r.resourceType()} ${r.url()}`));
    const storageBefore = await page.evaluate(() => ({ local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage).sort() }));
    const cases = [
      {
        id: 'minima',
        origem: 'topo',
        fields: { name: 'Ana', description: 'Conciliação diária' },
        expected: `${GREETING}\n\nNome: Ana\n\nDescrição do processo:\nConciliação diária`,
      },
      {
        id: 'completa-com-acentos-e-quebras',
        origem: 'monitor',
        extra: ['hosting'],
        fields: {
          name: '  José Ção  ',
          company: 'Açaí & Cia — Ltda.',
          email: 'jose@empresa.com.br',
          description: 'Linha 1: 50% dos pedidos\nLinha 2 com #hash, ?a=1&b=2 + "aspas" / barra\n\nLinha 4 🚀 ñ ü',
        },
        expected:
          `${GREETING}\n\nNome: José Ção\nEmpresa: Açaí & Cia — Ltda.\nE-mail: jose@empresa.com.br\n\n` +
          'Descrição do processo:\nLinha 1: 50% dos pedidos\nLinha 2 com #hash, ?a=1&b=2 + "aspas" / barra\n\nLinha 4 🚀 ñ ü' +
          `\n\nServiços de interesse:\n- ${SERVICE_NAMES.monitor}\n- ${SERVICE_NAMES.hosting}`,
      },
      {
        id: 'campos-vazios-nao-aparecem',
        origem: 'ai',
        fields: { name: 'Bia', company: '   ', email: '', description: 'Relatório semanal' },
        expected: `${GREETING}\n\nNome: Bia\n\nDescrição do processo:\nRelatório semanal\n\nServiços de interesse:\n- ${SERVICE_NAMES.ai}`,
      },
      {
        id: 'servico-desmarcado',
        origem: 'hosting-faixa',
        uncheck: ['hosting'],
        fields: { name: 'Caio', company: 'Empresa X', description: 'Executar robôs à noite' },
        expected: `${GREETING}\n\nNome: Caio\nEmpresa: Empresa X\n\nDescrição do processo:\nExecutar robôs à noite`,
      },
    ];
    for (const c of cases) {
      await openForm(page, c.origem);
      for (const id of c.extra ?? []) await page.locator(`[data-atendimento] [data-servico-interesse="${id}"]`).check();
      for (const id of c.uncheck ?? []) await page.locator(`[data-atendimento] [data-servico-interesse="${id}"]`).uncheck();
      const s = await submitForm(page, c.fields);
      const raw = s.calls[0]?.[0] ?? '';
      check(engine, `mensagem-exata:${c.id}`, sentOk(s, c.expected), sentDetail(s));
      // Codificação: o link é exatamente text=encodeURIComponent(mensagem) — sem espaço, quebra ou acento cru — e decodifica
      // de volta à mensagem (acentos, emoji, &, #, ?, +, % e quebras de linha preservados)
      const query = raw.slice(raw.indexOf('?') + 1);
      check(
        engine,
        `mensagem-codificada:${c.id}`,
        query === `text=${encodeURIComponent(c.expected)}` && !/[\s\n"<>À-ÿ]/.test(raw) && decodeURIComponent(query.slice(5)) === c.expected,
        `${raw.length} caracteres no link; ${query.slice(0, 90)}…`,
      );
      // Depois de abrir: o diálogo diz que a mensagem só chega quando o visitante a envia — nunca que foi recebida
      check(
        engine,
        `sem-afirmacao-de-recebimento:${c.id}`,
        s.text.includes('Mensagem preparada no WhatsApp') && s.text.includes(OPENED_TEXT) && !RECEIPT_CLAIM.test(s.text) && s.focusInside,
        `${s.text.replace(/\s+/g, ' ').slice(0, 200)}; foco no diálogo=${s.focusInside}`,
      );
      if (c.id === 'completa-com-acentos-e-quebras') {
        await dialog(page).screenshot({ path: shot('formulario-whatsapp-aberto.png') });
        // Link de reserva ("Abrir o WhatsApp novamente"): mesma mensagem, outra aba, sem opener e sem Referer
        const before = waRequests.length;
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
        await page.locator('[data-whatsapp="formulario"]').click();
        const popup = await popupPromise;
        if (popup) await popup.waitForLoadState('load').catch(() => {});
        const iso = popup ? await popup.evaluate(() => ({ opener: window.opener === null, referrer: document.referrer })).catch(() => null) : null;
        if (popup) await popup.close();
        const req = waRequests.slice(before).at(-1);
        check(
          engine,
          'link-de-reserva-isolado',
          !!popup && req?.url === waHref(c.expected) && req.referer == null && iso?.opener === true && iso?.referrer === '',
          `aba=${!!popup}; mesma mensagem=${req?.url === waHref(c.expected)}; Referer=${req?.referer ?? 'ausente'}; sem opener=${iso?.opener}`,
        );
        // "Voltar ao formulário" mantém o que foi digitado
        await page.getByRole('button', { name: 'Voltar ao formulário' }).click();
        const kept = await field(page, 'company').inputValue().catch(() => null);
        const again = await submitForm(page);
        check(engine, 'voltar-ao-formulario-mantem-os-campos', kept === c.fields.company && sentOk(again, c.expected), `empresa="${kept}"; reenvio com a mesma mensagem=${sentOk(again, c.expected)}`);
      }
      // Fechar depois de abrir o WhatsApp: nada fica na memória da página — reabrir mostra o formulário vazio
      await page.getByRole('button', { name: 'Fechar', exact: true }).last().click();
      await page.waitForSelector('[data-atendimento]', { state: 'detached', timeout: 3000 }).catch(() => {});
      await openForm(page, 'contato');
      const reopened = await page.evaluate(() => ['name', 'company', 'email', 'description'].map((k) => document.querySelector(`[data-atendimento] [data-campo="${k}"]`)?.value ?? null));
      check(engine, `fechar-descarta-os-dados:${c.id}`, reopened.every((v) => v === ''), JSON.stringify(reopened));
      await closeForm(page);
    }
    // Armazenamento e rede durante todas as mensagens: só o tema no localStorage, nenhuma requisição da página
    const storageAfter = await page.evaluate(async () => ({
      local: Object.keys(localStorage).sort(),
      session: Object.keys(sessionStorage).sort(),
      cookie: document.cookie,
      idb: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((d) => d.name) : [],
    }));
    check(
      engine,
      'formulario-sem-armazenamento',
      storageAfter.local.every((k) => k === THEME_KEY) &&
        JSON.stringify(storageAfter.local) === JSON.stringify(storageBefore.local) &&
        JSON.stringify(storageAfter.session) === JSON.stringify(storageBefore.session) &&
        storageAfter.session.every((k) => k === '__nk_seeded') &&
        storageAfter.cookie === '' &&
        storageAfter.idb.length === 0,
      `localStorage=${storageAfter.local.join(',') || '—'}; sessionStorage=${storageAfter.session.join(',') || '—'} (só a semente do teste); cookie=${storageAfter.cookie || '—'}; IndexedDB=${storageAfter.idb.join(',') || '—'}`,
    );
    check(engine, 'mensagens-sem-requisicao-da-pagina', pageRequests.length === 0 && (await page.evaluate(() => window.__nkBeacon)) === 0, pageRequests.join(' | ') || 'nenhuma requisição da página em 4 envios');
    // Número oficial no link e nenhum vestígio do número anterior
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const urls = (await page.evaluate(() => window.__nkOpen.map((c) => c[0]))).join(' ');
    const old = PREVIOUS_WHATSAPP.filter((n) => html.includes(n) || urls.includes(n));
    check(engine, 'whatsapp-numero-da-publicacao', old.length === 0 && (await page.evaluate(() => window.__nkOpen.every((c) => c[0].startsWith('https://wa.me/')))) && urls.split(' ').every((u) => u.startsWith(`https://wa.me/${NUMBER}?text=`)), `${PRODUCTION ? 'oficial' : 'sintético'} ${NUMBER}; número anterior: ${old.join(', ') || 'ausente'}`);
    await ctx.close();
  }

  // 4. Diálogo pelo teclado: foco preso no diálogo (Tab e Shift+Tab) e Esc devolvendo o foco ---------------------------
  {
    const { ctx, page } = await openPage();
    await openForm(page, 'contato', 'teclado');
    const outside = [];
    for (const key of [...Array(16).fill('Tab'), ...Array(16).fill('Shift+Tab')]) {
      await page.keyboard.press(key);
      const inside = await page.evaluate(() => !!document.querySelector('[data-atendimento]')?.contains(document.activeElement));
      if (!inside) outside.push(key);
    }
    const inert = await page.evaluate(() => {
      const main = document.querySelector('main');
      return !!main?.closest('[inert]') || main?.inert === true || [...document.body.children].some((c) => c.inert && c.contains(main));
    });
    const closed = await closeForm(page);
    const back = await page.locator('[data-atendimento-origem="contato"]').evaluate((a) => document.activeElement === a);
    check(engine, 'dialogo-prende-o-foco', outside.length === 0 && inert && closed && back, `fora do diálogo em ${outside.length} de 32 teclas; página inerte=${inert}; Esc fechou=${closed}; foco de volta no CTA=${back}`);
    await ctx.close();
  }

  // 5. Ausência: mailto, Bookings, "Agendar", instrução de envio por e-mail, Turnstile, iframe, script externo ----------
  {
    const { ctx, page } = await openPage();
    const read = () =>
      page.evaluate(
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
            fields: [...document.querySelectorAll('input, textarea, select')].filter((e) => !e.matches('[data-sim-input]') && !e.closest('[data-atendimento]')).length,
            mailto: hrefs.filter((h) => /^mailto:/i.test(h)),
            bookings: hrefs.filter((h) => hosts.includes(host(h)) || /bookings|\/book\//i.test(h)),
            agendar: /\bagendar\b|agende/i.test(text) || document.querySelectorAll('[data-agendamento], [data-agendar]').length > 0,
            emailInstruction: text.match(new RegExp(instr.source, instr.flags))?.[0] ?? null,
            scripts: [...document.scripts].map((s) => s.src).filter((s) => s && !s.startsWith(location.origin)),
            iframes: document.querySelectorAll('iframe, .cf-turnstile, [data-sitekey]').length,
          };
        },
        { hosts: BOOKINGS_HOSTS, instr: { source: EMAIL_INSTRUCTION.source, flags: EMAIL_INSTRUCTION.flags } },
      );
    const closed = await read();
    await openForm(page, 'topo');
    const open = await read();
    check(engine, 'formulario-so-no-dialogo', closed.forms === 0 && closed.fields === 0 && open.forms === 1 && open.fields === 0, `fechado: form=${closed.forms}; aberto: form=${open.forms}; campos fora do simulador e do diálogo=${open.fields}`);
    for (const [id, a] of [
      ['fechado', closed],
      ['aberto', open],
    ]) {
      check(engine, `sem-mailto:${id}`, a.mailto.length === 0, a.mailto.join(' | ') || 'nenhum link mailto');
      check(engine, `sem-link-do-bookings:${id}`, a.bookings.length === 0 && !a.agendar, a.bookings.join(' | ') || `nenhum link para ${BOOKINGS_HOSTS.join(', ')}; nenhum "Agendar"`);
      check(engine, `sem-instrucao-de-envio-por-email:${id}`, a.emailInstruction === null, a.emailInstruction ?? 'nenhuma');
      check(engine, `sem-turnstile-script-ou-iframe-externo:${id}`, a.scripts.length === 0 && a.iframes === 0, a.scripts.join(' | ') || 'nenhum (sem Turnstile, sem widget)');
    }
    await closeForm(page);
    // E-mail só como texto: identificação do fornecedor (rodapé) e canal dos direitos (privacidade)
    const email = publicacao.canais.email;
    const emailText = await page.evaluate((e) => ({ footer: (document.querySelector('footer [data-supplier]')?.textContent ?? '').includes(e), privacy: (document.querySelector('#privacidade')?.textContent ?? '').includes(e) }), email);
    check(engine, 'email-so-como-texto', emailText.footer && emailText.privacy && closed.mailto.length === 0, `${email}: rodapé=${emailText.footer}; privacidade=${emailText.privacy}; sem link`);
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
    // #contato por âncora: carregamento novo, nenhum diálogo aparece sozinho (espera limitada que falha se aparecer)
    await page.goto('about:blank');
    await page.goto(new URL('#contato', baseUrl).href, { waitUntil: 'networkidle' });
    const dlg = await page.waitForSelector('[role="dialog"], dialog[open]', { state: 'attached', timeout: 1500 }).then(() => true, () => false);
    check(engine, 'contato-por-ancora-sem-dialogo', !dlg, dlg ? 'um diálogo abriu' : 'nenhum diálogo');
    await page.locator('#contato').screenshot({ path: shot('contato.png'), style: '.nk-fab { visibility: hidden !important; }' });
    await ctx.close();
  }

  // 6. Botão flutuante "Fale com um analista": temas × desktop/celular ------------------------------------------------
  for (const theme of THEMES) {
    for (const vp of [
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'celular', width: 390, height: 844 },
    ]) {
      const tag = `${theme}:${vp.name}`;
      // reducedMotion 'no-preference': o pulso da lib só seria visível assim — prova que não há animação
      const { ctx, page } = await openPage({ viewport: { width: vp.width, height: vp.height }, theme, reducedMotion: 'no-preference' });
      const fab = page.locator('.nk-fab');
      /** Espera o fim de qualquer transição do botão (posição e opacidade finais): o Firefox mede no meio da transição. */
      const settle = (tucked) =>
        page
          .waitForFunction((t) => {
            const el = document.querySelector('.nk-fab');
            return !!el && el.classList.contains('fab--tucked') === t && el.getAnimations({ subtree: true }).length === 0;
          }, tucked, { timeout: 3000 })
          .then(() => true, () => false);
      // No celular o botão fica recolhido no topo (o CTA do topo faz a mesma coisa): as medições começam em Preços, onde
      // ele aparece. Se continuar recolhido, as verificações abaixo falham (sem espera fixa).
      await page.evaluate(() => document.getElementById('precos')?.scrollIntoView({ block: 'start' }));
      await settle(false);
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
            haspopup: el.getAttribute('aria-haspopup'),
            origem: el.getAttribute('data-atendimento-origem'),
            classes: el.className,
            tooltip: el.querySelectorAll('.nk-fab__tooltip').length,
            online: el.querySelectorAll('.nk-fab__badge, [class*="online"], [class*="status"], [class*="dot"]').length,
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
        i0.count === 1 && i0.text === FAB_TEXT && i0.textVisible && i0.icon && i0.aria === FAB_TEXT && i0.tooltip === 0 && i0.online === 0 && /nk-fab--whatsapp/.test(i0.classes),
        `texto="${i0.text}" visível=${i0.textVisible}; ícone do WhatsApp=${i0.icon}; aria-label="${i0.aria}"; tooltip=${i0.tooltip}; indicador "online"=${i0.online}`,
      );
      check(
        engine,
        `flutuante-abre-o-formulario:${tag}`,
        i0.href === '#contato' && i0.haspopup === 'dialog' && i0.origem === 'flutuante' && i0.target == null,
        `href=${i0.href}; aria-haspopup=${i0.haspopup}; origem=${i0.origem}; target=${i0.target ?? '(nenhum)'}`,
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
      // Posição: canto inferior direito, dentro da janela, respeitando o afastamento da lib (24 px; 16 px até 640 px)
      const offset = vp.width <= 640 ? 16 : 24;
      const gapR = i0.vw - i0.box.r;
      const gapB = i0.vh - i0.box.b;
      check(
        engine,
        `flutuante-dentro-da-tela:${tag}`,
        i0.box.x >= 0 && i0.box.y >= 0 && Math.abs(gapR - offset) <= 1 && Math.abs(gapB - offset) <= 1 && (i0.box.x + i0.box.r) / 2 > i0.vw / 2,
        `direita ${gapR.toFixed(1)}px, base ${gapB.toFixed(1)}px (esperado ${offset}px); x=${i0.box.x.toFixed(0)}`,
      );
      // Teclado: recebe foco com Tab a partir do último link do rodapé (WebKit: foco programático) e abre com Enter
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
      // Fim da página: o botão não cobre nenhum texto nem link do rodapé (inclusive a linha legal do fornecedor)
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const atBottom = await page
        .waitForFunction(() => Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1, null, { timeout: 3000 })
        .then(() => true, () => false);
      await settle(false);
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
        // No topo o CTA do hero já abre o formulário: o flutuante também fica recolhido ali
        await page.evaluate(() => window.scrollTo(0, 0));
        const topo = await settle(true);
        const tp = await info();
        check(engine, `flutuante-recolhido-com-o-cta-do-topo:${tag}`, topo && tp.ariaHidden === 'true' && tp.tabIndex === -1, `aria-hidden=${tp.ariaHidden}; tabIndex=${tp.tabIndex}`);
        // fora do topo e do contato (preços), ele volta
        await page.evaluate(() => document.getElementById('precos')?.scrollIntoView({ block: 'start' }));
        const back = await settle(false);
        const b = await info();
        check(engine, `flutuante-volta-fora-do-contato:${tag}`, back && b.ariaHidden == null && b.tabIndex === 0 && b.opacity === '1', `aria-hidden=${b.ariaHidden}; tabIndex=${b.tabIndex}; opacity=${b.opacity}`);
      } else {
        // espera limitada: se o botão se recolher no desktop, a verificação falha
        const tucked = await page.waitForSelector('.nk-fab.fab--tucked', { state: 'attached', timeout: 1500 }).then(() => true, () => false);
        check(engine, `flutuante-visivel-com-o-contato:${tag}`, !tucked, tucked ? 'recolhido no desktop' : 'continua visível');
      }
      // Clique no flutuante (em Preços, fora do topo e do contato): abre o formulário, sem serviço marcado, sem abrir o
      // WhatsApp; Esc devolve o foco ao botão
      if (theme === 'sage-light') {
        await page.evaluate(() => document.getElementById('precos')?.scrollIntoView({ block: 'start' }));
        await settle(false);
        await fab.click();
        const opened = await page.waitForSelector('[data-atendimento]', { state: 'visible', timeout: 3000 }).then(() => true, () => false);
        const services = opened ? await checkedServices(page) : null;
        const calls = await page.evaluate(() => window.__nkOpen.length);
        if (vp.name === 'celular') {
          // contexto sem redução de movimento: a captura espera o fim da animação de entrada do diálogo
          await page
            .waitForFunction(() => document.querySelector('.nk-dialog-root')?.getAnimations({ subtree: true }).length === 0, null, { timeout: 3000 })
            .catch(() => {});
          await page.screenshot({ path: shot('formulario-celular.png') });
        }
        const closed = await closeForm(page);
        const back = await fab.evaluate((el) => document.activeElement === el);
        check(engine, `flutuante-clique-abre-o-formulario:${vp.name}`, opened && JSON.stringify(services) === '[]' && calls === 0 && closed && back, `diálogo=${opened}; serviços=[${(services ?? []).join(',')}]; window.open=${calls}; foco de volta=${back}`);
      }
      await ctx.close();
    }
  }

  // Fixture negativa: a CSP do build libera o endpoint (uma chamada passaria) — e mesmo assim nenhuma é feita
  if (ENDPOINT_ORIGIN) {
    const csp = (await fetch(baseUrl).then((r) => r.headers.get('content-security-policy'))) ?? '';
    check(engine, 'negativa-csp-libera-o-endpoint', csp.includes(ENDPOINT_ORIGIN), `connect-src com ${ENDPOINT_ORIGIN}: ${csp.includes(ENDPOINT_ORIGIN)}`);
  }
  const foreign = requests.filter((r) => !r.url.startsWith(origin) && !r.url.startsWith('https://wa.me/') && !/^(data|blob|about):/.test(r.url));
  const writes = requests.filter((r) => r.method !== 'GET' || ['fetch', 'xhr', 'ping', 'beacon', 'eventsource', 'websocket'].includes(r.type) && !/\/release\.json/.test(r.url));
  check(
    engine,
    'sem-requisicao-a-api',
    foreign.length === 0 && writes.length === 0 && (!ENDPOINT_ORIGIN || !requests.some((r) => r.url.startsWith(ENDPOINT_ORIGIN))),
    `${requests.length} requisições: só ${origin} e as abas locais do wa.me; fora disso: ${foreign.map((r) => r.url).join(' | ') || 'nenhuma'}; não-GET, fetch, XHR ou beacon: ${writes.map((r) => `${r.method} ${r.type} ${r.url}`).join(' | ') || 'nenhuma'}`,
  );
  check(engine, 'sem-requisicao-externa-real', aborted.length === 0, aborted.join(' | ') || 'wa.me respondido localmente; nenhuma outra requisição externa');
  check(engine, 'console-sem-erros', errors.length === 0, errors.join(' | ') || 'limpo');
  const version = browser.version();
  await browser.close();
  return { engine, version, waRequests: waRequests.map((r) => ({ ...r, url: `${r.url.slice(0, 60)}…` })), aborted };
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
  `# Atendimento: formulário → WhatsApp (NEKKORA-COM-ECOSYSTEM-001) — ${new Date().toISOString()}`,
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
