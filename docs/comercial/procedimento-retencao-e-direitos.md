# Procedimento operacional — retenção, eliminação e direitos dos titulares (Nekkora Commercial)

> **Procedimento executável pela titular.** Preparado na
> [NEKKORA-COM-LEGAL-BASE-001](../release/NEKKORA-COM-LEGAL-BASE-001.md) (05/11/2026) e revisado na **R1**
> (05/11/2026): a revisão passou de mensal para **semanal**, porque a mensal permitia passar de 90 dias (60 + 31 = 91).
> Atende OPS-01 e organiza OPS-03, REP-04 e os controles do Bookings e do Teams. **Não é parecer jurídico.**
>
> Os prazos máximos são os aprovados pela titular na COM-008-B e publicados no aviso de privacidade (minuta,
> PUB-09). A execução é **manual**: não há rotina automática, e este documento não promete eliminação automática.
> O procedimento descreve o que planejar (§1), executar (§2) e registrar como evidência (§5). **Escrever o
> procedimento não comprova nenhuma eliminação:** a comprovação é o registro de cada execução e, para a eliminação
> definitiva, a verificação de OPS-09 e OPS-10.

## 1. Planejamento: prazos, cortes e cadência

**Responsável pela execução:** a titular, na conta corporativa `nicolly@nekkora.com`, que administra a caixa
`contato@nekkora.com`, a página do Bookings e o LinkedIn da Nekkora. Nesta fase não há outra pessoa com acesso. Se a
titular não puder executar a revisão, ninguém executa no lugar dela: aplica-se a regra de atraso (§1.2).

**Cadência:** **semanal**, toda segunda-feira (se não for dia útil, no dia útil seguinte), em uma sessão de cerca de
15 minutos.

| Dados | Prazo máximo declarado | Corte operacional na revisão | Maior permanência com a rotina em dia |
|---|---|---|---|
| Contatos sem contratação: e-mails e mensagens na caixa `contato@nekkora.com`, conversas no LinkedIn | **6 meses** após o último contato relevante | Eliminar o que tiver **5 meses ou mais** desde o último contato relevante | 5 meses + 7 dias (folga de pelo menos 21 dias) |
| Reservas do Microsoft Bookings e notificações de reserva na caixa | **90 dias** após a reunião ou o cancelamento | Eliminar o que tiver **60 dias ou mais** desde a reunião ou o cancelamento | 60 + 7 = 67 dias (folga de 23 dias) |
| Gravações comerciais do Teams | **Não permitidas nesta fase** (§4, CTL-01) | Conferir que não existe nenhuma gravação | — |

### 1.1 Por que a conta fecha

Um item que ainda não atingiu o corte em uma revisão atinge antes da próxima, no máximo 7 dias depois. Por isso ele
fica guardado no máximo **corte + intervalo entre revisões**. Com intervalo de 7 dias, o maior tempo é 5 meses + 7 dias
para contatos (6 meses têm no mínimo 5 meses + 28 dias) e 67 dias para reservas. As duas contas ficam abaixo do
prazo declarado.

### 1.2 Revisão atrasada

O limite de segurança é um **intervalo de no máximo 28 dias** entre duas revisões concluídas. Até esse ponto, os dois
prazos continuam respeitados: 5 meses + 28 dias ≤ 6 meses e 60 + 28 = 88 ≤ 90 dias.

| Situação | O que fazer |
|---|---|
| Atraso de 8 a 28 dias desde a última revisão | Fazer a revisão assim que possível, com os **mesmos cortes**, e registrar no §5 "atrasada" e o número de dias |
| Mais de 28 dias sem revisão | Fazer a revisão **imediatamente**, com os mesmos cortes. Antes de excluir, contar os itens que passaram do prazo máximo (mais de 6 meses ou mais de 90 dias) e registrar no §5 "**prazo excedido**" e essa quantidade. Não declarar que o prazo foi cumprido nesse período |
| Ausência prevista (férias, viagem) | Antecipar a revisão para o último dia útil antes da ausência, para que o intervalo não passe de 28 dias |

### 1.3 Definições

- **Último contato relevante:** a última mensagem trocada sobre a solicitação, como resposta, envio de proposta ou
  pedido de informação. Mensagens automáticas, como notificações e confirmações de leitura, não contam.
- **Exclusão realizada:** a titular excluiu o item no aplicativo (Outlook, LinkedIn, Bookings) e, quando houver,
  esvaziou "Itens Excluídos" e limpou "Recuperar itens excluídos". É o que o §5 registra a cada revisão.
- **Exclusão definitiva comprovada:** só existe quando se demonstra que o provedor não guarda outra cópia acessível à
  Nekkora. No Microsoft 365 isso depende de OPS-09 (prazo dos itens recuperáveis e da lixeira, e ausência de
  políticas de retenção ou retenção para litígio no tenant) e de OPS-10 (efeito da exclusão de reservas nos
  calendários). **Enquanto OPS-09 e OPS-10 estiverem pendentes, nenhum registro pode dizer "eliminação definitiva".**
  No LinkedIn, a exclusão alcança só a cópia da Nekkora (§2, passo 3).

### 1.4 Exceções (não eliminar)

| Exceção | Fundamento | Registro no §5 |
|---|---|---|
| Cliente que contratou: os dados passam a seguir o contrato e os prazos legais | LGPD, art. 7º, V, e art. 16, I | Quantidade, motivo "contrato" |
| Proposta da campanha com prazo de aceite ainda em curso (§6) | Prova da data da solicitação (CDC, art. 30: a oferta vincula) | Quantidade, motivo "proposta em curso" |
| Obrigação legal ou regulatória identificada, como fiscal | LGPD, art. 16, I | Quantidade e a obrigação de forma genérica |
| Exercício regular de direitos em conflito já identificado (reclamação, cobrança, processo) | LGPD, art. 7º, VI, e art. 16 | Quantidade, motivo "defesa de direitos" |

A exceção vale enquanto o motivo existir. Na revisão em que o motivo acabar, o item volta para a regra do §1. Não
usar exceção genérica: cada item mantido precisa de um dos motivos da tabela.

## 2. Execução: passo a passo da revisão semanal

Calcule os cortes do dia: **data da revisão − 5 meses** para contatos e **data da revisão − 60 dias** para reservas.

> **Exemplo:** revisão na segunda-feira **16/11/2026**. Corte de contatos: **16/06/2026**, ou seja, eliminar o que
> teve o último contato relevante **até 16/06/2026**. Corte de reservas: **17/09/2026**, ou seja, eliminar reservas
> com reunião ou cancelamento **até 17/09/2026**. Na revisão seguinte, em **23/11/2026**, os cortes são 23/06/2026 e
> 24/09/2026.

1. **Caixa `contato@nekkora.com` (Outlook):** pesquise as mensagens anteriores ao corte de contatos (ex.:
   `received<=2026-06-16`). Para cada conversa sem contratação e sem exceção do §1.4, **exclua** a conversa, esvazie
   **"Itens Excluídos"** e, em **"Recuperar itens excluídos"**, limpe os itens dessa conversa. ⚠ Sem esse último
   passo, o Microsoft 365 mantém os itens recuperáveis por um prazo definido pelo tenant, que **não foi verificado**
   (OPS-09). Mesmo com ele, uma política de retenção do tenant poderia guardar cópia: por isso o registro é de
   "exclusão realizada", e não de "eliminação definitiva".
2. **Pasta "Enviados":** faça o mesmo com as respostas enviadas a esses contatos.
3. **LinkedIn:** exclua as conversas anteriores ao mesmo corte. ⚠ Excluir a conversa remove só a cópia da Nekkora: o
   LinkedIn e o próprio interlocutor podem manter as deles. O LinkedIn é controlador independente dos dados da
   plataforma.
4. **Microsoft Bookings:** no calendário da página "Nekkora", localize as reservas com reunião ou cancelamento
   anterior ao corte de reservas. ⚠ **Não foi verificado** se o Bookings permite excluir reservas passadas, nem se a
   exclusão também tira os dados do calendário da caixa da página e da conta organizadora (OPS-10). Até essa
   verificação, exclua também os eventos no calendário da caixa da página e no da conta `nicolly@nekkora.com`.
   **Se alguma exclusão não for possível:** não force por outro meio. Registre no §5 "limitação Bookings", com a
   quantidade de itens que ficaram e o que impediu a exclusão. A limitação vira ação de OPS-10: verificar a
   alternativa com o suporte da Microsoft ou ajustar o aviso de privacidade antes da publicação.
5. **Notificações de reserva** (e-mails do Bookings na caixa): exclua as anteriores ao corte de reservas, inclusive em
   "Itens Excluídos" e nos itens recuperáveis.
6. **OneDrive/SharePoint e Teams:** confira que a pasta "Gravações" da conta organizadora não tem arquivos novos e
   que nenhuma reunião comercial da semana tem gravação ou transcrição (§4, CTL-01 e CTL-02). Se encontrar alguma,
   **não a exclua antes de registrar**: anote no §5 "gravação encontrada" e trate como incidente. Ela contraria o
   aviso publicado. Depois, exclua a gravação e revise a configuração ([procedimento do Teams](procedimento-teams-sem-gravacao.md)).
7. **Registre a execução** no §5, inclusive quando não houver nada a excluir.

## 3. Pedidos dos titulares (LGPD, art. 18)

| Etapa | O que fazer | Prazo |
|---|---|---|
| Recebimento | Por `contato@nekkora.com` (canal publicado no aviso) ou pelo LinkedIn | — |
| Identificação | Confirmar que o pedido vem do próprio titular: resposta a partir do mesmo e-mail usado no contato. Não pedir documentos além do necessário | — |
| Confirmação de existência ou acesso | Formato simplificado imediato. Declaração completa (origem, critérios, finalidade) **em até 15 dias** do pedido (LGPD, art. 19, I e II) | Imediato · 15 dias |
| Correção, eliminação, bloqueio, anonimização, portabilidade, informação sobre compartilhamento | Executar e responder. Se não for possível, responder com o motivo (LGPD, art. 18, §4º) | **Meta interna: 15 dias.** A Res. CD/ANPD nº 2/2022, art. 14, I e III, dá prazo em dobro ao agente de pequeno porte. É limite, não meta, e depende do enquadramento (JUR-08) |
| Eliminação | Seguir os passos do §2 para os dados daquele titular, inclusive nos itens recuperáveis. Na resposta, dizer o que foi excluído e o que não depende da Nekkora (cópias do LinkedIn; itens sob OPS-09), sem prometer eliminação definitiva | Mesmo prazo |
| Registro | Linha no §5, **sem** nome nem e-mail: só a data, o tipo de pedido e a data da resposta | — |

**O que dizer quando não houver dados:** "Não encontramos dados seus nos canais da Nekkora (e-mail, LinkedIn e
agenda) na data de hoje."

## 4. Controles específicos

| ID | Controle | Como verificar | Situação |
|---|---|---|---|
| CTL-01 | **Sem gravação comercial nesta fase** (diretriz da titular na LEGAL-BASE-001) | [Procedimento do Teams](procedimento-teams-sem-gravacao.md): configuração restritiva da política `Nekkora-Commercial`, teste em reunião de homologação e evidência. Na revisão semanal, conferir que não há gravações novas (§2, passo 6) | **Pendente.** A política homologada na COM-PRIVACY-001 **ainda permite** gravar com concordância. Recomendação da R1: desligar a gravação na política. A titular executa depois de autorizar a mudança |
| CTL-02 | Transcrição, Copilot e anotações automáticas desligados | Mesmo procedimento do Teams, §3 e §4 | **Não verificado** (OPS-06) |
| CTL-03 | **Texto real de privacidade no Bookings** igual à minuta | Copiar o texto exibido na página pública do Bookings e comparar com [`privacidade-minuta.md` §4](privacidade-minuta.md): ciência (não "concordo"), sem "telefone", com Teams, **sem menção a gravação** | **Pendente** (OPS-02) |
| CTL-04 | **Data de recebimento** de cada solicitação da campanha | Campo "Data da solicitação" na proposta ([proposta-modelo](proposta-modelo-delivery.md) §1), com data e hora do servidor no horário de Brasília. A mensagem original não é eliminada antes do fim do prazo de aceite (§6) | A partir do lançamento (OPS-03) |
| CTL-05 | **Teste externo de recebimento** em `contato@nekkora.com` | De uma conta **fora** do tenant (ex.: um Gmail pessoal), enviar "Teste de recebimento AAAA-MM-DD". Confirmar a chegada na Caixa de Entrada, e não em Lixo Eletrônico, e responder. Registrar no §5 só a data e o resultado | **Pendente** (REP-04) |
| CTL-06 | Resposta a solicitações em até 5 dias | Decreto 7.962/2013, art. 4º, V: manifestação do fornecedor às demandas do consumidor em até cinco dias | Meta operacional a partir do lançamento |

## 5. Evidência: registro de execução (sem dados pessoais)

Cada revisão semanal gera **uma linha**, inclusive quando nada for excluído. Mantenha o registro **fora deste
repositório**, por exemplo em uma planilha no OneDrive da conta corporativa, ou aqui, só com números e datas. Nunca
registre nome, e-mail, empresa ou conteúdo de mensagens.

**Registro mínimo de cada revisão:**

| Campo | Conteúdo |
|---|---|
| Data | Data da revisão (`AAAA-MM-DD`) |
| Responsável | "Titular" |
| Situação | "em dia" · "atrasada (n dias)" · "prazo excedido (n itens)" (§1.2) |
| Cortes usados | Contatos ≤ `AAAA-MM-DD`; reservas ≤ `AAAA-MM-DD` |
| Exclusões realizadas | Quantidade por canal: e-mail · Enviados · LinkedIn · Bookings · notificações |
| Itens recuperáveis limpos | sim / não (e por quê) |
| Exceções mantidas | Quantidade por motivo do §1.4 |
| Limitações | Ex.: "limitação Bookings: n reservas não puderam ser excluídas" |
| Gravações | "nenhuma" ou "gravação encontrada (incidente)" |
| Natureza da evidência | Sempre "exclusão realizada". "Eliminação definitiva comprovada" só depois de OPS-09 e OPS-10 concluídos |

| Data | Responsável | Situação | Cortes | Exclusões realizadas | Recuperáveis limpos | Exceções | Limitações | Gravações | Natureza |
|---|---|---|---|---|---|---|---|---|---|
| `AAAA-MM-DD` | Titular | em dia | Contatos ≤ `AAAA-MM-DD`; reservas ≤ `AAAA-MM-DD` | E-mail `n` · Enviados `n` · LinkedIn `n` · Bookings `n` · Notificações `n` | sim | `n` (proposta em curso) | — | nenhuma | exclusão realizada |

## 6. Campanha: guarda da prova da data

A mensagem que comprova a data da solicitação fica guardada até o **fim do prazo de aceite da proposta** (7 dias da
emissão). Se a proposta for aceita, a mensagem segue o contrato. Se não for, entra na regra do §1, contada do último
contato relevante.

## 7. Pendências deste procedimento

Nenhuma delas fica concluída só porque o procedimento foi escrito. Cada uma exige verificação real no tenant,
registrada com data.

| ID | Pendência | Para concluir |
|---|---|---|
| OPS-09 | Prazo de retenção dos itens recuperáveis e da lixeira no Microsoft 365 (Exchange e OneDrive); existência de políticas de retenção ou retenção para litígio no tenant | Conferir no Microsoft Purview e no Exchange, registrar os valores e a data |
| OPS-10 | Exclusão de reservas passadas no Bookings e efeito nos calendários da página e da organizadora | Testar com uma reserva de homologação, conferir os três calendários e registrar o resultado |
| CTL-01 | Gravação desligada na política do Teams | [Procedimento do Teams](procedimento-teams-sem-gravacao.md), com evidência do §5 daquele documento |
| CTL-05 | Teste externo de recebimento (REP-04) | §4 |
| — | Primeira revisão semanal registrada | A partir da primeira segunda-feira após o lançamento |
