# Proposta-modelo — Nekkora Delivery

> **MODELO NÃO APROVADO. Não é parecer jurídico. Não autoriza contratação.** Atualizado na
> [NEKKORA-COM-CONTRACT-001](../release/NEKKORA-COM-CONTRACT-001.md) (06/11/2026) com as **decisões definitivas da
> titular C-01 a C-12** e, na [R1](../release/NEKKORA-COM-CONTRACT-001-R1.md), com as decisões complementares
> (C-03, C-04, C-06, C-07, C-10, C-11), que substituem as propostas de correção da LEGAL-BASE-001 (histórico em
> [`condicoes-comerciais-minuta.md` §10](condicoes-comerciais-minuta.md)). As cláusulas estão no
> [contrato-base](contrato-base-delivery.md); esta proposta só traz o que muda por cliente e por automação. Uso só após
> a aprovação das condições (PUB-19), a revisão por advogado(a) (pendente) e as pendências do
> [checklist](../release/NEKKORA-COM-CONTRACT-001.md) §6. Os campos `{{…}}` são preenchidos em cada proposta. Nenhum dado
> real de cliente deve ser versionado neste repositório.
>
> **[COM-VITRINE-001](../release/COM-VITRINE-001.md) (etapa 6, 11/11/2026), MODELO NÃO APROVADO:** tabela conforme a data da solicitação (V-02),
> pacotes de três (§2-A, cláusula 6-A), pagamento por pacote (§4) e cancelamento parcial (§5, cláusula 9-A). As
> decisões **DP-01 a DP-05** estão em aberto ([COM-VITRINE-001 §10.5](../release/COM-VITRINE-001.md)).

---

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| Fornecedor | NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA · CNPJ 68.337.624/0001-32 · Rua Pais Leme, 215, Conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150 · contato@nekkora.com |
| Cliente | `{{razão social ou nome}}` · `{{CNPJ/CPF}}` · `{{representante e e-mail}}` |
| **Natureza da relação** (C-01) | ☐ Contrato-base (padrão, compatível com o CDC) · ☐ Contrato-base **+ Anexo B2B**, com a justificativa: `{{os quatro itens do Anexo B2B §1}}`. **Ter CNPJ não basta. Na dúvida, só o contrato-base** |
| Número e data de emissão | `{{NK-AAAA-NNN}}` · `{{DD/MM/AAAA}}` |
| **Data da solicitação** (C-10) | `{{data e hora de recebimento, Brasília}}` · canal `{{e-mail / Bookings / LinkedIn}}` · referência `{{…}}` |
| **Tabela aplicável** (V-02) | Data de início das novas condições: `{{DD/MM/AAAA}}` · ☐ solicitação **anterior** (tabela anterior, regulamento §2–§3) ☐ solicitação **a partir** dela (tabela nova, regulamento §7) · Condição mais favorável **proposta** (equivalência de escopo e modalidade): ☐ não se aplica ☐ oferecida: `{{condição anterior → condição oferecida}}` (só vale se o cliente aceitar) |
| **Validade** (C-10) | Aceite até `{{DD/MM/AAAA}}` (**7 dias corridos** da emissão, na campanha) |

## 2. Automações (uma seção por automação — C-08, C-12)

| Campo | Conteúdo |
|---|---|
| Automação | `{{nome}}` |
| Categoria e justificativa | ☐ Simples ☐ Média ☐ Avaliação individual (fora das categorias) · **esforço técnico estimado: `{{N}}` horas** (referência: simples até 8 h; média acima de 8 até 16 h — o enquadramento depende também dos demais critérios) · fatos observados por critério complementar (regulamento §5) `{{…}}` · *Só solicitação anterior à data de início:* ☐ Complexa (acima de 16 h ou risco excepcional justificado) `{{…}}` |
| Descrição do processo e resultado esperado | `{{…}}` |
| Sistemas e integrações | `{{…}}` |
| Fora do escopo | `{{…}}` · sustentação, monitoramento, hospedagem, novas funcionalidades e alocação de profissionais não estão incluídos |
| Dependências e responsabilidades do cliente | `{{acessos, credenciais, ambiente, equipe para homologar}}` |
| **Critérios de aceite** | `{{lista objetiva e verificável}}` |
| Preço | `{{R$}}` · ☐ individual (tabela nova) ☐ no **pacote nº `{{n}}`** (valor de referência `{{R$}}`, cl. 6-A.4) ☐ avaliação individual · *Solicitação anterior:* ☐ lançamento ☐ padrão ☐ orçamento individual |
| **Início previsto** | `{{DD/MM/AAAA}}` — definido para esta automação conforme a fila operacional, nunca antes da assinatura (C-02, C-12) |
| **Disponibilização para homologação prevista** | `{{DD/MM/AAAA}}` |

Total: `{{R$}}` (automações individuais + pacotes; avaliações individuais à parte). Cada automação continua com
escopo, homologação e aceite próprios, também dentro do pacote.

## 2-A. Pacotes (COM-VITRINE-001, V-03 — cláusula 6-A)

| Pacote | Categoria | Automações (3, mesma categoria) | Preço do pacote | Três individuais | Economia |
|---|---|---|---:|---:|---:|
| `{{nº}}` | ☐ Simples ☐ Média | `{{A}}` · `{{B}}` · `{{C}}` | `{{R$}}` | `{{R$}}` | `{{R$}}` |

Com 4 ou 5 automações da mesma categoria: um pacote e as demais individuais; com 6, dois pacotes. Pacote misto só com
condição particular escrita nesta proposta.

## 3. Despesas externas (C-08)

| Item | Quem contrata e paga | Custo estimado | Quando |
|---|---|---|---|
| `{{licença / API / infraestrutura}}` | ☐ Cliente, direto ao fornecedor (preferencial) ☐ Nekkora, com reembolso | `{{R$}}` | Depois do início do desenvolvimento |

**Custo externo não previsto aqui não é cobrado sem nova aprovação escrita.**

## 4. Pagamento (C-05, C-11)

| Parcela | Valor | Vencimento |
|---|---|---|
| 1ª — 50% | `{{R$}}` | 5 dias úteis da cobrança enviada após o aceite: `{{DD/MM/AAAA}}` |
| 2ª — 50% | `{{R$}}` | 5 dias úteis da cobrança enviada **após o aceite formal** (o silêncio não a torna exigível) |

**Pacote (cláusula 6-A.3):** 1ª parcela = metade do valor do pacote (`{{R$}}`), após o aceite desta proposta. 2ª parcela ⚖ **[!]
DP-01**: ☐ (a) a outra metade do valor do pacote após o aceite da última automação · ☐ (b) um sexto do valor do pacote
após o aceite de cada automação (`{{R$}}` cada). Automações individuais: tabela acima, por automação.

Pix para a conta da empresa. Atraso: lembretes e negociação antes de encargos; multa de 2% e juros simples de 1% ao
mês pro rata die, limitados ao máximo legal, sem capitalização; sem cancelamento automático (contrato-base cl. 15).

## 5. Como funciona, em resumo (cláusulas do contrato-base)

| Tema | Regra | Cláusula |
|---|---|---|
| Início e arrependimento | Não há espera fixa depois da assinatura: o desenvolvimento começa na data de início prevista nesta proposta, conforme a fila. Seu direito legal de arrependimento é preservado: escreva para contato@nekkora.com ou responda a este e-mail; confirmaremos o recebimento imediatamente | 3 |
| Desistência antes da conclusão | **Reembolso integral** do que você pagou à Nekkora pelo desenvolvimento, mesmo com o trabalho iniciado, em até 5 dias úteis do pedido, com comprovante (no arrependimento legal, de imediato). Despesas que você pagou direto a terceiros não passam pela Nekkora | 9 |
| Desistência durante a homologação ⚖ | Só depois de a automação concluída ser **disponibilizada formalmente** para sua validação, com a data registrada, e antes do seu aceite formal; a conclusão interna da Nekkora não basta. Você recebe as evidências e tem 10 dias úteis para contestar. Devolvemos **50% do que você pagou** à Nekkora pelo desenvolvimento e retemos os outros 50% (ex.: preço de R$ 2.000 com entrada de R$ 1.000 → devolução de R$ 500). A base é o valor pago, não o preço total, e não há cobrança adicional. A desistência encerra a contratação desta automação, sem entrega definitiva nem transferência do software; sem desistência, você pode concluir normalmente com homologação, aceite e pagamento integral. Não vale para defeito, descumprimento da Nekkora ou arrependimento legal. Sujeito a revisão jurídica | 10 |
| Desistência de automação do pacote (V-03) ⚖ | Sem penalidade nem retenção automática. Antes da disponibilização para homologação: reembolso integral do que foi pago atribuível a ela (valor de referência, cl. 6-A.4). As demais continuam pelo valor do pacote, sem recálculo (DP-03). A retenção da cláusula 10 não se aplica ao pacote; durante a homologação, regra pendente (DP-04), até lá a mais favorável a você | 9-A |
| Homologação | 10 dias úteis; lembretes no 5º e no 9º dia útil; sem resposta, suspensão no dia útil seguinte e, 30 dias depois, pedido de reprogramação (sem cancelamento automático); defeitos corrigidos sem limite de rodadas; até 2 rodadas de ajustes de preferência; **sem aceite tácito** | 8 |
| Entrega definitiva | Após o aceite e a quitação: código específico, documentação, Anexo de Componentes e termo de garantia | 12 |
| Garantia | Garantias legais + **30 dias** de cobertura corretiva adicional, no termo de garantia; recebimento confirmado em até 2 dias úteis e diagnóstico inicial em até 5 dias úteis | 13 |
| Propriedade intelectual | "A automação é sua": código específico seu após a quitação integral; componentes da Nekkora licenciados para operar e manter; terceiros nas condições de cada licença; pode contratar outro desenvolvedor. No pacote: DP-05 | 14 e Anexo de Componentes |
| Mudança de prazo | Só com motivo, comunicação e concordância por escrito | 5.4 |

| Ordem dos documentos | Norma obrigatória; condições particulares desta proposta que indiquem a cláusula alterada; Anexo B2B, se aplicável; contrato-base; na dúvida, a interpretação mais favorável a você | Preâmbulo |

## 6. Anexos

Contrato-base · Anexo de Componentes (preenchido) · Termo de garantia (na entrega) · Anexo B2B (só se marcado no §1).

## 7. Aceite

O aceite se dá por `{{assinatura eletrônica / resposta escrita}}` ⚖ **[!]**, com a declaração: "Li e aceito a proposta
`{{número}}` e o contrato-base `{{versão}}`, inclusive as regras de pagamento, homologação, desistência, garantia e
propriedade intelectual."
