#!/usr/bin/env node
/**
 * Verifica o comportamento da página COM canais configurados — build temporário feito com valores de teste em
 * src/config.ts (nunca versionados). Complementa scripts/homologacao.mjs, que cobre o estado padrão (sem canais).
 *
 * Uso: node scripts/homologacao-canais.mjs <url-do-build-de-teste> <pasta-de-saida>
 * Valores esperados no build de teste: WhatsApp 5511912345678, e-mail teste@exemplo.invalid, Instagram apontando
 * para a página inicial (deve ser REJEITADO pela validação) e LinkedIn com caminho de perfil.
 * Nenhuma requisição externa é feita: o wa.me é respondido por uma página local de teste e o resto é abortado.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , baseUrl = 'http://127.0.0.1:4175/', outDir = 'docs/com-001/evidencias/canais'] = process.argv;
const modules = process.env.NEKKORA_PW_MODULES;
const require = createRequire(modules ? path.resolve(modules, 'noop.js') : import.meta.url);
const { chromium } = require('playwright');
mkdirSync(outDir, { recursive: true });

const checks = [];
const check = (id, ok, detail) => {
  checks.push({ id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${id}${detail ? ` — ${detail}` : ''}`);
};
const browser = await chromium.launch();
const origin = new URL(baseUrl).origin;
const aborted = [];
/** Requisições ao wa.me: respondidas por uma página local de teste (nada sai da máquina) e registradas com o Referer. */
const waRequests = [];
async function isolate(ctx) {
  await ctx.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    if (url.startsWith(origin) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
    if (url.startsWith('https://wa.me/')) {
      waRequests.push({ url, referer: req.headers()['referer'] ?? null });
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>wa.me (página de teste local)</title>' });
    }
    aborted.push(url);
    return route.abort();
  });
}
async function fillForm(form, radioIndex, text) {
  await form.getByLabel(/^Nome/).fill('Pessoa de Teste');
  await form.getByLabel(/^E-mail/).fill('teste@exemplo.invalid');
  await form.getByRole('radio').nth(radioIndex).check();
  await form.getByLabel(/Descreva o processo/).fill(text);
}
const NEUTRAL = /Pedimos ao navegador para abrir o WhatsApp/;
const OVERCLAIM = /WhatsApp aberto|aberto em uma nova aba|enviad[ao] com sucesso|mensagem enviada/i;

const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await isolate(context);
const page = await context.newPage();
await page.goto(baseUrl, { waitUntil: 'networkidle' });

const links = await page.$$eval('a[href]', (els) => els.map((a) => a.getAttribute('href')).filter((h) => !h.startsWith('#')));
check('status-configurado', (await page.getAttribute('[data-contact-status]', 'data-contact-status')) === 'configurado');
check('whatsapp-exibido', links.some((h) => h.startsWith('https://wa.me/5511912345678?')), `${links.filter((h) => h.includes('wa.me')).length} link(s) wa.me`);
check('email-exibido', links.includes('mailto:teste@exemplo.invalid'));
check('linkedin-perfil-exibido', links.includes('https://www.linkedin.com/company/exemplo-invalido'));
check('instagram-pagina-inicial-rejeitado', !links.some((h) => h.includes('instagram.com')), 'URL sem caminho de perfil não vira link');
check('botao-flutuante-presente', (await page.locator('a[href^="https://wa.me/"][aria-label], .nk-fab').count()) > 0);
check('aviso-canais-pendentes-ausente', (await page.getByText('Canais de contato em definição').count()) === 0);

// Navegador que permite a nova aba
const form = page.locator('#contato form');
await fillForm(form, 2, 'Teste de homologação com canal configurado.');
check('botao-envio-whatsapp', /Enviar pelo WhatsApp/.test(await form.locator('button[type="submit"]').innerText()));
const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
await form.locator('button[type="submit"]').click();
const popup = await popupPromise;
if (popup) await popup.waitForLoadState('load').catch(() => {});
await page.waitForTimeout(300);
const req = waRequests[0];
const decoded = decodeURIComponent(req?.url ?? '');
check('formulario-abre-whatsapp-com-mensagem', decoded.includes('wa.me/5511912345678') && decoded.includes('Quero avaliar: Delivery e Hosting.'), decoded.slice(0, 160));
// Isolamento medido NA aba aberta (sem mascarar erro): noopener ⇒ opener nulo; noreferrer ⇒ sem Referer.
const isolation = popup ? await popup.evaluate(() => ({ opener: window.opener === null, referrer: document.referrer })) : null;
check('aba-sem-opener', isolation?.opener === true, isolation ? `window.opener === null: ${isolation.opener}` : 'sem popup');
check('aba-sem-referer', req != null && req.referer == null && isolation?.referrer === '', `cabeçalho Referer=${req?.referer ?? 'ausente'}; document.referrer="${isolation?.referrer ?? '?'}"`);
const openedText = await page.locator('#contato .contact__done').innerText();
check('mensagem-neutra-sem-afirmar-abertura', NEUTRAL.test(openedText) && !OVERCLAIM.test(openedText), openedText.split('\n')[0]);
const manual = page.locator('#contato .contact__done a[href^="https://wa.me/5511912345678?"]');
check('link-manual-sempre-presente', (await manual.count()) === 1 && (await manual.getAttribute('rel'))?.includes('noopener') && (await manual.getAttribute('rel'))?.includes('noreferrer'), `rel="${await manual.getAttribute('rel')}"`);
await page.locator('#contato').screenshot({ path: path.join(outDir, 'contato-com-canais.png') });

// Navegador que bloqueia a nova aba (window.open devolve null, como os bloqueadores de pop-up)
{
  const blockedCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await isolate(blockedCtx);
  await blockedCtx.addInitScript(() => {
    window.open = () => null;
  });
  const bp = await blockedCtx.newPage();
  await bp.goto(baseUrl, { waitUntil: 'networkidle' });
  await fillForm(bp.locator('#contato form'), 0, 'Teste de homologação com pop-up bloqueado.');
  await bp.locator('#contato form button[type="submit"]').click();
  await bp.waitForTimeout(300);
  const done = bp.locator('#contato .contact__done');
  const text = await done.innerText();
  const bm = done.locator('a[href^="https://wa.me/5511912345678?"]');
  const href = decodeURIComponent((await bm.getAttribute('href')) ?? '');
  check('bloqueada-mesma-mensagem-neutra', NEUTRAL.test(text) && !OVERCLAIM.test(text), text.split('\n')[0]);
  check('bloqueada-link-manual-com-mensagem', (await bm.count()) === 1 && href.includes('Quero avaliar: Delivery.') && (await bm.getAttribute('target')) === '_blank', href.slice(0, 120));
  await done.screenshot({ path: path.join(outDir, 'whatsapp-bloqueado.png') });
  await blockedCtx.close();
}
check('sem-requisicao-externa-real', aborted.length === 0, aborted.join(' | ') || 'wa.me respondido localmente; nenhuma outra requisição externa');

await browser.close();
const failed = checks.filter((c) => !c.ok).length;
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ baseUrl, at: new Date().toISOString(), checks, waRequests, abortedExternal: aborted }, null, 2));
console.log(`\n${checks.length} verificações, ${failed} falha(s).`);
process.exit(failed ? 1 : 0);
