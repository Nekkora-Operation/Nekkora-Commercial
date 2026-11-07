#!/usr/bin/env node
/**
 * Datas definitivas da campanha de lançamento (PUB-13; procedimento em
 * docs/release/NEKKORA-COM-GOLIVE-001-campanha-datas.md).
 *
 *   node scripts/campanha-datas.mjs --publicacao AAAA-MM-DD                      # só mostra o plano (padrão)
 *   node scripts/campanha-datas.mjs --publicacao AAAA-MM-DD --autorizacao "Titular, DD/MM/AAAA: …" --aplicar
 *
 * Regra aprovada: dois meses a partir da publicação oficial. inicio = D; fim = o mesmo dia, dois meses depois,
 * inclusivo (se o dia não existir no mês, o último dia do mês). Fuso de Brasília.
 *
 * Proteções:
 * - sem --aplicar, nada é gravado;
 * - --aplicar exige --autorizacao (texto que vai para $origem.campanhaLancamento);
 * - recusa D anterior a hoje em Brasília, porque isso encurtaria a vigência efetiva;
 * - só troca as datas da campanha nos trechos listados em REGRAS. Se a quantidade de ocorrências em qualquer arquivo
 *   diferir do esperado, nada é gravado. Flags de publicação e o portão não são tocados.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const somarDias = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const br = (iso) => iso.split('-').reverse().join('/');

/** Fim inclusivo: mesmo dia, dois meses depois; sem esse dia no mês, o último dia do mês. */
export function calcularFim(inicio) {
  if (!ISO.test(inicio)) throw new Error(`data inválida: ${inicio}`);
  const [a, m, d] = inicio.split('-').map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + 2, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}

/** Datas usadas nos testes e na homologação: véspera, primeiro dia, um dia no meio, último dia e dia seguinte. */
export function calcularDatas(inicio) {
  const fim = calcularFim(inicio);
  return { inicio, fim, vespera: somarDias(inicio, -1), meio: somarDias(inicio, 9), seguinte: somarDias(fim, 1) };
}

export const hojeEmBrasilia = (agora = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);

/**
 * Cada regra troca um trecho exato por outro, dentro de um escopo opcional [início, fim) do arquivo, e espera um número
 * fixo de ocorrências. `de`/`para` recebem as datas atuais (a) e as novas (n).
 */
const REGRAS = [
  { arquivo: 'publicacao.json', n: 1, de: (a) => `"inicio": "${a.inicio}"`, para: (n) => `"inicio": "${n.inicio}"` },
  { arquivo: 'publicacao.json', n: 1, de: (a) => `"fim": "${a.fim}"`, para: (n) => `"fim": "${n.fim}"` },
  { arquivo: 'scripts/testes/condicoes-delivery.test.mjs', n: 2, de: (a) => `{ inicio: '${a.inicio}', fim: '${a.fim}' }`, para: (n) => `{ inicio: '${n.inicio}', fim: '${n.fim}' }` },
  ...['simulador.test.mjs'].flatMap(() => {
    const escopo = ['9–11. campanha aprovada', "assert.equal(campaignState(campanhaLancamento"];
    return [
      { arquivo: 'scripts/testes/simulador.test.mjs', escopo, n: 1, de: (a) => `${a.vespera}T23:30`, para: (n) => `${n.vespera}T23:30` },
      { arquivo: 'scripts/testes/simulador.test.mjs', escopo, n: 1, de: (a) => `${a.inicio}T00:30`, para: (n) => `${n.inicio}T00:30` },
      { arquivo: 'scripts/testes/simulador.test.mjs', escopo, n: 1, de: (a) => `${a.meio}T12:00`, para: (n) => `${n.meio}T12:00` },
      { arquivo: 'scripts/testes/simulador.test.mjs', escopo, n: 1, de: (a) => `${a.fim}T23:30`, para: (n) => `${n.fim}T23:30` },
      { arquivo: 'scripts/testes/simulador.test.mjs', escopo, n: 1, de: (a) => `${a.seguinte}T00:30`, para: (n) => `${n.seguinte}T00:30` },
      { arquivo: 'scripts/testes/simulador.test.mjs', escopo, n: 1, de: (a) => `(${br(a.inicio)} a ${br(a.fim)})`, para: (n) => `(${br(n.inicio)} a ${br(n.fim)})` },
    ];
  }),
  { arquivo: 'scripts/testes/simulador.test.mjs', n: 1, de: (a) => `inicio: '${a.inicio}',\n    fim: '${a.fim}'`, para: (n) => `inicio: '${n.inicio}',\n    fim: '${n.fim}'` },
  ...[['vespera', 'T23:30'], ['inicio', 'T00:30'], ['meio', 'T12:00'], ['fim', 'T23:30'], ['seguinte', 'T00:30']].map(([k, h]) => ({
    arquivo: 'scripts/homologacao-simulador.mjs',
    escopo: ['const PROD_DATES = [', '];'],
    n: 2, // id e horário
    de: (a) => a[k],
    para: (n) => n[k],
    so: h,
  })),
  { arquivo: 'scripts/homologacao-simulador.mjs', n: 1, de: (a) => `de ${br(a.inicio)} a ${br(a.fim)}`, para: (n) => `de ${br(n.inicio)} a ${br(n.fim)}` },
  { arquivo: 'scripts/homologacao-canais.mjs', n: 1, de: (a) => `IN_CAMPAIGN = new Date('${a.meio}T12:00`, para: (n) => `IN_CAMPAIGN = new Date('${n.meio}T12:00` },
  { arquivo: 'scripts/homologacao-leads.mjs', n: 1, de: (a) => `IN_CAMPAIGN = new Date('${a.meio}T12:00`, para: (n) => `IN_CAMPAIGN = new Date('${n.meio}T12:00` },
  { arquivo: '.github/workflows/ci.yml', n: 1, de: (a) => `for d in ${a.vespera} ${a.meio} ${a.seguinte}; do`, para: (n) => `for d in ${n.vespera} ${n.meio} ${n.seguinte}; do` },
  { arquivo: '.github/workflows/ci.yml', n: 1, de: (a) => `(${br(a.inicio)} a ${br(a.fim)})`, para: (n) => `(${br(n.inicio)} a ${br(n.fim)})` },
];

const contar = (texto, trecho) => texto.split(trecho).length - 1;

/** Monta o plano sobre os conteúdos atuais. Não grava nada. Lança erro se alguma contagem divergir. */
export function planejar(ler, novoInicio, autorizacao) {
  const pub = JSON.parse(ler('publicacao.json'));
  const atual = calcularDatas(pub.campanhaLancamento.inicio);
  if (atual.fim !== pub.campanhaLancamento.fim) throw new Error(`publicacao.json: fim ${pub.campanhaLancamento.fim} não é inicio + 2 meses (${atual.fim})`);
  const nova = calcularDatas(novoInicio);
  const arquivos = new Map();
  const erros = [];
  const linhas = [];
  // Duas fases: cada data antiga vira um marcador e só no fim o marcador vira a data nova. Assim uma data nova igual a
  // uma data antiga (ex.: nova véspera = início atual) não é trocada duas vezes.
  const marcadores = [];
  const marcar = (valor) => { marcadores.push(valor); return `\u0000${marcadores.length - 1}\u0000`; };
  for (const r of REGRAS) {
    const texto = arquivos.get(r.arquivo) ?? ler(r.arquivo);
    let [ini, fim] = [0, texto.length];
    if (r.escopo) {
      ini = texto.indexOf(r.escopo[0]);
      fim = ini >= 0 ? texto.indexOf(r.escopo[1], ini + r.escopo[0].length) : -1;
      if (ini < 0 || fim < 0) { erros.push(`${r.arquivo}: escopo "${r.escopo[0]}" não encontrado`); continue; }
    }
    const de = r.de(atual);
    const para = r.para(nova);
    const trecho = texto.slice(ini, fim);
    // `so`: além da data, exige que a ocorrência seja a do horário indicado ou o id da linha (ex.: 2026-11-05-campanha)
    const ocorrencias = r.so ? contar(trecho, `${de}${r.so}`) + contar(trecho, `'${de}-`) : contar(trecho, de);
    if (ocorrencias !== r.n) { erros.push(`${r.arquivo}: "${de}" aparece ${ocorrencias}x, esperado ${r.n}x`); continue; }
    const novoTrecho = r.so
      ? trecho.split(`${de}${r.so}`).join(marcar(`${para}${r.so}`)).split(`'${de}-`).join(marcar(`'${para}-`))
      : trecho.split(de).join(marcar(para));
    arquivos.set(r.arquivo, texto.slice(0, ini) + novoTrecho + texto.slice(fim));
    linhas.push(`${r.arquivo}: ${de} → ${para} (${r.n}x)`);
  }
  for (const [p, t] of arquivos) arquivos.set(p, t.replace(/\u0000(\d+)\u0000/g, (_, i) => marcadores[Number(i)]));
  if (autorizacao !== undefined) {
    const texto = arquivos.get('publicacao.json');
    const re = /("campanhaLancamento": )"[^"\n]*"(,?)/;
    if (!re.test(texto.slice(0, texto.indexOf('"campanhaLancamento": {')))) erros.push('publicacao.json: $origem.campanhaLancamento não encontrado');
    else arquivos.set('publicacao.json', texto.replace(re, (_, k, v) => `${k}${JSON.stringify(autorizacao)}${v}`));
  }
  if (erros.length) throw new Error(`Nada foi gravado. Divergências:\n- ${erros.join('\n- ')}`);
  const json = JSON.parse(arquivos.get('publicacao.json'));
  const antes = { ...pub, campanhaLancamento: null, $origem: null };
  const depois = { ...json, campanhaLancamento: null, $origem: null };
  if (JSON.stringify(antes) !== JSON.stringify(depois)) throw new Error('publicacao.json: o plano mudaria algo além da campanha');
  return { atual, nova, arquivos, linhas };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2);
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const inicio = opt('--publicacao');
  const autorizacao = opt('--autorizacao');
  const aplicar = args.includes('--aplicar');
  if (!inicio || !ISO.test(inicio)) {
    console.error('Uso: node scripts/campanha-datas.mjs --publicacao AAAA-MM-DD [--autorizacao "…" --aplicar]');
    process.exit(2);
  }
  const hoje = hojeEmBrasilia();
  if (inicio < hoje) {
    console.error(`Recusado: ${inicio} é anterior a hoje em Brasília (${hoje}). A vigência efetiva ficaria menor que dois meses.`);
    process.exit(1);
  }
  if (aplicar && !autorizacao) {
    console.error('Recusado: --aplicar exige --autorizacao com a autorização escrita e datada da titular.');
    process.exit(1);
  }
  const ler = (p) => readFileSync(path.join(RAIZ, p), 'utf8');
  const { atual, nova, arquivos, linhas } = planejar(ler, inicio, autorizacao);
  console.log(`Campanha atual: ${br(atual.inicio)} a ${br(atual.fim)}`);
  console.log(`Campanha nova:  ${br(nova.inicio)} a ${br(nova.fim)} (bordas: ${nova.vespera}, ${nova.meio}, ${nova.seguinte})\n`);
  console.log(linhas.map((l) => `- ${l}`).join('\n'));
  if (!aplicar) {
    console.log('\nSimulação: nada foi gravado. Use --autorizacao "…" --aplicar depois da autorização da titular.');
  } else {
    for (const [p, t] of arquivos) writeFileSync(path.join(RAIZ, p), t);
    console.log(`\nGravado em ${arquivos.size} arquivos. Falta: npm run texto, PUB-13 em COM-RELEASE-PENDENCIAS.md e npm run check.`);
  }
}
