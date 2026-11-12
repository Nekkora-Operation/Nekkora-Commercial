/**
 * Documentação comercial da COM-VITRINE-001 (etapa 6): regulamento, contrato-base, proposta-modelo, anexo de
 * componentes e procedimento operacional. Confere que os valores dos documentos são os de src/precos.ts, que o histórico
 * das ofertas anteriores foi preservado, que nada se apresenta como aprovado e que as decisões contratuais em aberto
 * (DP-01 a DP-05) estão marcadas.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PACKAGE_SIZE, PREVIOUS_PRICE_TABLE, brl, priceFacts } from '../../src/precos.ts';

const root = resolve('.');
const doc = (f) => readFileSync(join(root, 'docs/comercial', f), 'utf8');
const REG = doc('regulamento-campanha-lancamento.md');
const CONTRATO = doc('contrato-base-delivery.md');
const PROPOSTA = doc('proposta-modelo-delivery.md');
const ANEXO = doc('anexo-componentes-delivery.md');
const PROC = doc('procedimento-operacional-delivery.md');
const HIST = doc('condicoes-comerciais-minuta.md');
const secao7 = REG.slice(REG.indexOf('## 7. Novas condições'));

test('etapa 6. regulamento §7: a tabela nova é a de src/precos.ts', () => {
  for (const [tier, nome] of [['simples', 'Simples'], ['media', 'Média']]) {
    const f = priceFacts(tier);
    assert.match(secao7, new RegExp(`\\| ${nome} \\| ${f.individualLabel.replace('$', '\\$')} \\| ${f.packageLabel.replace('$', '\\$')} \\| ${f.savingsLabel.replace('$', '\\$')} \\|`), nome);
  }
  assert.equal(PACKAGE_SIZE, 3);
});

test('etapa 6. histórico preservado: tabela anterior, faixa complexa e exemplos continuam no regulamento', () => {
  for (const tier of ['simples', 'media']) {
    assert.ok(REG.includes(brl(PREVIOUS_PRICE_TABLE[tier].standard)) && REG.includes(brl(PREVIOUS_PRICE_TABLE[tier].launch)), tier);
  }
  assert.match(REG, /\| Complexa \| Sob orçamento \| Sob orçamento, \*\*sem desconto automático\*\* \|/);
  assert.match(REG, /\*\*Tabela anterior\*\* — vale só para solicitações recebidas \*\*antes\*\* da data de início/);
  assert.match(REG, /## 6\. Exemplos testados — tabela anterior/);
  assert.match(HIST, /Este registro não muda\./);
});

test('etapa 6. nada aprovado automaticamente: minutas marcadas e pendências explícitas', () => {
  for (const [nome, t] of [['regulamento', REG], ['contrato', CONTRATO], ['proposta', PROPOSTA]]) {
    assert.match(t, /(MINUTA|MODELO) NÃO APROVAD[AO]/, nome);
  }
  for (const dp of ['DP-01', 'DP-02', 'DP-03', 'DP-04', 'DP-05']) assert.match(CONTRATO, new RegExp(dp), dp);
  assert.match(secao7, /V-01, pendente de aprovação comercial definitiva/);
  assert.match(secao7, /Até a aprovação definitiva, este item \*\*não\*\* é oferta\./);
  assert.match(ANEXO, /LIC-02 continua pendente/);
  assert.doesNotMatch(CONTRATO + REG + PROPOSTA, /DP-0\d[^\n]*(aprovad[ao] pela titular|decidid[ao] pela titular)/i);
});

test('etapa 6 (V-03). pacote: mesma categoria, 50% + 50% por pacote, sem penalidade, cláusula 10 fora', () => {
  assert.match(CONTRATO, /6-A\.1 \*\*\[D\]\*\* O pacote reúne \*\*três automações da mesma categoria\*\*/);
  assert.match(CONTRATO, /6-A\.3 \*\*\[D\]\*\* Pagamento \*\*50% \+ 50% por pacote\*\*/);
  assert.match(CONTRATO, /9-A\.1 \*\*\[D\]\*\* O CONTRATANTE pode desistir de uma ou mais automações do pacote[\s\S]*?\*\*sem\s+penalidade nem retenção automática\*\*/);
  assert.match(CONTRATO, /9-A\.4 \*\*\[D\]\*\* A \*\*cláusula 10\*\* \(retenção de 50% durante a homologação\) \*\*não se aplica\*\* a automações de pacote/);
  assert.match(CONTRATO, /\*\*Pacote misto\*\* \(categorias diferentes\) só por \*\*proposta específica\*\*/);
  // valor de referência (DP-02): soma exata do preço do pacote
  const media = priceFacts('media').package;
  assert.equal(Math.round(116667 + 116667 + 116666), media * 100);
  assert.match(CONTRATO, /R\$ 1\.166,67, R\$ 1\.166,67 e R\$ 1\.166,66, para fechar R\$ 3\.500,00/);
  assert.equal(priceFacts('simples').package / 3, 500);
});

test('etapa 6 (DP-01 a DP-05). diretrizes de 12/11/2026 registradas como propostas não aprovadas, com centavos exatos', () => {
  for (const dp of ['DP-01', 'DP-02', 'DP-03', 'DP-04', 'DP-05']) {
    assert.match(CONTRATO, new RegExp(`\\*\\*\\[P\\] Proposta para análise \\(${dp}, 12/11/2026\\), não aprovada:\\*\\*`), dp);
  }
  assert.match(CONTRATO, /não é contrato pronto para\s+> assinatura/);
  // DP-02: centavos inteiros, resíduo às primeiras automações; a entrada segue a mesma regra e o saldo é a diferença
  const reparte = (centavos) => [0, 1, 2].map((i) => Math.floor(centavos / 3) + (i < centavos % 3 ? 1 : 0));
  const fmt = (c) => `${brl(Math.floor(c / 100))},${String(c % 100).padStart(2, '0')}`;
  for (const tier of ['simples', 'media']) {
    const total = Math.round(priceFacts(tier).package * 100);
    const ref = reparte(total);
    const entrada = reparte(total / 2);
    const saldo = ref.map((r, i) => r - entrada[i]);
    assert.equal(ref.reduce((a, b) => a + b), total, tier);
    assert.equal(entrada.reduce((a, b) => a + b) + saldo.reduce((a, b) => a + b), total, tier);
    if (tier === 'media') {
      assert.deepEqual(ref, [116667, 116667, 116666]);
      assert.deepEqual(entrada, [58334, 58333, 58333]);
      assert.deepEqual(saldo, [58333, 58334, 58333]);
    }
    for (const c of [...ref, ...entrada, ...saldo]) assert.ok(CONTRATO.includes(fmt(c)), `${tier} ${fmt(c)}`);
  }
});

test('etapa 6 (V-02). compromissos anteriores: só proposta da condição mais favorável, sem troca unilateral', () => {
  assert.match(secao7, /Proposta \*\*já aceita\*\* só muda por acordo escrito das partes; nada é substituído unilateralmente\./);
  assert.match(PROPOSTA, /Condição mais favorável \*\*proposta\*\*[^\n]*\(só vale se o cliente aceitar\)/);
  assert.match(PROC, /\*\*propor\*\* a condição\s+mais favorável/);
});

test('etapa 6 (V-05). titularidade: após a quitação integral, com as exceções, por tipo de componente', () => {
  assert.match(CONTRATO, /14\.3 \*\*\[D\] \(V-05\)\*\* "A automação é sua"/);
  assert.match(ANEXO, /## 4\. Direitos de uso por tipo de componente/);
  for (const tipo of ['Código Específico', 'Componentes preexistentes da Nekkora', 'Componentes reutilizáveis', 'Bibliotecas e frameworks de terceiros', 'Ferramentas e serviços comerciais']) {
    assert.ok(ANEXO.includes(tipo), tipo);
  }
  assert.doesNotMatch(ANEXO + CONTRATO, /propriedade irrestrita|todos os direitos sobre (as )?bibliotecas/i);
});
