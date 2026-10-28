#!/usr/bin/env node
/**
 * Homologação automatizada da página comercial num navegador real (Playwright: Chromium, Firefox ou WebKit).
 *
 * Uso:
 *   npm run build && npm run preview -- --port 4173 --strictPort      # em outro terminal
 *   node scripts/homologacao.mjs http://127.0.0.1:4173/ docs/release/evidencias/<pasta>
 *   NEKKORA_NAVEGADOR=firefox node scripts/homologacao.mjs ...        # chromium (padrão), firefox ou webkit
 *
 * Playwright e axe-core são devDependencies desde a COM-RELEASE-001 (versões fixas). NEKKORA_PW_MODULES continua
 * aceito para usar outra pasta node_modules que os contenha.
 *
 * Saída: capturas (JPEG), resultados.json e resumo.md na pasta indicada. Código de saída 1 se alguma verificação
 * falhar. Nenhuma requisição sai do localhost: tudo que tentar sair é bloqueado e registrado.
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { priceFacts } from '../src/precos.ts';
import { BOOKINGS_HOSTS } from '../src/agendamento-url.js';

const [, , baseUrl = 'http://localhost:4173/', outDir = 'docs/com-001/evidencias/depois'] = process.argv;
const modules = process.env.NEKKORA_PW_MODULES;
const require = createRequire(modules ? path.resolve(modules, 'noop.js') : import.meta.url);
const ENGINE = process.env.NEKKORA_NAVEGADOR ?? 'chromium';
const playwright = require('playwright');
if (!['chromium', 'firefox', 'webkit'].includes(ENGINE)) throw new Error(`NEKKORA_NAVEGADOR inválido: ${ENGINE}`);
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
  // COM-RELEASE-003-R1 §3.3: nenhum desconto único de 50% — nem no bloco de preços (a condição 50/50 é pagamento)
  { id: 'desconto-50', re: /50\s?%\s*de\s+desconto|desconto\s+(?:universal\s+)?de\s+50|promo[cç][aã]o\s+de\s+50|metade\s+do\s+pre[cç]o|pela\s+metade|[−-]\s?50\s?%|todas\s+as\s+automa[cç][oõ]es/gi },
];

/**
 * Tabela oficial (COM-RELEASE-003-R1 §3.1, COM-RELEASE-005 §3.2), digitada aqui de propósito — independente do código —
 * e conferida contra src/precos.ts (a fonte da página) antes de qualquer navegador abrir: se o código mudar, a
 * homologação falha em vez de aceitar o novo valor.
 */
const OFFICIAL_PRICES = {
  simples: { padrao: 'R$ 1.500', lancamento: 'R$ 1.000', percentual: '−33,33%', economia: 'Economia de R$ 500' },
  media: { padrao: 'R$ 3.500', lancamento: 'R$ 2.800', percentual: '−20%', economia: 'Economia de R$ 700' },
  complexa: {},
};
const fromSource = Object.fromEntries(
  ['simples', 'media'].map((t) => {
    const f = priceFacts(t);
    return [t, { padrao: f.standardLabel, lancamento: f.launchLabel, percentual: `−${f.percentLabel}`, economia: `Economia de ${f.savingsLabel}` }];
  }),
);
if (JSON.stringify({ ...fromSource, complexa: {} }) !== JSON.stringify(OFFICIAL_PRICES)) {
  throw new Error(`src/precos.ts diverge da tabela oficial: ${JSON.stringify(fromSource)}`);
}

/** Valores do bloco de preços como aparecem na tela (data-price) e o estilo do preço padrão riscado. */
const readRenderedPrices = (page) =>
  page.evaluate(() => {
    const block = document.querySelector('[data-pricing]');
    return {
      table: Object.fromEntries(
        [...(block?.querySelectorAll('[data-price-tier]') ?? [])].map((el) => [
          el.getAttribute('data-price-tier'),
          Object.fromEntries([...el.querySelectorAll('[data-price]')].map((v) => [v.getAttribute('data-price'), v.textContent.trim()])),
        ]),
      ),
      struck: [...(block?.querySelectorAll('s[data-price="padrao"]') ?? [])].map((s) => {
        const r = s.getBoundingClientRect();
        return { text: s.textContent.trim(), lineThrough: getComputedStyle(s).textDecorationLine.includes('line-through'), visible: r.width > 0 && r.height > 0 };
      }),
    };
  });

const results = { baseUrl, navegador: ENGINE, startedAt: new Date().toISOString(), checks: [], screenshots: [], axe: {}, console: [], blocked: [], fonts: new Set() };
const check = (id, ok, detail) => {
  results.checks.push({ id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${id}${detail ? ` — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`);
};

const browser = await playwright[ENGINE].launch();
results.versaoNavegador = browser.version();
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
    // Fonte Inter: vem da nekkora-lib 0.2.0 (dist/fonts) e é servida pelo próprio site — registrada à parte.
    if (url.startsWith(local) && /\.woff2(\?|$)/.test(url)) results.fonts.add(new URL(url).pathname.replace(/-[\w-]{8}\.woff2$/, '.woff2'));
    if (url.startsWith(local) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    // Qualquer outra origem (inclusive Google Fonts, que a lib usava antes da 0.2.0) é bloqueada e reprova a homologação.
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
    // Preços efetivamente renderizados em cada tema e largura (COM-RELEASE-005 §3.5): valores, percentuais e economia
    // lidos da tela e comparados com a tabela oficial; o preço padrão precisa aparecer riscado.
    const shown = await readRenderedPrices(page);
    check(`precos-renderizados:${theme}:${vp.name}`, JSON.stringify(shown.table) === JSON.stringify(OFFICIAL_PRICES), JSON.stringify(shown.table));
    check(`precos-padrao-riscado:${theme}:${vp.name}`, shown.struck.length === 2 && shown.struck.every((s) => s.lineThrough && s.visible), JSON.stringify(shown.struck));
    // Conferência visual dos preços (COM-RELEASE-003 §11.2, COM-RELEASE-005 §3.5): os três cartões, em cada tema, no
    // celular, no tablet e no desktop
    if (vp.name !== 'wide') {
      const cards = `precos-${theme}-${vp.name}.png`;
      // a barra fixa do topo cobriria o primeiro cartão no recorte: escondida só nesta captura
      await page.locator('#precos .cards--3').screenshot({ path: path.join(outDir, cards), style: 'header, nav { visibility: hidden !important; }' });
      results.screenshots.push(cards);
    }
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
    await page.evaluate(axeSource); // evaluate (protocolo do navegador), não <script>: a CSP da página bloqueia script inline
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
  const expected = ['inicio', 'solucoes', 'precos', 'como-funciona', 'hosting', 'transparencia', 'contato', 'privacidade'];
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
  const contactsConfigured = await page.evaluate(() => document.querySelector('[data-contact-status]')?.getAttribute('data-contact-status'));
  // mailto só com canal confirmado e domínio real (nada de .invalid/.example/.test)
  const fakeMail = (h) => /^mailto:/.test(h) && (contactsConfigured !== 'configurado' || /@[^?]+\.(invalid|example|test)(\?|$)/i.test(h));
  const fake = external.filter((h) => /wa\.me\/0*$|wa\.me\/55?0{8,}|instagram\.com\/?$|linkedin\.com\/?$/.test(h) || fakeMail(h));
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
      condition: /Valem para automações simples e médias com proposta aprovada durante a campanha/.test(text) && /A automação complexa tem orçamento individual/.test(text),
      confirmedInProposal: /fica registrada na proposta/.test(text),
      licenses: /não estão incluídos nos valores acima/.test(text),
      // Tabela oficial da COM-RELEASE-003-R1 §3.1, lida do que está NA TELA (data-price de cada valor)
      table: Object.fromEntries(
        [...(block?.querySelectorAll('[data-price-tier]') ?? [])].map((el) => [
          el.getAttribute('data-price-tier'),
          Object.fromEntries([...el.querySelectorAll('[data-price]')].map((v) => [v.getAttribute('data-price'), v.textContent.trim()])),
        ]),
      ),
      complexa: /Automação complexa[\s\S]*?Sob orçamento[\s\S]*?orçamento individual/.test(text),
      criteria: ['Quantidade de sistemas', 'Complexidade das integrações', 'Regras de negócio', 'Volume de processamento', 'Exigências de infraestrutura', 'Necessidade de licenciamento'].every((c) => text.includes(c)),
      conditions: /50% na contratação e 50% na entrega/.test(text) && /Preço aprovado por você antes do início/.test(text) && /organizadas em fila/.test(text) && /Licenças e custos externos tratados à parte/.test(text),
      srLabels: [...(block?.querySelectorAll('.price .nk-visually-hidden') ?? [])].map((e) => e.textContent.trim()),
    };
  });
  results.pricing = pricing;
  check('precos-so-no-bloco-de-precos', pricing.blocks === 1 && hits.filter((h) => h.pricing).length > 0, `${pricing.blocks} bloco(s) data-pricing`);
  check('precos-com-condicoes-visiveis', pricing.condition && pricing.confirmedInProposal && pricing.licenses, JSON.stringify({ ...pricing, srLabels: undefined }));
  check('precos-tabela-oficial', JSON.stringify(pricing.table) === JSON.stringify(OFFICIAL_PRICES) && pricing.complexa, JSON.stringify(pricing.table));
  // Nenhum percentual de desconto fora da tabela (ex.: o "−50%" de um build antigo — COM-RELEASE-005 §3.1)
  const badges = await page.$$eval('[data-pricing] .nk-badge', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /%/.test(t)));
  check('precos-sem-percentual-inconsistente', badges.length === 2 && badges.every((b) => /−(33,33|20)%$/.test(b)), badges.join(' | '));
  // O artefato servido é o do código em disco (COM-RELEASE-005 §3.3): commit do release.json = HEAD do repositório
  {
    const served = await page.evaluate(async () => {
      const r = await fetch('/release.json', { cache: 'no-store' });
      return r.ok ? r.json() : null;
    });
    let head = null;
    try {
      head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    } catch {}
    const footer = await page.locator('footer [data-build-commit]').getAttribute('data-build-commit').catch(() => null);
    results.artefato = { servido: served?.commit ?? null, head, rodape: footer };
    check(
      'artefato-corresponde-ao-codigo',
      served?.commit != null && (head == null || served.commit === head) && (footer == null || served.commit.startsWith(footer)),
      `release.json=${served?.commit?.slice(0, 7) ?? 'ausente'}; HEAD=${head?.slice(0, 7) ?? 'git indisponível'}; rodapé=${footer ?? 'sem aviso de homologação'}`,
    );
  }
  // Agendamento (COM-RELEASE-005 §4.5, NEKKORA-COM-007): sem URL oficial do Bookings, nenhum botão nem link de
  // agendamento; com ela, todos apontam para a mesma página oficial, em nova aba, sem opener e sem Referer
  {
    const scheduling = await page.evaluate((hosts) => {
      const isBookings = (href) => {
        try {
          return hosts.includes(new URL(href, location.href).hostname);
        } catch {
          return false;
        }
      };
      const links = [...document.querySelectorAll('a[href]')].filter((a) => isBookings(a.getAttribute('href')) || /bookings/i.test(a.getAttribute('href')));
      return {
        buttons: [...document.querySelectorAll('a, button')].filter((e) => /Agendar conversa/i.test(e.textContent ?? '')).length,
        links: links.length,
        hrefs: [...new Set(links.map((a) => a.getAttribute('href')))],
        isolated: links.every((a) => a.target === '_blank' && /\bnoopener\b/.test(a.rel) && /\bnoreferrer\b/.test(a.rel)),
        status: document.querySelector('[data-agendamento]')?.getAttribute('data-agendamento') ?? null,
      };
    }, BOOKINGS_HOSTS);
    results.agendamento = scheduling;
    const configured = scheduling.status === 'configurado';
    check(
      'agendamento-conforme-configuracao',
      configured
        ? scheduling.buttons >= 2 && scheduling.links === scheduling.buttons && scheduling.hrefs.length === 1 && scheduling.isolated
        : scheduling.buttons === 0 && scheduling.links === 0,
      configured
        ? `${scheduling.buttons} botão(ões) para ${scheduling.hrefs.join(', ')}; nova aba sem opener e sem Referer: ${scheduling.isolated ? 'sim' : 'NÃO'}`
        : `URL do Bookings não configurada: ${scheduling.buttons} botão(ões), ${scheduling.links} link(s)`,
    );
  }
  // Coerência matemática do que é exibido: economia = padrão − lançamento; percentual = economia / padrão (2 casas, truncado)
  const num = (s) => Number(String(s).replace(/[^\d,]/g, '').replace(',', '.'));
  const coherent = ['simples', 'media'].every((t) => {
    const v = pricing.table[t] ?? {};
    const saved = num(v.padrao) - num(v.lancamento);
    return saved === num(v.economia) && Math.floor((saved / num(v.padrao)) * 10000) / 100 === num(v.percentual);
  });
  check('precos-descontos-coerentes', coherent, 'economia = padrão − lançamento; percentual = economia ÷ padrão');
  check('precos-criterios-de-categoria', pricing.criteria);
  check('condicoes-comerciais-visiveis', pricing.conditions);
  // Delivery: tecnologias citadas sem promessa de compatibilidade universal
  const delivery = await page.locator('#solucoes').innerText();
  check(
    'delivery-tecnologias-com-ressalva',
    ['Python', 'UiPath', 'Power Automate', 'Integrações via API'].every((t) => delivery.includes(t)) && /viabilidade com cada sistema é confirmada na avaliação/.test(delivery),
  );
  // Privacidade: seção própria, link no rodapé e no formulário
  const privacy = await page.locator('#privacidade').innerText();
  check(
    'privacidade-visivel',
    /O que vai para o (WhatsApp|e-mail)/.test(privacy) && /Sem cookies nem rastreamento/.test(privacy) && (await page.locator('footer a[href="#privacidade"]').count()) === 1,
    privacy.split('\n').slice(0, 2).join(' · '),
  );
  check(
    'precos-leitura-do-valor-riscado',
    JSON.stringify(pricing.srLabels) === JSON.stringify(['Preço padrão:', 'Preço especial de lançamento:', 'Desconto de', 'Preço padrão:', 'Preço especial de lançamento:', 'Desconto de']),
    pricing.srLabels.join(' | '),
  );

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
  if (ENGINE === 'webkit') {
    // WebKit/Safari: por padrão o Tab não percorre links (só controles; links exigem Option+Tab, que o Playwright não
    // reproduz). Vale para qualquer site — o link é verificado por foco programático: precisa ser focável e aparecer.
    await page.locator('a.skip-link').focus();
  } else {
    await page.keyboard.press('Tab');
  }
  const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
  check(ENGINE === 'webkit' ? 'pular-conteudo-focavel' : 'primeiro-tab-pular-conteudo', first.href === '#conteudo', JSON.stringify(first));
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

  // Botão "Entrar" (etapa 2): sem destino por decisão da responsável — não navega, não abre nada e se declara indisponível
  {
    const login = page.getByRole('button', { name: /^Entrar/ }).first();
    const urlBefore = page.url();
    // force: o Playwright não clica em aria-disabled, mas o navegador entrega o clique — é ele que precisa ficar sem efeito
    await login.click({ force: true });
    await page.waitForTimeout(200);
    const info = await login.evaluate((el) => ({ disabled: el.getAttribute('aria-disabled'), desc: el.getAttribute('aria-label') }));
    check('entrar-sem-destino-e-indisponivel', page.url() === urlBefore && info.disabled === 'true' && /ainda não disponível/.test(info.desc ?? ''), `url inalterada=${page.url() === urlBefore}; aria-disabled=${info.disabled}; nome acessível="${info.desc}"`);
  }

  // Diálogo "Solicitar avaliação": aberto pelos CTAs, foco dentro, Esc fecha e devolve o foco ao botão que abriu
  const triggers = await page.$$eval('[aria-haspopup="dialog"]', (els) => els.map((e) => `${e.closest('section')?.id}: ${e.textContent.trim()}`));
  results.dialogTriggers = triggers;
  check('dialogo-aberto-pelos-ctas', triggers.length === 4, triggers.join(' | '));
  const dialog = page.getByRole('dialog');
  const heroCta = page.locator('#inicio [aria-haspopup="dialog"]');
  await heroCta.focus();
  await page.keyboard.press('Enter');
  await dialog.waitFor();
  const opened = await page.evaluate(() => ({ focusInside: !!document.activeElement?.closest('[role="dialog"]'), hash: location.hash }));
  check('dialogo-abre-com-foco-dentro', opened.focusInside && opened.hash === '', JSON.stringify(opened));
  const dialogText = await dialog.innerText();
  // Publicação atual: só e-mail e LinkedIn (decisão da titular, 22/10/2026) — nenhum WhatsApp, atalho de e-mail presente
  const mailDirect = await dialog.locator('a[href^="mailto:"]').count();
  check(
    'dialogo-canal-da-publicacao',
    (await dialog.locator('a[href*="wa.me"]').count()) === 0 &&
      !/Falar diretamente pelo WhatsApp/.test(dialogText) &&
      (contactsConfigured === 'configurado' ? mailDirect === 1 && /Escrever diretamente por e-mail/.test(dialogText) : /Canais oficiais em definição/.test(dialogText)),
    contactsConfigured === 'configurado' ? `atalho de e-mail: ${mailDirect}; WhatsApp ausente` : 'sem canal confirmado: aviso de canais em definição presente',
  );
  await page.screenshot({ path: path.join(outDir, 'dialogo-solicitacao.png') });
  results.screenshots.push('dialogo-solicitacao.png');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  const returned = await page.evaluate(() => !!document.activeElement?.closest('#inicio') && document.activeElement?.getAttribute('aria-haspopup') === 'dialog');
  check('dialogo-esc-fecha-e-devolve-foco', returned);
  const others = [];
  for (const sec of ['precos', 'hosting', 'contato']) {
    await page.locator(`#${sec} [aria-haspopup="dialog"]`).click();
    const ok = await dialog.isVisible();
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await dialog.waitFor({ state: 'detached' });
    others.push(`${sec}=${ok}`);
  }
  check('dialogo-ctas-de-precos-hosting-contato', others.every((o) => o.endsWith('true')), `${others.join('; ')} (fechado por "Cancelar")`);

  // Formulário (no diálogo): erros, foco no primeiro erro e envio desativado sem destino real
  await page.locator('#contato [aria-haspopup="dialog"]').click();
  await dialog.waitFor();
  const form = dialog.locator('form');
  const submit = dialog.locator('button[type="submit"]');
  await submit.click();
  const invalid = await form.locator('[aria-invalid="true"]').count();
  // O foco vai ao primeiro erro no quadro seguinte (requestAnimationFrame): espera até 1 s em vez de ler na hora.
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-invalid') === 'true', null, { timeout: 1000 }).catch(() => {});
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid'));
  // Obrigatórios: nome e descrição (e-mail é opcional desde a COM-RELEASE-002 — só o necessário para o contato)
  check('formulario-erros-obrigatorios', invalid === 2, `${invalid} campos inválidos; foco no primeiro inválido=${focused === 'true'}`);
  check('formulario-foco-no-primeiro-erro', focused === 'true');
  await page.screenshot({ path: path.join(outDir, 'formulario-erros.png') });
  results.screenshots.push('formulario-erros.png');
  await form.getByLabel(/^Nome/).fill('Pessoa de Teste');
  await form.getByLabel(/^E-mail/).fill('teste@exemplo.invalid');
  await form.getByLabel(/Descreva o processo/).fill('Teste automatizado de homologação: processo de conciliação manual.');
  let popup = false;
  page.on('popup', () => (popup = true));
  const urlBefore = page.url();
  const blockedBefore = results.blocked.length;
  await submit.click();
  await page.waitForTimeout(400);
  const done = dialog.locator('.contact__done');
  const doneText = (await done.count()) ? await done.innerText() : '';
  results.formStatus = doneText;
  const contactStatus = await page.evaluate(() => document.querySelector('[data-contact-status]')?.getAttribute('data-contact-status'));
  if (contactStatus === 'pendente') {
    check('formulario-modo-demonstracao', /envio desativado/i.test(doneText) && doneText.includes('Pessoa de Teste'), doneText.replace(/\s+/g, ' ').slice(0, 220));
  } else {
    // Com canal: a etapa seguinte é a confirmação da mensagem — nada é aberto antes do clique do visitante
    check('formulario-vai-para-confirmacao', /Confirme a sua solicitação/.test(doneText) && doneText.includes('Pessoa de Teste'), doneText.replace(/\s+/g, ' ').slice(0, 220));
  }
  check('formulario-sem-envio-real', !popup && page.url() === urlBefore && results.blocked.length === blockedBefore, `popup=${popup}; url inalterada=${page.url() === urlBefore}`);
  // O resumo precisa ficar visível na janela e receber o foco.
  const placement = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"] .contact__done')?.getBoundingClientRect();
    return { doneTop: d?.top, viewport: innerHeight, focused: document.activeElement?.classList.contains('contact__done') };
  });
  check('formulario-resultado-visivel-e-focado', placement.focused && placement.doneTop >= 0 && placement.doneTop < placement.viewport, JSON.stringify(placement));
  await page.screenshot({ path: path.join(outDir, 'formulario-resultado-tela.png') });
  results.screenshots.push('formulario-resultado-tela.png');
  await page.keyboard.press('Escape');

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

// 6. Diálogo aberto: axe e rolagem horizontal nos dois temas, celular e desktop
await block('dialogo-acessibilidade', async () => {
  for (const theme of THEMES) {
    for (const vp of [WIDTHS[0], WIDTHS[2]]) {
      const { context, page } = await newPage({ width: vp.width, height: vp.height }, theme);
      await page.locator('#inicio [aria-haspopup="dialog"]').click();
      await page.getByRole('dialog').waitFor();
      await page.evaluate(axeSource); // evaluate (protocolo do navegador), não <script>: a CSP da página bloqueia script inline
      const r = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const res = await axe.run(document.querySelector('[role="dialog"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
        return res.violations.map((v) => `${v.id}(${v.nodes.length})`);
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(`dialogo-axe:${theme}:${vp.name}`, r.length === 0 && overflow <= 0, r.join(', ') || `sem violações; excesso horizontal=${overflow}px`);
      const file = `dialogo-${theme}-${vp.name}.png`;
      await page.screenshot({ path: path.join(outDir, file) });
      results.screenshots.push(file);
      await context.close();
    }
  }
});

check('sem-requisicoes-externas', results.blocked.length === 0, results.blocked.join(' | ') || 'nenhuma');
check('fonte-servida-pelo-proprio-site', results.fonts.size > 0, [...results.fonts].join(', ') || 'nenhuma fonte carregada');
// Aviso de otimização do WebKit quando a fonte pré-carregada demora a ser usada (a página é desenhada pelo JS; em
// máquina lenta passa de "alguns segundos"): registrado em resultados.json, não reprova — a fonte é usada.
const PRELOAD_ADVISORY = /was preloaded using link preload but not used within a few seconds/;
results.consoleInformativo = results.console.filter((c) => PRELOAD_ADVISORY.test(c));
const realErrors = results.console.filter((c) => !/Download the React DevTools/.test(c) && !PRELOAD_ADVISORY.test(c));
check('console-sem-erros', realErrors.length === 0, realErrors.join(' | ') || 'limpo');

await browser.close();
results.finishedAt = new Date().toISOString();
results.fonts = [...results.fonts];
results.summary = { total: results.checks.length, failed: results.checks.filter((c) => !c.ok).length };
writeFileSync(path.join(outDir, 'resultados.json'), JSON.stringify(results, null, 2));
const md = [
  `# Homologação automatizada — ${results.finishedAt}`,
  '',
  `URL: ${baseUrl} · ${ENGINE} ${results.versaoNavegador} (Playwright) · ${results.summary.total} verificações · ${results.summary.failed} falha(s)`,
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
