#!/usr/bin/env node
/**
 * Medição de desempenho da versão candidata (NEKKORA-RELEASE-001 §8.2), em Chromium, cache vazio, celular 375 px:
 * rede "4G lento" (150 ms de latência, 1,6 Mbps de download, 750 kbps de upload) e CPU 4× mais lenta (CDP).
 * Mede FCP, LCP, CLS, bytes transferidos e número de requisições; 5 execuções, mediana.
 *
 *   node scripts/desempenho.mjs http://127.0.0.1:4173/ docs/release/evidencias/desempenho.json
 *
 * É uma medição de laboratório (servidor local + rede emulada), não de campo: a latência real do provedor de
 * hospedagem e da CDN não entra. Repetir no domínio público depois da publicação (COM-RELEASE-004).
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , url = 'http://127.0.0.1:4173/', out = 'docs/release/evidencias/desempenho.json', runsArg = '5'] = process.argv;
const modules = process.env.NEKKORA_PW_MODULES;
const require = createRequire(modules ? path.resolve(modules, 'noop.js') : import.meta.url);
const { chromium } = require('playwright');

const browser = await chromium.launch();
const runs = [];
for (let i = 0; i < Number(runsArg); i++) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let bytes = 0;
  let requests = 0;
  cdp.on('Network.loadingFinished', (e) => {
    bytes += e.encodedDataLength;
    requests++;
  });
  await page.addInitScript(() => {
    window.__lcp = 0;
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: 'layout-shift', buffered: true });
  });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  const load = Date.now() - t0;
  await page.waitForTimeout(1000);
  const m = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
    lcp: window.__lcp,
    cls: window.__cls,
    domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? null,
  }));
  runs.push({ ...m, networkIdleMs: load, bytes, requests });
  await context.close();
}
await browser.close();

const median = (k) => {
  const v = runs.map((r) => r[k]).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
};
const result = {
  url,
  condicoes: 'Chromium, celular 375 px (DPR 2), cache vazio, latência 150 ms, 1,6 Mbps/750 kbps, CPU 4× mais lenta',
  execucoes: runs.length,
  mediana: { fcpMs: Math.round(median('fcp')), lcpMs: Math.round(median('lcp')), cls: +median('cls').toFixed(4), kbTransferidos: Math.round(median('bytes') / 1024), requisicoes: median('requests') },
  // Limiares "bom" do Core Web Vitals, só como referência: LCP ≤ 2500 ms, CLS ≤ 0,1.
  referencia: { lcpBomMs: 2500, clsBom: 0.1 },
  runs,
};
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.mediana));
