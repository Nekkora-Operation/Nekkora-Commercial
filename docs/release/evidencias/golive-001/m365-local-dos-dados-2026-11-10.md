# E3 — Localização dos dados do Microsoft 365, 10/11/2026

**Estado: VERIFICADO**, mas só quanto à **localização dos dados em repouso** dos serviços que aparecem no cartão.
Este registro **não** resolve transferências internacionais, acessos de suporte, subprocessadores nem bases legais.
A JUR-06 e a JUR-07 continuam abertas. Nada aqui é parecer jurídico, e o Microsoft 365 não foi alterado.

## Origem

- A titular apresentou a captura em 10/11/2026.
- Ela mostra o cartão oficial **"Localização dos dados"**. No roteiro, o mesmo cartão aparece como "Local dos dados".
- O caminho é: Centro de administração do Microsoft 365 → Configurações → Configurações da organização → Perfil da organização.
- Arquivo: [`m365-local-dos-dados-2026-11-10.png`](m365-local-dos-dados-2026-11-10.png).
  - Tamanho: 468 × 887 px.
  - SHA-256: `039f093f3aff3a5b84b2cf598e9b776f14d39871ab27c0d98b514860be6f67aa`.
- Conferência de dados pessoais, em 10/11/2026:
  - a imagem não mostra nome do locatário, domínio, e-mail, nome de pessoa, IP nem identificador do tenant;
  - a imagem também não mostra dado administrativo sensível nem segredo: nenhum ID de assinatura, de licença ou de
    objeto, nenhum endereço de cobrança, chave ou token;
  - o que aparece é o texto padrão do cartão (residência, ADR e Programa de Migração Herdada) e a tabela de
    geografias;
  - à esquerda há uma faixa estreita da página de fundo, sem texto legível;
  - o PNG não tem metadados de texto (só os blocos `sRGB`, `gAMA` e `pHYs`);
  - foi arquivado sem edição;
  - a conferência foi repetida em 10/11/2026, antes do commit.

## Resultado observado

As colunas do cartão são "Geografia Atual" e "Geografia Confirmada".

| Serviço | Geografia atual | Geografia confirmada |
|---|---|---|
| Exchange Online | Brasil | Brasil |
| Microsoft Teams | Brasil | Brasil |
| OneDrive | Brasil | Brasil |
| SharePoint | Brasil | Brasil |
| Proteção do Exchange Online | Brasil | Sem compromisso |
| Viva Connections | Brasil | Sem compromisso |
| Microsoft Copilot | não informada ("-") | não informada ("-") |

O cartão também mostra dois avisos:

- **Programa de Migração Herdada:** "Este locatário não aceitou o Programa de Migração Herdada. A Geografia Real e a
  Geografia Comprometida podem ser diferentes até que os dados sejam migrados." Para os quatro serviços com
  compromisso, as duas colunas mostram **Brasil**, então não há divergência visível.
- **Residência de Dados Avançada (ADR):** o locatário pode comprar o complemento. Nada foi contratado nem alterado.

## O que o E3 comprova

- Os dados em repouso de **Exchange Online, Teams, OneDrive e SharePoint** estão no Brasil, com compromisso de
  residência no Brasil.
- Isso fecha a dúvida da JUR-07 §4.2 sobre o chat de reunião do Teams. A suspeita era a de tenants brasileiros antigos
  "stored in the Americas", mas o cartão mostra Brasil/Brasil.
- **Proteção do Exchange Online** e **Viva Connections** estão hoje no Brasil, **sem compromisso** de que continuem.

## O que o E3 não comprova (continua aberto)

- **Bookings:** não aparece no cartão e não tem compromisso de residência próprio. A cobertura pela caixa do Exchange
  continua sendo **inferência** (JUR-07 §1).
- **Mídia em tempo real do Teams:** não há compromisso de residência para ela (JUR-07 §4.2).
- **Microsoft Copilot:** localização não informada.
- **Processamento e trânsito:** os compromissos tratam de dados **armazenados**. Requisições podem ser processadas
  em outra região.
- **Acesso de suporte** da Microsoft a partir do exterior (JUR-07 §4.5, pergunta 2).
- **Subprocessadores** e transferências ulteriores (DPA de 01/11/2026).
- **Bases legais** (JUR-06) e o **mecanismo do art. 33** em cada fluxo (JUR-07 §3 e §4.5).
- **AWS / CloudFront e LOG-01:** fora deste cartão.
