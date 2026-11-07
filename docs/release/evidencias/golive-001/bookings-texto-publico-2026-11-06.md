# Texto público do Microsoft Bookings, conferido em 06/11/2026

**Como foi conferido:** só leitura, com Playwright (Chromium headless, `pt-BR`), sem login. A página foi
`https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/`. Selecionei um horário só para exibir o formulário.
**Nenhuma reserva foi enviada** e o botão "Reservar" não foi clicado. O texto abaixo foi copiado como está.
Este registro não contém dados pessoais.

## Descrição do serviço "Conversa inicial — Nekkora Delivery"

> Conversa inicial de 30 minutos para entender sua necessidade de automação, infraestrutura ou hospedagem e avaliar os
> próximos passos. A reunião será realizada pelo Microsoft Teams e poderá ser gravada exclusivamente mediante aviso
> prévio e concordância específica dos participantes. Caso não haja concordância, a conversa poderá ocorrer sem
> gravação. Dúvidas: contato@nekkora.com.

## Formulário

Campos: "Primeiro e sobrenome", "Email", "Adicionar solicitações especiais", "Qual é o nome da sua empresa?" e
"Qual processo você gostaria de automatizar?".

Bloco "Privacidade e gravação de reuniões":

> A Nekkora utiliza os dados informados no agendamento para confirmar o horário, realizar a conversa pelo Microsoft
> Teams e atender à sua solicitação comercial.
>
> A reunião poderá ser gravada, mediante informação prévia e concordância específica dos participantes, para documentar
> requisitos e decisões comerciais. A gravação não é obrigatória para realizar a reunião.
>
> Quando houver gravação, seu prazo padrão de retenção será de 30 dias após a reunião, ressalvadas as hipóteses
> legalmente justificadas de conservação.
>
> Para dúvidas sobre o tratamento de dados pessoais, entre em contato pelo e-mail contato@nekkora.com.
>
> Consulte também nosso aviso de privacidade: https://nekkora.com/#privacidade

## Comparação com o site e com a minuta (OPS-02 / CTL-03)

| Ponto | Site e `privacidade-minuta.md` §4 | Bookings hoje | Resultado |
|---|---|---|---|
| Gravação | "Conversa sem gravação": nesta fase não há gravação (LEGAL-BASE-001) | "poderá ser gravada", em dois lugares | **Diverge** |
| Base legal | art. 7º, V, a pedido do titular | não informa | Falta |
| Processamento fora do Brasil | "podem processar dados fora do Brasil" | não informa | Falta |
| Retenção das reservas | até 90 dias após a reunião ou o cancelamento | só fala do prazo de gravações (30 dias) | Falta |
| "Telefone" | não pede | não pede | OK |
| Teams | citado | citado | OK |
| Link do aviso | `https://nekkora.com/#privacidade` | o mesmo, mas o endereço ainda não está no ar | OK depois do DNS |
| Senhas e sigilo | "Não inclua senhas nem informações sigilosas" | ausente | Falta |

**Conclusão:** o CTL-03 **não passa**, e o aviso do site não pode ser aprovado (PUB-09) com o Bookings dizendo o
contrário. A correção é feita pela titular, no Microsoft 365: substituir a descrição do serviço e o bloco acima pelo
texto de [`privacidade-minuta.md` §4](../../../comercial/privacidade-minuta.md). Depois disso, a conferência é
repetida do mesmo modo.
