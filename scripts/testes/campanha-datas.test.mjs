// PUB-13: preparação das datas definitivas da campanha. Sem gravar arquivos: o plano é montado em memória.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularDatas, calcularFim, hojeEmBrasilia, planejar } from '../campanha-datas.mjs';

const ler = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('fim = mesmo dia, dois meses depois (inclusivo); sem o dia no mês, o último dia', () => {
  assert.equal(calcularFim('2026-11-06'), '2027-01-06', 'par aprovado atual');
  assert.equal(calcularFim('2026-11-13'), '2027-01-13');
  assert.equal(calcularFim('2026-12-31'), '2027-02-28');
  assert.equal(calcularFim('2027-12-30'), '2028-02-29', 'ano bissexto');
  assert.deepEqual(calcularDatas('2026-11-20'), { inicio: '2026-11-20', fim: '2027-01-20', vespera: '2026-11-19', meio: '2026-11-29', seguinte: '2027-01-21' });
});

test('o plano encontra todas as ocorrências no repositório e não toca flags de publicação', () => {
  const { arquivos } = planejar(ler, '2026-11-20', 'Titular, teste: 20/11/2026 a 20/01/2027.');
  const pub = JSON.parse(arquivos.get('publicacao.json'));
  const original = JSON.parse(ler('publicacao.json'));
  assert.deepEqual(pub.campanhaLancamento, { inicio: '2026-11-20', fim: '2027-01-20' });
  assert.equal(pub.$origem.campanhaLancamento, 'Titular, teste: 20/11/2026 a 20/01/2027.');
  for (const k of ['canais', 'agendamento', 'envioAutomatico', 'aprovacoes', 'avisoHomologacao', 'controlador', 'fornecedor', 'hospedagem']) {
    assert.deepEqual(pub[k], original[k], `${k} não pode mudar`);
  }
  assert.equal(pub.avisoHomologacao, false); // titular, 11/11/2026 (PUB-10): o plano não religa o aviso
  // datas sintéticas fora da campanha real continuam intactas
  assert.match(arquivos.get('scripts/homologacao-simulador.mjs'), /vigente: new Date\('2026-11-15T12:00/);
  assert.match(arquivos.get('scripts/testes/condicoes-delivery.test.mjs'), /diaEmBrasilia\('2026-11-06T02:00:00Z'\), '2026-11-05'/);
});

test('nova véspera igual ao início atual não é trocada duas vezes', () => {
  const { arquivos } = planejar(ler, '2026-11-07');
  const ci = arquivos.get('.github/workflows/ci.yml');
  assert.match(ci, /for d in 2026-11-06 2026-11-16 2027-01-08; do/);
  const sim = arquivos.get('scripts/testes/simulador.test.mjs');
  assert.match(sim, /'2026-11-06T23:30:00-03:00', 'futura'/);
  assert.match(sim, /'2026-11-07T00:30:00-03:00', 'vigente'/);
});

test('o plano pode ser repetido sobre o resultado (troca de datas depois de um atraso)', () => {
  const { arquivos } = planejar(ler, '2026-11-20', 'Titular, teste 1.');
  const lerNovo = (p) => arquivos.get(p) ?? ler(p);
  const segundo = planejar(lerNovo, '2026-12-04', 'Titular, teste 2.');
  assert.deepEqual(JSON.parse(segundo.arquivos.get('publicacao.json')).campanhaLancamento, { inicio: '2026-12-04', fim: '2027-02-04' });
});

test('hoje em Brasília segue o fuso de Brasília', () => {
  assert.equal(hojeEmBrasilia(new Date('2026-11-21T02:30:00Z')), '2026-11-20');
});
