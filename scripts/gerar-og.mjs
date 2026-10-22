#!/usr/bin/env node
/**
 * Gera public/og-nekkora.jpg (1200×627, proporção recomendada pelo LinkedIn) a partir de deploy/og/og.html.
 * Uso: npm install && node scripts/gerar-og.mjs   (Playwright: devDependency; Chromium via `npx playwright install chromium`)
 */
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('deploy/og/og.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-nekkora.jpg', type: 'jpeg', quality: 90 });
await browser.close();
console.log('public/og-nekkora.jpg');
