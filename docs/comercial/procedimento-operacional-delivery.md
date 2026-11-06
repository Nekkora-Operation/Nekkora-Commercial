# Procedimento operacional — contratação, homologação, cobrança e entrega (Nekkora Delivery)

> **Rascunho para a titular. Não autoriza contratação.** NEKKORA-COM-CONTRACT-001 (06/11/2026), atualizado na
> [R1](../release/NEKKORA-COM-CONTRACT-001-R1.md) (reembolso, C-04 por enquadramento, lembretes, garantia, critérios
> por horas, atualização monetária). Aplica o [contrato-base](contrato-base-delivery.md) no dia a dia. Os prazos podem
> ser conferidos com [`scripts/comercial/regras-delivery.mjs`](../../scripts/comercial/regras-delivery.mjs) (feriados
> nacionais fixos; feriados estaduais e municipais devem ser informados). **Sempre escrever a data explícita** em
> proposta, cobrança e lembrete. Nenhum dado pessoal de cliente é registrado neste repositório.

## 1. Proposta e contratação

1. Registrar a "Data da solicitação" (data, hora, canal, referência) — [regulamento](regulamento-campanha-lancamento.md) §4.
2. Classificar cada automação pelo **esforço técnico estimado** (simples até 8 h; média acima de 8 até 16 h; complexa
   acima de 16 h) e escrever os fatos dos critérios complementares (regulamento §5). Contagem de sistemas ou APIs, sozinha,
   não muda a categoria. Complexa por risco excepcional: justificativa, fatos verificáveis e aviso ao cliente **antes** do
   aceite (`classificarAutomacao`).
3. Preencher a [proposta-modelo](proposta-modelo-delivery.md): escopo, preço, cronograma (início **≥ 8º dia** após a
   assinatura), dependências, critérios de aceite, Anexo de Componentes, despesas externas e, no regime do consumidor, a
   **reserva das etapas finais (10%)** — sem ela, a cláusula 10 não pode ser usada depois.
4. Validade: 7 dias corridos da emissão, com a **data final escrita**.
5. Natureza da relação: **declarar** consumidor ou B2B; B2B só com os quatro itens do [Anexo B2B](anexo-b2b-delivery.md)
   §1. Ter CNPJ não basta.

## 2. Pedido de desistência ou arrependimento (C-02, C-03)

| Passo | Ação |
|---|---|
| 1. Receber | Qualquer canal escrito (resposta ao e-mail da proposta, `contato@nekkora.com`) |
| 2. Confirmar | **Imediatamente**, por escrito, no mesmo canal (Decreto 7.962/2013, art. 5º, §4º). **[!] OPS-11:** definir como garantir a confirmação imediata (ex.: resposta automática na caixa `contato@`, configurada pela titular). O agente não alterou o Microsoft 365 |
| 3. Registrar | Data e hora do pedido, canal, automação e situação do desenvolvimento |
| 4. Classificar | Arrependimento legal (contrato-base 3.4) → devolver **tudo, de imediato**, com atualização monetária · Antes da conclusão (9.1) → devolver o pago pelo desenvolvimento em até **5 dias úteis** · Após a conclusão (10) → §5 · Defeito ou atraso da Nekkora → cláusula 11 |
| 5. Concluir | Pix e **comprovante de devolução** enviado ao cliente; registrar a data. O prazo de 5 dias úteis **nunca** posterga uma devolução que a lei exige de imediato |

Não iniciar o desenvolvimento nem pedir compra de licenças antes do 8º dia após a assinatura.

## 3. Homologação (C-06)

| Momento | Ação |
|---|---|
| Dia 0 | E-mail com ambiente, acessos, instruções, critérios, relatório de testes e **data final** (10 dias úteis) |
| 5º dia útil | 1º lembrete escrito, se não houver resposta conclusiva |
| 9º dia útil | 2º lembrete escrito, se continuar sem resposta conclusiva |
| Fim do 10º dia útil | Termina o prazo inicial |
| Dia útil seguinte | Sem manifestação: registrar "**Homologação suspensa — aguardando cliente**" e comunicar por escrito. **Não cobrar a 2ª parcela. Não registrar aceite nem desistência** |
| 30 dias corridos após a suspensão | Pedir por escrito a **reprogramação formal**. Sem cancelamento automático |
| Manifestação com defeitos | Corrigir sem custo e sem limite de rodadas; redisponibilizar e **comunicar por escrito a nova data-base** (sem isso, o prazo não reinicia) |
| Pedido de ajuste de preferência | Contar a rodada (máx. 2). 3ª em diante ou nova funcionalidade → aditivo antes de executar |
| Aceite expresso | Emitir a cobrança da 2ª parcela (§4) |

## 4. Cobrança (C-11)

1. Cobrança com **data de vencimento explícita** (5 dias úteis).
2. Vencida e não paga: 1º lembrete amigável; depois, 2º lembrete com oferta de negociação.
3. Encargos só depois dos lembretes, se não dispensados: multa única de 2% + juros simples de 1% ao mês pro rata die,
   **limitados ao máximo legal** da relação; atualização monetária só quando devida, uma vez, pelo índice aplicável. Sem
   juros sobre juros. O cálculo de `encargosDeAtraso` é **indicativo**: fora do B2B, sem teto legal confirmado, não usar
   como valor final ⚖.
4. **Contestação fundamentada** (valor, defeito, entrega): suspender a cobrança do valor controvertido e responder por
   escrito antes de qualquer medida.
5. Nunca cancelar automaticamente por atraso.

## 5. Desistência após a conclusão (C-04) ⚖

**Até o parecer jurídico: não cobrar com base na cláusula 10**; registrar o caso e consultar.

Checklist (contrato-base 10.1, todos): conclusão integral comprovada · critérios de aceite cumpridos · nenhum defeito
ou obrigação técnica pendente · disponibilização real (ambiente, instruções, meios de teste) · desistência expressa
por escrito · sem arrependimento legal em curso · sem contestação pendente · conformidade jurídica.

Depois: enviar as evidências ao cliente → **10 dias úteis** para contestar → contestação fundamentada suspende →
apurar o valor: **consumidor** até 90% (a reserva de 10% nunca é cobrada); **B2B com Anexo válido** até 100%; sempre
abatidos os pagamentos → quitado o valor apurado, transferir os entregáveis (§6).

## 6. Entrega definitiva

Após aceite e quitação: entregar código específico, documentação, Anexo de Componentes preenchido e termo de garantia
datado. Na desistência após a conclusão: quitado o **valor validamente apurado**, entregar código-fonte específico
concluído, documentação, relatório de testes e Anexo de Componentes, no repositório ou arquivo indicado pelo cliente,
com instruções escritas e registro do envio (prazo **[!]** a definir pela titular). Registrar a data do término da
execução e a da entrega (contagem dos prazos de garantia).

## 7. Garantia (C-07)

| Etapa | Meta |
|---|---|
| Confirmar o recebimento por escrito | até **2 dias úteis** |
| Diagnóstico inicial | até **5 dias úteis** |
| Previsão de correção | informar depois da avaliação técnica, específica para o caso |
| Registro | defeito, evidências, medidas tomadas e resolução |

São metas de atendimento, não prazo máximo de correção (`atendimentoDaGarantia`).

## 8. Mudança de cronograma (C-12)

Comunicar por escrito com o motivo e a nova data; só vale com a **concordância escrita** do cliente. Dependência do
cliente: registrar a data em que foi pedida e a data em que foi atendida.
