# NEKKORA-COM-CONTRACT-001-R1 — Revisão das condições contratuais, regras operacionais e critérios comerciais

**Data:** 06/11/2026 · **PR:** [#17](https://github.com/Nekkora-Operation/Nekkora-Commercial/pull/17) · **Branch:**
`docs/contract-001` · **Base da revisão:** `43da08f` (CONTRACT-001) · **Commit da R1:** `195f2ce`

> **Revisão incremental.** Incorpora as decisões complementares da titular sobre C-03, C-04, C-06, C-07, C-10 e C-11 e
> preserva as demais decisões C-01 a C-12 ([relatório CONTRACT-001](NEKKORA-COM-CONTRACT-001.md)). **Não é parecer
> jurídico.** Nenhuma aprovação foi marcada; `publicacao.json`, `src/precos.ts` e o portão não foram alterados. Os
> percentuais da C-04 são **tetos pretendidos**: passar nos testes **não** os valida juridicamente.
>
> Legenda: **[D]** decisão da titular · **[R]** redação do agente · **[N]** norma · **[I]** interpretação · **⚖** parecer
> jurídico · **[!]** pendente.

## A. Resumo das alterações

| Arquivo | O que mudou | Por quê |
|---|---|---|
| `scripts/comercial/regras-delivery.mjs` | `resultadoDaDesistencia` exige o **enquadramento explícito** (`consumidor` / `b2b-nao-consumerista`, este só com os 4 itens do Anexo B2B), aplica o teto de **90%** (consumidor, com reserva prévia de 10%) ou **100%** (B2B), abate pagamentos, nunca autoriza faturamento. Novos: `regimeDaContratacao`, `prazoDaRestituicao`, `entregaAposQuitacao`, `cronogramaDaHomologacao`, `atendimentoDaGarantia`, `classificarAutomacao`. `situacaoDaHomologacao` reescrita (5º/9º dia útil, suspensão, reprogramação, nova data-base comunicada). `encargosDeAtraso` exige enquadramento, aceita teto legal e atualização monetária **só com fonte e período**, recusa a Selic cumulada com juros e devolve sempre resultado indicativo | Itens 1.6, 3 e 6 da missão: a versão anterior não distinguia consumidor e B2B e programava os lembretes depois do prazo |
| `scripts/testes/condicoes-delivery.test.mjs` | 16 testes anteriores adaptados à nova interface **sem remover asserções**; **30 cenários R1** | §9 da missão |
| `docs/comercial/contrato-base-delivery.md` | Hierarquia revista; cl. 8.3 (calendário), 8.5 (retomada e nova data-base), 9.4 (5 dias úteis), **cl. 10 reescrita** (regimes, 8 condições, contestação, entrega, exemplos), 12.1, 13.3 (atendimento), 15.2 e 15.2-A (atualização monetária) | Decisões R1 |
| `docs/comercial/proposta-modelo-delivery.md` | Linha **"Reserva das etapas finais"** obrigatória (consumidor), horas estimadas na categoria, resumo da cl. 10 com exemplo, ordem dos documentos | C-04, C-10, hierarquia |
| `docs/comercial/anexo-b2b-delivery.md` | C-04 B2B até 100%; **§2-A: quadro consumidor × B2B** | Item 1.2 |
| `docs/comercial/termo-garantia-delivery.md` | Metas de 2 e 5 dias úteis; caráter adicional da cobertura | C-07 |
| `docs/comercial/anexo-componentes-delivery.md` | Titularidade do código específico também após a quitação do **valor validamente apurado** | Coerência 90% × 100% (item 1.4) |
| `docs/comercial/regulamento-campanha-lancamento.md` | §5 reescrito: horas, critérios complementares, exceção, lacunas | C-10 |
| `docs/comercial/procedimento-operacional-delivery.md` | Fluxo do pedido de desistência (receber, confirmar, registrar, classificar, concluir), calendário da homologação, checklist da C-04, garantia | C-03, C-04, C-06, C-07 |
| `docs/comercial/condicoes-comerciais-minuta.md` | Novo §11 (decisões R1), mantendo o §10 | Rastreabilidade |
| `src/content.ts`, `scripts/homologacao.mjs`, `docs/com-001/05-texto-comercial.md` | 2 trechos públicos (§G); a homologação passa a exigir o critério "Esforço técnico estimado" | Coerência do site com o regulamento |
| `docs/com-001/03-matriz-alegacoes.md`, `docs/release/COM-RELEASE-PENDENCIAS.md` | PR-06, CO-10; PUB-17, PUB-19, JUR-01 a 05, OPS-11, COM-10 | Rastreabilidade (nenhum item marcado como resolvido) |

**Hierarquia (item 8).** Antes: "norma > contrato-base > proposta > anexos", o que fazia uma condição particular
aprovada na proposta perder para o texto genérico. Agora: (1) norma obrigatória; (2) condição particular da proposta que
indique a cláusula alterada, sem reduzir direito legal; (3) Anexo B2B, só quando validamente aplicável e só nos temas
que lista; (4) contrato-base; (5) termo de garantia e Anexo de Componentes, que detalham as cl. 13 e 14. Na contradição
não intencional, vale a interpretação mais favorável ao cliente (CDC art. 47). ⚖

## B. Matriz das decisões

| ID | Decisão empresarial [D] | Redação | Implementação | Testes | Risco jurídico |
|---|---|---|---|---|---|
| C-03 | Reembolso integral antes da conclusão em até **5 dias úteis**, com confirmação, registro e comprovante; arrependimento legal imediato | Contrato-base 9.4; proposta §5; procedimento §2 | `prazoDaRestituicao`; `resultadoDaDesistencia` (regra C-03 com prazo) | 2, R1-1, R1-9, R1-12 | Baixo. A ressalva "prevalece a lei mais favorável" impede postergar a devolução legal |
| C-04 | **Consumidor:** até 90%, com reserva prévia de 10% na proposta. **B2B não consumerista:** até 100%, só com o Anexo B2B. 8 condições cumulativas; 10 dias úteis de contestação; entrega após a quitação do valor apurado | Contrato-base cl. 10; Anexo B2B §2 e §2-A; proposta §2 e §5; Anexo de Componentes (1) | Enquadramento explícito; reserva ausente ou menor que 10% → `C-04-sem-reserva-previa` (não cobra); `exigibilidade` sempre `depende-de-revisao-juridica` ou suspensa; `autorizadoParaFaturamento: false` | 3, R1-2 a R1-11 | **Alto ⚖**: exigibilidade antes do aceite formal em contrato de consumo (CDC 51, IV e §1º); no B2B, a relação dos 100% com etapas não executadas |
| C-06 | 10 dias úteis; lembretes no **5º e 9º dia útil**; suspensão no dia útil seguinte ao 10º; **reprogramação** após 30 dias corridos; sem aceite tácito, desistência presumida ou cancelamento automático | Contrato-base 8.3 a 8.5; procedimento §3 | `cronogramaDaHomologacao`, `situacaoDaHomologacao` (feriados informados; nova data-base só com comunicação) | 4, R1-11, R1-13 a R1-17 | Baixo. Sem regra para a falta de resposta ao pedido de reprogramação ⚖ |
| C-07 | Confirmação em **2 dias úteis**, diagnóstico em **5 dias úteis**, previsão de correção por caso; 30 dias adicionais preservados | Termo §3 e §4; contrato-base 13.3; procedimento §7 | `atendimentoDaGarantia` (sem prazo máximo de correção); `periodosDeReclamacao` passa a dizer se a cobertura é de fato adicional | 6, R1-18 a R1-20 | **Médio ⚖**: termo inicial; caráter adicional diante do vício oculto |
| C-10 | Simples **até 8 h**; média **acima de 8 até 16 h**; complexa **acima de 16 h** ou risco excepcional justificado e informado antes do aceite; sem enquadramento pela contagem isolada de sistemas ou APIs | Regulamento §5; proposta §2; site | `classificarAutomacao` (exceção incompleta é recusada) | 8 a 10, R1-21 a R1-27 | **Médio**: a estimativa de horas é da própria Nekkora (§5.5, COM-10 em parte aberto); datas da campanha pendentes |
| C-11 | Atualização monetária quando devida, sem cumulação; 5 dias úteis, 2%, 1% a.m. simples **limitado ao máximo legal**; lembretes; dispensa; sem cancelamento automático | Contrato-base 15.2 e 15.2-A; procedimento §4; Anexo B2B §2 | `encargosDeAtraso`: enquadramento explícito; teto e índice só com fonte e período; Selic recusada; resultado `indicativo` ou `indicativo-pendente` | 12, R1-28, R1-29 | **Médio ⚖**: Lei de Usura × taxa legal (Lei 14.905/2024) para consumidor e PF; índice, incidência e arredondamento |

**Escolhas do agente para a titular conferir [R]:**
1. Uma reserva **maior** que 10% é aceita, porque é mais favorável ao consumidor. Uma reserva menor que 10%, ou ausente, impede a cobrança.
2. O risco excepcional só eleva para **complexa**. Nenhum critério complementar eleva de simples para média sem passar pelas horas (regulamento §5.5 b).
3. A multa e os juros incidem sobre o principal **atualizado**, e a correção entra uma única vez ⚖.
4. Na C-04, a pessoa física fora de relação de consumo recebe o tratamento conservador do consumidor. Nos encargos, ela tem enquadramento próprio (`pf-nao-consumidor`).

## C. Exemplos de cálculo (reproduzíveis)

Todos são **hipóteses contratuais**. Nenhum é valor exigível. Para reproduzir:

```bash
node -e "import('./scripts/comercial/regras-delivery.mjs').then(m => { const C = { conclusaoComprovada: true, criteriosDeAceiteCumpridos: true, disponibilizadaParaHomologacao: true }; const B2B = { atividadeEconomicaPropria: true, automacaoComoInsumo: true, estruturaParaNegociar: true, justificativaAssinadaEAceita: true }; const d = (o) => m.resultadoDaDesistencia({ desistenciaExpressaEm: '2027-01-10', evidencias: C, ...o }); console.table([d({ enquadramento: 'consumidor', precoCentavos: 100000, reservaNaPropostaCentavos: 10000, pagoANekkora: { desenvolvimento: 50000 } }), d({ enquadramento: 'consumidor', precoCentavos: 280000, reservaNaPropostaCentavos: 28000, pagoANekkora: { desenvolvimento: 140000 } }), d({ enquadramento: 'b2b-nao-consumerista', anexoB2B: B2B, precoCentavos: 280000, pagoANekkora: { desenvolvimento: 140000 } }), d({ enquadramento: 'b2b-nao-consumerista', anexoB2B: {}, precoCentavos: 280000, reservaNaPropostaCentavos: 28000, pagoANekkora: { desenvolvimento: 140000 } }), d({ enquadramento: 'consumidor', precoCentavos: 280000, pagoANekkora: { desenvolvimento: 140000 }, evidencias: { ...C, defeitoPendente: true } }), d({ enquadramento: 'consumidor', precoCentavos: 280000, pagoANekkora: { desenvolvimento: 140000, outros: 3000 }, arrependimentoLegal: true })].map(r => ({ regra: r.regra, teto: r.tetoPretendidoCentavos, saldo: r.saldoMaximoPretendidoCentavos, restituir: r.restituirCentavos, exigibilidade: r.exigibilidade }))) })"
```

| # | Caso | Preço | Pago | Regra | Teto pretendido | Saldo máximo pretendido | Restituição |
|---|---|---:|---:|---|---:|---:|---:|
| 1 | Consumidor, simples, concluída | R$ 1.000 | R$ 500 | C-04-consumidor | R$ 900 | **R$ 400** | — |
| 2 | Consumidor, média, concluída | R$ 2.800 | R$ 1.400 | C-04-consumidor | R$ 2.520 | **R$ 1.120** | — |
| 3 | B2B com Anexo válido, média, concluída | R$ 2.800 | R$ 1.400 | C-04-b2b | R$ 2.800 | **R$ 1.400** | — |
| 4 | "B2B" sem os 4 itens (só CNPJ) | R$ 2.800 | R$ 1.400 | C-04-consumidor | R$ 2.520 | R$ 1.120 | — |
| 5 | Com defeito pendente | R$ 2.800 | R$ 1.400 | C-03 | — | R$ 0 | **R$ 1.400** em até 5 dias úteis |
| 6 | Arrependimento legal | R$ 2.800 | R$ 1.400 + R$ 30 | arrependimento-legal | — | R$ 0 | **R$ 1.430**, de imediato |

Nos casos 1 a 4, a `exigibilidade` é `depende-de-revisao-juridica`. A reserva das etapas finais (R$ 100 e R$ 280) nunca
é cobrada. Quitado o valor apurado, os entregáveis são liberados sem essa reserva (`entregaAposQuitacao`, teste R1-10).

## D. Quadro de pendências jurídicas — o que ainda não pode ser usado para contratar

| Cláusula / documento | Pode ser usada? | Bloqueio | ID |
|---|---|---|---|
| Contrato-base **cl. 10** (desistência após a conclusão), nos dois regimes | **Não** | Exigibilidade antes do aceite, enquadramento e percentual cobrável ⚖ | JUR-03 |
| Cl. 10.5 (entrega após a quitação) | Não | Prazo de transferência **[!]** titular | — |
| Anexo B2B (todo) | Não | Critérios de enquadramento ⚖; relação dos 100% com obrigações pendentes | JUR-03 |
| Cl. 3 (arrependimento) | Não | Confirmação imediata sem mecanismo; termo inicial para serviço ⚖ | OPS-11 |
| Cl. 13 e termo de garantia §3 | Não | Termo inicial e caráter adicional dos 30 dias ⚖ | JUR-04 |
| Cl. 14 e Anexo de Componentes | Não, se houver componente preexistente | Titularidade do Framework pela LTDA | LIC-02 |
| Cl. 15.2 e 15.2-A (encargos e atualização) | Não, fora do B2B | Teto legal, índice, incidência e arredondamento ⚖ | JUR-01 |
| Cl. 16 (dados, confidencialidade, credenciais) | **Não** (sem redação) | Redação jurídica | JUR-05 |
| Cl. 2.1 (aceite), 6.4 (nota fiscal), 17.3 (foro) | Não | Redação jurídica | JUR-01 |
| Cl. 8.5 (sem resposta à reprogramação) | Sim, sem essa regra | Efeito da falta de resposta ⚖ | JUR-02 |
| Regulamento §1 e §5.5 | Não na campanha | Datas (PUB-13); verificabilidade das horas (COM-10, em parte) | PUB-13, COM-10 |
| **Todas** | Só depois de PUB-19 | Aprovação das condições finais e parecer | PUB-19 |

Nenhuma pendência foi marcada como resolvida por existir minuta. LIC-01 continua uma decisão separada, e o repositório
do Framework não foi tocado.

## E. Relatório de testes

| Comando | Resultado |
|---|---|
| `node --test scripts/testes/condicoes-delivery.test.mjs` | **46/46**: 16 anteriores mais 30 da R1 |
| Controles negativos (mutação de `regras-delivery.mjs`, restaurado depois): reserva 0% · lembretes após o prazo · CNPJ basta para B2B · exceção sem requisitos · Selic cumulada · C-04 "exigível" | **6/6 detectados**, com 4, 4, 1, 1, 1 e 4 falhas |
| `npm run check` (typecheck, testes, build, preços, CSP/cabeçalhos) | **ok**: 282 testes, 0 falha (252 anteriores mais 30); preços 5/5; a política de cabeçalhos corresponde ao build |
| `node scripts/verificar-publicacao.mjs` (sem e com `--dist dist`) | **PUBLICAÇÃO BLOQUEADA**: PUB-19, PUB-17, PUB-09, PUB-18, PUB-10, exit 1. O cenário R1-30 executa o portão de verdade |
| Homologação, CloudFront local, build de `195f2ce` (`arvoreLimpa: true`), datas 2026-11-05 / 2026-11-15 / 2027-01-07 × chromium / firefox / webkit | **9 execuções, 94 verificações cada, 0 falha**. Regras da campanha presentes só em 15/11; critério "Esforço técnico estimado" visível; axe sem pendências. [Evidência](evidencias/contract-001-r1/homologacao.md) |
| Integração simulada com a PR #16 (worktree temporária, `package.json` resolvido como no §F) | **293 testes, 0 falha** (282 mais 11 da #16); `COM-RELEASE-PENDENCIAS.md` sem conflito. Worktree removida |

**Limitações:**
1. Só os feriados nacionais fixos estão embutidos. Carnaval, Sexta-feira Santa, Corpus Christi e os feriados estaduais e municipais precisam ser informados em `feriadosExtras`.
2. Uma primeira rodada da homologação atingiu um servidor local antigo ainda ativo na porta 4173, que servia o build `01c7f6d`. Deu 2 falhas: o artefato não correspondia ao código e faltava o critério novo. Refiz na porta 4183, com o build correto. As capturas da rodada inválida foram descartadas antes do envio.
3. Os testes conferem a coerência interna. Eles **não** validam a juridicidade dos tetos.

## F. Comparação com a PR #16 (GOLIVE-001)

| Arquivo | #16 | #17 | Resultado do merge |
|---|---|---|---|
| `package.json` | Acrescenta `scripts/testes/diagnostico-dns.test.mjs` ao fim da linha `test` | Acrescenta `scripts/testes/condicoes-delivery.test.mjs` à mesma linha | **Conflito textual** (`git merge-tree`) |
| `docs/release/COM-RELEASE-PENDENCIAS.md` | Linhas INF-01/02/07/09/10 e LOG-01 | PUB-17, PUB-19, JUR-01 a 05, OPS-04, OPS-11, LIC-01/02, COM-10, §2d | Combinação automática, sem conflito |
| Demais | Disjuntos | Disjuntos | — |

**Resolução**, para quem fizer o segundo merge, em qualquer ordem: manter **os dois** arquivos na linha `test`. Um
exemplo é `… scripts/testes/api-solicitacoes.test.mjs scripts/testes/diagnostico-dns.test.mjs
scripts/testes/condicoes-delivery.test.mjs`. Não apagar nenhum script.

Depois de resolver, verificar:
1. `npm run check`: esperado **293** testes, 0 falha.
2. `node scripts/verificar-publicacao.mjs --dist dist`: continua **BLOQUEADA**.
3. `grep -c "^| INF-0\|^| OPS-11\|^| COM-10" docs/release/COM-RELEASE-PENDENCIAS.md`: esperado **11**.
4. Homologação em navegador, se `src/` tiver mudado.

A ordem e o momento dos merges cabem à titular. Esta R1 **não** alterou o `package.json`, para não ampliar a colisão.

## G. Textos públicos

Nesta R1 mudaram **2 trechos**, ambos em "O que define a categoria" (`src/content.ts`, marcados `CONTRACT-001-R1`).
Eles entram na nova aprovação **PUB-17**, junto com os 7 da CONTRACT-001, que não foram alterados:

| Local | Antes (CONTRACT-001) | Depois (R1) | Motivo |
|---|---|---|---|
| Preços → O que define a categoria (1º item) | — | **Novo:** "Esforço técnico estimado da automação: simples até 8 horas; média acima de 8 até 16 horas; complexa acima de 16 horas ou com risco excepcional justificado na proposta" | O critério principal aprovado precisa estar entre os critérios publicados que as regras da campanha citam (CDC arts. 30 e 31) |
| Preços → O que define a categoria (nota) | "Nem todo processo é simples ou médio: a avaliação indica a categoria antes de qualquer proposta." | Mesma frase + "Os demais critérios fundamentam a estimativa de esforço, e os perfis dos cartões são exemplos típicos." | Evita que "um sistema", "mais de um sistema" ou "várias integrações por API" dos cartões sejam lidos como enquadramento automático |

Ficaram de fora do site, de propósito: os 90% e 100% da C-04, o prazo de 5 dias úteis do reembolso, as metas da
garantia e o calendário dos lembretes. Eles estão só no contrato e na proposta.

## H. Pull request

A PR #17 recebeu novos commits:
- `195f2ce`: decisões, código, testes e textos.
- Um commit seguinte com este relatório e a evidência.

A descrição da PR foi atualizada com os resultados. Não houve merge, deploy, alteração externa ou nova PR.

## Recomendação

| Dimensão | Status |
|---|---|
| Técnico | **GO**. Regras e documentos coerentes; 282 testes; 9 homologações; portão bloqueando |
| Jurídico | **NO-GO**. C-04 crítico; C-07, C-11, OPS-11, LIC-02, JUR-05 e JUR-01 abertos |
| Contratação | **NO-GO**. Quadro §D |
| Publicação | **NO-GO**. PUB-17 (9 trechos), PUB-19, PUB-13 e os itens da GOLIVE-001 |

**GO para a revisão da titular da PR #17. NO-GO para contratar e para publicar** até o parecer e as aprovações.

**Decisões que ainda cabem à titular:**
- Prazo de transferência dos entregáveis após a quitação (cl. 10.5).
- Lacunas do regulamento §5.5 (verificabilidade das horas).
- Datas da campanha.
- As 4 escolhas do agente listadas no §B.
- PUB-17 com os 9 trechos.
- LIC-01.
