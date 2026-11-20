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
 * NEKKORA-COM-ECOSYSTEM-001 (titular, 20/11/2026): o Nekkora Delivery saiu da página — sem categorias simples/média,
 * pacotes, economia nem campanha de lançamento. Três produtos independentes (Nekkora AI em piloto, Nekkora Monitor e
 * Nekkora Hosting), com a tabela de src/precos.ts conferida contra a tabela digitada aqui. A campanha de lançamento
 * continua em publicacao.json só como histórico: a página não depende mais da data — cada execução (NEKKORA_DATA) carrega
 * a página também em datas de referência (bordas da antiga campanha) e exige o mesmo conteúdo, sem faixa de campanha.
 *
 * Atendimento: o WhatsApp continua o único canal público (NEKKORA-COM-CANAIS-001); todo CTA comercial abre o formulário
 * de atendimento (diálogo da nekkora-lib), que só prepara a mensagem no navegador e abre o WhatsApp. Aqui: CTAs, serviços
 * pré-marcados, foco, acessibilidade do diálogo e ausência de envio. A jornada completa (validação, mensagem codificada,
 * aba do WhatsApp, botão flutuante, armazenamento) está em scripts/homologacao-canais.mjs; o simulador, em
 * scripts/homologacao-simulador.mjs.
 *
 * Saída: capturas (JPEG/PNG), resultados.json e resumo.md na pasta indicada. Código de saída 1 se alguma verificação
 * falhar. Nenhuma requisição sai do localhost: tudo que tentar sair é bloqueado e registrado (uma aba do wa.me seria
 * respondida por uma página local de teste).
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PRICE_TABLE, brl } from '../src/precos.ts';
import { campaignState, todayInBrazil } from './comercial/tabelas-anteriores.mjs';
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
  // COM-RELEASE-003-R1 §3.3: nenhum desconto único de 50% — nem no bloco de preços
  { id: 'desconto-50', re: /50\s?%\s*de\s+desconto|desconto\s+(?:universal\s+)?de\s+50|promo[cç][aã]o\s+de\s+50|metade\s+do\s+pre[cç]o|pela\s+metade|[−-]\s?50\s?%|todas\s+as\s+automa[cç][oõ]es/gi },
];

/**
 * Tabela da NEKKORA-COM-ECOSYSTEM-001 §2, digitada aqui de propósito — independente do código — e conferida contra
 * src/precos.ts (a fonte da página) antes de qualquer navegador abrir: se o código mudar, a homologação falha em vez de
 * aceitar o novo valor. data-price → valor exibido; e a linha completa (prefixo, valor e unidade) de cada um.
 */
const OFFICIAL_PRICES = { ai: 'R$ 100', monitor: 'R$ 75', windows: 'R$ 25', linux: 'R$ 12' };
const OFFICIAL_LINES = {
  ai: 'A partir de R$ 100 por automação',
  monitor: 'R$ 75 por automação, por mês',
  windows: 'Windows R$ 25 por hora-máquina',
  linux: 'Linux R$ 12 por hora-máquina',
};
{
  const fromSource = { ai: brl(PRICE_TABLE.ai.porAutomacao), monitor: brl(PRICE_TABLE.monitor.porAutomacaoMes), windows: brl(PRICE_TABLE.hosting.windowsPorHora), linux: brl(PRICE_TABLE.hosting.linuxPorHora) };
  if (JSON.stringify(fromSource) !== JSON.stringify(OFFICIAL_PRICES)) throw new Error(`src/precos.ts diverge da tabela oficial: ${JSON.stringify(fromSource)}`);
}
/**
 * Valores que NUNCA podem aparecer na página (nem em atributos): a tabela do Nekkora Delivery da COM-VITRINE-001
 * (individual, pacote de 3 e economia) e a da campanha de lançamento (padrão e lançamento). Ficam só no histórico
 * (scripts/comercial/tabelas-anteriores.mjs).
 */
const PREVIOUS_LABELS = ['R$ 650', 'R$ 1.500', 'R$ 1.400', 'R$ 3.500', 'R$ 450', 'R$ 700', 'R$ 1.000', 'R$ 2.800'];
/** Restos do modelo anterior (Delivery, categorias, pacotes, campanha e as condições do Delivery). */
const PREVIOUS_MODEL =
  /Nekkora Delivery|automaç(?:ão|ões) (?:simples|médias?)\b|categoria (?:simples|média|complexa)|pacote de (?:3|três)|Economia (?:de|com pacotes)|campanha de lançamento|preço de lançamento|A automação é sua|organizadas em fila|50% após a aprovação|Esforço técnico estimado|sob orçamento/i;
/** Rótulo do estado de cada produto (publicacao.json → servicos), digitado de propósito; sem o dado, o padrão conservador. */
const STATE_LABELS = { piloto: 'Piloto', 'sob-avaliacao': 'Disponibilidade sob avaliação', 'em-preparacao': 'Em preparação', disponivel: 'Disponível' };
const DEFAULT_STATES = { ai: 'piloto', monitor: 'sob-avaliacao', hosting: 'sob-avaliacao' };
/** Origens dos CTAs comerciais que abrem o formulário, na ordem do documento (o do simulador só aparece com estimativa). */
const EXPECTED_ORIGINS = ['inicio:topo', 'solucoes:ai', 'solucoes:monitor', 'solucoes:hosting', 'hosting:hosting-faixa', 'contato:contato', 'flutuante:flutuante'];
/** Serviços já marcados no formulário conforme o CTA de origem. */
const PRESELECTED = { topo: [], ai: ['ai'], monitor: ['monitor'], hosting: ['hosting'], 'hosting-faixa': ['hosting'], contato: [], flutuante: [] };
/** WhatsApp oficial (NEKKORA-COM-ECOSYSTEM-001 §5), digitado de propósito; o número anterior não pode aparecer. */
const OFFICIAL_WHATSAPP = '5511930597466';
const PREVIOUS_WHATSAPP = ['5511917724200', '91772-4200', '917724200'];

/**
 * NEKKORA-COM-CANAIS-001 (titular, 12/11/2026): destino do "Entrar" (Nekkora Platform, mesma aba) — digitado aqui de
 * propósito, igual a PLATFORM_LOGIN_URL de src/config.ts — e frases que mandariam o visitante enviar a solicitação por
 * e-mail (a jornada por e-mail saiu da página; o e-mail fica só como identificação do fornecedor e canal dos direitos).
 */
const PLATFORM_LOGIN_URL = 'https://platform.nekkora.com/entrar';
if (!readFileSync('src/config.ts', 'utf8').includes(`PLATFORM_LOGIN_URL = '${PLATFORM_LOGIN_URL}'`)) throw new Error('src/config.ts: PLATFORM_LOGIN_URL diverge da homologação');
const EMAIL_INSTRUCTION = /(?:envie|mande|escreva|solicite|peça|abra)[^.]{0,60}\b(?:por|pelo|no) e-mail|aplicativo de e-mail|Escrever diretamente por e-mail|Abrir no e-mail/i;

// Publicação do artefato servido: o release.json diz com qual publicacao.json o build foi feito.
const release = await fetch(new URL('release.json', baseUrl), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
if (!release?.publicacao) throw new Error(`release.json ausente ou sem "publicacao" em ${baseUrl}`);
const publicacao = JSON.parse(readFileSync(release.publicacao, 'utf8'));
const DATA = process.env.NEKKORA_DATA || null;
if (DATA != null && !/^\d{4}-\d{2}-\d{2}$/.test(DATA)) throw new Error(`NEKKORA_DATA inválida: ${DATA}`);
const NOW = DATA ? new Date(`${DATA}T12:00:00-03:00`) : new Date();
/** Situação HISTÓRICA da campanha de lançamento nesta data — só registrada: a página não pode depender dela. */
const CAMPAIGN = campaignState(publicacao.campanhaLancamento ?? { inicio: null, fim: null }, todayInBrazil(NOW));
/**
 * Datas de referência comparadas com NOW: bordas da antiga campanha no fuso de Brasília (véspera às 23h30, primeiro dia às
 * 00h30, último dia às 23h30 e dia seguinte às 00h30) e um dia depois da nova vigência sintética.
 */
const REFERENCE_DATES = ['2026-11-05T23:30:00-03:00', '2026-11-06T00:30:00-03:00', '2027-01-06T23:30:00-03:00', '2027-01-07T00:30:00-03:00', '2026-11-26T12:00:00-03:00'].map((d) => new Date(d));
const toBr = (iso) => iso.split('-').reverse().join('/');
/** Número do WhatsApp por extenso, como a página o escreve (+55 (11) 93059-7466) — aviso de privacidade. */
const WHATSAPP_DISPLAY = (() => {
  const m = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(publicacao.canais.whatsapp ?? '');
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : null;
})();
const ECOSYSTEM_START = typeof publicacao.ecossistema?.inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(publicacao.ecossistema.inicio) ? toBr(publicacao.ecossistema.inicio) : null;
const STATES = { ...DEFAULT_STATES, ...(publicacao.servicos ?? {}) };
const DATE_LABEL = `data ${todayInBrazil(NOW)} (campanha de lançamento histórica: ${CAMPAIGN}; a página não depende da data)`;
console.log(`Publicação (${release.publicacao}): ${DATE_LABEL}; vigência ${ECOSYSTEM_START ?? 'pendente'}`);

/** Valores do bloco de preços como aparecem na tela (data-price) e qualquer valor riscado. */
const readRenderedPrices = (page) =>
  page.evaluate(() => {
    const block = document.querySelector('[data-pricing]');
    const lines = [...(block?.querySelectorAll('.price__line') ?? [])];
    return {
      cards: [...(block?.querySelectorAll('[data-price-servico]') ?? [])].map((c) => c.getAttribute('data-price-servico')),
      count: block?.querySelectorAll('[data-price]').length ?? 0,
      values: Object.fromEntries([...(block?.querySelectorAll('[data-price]') ?? [])].map((v) => [v.getAttribute('data-price'), v.textContent.trim()])),
      lines: Object.fromEntries(lines.map((l) => [l.querySelector('[data-price]')?.getAttribute('data-price'), [...l.children].map((c) => c.textContent.trim()).join(' ')])),
      anyStruck: [...(block?.querySelectorAll('[data-price-servico] *') ?? [])]
        .filter((e) => e.matches('s, del, strike') || getComputedStyle(e).textDecorationLine.includes('line-through'))
        .map((e) => e.textContent.trim()),
    };
  });
const expectRendered = (shown) =>
  JSON.stringify(shown.cards) === '["ai","monitor","hosting"]' &&
  shown.count === 4 &&
  JSON.stringify(shown.values) === JSON.stringify(OFFICIAL_PRICES) &&
  JSON.stringify(shown.lines) === JSON.stringify(OFFICIAL_LINES);

const results = { baseUrl, navegador: ENGINE, data: { dia: todayInBrazil(NOW), campanhaHistorica: CAMPAIGN, publicacao: release.publicacao, vigencia: ECOSYSTEM_START }, startedAt: new Date().toISOString(), checks: [], screenshots: [], axe: {}, console: [], blocked: [], whatsappAbas: [], fonts: new Set() };
const check = (id, ok, detail) => {
  results.checks.push({ id, ok: !!ok, detail });
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${id}${detail ? ` — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`);
};

const browser = await playwright[ENGINE].launch();
results.versaoNavegador = browser.version();
const local = new URL(baseUrl).origin;

async function newPage(viewport, theme, { at = NOW, url = baseUrl } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  // Mesmo dia para a página e para a expectativa acima (Date fixo; os timers continuam correndo)
  await context.clock.setFixedTime(at);
  await context.addInitScript(
    ([key, t]) => {
      // Conta as chamadas a window.open (só o envio do formulário pode chamá-lo — nunca um CTA)
      window.__nkOpen = [];
      const original = window.open;
      window.open = (...a) => {
        window.__nkOpen.push(a);
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
  // Nada sai do localhost: requisições externas são abortadas e registradas.
  await context.route('**/*', (route) => {
    const u = route.request().url();
    // Fonte Inter: vem da nekkora-lib 0.2.0 (dist/fonts) e é servida pelo próprio site — registrada à parte.
    if (u.startsWith(local) && /\.woff2(\?|$)/.test(u)) results.fonts.add(new URL(u).pathname.replace(/-[\w-]{8}\.woff2$/, '.woff2'));
    if (u.startsWith(local) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    // Aba do WhatsApp: respondida por uma página LOCAL de teste, registrada à parte — o wa.me real nunca é acessado
    if (u.startsWith('https://wa.me/')) {
      results.whatsappAbas.push(u);
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>wa.me (página de teste local)</title><h1>wa.me — página de teste local</h1>' });
    }
    // Qualquer outra origem (inclusive Google Fonts, que a lib usava antes da 0.2.0) é bloqueada e reprova a homologação.
    results.blocked.push(u);
    return route.abort();
  });
  const page = await context.newPage();
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && results.console.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => results.console.push(`pageerror: ${e.message}`));
  await page.goto(url, { waitUntil: 'networkidle' });
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
    // Preços efetivamente renderizados em cada tema e largura (COM-RELEASE-005 §3.5): os quatro valores e as linhas
    // completas (prefixo, valor e unidade) lidos da tela e comparados com a tabela oficial; nenhum valor riscado.
    const shown = await readRenderedPrices(page);
    check(`precos-renderizados:${theme}:${vp.name}`, expectRendered(shown), `${JSON.stringify(shown.lines)}`);
    check(`precos-sem-valor-riscado:${theme}:${vp.name}`, shown.anyStruck.length === 0, `riscados: ${JSON.stringify(shown.anyStruck)}`);
    // Conferência visual dos preços (COM-RELEASE-003 §11.2, COM-RELEASE-005 §3.5): os três cartões, em cada tema, no
    // celular, no tablet e no desktop
    if (vp.name !== 'wide') {
      const cards = `precos-${theme}-${vp.name}.png`;
      // a barra fixa do topo cobriria o primeiro cartão no recorte: escondida só nesta captura
      await page.locator('#precos .price-cards').screenshot({ path: path.join(outDir, cards), style: 'header, nav, .nk-fab { visibility: hidden !important; }' });
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

/** axe-core (WCAG 2.1 A/AA) num elemento ou no documento. */
const runAxe = (page, selector = null) =>
  page.evaluate(async (sel) => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(sel ? document.querySelector(sel) : document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return {
      violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })),
      passes: r.passes.length,
      incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      // Nós em que o axe não decide o contraste (fundo com gradiente/pseudo-elemento): medidos por pixels.
      contrastTargets: (r.incomplete.find((v) => v.id === 'color-contrast')?.nodes ?? []).map((n) => n.target[0]),
    };
  }, selector);

// 2. Acessibilidade (axe-core, WCAG 2.1 A/AA) por tema, em desktop e mobile
for (const theme of THEMES) {
  for (const vp of [WIDTHS[0], WIDTHS[2]]) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, theme);
    await page.evaluate(axeSource); // evaluate (protocolo do navegador), não <script>: a CSP da página bloqueia script inline
    const axe = await runAxe(page);
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

/** Estado do formulário de atendimento aberto (diálogo da nekkora-lib, renderizado em portal no <body>). */
const readDialog = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('[data-atendimento]');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    return {
      role: d.getAttribute('role'),
      modal: d.getAttribute('aria-modal'),
      title: document.getElementById(d.getAttribute('aria-labelledby') ?? '')?.textContent.trim() ?? null,
      visible: r.width > 0 && r.height > 0,
      focusInside: d.contains(document.activeElement),
      services: [...d.querySelectorAll('[data-servico-interesse]')].filter((c) => c.checked).map((c) => c.getAttribute('data-servico-interesse')),
      simulation: d.querySelectorAll('[data-incluir-simulacao]').length,
      forms: d.querySelectorAll('form').length,
    };
  });
/** Abre o formulário pelo CTA (clique ou Enter) e espera o diálogo. */
async function openForm(page, cta, how = 'clique') {
  await cta.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  if (how === 'teclado') {
    await cta.focus();
    await page.keyboard.press('Enter');
  } else {
    await cta.click();
  }
  return page.waitForSelector('[data-atendimento]', { state: 'visible', timeout: 3000 }).then(() => true, () => false);
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
  // NEKKORA-COM-ECOSYSTEM-001 §7: todo CTA comercial abre o formulário de atendimento — âncora #contato (destino de
  // reserva) com aria-haspopup="dialog", sem nova aba. Nenhum link direto ao wa.me na página: o WhatsApp só abre a partir
  // do formulário preenchido.
  {
    const ctas = await page.$$eval('[data-atendimento-origem]', (els) =>
      els.map((a) => ({ origem: a.getAttribute('data-atendimento-origem'), tag: a.tagName.toLowerCase(), href: a.getAttribute('href'), haspopup: a.getAttribute('aria-haspopup'), target: a.getAttribute('target'), where: a.closest('section[id]')?.id ?? (a.classList.contains('nk-fab') ? 'flutuante' : '?') })),
    );
    const direct = await page.$$eval('a[href*="wa.me"], a[href*="whatsapp.com"], [data-whatsapp]', (els) => els.map((a) => a.getAttribute('href') ?? a.getAttribute('data-whatsapp')));
    results.atendimentoCtas = ctas;
    const where = ctas.map((c) => `${c.where}:${c.origem}`);
    check(
      'atendimento-ctas-abrem-formulario',
      contactsConfigured === 'configurado' &&
        JSON.stringify(where) === JSON.stringify(EXPECTED_ORIGINS) &&
        ctas.every((c) => c.tag === 'a' && c.href === '#contato' && c.haspopup === 'dialog' && c.target == null),
      `${where.join(', ')} → #contato + aria-haspopup="dialog"`,
    );
    check('sem-link-direto-ao-whatsapp', direct.length === 0, direct.join(' | ') || 'nenhum link wa.me na página (só o formulário abre o WhatsApp)');
  }
  // WhatsApp oficial (NEKKORA-COM-ECOSYSTEM-001 §5): o número anterior não aparece em lugar nenhum (texto, links e atributos)
  {
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const old = PREVIOUS_WHATSAPP.filter((n) => html.includes(n));
    const prod = release.publicacao === 'publicacao.json';
    check(
      'whatsapp-numero-oficial',
      old.length === 0 && (!prod || publicacao.canais.whatsapp === OFFICIAL_WHATSAPP),
      `${prod ? `publicação real: ${publicacao.canais.whatsapp}` : `publicação sintética: ${publicacao.canais.whatsapp}`}; número anterior na página: ${old.join(', ') || 'nenhum'}`,
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

  // Bloco de preços (NEKKORA-COM-ECOSYSTEM-001 §2, §4 e §11)
  const pricing = await page.evaluate(() => {
    const block = document.querySelector('[data-pricing]');
    const v = block?.querySelector('[data-vigencia]');
    return {
      blocks: document.querySelectorAll('[data-pricing]').length,
      vigencias: document.querySelectorAll('[data-vigencia]').length,
      vigencia: v?.getAttribute('data-vigencia') ?? null,
      vigenciaText: v?.textContent.replace(/\s+/g, ' ').trim() ?? '',
      conditions: [...(block?.querySelectorAll('[data-conditions] li') ?? [])].map((li) => li.textContent.replace(/\s+/g, ' ').trim()),
      notes: Object.fromEntries([...(block?.querySelectorAll('[data-price-servico]') ?? [])].map((c) => [c.getAttribute('data-price-servico'), `${c.querySelector('.price-overline')?.textContent.trim()} | ${c.querySelector('.offer-card__fit')?.textContent.trim()}`])),
      simulatorInside: !!block?.querySelector('[data-simulator]'),
      srLabels: [...(block?.querySelectorAll('.price .nk-visually-hidden') ?? [])].map((e) => e.textContent.trim()),
      percentNodes: block?.querySelectorAll('[data-price="percentual"], [data-price="economia"], .price__savings').length ?? 0,
      cardsText: [...(block?.querySelectorAll('[data-price-servico]') ?? [])].map((c) => c.innerText).join('\n'),
      // Todos os valores em reais da página, com texto oculto (regras recolhidas, rótulos para leitor de tela)
      allPrices: [...new Set((document.body.textContent ?? '').match(/R\$\s?[\d.,]+/g) ?? [])].map((s) => s.replace(/\s+/g, ' ').replace(/[.,]$/, '')),
    };
  });
  results.pricing = pricing;
  check('precos-so-no-bloco-de-precos', pricing.blocks === 1 && pricing.simulatorInside && hits.filter((h) => h.pricing).length > 0, `${pricing.blocks} bloco(s) data-pricing; simulador dentro=${pricing.simulatorInside}`);
  {
    const shown = await readRenderedPrices(page);
    check('precos-tabela-oficial', expectRendered(shown), `${JSON.stringify(shown.values)} · ${Object.values(shown.lines).join(' · ')}`);
  }
  // Nenhum outro valor na página: só os quatro da tabela (os do simulador aparecem só depois de uma quantidade)
  {
    const allowed = Object.values(OFFICIAL_PRICES);
    const html = await page.evaluate(() => document.body.outerHTML);
    const previous = PREVIOUS_LABELS.filter((l) => new RegExp(`${l.replace(/[$.]/g, '\\$&')}(?![\\d.])`).test(html));
    const others = pricing.allPrices.filter((p) => !allowed.includes(p));
    check('sem-precos-anteriores', previous.length === 0 && others.length === 0, `valores na página: ${pricing.allPrices.join(', ')}; tabela anterior/lançamento: ${previous.join(', ') || 'nenhum'}; fora da tabela: ${others.join(', ') || 'nenhum'}`);
  }
  // Vigência (§11): gravada pela titular em publicacao.json (ecossistema.inicio); sem ela, a prévia diz que não foi definida
  check(
    'precos-vigencia',
    pricing.vigencias === 1 &&
      (ECOSYSTEM_START
        ? pricing.vigencia === 'definida' && pricing.vigenciaText.includes(`Valores para solicitações recebidas a partir de ${ECOSYSTEM_START}.`)
        : pricing.vigencia === 'pendente' && /a data de vigência destes valores ainda não foi definida/.test(pricing.vigenciaText)) &&
      pricing.vigenciaText.includes('Solicitações e propostas anteriores mantêm as condições em que foram feitas.'),
    `data-vigencia=${pricing.vigencia} (esperado ${ECOSYSTEM_START ? `definida, ${ECOSYSTEM_START}` : 'pendente'}): ${pricing.vigenciaText}`,
  );
  // Notas de cada cartão: natureza da cobrança separada (inicial, mensal, por hora)
  check(
    'precos-natureza-de-cada-cobranca',
    /^Nekkora AI · Piloto \| .*Sem mensalidade obrigatória/.test(pricing.notes.ai ?? '') &&
      /^Nekkora Monitor \| Cobrança mensal por automação monitorada/.test(pricing.notes.monitor ?? '') &&
      // titular, 20/11/2026: sem franquia mínima; o critério de cobrança do Hosting é formalizado depois
      /^Nekkora Hosting \| Sem franquia mínima\. Critério de cobrança por hora, licenciamento Windows e disponibilidade são formalizados antes da contratação/.test(pricing.notes.hosting ?? ''),
    Object.values(pricing.notes).join(' · '),
  );
  // Condições do novo modelo (§11): serviços independentes, proposta, sem pacote nem desconto, compromissos anteriores
  {
    const required = [
      'Cada serviço é contratado de forma independente',
      'definidos em proposta, aprovada por você antes do início',
      'Nekkora AI em fase piloto',
      'Nekkora Monitor: cobrança mensal por automação monitorada',
      'Nekkora Hosting: cobrança por hora-máquina',
      'Licenças e serviços de terceiros não estão incluídos',
      'Sem pacotes nem descontos por combinação de serviços',
      'Solicitações recebidas e propostas emitidas antes desta tabela mantêm as condições em que foram feitas',
    ];
    const text = pricing.conditions.join('\n');
    const missing = required.filter((r) => !text.includes(r));
    check('condicoes-comerciais-do-ecossistema', missing.length === 0, missing.length ? `faltando: ${missing.join(' | ')}` : `${pricing.conditions.length} condições`);
  }
  // Nenhum percentual de desconto, economia ou valor riscado nos cartões (V-07)
  const badges = await page.$$eval('[data-pricing] .nk-badge', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /%/.test(t)));
  check(
    'precos-sem-percentual',
    badges.length === 0 && pricing.percentNodes === 0 && !/[−-]\s?\d+(?:,\d+)?\s?%/.test(pricing.cardsText),
    `selos com %: ${badges.join(' | ') || 'nenhum'}; nós de percentual/economia: ${pricing.percentNodes}`,
  );
  check('precos-sem-rotulos-de-valor-riscado', pricing.srLabels.length === 0, pricing.srLabels.join(' | ') || 'nenhum rótulo de valor riscado');
  // O modelo anterior saiu da página (Delivery, categorias, pacotes, economia, campanha, condições do Delivery): lido do
  // textContent (inclui o que estiver recolhido ou oculto)
  {
    const text = await page.evaluate(() => (document.body.textContent ?? '').replace(/\s+/g, ' '));
    const m = text.match(PREVIOUS_MODEL);
    const markers = await page.evaluate(() => document.querySelectorAll('.launch-strip, [data-campanha], [data-campanha-regras], [data-novas-condicoes], [data-price-tier], [data-sim-tier], [data-servicos-previstos], [data-outras-demandas], [data-nota="titularidade"]').length);
    check('sem-delivery-nem-campanha', !m && markers === 0, m ? `"${m[0]}" na página` : `nenhum resto do modelo anterior; marcadores antigos: ${markers}`);
  }

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
  // Catálogo (§2, §3 e §10): três produtos independentes, cada um com o estado real gravado em publicacao.json, um único
  // CTA (o formulário, com o serviço já marcado), sem valor fora do bloco de preços e sem contratação automática
  {
    const catalog = await page.evaluate(() => {
      const sec = document.querySelector('#solucoes');
      return {
        cards: [...(sec?.querySelectorAll('[data-servico]') ?? [])].map((c) => ({
          id: c.getAttribute('data-servico'),
          name: c.querySelector('h3')?.textContent.trim(),
          stage: c.querySelector('[data-estado]')?.textContent.replace(/\s+/g, ' ').trim(),
          actions: [...c.querySelectorAll('a, button, form, input, select, textarea')].map((a) => a.getAttribute('data-atendimento-origem') ?? a.tagName.toLowerCase()),
          text: c.innerText,
        })),
        text: sec?.innerText ?? '',
      };
    });
    results.catalog = catalog;
    const expectedCatalog = [
      ['ai', 'Nekkora AI', STATE_LABELS[STATES.ai]],
      ['monitor', 'Nekkora Monitor', STATE_LABELS[STATES.monitor]],
      ['hosting', 'Nekkora Hosting', STATE_LABELS[STATES.hosting]],
    ];
    check(
      'catalogo-tres-servicos-com-estado',
      JSON.stringify(catalog.cards.map((c) => [c.id, c.name, c.stage])) === JSON.stringify(expectedCatalog),
      `${catalog.cards.map((c) => `${c.name}: ${c.stage}`).join(' · ')} (publicação: ${JSON.stringify(STATES)})`,
    );
    check(
      'catalogo-um-cta-por-servico-sem-contratacao',
      catalog.cards.length === 3 &&
        catalog.cards.every((c) => JSON.stringify(c.actions) === JSON.stringify([c.id])) &&
        !/contrat(e|ar) agora|assin(e|ar|atura ativa)|checkout|comprar|teste grátis|lista de espera/i.test(catalog.text) &&
        /Nenhum serviço exige os outros e não há pacote obrigatório nem desconto por combinação\./.test(catalog.text),
      catalog.cards.map((c) => `${c.id} → ${c.actions.join(',')}`).join(' · '),
    );
    check('catalogo-sem-valores', !/R\$/.test(catalog.text), 'nenhum valor em #solucoes (só no bloco de preços)');
    const ai = catalog.cards.find((c) => c.id === 'ai')?.text ?? '';
    check(
      'catalogo-ai-piloto-sem-promessas',
      /Sem mensalidade obrigatória/.test(ai) && /Sem promessa de conclusão instantânea nem de compatibilidade com qualquer processo/.test(ai) && !/garantid|100%|qualquer sistema/i.test(ai),
      ai.split('\n').slice(0, 3).join(' · '),
    );
  }
  // Privacidade (NEKKORA-COM-ECOSYSTEM-001 §11): o formulário só prepara a mensagem no navegador (sem dizer que a página
  // "não coleta dados": o acesso envolve dados técnicos e registros de acesso — ajuste da titular), a conversa pelo
  // WhatsApp descrita, e os direitos pelo WhatsApp ou pelo e-mail (só texto: nenhum mailto)
  const privacy = await page.locator('#privacidade').innerText();
  check(
    'privacidade-visivel',
    /Formulário só no seu navegador/.test(privacy) &&
      /processados no seu navegador: a página não os envia à Nekkora/.test(privacy) &&
      /O simulador de investimento também funciona só no seu navegador/.test(privacy) &&
      /Conversa pelo WhatsApp/.test(privacy) &&
      /ela só chega à Nekkora se você tocar em enviar/.test(privacy) &&
      /o acesso envolve dados técnicos de navegação/.test(privacy) &&
      !/não coleta/i.test(privacy) &&
      privacy.includes(`pelo WhatsApp ${WHATSAPP_DISPLAY} ou pelo e-mail ${publicacao.canais.email}`) &&
      /Sem cookies nem rastreamento/.test(privacy) &&
      (await page.locator('#privacidade a[href^="mailto:"]').count()) === 0 &&
      (await page.locator('footer a[href="#privacidade"]').count()) === 1,
    `${privacy.split('\n').slice(0, 2).join(' · ')}; direitos: WhatsApp ${WHATSAPP_DISPLAY} e ${publicacao.canais.email}`,
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
  check('rodape-sem-atendimento-presencial', !/presencial|visite|venha|atendimento no local|horário de atendimento/i.test(supplier), supplier || 'sem identificação no rodapé');

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

  // Fora do diálogo, nenhum formulário (NEKKORA-COM-ECOSYSTEM-001 §7): o único formulário é o de atendimento, que só existe
  // com o diálogo aberto; os únicos campos da página são as quantidades do simulador. Sem Turnstile, iframe nem os restos
  // da antiga jornada de solicitação.
  {
    const absent = await page.evaluate(
      (instr) => ({
        forms: document.querySelectorAll('form').length,
        fields: [...document.querySelectorAll('input, textarea, select')].filter((e) => !e.matches('[data-sim-input]')).map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('type') ?? ''}]`),
        dialogs: document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog').length,
        strayTriggers: [...document.querySelectorAll('[aria-haspopup]')].filter((e) => !e.matches('[data-atendimento-origem][aria-haspopup="dialog"]')).map((e) => e.textContent.trim().slice(0, 40)),
        remnants: document.querySelectorAll('.contact__done, [data-testid="mensagem-solicitacao"], [data-testid="status-desafio"], [data-dica-servico], .cf-turnstile, iframe').length,
        requestButtons: [...document.querySelectorAll('button')].filter((b) => /Solicitar avaliação|Revisar mensagem|Enviar solicitação/i.test(b.textContent ?? '')).length,
        emailInstruction: (document.body.textContent ?? '').replace(/\s+/g, ' ').match(new RegExp(instr.source, instr.flags))?.[0] ?? null,
      }),
      { source: EMAIL_INSTRUCTION.source, flags: EMAIL_INSTRUCTION.flags },
    );
    results.semFormularioNaCarga = absent;
    check(
      'sem-formulario-fora-do-dialogo',
      absent.forms === 0 && absent.fields.length === 0 && absent.dialogs === 0 && absent.strayTriggers.length === 0 && absent.remnants === 0 && absent.requestButtons === 0,
      JSON.stringify(absent),
    );
    check('sem-instrucao-de-envio-por-email', absent.emailInstruction === null, absent.emailInstruction ?? 'nenhuma instrução para enviar a solicitação por e-mail');
  }
  // Cada CTA abre o formulário (o do topo pelo teclado): diálogo modal rotulado, foco dentro, serviços pré-marcados conforme
  // a origem, sem a opção da simulação; Esc fecha e devolve o foco ao CTA. Endereço intacto, nenhuma requisição, nenhuma
  // chamada a window.open (o WhatsApp só abre com o formulário enviado).
  {
    const pageRequests = [];
    const onRequest = (r) => pageRequests.push(`${r.method()} ${r.url()}`);
    page.on('request', onRequest);
    const urlBefore = page.url();
    const opened = [];
    for (const [origem, how] of [
      ['topo', 'teclado'],
      ['ai', 'clique'],
      ['monitor', 'clique'],
      ['hosting', 'clique'],
      ['hosting-faixa', 'clique'],
      ['contato', 'clique'],
      ['flutuante', 'teclado'],
    ]) {
      const cta = page.locator(`[data-atendimento-origem="${origem}"]`);
      const ok = await openForm(page, cta, how);
      const d = ok ? await readDialog(page) : null;
      await page.keyboard.press('Escape');
      const closed = await page.waitForSelector('[data-atendimento]', { state: 'detached', timeout: 3000 }).then(() => true, () => false);
      const back = await cta.evaluate((a) => ({ focus: document.activeElement === a, hash: location.hash }));
      opened.push({ origem, how, ok, ...d, closed, ...back });
    }
    page.off('request', onRequest);
    const openCalls = await page.evaluate(() => window.__nkOpen.length);
    results.ctasClicados = opened;
    check(
      'ctas-abrem-o-formulario',
      opened.every((o) => o.ok && o.role === 'dialog' && o.modal === 'true' && o.title === 'Fale com um analista' && o.visible && o.forms === 1 && o.focusInside && o.simulation === 0),
      opened.map((o) => `${o.origem} (${o.how}): ${o.ok ? `diálogo "${o.title}", foco dentro=${o.focusInside}` : 'NÃO ABRIU'}`).join(' · '),
    );
    check(
      'ctas-servicos-pre-marcados',
      opened.every((o) => JSON.stringify(o.services) === JSON.stringify(PRESELECTED[o.origem])),
      opened.map((o) => `${o.origem}=[${(o.services ?? []).join(',')}]`).join(' · '),
    );
    check('ctas-esc-fecha-e-devolve-o-foco', opened.every((o) => o.closed && o.focus && o.hash === ''), opened.map((o) => `${o.origem}: fechou=${o.closed} foco=${o.focus} hash=${o.hash || '(vazio)'}`).join(' · '));
    check('ctas-sem-envio-pela-pagina', pageRequests.length === 0 && openCalls === 0 && page.url() === urlBefore, `${pageRequests.join(' | ') || 'nenhuma requisição'}; window.open=${openCalls}; endereço=${page.url() === urlBefore ? 'intacto' : page.url()}`);
  }
  // O endereço #contato (âncora) não abre o diálogo sozinho: o contato é uma seção comum com o CTA do formulário
  {
    // carregamento novo (não só troca de âncora no mesmo documento)
    await page.goto('about:blank');
    await page.goto(new URL('#contato', baseUrl).href, { waitUntil: 'networkidle' });
    const dialog = await page.waitForSelector('[role="dialog"], dialog[open]', { state: 'attached', timeout: 1500 }).then(() => true, () => false);
    check('contato-por-ancora-sem-dialogo', !dialog && (await page.locator('#contato [data-atendimento-origem="contato"]').count()) === 1, dialog ? 'um diálogo abriu' : 'seção de contato com o CTA do formulário, sem diálogo');
  }

  // Texto renderizado (para revisão do conteúdo)
  writeFileSync(path.join(outDir, 'texto-renderizado.txt'), await page.locator('body').innerText());
  await context.close();
});

// 4. Independência da data (NEKKORA-COM-ECOSYSTEM-001): a campanha de lançamento ficou só no histórico. O conteúdo de
// <main> e os preços são os mesmos em NOW e nas bordas da antiga campanha (o rodapé fica de fora: o ano do © muda).
await block('independente-da-data', async () => {
  const snap = async (at) => {
    const { context, page } = await newPage({ width: 1280, height: 800 }, null, { at });
    const s = await page.evaluate(() => ({
      text: document.querySelector('main')?.innerText.replace(/\s+/g, ' ').trim() ?? '',
      prices: [...document.querySelectorAll('[data-price]')].map((e) => `${e.getAttribute('data-price')}=${e.textContent.trim()}`).join(','),
      campaign: document.querySelectorAll('.launch-strip, [data-campanha], [data-campanha-regras], [data-novas-condicoes]').length,
    }));
    await context.close();
    return s;
  };
  const base = await snap(NOW);
  const diffs = [];
  for (const at of REFERENCE_DATES) {
    const s = await snap(at);
    if (s.text !== base.text || s.prices !== base.prices || s.campaign !== 0) diffs.push(todayInBrazil(at) + (s.campaign ? ` (${s.campaign} marcador(es) de campanha)` : ''));
  }
  check('pagina-independente-da-data', base.campaign === 0 && diffs.length === 0 && base.text.length > 0, diffs.length ? `conteúdo diferente em: ${diffs.join(', ')}` : `${todayInBrazil(NOW)} = ${REFERENCE_DATES.map((d) => todayInBrazil(d)).join(' = ')} (${base.text.length} caracteres; ${base.prices})`);
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

// 5. Cabeçalho: "Entrar" (NEKKORA-COM-CANAIS-001, titular, 12/11/2026 — substitui entrar-oculto-sem-area-de-clientes)
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

// 6. Menu mobile por teclado
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

// 7. Hosting em faixa pôster: condições a confirmar antes da contratação, visíveis em todas as larguras
await block('hosting-faixa', async () => {
  for (const vp of [WIDTHS[0], WIDTHS[2]]) {
    const { context, page } = await newPage({ width: vp.width, height: vp.height }, null);
    if (vp.name === 'mobile') results.mobilePageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const band = page.locator('#hosting');
    const text = await band.innerText();
    const notice = await band.locator('.hosting-band__notice').isVisible();
    check(
      `hosting-condicoes-visiveis:${vp.name}`,
      notice &&
        /Condições a confirmar antes da contratação\./.test(text) &&
        /O Hosting pode ser contratado sozinho, sem o AI ou o Monitor\./.test(text) &&
        /Uma solicitação não representa contratação nem reserva de capacidade\./.test(text) &&
        !/R\$/.test(text),
      `aviso visível=${notice}${vp.name === 'mobile' ? `; altura da página=${results.mobilePageHeight}px` : ''}`,
    );
    await band.screenshot({ path: path.join(outDir, `hosting-faixa-${vp.name}.png`) });
    results.screenshots.push(`hosting-faixa-${vp.name}.png`);
    await context.close();
  }
});

// 8. Menu do celular aberto (com o "Entrar"): axe e rolagem horizontal nos dois temas
await block('menu-acessibilidade', async () => {
  for (const theme of THEMES) {
    const { context, page } = await newPage({ width: 390, height: 844 }, theme);
    await page.locator('.nk-navbar__toggle').click();
    await page.waitForFunction(() => document.querySelector('.nk-navbar__mobile') && !document.querySelector('.nk-navbar__mobile').hidden, null, { timeout: 2000 });
    await page.evaluate(axeSource); // evaluate (protocolo do navegador), não <script>: a CSP da página bloqueia script inline
    const r = await runAxe(page, '.nk-navbar');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`menu-celular-axe:${theme}`, r.violations.length === 0 && overflow <= 0, r.violations.map((v) => `${v.id}(${v.nodes})`).join(', ') || `sem violações; excesso horizontal=${overflow}px`);
    const file = `menu-celular-${theme}.png`;
    await page.screenshot({ path: path.join(outDir, file) });
    results.screenshots.push(file);
    await context.close();
  }
});

// 9. Formulário de atendimento aberto (NEKKORA-COM-ECOSYSTEM-001 §7): axe no documento com o diálogo aberto — vazio e com
// os erros de validação —, contraste por pixels do que o axe não decide, diálogo dentro da tela, sem rolagem horizontal
await block('dialogo-acessibilidade', async () => {
  for (const theme of THEMES) {
    for (const vp of [
      { name: 'celular', width: 390, height: 844 },
      { name: 'desktop', width: 1280, height: 800 },
    ]) {
      const tag = `${theme}:${vp.name}`;
      const { context, page } = await newPage({ width: vp.width, height: vp.height }, theme);
      const opened = await openForm(page, page.locator('[data-atendimento-origem="topo"]'));
      await page.evaluate(axeSource);
      const states = [];
      for (const state of ['vazio', 'com-erros']) {
        if (state === 'com-erros') {
          await page.locator('[data-atendimento] button[type="submit"]').click();
          await page.waitForSelector('[data-atendimento] [aria-invalid="true"]', { timeout: 2000 }).catch(() => {});
        }
        const axe = await runAxe(page);
        // só o que está no diálogo: o resto da página fica inerte, atrás do fundo escurecido
        const inDialog = await page.evaluate((targets) => targets.filter((t) => !!document.querySelector(t)?.closest('[data-atendimento]')), axe.contrastTargets);
        const measured = await measureContrastByPixels(page, inDialog);
        results.axe[`dialogo:${tag}:${state}:contraste-fora-do-dialogo`] = axe.contrastTargets.filter((t) => !inDialog.includes(t));
        const geometry = await page.evaluate(() => {
          const d = document.querySelector('[data-atendimento]');
          const r = d?.getBoundingClientRect();
          return { inside: !!r && r.left >= -0.5 && r.right <= document.documentElement.clientWidth + 0.5 && r.width > 0, overflow: document.documentElement.scrollWidth - innerWidth, errors: d?.querySelectorAll('[aria-invalid="true"]').length ?? 0 };
        });
        states.push({ state, axe, measured, geometry });
        results.axe[`dialogo:${tag}:${state}`] = { violations: axe.violations, incomplete: axe.incomplete };
      }
      const [empty, errors] = states;
      const viol = states.flatMap((s) => s.axe.violations.map((v) => `${s.state}:${v.id}(${v.nodes}) ${v.sample[0] ?? ''}`));
      const otherIncomplete = states.flatMap((s) => s.axe.incomplete.filter((i) => i.id !== 'color-contrast').map((i) => `${s.state}:${i.id}(${i.nodes})`));
      const low = states.flatMap((s) => s.measured.filter((m) => m.p10 < m.required).map((m) => `${s.state}:${m.target} ${m.p10}<${m.required}`));
      check(`dialogo-axe:${tag}`, opened && viol.length === 0 && otherIncomplete.length === 0, viol.concat(otherIncomplete).join(' | ') || `diálogo aberto=${opened}; sem violações (vazio e com ${errors.geometry.errors} erro(s) de validação)`);
      check(`dialogo-contraste-por-pixels:${tag}`, low.length === 0, low.join(' | ') || `${states.reduce((n, s) => n + s.measured.length, 0)} nó(s) medidos`);
      check(
        `dialogo-dentro-da-tela:${tag}`,
        states.every((s) => s.geometry.inside && s.geometry.overflow <= 0) && errors.geometry.errors === 2,
        states.map((s) => `${s.state}: dentro=${s.geometry.inside}, excesso=${s.geometry.overflow}px, erros=${s.geometry.errors}`).join(' · '),
      );
      if (empty) {
        const file = `dialogo-${theme}-${vp.name}.png`;
        await page.screenshot({ path: path.join(outDir, file) });
        results.screenshots.push(file);
      }
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
  `Publicação (${release.publicacao}): ${DATE_LABEL}; vigência ${ECOSYSTEM_START ?? 'pendente'}`,
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
