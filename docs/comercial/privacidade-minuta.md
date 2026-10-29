# Minuta — privacidade do Nekkora Commercial e do Microsoft Bookings

> **MINUTA NÃO APROVADA JURIDICAMENTE.** Preparada na NEKKORA-COM-008-C a partir das diretrizes da titular na
> COM-008-B. A revisão jurídica é obrigatória antes da aprovação: `aprovacoes.avisoDePrivacidade` continua `false`
> e o portão continua bloqueando (PUB-09). Atualiza a minuta técnica anterior
> ([`COM-RELEASE-005-privacidade.md`](../release/COM-RELEASE-005-privacidade.md)), que segue valendo no que não foi
> alterado aqui (inventário técnico do envio automático, bases legais por finalidade, revisão de segurança).
>
> **Nada foi alterado no Microsoft 365.** O texto do Bookings abaixo é uma proposta para a titular configurar.

## 1. O que mudou no aviso do site (`src/content.ts → PRIVACY`)

Texto completo gerado em [`05-texto-comercial.md` §7a](../com-001/05-texto-comercial.md). Na variante com envio
automático: [`texto-com-envio-automatico-e-bookings.md` §7a](../release/com-release-005/texto-com-envio-automatico-e-bookings.md).

| Tema | Antes | Agora (em revisão) | AUD |
|---|---|---|---|
| Controlador | "a Nekkora" | "a Nekkora (CNPJ 68.337.624/0001-32)". A **razão social continua pendente** e não foi inventada; quando a titular a gravar em `publicacao.json → controlador.nome`, ela substitui "a Nekkora" | AUD-33 |
| Microsoft Bookings | "…usados para realizar a conversa" | "…usados para confirmar e lembrar o horário e realizar a conversa **pelo Microsoft Teams**" | AUD-38 |
| Cookies | "Não usamos cookies…" | "**Esta página** não usa cookies…; **o simulador de investimento não guarda nem envia** o que você seleciona… O Microsoft Bookings… segue as regras da Microsoft" | AUD-43 |
| Retenção | "pelo tempo necessário… ou exigido por lei" | Novo item **"Por quanto tempo guardamos"** (§3) | AUD-39 |
| Transferência internacional | Ausente | Novo item **"Onde os dados são processados"**: Microsoft (M365, Bookings e Teams) e AWS podem processar dados fora do Brasil | AUD-40 |
| Base legal e consentimento | art. 7º, V | Mantido o art. 7º, V. Acrescentado: "Para isso não pedimos consentimento: os dados são necessários para atender ao seu pedido. Se algum outro uso depender de consentimento, ele será pedido à parte." | AUD-35 |
| Direitos | confirmação, acesso, correção, exclusão, compartilhamento | + anonimização, bloqueio, portabilidade e revogação do consentimento, quando houver (art. 18) | — |
| Formulário | "nome, empresa, e-mail e descrição" | + tipo de solicitação e, **se o visitante incluir**, o resumo da simulação | — |

## 2. Aceite, ciência e consentimento (diretriz da COM-008-B)

| Figura | O que é | Onde se aplica |
|---|---|---|
| **Aceite das condições** | Concordância com proposta e contrato (obrigação contratual) | Proposta comercial e contrato. Não no site |
| **Ciência da política de privacidade** | O titular declara que foi informado. **Não é base legal** e não precisa de revogação | Bookings (caixa "Li e entendi", §4); site (aviso sempre visível) |
| **Consentimento** (art. 7º, I) | Base legal própria, livre, específica e **revogável** | Só para finalidades que dependam dele (ex.: marketing). **Nenhuma** finalidade atual do Commercial depende de consentimento |

Base adotada para responder, agendar e preparar avaliação e proposta: **art. 7º, V** (procedimentos preliminares a
pedido do titular). ⚖ A revisão jurídica deve confirmar se o art. 7º, V se aplica quando quem entra em contato é
empregado de uma empresa, ou se é melhor o legítimo interesse (art. 7º, IX) com teste de balanceamento.

## 3. Retenção

| Dados | Prazo aprovado **[D]** | Como é cumprido hoje |
|---|---|---|
| Contatos sem contratação (e-mails e mensagens na caixa comercial, LinkedIn) | **Seis meses** após o último contato relevante | **Manual.** Não há rotina automática: a Nekkora revisa e apaga. Sugestão: revisão mensal da caixa `contato@`, com registro da data |
| Reservas do Microsoft Bookings | **90 dias** após a reunião ou o cancelamento | **Manual** (ou política de retenção do Microsoft 365, **não configurada**: esta missão não altera o M365) |
| Dados ligados a uma contratação | Prazos do contrato e os exigidos por lei (fiscais, defesa de direitos) | Conforme o contrato ⚖ |
| Preferência de tema (`localStorage`) | Até o visitante limpar | Automático, no navegador do visitante |
| Simulador de investimento | **Nada é guardado** | Estado só na memória da página; testado (sem storage, cookie, IndexedDB ou requisição) |

**O aviso descreve o prazo, não uma execução automática.** O texto diz "ficam guardados por até…". Ele **não** diz que
a eliminação é automática, porque ela não é (COM-008-C §9). Antes da aprovação, a titular precisa definir o
procedimento manual e o responsável, ou configurar a retenção no M365 numa missão própria.

## 4. Texto alternativo para o Microsoft Bookings (para a titular configurar no M365)

Corrige a base legal (AUD-35), retira "telefone" (AUD-36), inclui o Teams (AUD-38) e o link do aviso (AUD-44):

> Para agendar a conversa, a Nekkora usa o seu nome, o seu e-mail e as respostas deste formulário (empresa e processo,
> quando informados). Esses dados servem para confirmar e lembrar o horário, realizar a reunião pelo Microsoft Teams e
> responder à sua solicitação, a seu pedido (LGPD, art. 7º, V). O agendamento e a reunião usam o Microsoft Bookings e o
> Microsoft Teams (Microsoft 365), que podem processar dados fora do Brasil. As reservas ficam guardadas por até 90 dias
> após a reunião ou o cancelamento. Saiba mais em https://nekkora.com/#privacidade. Dúvidas ou pedidos sobre seus
> dados: contato@nekkora.com. Não inclua senhas nem informações sigilosas.
>
> ☐ Li e entendi como meus dados serão usados.

- A caixa é de **ciência**, não de consentimento. Se a titular preferir manter "Ao marcar esta caixa, você concorda",
  o aviso do site e esta minuta precisam passar a tratar o agendamento por consentimento, com revogação. Os dois textos
  **nunca** podem ficar diferentes.
- O link `https://nekkora.com/#privacidade` só deve ser configurado depois da publicação do site (AUD-44).
- Recomendação: campo "Empresa" **opcional** no Bookings, como no site (AUD-37).
- Gravação de reuniões: **não decidida**. O aviso não promete nem nega gravação. Se houver gravação, ela precisa de
  aviso específico antes da reunião.

## 5. Transferência internacional (AUD-40) ⚖

O aviso diz só o que é fato: os serviços da Microsoft e da AWS **podem** processar dados fora do Brasil. Faltam:

- confirmar a região do bucket S3 e da distribuição (a auditoria AWS não registrou a região do bucket);
- confirmar a região do tenant do Microsoft 365;
- verificar se os termos da AWS e da Microsoft atendem ao art. 33 (Res. CD/ANPD nº 19/2024).

## 6. Pendências antes de aprovar o aviso

| # | Pendência | Responsável |
|---|---|---|
| 1 | Razão social em `publicacao.json → controlador.nome` (PUB-09) | Titular |
| 2 | Revisão jurídica: base legal, transferência internacional, enquadramento como agente de pequeno porte e encarregado, identificação do fornecedor (Decreto 7.962/2013) | Advogado(a) |
| 3 | Procedimento de retenção (manual ou M365) e responsável | Titular |
| 4 | Texto do Bookings (§4) configurado no M365 | Titular (fora desta missão) |
| 5 | Decisão sobre gravação de reuniões | Titular |
| 6 | `aprovacoes.avisoDePrivacidade: true` **somente** depois dos itens 1 a 4 | Titular |
