#!/usr/bin/env node
/**
 * Jornada de conversão (COM-RELEASE-002 §5.2/§5.3) com canais configurados — em Chromium, Firefox e WebKit.
 *
 * Roda contra um build de homologação feito com dados SINTÉTICOS (nunca versionados como reais), servido pelo servidor
 * local que reproduz o CloudFront (CSP e cabeçalhos da política versionada):
 *   NEKKORA_PUBLICACAO=scripts/fixtures/publicacao-homologacao.json npx vite build --outDir dist-homologacao
 *   node scripts/servidor-cloudfront-local.mjs --dist dist-homologacao --porta 4175
 *   node scripts/homologacao-canais.mjs http://127.0.0.1:4175/ <pasta-de-saida> [chromium,firefox,webkit]
 *
 * NEKKORA_CANAL=email: jornada pelo e-mail (a publicação atual — só e-mail e LinkedIn), contra o build feito com
 * scripts/fixtures/publicacao-homologacao-email.json. O aplicativo de e-mail fica fora do navegador: o teste registra o
 * mailto que o navegador receberia (e impede que um aplicativo real abra), sem trocar o comportamento da página.
 *
 * Vigência da campanha (COM-RELEASE-003-R1, item 10): o relógio do navegador é fixado antes, durante e depois do
 * período sintético (01/11/2026 a 31/12/2026, fuso de Brasília).
 *
 * Valores esperados (fixture): WhatsApp 5511912345678, e-mail contato@exemplo.invalid, LinkedIn com caminho de perfil
 * e Instagram apontando para a página inicial (deve ser REJEITADO). Nenhuma requisição sai da máquina: o wa.me é
 * respondido por uma página local de teste (registrando URL e Referer) e todo o resto é abortado.
 *
 * Jornada: visitante → serviços → condições → "Solicitar avaliação" → informa a necessidade → confirma a mensagem
 * (com o aviso do que vai para o WhatsApp) → WhatsApp. Também cobre: voltar e editar, link direto, alternativa manual
 * (copiar mensagem, número, e-mail), WhatsApp que não abre, celular 375 px e axe na etapa de confirmação.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { BOOKINGS_HOSTS } from '../src/agendamento-url.js';

const [, , baseUrl = 'http://127.0.0.1:4175/', outDir = 'docs/release/evidencias/conversao', enginesArg = 'chromium,firefox,webkit'] = process.argv;
const modules = process.env.NEKKORA_PW_MODULES;
const require = createRequire(modules ? path.resolve(modules, 'noop.js') : import.meta.url);
const playwright = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
mkdirSync(outDir, { recursive: true });

const NUMBER = '5511912345678';
const NUMBER_DISPLAY = '+55 11 91234-5678';
const EMAIL = 'contato@exemplo.invalid';
const LINKEDIN = 'https://www.linkedin.com/company/exemplo-homologacao/';
const NEUTRAL = /Pedimos ao navegador para abrir o WhatsApp/;
const OVERCLAIM = /WhatsApp aberto|aberto em uma nova aba|enviad[ao] com sucesso|mensagem enviada|recebemos sua/i;
const FORM = { name: 'Pessoa de Teste', company: 'Empresa Sintética', email: 'pessoa@exemplo.invalid', message: 'Conferimos todo dia os pagamentos do banco com o sistema financeiro, manualmente (teste de homologação).' };
/** Mesma montagem de src/sections/Contact.tsx (buildMessage) — o teste confere o texto exato. */
const EXPECTED = [`Olá! Sou ${FORM.name}, da ${FORM.company}.`, 'Quero solicitar uma avaliação de automação.', FORM.message, `E-mail para retorno: ${FORM.email}`].join('\n\n');

const CHANNEL = process.env.NEKKORA_CANAL ?? 'whatsapp';
const SUBJECT = 'Solicitação de avaliação — Nekkora';
/** Durante a campanha sintética da fixture (01/11 a 31/12/2026). */
const IN_CAMPAIGN = new Date('2026-11-15T12:00:00-03:00');
const checks = [];
const check = (engine, id, ok, detail) => {
  checks.push({ engine, id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} [${engine}] ${id}${detail ? ` — ${detail}` : ''}`);
};
const origin = new URL(baseUrl).origin;

async function run(engine) {
  const shot = (name) => path.join(outDir, `${engine}-${name}`);
  const browser = await playwright[engine].launch();
  const aborted = [];
  const waRequests = [];
  let failWhatsapp = false;
  async function newContext(viewport = { width: 1280, height: 800 }, at = IN_CAMPAIGN) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await ctx.clock.setFixedTime(at);
    if (engine === 'chromium') await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
    // A página não pode usar window.open (link comum não é barrado por bloqueador de pop-up): conta qualquer chamada.
    await ctx.addInitScript(() => {
      window.__openCalls = 0;
      const original = window.open;
      window.open = (...a) => {
        window.__openCalls++;
        return original.apply(window, a);
      };
    });
    await ctx.route('**/*', (route) => {
      const req = route.request();
      const url = req.url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank') return route.continue();
      if (url.startsWith('https://wa.me/')) {
        waRequests.push({ url, referer: req.headers()['referer'] ?? null });
        if (failWhatsapp) return route.abort('internetdisconnected');
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>wa.me (página de teste local)</title><h1>wa.me — página de teste local</h1>' });
      }
      aborted.push(url);
      return route.abort();
    });
    return ctx;
  }
  const errors = [];
  const watch = (page) => {
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  };

  // 1. Página com canais configurados ---------------------------------------------------------------------------
  const ctx = await newContext();
  const page = await ctx.newPage();
  watch(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const links = await page.$$eval('a[href]', (els) => els.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '' })).filter((l) => !l.href.startsWith('#')));
  check(engine, 'status-configurado', (await page.getAttribute('[data-contact-status]', 'data-contact-status')) === 'configurado');
  const wa = links.filter((l) => l.href.startsWith(`https://wa.me/${NUMBER}?`));
  check(engine, 'whatsapp-links-isolados', wa.length > 0 && wa.every((l) => l.target === '_blank' && l.rel.includes('noopener') && l.rel.includes('noreferrer')), `${wa.length} link(s) wa.me, todos com target=_blank e rel noopener noreferrer`);
  check(engine, 'email-exibido', links.some((l) => l.href === `mailto:${EMAIL}`));
  check(engine, 'linkedin-perfil-exibido', links.some((l) => l.href === LINKEDIN));
  check(engine, 'instagram-pagina-inicial-rejeitado', !links.some((l) => l.href.includes('instagram.com')), 'URL sem caminho de perfil não vira link');
  check(engine, 'botao-flutuante-presente', (await page.locator('.nk-fab, a.nk-floating-button, [class*="floating"]').count()) > 0);
  check(engine, 'aviso-canais-pendentes-ausente', (await page.getByText('Canais oficiais em definição').count()) === 0);
  check(engine, 'contato-direto-sem-formulario', /Prefere falar direto\?/.test(await page.locator('#contato').innerText()));

  // 2. Jornada: conhecer serviços → condições → solicitar avaliação ---------------------------------------------
  await page.locator('#solucoes').scrollIntoViewIfNeeded();
  const pricing = await page.locator('#precos').innerText();
  check(engine, 'condicoes-com-vigencia', /de 01\/11\/2026 a 31\/12\/2026/.test(pricing) && /50% na contratação e 50% na entrega/.test(pricing), 'datas sintéticas da fixture exibidas por extenso');
  await page.locator('#inicio [aria-haspopup="dialog"]').click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const direct = dialog.getByRole('link', { name: /Falar diretamente pelo WhatsApp/ });
  check(engine, 'dialogo-whatsapp-direto', (await direct.count()) === 1 && (await direct.getAttribute('rel'))?.includes('noreferrer'));
  const submit = dialog.locator('button[type="submit"]');
  check(engine, 'botao-revisar-mensagem', /Revisar mensagem/.test(await submit.innerText()));
  await submit.click();
  check(engine, 'validacao-campos-obrigatorios', (await dialog.locator('[aria-invalid="true"]').count()) === 2, 'nome e descrição');
  const form = dialog.locator('form');
  await form.getByLabel(/^Nome/).fill(FORM.name);
  await form.getByLabel(/^Empresa/).fill(FORM.company);
  await form.getByLabel(/^E-mail/).fill('email-invalido');
  await form.getByLabel(/Descreva o processo/).fill(FORM.message);
  await submit.click();
  check(engine, 'validacao-email-opcional-mas-valido', (await dialog.locator('[aria-invalid="true"]').count()) === 1);
  await form.getByLabel(/^E-mail/).fill(FORM.email);
  await page.screenshot({ path: shot('passo-1-formulario.png') });
  await submit.click();

  // 3. Confirmar solicitação: mensagem exata, aviso de transferência, nada aberto ainda -------------------------
  const pre = dialog.getByTestId('mensagem-solicitacao');
  await pre.waitFor();
  const shown = (await pre.innerText()).replace(/\r/g, '');
  const reviewText = await dialog.innerText();
  check(engine, 'confirmacao-mensagem-exata', shown.trim() === EXPECTED, shown.split('\n')[0]);
  check(engine, 'confirmacao-avisa-transferencia', /WhatsApp \(serviço da Meta\)/.test(reviewText) && /só chega à Nekkora se você tocar em enviar/.test(reviewText));
  check(engine, 'confirmacao-sem-abrir-nada', waRequests.length === 0, `${waRequests.length} requisição(ões) ao wa.me antes da confirmação`);
  check(engine, 'confirmacao-foco-no-conteudo', await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')));
  check(engine, 'confirmacao-numero-manual', reviewText.includes(NUMBER_DISPLAY), NUMBER_DISPLAY);
  await page.screenshot({ path: shot('passo-2-confirmacao.png') });

  // Voltar e editar preserva os dados
  await dialog.getByRole('button', { name: /Voltar e editar/ }).click();
  check(engine, 'voltar-preserva-dados', (await form.getByLabel(/Descreva o processo/).inputValue()) === FORM.message);
  await submit.click();
  await pre.waitFor();

  // Copiar mensagem (alternativa manual): o resultado é sempre informado
  await dialog.getByRole('button', { name: /Copiar mensagem/ }).click();
  // a cópia é assíncrona: espera o aviso aparecer (até 3 s)
  await page.waitForFunction(() => document.querySelector('[data-testid="status-copia"]')?.textContent.trim(), null, { timeout: 3000 }).catch(() => {});
  const copyStatus = await dialog.getByTestId('status-copia').innerText();
  let clip = null;
  if (engine === 'chromium') clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
  check(engine, 'copiar-mensagem-informa-resultado', /Mensagem copiada|Não foi possível copiar/.test(copyStatus) && (clip == null || clip.replace(/\r/g, '') === EXPECTED), `${copyStatus}${clip != null ? ` · área de transferência = mensagem: ${clip.replace(/\r/g, '') === EXPECTED}` : ''}`);

  // 4. Abrir o WhatsApp: link do próprio clique, sem opener e sem Referer ---------------------------------------
  const openBtn = dialog.getByRole('link', { name: /Abrir no WhatsApp/ });
  const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
  await openBtn.click();
  const popup = await popupPromise;
  if (popup) await popup.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(300);
  const req = waRequests.at(-1);
  const sentText = req ? new URL(req.url).searchParams.get('text') : null;
  check(engine, 'whatsapp-com-mensagem-exata', req?.url.startsWith(`https://wa.me/${NUMBER}?`) && sentText === EXPECTED, req ? 'texto do parâmetro = mensagem confirmada' : 'nenhuma requisição ao wa.me');
  const isolation = popup ? await popup.evaluate(() => ({ opener: window.opener === null, referrer: document.referrer })).catch((e) => ({ error: e.message })) : null;
  check(engine, 'aba-sem-opener', isolation?.opener === true, JSON.stringify(isolation));
  check(engine, 'aba-sem-referer', req != null && req.referer == null && isolation?.referrer === '', `Referer=${req?.referer ?? 'ausente'}; document.referrer="${isolation?.referrer ?? '?'}"`);
  check(engine, 'sem-window-open', (await page.evaluate(() => window.__openCalls)) === 0, 'aberto por link, não por pop-up');
  if (popup) {
    await popup.screenshot({ path: shot('passo-4-whatsapp-pagina-de-teste.png') });
    await popup.close();
  }
  const after = await dialog.innerText();
  check(engine, 'mensagem-neutra-sem-afirmar-envio', NEUTRAL.test(after) && !OVERCLAIM.test(after), after.split('\n').find((l) => NEUTRAL.test(l)) ?? after.slice(0, 80));
  const manual = dialog.locator('.contact__done a[href^="https://wa.me/"]');
  check(engine, 'link-manual-depois-da-abertura', (await manual.count()) === 1 && (await manual.getAttribute('rel'))?.includes('noreferrer'));
  check(engine, 'alternativas-manuais', after.includes(NUMBER_DISPLAY) && after.includes(EMAIL) && /Copiar mensagem/.test(after));
  await page.screenshot({ path: shot('passo-3-whatsapp-solicitado.png') });
  await ctx.close();

  // 5. WhatsApp que não abre (rede/aplicativo indisponível): a página continua oferecendo as alternativas -------
  {
    failWhatsapp = true;
    const c2 = await newContext();
    const p2 = await c2.newPage();
    watch(p2);
    await p2.goto(baseUrl, { waitUntil: 'networkidle' });
    await p2.locator('#contato [aria-haspopup="dialog"]').click();
    const d2 = p2.getByRole('dialog');
    await d2.locator('form').getByLabel(/^Nome/).fill(FORM.name);
    await d2.locator('form').getByLabel(/Descreva o processo/).fill(FORM.message);
    await d2.locator('button[type="submit"]').click();
    const pp = p2.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
    await d2.getByRole('link', { name: /Abrir no WhatsApp/ }).click();
    const failed = await pp;
    if (failed) await failed.waitForLoadState().catch(() => {});
    await p2.waitForTimeout(300);
    const t = await d2.innerText();
    check(engine, 'whatsapp-falhou-alternativas-visiveis', NEUTRAL.test(t) && !OVERCLAIM.test(t) && t.includes(NUMBER_DISPLAY) && /Copiar mensagem/.test(t) && (await d2.locator('.contact__done a[href^="https://wa.me/"]').count()) === 1);
    await d2.screenshot({ path: shot('whatsapp-nao-abriu.png') });
    if (failed) await failed.close();
    await c2.close();
    failWhatsapp = false;
  }

  // 6. Celular (375 px): a jornada cabe na tela, sem rolagem horizontal --------------------------------------------
  {
    const c3 = await newContext({ width: 375, height: 812 });
    const p3 = await c3.newPage();
    watch(p3);
    await p3.goto(baseUrl, { waitUntil: 'networkidle' });
    await p3.locator('#inicio [aria-haspopup="dialog"]').click();
    const d3 = p3.getByRole('dialog');
    await d3.locator('form').getByLabel(/^Nome/).fill(FORM.name);
    await d3.locator('form').getByLabel(/Descreva o processo/).fill(FORM.message);
    await d3.locator('button[type="submit"]').click();
    await d3.getByTestId('mensagem-solicitacao').waitFor();
    const open = d3.getByRole('link', { name: /Abrir no WhatsApp/ });
    await open.scrollIntoViewIfNeeded();
    const box = await open.boundingBox();
    const overflow = await p3.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    // O painel do diálogo inteiro precisa caber na tela e nenhum filho pode alargá-lo (rolagem horizontal interna).
    const panel = await p3.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const r = d.getBoundingClientRect();
      const wide = [...d.querySelectorAll('*')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.left < r.left - 0.5 || b.right > r.right + 0.5); }).length;
      return { left: r.left, right: r.right, scroll: d.scrollWidth - d.clientWidth, wide };
    });
    const fits = overflow <= 0 && panel.left >= 0 && panel.right <= 375 && panel.scroll <= 0 && panel.wide === 0 && box && box.x >= panel.left && box.x + box.width <= panel.right;
    check(engine, 'celular-confirmacao-cabe', fits, `página: excesso=${overflow}px; diálogo ${panel.left.toFixed(0)}–${panel.right.toFixed(0)}px, rolagem interna=${panel.scroll}px, filhos fora=${panel.wide}; botão x=${box?.x?.toFixed(0)} w=${box?.width?.toFixed(0)}`);
    const fab = await p3.locator('.nk-fab, [class*="floating"]').first();
    check(engine, 'celular-botao-flutuante-recolhido-com-dialogo', (await fab.getAttribute('aria-hidden')) === 'true');
    await p3.screenshot({ path: shot('celular-confirmacao.png') });
    // axe na etapa de confirmação (mesmo contexto)
    await p3.evaluate(axeSource); // evaluate: a CSP da página bloqueia script inline
    const violations = await p3.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document.querySelector('[role="dialog"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return r.violations.map((v) => `${v.id}(${v.nodes.length})`);
    });
    check(engine, 'axe-etapa-de-confirmacao', violations.length === 0, violations.join(', ') || 'sem violações');
    await c3.close();
  }

  await campaign(engine, newContext);
  check(engine, 'sem-requisicao-externa-real', aborted.length === 0, aborted.join(' | ') || 'wa.me respondido localmente; nenhuma outra requisição externa');
  check(engine, 'console-sem-erros', errors.length === 0, errors.join(' | ') || 'limpo');
  const version = browser.version();
  await browser.close();
  return { engine, version, waRequests: waRequests.map((r) => ({ ...r, url: r.url.slice(0, 60) + '…' })), aborted };
}

/** Vigência: antes e depois do período, só o preço padrão; durante, os preços de lançamento com o período por extenso. */
async function campaign(engine, newContext) {
  const read = async (at) => {
    const ctx = await newContext({ width: 1280, height: 800 }, at);
    const p = await ctx.newPage();
    await p.goto(baseUrl, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => ({
      text: document.querySelector('[data-pricing]').innerText,
      struck: document.querySelectorAll('[data-pricing] s').length,
      values: [...document.querySelectorAll('[data-price-tier] [data-price]')].map((e) => `${e.closest('[data-price-tier]').dataset.priceTier}:${e.dataset.price}=${e.textContent.trim()}`),
    }));
    await ctx.close();
    return r;
  };
  const during = await read(IN_CAMPAIGN);
  check(
    engine,
    'vigencia-durante-campanha',
    /Preços especiais de lançamento para propostas aprovadas de 01\/11\/2026 a 31\/12\/2026\./.test(during.text) && during.struck === 2 && during.values.includes('simples:lancamento=R$ 1.000') && during.values.includes('media:lancamento=R$ 2.800'),
    during.values.join(' · '),
  );
  const standardOnly = ['simples:padrao=R$ 1.500', 'media:padrao=R$ 3.500'];
  for (const [id, at] of [
    ['vigencia-antes-do-inicio', new Date('2026-10-31T23:30:00-03:00')],
    // 01/01/2027 00h30 em Brasília: a campanha já acabou
    ['vigencia-depois-do-fim', new Date('2027-01-01T00:30:00-03:00')],
  ]) {
    const r = await read(at);
    check(engine, id, JSON.stringify(r.values) === JSON.stringify(standardOnly) && r.struck === 0 && !/[Ll]ançamento/.test(r.text) && !/R\$ 1\.000|R\$ 2\.800|Economia/.test(r.text), r.values.join(' · '));
  }
  // último dia ainda vale: 31/12 às 23h30 em Brasília já é 01/01 em UTC
  const last = await read(new Date('2026-12-31T23:30:00-03:00'));
  check(engine, 'vigencia-ultimo-dia-no-fuso-de-brasilia', last.values.includes('simples:lancamento=R$ 1.000'), last.values.join(' · '));
}

/** Jornada pelo e-mail — canal da publicação atual (decisão da titular de 22/10/2026). */
async function runEmail(engine) {
  const shot = (name) => path.join(outDir, `${engine}-${name}`);
  const browser = await playwright[engine].launch();
  const aborted = [];
  const errors = [];
  async function newContext(viewport = { width: 1280, height: 800 }, at = IN_CAMPAIGN) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await ctx.clock.setFixedTime(at);
    if (engine === 'chromium') await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
    await ctx.addInitScript(() => {
      window.__openCalls = 0;
      const original = window.open;
      window.open = (...a) => {
        window.__openCalls++;
        return original.apply(window, a);
      };
      // mailto: registra o endereço que o navegador entregaria ao aplicativo de e-mail e impede que um aplicativo real
      // abra. A página não depende disso: o próprio clique muda a etapa (o React trata o evento na raiz, depois daqui).
      window.__mailto = [];
      document.addEventListener(
        'click',
        (e) => {
          const a = e.target instanceof Element ? e.target.closest('a[href^="mailto:"]') : null;
          if (a) {
            window.__mailto.push(a.href);
            e.preventDefault();
          }
        },
        true,
      );
    });
    await ctx.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank') return route.continue();
      aborted.push(url);
      return route.abort();
    });
    return ctx;
  }
  const watch = (page) => {
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  };
  const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;
  const CRLF = EXPECTED.replace(/\n/g, '\r\n');
  const parseMailto = (href) => {
    const u = new URL(href);
    return { to: decodeURIComponent(u.pathname), subject: u.searchParams.get('subject'), body: u.searchParams.get('body') };
  };

  // 1. Página: e-mail e LinkedIn; nenhum WhatsApp
  const ctx = await newContext();
  const page = await ctx.newPage();
  watch(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const links = await page.$$eval('a[href]', (els) => els.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target') })).filter((l) => !l.href.startsWith('#')));
  const bodyText = await page.locator('body').innerText();
  check(engine, 'status-configurado', (await page.getAttribute('[data-contact-status]', 'data-contact-status')) === 'configurado');
  check(engine, 'email-exibido', links.some((l) => l.href === `mailto:${EMAIL}`));
  check(engine, 'linkedin-perfil-exibido', links.some((l) => l.href === LINKEDIN && l.target === '_blank'));
  check(
    engine,
    'sem-whatsapp-na-pagina',
    !links.some((l) => /wa\.me/.test(l.href)) && !/WhatsApp/.test(bodyText) && (await page.locator('.nk-fab, [class*="floating"]').count()) === 0,
    'nenhum link, botão flutuante ou menção ao WhatsApp',
  );
  // COM-RELEASE-005 §4.5: a fixture aponta o Bookings para OUTRA organização — a URL é recusada e nada é oferecido
  check(
    engine,
    'agendamento-de-outra-organizacao-recusado',
    !links.some((l) => /^https?:/.test(l.href) && BOOKINGS_HOSTS.includes(new URL(l.href).hostname)) && !/Agendar conversa/.test(bodyText) && (await page.getAttribute('[data-agendamento]', 'data-agendamento')) === 'pendente',
    'nenhum botão "Agendar conversa" nem link para o Bookings',
  );
  const privacy = await page.locator('#privacidade').innerText();
  check(engine, 'privacidade-descreve-o-email', /O que vai para o e-mail/.test(privacy) && privacy.includes(EMAIL), privacy.split('\n').find((l) => /aplicativo de e-mail/.test(l))?.slice(0, 120));

  // 2. Diálogo: atalho por e-mail, validação
  await page.locator('#inicio [aria-haspopup="dialog"]').click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const direct = dialog.getByRole('link', { name: /Escrever diretamente por e-mail/ });
  check(engine, 'dialogo-email-direto', (await direct.count()) === 1 && (await direct.getAttribute('href')) === MAILTO && (await direct.getAttribute('target')) == null, MAILTO);
  const submit = dialog.locator('button[type="submit"]');
  check(engine, 'botao-revisar-mensagem', /Revisar mensagem/.test(await submit.innerText()));
  check(engine, 'nota-do-formulario-cita-o-email', /antes de abrir o seu aplicativo de e-mail/.test(await dialog.innerText()));
  await submit.click();
  check(engine, 'validacao-campos-obrigatorios', (await dialog.locator('[aria-invalid="true"]').count()) === 2, 'nome e descrição');
  const form = dialog.locator('form');
  await form.getByLabel(/^Nome/).fill(FORM.name);
  await form.getByLabel(/^Empresa/).fill(FORM.company);
  await form.getByLabel(/^E-mail/).fill(FORM.email);
  await form.getByLabel(/Descreva o processo/).fill(FORM.message);
  await page.screenshot({ path: shot('email-passo-1-formulario.png') });
  await submit.click();

  // 3. Confirmação: mensagem exata, aviso do que vai para o e-mail, nada entregue ainda
  const pre = dialog.getByTestId('mensagem-solicitacao');
  await pre.waitFor();
  const shown = (await pre.innerText()).replace(/\r/g, '');
  const review = await dialog.innerText();
  check(engine, 'confirmacao-mensagem-exata', shown.trim() === EXPECTED, shown.split('\n')[0]);
  check(engine, 'confirmacao-avisa-transferencia', /seu aplicativo de e-mail é aberto com esta mensagem/.test(review) && /só chega à Nekkora se você a enviar pelo aplicativo/.test(review));
  check(engine, 'confirmacao-sem-abrir-nada', (await page.evaluate(() => window.__mailto.length)) === 0);
  check(engine, 'confirmacao-foco-no-conteudo', await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')));
  // O Link da nekkora-lib é inline-flex: Chromium e Firefox quebram linha em volta dele no innerText (na tela, a frase é contínua)
  check(engine, 'confirmacao-endereco-manual', review.replace(/\s+/g, ' ').includes(`Se o aplicativo de e-mail não abrir, copie a mensagem e envie para ${EMAIL}`));
  await page.screenshot({ path: shot('email-passo-2-confirmacao.png') });
  await dialog.getByRole('button', { name: /Voltar e editar/ }).click();
  check(engine, 'voltar-preserva-dados', (await form.getByLabel(/Descreva o processo/).inputValue()) === FORM.message);
  await submit.click();
  await pre.waitFor();

  // 4. Abrir no e-mail: mailto com destinatário, assunto e a mensagem confirmada (CRLF, RFC 6068)
  const open = dialog.getByRole('link', { name: /Abrir no e-mail/ });
  check(engine, 'botao-email-sem-nova-aba', (await open.getAttribute('target')) == null);
  await open.click();
  await page.waitForTimeout(300);
  const sent = await page.evaluate(() => window.__mailto);
  const mail = sent.length ? parseMailto(sent.at(-1)) : null;
  check(engine, 'email-com-mensagem-exata', mail?.to === EMAIL && mail.subject === SUBJECT && mail.body === CRLF, mail ? `para=${mail.to}; assunto="${mail.subject}"; corpo = mensagem confirmada: ${mail.body === CRLF}` : 'nenhum mailto');
  check(engine, 'sem-window-open', (await page.evaluate(() => window.__openCalls)) === 0);
  check(engine, 'pagina-continua-no-ar', page.url().startsWith(baseUrl), page.url());
  const after = await dialog.innerText();
  check(engine, 'mensagem-neutra-sem-afirmar-envio', /Pedimos ao navegador para abrir o seu aplicativo de e-mail/.test(after) && !OVERCLAIM.test(after) && !/e-mail enviado|enviamos/i.test(after));
  const again = dialog.getByRole('link', { name: /Abrir no e-mail novamente/ });
  check(engine, 'link-manual-depois-da-abertura', (await again.count()) === 1 && (await again.getAttribute('href')) === sent.at(-1));
  check(engine, 'alternativas-manuais', after.includes(EMAIL) && /Copiar mensagem/.test(after));
  await page.screenshot({ path: shot('email-passo-3-solicitado.png') });
  await dialog.getByRole('button', { name: /Copiar mensagem/ }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="status-copia"]')?.textContent.trim(), null, { timeout: 3000 }).catch(() => {});
  const copyStatus = await dialog.getByTestId('status-copia').innerText();
  check(engine, 'copiar-mensagem-informa-resultado', /Mensagem copiada|Não foi possível copiar/.test(copyStatus), copyStatus);
  await ctx.close();

  // 5. Celular (375 px) + axe na confirmação
  {
    const c3 = await newContext({ width: 375, height: 812 });
    const p3 = await c3.newPage();
    watch(p3);
    await p3.goto(baseUrl, { waitUntil: 'networkidle' });
    await p3.locator('#inicio [aria-haspopup="dialog"]').click();
    const d3 = p3.getByRole('dialog');
    await d3.locator('form').getByLabel(/^Nome/).fill(FORM.name);
    await d3.locator('form').getByLabel(/Descreva o processo/).fill(FORM.message);
    await d3.locator('button[type="submit"]').click();
    await d3.getByTestId('mensagem-solicitacao').waitFor();
    const fit = await p3.evaluate(() => {
      const d = document.querySelector('[role="dialog"]').getBoundingClientRect();
      return { page: document.documentElement.scrollWidth - innerWidth, left: d.left, right: d.right };
    });
    check(engine, 'celular-confirmacao-cabe', fit.page <= 0 && fit.left >= 0 && fit.right <= 375, JSON.stringify(fit));
    await p3.screenshot({ path: shot('email-celular-confirmacao.png') });
    await p3.evaluate(axeSource); // evaluate: a CSP da página bloqueia script inline
    const violations = await p3.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document.querySelector('[role="dialog"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return r.violations.map((v) => `${v.id}(${v.nodes.length})`);
    });
    check(engine, 'axe-etapa-de-confirmacao', violations.length === 0, violations.join(', ') || 'sem violações');
    await c3.close();
  }

  await campaign(engine, newContext);
  check(engine, 'sem-requisicao-externa-real', aborted.length === 0, aborted.join(' | ') || 'nenhuma requisição externa');
  check(engine, 'console-sem-erros', errors.length === 0, errors.join(' | ') || 'limpo');
  const version = browser.version();
  await browser.close();
  return { engine, version, aborted };
}

const runs = [];
for (const engine of enginesArg.split(',')) {
  try {
    runs.push(CHANNEL === 'email' ? await runEmail(engine) : await run(engine));
  } catch (e) {
    check(engine, 'execucao', false, String(e.message).split('\n')[0]);
  }
}
const failed = checks.filter((c) => !c.ok).length;
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ baseUrl, at: new Date().toISOString(), runs, checks, summary: { total: checks.length, failed } }, null, 2));
const md = [
  `# Jornada de conversão (${CHANNEL === 'email' ? 'e-mail' : 'WhatsApp'}) — ${new Date().toISOString()}`,
  '',
  `URL: ${baseUrl} (build de homologação, dados sintéticos) · ${runs.map((r) => `${r.engine} ${r.version}`).join(' · ')} · ${checks.length} verificações · ${failed} falha(s)`,
  '',
  '| Navegador | Verificação | Resultado | Detalhe |',
  '|---|---|---|---|',
  ...checks.map((c) => `| ${c.engine} | ${c.id} | ${c.ok ? 'OK' : '**FALHA**'} | ${String(c.detail ?? '').replace(/\|/g, '\\|').slice(0, 200)} |`),
].join('\n');
writeFileSync(path.join(outDir, 'resumo.md'), md + '\n');
console.log(`\n${checks.length} verificações, ${failed} falha(s).`);
process.exit(failed ? 1 : 0);
