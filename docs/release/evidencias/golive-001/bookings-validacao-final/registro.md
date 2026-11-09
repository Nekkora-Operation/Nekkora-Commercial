# E1 — Bookings: registro da validação final (OPS-02 / CTL-03)

**Status: VERIFICADO em 09/11/2026** (2026-11-09T14:04:07Z), sobre a `main` `50f3dc1`.

**Como foi conferido:** `node scripts/conferir-bookings.mjs --saida docs/release/evidencias/golive-001/bookings-validacao-final`,
só leitura, sem login. O script selecionou um horário apenas para exibir o formulário. Nenhum campo foi preenchido, o
botão "Reservar" não foi clicado e nenhuma reserva foi criada. Depois, o texto e a captura foram lidos para a conferência
visual. Este registro, `texto.md` e `captura.png` não contêm dados pessoais.

## Regras automatizadas: 12 de 12, código de saída 0

B01 a B12 passaram. O resultado de cada regra está em [`texto.md`](texto.md).

## Conferência do texto e do formulário

Evidência: [`texto.md`](texto.md) e [`captura.png`](captura.png).

| Critério | Resultado |
|---|---|
| Descrição do serviço sem permissão de gravar ("realizada pelo Microsoft Teams, sem gravação") | OK |
| Aviso: finalidades (confirmar e lembrar o horário, realizar a reunião, responder à solicitação) | OK |
| Aviso: Microsoft Teams | OK |
| Aviso: possível processamento fora do Brasil | OK |
| Aviso: retenção de até 90 dias após a reunião ou o cancelamento | OK |
| Aviso: alerta sobre senhas e informações sigilosas | OK |
| Caixa de seleção ao lado de "Li e entendi como meus dados serão usados." | OK |
| Nome e e-mail obrigatórios (com asterisco) | OK |
| Empresa e processo opcionais (sem asterisco) | OK |
| Sem campo de telefone | OK |
| Descrição igual ao Texto 1 e aviso igual ao Texto 2 do roteiro de evidências | OK |

## Limites desta conferência

- A obrigatoriedade foi conferida pelo asterisco na tela. Não houve teste de envio, porque ele criaria uma reserva.
- A conferência cobre o que a página pública diz. Ela não prova que a gravação está bloqueada no Teams (E5) nem que a
  retenção de 90 dias é aplicada na prática.
- O link `https://nekkora.com/#privacidade` está no texto, mas só funciona depois do DNS.

## Quando repetir

- depois da A8, conforme o §6 do checklist, porque o link `#privacidade` passa a funcionar;
- se a JUR-06 mudar a base legal: o site, o Bookings e a regra B04 mudam juntos;
- se o texto ou o formulário do Bookings forem alterados.

## Para a revisão jurídica

- O campo opcional de texto livre "Adicionar solicitações especiais" não é citado de forma expressa no aviso. A pergunta
  está em `NEKKORA-COM-GOLIVE-001-JUR-07.md`, §4.5, item 8. O Bookings não foi alterado por isso.
- A base legal indicada no aviso (art. 7º, V) continua sujeita à JUR-06/JUR-07.

## Ponto em aberto fora do E1

O roteiro pede o E5 antes do E1, porque o Bookings diz que a Nekkora não grava as conversas. Neste registro, o E5 segue
pendente: a tabela do §5 de `docs/comercial/procedimento-teams-sem-gravacao.md` está sem preenchimento (CTL-01 "Pendente").
