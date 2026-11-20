# NEKKORA-COM-ECOSYSTEM-001 — Reestruturação da estratégia comercial (Commercial v1.2.0)

> **Situação:** implementação local em homologação, **sem aprovação**. Nenhum merge, deploy ou alteração em produção
> autorizados. A v1.1.0 continua em produção. Tudo o que está marcado como **PROPOSTA** depende de decisão da titular.

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

## 4. Condições comerciais propostas (PUB-19)

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
integral, homologação e garantia. O regulamento da campanha ganhou uma nota de transição (proposta) e uma linha para o
novo WhatsApp no §4, **sem apagar nada**.

## 5. Privacidade proposta (PUB-09)

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

## 7. Pontos de decisão da titular

Resolvidos em 20/11/2026: estados de Monitor e Hosting (`sob-avaliacao`), franquia mínima (não há), "a partir de" no
AI Piloto (valor maior apresentado para aprovação antes de qualquer compromisso), limites do simulador (provisórios,
só de simulação), resumo da simulação no formulário (desmarcado por padrão) e titularidade das automações do AI Piloto
(proposta contratual específica).

Continuam pendentes:

1. **Hosting:** critério definitivo de cobrança (fração e arredondamento das horas) e licenciamento Windows,
   formalizados antes da contratação.
2. **Vigência:** data de `ecossistema.inicio`, gravada quando a publicação for autorizada.
3. **Registro de canais:** `$origem.canais` com o novo número (redigido como PROPOSTA, para confirmação).
4. **Aprovação dos conteúdos:** PUB-14, PUB-17, PUB-19 e revisão da PUB-09, com as impressões calculadas em Linux;
   depois, PUB-18 da 1.2.0 pelo processo H/C.
5. **Regulamento:** nota de transição e linha do novo número no §4 (PROPOSTA).
6. **Variável `DOMINIO_PUBLICO`** do workflow de deploy (pendência anterior, fora desta missão).
