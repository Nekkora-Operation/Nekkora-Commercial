# NEKKORA-COM-ECOSYSTEM-001 — Reestruturação da estratégia comercial (Commercial v1.2.0)

> **Situação (20/11/2026):** conteúdos aprovados pela titular e registrados em `publicacao.json` (PUB-14, PUB-17,
> PUB-19, PUB-09 e canais; §6a). Continuam pendentes a vigência (`ecossistema.inicio`, Dia D planejado para
> 24/11/2026, §8) e a PUB-18 da 1.2.0 (H/C). Nenhum merge, deploy ou alteração em produção autorizados. A v1.1.0
> continua em produção.

## 1. Decisão da titular (20/11/2026)

- Três produtos comerciais independentes: **Nekkora AI — Piloto**, **Nekkora Monitor** e **Nekkora Hosting**. O
  Nekkora AI já funciona em modalidade piloto.
- O **Nekkora Delivery deixa de existir** como produto comercial independente. A criação de automações passa ao AI
  Piloto.
- **Preços** informados pela titular:
  - AI Piloto: a partir de R$ 100 por automação;
  - Monitor: R$ 75 por automação, com cobrança mensal como proposta;
  - Hosting: R$ 25 por hora-máquina Windows e R$ 12 por hora-máquina Linux.
- **Sem descontos** de pacote sem aprovação específica.
- **Novo WhatsApp oficial:** `5511930597466` (+55 (11) 93059-7466).
- **Formulário de atendimento** simplificado. Ele só prepara a mensagem e abre o WhatsApp, sem envio automático.
- A NEKKORA-COM-CANAIS-001 (v1.1.1) **não é publicada separadamente** com o modelo comercial antigo.

**Confirmação da titular (20/11/2026).** A titular confirmou:

- **AI Piloto:** a partir de R$ 100 por automação, sem mensalidade obrigatória.
- **Monitor:** R$ 75 mensais por automação monitorada.
- **Hosting:** Windows R$ 25 e Linux R$ 12 por hora-máquina.
- **Produtos independentes**, solicitados individualmente ou em conjunto.
- **Sem descontos nem franquias mínimas** nesta etapa da comunicação comercial.
- **Hosting:** o critério definitivo de cobrança será formalizado posteriormente.

**Objetivo desta fase:** captação de clientes, com o AI Piloto como porta de entrada acessível para o ecossistema.

**Atendimento:** assistido pelo WhatsApp, com avaliação das necessidades, esclarecimento de dúvidas e encaminhamento
comercial.

**Fora do escopo desta missão:** o autoatendimento na Nekkora Platform (solicitar, contratar, acompanhar e gerenciar),
previsto para o futuro. A Commercial não implementa checkout, pagamento, contratação automática nem novos mecanismos
de autenticação.

As autorizações de homologação, merge e publicação continuam separadas. Esta confirmação não substitui os registros
de PUB-13, PUB-14, PUB-17, PUB-19, PUB-09 e PUB-18.

**Decisões complementares e autorização técnica da titular (20/11/2026).** A titular aprovou a implementação local e
autorizou commit, push e CI completa na PR #22, mantida em rascunho. **Merge e deploy não autorizados.** Decidiu
também:

- **AI Piloto:** a partir de R$ 100 por automação. Quando o processo exigir investimento maior, o valor é apresentado
  para aprovação do cliente antes de qualquer compromisso.
- **Monitor e Hosting:** disponibilidade sob avaliação (`sob-avaliacao`), sem promessa de ativação imediata.
- **Sem desconto automático** por combinação; os produtos são independentes e podem compor uma solução conjunta.
- **Propriedade e direitos** sobre as automações do AI Piloto exigem proposta contratual específica. O modelo do
  antigo Delivery não é herdado automaticamente.
- **Limites do simulador** (50 automações por serviço, 744 horas por sistema): provisórios e exclusivamente de
  simulação.
- **Resumo da simulação no formulário:** desmarcado por padrão.
- **Canais ativos:** todos com o novo WhatsApp `5511930597466`. Microsoft Bookings, envio automático e contato
  comercial por e-mail continuam fora.

Nenhuma dessas condições autoriza contratação automática, checkout ou cobrança. As novas impressões não são
registradas como aprovadas; a vigência própria da v1.2.0 (`ecossistema.inicio`) depende de aprovação antes do deploy.

## 2. Continuidade da PR #22

A v1.2.0 continua na branch `feat/com-canais-001`, sobre os commits `dab3bee` e `34ae140` da NEKKORA-COM-CANAIS-001.
Esses commits têm as aprovações de 13/11/2026: canais, "Entrar" e o aviso de privacidade aprovado editorialmente.

- A PR #22 (rascunho) passa a contemplar as duas missões, mantendo a rastreabilidade.
- As aprovações de 13/11/2026 continuam registradas como histórico.
- Valem só para o conteúdo daquela data: as impressões PUB-17 `42c05a01…` e PUB-19 `be30f084…` **não se aplicam** à
  v1.2.0.

## 3. O que mudou na página

| Área | Antes (v1.1.0 / v1.1.1) | v1.2.0 (proposta) |
|---|---|---|
| Narrativa | "Automação sob medida" (Delivery e Hosting) | **Crie. Monitore. Execute.** — "Sua operação automatizada, do início à execução." |
| Produtos | Delivery, Hosting, Monitor e AI "em preparação" | AI (Piloto), Monitor e Hosting, cada um com o estado real gravado pela titular (`servicos`, PUB-23) |
| Preços | Simples e média, individual e pacote de 3, economia | AI a partir de R$ 100; Monitor R$ 75/mês; Hosting R$ 25 (Windows) e R$ 12 (Linux) por hora-máquina; sem pacote nem desconto |
| Campanha | Faixa e regras da campanha de lançamento | Fora da página; o regulamento fica como histórico e compromisso |
| Simulador | Categorias com pacotes e botão "Calcular" | 4 campos começando em zero, estimativa ao vivo, cobranças separadas (inicial, mensal, por hora) e combinado que não é mensalidade |
| Atendimento | Links diretos ao WhatsApp | Formulário (nome, empresa, e-mail, descrição, serviços, simulação opcional) que abre o WhatsApp oficial |
| Botão flutuante | Abria o WhatsApp | Abre o formulário |
| Entrar | `platform.nekkora.com/entrar` | Igual (PUB-16, confirmado em 13/11/2026) |

As tabelas do Delivery saíram de `src/`. Ficam em `scripts/comercial/tabelas-anteriores.mjs` para os compromissos já
assumidos (`regras-delivery.mjs`), e `verificar-precos-artefato.mjs` confere que nenhuma delas chega ao bundle.

## 4. Condições comerciais (PUB-19, aprovadas em 20/11/2026)

Texto exibido no bloco de preços (`src/content.ts`, `PRICING.conditions`):

1. Cada serviço é contratado de forma independente: AI, Monitor e Hosting, em qualquer combinação.
2. Escopo, valores, periodicidade de cobrança e condições de pagamento são definidos em proposta, aprovada pelo
   cliente antes do início.
3. AI em piloto: cada automação é avaliada antes da proposta, sem promessa de conclusão instantânea nem de
   compatibilidade com qualquer processo; se o processo exigir investimento maior que o valor inicial, ele é
   apresentado para aprovação do cliente antes de qualquer compromisso.
4. Propriedade e direitos sobre as automações criadas no Nekkora AI são definidos em proposta contratual específica.
5. Monitor: cobrança mensal por automação monitorada, depois de verificada a compatibilidade técnica.
6. Hosting: cobrança por hora-máquina, sem franquia mínima. O critério de cobrança das horas, o licenciamento Windows e
   a disponibilidade são formalizados antes da contratação.
7. Licenças e serviços de terceiros não estão incluídos, salvo se previstos na proposta.
8. Sem pacotes nem descontos por combinação de serviços.
9. Solicitações recebidas e propostas emitidas antes desta tabela mantêm as condições em que foram feitas.
10. Cancelamento, reembolso e garantia seguem a proposta e o contrato, preservados os direitos previstos em lei.

As regras do Delivery não se aplicam automaticamente ao AI Piloto: 50/50, fila, categorias, pacotes, devolução
integral, homologação e garantia. O regulamento da campanha ganhou uma nota de transição (aprovada editorialmente em
20/11/2026; vigência e publicação dependem das autorizações da release) e uma linha para o novo WhatsApp no §4, **sem
apagar nada**.

## 5. Privacidade (PUB-09, aprovação editorial de 20/11/2026)

O aviso descreve:

- o formulário de preparação da mensagem;
- o processamento local dos dados até a abertura do WhatsApp;
- a escolha do visitante de continuar e enviar;
- a ausência de recebimento automático pela Commercial.

Os direitos dos titulares são exercidos pelo novo WhatsApp oficial ou por `contato@nekkora.com`. Os demais itens
(registros de acesso, retenção, transferência internacional, base legal) não mudaram. Texto integral em
[`05-texto-comercial.md`](../com-001/05-texto-comercial.md), §7a.

## 6. Portão de publicação (governança)

| Item | Situação na v1.2.0 |
|---|---|
| PUB-13 | Nova vigência `ecossistema.inicio` (AAAA-MM-DD) com registro da titular de 20/11/2026 em diante, sem retroatividade. O histórico da PUB-13 anterior (`campanhaLancamento`, `novasCondicoes.inicio = 2026-11-12`) é preservado e continua conferido. |
| PUB-14 | Nova impressão (tabela do ecossistema e limites do simulador); a aprovação de 12/11/2026 (`95a612f7…`) não vale. |
| PUB-17 / PUB-19 | Novas impressões; nenhuma aprovação anterior se aplica. |
| PUB-09 | Revisão específica do aviso; a flag herdada continua `true` e não é reaproveitada como aprovação desta redação. |
| PUB-16 | Preservado: "Entrar" → `https://platform.nekkora.com/entrar`. |
| PUB-18 | Autorização exclusiva da versão 1.2.0, vinculada ao commit homologado H (mecanismo H/C). |
| PUB-23 | AI `piloto`; Monitor e Hosting `sob-avaliacao` ou `em-preparacao`; `disponivel` só com aprovação própria. |
| V-01 | Saiu do portão: a página não exibe mais a tabela do Delivery nem a campanha. Os registros ficam como histórico. |

A ferramenta `scripts/campanha-datas.mjs` passa a recusar a troca das datas da campanha, que agora é histórico.

## 6a. Aprovações registradas (titular, 20/11/2026)

Vinculadas ao conteúdo do commit `82d56853edc7bcece159c9562f99abfc629c7bc3`, CI `44847090712`, impressões conferidas
em Linux:

| Item | Registro em `publicacao.json` | Impressão aprovada |
|---|---|---|
| PUB-14 (tabela) | `tabelaDePrecos.impressao` e `$origem["tabelaDePrecos.impressao"]` | `sha256:a6bc73ae097f9a0e4d7d569b579116c6bcce08441284cf9461a1517021ebdb16` |
| PUB-17 (textos) | `impressoesDeConteudo.textosComerciais` e `$origem` correspondente | `sha256:07e669f44ec6070d615673bf842e0d9e119d2ffc68d1962dc1e1f4fb99a5d90a` |
| PUB-19 (condições) | `impressoesDeConteudo.condicoesComerciais` e `$origem` correspondente | `sha256:1350a234e4a7d87e04841e0203d5219f615b01a688d70946c814e5a4119c1311` |
| PUB-09 (privacidade) | registro acrescentado ao fim de `$origem["aprovacoes.avisoDePrivacidade"]`; o de 11/11/2026 continua intacto | — (aprovação editorial) |
| Canais | `$origem.canais` consolidado, com as decisões anteriores como "Histórico" | — |

- **PUB-19:** não autoriza contratação automática, não define titularidade de código, licenciamento nem entrega de
  documentação e não substitui instrumentos contratuais.
- **PUB-09:** a aprovação editorial não substitui validação jurídica nem comprovação operacional.
- **Uma impressão por registro.** O portão (`registroConfere`) exige que cada registro cite uma única impressão.
  Por isso os registros de PUB-14, PUB-17 e PUB-19 citam só a impressão da v1.2.0. Os registros substituídos estão
  no apêndice A e no histórico Git.
- **Preservados sem mudança:** `campanhaLancamento`, `novasCondicoes.inicio` (2026-11-12),
  `tabelaDePrecos.posCampanha` e os respectivos `$origem`.
- **Fontes das impressões:** este documento e `publicacao.json` não fazem parte delas. As fontes são `src/precos.ts`
  (PUB-14); `src`, `index.html`, `public` e `vite.config.ts` (PUB-17); `src`, o regulamento e a minuta de condições
  (PUB-19).

## 7. Pontos de decisão da titular

Resolvidos em 20/11/2026: estados de Monitor e Hosting (`sob-avaliacao`), franquia mínima (não há), "a partir de" no
AI Piloto (valor maior apresentado para aprovação antes de qualquer compromisso), limites do simulador (provisórios,
só de simulação), resumo da simulação no formulário (desmarcado por padrão) e titularidade das automações do AI Piloto
(proposta contratual específica).

Continuam pendentes:

1. **Hosting:** critério definitivo de cobrança (fração e arredondamento das horas) e licenciamento Windows,
   formalizados antes da contratação.
2. **Vigência:** `ecossistema.inicio`. 24/11/2026 aprovado como data **planejada**, não como vigência autorizada.
   Permanece `null` até a autorização específica no Dia D (§8).
3. **PUB-18 da 1.2.0:** pelo processo H/C, proposta depois da CI de H.
4. **Variável `DOMINIO_PUBLICO`** do workflow de deploy (pendência anterior, fora desta missão).

## 8. Roteiro do Dia D (planejado: terça-feira, 24/11/2026)

O portão só aceita `ecossistema.inicio` que não seja futura e exige a data dentro do commit homologado H. Por isso a
vigência, H, C, merge e deploy acontecem na mesma data. Cada etapa depende de autorização expressa da titular.

**Até 23/11/2026:**
- `ecossistema.inicio` continua `null`;
- a CI dos registros fica verde;
- o preview é homologado com as aprovações gravadas.

**Dia D — conferências antes de criar H:**
1. A data local em Brasília é 24/11/2026: `TZ=America/Sao_Paulo date +%F`.
2. As aprovações estão íntegras:
   - `node scripts/verificar-publicacao.mjs` mostra só PUB-13 e PUB-18 pendentes;
   - as impressões batem com as do §6a.
3. A `main` não mudou desde `80c46a4` (`git fetch && git log origin/main -1`), ou as mudanças foram avaliadas.
4. Há margem para concluir CI de H, autorização, C, CI de C, merge, deploy e verificação no mesmo dia. A CI completa
   leva cerca de 15 minutos.

**Commit H (com nova autorização):** `publicacao.json` recebe só a vigência; ainda **sem** a PUB-18.
- `ecossistema.inicio = "2026-11-24"`;
- `$origem["ecossistema.inicio"]`: "Titular, 24/11/2026 (NEKKORA-COM-ECOSYSTEM-001, PUB-13): vigência da nova
  estratégia comercial a partir de 2026-11-24, data da publicação efetiva, no horário de Brasília. Solicitações
  recebidas antes da entrada no ar seguem as condições anteriores; sem retroatividade."

Depois vem a CI de H, com as três impressões conferidas em Linux e o portão mostrando só a PUB-18 pendente.

**PUB-18:** proposta à titular para autorização expressa, vinculada ao SHA completo de H.

**Commit C:** difere de H só em `publicacaoAutorizada` (`verificar-autorizacao-release.mjs`).
- `{ versao: "1.2.0", commit: <SHA de H> }`;
- registro "Titular, 24/11/2026 … versão 1.2.0 … <SHA de H>".

Depois: CI de C, merge e deploy, cada um com sua autorização. Por fim, a verificação em produção e as evidências.

**Se algo atrasar:** a vigência passa a ser a data da publicação efetiva, nunca anterior. H e C são refeitos com a
nova data e uma nova autorização.

## Apêndice A — registros substituídos em 20/11/2026 (texto integral)

Estes são os registros de `publicacao.json` antes das aprovações de 20/11/2026. Ficam preservados aqui e no histórico
Git (commit `82d5685` e anteriores). As aprovações valem só para o conteúdo da época e não se aplicam à v1.2.0.

### A. `$origem["tabelaDePrecos.impressao"]`

```text
Titular, 12/11/2026 (COM-VITRINE-001, PUB-14, revisão da PR #21, commit cf0e733, CI aprovada e impressões conferidas em Linux): aprovo expressamente a tabela comercial da COM-VITRINE-001 — Nekkora Delivery: automação simples individual R$ 650, pacote de três simples R$ 1.500, automação média individual R$ 1.400, pacote de três médias R$ 3.500; Nekkora Monitor R$ 75 por automação/mês e Nekkora AI R$ 100 por empresa/mês como valores previstos, produtos em preparação e indisponíveis para contratação — impressão sha256:95a612f7b2528cee48fb4b043b4751d8bca66164e6cade01599832d8cc008f35.
```

### A. `$origem["impressoesDeConteudo.textosComerciais"]`

```text
Titular, 12/11/2026 (COM-VITRINE-001, PUB-17): aprovo os textos comerciais da nova vitrine correspondentes ao conteúdo homologado no commit cf0e733 — apresentação dos quatro produtos, preços e pacotes, o diferencial "A automação é sua", critérios comerciais, comunicação da campanha e jornadas de solicitação — impressão sha256:fa69c55dfac65645ef13a5e9387d15b8a94ce4f89d1306aa7504e6a5365d9df5.
```

### A. `$origem["impressoesDeConteudo.condicoesComerciais"]`

```text
Titular, 12/11/2026 (COM-VITRINE-001, PUB-19): aprovo as condições comerciais anunciadas na vitrine e no regulamento, conforme a versão homologada (commit cf0e733), impressão sha256:0b94d467bbad9aab0aee9cd3ff6c7612e42d88ae7b209fe59a4e50d3bf7577c1. Esta aprovação NÃO representa aprovação do contrato-base, anexos, proposta-modelo ou procedimento operacional; as decisões DP-01 a DP-05 e as demais condições contratuais continuam pendentes; não está autorizada a formalização de contratos de pacotes até a resolução dessas pendências.
```

### A. `$origem["canais"]`

```text
Titular, 12/11/2026 (NEKKORA-COM-CANAIS-001): o WhatsApp 5511917724200 passa a ser o único canal público de atendimento comercial; LinkedIn https://www.linkedin.com/company/nekkora mantido e Instagram https://www.instagram.com/nekkora.br/ adicionado, ambos como redes institucionais; formulário, envio por e-mail e Microsoft Bookings saem da página pública; o e-mail contato@nekkora.com continua só para obrigações administrativas, identificação do fornecedor e privacidade (direitos do titular), sem botão comercial. Registro aprovado pela titular em 13/11/2026. Substitui a decisão de 22/10/2026 (COM-RELEASE-003: por enquanto só LinkedIn e e-mail; WhatsApp e Instagram ficam de fora). Titular, 20/11/2026 (NEKKORA-COM-ECOSYSTEM-001, §5 — PROPOSTA de registro pendente de confirmação da titular): novo WhatsApp oficial 5511930597466, exibido como +55 (11) 93059-7466, no lugar de 5511917724200 nos pontos ativos da página; Instagram @nekkora.br e LinkedIn mantidos como redes institucionais; o WhatsApp continua o único canal público promovido para atendimento comercial. O registro de 12/11/2026 acima fica como histórico.
```
