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
 *   NEKKORA_DATA=2026-11-15 node scripts/homologacao.mjs ...          # relógio do navegador fixado nesse dia (12h, Brasília)
 *
 * Situação da campanha (NEKKORA-COM-RELEASE-FIX-001): derivada do publicacao.json que o artefato servido declara
 * (release.json → "publicacao") e de campaignState/todayInBrazil (src/precos.ts), na data do relógio do navegador —
 * fixado em NEKKORA_DATA ou, sem ela, no instante em que a homologação começa (sem virar o dia no meio da execução).
 * Desde a COM-VITRINE-001 a campanha controla só a comunicação promocional (faixa, condição e regras): os preços —
 * individual, pacote de 3 e economia — são os mesmos em qualquer data, sem valor riscado nem percentual.
 *
 * NEKKORA-COM-CANAIS-001 (titular, 12/11/2026): o WhatsApp é o único canal público de atendimento comercial. A página
 * não tem formulário, diálogo de solicitação, link mailto nem agendamento (Bookings) — e a homologação comprova a
 * ausência; o "Entrar" leva à Nekkora Platform (nunca seguido aqui). A jornada do WhatsApp em detalhe (mensagens, botão
 * flutuante, redes institucionais) está em scripts/homologacao-canais.mjs.
 *
 * Saída: capturas (JPEG), resultados.json e resumo.md na pasta indicada. Código de saída 1 se alguma verificação
 * falhar. Nenhuma requisição sai do localhost: tudo que tentar sair é bloqueado e registrado (as abas do wa.me abertas
 * pelos CTAs são respondidas por uma página local de teste).
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { campaignState, priceFacts, todayInBrazil } from '../src/precos.ts';
import { BOOKINGS_HOSTS } from './comercial/agendamento-url.mjs';

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
 * Tabela da COM-VITRINE-001 §3 (individual, pacote de 3 e economia contra três individuais), digitada aqui de propósito
 * — independente do código — e conferida contra src/precos.ts (a fonte da página) antes de qualquer navegador abrir: se
 * o código mudar, a homologação falha em vez de aceitar o novo valor. Vale em qualquer data (V-01).
 */
const OFFICIAL_PRICES = {
  simples: { individual: 'R$ 650', pacote: 'R$ 1.500', economia: 'Economia de R$ 450' },
  media: { individual: 'R$ 1.400', pacote: 'R$ 3.500', economia: 'Economia de R$ 700' },
};
const fromSource = Object.fromEntries(
  ['simples', 'media'].map((t) => {
    const f = priceFacts(t);
    return [t, { individual: f.individualLabel, pacote: f.packageLabel, economia: `Economia de ${f.savingsLabel}` }];
  }),
);
if (JSON.stringify(fromSource) !== JSON.stringify(OFFICIAL_PRICES)) {
  throw new Error(`src/precos.ts diverge da tabela oficial: ${JSON.stringify(fromSource)}`);
}
/** Valores da tabela ANTERIOR (lançamento 06/11/2026): nunca podem aparecer nos cartões. */
const PREVIOUS_LABELS = ['R$ 1.000', 'R$ 2.800'];

/**
 * NEKKORA-COM-CANAIS-001 (titular, 12/11/2026): destino do "Entrar" (Nekkora Platform, mesma aba) — digitado aqui de
 * propósito, igual a PLATFORM_LOGIN_URL de src/config.ts — e frases que mandariam o visitante enviar a solicitação por
 * e-mail (a jornada por e-mail saiu da página; o e-mail fica só como identificação do fornecedor e canal dos direitos).
 */
const PLATFORM_LOGIN_URL = 'https://platform.nekkora.com/entrar';
if (!readFileSync('src/config.ts', 'utf8').includes(`PLATFORM_LOGIN_URL = '${PLATFORM_LOGIN_URL}'`)) throw new Error('src/config.ts: PLATFORM_LOGIN_URL diverge da homologação');
const EMAIL_INSTRUCTION = /(?:envie|mande|escreva|solicite|peça|abra)[^.]{0,60}\b(?:por|pelo|no) e-mail|aplicativo de e-mail|Escrever diretamente por e-mail|Abrir no e-mail/i;

// Situação da campanha no artefato servido: o release.json diz com qual publicacao.json o build foi feito.
const release = await fetch(new URL('release.json', baseUrl), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
if (!release?.publicacao) throw new Error(`release.json ausente ou sem "publicacao" em ${baseUrl}`);
const publicacao = JSON.parse(readFileSync(release.publicacao, 'utf8'));
const DATA = process.env.NEKKORA_DATA || null;
if (DATA != null && !/^\d{4}-\d{2}-\d{2}$/.test(DATA)) throw new Error(`NEKKORA_DATA inválida: ${DATA}`);
const NOW = DATA ? new Date(`${DATA}T12:00:00-03:00`) : new Date();
const CAMPAIGN = campaignState(publicacao.campanhaLancamento, todayInBrazil(NOW));
// Comunicação promocional (faixa e regras): só com a campanha vigente — ou, sem datas aprovadas, como prévia de um build
// com aviso de homologação (o portão scripts/verificar-publicacao.mjs recusa publicar sem datas, PUB-13). Os preços não
// dependem disso.
const PROMO = CAMPAIGN === 'vigente' || (CAMPAIGN === 'pendente' && publicacao.avisoHomologacao === true);
const toBr = (iso) => iso.split('-').reverse().join('/');
/** Número do WhatsApp por extenso, como a página o escreve (+55 (11) 91772-4200) — regras da campanha e aviso de privacidade. */
const WHATSAPP_DISPLAY = (() => {
  const m = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(publicacao.canais.whatsapp ?? '');
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : null;
})();
const PERIOD = CAMPAIGN === 'pendente' ? null : `de ${toBr(publicacao.campanhaLancamento.inicio)} a ${toBr(publicacao.campanhaLancamento.fim)}`;
const CAMPAIGN_LABEL = `campanha ${CAMPAIGN} em ${todayInBrazil(NOW)}${PROMO ? ' — com comunicação promocional' : ' — sem comunicação promocional'}`;
console.log(`Campanha (${release.publicacao}): ${CAMPAIGN_LABEL}`);

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
      // Qualquer valor riscado nos cartões (s, del ou line-through), para provar a ausência fora da campanha
      anyStruck: [...(block?.querySelectorAll('[data-price-tier] *') ?? [])]
        .filter((e) => e.matches('s, del, strike') || getComputedStyle(e).textDecorationLine.includes('line-through'))
        .map((e) => e.textContent.trim()),
    };
  });

/** Os mesmos preços em qualquer situação da campanha (V-01), sem nenhum valor riscado (V-07). */
const expectRendered = (shown) => JSON.stringify(shown.table) === JSON.stringify(OFFICIAL_PRICES);
const expectStruck = (shown) => shown.struck.length === 0 && shown.anyStruck.length === 0;

const results = { baseUrl, navegador: ENGINE, campanha: { estado: CAMPAIGN, data: todayInBrazil(NOW), promocional: PROMO, publicacao: release.publicacao }, startedAt: new Date().toISOString(), checks: [], screenshots: [], axe: {}, console: [], blocked: [], whatsappAbas: [], fonts: new Set() };
const check = (id, ok, detail) => {
  results.checks.push({ id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${id}${detail ? ` — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`);
};

const browser = await playwright[ENGINE].launch();
results.versaoNavegador = browser.version();
const local = new URL(baseUrl).origin;

async function newPage(viewport, theme) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  // Mesmo dia para a página e para a expectativa acima (Date fixo; os timers continuam correndo)
  await context.clock.setFixedTime(NOW);
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
    // Aba aberta por um CTA do WhatsApp (ctas-abrem-whatsapp-sem-dialogo): respondida por uma página LOCAL de teste,
    // registrada à parte — o wa.me real nunca é acessado
    if (url.startsWith('https://wa.me/')) {
      results.whatsappAbas.push(url);
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>wa.me (página de teste local)</title><h1>wa.me — página de teste local</h1>' });
    }
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
    // Preços efetivamente renderizados em cada tema e largura (COM-RELEASE-005 §3.5): individual, pacote e economia
    // lidos da tela e comparados com a tabela oficial; nenhum valor pode aparecer riscado.
    const shown = await readRenderedPrices(page);
    check(`precos-renderizados:${theme}:${vp.name}`, expectRendered(shown), `${CAMPAIGN_LABEL}: ${JSON.stringify(shown.table)}`);
    check(`precos-sem-valor-riscado:${theme}:${vp.name}`, expectStruck(shown), `riscados: ${JSON.stringify(shown.anyStruck)}`);
    // Conferência visual dos preços (COM-RELEASE-003 §11.2, COM-RELEASE-005 §3.5): os três cartões, em cada tema, no
    // celular, no tablet e no desktop
    if (vp.name !== 'wide') {
      const cards = `precos-${theme}-${vp.name}.png`;
      // a barra fixa do topo cobriria o primeiro cartão no recorte: escondida só nesta captura
      await page.locator('#precos .price-cards').screenshot({ path: path.join(outDir, cards), style: 'header, nav { visibility: hidden !important; }' });
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
    // O botão flutuante (fixo, NEKKORA-COM-CANAIS-001) fica por cima do conteúdo perto da borda inferior: escondido só
    // nesta captura, para medir o texto contra o PRÓPRIO fundo (o contraste do botão é medido em homologacao-canais.mjs)
    const png = await page.screenshot({ clip: box, style: '.nk-fab { visibility: hidden !important; }' });
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
  const fake = external.filter((h) => /wa\.me\/0*(\?|$)|wa\.me\/55?0{8,}|instagram\.com\/?$|linkedin\.com\/?$/.test(h));
  results.contactStatus = contactsConfigured;
  check('sem-destinos-provisorios', fake.length === 0, `links externos: ${external.length ? external.join(' | ') : 'nenhum'}; status contato=${contactsConfigured}`);
  // NEKKORA-COM-CANAIS-001 (titular, 12/11/2026): sem jornada por e-mail — nenhum link mailto em lugar nenhum da página.
  // O e-mail continua só como texto (identificação do fornecedor no rodapé e canal dos direitos no aviso de privacidade).
  const mailto = external.filter((h) => /^mailto:/i.test(h));
  check('sem-link-mailto', mailto.length === 0, mailto.length ? mailto.join(' | ') : 'nenhum link mailto');
  const fab = await page.$('.nk-fab, [class*="floating"]');
  check('sem-whatsapp-flutuante-provisorio', contactsConfigured === 'configurado' || !fab, fab ? 'botão flutuante presente' : 'ausente');
  // Atendimento só pelo WhatsApp: todos os CTAs (data-whatsapp) levam ao número da publicação servida, em outra aba, sem
  // opener e sem Referer, nos cinco contextos (a mensagem exata de cada um é conferida em scripts/homologacao-canais.mjs)
  {
    const number = publicacao.canais.whatsapp;
    const ctas = await page.$$eval('[data-whatsapp]', (els) =>
      els.map((a) => ({ ctx: a.getAttribute('data-whatsapp'), href: a.getAttribute('href') ?? '', target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '', where: a.closest('section')?.id ?? (a.classList.contains('nk-fab') ? 'flutuante' : '?') })),
    );
    results.whatsappCtas = ctas;
    const where = ctas.map((c) => `${c.where}:${c.ctx}`).join(',');
    check(
      'atendimento-so-pelo-whatsapp',
      contactsConfigured === 'configurado' &&
        where === 'inicio:geral,precos:delivery,precos:monitor,precos:ai,hosting:hosting,contato:geral,flutuante:geral' &&
        ctas.every((c) => c.href.startsWith(`https://wa.me/${number}?text=`) && c.target === '_blank' && /\bnoopener\b/.test(c.rel) && /\bnoreferrer\b/.test(c.rel)),
      `${where} → wa.me/${number}`,
    );
  }

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
      // Regras da campanha da COM-008-B: vale a solicitação; aceite da proposta em até 7 dias corridos
      // COM-VITRINE-001 (etapa 3): faixa da campanha sem "preços especiais"; a tabela nova a partir da data de início (V-02)
      condition: /Campanha de lançamento para solicitações de avaliação recebidas/.test(text) && /aceita em até 7 dias corridos da emissão/.test(text) && !/Preços especiais|preço de lançamento/i.test(text),
      newConditionsPending: !!block?.querySelector('[data-novas-condicoes="pendente"]'),
      confirmedInProposal: /fica registrada na proposta/.test(text),
      licenses: /não estão incluídos nos valores acima/.test(text),
      // Tabela oficial da COM-RELEASE-003-R1 §3.1, lida do que está NA TELA (data-price de cada valor)
      table: Object.fromEntries(
        [...(block?.querySelectorAll('[data-price-tier]') ?? [])].map((el) => [
          el.getAttribute('data-price-tier'),
          Object.fromEntries([...el.querySelectorAll('[data-price]')].map((v) => [v.getAttribute('data-price'), v.textContent.trim()])),
        ]),
      ),
      // COM-VITRINE-001 (V-04): sem categoria complexa, sem "sob orçamento" e sem a faixa acima de 16 horas; demandas fora
      // das modalidades pelos canais gerais. Lido por textContent (inclui as regras recolhidas).
      semComplexa: !/complexa|sob orçamento|acima de 16 horas/i.test(block?.textContent ?? '') && (block?.querySelectorAll('[data-price-tier]').length ?? 0) === 2,
      // NEKKORA-COM-CANAIS-001: o caminho é o WhatsApp com a mensagem do Delivery (nenhum botão de diálogo)
      outrasDemandas:
        /Não encontrou uma modalidade adequada à sua necessidade\? Entre em contato com nossa equipe para uma avaliação individual\./.test(block?.querySelector('[data-outras-demandas]')?.textContent ?? '') &&
        block?.querySelectorAll('[data-outras-demandas] a, [data-outras-demandas] button').length === 1 &&
        !!block?.querySelector('[data-outras-demandas] a[data-whatsapp="delivery"]'),
      // COM-VITRINE-001 (V-05): "A automação é sua", com a quitação integral e as exceções
      titularidade: (() => {
        const t = block?.querySelector('[data-nota="titularidade"]')?.textContent ?? '';
        return /A automação é sua/.test(t) && /após a quitação integral/.test(t) && /componentes preexistentes da Nekkora/.test(t) && /tecnologias de terceiros continuam com seus titulares/.test(t);
      })(),
      criteria: ['Esforço técnico estimado', 'Quantidade de sistemas', 'Complexidade das integrações', 'Regras de negócio', 'Volume de processamento', 'Exigências de infraestrutura', 'Necessidade de licenciamento'].every((c) => text.includes(c)),
      conditions: /50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal/.test(text) && /cada uma tem escopo, documentação, homologação e aceite próprios/.test(text) && /Preço aprovado por você antes do início/.test(text) && /organizadas em fila/.test(text) && /Licenças e custos externos tratados à parte/.test(text),
      srLabels: [...(block?.querySelectorAll('.price .nk-visually-hidden') ?? [])].map((e) => e.textContent.trim()),
      // Elementos da campanha (src/sections/Pricing.tsx): faixa de lançamento, prévia sem datas, economia e percentual
      launchStrip: block?.querySelector('.launch-strip')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
      previewNotice: !!block?.querySelector('[data-campanha="pendente"]'),
      // NEKKORA-COM-CONTRACT-001 (C-10): regras completas da campanha (recolhíveis: lidas por textContent)
      campaignRules: block?.querySelector('[data-campanha-regras]')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
      economyNodes: block?.querySelectorAll('[data-price="economia"], .price__savings').length ?? 0,
      percentNodes: block?.querySelectorAll('[data-price="percentual"]').length ?? 0,
      // Percentual de desconto escrito nos cartões ("−33,33%"), economia ("Economia de R$") e unidade "preço de lançamento"
      cardsText: [...(block?.querySelectorAll('.offer-card') ?? [])].map((c) => c.innerText).join('\n'),
    };
  });
  results.pricing = pricing;
  const campaignCondition = /Campanha de lançamento para solicitações/;
  // COM-VITRINE-001 (V-02): data de início das novas condições do build (nunca o início da campanha)
  const NOVAS = typeof publicacao.novasCondicoes?.inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(publicacao.novasCondicoes.inicio) ? publicacao.novasCondicoes.inicio.split('-').reverse().join('/') : null;
  const startOk = NOVAS
    ? !pricing.newConditionsPending && (!PROMO || pricing.launchStrip.includes(`valem para solicitações recebidas a partir de ${NOVAS}`))
    : !PROMO || pricing.newConditionsPending;
  check('precos-so-no-bloco-de-precos', pricing.blocks === 1 && hits.filter((h) => h.pricing).length > 0, `${pricing.blocks} bloco(s) data-pricing`);
  // Com promoção: condição da campanha, período aprovado (ou o aviso de prévia sem datas). Sem promoção: nenhuma faixa
  // nem condição de campanha. Em todos os casos: registro na proposta e licenças à parte.
  const conditionsOk = PROMO
    ? pricing.condition &&
      !!pricing.launchStrip &&
      (CAMPAIGN === 'pendente' ? pricing.previewNotice : pricing.launchStrip.includes(PERIOD) && !pricing.previewNotice) &&
      startOk
    : pricing.launchStrip === null && !pricing.previewNotice && !campaignCondition.test(pricing.cardsText) && !/aceita em até 7 dias corridos/.test(pricing.cardsText);
  // C-10: com a campanha em vigor e datas aprovadas, as regras completas estão no bloco de preços; fora dela, não aparecem
  const rulesOk =
    PROMO && CAMPAIGN !== 'pendente'
      ? !!pricing.campaignRules &&
        PERIOD.match(/\d{2}\/\d{2}\/\d{4}/g).every((d) => pricing.campaignRules.includes(d)) &&
        /Vale a data de recebimento da solicitação/.test(pricing.campaignRules) &&
        /mesmo que a proposta seja emitida depois do fim da campanha/.test(pricing.campaignRules) &&
        /aceita em até 7 dias corridos da emissão/.test(pricing.campaignRules) &&
        /Pacote com categorias diferentes só por proposta específica/.test(pricing.campaignRules) &&
        /não se enquadram como simples ou média têm avaliação individual/.test(pricing.campaignRules) &&
        // NEKKORA-COM-CANAIS-001: a data de recebimento vale pelos canais da Nekkora — WhatsApp, e-mail e LinkedIn
        pricing.campaignRules.includes(`mensagem recebida no WhatsApp da Nekkora (${WHATSAPP_DISPLAY})`) &&
        pricing.campaignRules.includes(`e-mail recebido em ${publicacao.canais.email}`) &&
        /mensagem recebida na página da Nekkora no LinkedIn/.test(pricing.campaignRules) &&
        // abrir o WhatsApp pelo site não é recebimento (ajuste da titular, 13/11/2026)
        /Abrir o WhatsApp pelo site não basta: vale a mensagem efetivamente recebida\./.test(pricing.campaignRules) &&
        (NOVAS ? pricing.campaignRules.includes(`recebidas a partir de ${NOVAS}, inclusive`) : /ainda não definida/.test(pricing.campaignRules))
      : pricing.campaignRules === null;
  check('campanha-regras-completas', rulesOk, pricing.campaignRules ? pricing.campaignRules.slice(0, 160) : 'ausentes');
  check(
    'precos-com-condicoes-visiveis',
    conditionsOk && pricing.confirmedInProposal && pricing.licenses,
    `${CAMPAIGN_LABEL}; faixa: ${pricing.launchStrip ?? 'ausente'}; início das novas condições: ${NOVAS ?? 'pendente'}; proposta=${pricing.confirmedInProposal}; licenças=${pricing.licenses}`,
  );
  check('vitrine-sem-categoria-complexa', pricing.semComplexa, `${Object.keys(pricing.table).join(', ')}`);
  check('vitrine-outras-demandas-canais-gerais', pricing.outrasDemandas, 'texto V-04 e link do WhatsApp (contexto delivery)');
  check('vitrine-a-automacao-e-sua', pricing.titularidade, 'nota V-05 com quitação integral e exceções');
  check(
    'precos-tabela-oficial',
    JSON.stringify(pricing.table) === JSON.stringify(OFFICIAL_PRICES),
    `${CAMPAIGN_LABEL}: ${JSON.stringify(pricing.table)}`,
  );
  // Nenhum percentual de desconto nos cartões (V-07; ex.: o "−50%" de um build antigo — COM-RELEASE-005 §3.1)
  const badges = await page.$$eval('[data-pricing] .nk-badge', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /%/.test(t)));
  check(
    'precos-sem-percentual',
    badges.length === 0 && pricing.percentNodes === 0 && !/[−-]\s?\d+(?:,\d+)?\s?%/.test(pricing.cardsText),
    `selos com %: ${badges.join(' | ') || 'nenhum'}; data-price="percentual": ${pricing.percentNodes}`,
  );
  // O artefato servido é o do código em disco (COM-RELEASE-005 §3.3): commit do release.json = HEAD do repositório
  {
    const served = await page.evaluate(async () => {
      const r = await fetch('/release.json', { cache: 'no-store' });
      return r.ok ? r.json() : null;
    });
    let head = null;
    let gitError = null;
    try {
      head = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (e) {
      gitError = String(e.stderr || e.message).trim().split('\n')[0];
    }
    const footer = await page.locator('footer [data-build-commit]').getAttribute('data-build-commit').catch(() => null);
    results.artefato = { servido: served?.commit ?? null, head, rodape: footer, gitError };
    // No CI o Git é obrigatório: sem o HEAD (ex.: "dubious ownership" no contêiner) não há com o que comparar o artefato
    const gitRequired = process.env.CI === 'true';
    check(
      'artefato-corresponde-ao-codigo',
      served?.commit != null && (head == null ? !gitRequired : served.commit === head) && (footer == null || served.commit.startsWith(footer)),
      `release.json=${served?.commit?.slice(0, 7) ?? 'ausente'}; HEAD=${head?.slice(0, 7) ?? `git indisponível${gitRequired ? ' (obrigatório no CI)' : ''}: ${gitError}`}; rodapé=${footer ?? 'sem aviso de homologação'}`,
    );
  }
  // Sem agendamento (NEKKORA-COM-CANAIS-001; antes COM-RELEASE-005 §4.5): o Microsoft Bookings saiu da página pública —
  // nenhum link para qualquer host do Bookings (BOOKINGS_HOSTS), nenhum "Agendar" em botão, link ou texto, nenhum marcador
  // data-agendamento/data-agendar
  {
    const scheduling = await page.evaluate((hosts) => {
      const isBookings = (href) => {
        try {
          return hosts.includes(new URL(href, location.href).hostname);
        } catch {
          return false;
        }
      };
      const links = [...document.querySelectorAll('a[href]')].filter((a) => isBookings(a.getAttribute('href')) || /bookings|\/book\//i.test(a.getAttribute('href')));
      return {
        links: links.map((a) => a.getAttribute('href')),
        controls: [...document.querySelectorAll('a, button, [role="button"]')].filter((e) => /agendar/i.test(`${e.textContent ?? ''} ${e.getAttribute('aria-label') ?? ''}`)).length,
        text: /\bagendar\b|agende/i.test(document.body.textContent ?? ''),
        markers: document.querySelectorAll('[data-agendamento], [data-agendar]').length,
      };
    }, BOOKINGS_HOSTS);
    results.agendamento = scheduling;
    check(
      'sem-agendamento-bookings',
      scheduling.links.length === 0 && scheduling.controls === 0 && !scheduling.text && scheduling.markers === 0,
      `links do Bookings: ${scheduling.links.join(', ') || 'nenhum'}; controles "Agendar": ${scheduling.controls}; texto "Agendar": ${scheduling.text}; marcadores: ${scheduling.markers}`,
    );
  }
  // Coerência matemática do que é exibido: economia = 3 × individual − pacote; sem preço de lançamento nem tabela anterior
  const num = (s) => Number(String(s).replace(/[^\d,]/g, '').replace(',', '.'));
  const coherent =
    ['simples', 'media'].every((t) => {
      const v = pricing.table[t] ?? {};
      return num(v.individual) * 3 - num(v.pacote) === num(v.economia) && num(v.pacote) < num(v.individual) * 3;
    }) &&
    !/preço de lançamento|Preço especial de lançamento|Preço padrão/i.test(pricing.cardsText) &&
    PREVIOUS_LABELS.every((l) => !pricing.cardsText.includes(l));
  check('precos-pacote-coerente', coherent, `${CAMPAIGN_LABEL}: economia = 3 × individual − pacote; sem a tabela anterior nos cartões`);
  check('precos-criterios-de-categoria', pricing.criteria);
  check('condicoes-comerciais-visiveis', pricing.conditions);
  // COM-VITRINE-001 (etapa 4, V-06): catálogo dos quatro serviços com o estado de cada um; Monitor e AI em preparação,
  // sem contratação (nenhum botão, checkout, assinatura ou formulário próprio) e sem valor fora do bloco de preços
  const catalog = await page.evaluate(() => {
    const sec = document.querySelector('#solucoes');
    const cards = [...(sec?.querySelectorAll('.offer-card') ?? [])].map((c) => ({
      name: c.querySelector('h3')?.textContent.trim(),
      stage: c.querySelector('.nk-badge')?.textContent.replace(/\s+/g, ' ').trim(),
      links: [...c.querySelectorAll('a')].map((a) => a.getAttribute('href')),
      text: c.innerText,
    }));
    const planned = document.querySelector('[data-pricing] [data-servicos-previstos]');
    return {
      cards,
      solutionsText: sec?.innerText ?? '',
      plannedInPricing: !!planned,
      plannedPrices: Object.fromEntries([...(planned?.querySelectorAll('[data-preco-previsto]') ?? [])].map((e) => [e.dataset.precoPrevisto, `${e.textContent.trim()} ${e.nextElementSibling?.textContent.trim() ?? ''}`.trim()])),
      plannedText: planned?.innerText ?? '',
      // NEKKORA-COM-CANAIS-001: a única ação permitida é pedir informações pelo WhatsApp (um link por serviço, contexto
      // monitor/ai); nenhum botão, formulário, campo ou outro link
      plannedActions: planned ? [...planned.querySelectorAll('a, button, form, input, select, textarea')].filter((e) => !(e.matches('a[data-whatsapp="monitor"], a[data-whatsapp="ai"]'))).length : -1,
      plannedAsks: [...(planned?.querySelectorAll('a[data-whatsapp]') ?? [])].map((a) => `${a.getAttribute('data-whatsapp')}:${a.querySelector('.nk-link__label')?.firstChild?.textContent.trim() ?? a.textContent.trim()}`),
    };
  });
  results.catalog = catalog;
  const EXPECTED_CATALOG = [
    ['Nekkora Delivery', 'Contratação assistida'],
    ['Nekkora Monitor', 'Em preparação'],
    ['Nekkora AI', 'Em preparação'],
    ['Nekkora Hosting', 'Sob avaliação e orçamento'],
  ];
  check(
    'catalogo-quatro-servicos',
    JSON.stringify(catalog.cards.map((c) => [c.name, c.stage])) === JSON.stringify(EXPECTED_CATALOG),
    catalog.cards.map((c) => `${c.name}: ${c.stage}`).join(' · '),
  );
  const preparing = catalog.cards.filter((c) => c.stage === 'Em preparação');
  check(
    'catalogo-monitor-ai-sem-contratacao',
    preparing.length === 2 &&
      preparing.every((c) => c.links.length === 1 && c.links[0] === '#servicos-em-preparacao' && /Ainda não disponível para contratação/.test(c.text)) &&
      !/contrat(e|ar) agora|assin(e|ar|atura ativa)|checkout|comprar|teste grátis|lista de espera/i.test(catalog.solutionsText + catalog.plannedText) &&
      catalog.plannedActions === 0,
    preparing.map((c) => `${c.name} → ${c.links.join(',')}`).join(' · '),
  );
  // Pedido de informação (não contratação) pelo WhatsApp, só para os dois serviços em preparação
  check(
    'catalogo-monitor-ai-so-pedido-de-informacao',
    JSON.stringify(catalog.plannedAsks) === JSON.stringify(['monitor:Quero receber informações sobre o Nekkora Monitor', 'ai:Quero receber informações sobre o Nekkora AI']) &&
      !catalog.plannedAsks.some((a) => /contrat|assin|compr/i.test(a)),
    catalog.plannedAsks.join(' · ') || 'nenhum pedido de informação',
  );
  check(
    'catalogo-valores-previstos-no-bloco-de-precos',
    catalog.plannedInPricing &&
      JSON.stringify(catalog.plannedPrices) === JSON.stringify({ monitor: 'R$ 75 por automação/mês, previsto', ai: 'R$ 100 por empresa/mês, previsto' }) &&
      /Valores e condições definitivos dependem da disponibilização comercial\./.test(catalog.plannedText) &&
      !/R\$/.test(catalog.solutionsText),
    JSON.stringify(catalog.plannedPrices),
  );
  // Autorização da etapa 4 (item 2): "Ver valores previstos" leva à área "Serviços em preparação" — pelo teclado
  // (foco no link + Enter), conferindo o endereço e a área visível na tela. Numa aba própria do mesmo contexto, para não
  // mudar o foco nem o ponto de partida da navegação por Tab da página principal (primeiro-tab-pular-conteudo).
  {
    const tab = await page.context().newPage();
    for (const name of ['Nekkora Monitor', 'Nekkora AI']) {
      await tab.goto(new URL('/', page.url()).href, { waitUntil: 'networkidle' });
      const link = tab.locator('#solucoes .offer-card', { has: tab.getByRole('heading', { name, exact: true }) }).getByRole('link', { name: 'Ver valores previstos' });
      await link.focus();
      const focused = await link.evaluate((a) => document.activeElement === a);
      await tab.keyboard.press('Enter');
      // espera o estado efetivo (endereço e área na tela), até 2 s; sem ele, a verificação falha
      await tab
        .waitForFunction(() => {
          const r = document.querySelector('#servicos-em-preparacao')?.getBoundingClientRect();
          return location.hash === '#servicos-em-preparacao' && !!r && r.top < innerHeight && r.bottom > 0;
        }, null, { timeout: 2000 })
        .catch(() => {});
      const landed = await tab.evaluate(() => {
        const el = document.querySelector('#servicos-em-preparacao');
        const r = el?.getBoundingClientRect();
        return { hash: location.hash, visible: !!r && r.top < innerHeight && r.bottom > 0, title: el?.querySelector('h3')?.textContent };
      });
      check(
        `catalogo-link-valores-previstos:${name === 'Nekkora AI' ? 'ai' : 'monitor'}`,
        focused && landed.hash === '#servicos-em-preparacao' && landed.visible && landed.title === 'Serviços em preparação',
        `foco=${focused} ${JSON.stringify(landed)}`,
      );
    }
    await tab.close();
  }
  // Delivery: tecnologias citadas sem promessa de compatibilidade universal
  const delivery = await page.locator('#solucoes').innerText();
  check(
    'delivery-tecnologias-com-ressalva',
    ['Python', 'UiPath', 'Power Automate', 'Integrações via API'].every((t) => delivery.includes(t)) && /viabilidade com cada sistema é confirmada na avaliação/.test(delivery),
  );
  // Privacidade: seção própria e link no rodapé. NEKKORA-COM-CANAIS-001: sem formulário nem envio automático (sem dizer
  // que a página "não coleta dados": o acesso envolve dados técnicos e registros de acesso — ajuste da titular), a
  // conversa pelo WhatsApp descrita, e os direitos pelo WhatsApp ou pelo e-mail (só texto: nenhum mailto)
  const privacy = await page.locator('#privacidade').innerText();
  check(
    'privacidade-visivel',
    /Conversa pelo WhatsApp/.test(privacy) &&
      /não tem formulário, cadastro nem envio automático de solicitações comerciais/.test(privacy) &&
      /o acesso envolve dados técnicos de navegação/.test(privacy) &&
      !/não coleta/i.test(privacy) &&
      privacy.includes(`pelo WhatsApp ${WHATSAPP_DISPLAY} ou pelo e-mail ${publicacao.canais.email}`) &&
      /Sem cookies nem rastreamento/.test(privacy) &&
      (await page.locator('#privacidade a[href^="mailto:"]').count()) === 0 &&
      (await page.locator('footer a[href="#privacidade"]').count()) === 1,
    privacy.split('\n').slice(0, 2).join(' · '),
  );
  // NEKKORA-COM-LEGAL-BASE-001: sem gravação comercial nesta fase — o aviso não pode dizer que a conversa é gravada
  check(
    'privacidade-sem-gravacao',
    !/pode ser gravada|Gravações de conversas/.test(privacy) && (!/Microsoft Teams/.test(privacy) || /não grava as conversas comerciais/.test(privacy)),
    /não grava/.test(privacy) ? 'aviso: sem gravação nesta fase' : 'sem agendamento: nenhum item de reunião',
  );
  // Decreto 7.962/2013, art. 2º, I e II: nome empresarial, CNPJ e endereço comercial no rodapé (PUB-22)
  const supplier = await page.locator('footer [data-supplier]').innerText().catch(() => '');
  check('rodape-identificacao-do-fornecedor', /CNPJ \d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(supplier), supplier || 'sem identificação no rodapé');
  // O endereço é de escritório virtual: o rodapé identifica o fornecedor, sem convite a atendimento presencial
  check(
    'rodape-sem-atendimento-presencial',
    !/presencial|visite|venha|atendimento no local|horário de atendimento/i.test(supplier),
    supplier || 'sem identificação no rodapé',
  );
  check(
    'precos-sem-rotulos-de-valor-riscado',
    // Sem valor riscado: nenhum "Preço padrão:/Preço especial de lançamento:/Desconto de" para o leitor de tela
    pricing.srLabels.length === 0,
    pricing.srLabels.join(' | ') || 'nenhum rótulo de valor riscado',
  );

  // Produtos internos não aparecem como obrigatórios/disponíveis: cada menção fica em bloco marcado
  const products = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (/\b(Studio|Platform|Agent)\b/.test(n.textContent ?? '')) {
        // NEKKORA-COM-CANAIS-001: o aviso de privacidade cita a Nekkora Platform como DESTINO do botão "Entrar" (aplicação
        // separada, regras próprias) — única menção aceita fora do bloco marcado, e só nessa frase
        const linkDestination = !!n.parentElement?.closest('#privacidade') && /O botão "Entrar" leva à Nekkora Platform, uma aplicação separada/.test(n.textContent ?? '');
        out.push({ text: n.textContent.trim().slice(0, 160), marked: !!n.parentElement?.closest('[data-internal-products]') || linkDestination, linkDestination });
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

  // Sem formulário, diálogo nem envio (NEKKORA-COM-CANAIS-001, titular, 12/11/2026 — substitui as verificações do diálogo
  // "Solicitar avaliação" e do formulário): nenhum campo de dado pessoal. Os únicos campos são as quantidades do simulador.
  {
    const absent = await page.evaluate(
      (instr) => ({
        forms: document.querySelectorAll('form').length,
        fields: [...document.querySelectorAll('input, textarea, select')].filter((e) => !e.matches('[data-sim-input]')).map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('type') ?? ''}]`),
        dialogs: document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog').length,
        triggers: document.querySelectorAll('[aria-haspopup="dialog"], [aria-haspopup="true"]').length,
        remnants: document.querySelectorAll('.contact__done, [data-testid="mensagem-solicitacao"], [data-testid="status-desafio"], [data-dica-servico], .cf-turnstile, iframe').length,
        requestButtons: [...document.querySelectorAll('button')].filter((b) => /Solicitar avaliação|Revisar mensagem|Enviar solicitação/i.test(b.textContent ?? '')).length,
        emailInstruction: (document.body.textContent ?? '').replace(/\s+/g, ' ').match(new RegExp(instr.source, instr.flags))?.[0] ?? null,
      }),
      { source: EMAIL_INSTRUCTION.source, flags: EMAIL_INSTRUCTION.flags },
    );
    results.semFormulario = absent;
    check(
      'sem-formulario-nem-dialogo-de-solicitacao',
      absent.forms === 0 && absent.fields.length === 0 && absent.dialogs === 0 && absent.triggers === 0 && absent.remnants === 0 && absent.requestButtons === 0,
      JSON.stringify(absent),
    );
    check('sem-instrucao-de-envio-por-email', absent.emailInstruction === null, absent.emailInstruction ?? 'nenhuma instrução para enviar a solicitação por e-mail');
  }
  // Os CTAs abrem o WhatsApp em outra aba e nada mais: nenhum diálogo, foco e endereço da página intactos, nenhuma
  // requisição da página. O wa.me é respondido por uma página local de teste (newPage) — nada sai da máquina.
  {
    const pageRequests = [];
    const onRequest = (r) => pageRequests.push(`${r.method()} ${r.url()}`);
    page.on('request', onRequest);
    const urlBefore = page.url();
    const opened = [];
    for (const [sel, how] of [
      ['#inicio a[data-whatsapp]', 'teclado'],
      ['#precos [data-outras-demandas] a[data-whatsapp]', 'clique'],
      ['#hosting a[data-whatsapp]', 'clique'],
      ['#contato a[data-whatsapp]', 'clique'],
    ]) {
      const cta = page.locator(sel).first();
      await cta.scrollIntoViewIfNeeded();
      const popupPromise = page.waitForEvent('popup', { timeout: 8000 }).catch(() => null);
      if (how === 'teclado') {
        await cta.focus();
        await page.keyboard.press('Enter');
      } else {
        await cta.click();
      }
      const popup = await popupPromise;
      if (popup) await popup.waitForLoadState('load').catch(() => {});
      const state = await cta.evaluate((a) => ({
        dialogs: document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]').length,
        hash: location.hash,
        focusOnCta: document.activeElement === a,
      }));
      opened.push({ sel, how, popup: popup ? popup.url() : null, ...state });
      if (popup) await popup.close();
    }
    page.off('request', onRequest);
    results.ctasClicados = opened;
    const wa = `https://wa.me/${publicacao.canais.whatsapp}?text=`;
    check(
      'ctas-abrem-whatsapp-sem-dialogo',
      opened.every((o) => o.popup?.startsWith(wa) && o.dialogs === 0 && o.hash === '') && opened[0].focusOnCta && page.url() === urlBefore,
      opened.map((o) => `${o.sel.split(' ')[0]} (${o.how}): aba=${o.popup ? 'wa.me' : 'NENHUMA'} diálogos=${o.dialogs}`).join(' · ') + `; foco no CTA do topo=${opened[0].focusOnCta}`,
    );
    check('ctas-sem-envio-pela-pagina', pageRequests.length === 0, pageRequests.join(' | ') || 'nenhuma requisição da página ao clicar nos CTAs');
  }
  // O endereço #contato (âncora) também não abre diálogo: o contato é uma seção comum
  {
    // carregamento novo (não só troca de âncora no mesmo documento)
    await page.goto('about:blank');
    await page.goto(new URL('#contato', baseUrl).href, { waitUntil: 'networkidle' });
    const dialog = await page.waitForSelector('[role="dialog"], dialog[open]', { state: 'attached', timeout: 1500 }).then(() => true, () => false);
    check('contato-por-ancora-sem-dialogo', !dialog && (await page.locator('#contato a[data-whatsapp="geral"]').count()) === 1, dialog ? 'um diálogo abriu' : 'seção de contato com o botão do WhatsApp, sem diálogo');
  }

  // Texto renderizado (para revisão do conteúdo)
  writeFileSync(path.join(outDir, 'texto-renderizado.txt'), await page.locator('body').innerText());
  await context.close();
});

/**
 * Caixas do cabeçalho (NEKKORA-COM-CANAIS-001): "Entrar" (data-entrar) e os vizinhos — marca, links, seletor de tema e
 * botão do menu. Só elementos visíveis; o "Entrar" existe duas vezes no DOM (barra no desktop, menu no celular).
 */
const headerLayout = (page) =>
  page.evaluate(() => {
    const vis = (e) => {
      if (!e) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]');
    };
    const box = (e) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, r: Math.round(r.right * 10) / 10, b: Math.round(r.bottom * 10) / 10 };
    };
    const nav = document.querySelector('.nk-navbar');
    const entrar = [...document.querySelectorAll('[data-entrar]')];
    return {
      vw: document.documentElement.clientWidth,
      total: entrar.length,
      entrar: entrar
        .filter(vis)
        .map((a) => ({ ...box(a), href: a.getAttribute('href'), target: a.getAttribute('target'), inBar: !!a.closest('.nk-navbar__inner'), inMenu: !!a.closest('.nk-navbar__mobile'), text: a.textContent.trim(), tabIndex: a.tabIndex })),
      toggle: box([...(nav?.querySelectorAll('.nk-navbar__tools button') ?? [])].find(vis)),
      menu: box([...(nav?.querySelectorAll('.nk-navbar__toggle') ?? [])].find(vis)),
      brand: box([...(nav?.querySelectorAll('.nk-navbar__brand') ?? [])].find(vis)),
      links: [...(nav?.querySelectorAll('.nk-navbar__inner .nk-navbar__link') ?? [])].filter(vis).map(box),
      menuLinks: [...(nav?.querySelectorAll('.nk-navbar__mobile .nk-navbar__link') ?? [])].filter(vis).map(box),
    };
  });
const overlaps = (a, b) => !!a && !!b && a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;
/** Nenhum par da lista se sobrepõe e todos cabem na largura da janela. */
const layoutClear = (items, vw) => {
  const list = items.filter(([, b]) => b);
  const clash = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (overlaps(list[i][1], list[j][1])) clash.push(`${list[i][0]}×${list[j][0]}`);
  const outside = list.filter(([, b]) => b.x < -0.5 || b.r > vw + 0.5).map(([n]) => n);
  return { ok: clash.length === 0 && outside.length === 0, clash, outside };
};
/** WebKit não leva o foco a links com Tab (veja primeiro-tab-pular-conteudo): lá, foco programático + tabIndex ≥ 0. */
async function tabUntil(page, selector, max) {
  if (ENGINE === 'webkit') {
    await page.locator(selector).first().focus();
    return page.evaluate((s) => !!document.activeElement?.matches(s) && document.activeElement.tabIndex >= 0, selector);
  }
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate((s) => !!document.activeElement?.matches(s), selector)) return true;
  }
  return false;
}

// 4. Cabeçalho: "Entrar" (NEKKORA-COM-CANAIS-001, titular, 12/11/2026 — substitui entrar-oculto-sem-area-de-clientes)
// leva à Nekkora Platform na mesma aba; no desktop fica depois do seletor de tema, no celular dentro do menu. O link nunca
// é seguido (nada sai da máquina: newPage aborta e registra qualquer requisição externa).
await block('entrar', async () => {
  const sameTab = (t) => t == null || t === '_self';
  const centerY = (b) => (b.y + b.b) / 2;
  for (const vp of [
    { name: 'desktop-1024', width: 1024, height: 768 },
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ]) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, null);
    const h = await headerLayout(page);
    const e = h.entrar[0];
    check(`entrar-desktop-unico-visivel:${vp.name}`, h.entrar.length === 1 && e.inBar && e.text === 'Entrar', `${h.entrar.length} visível(is) de ${h.total} no DOM`);
    check(`entrar-desktop-destino:${vp.name}`, !!e && e.href === PLATFORM_LOGIN_URL && sameTab(e.target), e ? `href=${e.href} target=${e.target ?? '(nenhum)'}` : 'ausente');
    check(
      `entrar-desktop-depois-do-tema:${vp.name}`,
      !!e && !!h.toggle && e.x >= h.toggle.r && Math.abs(centerY(e) - centerY(h.toggle)) <= 8 && !overlaps(e, h.toggle),
      e && h.toggle ? `tema ${h.toggle.x}–${h.toggle.r}px, Entrar ${e.x}–${e.r}px (folga ${(e.x - h.toggle.r).toFixed(1)}px)` : 'tema ou Entrar ausente',
    );
    const lay = layoutClear([['marca', h.brand], ...h.links.map((l, i) => [`link${i + 1}`, l]), ['tema', h.toggle], ['entrar', e]], h.vw);
    check(`cabecalho-desktop-sem-sobreposicao:${vp.name}`, !!h.brand && lay.ok, `sobreposições: ${lay.clash.join(', ') || 'nenhuma'}; fora da tela: ${lay.outside.join(', ') || 'nenhum'}`);
    if (vp.name === 'desktop-1280') {
      // Teclado: do seletor de tema, o próximo Tab chega ao "Entrar"
      await page.locator('.nk-navbar__tools button').first().focus();
      const reached = await tabUntil(page, '.nk-navbar__actions [data-entrar]', 1);
      check('entrar-desktop-focavel-por-teclado', reached, ENGINE === 'webkit' ? 'WebKit: foco programático, tabIndex ≥ 0' : 'um Tab a partir do seletor de tema');
      const file = 'cabecalho-desktop-entrar.png';
      await page.locator('.nk-navbar').screenshot({ path: path.join(outDir, file) });
      results.screenshots.push(file);
    }
    await context.close();
  }
  for (const vp of [
    { name: 'celular-320', width: 320, height: 640 },
    { name: 'celular-390', width: 390, height: 844 },
    { name: 'tablet-768', width: 768, height: 1024 },
  ]) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, null);
    const closed = await headerLayout(page);
    check(`entrar-celular-fora-da-barra:${vp.name}`, closed.entrar.length === 0 && closed.total >= 1, `${closed.entrar.length} visível(is) com o menu fechado`);
    const bar = layoutClear([['marca', closed.brand], ['tema', closed.toggle], ['menu', closed.menu]], closed.vw);
    check(
      `cabecalho-celular-sem-sobreposicao:${vp.name}`,
      !!closed.brand && !!closed.toggle && !!closed.menu && bar.ok,
      `sobreposições: ${bar.clash.join(', ') || 'nenhuma'}; fora da tela: ${bar.outside.join(', ') || 'nenhum'}`,
    );
    await page.locator('.nk-navbar__toggle').focus();
    await page.keyboard.press('Enter');
    const openedOk = await page
      .waitForFunction(() => document.querySelector('.nk-navbar__mobile') && !document.querySelector('.nk-navbar__mobile').hidden, null, { timeout: 2000 })
      .then(() => true, () => false);
    const open = await headerLayout(page);
    const e = open.entrar[0];
    check(
      `entrar-celular-no-menu:${vp.name}`,
      openedOk && open.entrar.length === 1 && e.inMenu && e.text === 'Entrar' && e.href === PLATFORM_LOGIN_URL && sameTab(e.target),
      e ? `menu aberto=${openedOk}; href=${e.href} target=${e.target ?? '(nenhum)'}` : `menu aberto=${openedOk}; Entrar não visível`,
    );
    const inMenu = layoutClear([['marca', open.brand], ['tema', open.toggle], ['menu', open.menu], ...open.menuLinks.map((l, i) => [`link${i + 1}`, l]), ['entrar', e]], open.vw);
    check(`menu-celular-sem-sobreposicao:${vp.name}`, !!e && inMenu.ok, `sobreposições: ${inMenu.clash.join(', ') || 'nenhuma'}; fora da tela: ${inMenu.outside.join(', ') || 'nenhum'}`);
    // Teclado: do botão do menu, Tab percorre os links e chega ao "Entrar"
    const reached = await tabUntil(page, '.nk-navbar__mobile [data-entrar]', open.menuLinks.length + 2);
    check(`entrar-celular-focavel-por-teclado:${vp.name}`, reached, ENGINE === 'webkit' ? 'WebKit: foco programático, tabIndex ≥ 0' : 'Tab a partir do botão do menu');
    if (vp.name === 'celular-390') {
      const file = 'menu-celular-entrar.png';
      await page.screenshot({ path: path.join(outDir, file) });
      results.screenshots.push(file);
    }
    await context.close();
  }
});

// 5. Menu mobile por teclado
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

// 6. Hosting em faixa pôster: aviso de disponibilidade e condição de contratação visíveis em todas as larguras
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

// 7. Menu do celular aberto (com o "Entrar"): axe e rolagem horizontal nos dois temas — substitui o axe do diálogo de
// solicitação, que não existe mais (NEKKORA-COM-CANAIS-001)
await block('menu-acessibilidade', async () => {
  for (const theme of THEMES) {
    const { context, page } = await newPage({ width: 390, height: 844 }, theme);
    await page.locator('.nk-navbar__toggle').click();
    await page.waitForFunction(() => document.querySelector('.nk-navbar__mobile') && !document.querySelector('.nk-navbar__mobile').hidden, null, { timeout: 2000 });
    await page.evaluate(axeSource); // evaluate (protocolo do navegador), não <script>: a CSP da página bloqueia script inline
    const r = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const res = await axe.run(document.querySelector('.nk-navbar'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return res.violations.map((v) => `${v.id}(${v.nodes.length})`);
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`menu-celular-axe:${theme}`, r.length === 0 && overflow <= 0, r.join(', ') || `sem violações; excesso horizontal=${overflow}px`);
    const file = `menu-celular-${theme}.png`;
    await page.screenshot({ path: path.join(outDir, file) });
    results.screenshots.push(file);
    await context.close();
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
  `Campanha (${release.publicacao}, ${PERIOD ?? 'sem datas'}): ${CAMPAIGN_LABEL}`,
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
