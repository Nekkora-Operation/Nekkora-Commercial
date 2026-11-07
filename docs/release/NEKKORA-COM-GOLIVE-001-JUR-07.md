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
2. **Fluxos com base no V e no II.** Adotar o **art. 33, IX** e registrar na `privacidade-minuta.md` §5 por que a
   transferência é necessária: o atendimento pedido por quem contrata em nome próprio só ocorre pelos meios
   contratados, e a guarda dos registros é obrigação legal. Risco: "necessária" pode ser lida de forma estrita,
   porque o provedor estrangeiro é escolha do controlador.
3. **Fluxos com base no IX (representantes de empresa).** É preciso um mecanismo próprio, definido fluxo a fluxo. Há
   só dois disponíveis:
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

**A JUR-07 só sai da lista de impeditivos quando houver as quatro coisas:**

- a evidência do item 1;
- o parecer do item 5, com o mecanismo de cada fluxo;
- o mecanismo dos fluxos com base no IX efetivamente adotado: CPC assinada ou consentimento coletado e registrado;
- o texto do item 7 integrado e aprovado na PUB-09.

Nenhuma delas existe hoje.
