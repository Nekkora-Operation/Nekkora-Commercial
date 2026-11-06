# Procedimento operacional — contratação, homologação, cobrança e entrega (Nekkora Delivery)

> **Rascunho para a titular. Não autoriza contratação.** NEKKORA-COM-CONTRACT-001 (06/11/2026). Aplica o
> [contrato-base](contrato-base-delivery.md) no dia a dia. Os prazos podem ser conferidos com
> [`scripts/comercial/regras-delivery.mjs`](../../scripts/comercial/regras-delivery.mjs) (feriados nacionais fixos;
> feriados estaduais e municipais devem ser informados). **Sempre escrever a data explícita** em proposta, cobrança e
> lembrete. Nenhum dado pessoal de cliente é registrado neste repositório.

## 1. Proposta e contratação

1. Registrar a "Data da solicitação" (data, hora, canal, referência) — [regulamento](regulamento-campanha-lancamento.md) §4.
2. Classificar cada automação pelos critérios do regulamento §5 e escrever o fato observado por critério.
3. Preencher a [proposta-modelo](proposta-modelo-delivery.md): escopo, preço, cronograma (início **≥ 8º dia** após a
   assinatura), dependências, critérios de aceite, Anexo de Componentes e despesas externas.
4. Validade: 7 dias corridos da emissão, com a **data final escrita**.
5. Natureza da relação: consumidor, salvo os quatro itens do [Anexo B2B](anexo-b2b-delivery.md) §1.

## 2. Espera inicial e arrependimento (C-02)

- Não iniciar o desenvolvimento nem pedir compra de licenças antes do 8º dia após a assinatura.
- **Pedido de desistência/arrependimento** recebido (qualquer canal escrito): **confirmar o recebimento por escrito
  imediatamente** (Decreto 7.962/2013, art. 5º, §4º). **[!] OPS-11:** definir como garantir a confirmação imediata
  (ex.: resposta automática na caixa `contato@`, configurada pela titular). O agente não alterou o Microsoft 365.
- Classificar o pedido: arrependimento legal (contrato-base 3.4) → devolver tudo de imediato; antes da conclusão
  (9.1) → devolver o pago pelo desenvolvimento; após a conclusão (10) → seguir o §5.

## 3. Homologação (C-06)

| Evento | Ação |
|---|---|
| Disponibilização | E-mail com ambiente, acessos, instruções, relatório de testes e **data final** (10 dias úteis) |
| Manifestação com defeitos | Corrigir sem custo; redisponibilizar; novo prazo de 10 dias úteis |
| Pedido de ajuste de preferência | Contar a rodada (máx. 2). 3ª em diante ou nova funcionalidade → aditivo antes de executar |
| Prazo vencido sem resposta | 1º lembrete escrito no dia útil seguinte |
| 5 dias úteis sem resposta **[!]** | 2º lembrete escrito |
| 5 dias úteis sem resposta **[!]** | Registrar "**Homologação suspensa — aguardando cliente**". **Não cobrar a 2ª parcela. Não registrar aceite.** |
| Aceite expresso | Emitir a cobrança da 2ª parcela (§4) |

## 4. Cobrança (C-11)

1. Cobrança com **data de vencimento explícita** (5 dias úteis).
2. Vencida e não paga: 1º lembrete amigável; depois, 2º lembrete com oferta de negociação.
3. Encargos só depois dos lembretes, se não dispensados: multa única de 2% + juros simples de 1% ao mês pro rata die,
   **limitados ao máximo legal** (ver relatório CONTRACT-001, C-11). Sem juros sobre juros.
4. **Contestação fundamentada** (valor, defeito, entrega): suspender a cobrança do valor controvertido e responder por
   escrito antes de qualquer medida.
5. Nunca cancelar automaticamente por atraso.

## 5. Desistência após a conclusão (C-04) ⚖

Só depois da decisão da titular entre as Alternativas A e B do contrato-base cláusula 10 **e** do parecer jurídico.
Até lá: **não cobrar** com base na cláusula 10; registrar o caso e consultar.

Checklist de evidências (contrato-base 7.2): relatório de testes por critério · documentação · nenhum defeito pendente ·
disponibilização efetiva confirmada · desistência expressa por escrito · envio das evidências ao cliente · 10 dias úteis
para contestação.

## 6. Entrega definitiva

Após aceite (ou cláusula 10) **e** quitação: entregar código específico, documentação, Anexo de Componentes preenchido e
termo de garantia datado. Registrar a data do término da execução e a da entrega (contagem dos prazos de garantia).

## 7. Mudança de cronograma (C-12)

Comunicar por escrito com o motivo e a nova data; só vale com a **concordância escrita** do cliente. Dependência do
cliente: registrar a data em que foi pedida e a data em que foi atendida.
