// PUB-13: datas da campanha de lançamento — hoje histórico (NEKKORA-COM-ECOSYSTEM-001). Sem gravar arquivos.
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

test('NEKKORA-COM-ECOSYSTEM-001: a campanha é histórico — o plano recusa trocar as datas, e nada é gravado', () => {
  for (const inicio of ['2026-11-20', '2026-11-07', '2026-12-04']) {
    assert.throws(() => planejar(ler, inicio, 'Titular, teste.'), /campanha de lançamento é histórico/);
  }
  const pub = JSON.parse(ler('publicacao.json'));
  assert.deepEqual(pub.campanhaLancamento, { inicio: '2026-11-06', fim: '2027-01-06' }, 'datas históricas intactas');
  assert.ok('ecossistema' in pub, 'a nova estratégia tem vigência própria');
});

test('hoje em Brasília segue o fuso de Brasília', () => {
  assert.equal(hojeEmBrasilia(new Date('2026-11-21T02:30:00Z')), '2026-11-20');
});
