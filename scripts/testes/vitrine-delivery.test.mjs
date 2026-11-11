/**
 * Vitrine do Nekkora Delivery (COM-VITRINE-001, etapa 3): só simples e média (V-04), sem categoria complexa em
 * cartões, critérios, regras, simulador ou navegação; texto de demandas fora das modalidades pelos canais gerais;
 * "A automação é sua" com as exceções (V-05, sem titularidade irrestrita de componentes — LIC-02); campanha com o
 * período mantido, sem "preços especiais" nem comparação com a tabela anterior, e a tabela nova só a partir da data de
 * início das novas condições (V-02), nunca retroativa ao início da campanha.
 *
 * Lê os fontes (src/content.ts e src/sections/Pricing.tsx) sem os comentários: a conferência na página renderizada,
 * nos três navegadores, fica em scripts/homologacao.mjs.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = resolve('.');
/** Fonte sem comentários de bloco e de linha (as strings com "//" — URLs — não aparecem nos trechos verificados). */
const semComentarios = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const content = semComentarios(readFileSync(join(root, 'src/content.ts'), 'utf8'));
const pricing = semComentarios(readFileSync(join(root, 'src/sections/Pricing.tsx'), 'utf8'));
const config = readFileSync(join(root, 'src/config.ts'), 'utf8');
/** Trecho de PRICING (até o simulador), onde ficam cartões, faixa, regras, critérios, condições e notas. */
const bloco = content.slice(content.indexOf('export const PRICING'), content.indexOf('export const SIMULATOR'));

test('etapa 3. sem categoria complexa na vitrine: cartões, critérios, regras e componente', () => {
  assert.doesNotMatch(bloco, /complexa/i, 'nenhuma menção à categoria complexa no bloco de preços');
  assert.doesNotMatch(bloco, /Sob orçamento|orçamento individual|negotiated/i, 'sem "sob orçamento" como terceira categoria');
  assert.doesNotMatch(pricing, /complexa|negotiated/i);
  const tiers = bloco.slice(bloco.indexOf('tiers: ['), bloco.indexOf('],', bloco.indexOf('tiers: [')));
  assert.deepEqual([...tiers.matchAll(/overline: '([^']+)'/g)].map((m) => m[1]), ['Simples', 'Média'], 'só os cartões simples e média');
  assert.match(pricing, /className="cards cards--2 cards--poster plain-list price-cards"/, 'grade de dois cartões');
});

test('etapa 3. critérios: simples até 8 horas e média acima de 8 até 16 horas, sem a faixa complexa', () => {
  assert.match(bloco, /'Esforço técnico estimado da automação: simples até 8 horas; média acima de 8 até 16 horas',/);
  assert.doesNotMatch(bloco, /acima de 16 horas|risco excepcional/);
  assert.doesNotMatch(bloco, /Nem todo processo é simples ou médio/);
  assert.match(bloco, /Se a demanda não se enquadrar como simples ou média, a avaliação é individual\./);
  // autorização da etapa 3, item 4: horas como referência, sem classificação garantida só por elas
  assert.match(bloco, /o enquadramento definitivo depende da avaliação técnica e dos demais critérios, e nenhuma categoria é garantida só pela quantidade de horas/);
});

test('etapa 3 (V-04). demandas fora das modalidades: texto aprovado, canais gerais, sem terceira categoria', () => {
  assert.match(bloco, /text: 'Não encontrou uma modalidade adequada à sua necessidade\? Entre em contato com nossa equipe para uma avaliação individual\.'/);
  // o link abre a mesma solicitação de avaliação dos demais botões (canais gerais: e-mail e LinkedIn)
  assert.match(pricing, /<p className="center-note other-demand" data-outras-demandas>[\s\S]*?<Link arrow \{\.\.\.trigger\}>[\s\S]*?PRICING\.other\.cta/);
});

test('etapa 3 (V-05). "A automação é sua": após a quitação integral, com as exceções e sem titularidade irrestrita', () => {
  const nota = bloco.match(/title: 'A automação é sua',\s*text: '([^']+)'/);
  assert.ok(nota, 'nota "A automação é sua" presente');
  const t = nota[1];
  assert.match(t, /desenvolvidos especificamente para você e contratados passam a ser seus conforme o contrato e após a quitação integral/);
  assert.match(t, /Bibliotecas, frameworks e componentes preexistentes da Nekkora, componentes reutilizáveis e tecnologias de terceiros continuam com seus titulares/);
  assert.match(t, /licenciados para que você possa usar, manter e executar a automação, nas condições de cada licença/);
  // LIC-02 pendente: nenhuma promessa de propriedade irrestrita, total ou de todos os componentes
  assert.doesNotMatch(bloco, /propriedade (irrestrita|total|integral)|todos os direitos|100% sua|sem restrições/i);
  assert.match(pricing, /data-nota=\{n\.title === 'A automação é sua' \? 'titularidade' : undefined\}/);
});

test('etapa 3. campanha: período mantido, sem "preços especiais", sem preço de lançamento nem comparação', () => {
  assert.match(bloco, /`Campanha de lançamento para solicitações de avaliação recebidas de \$\{LAUNCH_PERIOD\.start\} a \$\{LAUNCH_PERIOD\.end\}\.`/);
  assert.doesNotMatch(bloco, /Preços especiais|preço de lançamento|preços de lançamento|de R\$|por R\$/i);
  // percentual só no pagamento 50/50 (condição de pagamento, não desconto)
  assert.deepEqual([...bloco.matchAll(/\d+ ?%/g)].map((m) => m[0]), ['50%', '50%']);
  // período da campanha intocado
  const pub = JSON.parse(readFileSync(join(root, 'publicacao.json'), 'utf8'));
  assert.deepEqual(pub.campanhaLancamento, { inicio: '2026-11-06', fim: '2027-01-06' });
});

test('etapa 3 (V-02). tabela nova só a partir da data de início das novas condições, nunca retroativa', () => {
  // a data vem só de publicacao.json (novasCondicoes.inicio), nunca do início da campanha
  assert.match(config, /export const NEW_CONDITIONS_START: string \| null = \(\(\) => \{\s*const inicio = publicacao\.novasCondicoes\?\.inicio \?\? null;/);
  assert.match(bloco, /condition: NEW_CONDITIONS_START\s*\? `Os valores e pacotes desta tabela valem para solicitações recebidas a partir de \$\{NEW_CONDITIONS_START\}\. As recebidas antes mantêm as condições da oferta anterior\./);
  assert.match(bloco, /pendingStart: 'Prévia para revisão: a data de início destes valores ainda não foi definida\.'/);
  // sem a data, a faixa diz que ela não foi definida (o portão bloqueia a publicação: PUB-13)
  assert.match(pricing, /\{!NEW_CONDITIONS_START && \(\s*<span className="launch-strip__preview" data-novas-condicoes="pendente">/);
  // regras: pacotes da mesma categoria, misto só por proposta, compromissos anteriores preservados
  assert.match(bloco, /Pacote: 3 automações da mesma categoria, pelo valor do cartão\. Com 4 ou 5, um pacote e as demais no preço individual; com 6, dois pacotes\. Pacote com categorias diferentes só por proposta específica\./);
  assert.match(bloco, /propomos a condição mais favorável, sem alterar proposta já aceita sem o seu acordo/);
});

test('etapa 3. nome Nekkora Delivery preservado', () => {
  assert.match(content, /name: 'Nekkora Delivery'/);
  assert.match(bloco, /eyebrow: 'Preços · Nekkora Delivery'/);
  assert.doesNotMatch(content, /Nekkora Development/);
});
