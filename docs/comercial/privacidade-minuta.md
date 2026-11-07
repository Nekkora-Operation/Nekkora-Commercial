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
>
> **Revisão interna NEKKORA-COM-LEGAL-BASE-001 (05/11/2026).** Não é parecer jurídico e não substitui a revisão por
> advogado(a), que a titular adiou temporariamente. O que mudou: **sem gravação comercial nesta fase** (diretriz da
> titular na missão), com o aviso do site corrigido (§1 e §4a); inventário de tratamentos (§6); bases legais candidatas
> revisadas (§2); controles operacionais em
> [`procedimento-retencao-e-direitos.md`](procedimento-retencao-e-direitos.md); transferência internacional e agente de
> pequeno porte com fontes (§5, §7). Fontes e matriz de riscos:
> [`NEKKORA-COM-LEGAL-BASE-001.md`](../release/NEKKORA-COM-LEGAL-BASE-001.md). `aprovacoes.avisoDePrivacidade` continua
> `false`.

## 1. O que mudou no aviso do site (`src/content.ts → PRIVACY`)

Texto completo gerado em [`05-texto-comercial.md` §7a](../com-001/05-texto-comercial.md). Na variante com envio
automático: [`texto-com-envio-automatico-e-bookings.md` §7a](../release/com-release-005/texto-com-envio-automatico-e-bookings.md).

| Tema | Antes | Agora (em revisão) | AUD |
|---|---|---|---|
| Controlador | "a Nekkora" | "NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA (CNPJ 68.337.624/0001-32)", lidos de `publicacao.json → controlador` (razão social informada pela titular em 04/11/2026) | AUD-33 |
| Microsoft Bookings | "…usados para realizar a conversa" | "…usados para confirmar e lembrar o horário e realizar a conversa **pelo Microsoft Teams**" | AUD-38 |
| **Gravação da conversa** (novo, COM-PRIVACY-001) | O aviso não tratava de gravação | Novo item **"Gravação da conversa"** (§4a): pode ser gravada; nunca automaticamente; só com aviso e concordância específica pedida pelo Teams; o participante pode não concordar; acesso gerenciado pela Nekkora conforme as permissões de cada arquivo | AUD-38 |
| Cookies | "Não usamos cookies…" | "**Esta página** não usa cookies…; **o simulador de investimento não guarda nem envia** o que você seleciona… O Microsoft Bookings… segue as regras da Microsoft" | AUD-43 |
| Retenção | "pelo tempo necessário… ou exigido por lei" | Item **"Por quanto tempo guardamos"** (§3), agora com o **prazo padrão de 30 dias** das gravações | AUD-39 |
| Transferência internacional | Ausente | Item **"Onde os dados são processados"**: Microsoft (M365, Bookings e Teams) e AWS podem processar dados fora do Brasil | AUD-40 |
| Base legal e consentimento | art. 7º, V | Mantido o art. 7º, V para o atendimento. "Se algum outro uso depender de consentimento, ele será pedido à parte." A base legal **da gravação** não é afirmada no aviso (JUR-10) | AUD-35 |
| Direitos | confirmação, acesso, correção, exclusão, compartilhamento | + anonimização, bloqueio, portabilidade e revogação do consentimento, quando houver (art. 18) | — |
| Formulário | "nome, empresa, e-mail e descrição" | + tipo de solicitação e, **se o visitante incluir**, o resumo da simulação | — |

**Substituído na LEGAL-BASE-001 (05/11/2026).** Sem gravação comercial nesta fase, o item "Gravação da conversa" e a
frase das gravações em "Por quanto tempo guardamos" descreveriam um tratamento que não ocorre. A LGPD exige informação
clara, precisa e facilmente acessível sobre o tratamento (art. 6º, VI; art. 9º). O item passou a ser:

> **Conversa sem gravação** — Nesta fase, a Nekkora não grava as conversas comerciais pelo Microsoft Teams. Se isso
> mudar, este aviso será atualizado antes, e a gravação só acontecerá com aviso prévio.

E saiu do item de retenção a frase "Gravações de conversas, quando houver, têm prazo padrão de 30 dias após a reunião".
**Afeta o texto aprovado em 05/11/2026 (PUB-17): precisa de nova aprovação da titular.** Gravar no futuro exige: base
legal definida (JUR-10), novo texto do aviso e do Bookings, conduta para a recusa (OPS-05) e nova aprovação.

Texto anterior (COM-PRIVACY-001), mantido só como histórico:

> ~~**Gravação da conversa** — A conversa pelo Microsoft Teams pode ser gravada para registrar o que foi conversado e
> apoiar a avaliação e a proposta. A gravação nunca é automática: só começa com aviso, e o próprio Teams pede a sua
> concordância específica. Você pode não concordar. As gravações ficam no Microsoft 365, com acesso gerenciado pela
> Nekkora conforme as permissões de cada arquivo.~~

O que o texto anterior **não** afirmava, de propósito (vale de novo se a gravação voltar):

- **eliminação definitiva em 30 dias**: só a expiração padrão foi verificada (§4a). O aviso diz "prazo padrão";
- **o que acontece quando alguém não concorda**: o Teams restringe a participação de quem não concorda (microfone,
  câmera e tela), mas a conduta da Nekkora nesse caso (parar a gravação ou seguir sem ela) ainda não foi definida
  (OPS-05). O aviso diz só "você pode não concordar";
- **quem exatamente tem acesso**: só foram verificados a remoção do link público e a ausência de compartilhamento com
  grupos no arquivo testado. Por isso o aviso **não** diz "sem link público" para todas as gravações: diz que o acesso é
  gerenciado pela Nekkora conforme as permissões de cada arquivo (revisão do PR #12);
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

**LEGAL-BASE-001 — proposta do agente (a decidir).** Pelo texto do art. 7º, V, a base cobre "procedimentos preliminares
relacionados a contrato **do qual seja parte o titular**, a pedido do titular". **Interpretação:** quando quem escreve
é o próprio contratante (pessoa física, empresário individual, sócio que contrata em nome próprio), o inciso V se
encaixa. Quando é **empregado ou representante de uma empresa**, o titular não será parte do contrato, e o encaixe
fica frágil. Para esses casos, a base candidata é o **legítimo interesse** (art. 7º, IX; art. 10, I e II, §§ 1º e 2º),
com registro de avaliação (art. 37). Proposta de texto para o aviso, que **exige nova aprovação dos textos (PUB-17) e
do aviso (PUB-09)**: "…a seu pedido (LGPD, art. 7º, V) ou, quando você fala em nome de uma empresa, no interesse
legítimo de responder ao contato (art. 7º, IX)". **Não aplicado ao site.**

## 3. Retenção

| Dados | Prazo aprovado **[D]** | Como é cumprido hoje |
|---|---|---|
| Contatos sem contratação (e-mails e mensagens na caixa comercial, LinkedIn) | **Até seis meses** após o último contato relevante | **Manual**, sob responsabilidade da titular. Não há rotina automática. Revisão **semanal** ([procedimento](procedimento-retencao-e-direitos.md), R1), com registro da data |
| Reservas do Microsoft Bookings | **Até 90 dias** após a reunião ou o cancelamento | **Manual**, sob responsabilidade da titular. Nenhuma política de retenção do M365 foi configurada para reservas |
| ~~Gravações de reuniões do Teams~~ **Sem gravação nesta fase** (LEGAL-BASE-001). Histórico (COM-PRIVACY-001): | **Prazo padrão de 30 dias** após a reunião | **Expiração padrão do Teams/OneDrive**, verificada visualmente no SharePoint no arquivo de teste. A eliminação definitiva **não** foi comprovada (depois de expirar, o arquivo segue o ciclo de lixeira do Microsoft 365, ainda não observado). Quem é dono da gravação pode alterar a data de expiração de um arquivo: a revisão manual da titular deve conferir que nenhuma gravação teve o prazo estendido sem motivo |
| Dados ligados a uma contratação | Prazos do contrato e os exigidos por lei (fiscais, defesa de direitos) | Conforme o contrato ⚖ |
| Preferência de tema (`localStorage`) | Até o visitante limpar | Automático, no navegador do visitante |
| Simulador de investimento | **Nada é guardado** | Estado só na memória da página; testado (sem storage, cookie, IndexedDB ou requisição) |

**O aviso descreve o prazo, não uma eliminação automática.** O texto diz "ficam guardados por até…" e, para as
gravações, "prazo padrão". Ele **não** diz que a eliminação é automática ou definitiva. A revisão e a eliminação são,
inicialmente, **manuais e de responsabilidade da titular** (decisão de 05/11/2026). Falta registrar o procedimento
(periodicidade e registro de execução) — OPS-01. **Registrado na LEGAL-BASE-001:** [`procedimento-retencao-e-direitos.md`](procedimento-retencao-e-direitos.md) (revisão semanal desde a R1, com corte de 5 meses e 60 dias e registro sem dados pessoais).

Transcrições e anotações automáticas do Teams (se habilitadas) e o chat da reunião **não** foram verificados nesta
missão e não estão cobertos pelo prazo de 30 dias acima (OPS-06).

## 4. Texto alternativo para o Microsoft Bookings (para a titular configurar no M365)

Corrige a base legal (AUD-35), retira "telefone" (AUD-36), inclui o Teams (AUD-38), a possibilidade de gravação
(COM-PRIVACY-001) e o link do aviso (AUD-44):

> Para agendar a conversa, a Nekkora usa o seu nome, o seu e-mail e as respostas deste formulário (empresa e processo,
> quando informados). Esses dados servem para confirmar e lembrar o horário, realizar a reunião pelo Microsoft Teams e
> responder à sua solicitação, a seu pedido (LGPD, art. 7º, V). Nesta fase, a Nekkora não grava as conversas comerciais.
> O agendamento e a reunião usam o Microsoft Bookings e o Microsoft
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

### Diretriz vigente (LEGAL-BASE-001, 05/11/2026)

**Sem gravação comercial nesta fase.** O que segue nesta seção registra a decisão e a homologação anteriores
(COM-PRIVACY-001). A configuração continua no tenant: a política `Nekkora-Commercial` **permite** gravar com
concordância. Na R1 o agente recomendou desligar a gravação, a transcrição e o Copilot nessa política. A titular decide e executa (CTL-01,
[procedimento do Teams](procedimento-teams-sem-gravacao.md)). O agente não alterou o Microsoft 365.

### Decisão anterior da titular (COM-PRIVACY-001)

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

- ~~confirmar a região do bucket S3~~ **`sa-east-1` (São Paulo)**, segundo a auditoria AWS no CloudShell
  (`inventory.bucket.regiao`; INF-01, 27/10/2026), conforme a revisão do PR #12. A saída da auditoria não está
  versionada. O armazenamento do site fica no Brasil, mas o **CloudFront** entrega a partir de pontos de presença no
  mundo todo, e o envio automático (se ativado) e o SES dependem da região escolhida para eles. Por isso o aviso
  continua dizendo que a AWS **pode** processar dados fora do Brasil;
- confirmar a região do tenant do Microsoft 365 (inclusive onde ficam as gravações do OneDrive/SharePoint);
- verificar se os termos da AWS e da Microsoft atendem ao art. 33 (Res. CD/ANPD nº 19/2024).

### 5.1 Revisão LEGAL-BASE-001 (05/11/2026) — o que as fontes oficiais mostram

| Ponto | Fato verificado (fonte, 05/11/2026) | Efeito |
|---|---|---|
| Mecanismos | LGPD art. 33: países adequados (I); cláusulas específicas, **cláusulas-padrão**, normas corporativas, selos (II); entre outros, quando necessário para as hipóteses do **art. 7º, II, V e VI** (IX). Res. 19/2024, Anexo I, art. 9º: a transferência exige uma **base legal** e um **mecanismo válido** | É preciso indicar um mecanismo para cada provedor |
| Cláusulas-padrão (CPC) | Res. 19/2024, Anexo I, art. 16: valem só com a **adoção integral e sem alteração** do Anexo II. Prazo de 12 meses da publicação (23/08/2024) para incorporá-las (art. 2º, parágrafo único) | Um contrato com cláusulas estrangeiras **não basta por si só** |
| Cláusulas estrangeiras | Res. 19/2024, arts. 18 a 20: equivalência só por resolução do Conselho Diretor. **Nenhuma** resolução de equivalência consta da lista oficial da ANPD | As SCCs europeias **não** valem automaticamente como CPC |
| União Europeia | **Res. CD/ANPD nº 32/2026** (DOU 27/01/2026): a UE e o EEE são reconhecidos como **adequados** (art. 33, I) | Dados que vão **para a UE ou o EEE** têm mecanismo. Os que vão para os EUA ou outros países, não |
| Microsoft | DPA de Produtos e Serviços (versão de 01/11/2026): **sem menção** a Brasil, ANPD ou LGPD. As transferências citadas são as que saem da UE (SCCs de 2021) | **Sem CPC brasileira verificável** para o tenant |
| AWS | DPA da AWS (PDF sem data visível): **sem menção** a ANPD ou LGPD. A página "Brazil Data Privacy" diz que o DPA "meets the requirements of LGPD", sem citar as CPC | **Sem CPC brasileira verificável** |
| Transparência | Res. 19/2024, Anexo I, art. 17: entregar a íntegra das cláusulas em 15 dias, a pedido; **publicar** no site, em português, a forma, a duração, a finalidade, o **país de destino**, o controlador, o compartilhamento, as responsabilidades e os direitos (§2º), podendo integrar o aviso de privacidade (§3º) | Se a Nekkora usar CPC, o aviso precisa de um item de transferência mais completo que o atual |

**Interpretação (a confirmar):** o caminho de menor risco para o lançamento é: (a) confirmar a **região do tenant
Microsoft 365** (Exchange, Bookings, OneDrive) e a região de cada serviço AWS em uso; (b) para dados que ficam no Brasil,
**não há transferência**. A entrega do site pelo CloudFront a partir de outros países é tema próprio: o Anexo I, art.
6º, diz que a "coleta internacional" não é transferência; (c) para dados que vão para a UE ou o EEE, usar a adequação
(Res. 32/2026); (d) para o contato e o agendamento a pedido de quem contrata em nome próprio (art. 7º, V), o art. 33, IX, é **candidato**. Ele **não** cobre o representante de empresa (art. 7º, IX): para esse caso, só há as CPC (II) ou o consentimento específico (VIII); ver [JUR-07](../release/NEKKORA-COM-GOLIVE-001-JUR-07.md) §2 e §3. Há
um risco: "necessário" pode ser lido de forma estrita, porque usar um provedor estrangeiro é escolha do controlador; (e)
para o que não couber em (b) a (d), formalizar as CPC com o provedor ou mudar a configuração. **Nada disso está
comprovado hoje.** O aviso continua dizendo só que os dados "podem" ser processados fora do Brasil, e **não** afirma
que há mecanismo. Pendência impeditiva da aprovação do aviso: JUR-07.

## 6. Inventário de tratamentos (LEGAL-BASE-001)

Cada base é **candidata**, ou seja, interpretação do agente, até haver revisão. "Evidência" é só o que foi testado ou
visto. O que não foi verificado aparece como pendência.

| Finalidade | Dados | Origem | Base candidata | Controlador / operadores | Localização | Retenção e eliminação | Evidência disponível | Pendência |
|---|---|---|---|---|---|---|---|---|
| Responder a contato por **e-mail** | Nome, e-mail, empresa, descrição do processo, resumo do simulador (se incluído) | Titular (mensagem enviada pelo próprio aplicativo) | Art. 7º, V (contratante) ou IX (representante de empresa) | Nekkora (controladora) · Microsoft (operadora, Exchange Online) | Região do tenant **não verificada** | Até 6 meses após o último contato relevante; revisão **manual semanal** com corte de 5 meses ([procedimento](procedimento-retencao-e-direitos.md) §1 e §2). Registro de "exclusão realizada"; eliminação definitiva **não comprovada** (OPS-09) | mailto exato homologado no CI; o site não envia nada | Recebimento externo (REP-04/CTL-05); itens recuperáveis (OPS-09); região |
| Responder a contato pelo **LinkedIn** | Nome, perfil, mensagem | Titular | Art. 7º, V ou IX | Nekkora (controladora das mensagens recebidas) · LinkedIn (**controlador independente** da plataforma) | Fora do controle da Nekkora | 6 meses; exclusão manual da conversa (a cópia do LinkedIn e a do interlocutor permanecem) | — | Registrar no aviso que o LinkedIn tem política própria (proposta; exige aprovação) |
| **Agendamento** (Bookings), lembretes e notificações | Nome, e-mail, respostas (empresa, processo), horário | Titular, na página do Bookings | Art. 7º, V ou IX | Nekkora · Microsoft (operadora: Bookings, Exchange) | Região **não verificada** | 90 dias após a reunião ou o cancelamento; revisão **manual semanal** com corte de 60 dias ([procedimento](procedimento-retencao-e-direitos.md) §1 e §2). Exclusão de reservas passadas não verificada (OPS-10) | Serviço homologado pela titular (COM-007, COM-PRIVACY-001) | Texto real do Bookings (OPS-02/CTL-03); exclusão de reservas (OPS-10) |
| **Reunião** pelo Teams | Nome, e-mail, imagem e voz em tempo real, chat da reunião | Participantes | Art. 7º, V ou IX | Nekkora · Microsoft (operadora) | Região **não verificada** | **Sem gravação nesta fase.** Chat, transcrição e anotações: **não verificados** | Política `Nekkora-Commercial` atribuída; pedido de concordância exibido (COM-PRIVACY-001) | CTL-01 (política ainda permite gravar); OPS-06 |
| **Entrega do site** (CloudFront/S3) | IP, navegador, URL, data e hora, em trânsito | Navegador do visitante | Art. 7º, IX (entregar e proteger o serviço) | Nekkora · AWS (operadora) | Bucket em `sa-east-1`; pontos de presença no mundo todo | Em trânsito: não guardado pela Nekkora | Auditoria AWS (INF-01) | — |
| **Registros de acesso** (LOG-01, **preparado, não aplicado**) | Data, horário (UTC), IP e porta de origem, domínio acessado (`x-host-header`). **Sem** URL da página, user agent, referer ou cookies (campos mínimos, [`deploy/aws/logs/README.md`](../../deploy/aws/logs/README.md)) | CloudFront (standard logging v2) | **Art. 7º, II** (obrigação legal: Marco Civil, art. 15) | Nekkora · AWS (operadora) | Bucket privado de logs em `sa-east-1` | Guarda mínima de **6 meses**. Expiração no ciclo de vida do S3 em **190 dias** após a criação de cada arquivo; a remoção é assíncrona e pode levar alguns dias a mais. O texto [PV-12] diz isso, não "apagados ao fim de 6 meses". Acesso só pela titular; fornecimento só por ordem judicial (Marco Civil, art. 10, §1º, e art. 15, §3º) | Nenhuma ainda: depende da configuração na AWS **autorizada pela titular** e da conferência §4 do README | Ativar na AWS → conferir → integrar o texto [PV-12] → PUB-09/PUB-17 |
| **Tema** (claro ou escuro) | Preferência | Navegador | Não é dado pessoal enviado à Nekkora (fica no aparelho) | — | Aparelho do visitante | Até o visitante limpar | Homologação (sem cookies; `localStorage` só do tema) | — |
| **Simulador** | Nada é guardado nem enviado | — | — | — | Memória da página | — | Homologação NEKKORA-CALC-001 | — |
| Pedidos dos **titulares** (art. 18) | Identificação mínima e pedido | Titular | Art. 7º, II (obrigação legal) | Nekkora · Microsoft | Região não verificada | Registro só com datas e tipo, sem dados pessoais | — | Executar conforme o procedimento §3 |

## 7. Agente de tratamento de pequeno porte e canal do titular (JUR-08)

| Ponto | Norma (texto vigente, 05/11/2026) | Situação da Nekkora |
|---|---|---|
| Quem é | Res. CD/ANPD nº 2/2022, art. 2º, I e II: microempresas e empresas de pequeno porte (LC 123/2006, art. 3º), inclusive a sociedade limitada unipessoal | **Provável**: LTDA de desenvolvimento de software. **Falta a titular confirmar** o enquadramento como ME ou EPP e a receita bruta |
| Quem fica de fora | Art. 3º: tratamento de alto risco; receita acima do limite da LC 123, art. 3º, II; grupo econômico acima do limite | **Interpretação:** o tratamento do Commercial não atende a nenhum critério específico do art. 4º, II (não há dados sensíveis, vigilância, decisão automatizada nem tecnologia emergente). Logo, **não é de alto risco**. A titular confirma receita e grupo |
| Encarregado | Art. 11: dispensa da indicação; §1º: **canal de comunicação** com o titular (para LGPD, art. 41, §2º, I); Res. 18/2024, Anexo, art. 3º, §3º, no mesmo sentido | Canal: `contato@nekkora.com`, já citado no aviso. **Proposta (exige aprovação):** dizer no aviso "canal para assuntos de dados pessoais", porque a dispensa vale para o encarregado, não para o canal |
| Prazos | Art. 14: **prazo em dobro** para atender o titular (I) e para a declaração completa do art. 19, II (III); art. 15: declaração simplificada em até 15 dias | Meta interna mantida em 15 dias ([procedimento](procedimento-retencao-e-direitos.md) §3). O prazo em dobro é limite, não meta |
| Registro das operações | LGPD art. 37; Res. 2/2022, art. 9º (registro **simplificado**, com modelo da ANPD) | O inventário do §6 é a base. **Proposta:** transcrever para o modelo da ANPD |
| Comprovação | Res. 2/2022, art. 5º: comprovar o enquadramento em até 15 dias, quando a ANPD pedir | Guardar comprovante de enquadramento (fora do repositório) |
| Limite da dispensa | Res. 2/2022, art. 6º: a flexibilização **não isenta** das bases legais, dos princípios e dos direitos dos titulares | — |

## 8. Pendências antes de aprovar o aviso

| # | Pendência | Responsável |
|---|---|---|
| 1 | ~~Razão social em `publicacao.json → controlador.nome`~~ **Informada em 04/11/2026** | Titular |
| 2 | Revisão jurídica: base legal do atendimento **e da gravação**, transferência internacional, enquadramento como agente de pequeno porte e encarregado, identificação do fornecedor (Decreto 7.962/2013) — JUR-06 a JUR-10 | Advogado(a) |
| 3 | ~~Procedimento de retenção manual~~ **Registrado** em [`procedimento-retencao-e-direitos.md`](procedimento-retencao-e-direitos.md) (LEGAL-BASE-001). Falta a **primeira execução** registrada e OPS-09/OPS-10 — OPS-01 | Titular |
| 4 | Texto do Bookings (§4, agora **sem gravação**) configurado no M365 — OPS-02 | Titular (fora desta missão) |
| 5 | Gravação: **sem gravação nesta fase** (LEGAL-BASE-001). Decidir se a política do Teams deixa de permitir gravação (CTL-01). Gravar no futuro: JUR-10, OPS-05 a OPS-08 | Titular |
| 6 | **Transferência internacional** (§5.1): região do tenant e dos serviços AWS e mecanismo por provedor — JUR-07 | Titular + revisão |
| 7 | Enquadramento como agente de pequeno porte (§7): ME/EPP, receita, grupo — JUR-08 | Titular |
| 8 | **Nova aprovação dos textos**: o aviso mudou na LEGAL-BASE-001 (item da gravação e retenção) — PUB-17 | Titular |
| 9 | `aprovacoes.avisoDePrivacidade: true` **somente** depois dos itens 2 a 8 | Titular |
