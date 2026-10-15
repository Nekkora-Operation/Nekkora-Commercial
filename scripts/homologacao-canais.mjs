#!/usr/bin/env node
/**
 * Verifica o comportamento da página COM canais configurados — build temporário feito com valores de teste em
 * src/config.ts (nunca versionados). Complementa scripts/homologacao.mjs, que cobre o estado padrão (sem canais).
 *
 * Uso: node scripts/homologacao-canais.mjs <url-do-build-de-teste> <pasta-de-saida>
 * Valores esperados no build de teste: WhatsApp 5511912345678, e-mail teste@exemplo.invalid, Instagram apontando
 * para a página inicial (deve ser REJEITADO pela validação) e LinkedIn com caminho de perfil.
 * Nenhuma requisição externa é feita: tudo fora do localhost é abortado e registrado.
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
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const aborted = [];
await context.route('**/*', (route) => {
  const url = route.request().url();
  if (url.startsWith(new URL(baseUrl).origin) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
  aborted.push(url);
  return route.abort();
});
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

const form = page.locator('#contato form');
await form.getByLabel(/^Nome/).fill('Pessoa de Teste');
await form.getByLabel(/^E-mail/).fill('teste@exemplo.invalid');
await form.getByRole('radio').nth(2).check();
await form.getByLabel(/Descreva o processo/).fill('Teste de homologação com canal configurado.');
check('botao-envio-whatsapp', /Enviar pelo WhatsApp/.test(await form.locator('button[type="submit"]').innerText()));
const popupPromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
await form.locator('button[type="submit"]').click();
const popup = await popupPromise;
const popupUrl = popup ? popup.url() : '';
await page.waitForTimeout(300);
const decoded = decodeURIComponent(aborted.find((u) => u.includes('wa.me')) ?? popupUrl);
check('formulario-abre-whatsapp-com-mensagem', decoded.includes('wa.me/5511912345678') && decoded.includes('Quero avaliar: Delivery e Hosting.'), decoded.slice(0, 160));
const openedText = await page.locator('#contato .contact__done').innerText();
check('aba-aberta-sem-afirmar-envio', /WhatsApp aberto em uma nova aba/.test(openedText) && /só é enviada quando você a confirmar/.test(openedText) && !/enviad[ao] com sucesso/i.test(openedText), openedText.split('\n')[0]);
check('aba-aberta-sem-opener', popup ? await popup.evaluate(() => window.opener === null).catch(() => true) : false, popup ? 'window.opener = null na aba do WhatsApp' : 'sem popup');
const manualOpen = await page.locator('#contato .contact__done a[href^="https://wa.me/5511912345678?"]').count();
check('link-manual-quando-aberta', manualOpen === 1);
await page.locator('#contato').screenshot({ path: path.join(outDir, 'contato-com-canais.png') });

// Navegador que bloqueia a nova aba: window.open devolve null (comportamento de bloqueador de pop-up).
{
  const blockedCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await blockedCtx.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(new URL(baseUrl).origin) || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
    aborted.push(url);
    return route.abort();
  });
  await blockedCtx.addInitScript(() => {
    window.open = () => null;
  });
  const bp = await blockedCtx.newPage();
  await bp.goto(baseUrl, { waitUntil: 'networkidle' });
  const bf = bp.locator('#contato form');
  await bf.getByLabel(/^Nome/).fill('Pessoa de Teste');
  await bf.getByLabel(/^E-mail/).fill('teste@exemplo.invalid');
  await bf.getByRole('radio').first().check();
  await bf.getByLabel(/Descreva o processo/).fill('Teste de homologação com pop-up bloqueado.');
  await bf.locator('button[type="submit"]').click();
  await bp.waitForTimeout(300);
  const done = bp.locator('#contato .contact__done');
  const text = await done.innerText();
  const manual = done.locator('a[href^="https://wa.me/5511912345678?"]');
  const href = decodeURIComponent((await manual.getAttribute('href')) ?? '');
  check('aba-bloqueada-avisa', /Não foi possível abrir o WhatsApp automaticamente/.test(text) && !/WhatsApp aberto/.test(text), text.split('\n')[0]);
  check('aba-bloqueada-link-manual-com-mensagem', (await manual.count()) === 1 && href.includes('Quero avaliar: Delivery.') && (await manual.getAttribute('target')) === '_blank', href.slice(0, 120));
  await done.screenshot({ path: path.join(outDir, 'whatsapp-bloqueado.png') });
  await blockedCtx.close();
}

await browser.close();
const failed = checks.filter((c) => !c.ok).length;
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify({ baseUrl, at: new Date().toISOString(), checks, abortedExternal: aborted }, null, 2));
console.log(`\n${checks.length} verificações, ${failed} falha(s).`);
process.exit(failed ? 1 : 0);
