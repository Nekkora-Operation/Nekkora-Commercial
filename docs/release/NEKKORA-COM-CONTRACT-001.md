# NEKKORA-COM-CONTRACT-001 — Consolidação das condições comerciais C-01 a C-12

**Data:** 06/11/2026 · **Base:** `main` em `01c7f6d` · **Branch:** `docs/contract-001`

> **Atualizado pela [R1](NEKKORA-COM-CONTRACT-001-R1.md).** A titular decidiu C-03 (5 dias úteis), C-04 (por
> enquadramento: consumidor até 90% com reserva prévia de 10%; B2B até 100%), C-06 (lembretes no 5º e 9º dia útil),
> C-07 (metas de atendimento), C-10 (critérios por horas) e C-11 (atualização monetária). Onde este relatório e a R1
> divergirem — em especial as Alternativas A/B da C-04 e os itens "Exige decisão adicional" do §6 —, **vale a R1**.
> O texto abaixo fica como registro da CONTRACT-001.

> **Pronto para revisão ≠ pronto para contratar ≠ autorizado para publicar.** Esta missão consolida as **decisões
> empresariais definitivas da titular** em minutas e textos propostos. **Não é parecer jurídico.** A revisão por
> advogado(a) continua **pendente**, nenhuma aprovação foi marcada e `publicacao.json` **não** foi alterado:
> `condicoesComerciais`, `textosComerciais`, `avisoDePrivacidade` e `publicacao` continuam `false`, e
> `avisoHomologacao` continua `true`. O portão continua bloqueando (§7).
>
> Legenda: **[D]** diretriz da titular · **[R]** redação proposta pelo agente · **[N]** norma conferida no texto
> oficial · **[I]** interpretação do agente · **⚖** exige parecer jurídico · **[!]** decisão ou evidência pendente.

## 1. O que foi feito

| Entregável | Arquivo |
|---|---|
| Contrato-base compatível com o CDC | [`docs/comercial/contrato-base-delivery.md`](../comercial/contrato-base-delivery.md) |
| Proposta Delivery (reescrita sobre o contrato-base) | [`docs/comercial/proposta-modelo-delivery.md`](../comercial/proposta-modelo-delivery.md) |
| Anexo B2B | [`docs/comercial/anexo-b2b-delivery.md`](../comercial/anexo-b2b-delivery.md) |
| Termo de garantia contratual | [`docs/comercial/termo-garantia-delivery.md`](../comercial/termo-garantia-delivery.md) |
| Anexo de Componentes e propriedade intelectual | [`docs/comercial/anexo-componentes-delivery.md`](../comercial/anexo-componentes-delivery.md) |
| Regulamento da campanha | [`docs/comercial/regulamento-campanha-lancamento.md`](../comercial/regulamento-campanha-lancamento.md) |
| Procedimento operacional (cancelamento, homologação, cobrança, entrega) | [`docs/comercial/procedimento-operacional-delivery.md`](../comercial/procedimento-operacional-delivery.md) |
| Histórico e supersessão das decisões anteriores | [`condicoes-comerciais-minuta.md`](../comercial/condicoes-comerciais-minuta.md) (banner, linhas "Supersedido" e §10) |
| Regras executáveis | [`scripts/comercial/regras-delivery.mjs`](../../scripts/comercial/regras-delivery.mjs) |
| Testes dos 14 cenários + coerência dos textos | [`scripts/testes/condicoes-delivery.test.mjs`](../../scripts/testes/condicoes-delivery.test.mjs) (16 testes) |
| Homologação em navegador | `scripts/homologacao.mjs`: nova verificação `campanha-regras-completas` |
| Textos públicos (pendentes de PUB-17) | `src/content.ts`, `src/sections/Pricing.tsx`, `src/styles.css`; export `docs/com-001/05-texto-comercial.md` |
| Rastreabilidade | `docs/com-001/03-matriz-alegacoes.md` (CO-04, CO-08, CO-09, CO-10, PR-07, PR-09, D-02, X-09); `COM-RELEASE-PENDENCIAS.md` (PUB-19, JUR-01 a 05, OPS-04, OPS-11, LIC-01, LIC-02, COM-10, §2d) |

Não foram alterados: preços e motor de preços (`src/precos.ts`), datas da campanha, `publicacao.json`, portão
(`scripts/verificar-publicacao.mjs`), licença do Framework, AWS, DNS, Cloudflare, Microsoft 365.

## 2. Matriz C-01 a C-12 (entregável A)

| ID | Escolha da titular [D] | Implementação | Documentos | Testes | Fundamento | Risco residual | Revisão jurídica |
|---|---|---|---|---|---|---|---|
| C-01 | Contrato-base CDC; anexo B2B só com justificativa; CNPJ não basta | Cl. 1; anexo com 4 critérios cumulativos; "na dúvida, não usar" | Contrato-base, Anexo B2B, proposta §1 | 14 (texto B2B) | [N] CDC 2º, 29, 51 I; CC 421-A | Baixo; critério do anexo é interpretação | Pendente ⚖ (critérios) |
| C-02 | Espera de 7 dias; sem início antecipado; arrependimento integral; canal e confirmação imediata | Cl. 3; proposta e site ("começa depois de 7 dias"); cronograma rejeita início antes do 8º dia | Contrato-base, proposta, procedimento, site | 1, 1b | [N] CDC 49; Decreto 7.962 art. 5º | **Médio**: termo inicial "recebimento do serviço"; confirmação imediata sem mecanismo (OPS-11) | Pendente ⚖ |
| C-03 | Reembolso integral do pago pelo desenvolvimento até a conclusão, mesmo iniciado | Cl. 9; marcos de cancelamento **removidos**; site anuncia | Contrato-base, proposta, site | 2 | Política mais favorável que a lei | Baixo jurídico; risco **comercial** assumido pela titular | Pendente (redação) |
| C-04 | Até 100% após conclusão comprovada e disponibilização; não é multa | Cl. 10 com **Alternativas A e B**; evidências (cl. 7.2) e contestação de 10 dias úteis; **não** anunciado no site | Contrato-base, procedimento §5 | 3 | [N] CDC 20, 51 II e IV §1º; [I] CC 623 (B2B) | **Alto** em consumo (§4) | **Crítico ⚖** |
| C-05 | Sequência de 6 etapas; 50% + 50%; entrega após quitação sem impedir verificação | Cl. 6, 7, 12 | Contrato-base, proposta | 3, 4, 12 | [N] CC 476 (LEGAL-BASE); CDC 26 §1º | Baixo | Pendente |
| C-06 | 10 dias úteis; 2 lembretes; suspensão; sem aceite tácito; defeitos sem limite; 2 rodadas de preferência | Cl. 8; status "Homologação suspensa — aguardando cliente"; site explicita | Contrato-base, procedimento §3, site | 4, 5 | [N] CDC 20, 39 XII | Baixo; [!] intervalo dos lembretes e prazo máximo de suspensão | Pendente |
| C-07 | 30 dias adicionais em termo escrito; não anunciar 120 dias; sem exclusão genérica | Termo de garantia; site: "Garantia contratual [...] em termo escrito" (sem prazo) | Termo, contrato-base cl. 13, site | 6 | [N] CDC 26, 50 | **Médio**: termo inicial (opção a × b) | Pendente ⚖ |
| C-08 | Escopo fechado; aditivo antes; correção não cobrada; custos externos discriminados | Cl. 4; proposta §3 | Contrato-base, proposta | 5, 8 | [N] CDC 39 VI, 40 §3º | Baixo | Pendente |
| C-09 | Modelo A-R; exclusividade do código; trabalhos independentes; Anexo de Componentes; Framework sem licença pública | Anexo de Componentes; licença contratual independente do repositório | Anexo, contrato-base cl. 14 | 7 | [N] Lei 9.609 art. 4º | **Médio**: LIC-02 (titularidade) | Pendente ⚖ |
| C-10 | Preços aprovados; 2 meses da publicação; datas pendentes; proposta após o fim mantém o preço; validade 7 dias; critérios objetivos | Regulamento; **regras completas no site**; regras executáveis | Regulamento, site, proposta | 9, 10, 11; homologação | [N] CDC 30, 31, 40 §1º; Decreto 7.962 art. 2º | **Médio**: critérios numéricos [!] (COM-10); datas | Pendente |
| C-11 | Vencimento em 5 dias úteis; multa 2%; juros simples 1% a.m.; lembretes; dispensa; sem cancelamento automático; contestação suspende | Cl. 15 com **teto legal**; calculadora | Contrato-base, procedimento §4 | 12 | [N] Lei 14.905/2024; Decreto 22.626/1933; CC 389, 395, 406 | **Médio**: Usura para cliente não PJ (§4) | Pendente ⚖ |
| C-12 | Datas previstas por automação; 7 dias no cronograma; alteração escrita e acordada; sem reuniões diárias, painel ou portal | Cl. 5; site corrigido ("cada proposta informa as datas"); validação de cronograma | Contrato-base, proposta, site | 1b, 13 | [N] CDC 39 XII, 40 | Baixo | Pendente |

## 3. Textos públicos revisados (entregável C)

**Todos dependem da nova aprovação da titular (PUB-17).** Cada trecho está marcado `CONTRACT-001` em `src/content.ts`.

| Local | Antes (`main`) | Depois (proposto) | Decisão |
|---|---|---|---|
| Preços → Condições comerciais | — | **Novo:** "O desenvolvimento começa depois de 7 dias corridos da assinatura do contrato" | C-02 |
| Preços → Condições comerciais | "Demandas organizadas em fila: o início depende da fila e da aprovação da proposta" | "Demandas organizadas em fila: cada proposta informa as datas previstas de início e de disponibilização para homologação" | C-12 (CDC 39, XII) |
| Preços → Condições comerciais | — | **Novo:** "Se você desistir antes da conclusão do desenvolvimento, devolvemos integralmente o que pagou à Nekkora pelo desenvolvimento" | C-03 |
| Preços → bloco recolhível | — | **Novo:** "Regras da campanha de lançamento" (8 itens), só com datas aprovadas e campanha em vigor | C-10 |
| Como funciona → etapa 5 | "[...] só é concluída com o seu aceite formal." | "[...] só é concluída com o seu aceite formal: o silêncio não vale como aceite." | C-06 |
| Transparência → Definido em proposta | "Correção de defeitos do que foi entregue: prazo e condições, além das garantias legais" | "Garantia contratual de correção de defeitos, em termo escrito, além das garantias legais" | C-07 |
| Transparência → Não incluído | "Suporte, sustentação e garantia adicional após a entrega, salvo se previstos" | "Suporte técnico após a entrega, salvo se previsto em proposta" | C-07 (a garantia deixou de ser "não incluída"; sustentação continua na linha anterior) |

**Mantidos de propósito:** "Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos
previstos em lei" (cobre a C-04 sem anunciá-la); 50% + 50%; licenças à parte; a faixa de lançamento. **Não publicados:**
a cobrança após a conclusão (C-04, pendente de parecer), o prazo dos 30 dias (termo inicial pendente) e qualquer
"120 dias".

**Datas exibidas:** o site continua mostrando o período **histórico** de `publicacao.json` (06/11/2026 a 06/01/2027),
inclusive nas novas regras. As datas não foram alteradas; a titular decide antes de aprovar PUB-17 (GOLIVE-001 §4.2).

## 4. Relatório de conflitos (entregável D)

### 4.1 Lacunas jurídicas reais

| ID | Conflito | Norma | Proposta | Bloqueia |
|---|---|---|---|---|
| **C-04** | Cobrar até 100% **sem aceite formal** em contrato de consumo. A homologação e a correção dos defeitos ainda nela apontados fazem parte do serviço; cobrar integralmente quando parte não foi executada pode ser "desvantagem exagerada". A conclusão é afirmada pela própria Nekkora | [N] CDC 51, IV e §1º; 51, II; 20. [I] CC 623 favorece a cobrança só fora do CDC | **A** (diretriz) com salvaguardas: evidências objetivas (cl. 7.2), desistência expressa, contestação de 10 dias úteis que suspende a cobrança, defeito pendente reverte para a C-03, entrega e garantia após o pagamento. **B** (conservadora, recomendada para consumidor até o parecer): preço menos o valor da etapa de homologação assistida e entrega, fixado na proposta; A só no Anexo B2B | 1ª contratação |
| **C-02** | O art. 49 conta 7 dias "da assinatura **ou do ato de recebimento do produto ou serviço**". Se o termo para serviço for o recebimento, o consumidor poderia arrepender-se **depois** da conclusão, o que colidiria com a C-04 | [N] CDC 49 | Contrato não fixa termo final diferente do legal; C-04 não se aplica com arrependimento em curso (cl. 10.1 d). A C-03 já cobre tudo antes da conclusão | 1ª contratação (parecer) |
| **C-02** | Confirmação **imediata** do pedido de arrependimento | [N] Decreto 7.962, art. 5º, §4º | Rotina ou resposta automática — **OPS-11** (M365 não alterado) | 1ª contratação |
| **C-02/C-03** | A C-03 devolve o pago "pelo desenvolvimento"; o arrependimento devolve o pago "a qualquer título" e rescinde contratos acessórios | [N] CDC 49 p.ú.; Decreto 7.962, art. 5º, §2º | Cl. 3.4 devolve tudo no arrependimento; licenças externas só depois do 8º dia | Não (resolvido na redação) |
| **C-11** | Para cliente **que não é pessoa jurídica**, o Decreto 22.626/1933 veda juros acima do **dobro da taxa legal**; desde a Lei 14.905/2024, a taxa legal é Selic − IPCA (mínimo 0). 1% a.m. (12% a.a.) **pode exceder** esse teto quando a taxa real for menor que 6% a.a. Entre pessoas jurídicas, a Usura não se aplica | [N] Decreto 22.626, art. 1º e 4º; Lei 14.905/2024, art. 3º, I; CC 406, §1º a §3º (texto da Lei 14.905) | Redação "limitados ao máximo permitido em lei para a relação"; calculadora aceita teto; ⚖ confirmar se o teto alcança juros moratórios e a fórmula | 1ª contratação com pessoa física |
| **C-11** | Atualização monetária: a lei a inclui nas consequências da mora (IPCA na falta de índice); a diretriz não a menciona | [N] CC 389 p.ú., 395 | **[!]** Titular decide aplicar ou dispensar | Não |
| **C-07** | 30 dias contados da entrega cabem **dentro** dos 90 dias legais do consumidor e não acrescentam nada; vício oculto tem prazo legal móvel | [N] CDC 26 II, §1º, §3º; 50 | Opção (a): contar do fim do prazo legal; ⚖ enquadramento como serviço durável | 1ª contratação |
| **C-09** | O `LICENSE` público do Framework não concede uso; o titular indicado é "Nekkora" (marca), não a LTDA | Lei 9.609 | Licença contratual ao cliente (Anexo §2, item 3); **LIC-02**: confirmar titularidade ou autorização da LTDA; **LIC-01** separado | 1ª contratação com componente preexistente |
| **C-10** | Critérios de classificação qualitativos não impedem enquadramento arbitrário de uma oferta vinculante | [N] CDC 30, 31 | Regra "categoria mais alta indicada por qualquer critério" + fato registrado por critério; limites numéricos **[!] COM-10** | 1ª proposta da campanha |

### 4.2 Problemas editoriais (corrigidos)

| Onde | Problema | Correção |
|---|---|---|
| Site, Transparência | "Garantia adicional" listada como "não incluída", contra a C-07 | Garantia contratual em "Definido em proposta"; suporte técnico em "Não incluído" |
| Site, Condições | "o início depende da fila" (risco CDC 39, XII) | Datas previstas em cada proposta |
| Proposta-modelo | Início antecipado "salvo pedido do cliente"; cancelamento por marcos; "garantia contratual: opção a escolher" | Removidos ou substituídos conforme C-02, C-03, C-07 |
| Minuta antiga | Retenção dos 50%, apuração proporcional, Modelo A | Marcados "Supersedido (CONTRACT-001)", sem apagar o histórico |
| Minuta antiga §8 | Datas da campanha como se aprovadas | Marcadas como histórico |

### 4.3 Fontes desta missão

Conferidas em 06/11/2026 nos textos do Planalto (`www.planalto.gov.br`): **Lei 14.905/2024** (arts. 2º, 3º e 5º, verbatim);
**Decreto 22.626/1933** (arts. 1º, 4º e 5º; "revigorado pelo Decreto de 29/11/1991"); **CDC** arts. 26, 49, 50, 51 (II,
IV, §1º); **Decreto 7.962/2013** art. 5º. **Código Civil** arts. 389, 395 e 406 conferidos pelo texto da Lei 14.905;
arts. 132, 397, 408, 411 a 413 só por resumo da página (**[!] conferir verbatim**); arts. 476, 603, 623 e 421-A, pela
LEGAL-BASE-001 (05/11/2026). Nenhuma jurisprudência foi usada.

## 5. Bloqueios preservados

`publicacao.json` intacto. Portão: **PUBLICAÇÃO BLOQUEADA** — PUB-19, PUB-17, PUB-09, PUB-18, PUB-10 (§7). O teste 14
falha se qualquer aprovação virar `true`, se as datas históricas mudarem ou se o portão deixar de exigir esses IDs.

## 6. Checklist para a titular (entregável F)

**Pronto para revisão**
- [ ] Contrato-base, proposta-modelo, termo de garantia, Anexo de Componentes, Anexo B2B, regulamento e procedimento.
- [ ] Os 7 trechos de texto público do §3 (aprovar ou pedir ajuste, junto com o restante de PUB-17).
- [ ] Regras executáveis e cenários (`scripts/comercial/regras-delivery.mjs`).

**Exige decisão adicional da titular**
- [ ] C-04: Alternativa A ou B (e, na B, o valor da etapa de homologação e entrega).
- [ ] C-06: intervalo entre os lembretes (proposta: 5 dias úteis) e prazo máximo da suspensão.
- [ ] C-03: prazo de devolução do reembolso (proposta: 5 dias úteis).
- [ ] C-07: termo inicial dos 30 dias (após o parecer) e prazo estimado de correção na garantia.
- [ ] C-10: datas da campanha (PUB-13) e limites numéricos dos critérios (COM-10).
- [ ] C-11: atualização monetária (aplicar ou dispensar).
- [ ] LIC-01: licenciamento público do Framework (separado).

**Exige revisão jurídica ⚖**
- [ ] C-04 (crítico), C-02 (termo inicial para serviço; contratos acessórios), C-07 (termo inicial; serviço durável),
      C-11 (Usura e taxa legal), C-09/LIC-02 (titularidade), C-01 (critérios B2B), forma do aceite, foro, cláusula de
      dados (cl. 16).

**Impede a primeira contratação**
- [ ] Parecer jurídico sobre os itens acima e aprovação PUB-19 sobre a redação final.
- [ ] Decisão C-04; OPS-11 (confirmação imediata); LIC-02 (se houver componente preexistente); COM-10 (na campanha).
- [ ] Cláusula de dados do cliente (JUR-05) se a automação envolver dados pessoais.
- [ ] Forma do aceite e assinatura; nota fiscal (JUR-01).

**Impede o lançamento público do Commercial**
- [ ] PUB-17: nova aprovação dos textos, **incluindo os do §3** e as datas (decidir datas antes de aprovar).
- [ ] PUB-19: aprovação das condições exibidas no site.
- [ ] Demais itens de NEKKORA-COM-GOLIVE-001 (PUB-09, PUB-18, PUB-10, LOG-01, JUR-07, CTL-05, OPS-02).

## 7. Verificações executadas (entregável E)

| Comando | Resultado |
|---|---|
| `node --test scripts/testes/condicoes-delivery.test.mjs` | **16/16** |
| Controle negativo: os mesmos testes com o `src/content.ts` da `main` | **3 falhas esperadas** (cenários 10, 13 e coerência dos textos); arquivo restaurado |
| `npm run check` (typecheck, `npm test`, build, `verificar:precos`, `aws:config:verificar`) | **ok** — 252 testes, 0 falha; preços 5/5; CSP do build = política versionada (nenhum script inline novo) |
| `node scripts/verificar-publicacao.mjs --dist dist` | **PUBLICAÇÃO BLOQUEADA** — PUB-19, PUB-17, PUB-09, PUB-18, PUB-10 (+ BUILD antes do commit) |
| `NEKKORA_DATA={2026-11-05, 2026-11-15, 2027-01-07} NEKKORA_NAVEGADOR={chromium, firefox, webkit} node scripts/homologacao.mjs http://127.0.0.1:4173/` (CloudFront local) | **9 execuções, 94 verificações cada, 0 falha**; `campanha-regras-completas` OK (regras presentes em 15/11; ausentes em 05/11 e 07/01); axe sem pendências |
| `node scripts/exportar-texto.mjs` | `05-texto-comercial.md` regenerado com os textos novos |

## 8. Status e recomendação

| Dimensão | Status |
|---|---|
| Técnico | Verde: testes, build, CSP, homologação em 3 navegadores; portão bloqueando |
| Documental | Completo para revisão; histórico preservado; rastreabilidade atualizada |
| Jurídico | **Pendente**: C-04 crítico; C-02, C-07, C-09, C-11 com parecer necessário |
| Titular | 7 decisões (§6) + PUB-17 com os textos novos |

**Recomendação: GO para a etapa de revisão da titular; NO-GO para contratar e para publicar.** A redação está coerente
com as doze diretrizes, as contradições do site foram corrigidas e os conflitos com norma estão isolados em
alternativas ou pendências explícitas. Contratar exige o parecer e as decisões do §6; publicar exige, além de PUB-17 e
PUB-19, os itens da GOLIVE-001.
