# JUR-07 — transferência internacional (LGPD, art. 33): fatos verificados e solução mínima

Data: 06/11/2026. Fontes oficiais, consultadas só para leitura (as URLs estão na tabela de cada seção). Isto é análise
técnica e documental, **não parecer jurídico**. Por instrução da titular, a localização dos dados no Brasil **não
encerra** o item.

> **Conclusão: a JUR-07 continua impedindo a aprovação do aviso (PUB-09).** O caminho mínimo está no §3: cinco
> ações, das quais só uma muda texto público. Nenhum provedor oferece hoje as cláusulas-padrão (CPC) brasileiras.

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

## 2. Fluxos com transferência possível

| Fluxo | Dados | Base (art. 7º) | Pode sair do Brasil? | Mecanismo candidato |
|---|---|---|---|---|
| E-mail `contato@` | nome, e-mail, empresa, processo | V (a pedido do titular) | Sim: processamento, suporte e subprocessadores da Microsoft | art. 33, IX, combinado com o art. 7º, V |
| Bookings | nome, e-mail, respostas, horário | V | Sim, e sem compromisso de residência | art. 33, IX, combinado com o art. 7º, V |
| Teams (sem gravação) | nome, imagem e voz em tempo real, chat | V | Sim: roteamento de mídia e processamento | art. 33, IX, combinado com o art. 7º, V |
| Entrega do site (CloudFront) | IP e dados técnicos em trânsito | IX (legítimo interesse) | Ponto de presença no exterior. Discutível: pode ser lido como coleta internacional (art. 6º) | coleta internacional; se não for aceita, só sobra o VIII, que é inviável na entrega de uma página |
| Registros de acesso (LOG-01) | data e hora, IP e porta, host | II (obrigação legal) | Talvez, pela entrega v2 em `us-east-1` | art. 33, IX, combinado com o art. 7º, II |

## 3. Solução jurídica mínima proposta

1. **Evidência de localização.** A titular captura, no Centro de administração, o caminho Configurações →
   Configurações da organização → Perfil da organização → **Local dos dados** ("Current" e "Committed
   Geography"). Sozinha, essa evidência não resolve a JUR-07; ela só reduz o escopo do que vai ao exterior.
2. **Mecanismo por fluxo, escrito.** Adotar o **art. 33, IX** para os fluxos com base no art. 7º, V e II (tabela §2)
   e registrar na `privacidade-minuta.md` §5 por que a transferência é necessária: o atendimento pedido pelo titular
   só ocorre pelos meios contratados, e a guarda dos registros é obrigação legal.
   - **Risco conhecido:** "necessária" pode ser lida de forma estrita, porque o provedor estrangeiro é escolha do
     controlador.
   - **Não se recomenda** o consentimento (VIII) como base principal: conflita com o modelo de ciência já aprovado no
     Bookings, e a recusa impediria o atendimento.
3. **Transparência no aviso.** É a única mudança de texto público. Proposta para o item "Onde os dados são
   processados", entra na PUB-17 e na PUB-09:
   > "Os serviços da Microsoft (Microsoft 365, Bookings e Teams) e da Amazon Web Services (AWS) usados pela Nekkora
   > guardam os dados preferencialmente no Brasil, mas podem processá-los em outros países, principalmente nos Estados
   > Unidos, para prestar o serviço, dar suporte e manter a segurança. Essa transferência é necessária para atender ao
   > seu pedido e para cumprir obrigações legais (LGPD, art. 33, IX). Você pode pedir mais informações pelo e-mail
   > contato@nekkora.com."

   A frase "guardam preferencialmente no Brasil" só entra se a evidência do item 1 mostrar o Brasil.
4. **Minimização** (já em vigor; manter): sem gravação, sem dados sensíveis, alerta contra senhas, retenção de
   6 meses e 90 dias, e "Empresa" opcional.
5. **Decisão escrita da titular.** Uma de duas:
   - **(a)** aprovar o art. 33, IX, para a V1, assumindo o risco residual registrado; ou
   - **(b)** obter antes um parecer jurídico sobre a leitura do IX. É o ponto mais sensível desta análise, e o
     parecer é **recomendado** mesmo na opção (a), assim que possível.

   Em paralelo, e sem bloquear: pedir por escrito à Microsoft e à AWS a adoção das CPC brasileiras e registrar a
   resposta.

**A JUR-07 só sai da lista de impeditivos quando houver as três coisas:**

- a evidência do item 1;
- a decisão do item 5;
- o texto do item 3 integrado e aprovado na PUB-09.

Nenhuma delas existe hoje.
