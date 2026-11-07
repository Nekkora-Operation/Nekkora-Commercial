#!/usr/bin/env node
/**
 * Conferência SOMENTE LEITURA do texto público do Microsoft Bookings contra o aviso do site e a minuta
 * (OPS-02 / CTL-03, NEKKORA-COM-GOLIVE-001). Abre a página pública sem login e seleciona um horário só para exibir o
 * formulário. NUNCA preenche campos e NUNCA clica em "Reservar": nenhuma reserva é criada.
 *
 *   node scripts/conferir-bookings.mjs [--url <página do Bookings>] [--saida <pasta>]
 *     sem --url: usa agendamento.url do publicacao.json
 *     --saida: grava texto.md e captura.png (sem dados pessoais) na pasta
 *
 * Código de saída 0 se todas as verificações passarem e 1 se alguma falhar. Rede externa: só a página do Bookings.
 * Não entra no `npm test` porque depende da internet e de uma configuração que só a titular altera.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const publicacao = JSON.parse(readFileSync(new URL('../publicacao.json', import.meta.url), 'utf8'));
const url = opt('--url') ?? publicacao.agendamento?.url;
const saida = opt('--saida');
if (!url) throw new Error('URL do Bookings ausente (agendamento.url ou --url)');

/**
 * Regras derivadas de docs/comercial/privacidade-minuta.md §4 e do aviso do site ("Conversa sem gravação"). Elas
 * conferem o sentido do texto, não a redação exata: a titular pode ajustar a forma sem quebrar a verificação.
 */
export const REGRAS = [
  { id: 'B01', titulo: 'Não diz que a reunião pode ser gravada', passa: (t) => !/(poder[áa]|pode) ser gravad|houver grava/i.test(t) },
  { id: 'B02', titulo: 'Diz que não há gravação nesta fase', passa: (t) => /n[ãa]o grava/i.test(t) },
  { id: 'B03', titulo: 'Cita o Microsoft Teams', passa: (t) => /Teams/.test(t) },
  { id: 'B04', titulo: 'Informa a base legal (LGPD, art. 7º, V)', passa: (t) => /art\.?\s*7[º°o]?,?\s*(inciso\s*)?V\b/i.test(t) },
  { id: 'B05', titulo: 'Informa o possível processamento fora do Brasil', passa: (t) => /fora do Brasil/i.test(t) },
  { id: 'B06', titulo: 'Informa a retenção das reservas (90 dias)', passa: (t) => /90 dias/.test(t) },
  { id: 'B07', titulo: 'Alerta para não informar senhas', passa: (t) => /senhas?/i.test(t) },
  { id: 'B08', titulo: 'Indica o canal contato@nekkora.com', passa: (t) => /contato@nekkora\.com/.test(t) },
  { id: 'B09', titulo: 'Remete ao aviso de privacidade do site', passa: (t) => /nekkora\.com\/#privacidade/.test(t) },
  { id: 'B10', titulo: 'Não pede telefone', passa: (t) => !/telefone|celular/i.test(t) },
  { id: 'B11', titulo: 'Usa ciência, não consentimento', passa: (t) => !/(voc[êe]|ao marcar[^.]*) concorda/i.test(t) },
  // B12: a caixa existe e é de ciência ("Li e entendi"), como na minuta §4. A B11 só confere a ausência de "concorda".
  { id: 'B12', titulo: 'Tem a caixa de ciência ("Li e entendi")', passa: (t) => /Li e entendi/i.test(t) },
];

export function avaliar(texto) {
  return REGRAS.map((r) => ({ id: r.id, titulo: r.titulo, ok: r.passa(texto) }));
}

async function capturar() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ locale: 'pt-BR', viewport: { width: 1280, height: 1800 } });
    // Sem interceptar requisições: o Bookings usa POST também para consultar horários. A garantia de que nenhuma reserva
    // é criada é não preencher nome e e-mail (obrigatórios) e nunca clicar em "Reservar".
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    const descricao = [];
    const lerMais = page.getByText('Ler mais').first();
    if (await lerMais.count()) {
      await lerMais.click();
      await page.waitForTimeout(1500);
      descricao.push(...(await page.locator('[role=dialog]').allInnerTexts()));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }
    // Primeiro horário disponível, só para exibir o formulário
    const horario = page.getByText(/^\d{1,2}:\d{2}$/).first();
    if (await horario.count()) {
      await horario.click({ force: true });
      await page.waitForTimeout(3000);
    }
    const corpo = (await page.innerText('body'))
      .split('\n')
      .filter((l) => !l.startsWith('(UTC'))
      .join('\n');
    const inicio = corpo.indexOf('ADICIONAR SEUS DETALHES');
    const fim = inicio >= 0 ? corpo.indexOf('Políticas de Privacidade', inicio) : -1;
    const formulario = inicio >= 0 ? corpo.slice(inicio, fim > 0 ? fim : undefined) : '';
    const png = saida ? await page.screenshot({ fullPage: true }) : null;
    return { descricao: descricao.join('\n').trim(), formulario: formulario.trim(), png };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const { descricao, formulario, png } = await capturar();
  if (!formulario) {
    console.error('Formulário do Bookings não encontrado: a página mudou ou não carregou. Nada foi avaliado.');
    process.exit(1);
  }
  const texto = `${descricao}\n${formulario}`;
  const resultado = avaliar(texto);
  const quando = new Date().toISOString();
  const linhas = resultado.map((r) => `${r.ok ? 'OK  ' : 'FALHA'} ${r.id} — ${r.titulo}`);
  console.log(`Bookings: ${url}\nConferido em ${quando} (sem reserva)\n\n${linhas.join('\n')}`);
  const falhas = resultado.filter((r) => !r.ok).length;
  console.log(`\n${resultado.length} verificações, ${falhas} falha(s).`);
  if (saida) {
    mkdirSync(saida, { recursive: true });
    writeFileSync(
      path.join(saida, 'texto.md'),
      `# Bookings — texto público\n\nConferido em ${quando}, só leitura, sem reserva. URL: ${url}\n\n## Descrição do serviço\n\n${descricao.replace(/^/gm, '> ')}\n\n## Formulário\n\n${formulario.replace(/^/gm, '> ')}\n\n## Resultado\n\n${linhas.map((l) => `- ${l}`).join('\n')}\n`,
    );
    writeFileSync(path.join(saida, 'captura.png'), png);
  }
  process.exit(falhas ? 1 : 0);
}
