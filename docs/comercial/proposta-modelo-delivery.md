# Proposta-modelo — Nekkora Delivery

> **MODELO NÃO APROVADO. Não é parecer jurídico. Não autoriza contratação.** Atualizado na
> [NEKKORA-COM-CONTRACT-001](../release/NEKKORA-COM-CONTRACT-001.md) (06/11/2026) com as **decisões definitivas da
> titular C-01 a C-12**, que substituem as propostas de correção da LEGAL-BASE-001 (histórico em
> [`condicoes-comerciais-minuta.md` §10](condicoes-comerciais-minuta.md)). As cláusulas estão no
> [contrato-base](contrato-base-delivery.md); esta proposta só traz o que muda por cliente e por automação. Uso só após
> a aprovação das condições (PUB-19), a revisão por advogado(a) (pendente) e as pendências do
> [checklist](../release/NEKKORA-COM-CONTRACT-001.md) §6. Os campos `{{…}}` são preenchidos em cada proposta. Nenhum dado
> real de cliente deve ser versionado neste repositório.

---

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| Fornecedor | NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA · CNPJ 68.337.624/0001-32 · Rua Pais Leme, 215, Conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150 · contato@nekkora.com |
| Cliente | `{{razão social ou nome}}` · `{{CNPJ/CPF}}` · `{{representante e e-mail}}` |
| **Natureza da relação** (C-01) | ☐ Contrato-base (padrão, compatível com o CDC) · ☐ Contrato-base **+ Anexo B2B**, com a justificativa: `{{os quatro itens do Anexo B2B §1}}`. **Ter CNPJ não basta. Na dúvida, só o contrato-base** |
| Número e data de emissão | `{{NK-AAAA-NNN}}` · `{{DD/MM/AAAA}}` |
| **Data da solicitação** (C-10) | `{{data e hora de recebimento, Brasília}}` · canal `{{e-mail / Bookings / LinkedIn}}` · referência `{{…}}` |
| **Validade** (C-10) | Aceite até `{{DD/MM/AAAA}}` (**7 dias corridos** da emissão, na campanha) |

## 2. Automações (uma seção por automação — C-08, C-12)

| Campo | Conteúdo |
|---|---|
| Automação | `{{nome}}` |
| Categoria e justificativa | ☐ Simples ☐ Média ☐ Complexa · fato observado por critério (regulamento §5) `{{…}}` |
| Descrição do processo e resultado esperado | `{{…}}` |
| Sistemas e integrações | `{{…}}` |
| Fora do escopo | `{{…}}` · sustentação, monitoramento, hospedagem, novas funcionalidades e alocação de profissionais não estão incluídos |
| Dependências e responsabilidades do cliente | `{{acessos, credenciais, ambiente, equipe para homologar}}` |
| **Critérios de aceite** | `{{lista objetiva e verificável}}` |
| Preço | `{{R$}}` · ☐ padrão ☐ lançamento (solicitação recebida no período) ☐ orçamento individual |
| **Início previsto** | `{{DD/MM/AAAA}}` — nunca antes do 8º dia após a assinatura (C-02) |
| **Disponibilização para homologação prevista** | `{{DD/MM/AAAA}}` |
| Etapa de homologação assistida e entrega (só se a titular escolher a Alternativa B da cláusula 10) | `{{R$ ou %}}` |

Total: `{{R$}}` (soma das automações com preço; complexas sob orçamento à parte). Cada automação continua com preço e
aceite próprios.

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

Pix para a conta da empresa. Atraso: lembretes e negociação antes de encargos; multa de 2% e juros simples de 1% ao
mês pro rata die, limitados ao máximo legal, sem capitalização; sem cancelamento automático (contrato-base cl. 15).

## 5. Como funciona, em resumo (cláusulas do contrato-base)

| Tema | Regra | Cláusula |
|---|---|---|
| Espera e arrependimento | O desenvolvimento só começa depois de 7 dias corridos da assinatura. Seu direito legal de arrependimento é preservado: escreva para contato@nekkora.com ou responda a este e-mail; confirmaremos o recebimento imediatamente | 3 |
| Desistência antes da conclusão | **Reembolso integral** do que você pagou à Nekkora pelo desenvolvimento, mesmo com o trabalho iniciado. Despesas que você pagou direto a terceiros não passam pela Nekkora | 9 |
| Desistência após a conclusão | `{{texto da alternativa escolhida pela titular — cláusula 10}}` ⚖ | 10 |
| Homologação | 10 dias úteis; defeitos corrigidos sem limite de rodadas; até 2 rodadas de ajustes de preferência; dois lembretes e suspensão; **sem aceite tácito** | 8 |
| Entrega definitiva | Após o aceite e a quitação: código específico, documentação, Anexo de Componentes e termo de garantia | 12 |
| Garantia | Garantias legais + **30 dias** de cobertura corretiva adicional, no termo de garantia | 13 |
| Propriedade intelectual | Código específico seu após a quitação; componentes da Nekkora licenciados para operar e manter; pode contratar outro desenvolvedor | 14 e Anexo de Componentes |
| Mudança de prazo | Só com motivo, comunicação e concordância por escrito | 5.4 |

## 6. Anexos

Contrato-base · Anexo de Componentes (preenchido) · Termo de garantia (na entrega) · Anexo B2B (só se marcado no §1).

## 7. Aceite

O aceite se dá por `{{assinatura eletrônica / resposta escrita}}` ⚖ **[!]**, com a declaração: "Li e aceito a proposta
`{{número}}` e o contrato-base `{{versão}}`, inclusive as regras de pagamento, homologação, desistência, garantia e
propriedade intelectual."
