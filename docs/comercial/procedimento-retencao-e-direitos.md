# Procedimento operacional — retenção, eliminação e direitos dos titulares (Nekkora Commercial)

> **Procedimento executável pela titular.** Preparado na
> [NEKKORA-COM-LEGAL-BASE-001](../release/NEKKORA-COM-LEGAL-BASE-001.md) (05/11/2026). Atende OPS-01 e organiza
> OPS-03, REP-04 e os controles do Bookings e do Teams. **Não é parecer jurídico.** Os prazos máximos são os
> aprovados pela titular na COM-008-B e publicados no aviso de privacidade (minuta, PUB-09). A execução é
> **manual** e não há rotina automática. Este documento **não comprova** nenhuma eliminação; a comprovação é o
> registro de execução (§5), feito a cada revisão.

## 1. Prazos máximos e cadência

| Dados | Prazo máximo declarado | Revisão | Regra de corte na revisão (garante o prazo máximo) |
|---|---|---|---|
| Contatos sem contratação: e-mails e mensagens na caixa `contato@nekkora.com`, conversas no LinkedIn | **6 meses** após o último contato relevante | **Mensal**, no 1º dia útil do mês | Eliminar tudo cujo último contato relevante tenha **5 meses ou mais** na data da revisão |
| Reservas do Microsoft Bookings (e notificações de reserva na caixa) | **90 dias** após a reunião ou o cancelamento | **Mensal**, na mesma sessão | Eliminar tudo cuja reunião ou cancelamento tenha **60 dias ou mais** na data da revisão |
| Gravações do Teams | **Não há gravação nesta fase** (§4) | Mensal | Conferir que não existe nenhuma gravação nova |

**Por que o corte é menor que o prazo:** com revisões mensais, um item que ainda não atingiu o corte numa revisão é
eliminado na seguinte, no máximo um mês depois. Assim, 5 meses + 1 mês ≤ 6 meses e 60 dias + 31 dias ≤ 91 dias.
**Atenção:** para não passar de 90 dias, a revisão seguinte não pode ocorrer mais de **30 dias** depois da anterior.
Se uma revisão atrasar, use o corte de **55 dias** para as reservas na revisão seguinte.

**"Último contato relevante"** é a última mensagem trocada sobre a solicitação: resposta, envio de proposta, pedido
de informação. Mensagens automáticas, como notificações e confirmações de leitura, não contam.

**Exceções (não eliminar):** (a) cliente que contratou: os dados passam a seguir o contrato e os prazos legais; (b)
proposta da campanha com prazo de aceite ainda em curso (§6); (c) dados necessários para exercer ou defender direitos
num conflito já identificado. Nesse caso, registre o motivo no §5, sem dados pessoais.

## 2. Passo a passo da revisão mensal (≈ 20 minutos)

1. **Caixa `contato@nekkora.com` (Outlook):** pesquise mensagens com data anterior ao corte (ex.: `received<=AAAA-MM-DD`).
   Para cada conversa sem contratação, sem proposta em curso e sem exceção do §1, **exclua** a conversa e depois
   **esvazie "Itens Excluídos"**. Por fim, em **"Recuperar itens excluídos"**, limpe os itens dessa conversa. ⚠ Sem
   esse último passo, o Microsoft 365 mantém os itens recuperáveis por um prazo definido pelo tenant, que **não foi
   verificado** (OPS-09).
2. **Pasta "Enviados":** faça o mesmo com as respostas enviadas a esses contatos.
3. **LinkedIn:** exclua as conversas com o mesmo corte. ⚠ Excluir a conversa remove a cópia da Nekkora; o LinkedIn e
   o próprio interlocutor podem manter a deles. O LinkedIn é controlador independente dos dados da plataforma.
4. **Microsoft Bookings:** abra o calendário da página "Nekkora" e localize as reservas cuja reunião ou cancelamento
   seja anterior ao corte. ⚠ **Não foi verificado** se o Bookings permite excluir reservas passadas nem se, ao excluir
   o evento, os dados também saem do calendário da caixa de correio da página e da conta organizadora (OPS-10). Até
   isso ser verificado, exclua os eventos no calendário da caixa da página e no da conta `nicolly@nekkora.com`, e
   registre no §5 o que foi possível fazer.
5. **Notificações de reserva** (e-mails do Bookings na caixa): exclua as que passaram do mesmo corte.
6. **OneDrive/SharePoint (gravações):** confira que não existe nenhuma gravação de reunião comercial (§4).
7. **Registre a execução** no §5.

## 3. Pedidos dos titulares (LGPD, art. 18)

| Etapa | O que fazer | Prazo |
|---|---|---|
| Recebimento | Por `contato@nekkora.com` (canal publicado no aviso) ou pelo LinkedIn | — |
| Identificação | Confirmar que o pedido vem do próprio titular: resposta a partir do mesmo e-mail usado no contato. Não pedir documentos além do necessário | — |
| Confirmação de existência ou acesso | Formato simplificado imediato. Declaração completa (origem, critérios, finalidade) **em até 15 dias** do pedido (LGPD, art. 19, I e II) | Imediato · 15 dias |
| Correção, eliminação, bloqueio, anonimização, portabilidade, informação sobre compartilhamento | Executar e responder. Se não for possível, responder com o motivo (LGPD, art. 18, §4º) | **Meta interna: 15 dias.** A Res. CD/ANPD nº 2/2022, art. 14, I e III, dá prazo em dobro ao agente de pequeno porte. É limite, não meta, e depende do enquadramento (JUR-08) |
| Eliminação | Seguir os passos do §2 para os dados daquele titular, inclusive nos itens recuperáveis | Mesmo prazo |
| Registro | Linha no §5, **sem** nome nem e-mail: só a data, o tipo de pedido e a data da resposta | — |

**O que dizer quando não houver dados:** "Não encontramos dados seus nos canais da Nekkora (e-mail, LinkedIn e
agenda) na data de hoje."

## 4. Controles específicos

| ID | Controle | Como verificar | Situação |
|---|---|---|---|
| CTL-01 | **Sem gravação comercial nesta fase** (diretriz da titular na LEGAL-BASE-001) | Ninguém inicia gravação nas reuniões comerciais. Na revisão mensal, a pasta "Gravações" do OneDrive da conta organizadora não tem arquivos novos. A política `Nekkora-Commercial` não tem gravação automática | **A confirmar pela titular** (a política homologada na COM-PRIVACY-001 **permite** gravar com concordância: decidir se desliga a gravação na política ou se a regra fica só operacional) |
| CTL-02 | Transcrição e anotações automáticas desligadas | Política de reunião do Teams | **Não verificado** (OPS-06) |
| CTL-03 | **Texto real de privacidade no Bookings** igual à minuta | Copiar o texto exibido na página pública do Bookings e comparar com [`privacidade-minuta.md` §4](privacidade-minuta.md): ciência (não "concordo"), sem "telefone", com Teams, **sem menção a gravação** | **Pendente** (OPS-02) |
| CTL-04 | **Data de recebimento** de cada solicitação da campanha | Campo "Data da solicitação" na proposta ([proposta-modelo](proposta-modelo-delivery.md) §1), com data e hora do servidor no horário de Brasília. A mensagem original não é eliminada antes do fim do prazo de aceite (§6) | A partir do lançamento (OPS-03) |
| CTL-05 | **Teste externo de recebimento** em `contato@nekkora.com` | De uma conta **fora** do tenant (ex.: um Gmail pessoal), enviar "Teste de recebimento AAAA-MM-DD". Confirmar a chegada na Caixa de Entrada, e não em Lixo Eletrônico, e responder. Registrar no §5 só a data e o resultado | **Pendente** (REP-04) |
| CTL-06 | Resposta a solicitações em até 5 dias | Decreto 7.962/2013, art. 4º, V: manifestação do fornecedor às demandas do consumidor em até cinco dias | Meta operacional a partir do lançamento |

## 5. Registro de execução (sem dados pessoais)

Copie a tabela para um arquivo **fora deste repositório** (ex.: planilha no OneDrive da conta corporativa) ou registre
aqui **apenas números e datas**. Nunca registre nome, e-mail, empresa ou conteúdo de mensagens.

| Data | Responsável | Tipo | Corte usado | Itens eliminados (quantidade por canal) | Exceções mantidas (quantidade e motivo genérico) | Observações |
|---|---|---|---|---|---|---|
| `AAAA-MM-DD` | Titular | Revisão mensal | Contatos ≤ `AAAA-MM-DD`; reservas ≤ `AAAA-MM-DD` | E-mail `n` · LinkedIn `n` · Bookings `n` | `n` (proposta em curso) | — |

## 6. Campanha — guarda da prova da data

A mensagem que comprova a data da solicitação fica guardada até o **fim do prazo de aceite da proposta** (7 dias da
emissão). Se a proposta for aceita, a mensagem segue o contrato. Se não for, entra na regra do §1, contada do último
contato relevante.

## 7. Pendências deste procedimento

| ID | Pendência |
|---|---|
| OPS-09 | Prazo de retenção dos itens recuperáveis e da lixeira no tenant Microsoft 365 (Exchange e OneDrive): não verificado |
| OPS-10 | Exclusão de reservas passadas no Bookings e efeito nos calendários: não verificado |
| CTL-01 | Decisão da titular: desligar a gravação na política do Teams ou manter a regra só operacional |
| CTL-05 | Teste externo de recebimento (REP-04) |
