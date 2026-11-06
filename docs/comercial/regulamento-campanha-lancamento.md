# Regulamento da campanha de lançamento — Nekkora Delivery (minuta)

> **MINUTA NÃO APROVADA.** NEKKORA-COM-CONTRACT-001 (06/11/2026), diretriz **C-10**. Os preços são os já aprovados
> (PUB-14) e vêm de `src/precos.ts`, sem alteração. **As datas não foram fixadas nesta missão:** o período em
> `publicacao.json` (06/11/2026 a 06/01/2027) é **histórico** e não vale como nova autorização (§1). O resumo exibido no
> site está em `src/content.ts` (`PRICING.launch.rules`) e depende da nova aprovação dos textos (PUB-17).
> Marcadores como no [contrato-base](contrato-base-delivery.md).

## 1. Período **[!]**

**[D]** Dois meses a partir da **publicação oficial**. **[!] Datas fixas pendentes de aprovação da titular** (PUB-13).
O código nunca calcula nem preenche as datas: a titular registra `campanhaLancamento.inicio/fim` em `publicacao.json`.
O portão recusa campanha encerrada.

## 2. Preços

| Categoria | Padrão | Lançamento |
|---|---:|---:|
| Simples | R$ 1.500 | R$ 1.000 |
| Média | R$ 3.500 | R$ 2.800 |
| Complexa | Sob orçamento | Sob orçamento, **sem desconto automático** |

**[D]** Preço **por automação**. Não existe desconto geral de 50% (os 50% + 50% são forma de pagamento).

## 3. Quem tem direito **[D]**, redação **[R]**

1. Solicitação de avaliação **recebida pela Nekkora** dentro do período, inclusive o primeiro e o último dia, no horário
   de Brasília.
2. Automação classificada como **simples ou média** pelos critérios do §5, com a classificação e a justificativa
   escritas na proposta.
3. Nesse caso, o preço de lançamento da categoria **é devido** — a oferta vincula (**[N]** CDC art. 30, conferido na
   LEGAL-BASE-001). Não há reserva discricionária.
4. **Proposta emitida depois do fim da campanha** mantém o preço de lançamento da solicitação recebida no período.
5. A proposta pode ser aceita em até **7 dias corridos da emissão** (contagem: exclui o dia da emissão, inclui o
   último).
6. **Mudança de escopo posterior** à proposta é avaliada em aditivo ou nova proposta, que informa o preço aplicável; o
   preço de lançamento **não** se estende automaticamente a ela.
7. Várias automações: cada uma com categoria e preço próprios; pedir várias juntas não muda a categoria de nenhuma.

## 4. Prova da data de recebimento **[R]**

| Canal | Evidência | Observação |
|---|---|---|
| E-mail `contato@nekkora.com` | Data e hora de recebimento no servidor do Microsoft 365 (cabeçalho `Received`), no horário de Brasília | Vale o recebimento, não o clique no site nem a data de escrita. Não apagar a mensagem antes do fim do prazo de aceite |
| Microsoft Bookings | Data de **criação** da reserva (notificação e histórico) | Não a data da reunião |
| LinkedIn | Data e hora da mensagem recebida | Captura ou exportação ao emitir a proposta |
| Envio automático (inativo) | Protocolo do backend | Só após PUB-21 |

A proposta registra "Data da solicitação" com data, hora, canal e referência (OPS-03). Na dúvida perto da virada do
último dia, vale o registro do servidor.

## 5. Critérios de classificação **[R]** — proposta objetiva para decisão da titular **[!]**

**Regra de enquadramento proposta:** a categoria é a **mais alta** indicada por qualquer critério; a proposta registra,
para cada critério, o fato observado. Assim a classificação é verificável e não pode ser escolhida para negar o
desconto. Os limites abaixo derivam das descrições já publicadas nos cartões ("um sistema ou planilha"; "mais de um
sistema"; "ponta a ponta ou com várias integrações por API"); os marcados **[!]** precisam de número definido pela
titular.

| Critério (publicado) | Simples | Média | Complexa |
|---|---|---|---|
| Quantidade de sistemas envolvidos | 1 sistema ou planilha | 2 ou mais sistemas | processo ponta a ponta entre `{{[!] N}}`+ sistemas |
| Complexidade das integrações | nenhuma integração por API | 1 integração por API | 2 ou mais integrações por API |
| Regras de negócio e exceções | regras diretas, poucas exceções `{{[!] até N}}` | validações e tratamento de exceções | regras que exigem `{{[!] critério}}` |
| Volume de processamento | `{{[!]}}` | `{{[!]}}` | `{{[!]}}` |
| Exigências de infraestrutura | máquina do cliente já existente | `{{[!]}}` | `{{[!]}}` |
| Necessidade de licenciamento | `{{[!]}}` | `{{[!]}}` | `{{[!]}}` |

**[R]** O cliente pode questionar a classificação por escrito antes do aceite; a Nekkora responde citando o critério e
o fato. ⚖ Validade de critérios em aberto como base de uma oferta vinculante.

## 6. Exemplos testados (`scripts/testes/condicoes-delivery.test.mjs`)

Com um período sintético de 01/12/2026 a 31/01/2027: e-mail recebido em 01/12 00:05 (Brasília) → lançamento; em 31/01
23:59 → lançamento; em 01/02 00:00 → padrão; recebido em 31/01, proposta emitida em 05/02 → lançamento, aceitável até
12/02.
