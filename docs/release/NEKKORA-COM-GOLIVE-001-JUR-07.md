# JUR-07 — transferência internacional (LGPD, art. 33): fatos verificados e solução mínima

Data: 06/11/2026. Fontes oficiais, consultadas só para leitura (as URLs estão na tabela de cada seção). Isto é análise
técnica e documental, **não parecer jurídico**. Por instrução da titular, a localização dos dados no Brasil **não
encerra** o item.

> **Conclusão: a JUR-07 continua impedindo a aprovação do aviso (PUB-09).** O art. 33, IX, cobre só os fluxos
> com base no art. 7º, II e V. Os contatos de **representantes de empresa** (art. 7º, IX, legítimo interesse) ficam
> fora dele e hoje **não têm mecanismo**. Nenhum provedor oferece as cláusulas-padrão (CPC) brasileiras, e o
> consentimento só é viável onde puder ser coletado e comprovado. A solução tem de ser fluxo a fluxo e confirmada em
> parecer (§3). Aceitar o risco **não** resolve.

## 1. Fatos verificados

| Ponto | Fato | Fonte |
|---|---|---|
| M365, residência no Brasil | Brasil tem compromisso de residência para Exchange Online, SharePoint/OneDrive e Teams (Product Terms, sem custo, para tenant provisionado no Brasil): corpo de e-mails, calendário, anexos, arquivos, chats e mensagens de reunião | learn.microsoft.com/…/m365-dr-compare-offerings e …/m365-dr-product-terms (ms.date 08/10/2026) |
| **E3: tenant da Nekkora (10/11/2026)** | Cartão "Localização dos dados": Exchange Online, Teams, OneDrive e SharePoint em **Brasil/Brasil** (atual/confirmada). Proteção do Exchange Online e Viva Connections em Brasil, sem compromisso. Copilot não informado. Bookings não aparece. Só dados **em repouso** | [registro E3](evidencias/golive-001/m365-local-dos-dados-2026-11-10.md) (captura da titular) |
| Bookings | **Fora** da lista de serviços com compromisso de residência. O FAQ diz que ele guarda os dados em caixas compartilhadas do Exchange. Que a residência do Exchange cubra o Bookings é **inferência, não compromisso** | …/m365-dr-services-data-location; …/bookings/bookings-faq |
| Processamento fora do país (M365) | Os compromissos são sobre dados **armazenados**. Requisições "may be handled by servers in a different region"; há acesso de engenheiros, limitado e registrado; a documentação sobre dados em processamento está "coming soon" | …/m365-dr-what-is-data-residency |
| DPA da Microsoft (01/11/2026) | O cliente autoriza transferência para os EUA ou qualquer país em que a Microsoft ou seus subprocessadores operem. **Sem** menção a LGPD, ANPD ou CPC brasileiras | microsoft.com/licensing/docs/…/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA |
| AWS | S3 do site em `sa-east-1` (auditoria). A DPA: os dados não saem da região "except as necessary to provide the Services"; as SCC valem só para dados sujeitos ao GDPR. A página de LGPD não cita CPC | d1.awsstatic.com/legal/aws-dpa/aws-dpa.pdf; aws.amazon.com/compliance/brazil-data-privacy |
| CloudFront | O IP do visitante é processado no ponto de presença que atende a conexão, que pode ficar fora do Brasil. Os logs v2 são configurados em `us-east-1`, com entrega cruzada para `sa-east-1` | docs.aws.amazon.com/AmazonCloudFront/…/standard-logging.html |
| Res. CD/ANPD 19/2024 | A **coleta internacional não é transferência** (Anexo I, art. 6º). As CPC exigem contrato entre exportador e importador, com adoção integral (art. 16), e não podem ser adotadas só pelo controlador. As únicas adequações reconhecidas são UE e EEE (Res. 32/2026), o que não cobre os EUA | gov.br/anpd, Res. 19/2024 e Res. 32/2026 |
| LGPD, art. 33 | Mecanismos que **não dependem de assinatura do provedor**: VIII (consentimento específico e em destaque) e IX (quando necessário às hipóteses do art. 7º, II, V e VI) | planalto.gov.br, Lei 13.709/2018 |

## 2. Fluxos com transferência possível, por base legal

**Correção (R1, 06/11/2026).** Na versão anterior, os fluxos de atendimento apareciam só com a base do art. 7º, V. A
própria análise da Nekkora (JUR-06; `privacidade-minuta.md` §6) usa **duas** bases nesses fluxos: o V, para quem
contrata em nome próprio, e o IX (legítimo interesse), para o empregado ou representante que fala em nome de uma
empresa. Isso muda a conclusão, porque o **art. 33, IX, só cobre transferências necessárias às hipóteses do art. 7º,
II, V e VI**. O legítimo interesse (art. 7º, IX) está fora. Portanto, o art. 33, IX, não pode ser aplicado a todos os
contatos corporativos.

Num serviço B2B, o representante de empresa deve ser o caso **mais comum**. Assim, o art. 33, IX, cobre só uma parte
pequena do atendimento.

| Fluxo | Titular | Base (art. 7º) | Pode sair do Brasil? | Mecanismo do art. 33 | Situação |
|---|---|---|---|---|---|
| E-mail `contato@`, Bookings, Teams | Quem contrata em nome próprio (pessoa física, empresário individual, sócio que é parte) | V | Sim: processamento, suporte e subprocessadores da Microsoft; o Bookings não tem compromisso de residência | IX + art. 7º, V | Candidato, com o risco de leitura estrita de "necessária" |
| E-mail `contato@` | Empregado ou representante de empresa | **IX** | Sim, como acima | **IX não se aplica.** Sobram II (CPC, depende do provedor) e VIII (consentimento) | **Sem mecanismo.** O e-mail é a porta de entrada, e a transferência ocorre no recebimento, antes de qualquer coleta de consentimento |
| Bookings e Teams | Empregado ou representante de empresa | **IX** | Sim, como acima | **IX não se aplica.** II (CPC) ou VIII (consentimento coletado no agendamento) | **Sem mecanismo.** O VIII depende de o Bookings permitir uma confirmação específica e obrigatória (**não verificado**), e mudar o Bookings é mudar a configuração |
| Entrega do site (CloudFront) | Qualquer visitante | IX | Ponto de presença no exterior | Coleta internacional, que não é transferência (Res. 19/2024, Anexo I, art. 6º). Se essa leitura não for aceita, o IX do art. 33 não se aplica e só sobra o VIII, inviável na entrega de uma página | Depende de a leitura de coleta internacional ser confirmada |
| Registros de acesso (LOG-01) | Qualquer visitante | II (Marco Civil, art. 15) | Talvez, pela entrega v2 em `us-east-1` | IX + art. 7º, II | Candidato |

**O que não resolve:**

- **Aceitar o risco** não cria um mecanismo do art. 33 onde ele não existe. Para os fluxos com base no IX, isso não
  é solução e não entra como opção de decisão.
- **Dados guardados no Brasil** reduzem o escopo, mas não eliminam o processamento e o acesso de suporte no exterior.
- **Trocar a base do representante para o V** também não serve: o V exige que o titular seja parte do contrato, e o
  empregado não é.

## 3. Solução jurídica mínima proposta

1. **Evidência de localização.** A titular captura, no Centro de administração, o caminho Configurações →
   Configurações da organização → Perfil da organização → **Local dos dados** ("Current" e "Committed
   Geography"). Sozinha, essa evidência não resolve a JUR-07; ela só reduz o escopo do que vai ao exterior.
   **Feito em 10/11/2026 (E3):** Exchange, Teams, OneDrive e SharePoint em Brasil/Brasil
   ([registro](evidencias/golive-001/m365-local-dos-dados-2026-11-10.md)).
2. **Fluxos com base no V e no II.** Adotar o **art. 33, IX** e registrar na `privacidade-minuta.md` §5 por que a
   transferência é necessária: o atendimento pedido por quem contrata em nome próprio só ocorre pelos meios
   contratados, e a guarda dos registros é obrigação legal. Risco: "necessária" pode ser lida de forma estrita,
   porque o provedor estrangeiro é escolha do controlador.
3. **Fluxos com base no IX (representantes de empresa).** É preciso um mecanismo próprio, definido fluxo a fluxo. Os instrumentos que
   existem hoje são dois (as alternativas de configuração e as perguntas em aberto estão no §4; antes, a JUR-06 pode
   reduzir este grupo):
   - **(a) CPC (art. 33, II; Res. 19/2024):** exigem contrato com a Microsoft. Hoje não são oferecidas (§1). O pedido
     por escrito à Microsoft deixa de ser providência paralela e passa a ser **condição** deste caminho.
   - **(b) Consentimento específico e em destaque para a transferência (art. 33, VIII):** com informação prévia
     sobre o caráter internacional, separado das outras finalidades, comprovável pela Nekkora (art. 8º, §2º) e, se
     for condição do atendimento, com o destaque do art. 9º, §3º.
     - **Bookings e Teams:** só é possível se o Bookings aceitar uma confirmação obrigatória e registrada. Isso precisa
       ser verificado, e a mudança no Bookings depende de autorização.
     - **E-mail:** não há onde coletar nem como comprovar o consentimento antes do recebimento. Para o e-mail, só sobra
       a (a), ou outra saída definida em parecer.
4. **Entrega do site.** Registrar por escrito a leitura de coleta internacional (Res. 19/2024, Anexo I, art. 6º) e
   submetê-la ao mesmo parecer.
5. **Parecer jurídico.** Deve confirmar, fluxo a fluxo, os itens 2 a 4: a leitura do art. 33, IX, para o V e o II, o
   mecanismo dos fluxos com base no IX e a coleta internacional. Isso deixa de ser recomendação e passa a ser
   **necessário**, porque o item 3 não tem hoje mecanismo disponível sem decisão jurídica.
6. **Minimização** (já em vigor; manter): sem gravação, sem dados sensíveis, alerta contra senhas, retenção de 6 meses
   e 90 dias, e "Empresa" opcional. Ela reduz o impacto, mas não substitui o mecanismo.
7. **Transparência no aviso.** É a única mudança de texto público. Entra na PUB-17 e na PUB-09 **depois** do parecer,
   com o mecanismo de cada caso. Base provisória do item "Onde os dados são processados":
   > "Os serviços da Microsoft (Microsoft 365, Bookings e Teams) e da Amazon Web Services (AWS) usados pela Nekkora
   > guardam os dados preferencialmente no Brasil, mas podem processá-los em outros países, principalmente nos Estados
   > Unidos, para prestar o serviço, dar suporte e manter a segurança. [MECANISMO POR CASO, conforme o parecer: por
   > exemplo, 'Quando você contrata em nome próprio, essa transferência é necessária para atender ao seu pedido (LGPD,
   > art. 33, IX)' e o mecanismo adotado para quem fala em nome de uma empresa.] Você pode pedir mais informações pelo
   > e-mail contato@nekkora.com."

   A frase "guardam preferencialmente no Brasil" só entra se a evidência do item 1 mostrar o Brasil. O trecho entre
   colchetes **não** pode ir ao ar com um mecanismo único para todos.
   O E3 (10/11/2026) mostra o Brasil para Exchange, Teams, OneDrive e SharePoint. Ele não cobre o Bookings, nem a AWS,
   nem o processamento. A redação final continua dependendo do parecer.

**A JUR-07 só sai da lista de impeditivos quando houver as quatro coisas:**

- a evidência do item 1 (**existe desde 10/11/2026**: E3);
- o parecer do item 5, com o mecanismo de cada fluxo;
- o mecanismo dos fluxos com base no IX efetivamente adotado: CPC assinada ou consentimento coletado e registrado;
- o texto do item 7 integrado e aprovado na PUB-09.

Em 10/11/2026, só a primeira existe. As outras três continuam pendentes.

## 4. R2 — fecho da investigação técnica (06/11/2026)

Esta seção **encerra a parte técnica**. Ela **não** encerra a JUR-07, que continua pendente até haver fundamento
jurídico e evidências. Como na R1, a análise não presume que todos os contatos B2B dependam de consentimento, nem que
o art. 33, IX, resolva todos os casos.

### 4.1 Conceitos (Res. CD/ANPD 19/2024, Anexo I)

| Categoria | Definição | Consequência |
|---|---|---|
| **Coleta internacional** | "coleta de dados pessoais do titular efetuada diretamente pelo agente de tratamento localizado no exterior" (art. 3º, V) | **Não** é transferência (art. 6º) |
| **Transferência** | um agente "transmite, compartilha ou **disponibiliza acesso**" a dados para outro agente (art. 3º, III), em país estrangeiro (art. 3º, IV; art. 5º) | Exige um mecanismo do art. 33 |
| **Armazenamento no exterior** | o operador guarda os dados fora do Brasil | Transferência da Nekkora (exportadora) para o operador (importador) |
| **Acesso de suporte do exterior** | um engenheiro do operador acessa a partir de fora do país | A norma não usa a expressão "acesso remoto". **Inferência:** cabe em "disponibiliza acesso". ⚖ |
| **Subprocessadores** | o operador repassa a outro agente no exterior | Transferência ulterior; a Nekkora responde pelo mecanismo da cadeia ⚖ |

### 4.2 Matriz por fluxo

Legenda: **S** = ocorre ou pode ocorrer; **N** = não ocorre; **?** = depende de evidência ou de interpretação. Desde
10/11/2026, o E3 está incorporado.

| Fluxo | Coleta internacional | Armazenamento no exterior | Acesso de suporte | Subprocessadores | Base do tratamento (art. 7º) | Mecanismo do art. 33 |
|---|---|---|---|---|---|---|
| **E-mail** `contato@` (Exchange) | N (a Nekkora coleta no Brasil, pelo próprio tenant) | N em repouso: Exchange em Brasil/Brasil (E3, 10/11/2026). O processamento em trânsito pode ocorrer em outra região | S, limitado e registrado. Pode depender de aprovação, com Customer Lockbox | S (DPA: EUA ou qualquer país) | V (contrata em nome próprio) ou IX (representante): **JUR-06** | V → IX do art. 33 (candidato). IX → **sem mecanismo hoje** (§4.3) |
| **Bookings** | N | **?** Não tem compromisso de residência próprio. Os dados ficam em caixa do Exchange; a cobertura é **inferência** | S | S | idem | idem |
| **Teams**: reunião em tempo real | N | Mídia: a conferência é hospedada "in the same region where the first participant joined"; **não há compromisso de residência para mídia** | S | S | idem | idem |
| **Teams**: chat da reunião | N | N em repouso: Teams em Brasil/Brasil (E3, 10/11/2026). Isso afasta a hipótese de tenant antigo nas Américas | S | S | idem | idem |
| **Entrega do site** (CloudFront) | **S?** Ponto de presença no exterior para visitante fora do Brasil. ⚖ Pode ser coleta internacional se a AWS for vista como meio da coleta da Nekkora | N (sem guarda na entrega) | — | — | IX (entregar e proteger o serviço) | Se for coleta internacional, nenhum. Se for transferência, o IX do art. 33 não cobre ⚖ |
| **Registros de acesso** (LOG-01) | N | N (bucket em `sa-east-1`) | S (suporte AWS) | ? | II (Marco Civil, art. 15) | IX + art. 7º, II (candidato) |
| **Hospedagem** (S3 do site) | N | N (`sa-east-1`) | S | ? | — (conteúdo público, sem dados pessoais) | Não se aplica |

### 4.3 Instrumentos contratuais disponíveis (verificados em 06/11/2026)

| Provedor | O que existe | O que **não** existe |
|---|---|---|
| Microsoft | DPA de 01/11/2026: autoriza transferência para os EUA e para os países dos subprocessadores; SCC 2021 da UE, IDTA do Reino Unido e DPF, **só** para dados que saem da UE, do EEE, do Reino Unido ou da Suíça | Nenhuma menção a Brasil, LGPD, ANPD ou CPC brasileiras (anexos e rodapés não foram lidos por inteiro) |
| AWS | DPA que, segundo a página "Brazil Data Privacy", "meets the requirements of LGPD"; dados na região escolhida "except as necessary to provide the Services" | Nenhuma menção às CPC da Res. 19/2024. O texto do PDF do DPA não pôde ser extraído na R2 |
| ANPD | CPC (Res. 19/2024, Anexo II), obrigatórias nos contratos desde agosto de 2025 (art. 2º, parágrafo único); adequação só da UE e do EEE (Res. 32/2026) | Nenhuma equivalência reconhecida das SCC europeias |

### 4.4 Alternativas reais de configuração (nenhuma aplicada; todas exigem autorização)

| Alternativa | Efeito | Limite |
|---|---|---|
| Confirmar o tenant em BRA (E3). **Confirmado em 10/11/2026** | O armazenamento de Exchange, SharePoint, OneDrive e Teams fica no Brasil, com compromisso | Não cobre processamento, suporte, subprocessadores, mídia do Teams, Bookings nem Copilot |
| **Advanced Data Residency** (add-on; Brasil incluído) | Compromisso contratual de residência ampliado | Exige 100% das licenças pagas; custo; o Bookings não é citado |
| **Customer Lockbox** (E5, ou add-on de Compliance) | O suporte da Microsoft só acessa conteúdo com aprovação da titular (até 4 h) | Reduz o acesso de suporte, mas **não** cobre subprocessadores nem pedidos de autoridades |
| Teams: manter sem gravação e sem transcrição (CTL-01) | Nada fica armazenado da conversa | A mídia em tempo real continua sujeita ao roteamento |
| CloudFront: sem mudança | Já é o mínimo: sem cookies, sem logs de URL | O ponto de presença depende do visitante |

### 4.5 Perguntas para o parecer jurídico

1. **Base do representante (JUR-06).** O empregado ou representante que pede proposta em nome da empresa pode ser
   atendido com base no art. 7º, V, ou a base é o IX? A resposta define quanto do atendimento cabe no art. 33, IX.
2. **Acesso remoto.** O acesso de suporte do operador a partir do exterior, a dados armazenados no Brasil, é
   transferência internacional ("disponibiliza acesso", art. 3º, III, da Res. 19/2024)?
3. **"Necessária" no art. 33, IX.** Para quem contrata em nome próprio (art. 7º, V) e para os registros de acesso
   (art. 7º, II), a transferência ao operador estrangeiro pode ser tida como necessária, se o operador foi escolha da
   Nekkora?
4. **Fluxos com base no IX.** Sem CPC oferecidas pela Microsoft, qual mecanismo é admissível? Opções:
   - (a) pedir à Microsoft a adoção das CPC, com prazo;
   - (b) consentimento específico (art. 33, VIII) no Bookings;
   - (c) outra saída, com base no art. 33.

   Para o e-mail de entrada, há saída que não dependa da Microsoft?
5. **Entrega do site.** O atendimento por ponto de presença do CloudFront no exterior é coleta internacional (art. 6º)
   ou transferência?
6. **Dever de transparência.** Que redação mínima do aviso cumpre o art. 33 e a Res. 19/2024 (país de destino,
   mecanismo) sem prometer mecanismo inexistente?
7. **Risco residual.** Com E3 em BRA e Customer Lockbox, o que sobra de transferência sem mecanismo? É impeditivo para
   publicar o site **sem** o Bookings, ou só para o atendimento?
8. **Campo livre do Bookings.** O formulário tem o campo opcional de texto livre "Adicionar solicitações especiais". O
   aviso cita "as respostas deste formulário (empresa e processo, quando informados)", sem mencionar esse campo. A
   redação basta ou precisa citá-lo? Registrado em 09/11/2026 para a revisão do texto final; o Bookings não foi alterado
   por isso.

### 4.6 Situação

- **Investigação técnica:** concluída, com as fontes listadas e as inferências marcadas como tais.
- **E3:** **verificado em 10/11/2026**, só quanto aos dados em repouso dos serviços do cartão
  ([registro](evidencias/golive-001/m365-local-dos-dados-2026-11-10.md)).
- **JUR-07:** **pendente.** Depende do parecer (§4.5) e do mecanismo adotado para cada fluxo. Transferências
  internacionais, acessos de suporte, subprocessadores e bases legais (JUR-06) **não** estão resolvidos.
- **Texto do aviso (grupo C):** não escrito no site até o parecer.
