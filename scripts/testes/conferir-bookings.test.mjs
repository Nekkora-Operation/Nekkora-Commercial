// Regras da conferência do Bookings (OPS-02 / CTL-03). Sem rede: avalia o texto da minuta e o texto público
// registrado em 06/11/2026.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { avaliar } from '../conferir-bookings.mjs';

const ler = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const citacao = (md, titulo) => {
  const i = md.indexOf(titulo);
  const bloco = md.slice(i).split('\n').filter((l) => l.startsWith('>'));
  return bloco.map((l) => l.replace(/^>\s?/, '')).join('\n');
};
const falhas = (t) => avaliar(t).filter((r) => !r.ok).map((r) => r.id);

test('o texto proposto na privacidade-minuta §4 passa em todas as regras', () => {
  const minuta = ler('docs/comercial/privacidade-minuta.md');
  const i = minuta.indexOf('## 4. Texto alternativo para o Microsoft Bookings');
  const trecho = minuta.slice(i, minuta.indexOf('## 4a.', i));
  const texto = trecho.split('\n').filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join('\n');
  assert.ok(texto.length > 200, 'trecho §4 encontrado');
  assert.deepEqual(falhas(texto), []);
});

test('o texto público de 06/11/2026 (com gravação) é reprovado', () => {
  const ev = ler('docs/release/evidencias/golive-001/bookings-texto-publico-2026-11-06.md');
  const texto = `${citacao(ev, '## Descrição do serviço')}\n${citacao(ev, 'Bloco "Privacidade')}`;
  assert.deepEqual(falhas(texto), ['B01', 'B02', 'B04', 'B05', 'B06', 'B07', 'B12']);
});

test('pequenas variações de redação continuam aceitas, e o consentimento é recusado', () => {
  const base = 'Reunião pelo Microsoft Teams. Nesta fase, a Nekkora não grava as conversas. LGPD, art. 7º, V. Podem processar dados fora do Brasil. Reservas guardadas por até 90 dias. Não inclua senhas. contato@nekkora.com. https://nekkora.com/#privacidade. Li e entendi como meus dados serão usados.';
  assert.deepEqual(falhas(base), []);
  assert.deepEqual(falhas(`${base} Ao marcar esta caixa, você concorda com o tratamento.`), ['B11']);
  assert.deepEqual(falhas(`${base} Informe seu telefone.`), ['B10']);
  assert.deepEqual(falhas(base.replace('não grava as conversas', 'a reunião poderá ser gravada')), ['B01', 'B02']);
  assert.deepEqual(falhas(base.replace(' Li e entendi como meus dados serão usados.', '')), ['B12'], 'sem a caixa de ciência');
});
