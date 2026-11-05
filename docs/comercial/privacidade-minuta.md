# Minuta — privacidade do Nekkora Commercial, do Microsoft Bookings e das gravações do Teams

> **MINUTA NÃO APROVADA JURIDICAMENTE.** Preparada na NEKKORA-COM-008-C a partir das diretrizes da titular na
> COM-008-B e **atualizada na NEKKORA-COM-PRIVACY-001 (05/11/2026)** com as decisões sobre gravação e as evidências da
> homologação do Bookings e do Teams. A revisão jurídica é obrigatória antes da aprovação:
> `aprovacoes.avisoDePrivacidade` continua `false` e o portão continua bloqueando (PUB-09). Atualiza a minuta técnica
> anterior ([`COM-RELEASE-005-privacidade.md`](../release/COM-RELEASE-005-privacidade.md)), que segue valendo no que
> não foi alterado aqui (inventário técnico do envio automático, bases legais por finalidade, revisão de segurança).
>
> **Nada foi alterado no Microsoft 365 pelo agente.** As configurações descritas em §4a foram feitas e verificadas pela
> titular; o texto do Bookings em §4 é uma proposta para a titular configurar.

## 1. O que mudou no aviso do site (`src/content.ts → PRIVACY`)

Texto completo gerado em [`05-texto-comercial.md` §7a](../com-001/05-texto-comercial.md). Na variante com envio
automático: [`texto-com-envio-automatico-e-bookings.md` §7a](../release/com-release-005/texto-com-envio-automatico-e-bookings.md).

| Tema | Antes | Agora (em revisão) | AUD |
|---|---|---|---|
| Controlador | "a Nekkora" | "NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA (CNPJ 68.337.624/0001-32)", lidos de `publicacao.json → controlador` (razão social informada pela titular em 04/11/2026) | AUD-33 |
| Microsoft Bookings | "…usados para realizar a conversa" | "…usados para confirmar e lembrar o horário e realizar a conversa **pelo Microsoft Teams**" | AUD-38 |
| **Gravação da conversa** (novo, COM-PRIVACY-001) | O aviso não tratava de gravação | Novo item **"Gravação da conversa"** (§4a): pode ser gravada; nunca automaticamente; só com aviso e concordância específica pedida pelo Teams; o participante pode não concordar; acesso restrito e sem link público | AUD-38 |
| Cookies | "Não usamos cookies…" | "**Esta página** não usa cookies…; **o simulador de investimento não guarda nem envia** o que você seleciona… O Microsoft Bookings… segue as regras da Microsoft" | AUD-43 |
| Retenção | "pelo tempo necessário… ou exigido por lei" | Item **"Por quanto tempo guardamos"** (§3), agora com o **prazo padrão de 30 dias** das gravações | AUD-39 |
| Transferência internacional | Ausente | Item **"Onde os dados são processados"**: Microsoft (M365, Bookings e Teams) e AWS podem processar dados fora do Brasil | AUD-40 |
| Base legal e consentimento | art. 7º, V | Mantido o art. 7º, V para o atendimento. "Se algum outro uso depender de consentimento, ele será pedido à parte." A base legal **da gravação** não é afirmada no aviso (JUR-10) | AUD-35 |
| Direitos | confirmação, acesso, correção, exclusão, compartilhamento | + anonimização, bloqueio, portabilidade e revogação do consentimento, quando houver (art. 18) | — |
| Formulário | "nome, empresa, e-mail e descrição" | + tipo de solicitação e, **se o visitante incluir**, o resumo da simulação | — |

Texto do novo item (só aparece com a URL do Bookings, como os demais itens que citam o Teams):

> **Gravação da conversa** — A conversa pelo Microsoft Teams pode ser gravada para registrar o que foi conversado e
> apoiar a avaliação e a proposta. A gravação nunca é automática: só começa com aviso, e o próprio Teams pede a sua
> concordância específica. Você pode não concordar. A gravação fica no Microsoft 365 da Nekkora, com acesso restrito e
> sem link de acesso público.

O que o texto **não** afirma, de propósito:

- **eliminação definitiva em 30 dias**: só a expiração padrão foi verificada (§4a). O aviso diz "prazo padrão";
- **o que acontece quando alguém não concorda**: o Teams restringe a participação de quem não concorda (microfone,
  câmera e tela), mas a conduta da Nekkora nesse caso (parar a gravação ou seguir sem ela) ainda não foi definida
  (OPS-05). O aviso diz só "você pode não concordar";
- **quem exatamente tem acesso**: só foram verificados a remoção do link público e a ausência de compartilhamento com
  grupos no arquivo testado. O aviso diz "acesso restrito";
- **base legal da gravação** (JUR-10).

## 2. Aceite, ciência, consentimento e concordância com a gravação

| Figura | O que é | Onde se aplica |
|---|---|---|
| **Aceite das condições** | Concordância com proposta e contrato (obrigação contratual) | Proposta comercial e contrato. Não no site |
| **Ciência da política de privacidade** | O titular declara que foi informado. **Não é base legal** e não precisa de revogação | Bookings (caixa "Li e entendi", §4); site (aviso sempre visível) |
| **Consentimento** (art. 7º, I) | Base legal própria, livre, específica e **revogável** | Só para finalidades que dependam dele (ex.: marketing) |
| **Concordância específica com a gravação** (COM-PRIVACY-001) | Pedida pelo próprio Teams no início da gravação, a cada participante, separada do agendamento | Reuniões comerciais gravadas. ⚖ A revisão jurídica deve dizer se ela funciona como **consentimento** (art. 7º, I — então revogável, com consequência definida para a revogação) ou se a gravação se apoia em outra base (art. 7º, V ou IX) e a concordância é uma salvaguarda de transparência (JUR-10) |

Base adotada para responder, agendar e preparar avaliação e proposta: **art. 7º, V** (procedimentos preliminares a
pedido do titular). ⚖ A revisão jurídica deve confirmar se o art. 7º, V se aplica quando quem entra em contato é
empregado de uma empresa, ou se é melhor o legítimo interesse (art. 7º, IX) com teste de balanceamento.

## 3. Retenção

| Dados | Prazo aprovado **[D]** | Como é cumprido hoje |
|---|---|---|
| Contatos sem contratação (e-mails e mensagens na caixa comercial, LinkedIn) | **Até seis meses** após o último contato relevante | **Manual**, sob responsabilidade da titular. Não há rotina automática. Sugestão: revisão mensal da caixa `contato@`, com registro da data |
| Reservas do Microsoft Bookings | **Até 90 dias** após a reunião ou o cancelamento | **Manual**, sob responsabilidade da titular. Nenhuma política de retenção do M365 foi configurada para reservas |
| **Gravações de reuniões do Teams** (COM-PRIVACY-001) | **Prazo padrão de 30 dias** após a reunião | **Expiração padrão do Teams/OneDrive**, verificada visualmente no SharePoint no arquivo de teste. A eliminação definitiva **não** foi comprovada (depois de expirar, o arquivo segue o ciclo de lixeira do Microsoft 365, ainda não observado). Quem é dono da gravação pode alterar a data de expiração de um arquivo: a revisão manual da titular deve conferir que nenhuma gravação teve o prazo estendido sem motivo |
| Dados ligados a uma contratação | Prazos do contrato e os exigidos por lei (fiscais, defesa de direitos) | Conforme o contrato ⚖ |
| Preferência de tema (`localStorage`) | Até o visitante limpar | Automático, no navegador do visitante |
| Simulador de investimento | **Nada é guardado** | Estado só na memória da página; testado (sem storage, cookie, IndexedDB ou requisição) |

**O aviso descreve o prazo, não uma eliminação automática.** O texto diz "ficam guardados por até…" e, para as
gravações, "prazo padrão". Ele **não** diz que a eliminação é automática ou definitiva. A revisão e a eliminação são,
inicialmente, **manuais e de responsabilidade da titular** (decisão de 05/11/2026). Falta registrar o procedimento
(periodicidade e registro de execução) — OPS-01.

Transcrições e anotações automáticas do Teams (se habilitadas) e o chat da reunião **não** foram verificados nesta
missão e não estão cobertos pelo prazo de 30 dias acima (OPS-06).

## 4. Texto alternativo para o Microsoft Bookings (para a titular configurar no M365)

Corrige a base legal (AUD-35), retira "telefone" (AUD-36), inclui o Teams (AUD-38), a possibilidade de gravação
(COM-PRIVACY-001) e o link do aviso (AUD-44):

> Para agendar a conversa, a Nekkora usa o seu nome, o seu e-mail e as respostas deste formulário (empresa e processo,
> quando informados). Esses dados servem para confirmar e lembrar o horário, realizar a reunião pelo Microsoft Teams e
> responder à sua solicitação, a seu pedido (LGPD, art. 7º, V). A reunião pode ser gravada, mas só com aviso e com a
> sua concordância específica, pedida pelo Teams no início da gravação; você pode não concordar. Gravações têm acesso
> restrito e prazo padrão de 30 dias após a reunião. O agendamento e a reunião usam o Microsoft Bookings e o Microsoft
> Teams (Microsoft 365), que podem processar dados fora do Brasil. As reservas ficam guardadas por até 90 dias após a
> reunião ou o cancelamento. Saiba mais em https://nekkora.com/#privacidade. Dúvidas ou pedidos sobre seus dados:
> contato@nekkora.com. Não inclua senhas nem informações sigilosas.
>
> ☐ Li e entendi como meus dados serão usados.

- A caixa é de **ciência**, não de consentimento — nem para a gravação: a concordância com a gravação é pedida pelo
  Teams, na reunião. Se a titular preferir manter "Ao marcar esta caixa, você concorda", o aviso do site e esta minuta
  precisam passar a tratar o agendamento por consentimento, com revogação. Os dois textos **nunca** podem ficar
  diferentes.
- O link `https://nekkora.com/#privacidade` só deve ser configurado depois da publicação do site (AUD-44).
- Recomendação: campo "Empresa" **opcional** no Bookings, como no site (AUD-37).

## 4a. Gravações de reuniões comerciais (COM-PRIVACY-001)

### Decisão da titular

As reuniões comerciais **podem** ser gravadas, com aviso e concordância específica dos participantes. **Não há
gravação automática** (nem foi implementada nesta missão). Revisão e eliminação inicialmente manuais, pela titular.

### Configuração homologada pela titular (evidências em [`evidencias/com-privacy-001`](../release/evidencias/com-privacy-001/README.md))

| Controle | Situação | Como foi verificado |
|---|---|---|
| Serviço do Bookings | "Conversa inicial — Nekkora Delivery", 30 minutos, reunião pelo Teams | Configuração do Bookings |
| Conta responsável pela reunião | `nicolly@nekkora.com` (conta corporativa, organizadora) | Configuração do Bookings |
| Política de reunião do Teams | Política personalizada `Nekkora-Commercial` criada e atribuída à conta responsável | Centro de administração do Teams |
| Concordância explícita com a gravação | O Teams exibiu a solicitação de concordância | **Reunião real de teste** |
| Gravação automática | Não configurada | Decisão da titular; nenhuma alteração do agente |
| Expiração padrão | 30 dias após a reunião | **Visualmente**, no SharePoint, no arquivo de teste |
| Acesso público por link | **Removido** | Painel de compartilhamento do arquivo de teste |
| Compartilhamento com grupos | Nenhum identificado | Painel de acesso do arquivo **testado** (um arquivo; não é uma auditoria do tenant) |

O tenant usa o domínio histórico `radiantsai-my.sharepoint.com` (OneDrive), administrado pela titular. É o local
esperado das gravações e **não** deve ser renomeado (renomear o domínio SharePoint quebra links e integrações).

### Limites do que foi comprovado

- **Eliminação definitiva em 30 dias: não comprovada.** Só a data de expiração padrão foi vista. Para comprová-la é
  preciso acompanhar uma gravação de teste até depois do vencimento e do ciclo da lixeira (OPS-07).
- A verificação de acesso cobre **o arquivo testado**. O padrão de compartilhamento do tenant para novas gravações não
  foi auditado (OPS-08).
- O comportamento do Teams com **participante externo que recusa** a gravação e a conduta da Nekkora nesse caso ainda
  não foram registrados (OPS-05).

## 5. Transferência internacional (AUD-40) ⚖

O aviso diz só o que é fato: os serviços da Microsoft e da AWS **podem** processar dados fora do Brasil. Faltam:

- confirmar a região do bucket S3 e da distribuição (a auditoria AWS não registrou a região do bucket);
- confirmar a região do tenant do Microsoft 365 (inclusive onde ficam as gravações do OneDrive/SharePoint);
- verificar se os termos da AWS e da Microsoft atendem ao art. 33 (Res. CD/ANPD nº 19/2024).

## 6. Pendências antes de aprovar o aviso

| # | Pendência | Responsável |
|---|---|---|
| 1 | ~~Razão social em `publicacao.json → controlador.nome`~~ **Informada em 04/11/2026** | Titular |
| 2 | Revisão jurídica: base legal do atendimento **e da gravação**, transferência internacional, enquadramento como agente de pequeno porte e encarregado, identificação do fornecedor (Decreto 7.962/2013) — JUR-06 a JUR-10 | Advogado(a) |
| 3 | Procedimento de retenção manual (periodicidade, registro de execução) para contatos, reservas e gravações — OPS-01 | Titular |
| 4 | Texto do Bookings (§4) configurado no M365 — OPS-02 | Titular (fora desta missão) |
| 5 | ~~Decisão sobre gravação de reuniões~~ **Decidida e homologada** (§4a); restam OPS-05 a OPS-08 | Titular |
| 6 | `aprovacoes.avisoDePrivacidade: true` **somente** depois dos itens 2 a 4 | Titular |
