# Evidências que a titular executa antes da V1 (E1, E2, E3 e E5)

NEKKORA-COM-GOLIVE-001-R2, 06/11/2026. Claude **não** altera o Microsoft 365 nem preenche resultado sem evidência.
Cada item só é dado como concluído quando o registro indicado estiver preenchido e conferido. A validação de DNS
**não** substitui nenhum destes testes.

**Ordem recomendada:** E5 (Teams), depois E1 (Bookings), E2 (e-mail) e E3 (local dos dados). O Bookings vai dizer "não
grava as conversas". Por isso a política do Teams tem de bloquear a gravação **antes** de esse texto ir ao ar.

## E5 — Teams sem gravação (CTL-01)

Siga o [procedimento do Teams](../comercial/procedimento-teams-sem-gravacao.md), §2 a §5. Ele já tem a configuração
desejada, as verificações prévias e a tabela de registro.

**Critério de sucesso:**

- na política `Nekkora-Commercial`, gravação e transcrição estão desligadas (e o Copilot, se a opção existir);
- a política está atribuída à conta organizadora;
- numa reunião de teste, o botão de gravar **não aparece ou está desabilitado** para a titular;
- há captura de tela da política e da reunião, sem dados de terceiros.

## E1 — Bookings (OPS-02 / CTL-03)

Onde: **Bookings → página "Nekkora" → serviço "Conversa inicial — Nekkora Delivery"** e configurações da página de
reserva. Hoje o texto aparece em dois lugares ([registro de 06/11](evidencias/golive-001/bookings-texto-publico-2026-11-06.md)).

| # | Campo no Bookings | Hoje | Trocar por |
|---|---|---|---|
| 1 | Descrição do serviço | "…A reunião será realizada pelo Microsoft Teams e poderá ser gravada…" | Texto 1, abaixo |
| 2 | Bloco "Privacidade e gravação de reuniões" (no campo em que está configurado hoje) | Texto que fala de gravação e de 30 dias | Texto 2, abaixo (`privacidade-minuta.md` §4) |
| 3 | Caixa de confirmação do formulário | Não aparece no registro de 06/11 | Rótulo **"Li e entendi como meus dados serão usados."** Se a única caixa disponível for a de "consentimento de uso de dados do cliente", o texto dela tem de ser de **ciência**, nunca "concordo" ou "ao marcar esta caixa, você concorda" |
| 4 | Pergunta "Qual é o nome da sua empresa?" | — | **Opcional** (AUD-37) |
| 5 | Telefone | Não pedido | Continuar sem pedir |
| 6 | Link `https://nekkora.com/#privacidade` | Presente | Manter. Ele só funciona depois do DNS (A7) |

**Texto 1 (descrição do serviço; proposta, a titular aprova a redação):**

> Conversa inicial de 30 minutos para entender sua necessidade de automação, infraestrutura ou hospedagem e avaliar os
> próximos passos. A reunião é realizada pelo Microsoft Teams, sem gravação. Dúvidas: contato@nekkora.com.

**Texto 2 (copiar exatamente; é o da `privacidade-minuta.md` §4):**

> Para agendar a conversa, a Nekkora usa o seu nome, o seu e-mail e as respostas deste formulário (empresa e processo,
> quando informados). Esses dados servem para confirmar e lembrar o horário, realizar a reunião pelo Microsoft Teams e
> responder à sua solicitação, a seu pedido (LGPD, art. 7º, V). Nesta fase, a Nekkora não grava as conversas comerciais.
> O agendamento e a reunião usam o Microsoft Bookings e o Microsoft Teams (Microsoft 365), que podem processar dados
> fora do Brasil. As reservas ficam guardadas por até 90 dias após a reunião ou o cancelamento. Saiba mais em
> https://nekkora.com/#privacidade. Dúvidas ou pedidos sobre seus dados: contato@nekkora.com. Não inclua senhas nem
> informações sigilosas.

**Atenção à base legal.** O site e este texto dizem hoje "art. 7º, V". Se a revisão jurídica da JUR-06 adotar também o
legítimo interesse para representantes de empresa (art. 7º, IX), **os dois textos mudam juntos**, e a regra B04 do
`conferir-bookings.mjs` também. Enquanto isso não for decidido, não altere a base só no Bookings.

**Depois que a titular avisar que salvou** (Claude executa; só leitura, sem reserva):

```bash
node scripts/conferir-bookings.mjs --saida docs/release/evidencias/golive-001/bookings-<AAAA-MM-DD>
```

**Critério de sucesso:**

- **12 de 12** regras: as 11 originais mais a B12, que confere se existe a caixa de ciência;
- texto e captura gravados na pasta;
- nenhuma menção a gravação possível (B01) e a caixa sem "concorda" (B11).

Com qualquer falha, o item continua aberto.

## E2 — E-mail externo (CTL-05 / REP-04)

Roteiro e tabela: [`email-recebimento-externo.md`](evidencias/golive-001/email-recebimento-externo.md). Envie de uma
conta fora do `nekkora.com`, confira que chegou na **Caixa de Entrada** de `contato@`, responda e confira que a resposta
chegou fora do spam. Claude preenche a tabela com o que a titular informar (só o **domínio** do remetente) e com as
capturas.

**Critério de sucesso:** as duas mensagens entregues fora do spam e da quarentena, com data e hora.

## E3 — Local dos dados do Microsoft 365 (JUR-07, item 1)

Caminho: **Centro de administração do Microsoft 365 → Configurações → Configurações da organização → Perfil da
organização → Local dos dados**. Faça uma captura do cartão inteiro. Ele mostra, por serviço (Exchange,
SharePoint/OneDrive, Teams), as colunas **"Current"** e **"Committed Geography"**.

| Serviço | Local atual | Local comprometido |
|---|---|---|
| Exchange Online | | |
| SharePoint / OneDrive | | |
| Teams | | |

**Critério de sucesso:** a captura legível, guardada em `evidencias/golive-001/m365-local-dos-dados-<data>.png`.
Essa evidência **não encerra** a JUR-07: ela só delimita o que é armazenado no Brasil (ver [JUR-07](NEKKORA-COM-GOLIVE-001-JUR-07.md)).
O Bookings não aparece nesse cartão, porque não tem compromisso de residência.
