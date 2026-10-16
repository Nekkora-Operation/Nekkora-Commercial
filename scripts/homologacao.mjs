#!/usr/bin/env node
/**
 * Homologação automatizada da página comercial (COM-001) num navegador real (Chromium via Playwright).
 *
 * Uso:
 *   npm run build && npx vite preview --port 4173 --strictPort      # em outro terminal
 *   node scripts/homologacao.mjs http://localhost:4173/ docs/com-001/evidencias/depois
 *
 * Playwright e axe-core NÃO são dependências deste projeto (fora do escopo da missão). O script os resolve a partir
 * de NEKKORA_PW_MODULES (pasta node_modules que os contenha) ou do próprio projeto, se instalados:
 *   NEKKORA_PW_MODULES=../Nekkora-Platform-Web/node_modules node scripts/homologacao.mjs ...
 *
 * Saída: capturas (JPEG), resultados.json e resumo.md na pasta indicada. Código de saída 1 se alguma verificação
 * falhar. Nenhuma requisição sai do localhost: tudo que tentar sair é bloqueado e registrado.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [, , baseUrl = 'http://localhost:4173/', outDir = 'docs/com-001/evidencias/depois'] = process.argv;
const modules = process.env.NEKKORA_PW_MODULES;
const require = createRequire(modules ? path.resolve(modules, 'noop.js') : import.meta.url);
const { chromium } = require('playwright');
const axeSource = require('node:fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

mkdirSync(outDir, { recursive: true });

const THEMES = ['sakura-dark', 'sage-light'];
const WIDTHS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1440, height: 900 },
];
const THEME_KEY = 'nekkora-commercial-tema';

/**
 * Alegações proibidas fora de listas marcadas como exclusão (data-exclusion). Preços e percentuais (`pricing: true`)
 * são aceitos também no bloco de preços autorizado pela responsável (data-pricing, modelo C — PR-01..PR-05).
 */
const FORBIDDEN = [
  { id: 'percentual', re: /\d+(?:[.,]\d+)?\s?%/g, pricing: true },
  { id: 'preco', re: /R\$\s?\d/g, pricing: true },
  { id: '24h', re: /\b24\s?(?:h\b|horas)|24\s?\/\s?7|24x7/gi },
  { id: 'sla', re: /\bSLA\b/g },
  { id: 'roi', re: /\bROI\b/g },
  { id: 'garantia-de-prazo', re: /prazo garantido|garantimos|entrega garantida/gi },
  { id: 'economia', re: /econom(?:ia|ize)\s+de\s+\d/gi },
  { id: 'alta-disponibilidade', re: /alta disponibilidade/gi },
  { id: 'monitoramento-continuo', re: /monitoramento cont[ií]nuo|monitoramento 24/gi },
];

const results = { baseUrl, startedAt: new Date().toISOString(), checks: [], screenshots: [], axe: {}, console: [], blocked: [], fonts: new Set() };
const check = (id, ok, detail) => {
  results.checks.push({ id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${id}${detail ? ` — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`);
};

const browser = await chromium.launch();
const local = new URL(baseUrl).origin;

async function newPage(viewport, theme) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await context.addInitScript(
    ([key, t]) => {
      try {
        if (t && !sessionStorage.getItem('__nk_seeded')) {
          localStorage.setItem(key, t);
          sessionStorage.setItem('__nk_seeded', '1');
        }
      } catch {}
    },
    [THEME_KEY, theme],
  );
  // Nada sai do localhost: requisições externas são abortadas e registradas.
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(local) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    // Fonte Inter: importada pela própria nekkora-lib (foundation.css). Permitida e registrada à parte.
    if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) {
      results.fonts.add(new URL(url).origin);
      return route.continue();
    }
    results.blocked.push(url);
    return route.abort();
  });
  const page = await context.newPage();
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && results.console.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => results.console.push(`pageerror: ${e.message}`));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

// 1. Capturas, rolagem horizontal e tema aplicado — 4 larguras × 2 temas
for (const theme of THEMES) {
  for (const vp of WIDTHS) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, theme);
    const applied = await page.evaluate(() => document.documentElement.getAttribute('data-nk-theme'));
    check(`tema-aplicado:${theme}:${vp.name}`, applied === theme, `data-nk-theme=${applied}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`sem-rolagem-horizontal:${theme}:${vp.name}`, overflow <= 0, `excesso=${overflow}px`);
    const file = `pagina-${theme}-${vp.name}-${vp.width}.jpg`;
    await page.screenshot({ path: path.join(outDir, file), fullPage: true, type: 'jpeg', quality: 72 });
    results.screenshots.push(file);
    if (vp.name === 'desktop') {
      const hero = `hero-${theme}-desktop.png`;
      await page.screenshot({ path: path.join(outDir, hero) });
      results.screenshots.push(hero);
    }
    await context.close();
  }
}

/**
 * Mede o contraste real de elementos sobre fundos que o axe não sabe calcular (gradientes, pseudo-elementos):
 * deixa o texto transparente, captura a caixa do elemento e compara a cor do texto com cada pixel do fundo.
 * Usa o percentil 10 (os 10% de pixels de fundo mais desfavoráveis) para ignorar bordas e ícones vizinhos.
 * Exigência: 4,5:1, ou 3:1 para texto grande (≥ 24 px, ou ≥ 18,66 px em negrito).
 */
async function measureContrastByPixels(page, selectors) {
  const out = [];
  for (const sel of [...new Set(selectors)]) {
    const el = page.locator(sel).first();
    if (!(await el.count()) || !(await el.isVisible())) continue;
    await el.scrollIntoViewIfNeeded();
    const info = await el.evaluate((node) => {
      const cs = getComputedStyle(node);
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const fg = cs.color; // lido antes de esconder o texto: o objeto do getComputedStyle é "vivo"
      node.dataset.nkPrevColor = node.style.color;
      node.style.setProperty('color', 'transparent', 'important');
      node.querySelectorAll('*').forEach((c) => c.style.setProperty('color', 'transparent', 'important'));
      const radius = parseFloat(cs.borderTopLeftRadius) || 0;
      return { fg, large: size >= 24 || (bold && size >= 18.66), round: radius >= Math.min(node.offsetWidth, node.offsetHeight) * 0.4 };
    });
    let box = await el.boundingBox();
    if (!box || box.width < 2 || box.height < 2) continue;
    // Elemento redondo (ex.: número da etapa): amostra só o miolo, sem os cantos fora do círculo.
    if (info.round) box = { x: box.x + box.width * 0.2, y: box.y + box.height * 0.2, width: box.width * 0.6, height: box.height * 0.6 };
    const png = await page.screenshot({ clip: box });
    await el.evaluate((node) => {
      node.style.color = node.dataset.nkPrevColor ?? '';
      node.querySelectorAll('*').forEach((c) => c.style.removeProperty('color'));
    });
    const r = await page.evaluate(
      async ({ b64, fg }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const cv = document.createElement('canvas');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, cv.width, cv.height).data;
        const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        const raw = fg.startsWith('color(srgb') ? fg.replace('color(srgb', '').match(/[\d.]+/g).map((v) => v * 255) : fg.match(/[\d.]+/g).map(Number);
        const lf = L(raw[0], raw[1], raw[2]);
        const ratios = [];
        for (let i = 0; i < px.length; i += 4 * 3) {
          const lb = L(px[i], px[i + 1], px[i + 2]);
          ratios.push((Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05));
        }
        ratios.sort((a, b) => a - b);
        return { p10: +ratios[Math.floor(ratios.length * 0.1)].toFixed(2), min: +ratios[0].toFixed(2) };
      },
      { b64: png.toString('base64'), fg: info.fg },
    );
    out.push({ target: sel.slice(-60), required: info.large ? 3 : 4.5, ...r });
  }
  return out;
}

// 2. Acessibilidade (axe-core, WCAG 2.1 A/AA) por tema, em desktop e mobile
for (const theme of THEMES) {
  for (const vp of [WIDTHS[0], WIDTHS[2]]) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, theme);
    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return {
        violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })),
        passes: r.passes.length,
        incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        // Nós em que o axe não decide o contraste (fundo com gradiente/pseudo-elemento): medidos por pixels abaixo.
        contrastTargets: (r.incomplete.find((v) => v.id === 'color-contrast')?.nodes ?? []).map((n) => n.target[0]),
      };
    });
    results.axe[`${theme}:${vp.name}`] = axe;
    check(`axe:${theme}:${vp.name}`, axe.violations.length === 0, axe.violations.map((v) => `${v.id}(${v.nodes})`).join(', ') || `${axe.passes} regras aprovadas`);
    const otherIncomplete = axe.incomplete.filter((i) => i.id !== 'color-contrast');
    check(`axe-sem-pendencias-de-revisao:${theme}:${vp.name}`, otherIncomplete.length === 0, otherIncomplete.map((i) => `${i.id}(${i.nodes})`).join(', ') || 'só color-contrast (medido por pixels)');
    const measured = await measureContrastByPixels(page, axe.contrastTargets);
    results.pixelContrast = results.pixelContrast ?? {};
    results.pixelContrast[`${theme}:${vp.name}`] = measured;
    const low = measured.filter((m) => m.p10 < m.required);
    const worst = measured.reduce((a, m) => (a && a.p10 - a.required < m.p10 - m.required ? a : m), null);
    check(
      `contraste-por-pixels:${theme}:${vp.name}`,
      low.length === 0,
      low.length ? low.map((m) => `${m.target} ${m.p10}<${m.required}`).join(' | ') : `${measured.length} nós; pior folga: ${worst ? `${worst.target} ${worst.p10}:1 (mín. ${worst.required})` : '—'}`,
    );
    delete axe.contrastTargets;
    await context.close();
  }
}

/** Executa um bloco de verificações; uma exceção vira falha registrada em vez de abortar a homologação. */
async function block(id, fn) {
  try {
    await fn();
  } catch (e) {
    check(`execucao:${id}`, false, String(e.message).split('\n')[0]);
  }
}

// 3. Verificações funcionais (desktop, tema padrão)
await block('funcionais', async () => {
  const { context, page } = await newPage({ width: 1280, height: 800 }, null);
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-nk-theme'));
  check('tema-padrao-sage-light', theme === 'sage-light', `data-nk-theme=${theme}`);

  writeFileSync(path.join(outDir, 'texto-renderizado.txt'), await page.locator('body').innerText());

  // Ordem e hierarquia das seções
  const sections = await page.$$eval('main > section[id]', (els) => els.map((e) => e.id));
  results.sections = sections;
  const expected = ['inicio', 'solucoes', 'precos', 'como-funciona', 'hosting', 'transparencia', 'contato'];
  check('ordem-das-secoes', JSON.stringify(sections) === JSON.stringify(expected), sections.join(' > '));
  const h1 = await page.$$eval('h1', (els) => els.length);
  check('um-unico-h1', h1 === 1, `${h1} h1`);

  // Âncoras internas
  const anchors = await page.$$eval('a[href^="#"]', (els) => els.map((a) => a.getAttribute('href')));
  const broken = await page.evaluate((hrefs) => hrefs.filter((h) => h !== '#' && !document.getElementById(h.slice(1))), anchors);
  check('ancoras-validas', broken.length === 0 && anchors.length > 0, `${anchors.length} âncoras, quebradas: ${broken.join(', ') || 'nenhuma'}`);

  // Links externos e destinos provisórios
  const external = await page.$$eval('a[href]', (els) => els.map((a) => a.getAttribute('href')).filter((h) => !h.startsWith('#')));
  results.externalLinks = external;
  const fake = external.filter((h) => /wa\.me\/0*$|wa\.me\/55?0{8,}|instagram\.com\/?$|linkedin\.com\/?$|^mailto:/.test(h));
  const contactsConfigured = await page.evaluate(() => document.querySelector('[data-contact-status]')?.getAttribute('data-contact-status'));
  results.contactStatus = contactsConfigured;
  check('sem-destinos-provisorios', fake.length === 0, `links externos: ${external.length ? external.join(' | ') : 'nenhum'}; status contato=${contactsConfigured}`);
  const fab = await page.$('.nk-fab, [class*="floating"]');
  check('sem-whatsapp-flutuante-provisorio', contactsConfigured === 'configurado' || !fab, fab ? 'botão flutuante presente' : 'ausente');

  // Alegações proibidas fora das listas de exclusão
  const hits = await page.evaluate((patterns) => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent ?? '';
      const el = n.parentElement;
      if (!el || el.closest('script,style,[aria-hidden="true"]')) continue;
      for (const p of patterns) {
        for (const m of text.matchAll(new RegExp(p.source, p.flags))) {
          out.push({ id: p.id, match: m[0], text: text.trim().slice(0, 140), exclusion: !!el.closest('[data-exclusion]'), pricing: p.pricing && !!el.closest('[data-pricing]') });
        }
      }
    }
    return out;
  }, FORBIDDEN.map((f) => ({ id: f.id, source: f.re.source, flags: f.re.flags, pricing: !!f.pricing })));
  results.claimHits = hits;
  const bad = hits.filter((h) => !h.exclusion && !h.pricing);
  check('sem-alegacoes-proibidas', bad.length === 0, bad.length ? bad.map((b) => `${b.id}: "${b.text}"`).join(' | ') : `${hits.length} ocorrência(s): ${hits.filter((h) => h.exclusion).length} em exclusões, ${hits.filter((h) => h.pricing).length} no bloco de preços`);
  // Preços: só no bloco data-pricing, com condição da campanha visível e leitura correta do valor riscado
  const pricing = await page.evaluate(() => {
    const block = document.querySelector('[data-pricing]');
    const text = block?.innerText ?? '';
    return {
      blocks: document.querySelectorAll('[data-pricing]').length,
      condition: /Vale para propostas aprovadas no período/.test(text),
      confirmedInProposal: /fica registrada na proposta/.test(text),
      licenses: /não estão incluídos nos valores acima/.test(text),
      srLabels: [...(block?.querySelectorAll('.price .nk-visually-hidden') ?? [])].map((e) => e.textContent.trim()),
    };
  });
  results.pricing = pricing;
  check('precos-so-no-bloco-de-precos', pricing.blocks === 1 && hits.filter((h) => h.pricing).length > 0, `${pricing.blocks} bloco(s) data-pricing`);
  check('precos-com-condicoes-visiveis', pricing.condition && pricing.confirmedInProposal && pricing.licenses, JSON.stringify({ ...pricing, srLabels: undefined }));
  check('precos-leitura-do-valor-riscado', pricing.srLabels.length === 4 && pricing.srLabels.every((t) => /Valor (sem|com) desconto/.test(t)), pricing.srLabels.join(' | '));

  // Produtos internos não aparecem como obrigatórios/disponíveis: cada menção fica em bloco marcado
  const products = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (/\b(Studio|Platform|Agent)\b/.test(n.textContent ?? '')) {
        out.push({ text: n.textContent.trim().slice(0, 160), marked: !!n.parentElement?.closest('[data-internal-products]') });
      }
    }
    return out;
  });
  results.internalProductMentions = products;
  check('produtos-internos-so-em-bloco-informativo', products.every((p) => p.marked), `${products.length} menção(ões)`);

  // Conteúdo demonstrativo identificado
  const demos = await page.$$eval('[data-demo]', (els) => els.map((e) => ({ label: e.getAttribute('data-demo'), visible: e.innerText.toLowerCase().includes('ilustra') })));
  // Modelo C não tem ilustração de jornada; se algum bloco demonstrativo voltar, precisa estar rotulado.
  check('demonstrativos-identificados', demos.every((d) => d.visible), demos.length ? JSON.stringify(demos) : 'nenhum bloco demonstrativo na página');

  // Teclado: link de pular conteúdo, foco visível e sequência inicial
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
  check('primeiro-tab-pular-conteudo', first.href === '#conteudo', JSON.stringify(first));
  const skipVisible = await page.evaluate(() => {
    const r = document.activeElement.getBoundingClientRect();
    return r.width > 1 && r.height > 1 && r.top >= 0;
  });
  check('pular-conteudo-visivel-no-foco', skipVisible);
  const sequence = [];
  let invisibleFocus = 0;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // O indicador pode estar no próprio elemento ou no contêiner do campo (.nk-control:focus-within).
      let ring = false;
      for (let n = el, i = 0; n && i < 3 && !ring; n = n.parentElement, i++) {
        const cs = getComputedStyle(n);
        ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      }
      return { tag: el.tagName.toLowerCase(), label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), ring };
    });
    if (!info) continue;
    sequence.push(info);
    if (!info.ring) invisibleFocus++;
  }
  results.tabSequence = sequence;
  check('foco-visivel-nos-40-primeiros-tabs', invisibleFocus === 0, `${invisibleFocus} sem indicador de foco`);

  // Alternância de tema persiste
  const toggle = page.getByRole('button', { name: /tema/i }).first();
  await toggle.click();
  const afterToggle = await page.evaluate(() => document.documentElement.getAttribute('data-nk-theme'));
  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await page.evaluate(() => document.documentElement.getAttribute('data-nk-theme'));
  check('alternancia-de-tema-persiste', afterToggle === 'sakura-dark' && afterReload === 'sakura-dark', `${afterToggle} → recarregado: ${afterReload}`);
  await toggle.click();

  // Formulário: erros, foco no primeiro erro e envio desativado sem destino real
  const form = page.locator('#contato form');
  await form.locator('button[type="submit"]').click();
  const invalid = await form.locator('[aria-invalid="true"]').count();
  // O foco vai ao primeiro erro no quadro seguinte (requestAnimationFrame): espera até 1 s em vez de ler na hora.
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-invalid') === 'true', null, { timeout: 1000 }).catch(() => {});
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid'));
  check('formulario-erros-obrigatorios', invalid >= 4, `${invalid} campos inválidos; foco no primeiro inválido=${focused === 'true'}`);
  check('formulario-foco-no-primeiro-erro', focused === 'true');
  await page.screenshot({ path: path.join(outDir, 'formulario-erros.png'), clip: await form.boundingBox() });
  results.screenshots.push('formulario-erros.png');
  await form.getByLabel(/^Nome/).fill('Pessoa de Teste');
  await form.getByLabel(/^E-mail/).fill('teste@exemplo.invalid');
  await form.getByLabel(/Descreva o processo/).fill('Teste automatizado de homologação: processo de conciliação manual.');
  // Interesse marcado pelo teclado: foco na primeira opção do grupo e Espaço.
  await form.getByRole('radio').first().focus();
  await page.keyboard.press('Space');
  check('formulario-radio-por-teclado', await form.getByRole('radio').first().isChecked());
  let popup = false;
  page.on('popup', () => (popup = true));
  const urlBefore = page.url();
  const blockedBefore = results.blocked.length;
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(400);
  const done = page.locator('#contato .contact__done');
  const doneText = (await done.count()) ? await done.innerText() : '';
  results.formStatus = doneText;
  const contactStatus = await page.evaluate(() => document.querySelector('[data-contact-status]')?.getAttribute('data-contact-status'));
  if (contactStatus === 'pendente') {
    check('formulario-modo-demonstracao', /envio desativado/i.test(doneText) && doneText.includes('Pessoa de Teste'), doneText.replace(/\s+/g, ' ').slice(0, 220));
  }
  check('formulario-sem-envio-real', !popup && page.url() === urlBefore && results.blocked.length === blockedBefore, `popup=${popup}; url inalterada=${page.url() === urlBefore}`);
  // O resumo precisa ficar visível abaixo da barra fixa, sem rolagem manual.
  const placement = await page.evaluate(() => {
    const d = document.querySelector('#contato .contact__done')?.getBoundingClientRect();
    const nav = document.querySelector('header, nav')?.getBoundingClientRect();
    return { doneTop: d?.top, navBottom: nav?.bottom, focused: document.activeElement?.classList.contains('contact__done') };
  });
  check('formulario-resultado-visivel-e-focado', placement.focused && placement.doneTop >= placement.navBottom && placement.doneTop < 800, JSON.stringify(placement));
  await page.screenshot({ path: path.join(outDir, 'formulario-resultado-tela.png') });
  results.screenshots.push('formulario-resultado-tela.png');
  await done.screenshot({ path: path.join(outDir, 'formulario-resultado.png') });
  results.screenshots.push('formulario-resultado.png');

  // Texto renderizado (para revisão do conteúdo)
  writeFileSync(path.join(outDir, 'texto-renderizado.txt'), await page.locator('body').innerText());
  await context.close();
});

// 4. Menu mobile por teclado
await block('menu-mobile', async () => {
  const { context, page } = await newPage({ width: 375, height: 812 }, null);
  const menuBtn = page.getByRole('button', { name: /menu/i }).first();
  await menuBtn.focus();
  await page.keyboard.press('Enter');
  const expanded = await menuBtn.getAttribute('aria-expanded');
  await page.screenshot({ path: path.join(outDir, 'menu-mobile-aberto.png') });
  results.screenshots.push('menu-mobile-aberto.png');
  await page.keyboard.press('Escape');
  const closed = await menuBtn.getAttribute('aria-expanded');
  check('menu-mobile-abre-e-fecha-com-esc', expanded === 'true' && closed === 'false', `aberto=${expanded} depois do Esc=${closed}`);
  await context.close();
});

// 5. Hosting em faixa pôster: aviso de disponibilidade e condição de contratação visíveis em todas as larguras
await block('hosting-faixa', async () => {
  for (const vp of [WIDTHS[0], WIDTHS[2]]) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, null);
    if (vp.name === 'mobile') results.mobilePageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const band = page.locator('#hosting');
    const text = await band.innerText();
    const notice = await band.locator('.hosting-band__notice').isVisible();
    check(
      `hosting-condicoes-visiveis:${vp.name}`,
      notice && /Disponibilidade em avaliação/.test(text) && /só faz parte do contrato quando consta na proposta/.test(text) && /não representa contratação/.test(text),
      `aviso visível=${notice}${vp.name === 'mobile' ? `; altura da página=${results.mobilePageHeight}px` : ''}`,
    );
    await band.screenshot({ path: path.join(outDir, `hosting-faixa-${vp.name}.png`) });
    results.screenshots.push(`hosting-faixa-${vp.name}.png`);
    await context.close();
  }
});

check('sem-requisicoes-externas', results.blocked.length === 0, results.blocked.join(' | ') || 'nenhuma');
const realErrors = results.console.filter((c) => !/Download the React DevTools/.test(c));
check('console-sem-erros', realErrors.length === 0, realErrors.join(' | ') || 'limpo');

await browser.close();
results.finishedAt = new Date().toISOString();
results.fonts = [...results.fonts];
results.summary = { total: results.checks.length, failed: results.checks.filter((c) => !c.ok).length };
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify(results, null, 2));
const md = [
  `# Homologação automatizada — ${results.finishedAt}`,
  '',
  `URL: ${baseUrl} · Chromium (Playwright) · ${results.summary.total} verificações · ${results.summary.failed} falha(s)`,
  '',
  '| Verificação | Resultado | Detalhe |',
  '|---|---|---|',
  ...results.checks.map((c) => `| ${c.id} | ${c.ok ? 'OK' : '**FALHA**'} | ${String(typeof c.detail === 'string' ? c.detail : JSON.stringify(c.detail ?? '')).replace(/\|/g, '\\|').slice(0, 300)} |`),
  '',
  `Capturas: ${results.screenshots.join(', ')}`,
].join('\n');
writeFileSync(path.join(outDir, 'resumo.md'), md + '\n');
console.log(`\n${results.summary.total} verificações, ${results.summary.failed} falha(s). Resultados em ${outDir}`);
process.exit(results.summary.failed ? 1 : 0);
