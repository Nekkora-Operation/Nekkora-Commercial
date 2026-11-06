# Procedimento operacional: reuniões comerciais sem gravação no Microsoft Teams (CTL-01)

> **NEKKORA-COM-LEGAL-BASE-001-R1, de 05/11/2026.** Checklist para a titular executar no centro de administração do
> Teams **depois de autorizar a mudança**. O agente **não alterou** o Microsoft 365. Este documento não afirma que a
> gravação ou a transcrição estejam desligadas. **CTL-01 continua pendente** até a titular registrar a evidência do §5.
> Não é parecer jurídico.

## 1. Decisão e política desejada

| Tipo | Conteúdo |
|---|---|
| **Diretriz da titular** (LEGAL-BASE-001) | No lançamento inicial, a Nekkora **não grava** reuniões comerciais. O aviso do site já diz isso ("Conversa sem gravação") |
| **Evidência operacional** (COM-PRIVACY-001) | A política personalizada `Nekkora-Commercial`, atribuída à conta organizadora, **ainda permite** iniciar gravação com concordância dos participantes. Não há gravação automática configurada |
| **Risco** | Hoje, quem impede a gravação é só a conduta. A configuração ainda permite iniciá-la manualmente, e uma gravação contrariaria o aviso publicado (LGPD, art. 6º, VI, e art. 9º) |
| **Proposta do agente** | Tornar a política `Nekkora-Commercial` restritiva durante a fase inicial: gravação, transcrição e Copilot desligados. A mudança fica **limitada a essa política**, sem alterar a política Global nem outros usuários |

### 1.1 Configuração-alvo da política `Nekkora-Commercial`

Os nomes abaixo são os da documentação oficial consultada em 05/11/2026 (§6). Confira os rótulos na tela no dia da
execução: a Microsoft muda nomes e posições com frequência.

| Seção da política (centro de administração) | Configuração | Parâmetro do PowerShell | Valor desejado | Por quê |
|---|---|---|---|---|
| Recording & transcription | **Meeting recording** | `-AllowCloudRecording` | **Off** / `$false` | Impede iniciar a gravação |
| Recording & transcription | **Transcription** | `-AllowTranscription` | **Off** / `$false` | Transcrição também registra o conteúdo da conversa. Segundo a documentação, vem ligada por padrão em políticas novas |
| Recording & transcription | **Copilot** | `-Copilot` (parâmetro confirmado só em resumo da página; conferir) | **Off**, se a opção existir no tenant e no licenciamento | A documentação não diz que desligar gravação e transcrição impede o Copilot de capturar a conversa |
| Recording & transcription | **Live captions** | `-LiveCaptionsEnabledType` | `Disabled`, opcional | Legendas ao vivo não ficam gravadas como arquivo. Desligar é opcional, por acessibilidade. Decisão da titular |
| Recording & transcription | Recordings automatically expire / Default expiration time | — | **Manter** como está | Sem gravação, a configuração não tem efeito. Ela volta a importar se a gravação for retomada (backlog) |
| Content sharing | Meeting coach / Speaker Coach | `-AllowMeetingCoach` | Off, opcional | O treinador de fala é individual. Desligar só por coerência |

## 2. Antes de mudar: verificações obrigatórias

Marque cada item e anote o resultado no §5.

- [ ] **2.1 Política atribuída à conta organizadora.** Em *Teams admin center → Users → Manage users →
  `nicolly@nekkora.com` → Policies*, confirme que **Meeting policy = `Nekkora-Commercial`** e se a atribuição é
  **direta** ou por grupo. Pelo PowerShell (módulo `MicrosoftTeams`, comandos que não estavam nas páginas
  consultadas; confirme antes de usar):
  ```powershell
  Connect-MicrosoftTeams
  Get-CsUserPolicyAssignment -Identity nicolly@nekkora.com -PolicyType TeamsMeetingPolicy
  ```
- [ ] **2.2 Quem mais usa a política.** Em *Meetings → Meeting policies → `Nekkora-Commercial`*, veja quais usuários e
  grupos a recebem. **Se outra pessoa ou grupo também a usar**, a mudança vai afetá-los. Nesse caso, pare e decida
  se cria uma política nova só para a conta comercial.
- [ ] **2.3 Não mexer na Global.** A política **Global (padrão da organização)** vale para todos os usuários sem
  política própria. Esta mudança **não** a altera.
- [ ] **2.4 Quem organiza as reuniões do Bookings.** Abra uma reserva de homologação criada pela página do Bookings e
  veja, nos detalhes da reunião do Teams, **quem aparece como organizador**: a conta `nicolly@nekkora.com` ou a caixa
  da página do Bookings. Para gravar, a documentação exige permissão **do organizador e de quem inicia a gravação**
  (§6). Então:
  - se o organizador for `nicolly@nekkora.com`, a política `Nekkora-Commercial` bloqueia a gravação na reunião inteira;
  - se o organizador for a caixa do Bookings, quem vale para ela é a política dela, provavelmente a Global. Mesmo
    assim, a política da `nicolly@` bloqueia a **titular** como quem inicia a gravação. Participantes externos não
    podem gravar, segundo a documentação, salvo gravação de conformidade de terceiros, que a Nekkora não usa.
    Registre o caso no §5.
- [ ] **2.5 Mecanismos separados.** Confira e anote:
  - **Opções da reunião (Teams Premium):** com Teams Premium, o organizador pode controlar nas opções da reunião quem
    grava e transcreve. Verifique se o tenant tem Teams Premium.
  - **Chamadas 1:1 fora de reunião:** a gravação de chamadas segue a **política de chamadas**, não a de reuniões. A
    documentação consultada só remete a outra página. Regra operacional: conversas comerciais só por reunião
    agendada, nunca por chamada direta. Se isso não for possível, verificar a política de chamadas.
  - **Aplicativos e bots de anotação de terceiros**, como gravadores e assistentes de notas: confira em *Teams apps →
    Manage apps* se algum está liberado para a conta. Nenhum deve entrar nas reuniões comerciais.
  - **Gravação local de tela** por qualquer participante: está fora do controle do Teams. O aviso trata só da
    gravação feita pela Nekkora.

## 3. Mudança (só depois da autorização da titular)

1. *Teams admin center → Meetings → Meeting policies → `Nekkora-Commercial`*.
2. Em **Recording & transcription**, deixe *Meeting recording*, *Transcription* e *Copilot* conforme o §1.1.
3. **Save**. Anote a data e a hora no §5.
4. Equivalente no PowerShell, para conferência:
   ```powershell
   Set-CsTeamsMeetingPolicy -Identity "Nekkora-Commercial" -AllowCloudRecording $false -AllowTranscription $false
   Get-CsTeamsMeetingPolicy -Identity "Nekkora-Commercial" |
     Select-Object Identity, AllowCloudRecording, AllowTranscription, Copilot, LiveCaptionsEnabledType, AllowMeetingCoach
   ```
   Guarde a saída do `Get-` (§5). Ela não contém dados pessoais.
5. **Tempo para valer:** as páginas consultadas não informam quanto tempo a mudança leva para entrar em vigor. Não
   presuma que vale na hora. Faça o teste do §4 e, se a opção ainda aparecer, repita mais tarde. Registre os horários.

## 4. Teste em reunião de homologação

1. Pela página pública do Bookings, agende uma reserva de teste com uma conta **fora** do tenant, como um e-mail
   pessoal. A mesma reserva pode servir para OPS-10.
2. Entre na reunião como `nicolly@nekkora.com` e, com a outra conta, como participante externo.
3. Em **Mais ações → Gravar e transcrever**, confira se:
   - [ ] *Iniciar gravação* está **indisponível**, ausente ou bloqueada com uma mensagem de política;
   - [ ] *Iniciar transcrição* está **indisponível**;
   - [ ] o Copilot da reunião não aparece ou não consegue capturar, se existir no licenciamento.
4. Repita o passo 3 na conta externa: *Iniciar gravação* não deve aparecer.
5. Depois da reunião, confira que não há arquivo em *OneDrive → Gravações* nem transcrição no chat da reunião.
6. Cancele ou exclua a reserva de teste conforme o [procedimento de retenção](procedimento-retencao-e-direitos.md) §2,
   passo 4.

**Se a gravação ainda puder ser iniciada:** não grave. Registre "falhou" no §5 e volte ao §2.4, que pode ser o caso
de o organizador ser a caixa do Bookings, e ao §3, passo 5. CTL-01 continua pendente.

## 5. Evidência a registrar (sem dados pessoais)

Guarde fora do repositório, por exemplo em uma pasta do OneDrive da conta corporativa, ou registre aqui só o que
não for dado pessoal.

| Item | Evidência |
|---|---|
| E-1 | Data e hora da mudança e quem autorizou (titular) |
| E-2 | Saída do `Get-CsTeamsMeetingPolicy` (§3, passo 4) ou captura da tela da seção *Recording & transcription* depois de salvar |
| E-3 | Resultado do §2.1 e do §2.2: política atribuída e lista de usuários ou grupos (só a quantidade e se há outros, sem nomes) |
| E-4 | Resultado do §2.4: organizador das reuniões do Bookings (conta da titular ou caixa da página) |
| E-5 | Resultado do §2.5: Teams Premium sim/não, política de chamadas conferida sim/não, aplicativos de terceiros liberados sim/não |
| E-6 | Teste do §4: data, navegador ou aplicativo, "gravação indisponível" / "transcrição indisponível" para cada conta, e captura do menu **sem rostos nem nomes** |
| E-7 | Conferência pós-teste: nenhum arquivo de gravação, nenhuma transcrição |

| Data | E-1 | E-2 | E-3 | E-4 | E-5 | E-6 | E-7 | CTL-01 |
|---|---|---|---|---|---|---|---|---|
| `AAAA-MM-DD` | — | — | — | — | — | — | — | **Pendente** |

**CTL-01 só passa a "verificado"** quando E-1 a E-7 estiverem preenchidos e o teste do §4 tiver confirmado que a
gravação e a transcrição não podem ser iniciadas. A revisão semanal ([procedimento de retenção](procedimento-retencao-e-direitos.md)
§2, passo 6) continua conferindo que não surgiram gravações.

## 6. Fontes consultadas em 05/11/2026

| Fonte | O que sustenta |
|---|---|
| Microsoft Learn, "Teams meeting recording", <https://learn.microsoft.com/en-us/microsoftteams/meeting-recording>, ms.date 06/07/2026 | Configuração *Meeting recording* e `-AllowCloudRecording`; "Both the organizer and recording initiator need to have recording permissions to record the meeting or event"; "External participants can't record meetings except when it's a Teams third-party compliance recording"; controle por opções da reunião com Teams Premium; a política Global vale para quem não tem política própria |
| Microsoft Learn, "Configure transcription and captions", <https://learn.microsoft.com/en-us/microsoftteams/meeting-transcription-captions>, ms.date 06/07/2026 | *Transcription* e `-AllowTranscription`, ligada por padrão em políticas novas; *Live captions* e `-LiveCaptionsEnabledType` |
| Microsoft Learn, "Teams settings and policies reference", <https://learn.microsoft.com/en-us/microsoftteams/settings-policies-reference>, ms.date 16/07/2026 | Seção *Recording & transcription*: Meeting recording, Require participant agreement, Recordings automatically expire, Default expiration time (120), Transcription, Live captions, Copilot. "When organizers turn off Microsoft Copilot in Teams meetings and events, recording and transcription are also turned off": o inverso não é afirmado |
| Microsoft Learn, "Set-CsTeamsMeetingPolicy", <https://learn.microsoft.com/en-us/powershell/module/teams/set-csteamsmeetingpolicy> | `-AllowCloudRecording`, `-AllowTranscription`, `-AllowMeetingCoach`. O parâmetro `-Copilot` só apareceu em resumo da página: conferir |

**Não confirmado nas fontes:** o tempo para a mudança valer, a política que se aplica a convidados e anônimos, os
comandos de consulta de atribuição (`Get-CsUserPolicyAssignment`) e o parâmetro de gravação de chamadas. Por isso
este procedimento exige o teste do §4, em vez de presumir o efeito.

## 7. Gravação futura (backlog)

Retomar a gravação **não** é só religar a configuração. Antes, é preciso uma nova revisão, com: finalidade e base
legal (JUR-10), novo texto do aviso de privacidade e do Bookings com **nova aprovação da titular**, conduta para quem
não concorda (OPS-05), retenção e eliminação comprovadas (OPS-07), compartilhamento (OPS-08) e transcrição (OPS-06).
