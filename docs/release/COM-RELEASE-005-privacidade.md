# COM-RELEASE-005 — Revisão de segurança, privacidade e LGPD (D06)

> **Atualizada pela NEKKORA-COM-008-C:** Teams, retenção, transferência internacional, distinção entre aceite,
> ciência e consentimento e o texto proposto para o Bookings estão em
> [`docs/comercial/privacidade-minuta.md`](../comercial/privacidade-minuta.md). O agendamento está **configurado**
> (URL oficial, NEKKORA-COM-007), mas ainda **não aprovado** (PUB-20); a coluna "Ativo hoje?" abaixo é de 22/10/2026.

**Minuta técnica para a decisão da titular. Não é parecer jurídico.** A revisão jurídica continua recomendada (PUB-09).
O texto que aparece na página fica em `src/content.ts → PRIVACY` e muda conforme a configuração publicada:

- **sem** endpoint nem Bookings (a publicação atual): [`05-texto-comercial.md` §7a](../com-001/05-texto-comercial.md);
- **com** envio automático e Bookings: [`com-release-005/texto-com-envio-automatico-e-bookings.md`](com-release-005/texto-com-envio-automatico-e-bookings.md) §7a, gerado com dados sintéticos.

## 1. Controlador

- **CNPJ:** `68.337.624/0001-32` (informado pela titular; dígitos conferidos).
- **Razão social:** **pendente** (PUB-09). Enquanto faltar, o aviso diz "a Nekkora".
- **Canal para os titulares:** `contato@nekkora.com`, citado no aviso (art. 18 da LGPD).
- **Encarregado (DPO):** a indicação é decisão da titular. Agentes de pequeno porte podem ter dispensa, conforme a
  Resolução CD/ANPD nº 2/2022, mas o canal de atendimento precisa existir: é o e-mail acima.

## 2. Inventário: o que é tratado, por quem e por quanto tempo

| Tratamento | Dados | Onde fica | Operador | Retenção | Ativo hoje? |
|---|---|---|---|---|---|
| Formulário via e-mail (mailto) | Nome, empresa, e-mail e descrição, **só se o visitante enviar** pelo próprio aplicativo | Caixa `contato@` (Microsoft 365) | Microsoft | Pelo tempo do atendimento (a definir pela titular) | **Sim** |
| **Envio automático** | Nome, e-mail, empresa e descrição | Só no e-mail entregue à caixa `contato@`. O backend **não guarda o conteúdo** | AWS (API Gateway, Lambda e SES, em trânsito) e Microsoft (caixa) | E-mail: idem acima. Backend: nada do conteúdo | Não (PUB-21) |
| Idempotência | UUID do pedido, hash SHA-256 do conteúdo e protocolo | DynamoDB | AWS | **24 h** (TTL) | Não |
| Controle de abuso | Contadores por **HMAC do IP** (o IP não é guardado) | DynamoDB | AWS | **até 2 dias** (TTL) | Não |
| Logs operacionais | requestId, hash do id, status, resultado e latência. **Sem dados pessoais** (testado) | CloudWatch Logs | AWS | **14 dias** | Não |
| Desafio antiautomação | Sinais técnicos do navegador e o IP (enviado ao `siteverify`) | Cloudflare | Cloudflare | Conforme a Cloudflare | Não (só com chave) |
| **Agendamento** | Nome, e-mail, respostas às perguntas e horário | Calendário e caixa de reservas da Nekkora no M365 | Microsoft | Enquanto existir a reserva (a definir) | Não (PUB-20) |
| Entrega do site | IP e navegador (registros técnicos) | CloudFront (logs de acesso **desligados**) | AWS | Processamento em trânsito | Sim (após a publicação) |
| Preferência de tema | `claro`/`escuro` | `localStorage` do visitante | — | Até o visitante limpar | Sim |

O aviso não diz que "nada é armazenado" quando há armazenamento. Com o envio automático, ele informa o código técnico
de 24 h e os contadores por HMAC. Com o Bookings, diz que os dados ficam na agenda da Nekkora.

## 3. Bases legais por finalidade (LGPD, art. 7º)

O consentimento **não** é a base adotada para nenhuma destas finalidades. Pedir consentimento obrigaria a oferecer a
revogação e criaria uma caixa de seleção sem função real.

| Finalidade | Base legal sugerida | Justificativa |
|---|---|---|
| Responder à solicitação e preparar avaliação e proposta | **Art. 7º, V**: procedimentos preliminares relacionados a contrato, a pedido do titular | Quem envia pede o contato |
| Realizar a conversa agendada | **Art. 7º, V** | Quem agenda pede a reunião |
| Prevenção de abuso (limites, desafio, logs sem dados pessoais) | **Art. 7º, IX**: legítimo interesse, com minimização (HMAC do IP, retenção curta) | Proteger o canal e a caixa comercial. Recomenda-se registrar o teste de balanceamento (LIA) |
| Entrega do site (registros técnicos do provedor) | **Art. 7º, IX** | Necessário para servir a página com segurança |
| Guardar a correspondência comercial depois do atendimento | **Art. 7º, II** (obrigação legal) ou **VI** (exercício regular de direitos), conforme o caso | A retenção concreta é decisão da titular |

## 4. Transferência internacional (art. 33)

Os operadores podem processar dados fora do Brasil:

- **AWS:** região us-east-1;
- **Microsoft:** a região do tenant do M365 (a confirmar);
- **Cloudflare:** rede global.

Base possível: cláusulas contratuais dos termos de cada provedor (as cláusulas-padrão da ANPD estão na Resolução CD/ANPD
nº 19/2024). Confirmar a adequação dos termos é parte da revisão jurídica. Opção técnica: o backend poderia rodar em
sa-east-1 (São Paulo), que tem Lambda, API Gateway, DynamoDB e SES (verificar disponibilidade no momento do
provisionamento).

## 5. Direitos dos titulares (art. 18)

O aviso cita confirmação, acesso, correção, exclusão e informação sobre compartilhamento, pelo e-mail `contato@`. Como
o backend não guarda o conteúdo, os pedidos se resolvem na caixa de e-mail e no Bookings, que é onde os dados ficam.

## 6. Revisão de segurança (§5.5)

| Ameaça | Controle | Verificado em |
|---|---|---|
| Robô enchendo a caixa comercial | Throttling do API Gateway, armadilha, tempo mínimo, 5/h e 10/dia por IP, teto de 50/dia, Turnstile e concorrência 2 | `api-solicitacoes` (limite, teto, armadilha, rápido demais, desafio); homologação `falha-limite-429`, `envio-rapido-demais-recusado` |
| API usada para enviar e-mail a terceiros | Destinatário e remetente fixos, campos extras recusados, sem CR/LF e IAM com `ses:Recipients`/`ses:FromAddress` | `contrato recusa: campo desconhecido`, `injeção de cabeçalho`, `IAM da função` |
| Injeção no e-mail (cabeçalhos/HTML) | Campos de uma linha sem controle nem CR/LF; corpo só texto; assunto fixo | `contrato recusa: …`, `SES: … só texto` |
| Duplicidade (duplo clique, nova tentativa, rede instável) | `idSolicitacao` + registro condicional; botão desabilitado durante o envio | `idempotência: …`; homologação `envio-sem-duplicidade`, `falha-nova-tentativa-mesmo-id-uma-entrega` |
| Vazamento de dados em logs | Linha de log com campos permitidos; erros do provedor só pelo nome | `logs operacionais sem dados pessoais…`; homologação `logs-sem-dados-pessoais` |
| Dados pessoais em URL | POST JSON; URL fixa | homologação `envio-dados-so-no-corpo` |
| Afirmação falsa de recebimento | "Recebida" só com 202 + mesmo id + protocolo válido | homologação `envio-recebida-so-com-confirmacao-do-servidor`; `falha-*` |
| Credenciais | Lambda com role; segredos no SSM SecureString; nada no GitHub nem no código | `Lambda montado com clientes simulados…`; varredura do diff (relatório §5) |
| Outra origem usando a API pelo navegador | CORS só `https://nekkora.com`, sem credenciais | `CORS: …` |
| Página do Bookings controlando a aba de origem | `rel="noopener noreferrer"` e link comum | homologação `agendamento-sem-opener-e-sem-referer`, `agendamento-sem-window-open` |
| Script de terceiro sem controle | Turnstile só com a chave e só na confirmação; CSP com a origem exata | CSP gerada e conferida (portão e `--politica-do-build`) |

**Riscos residuais:**

- um robô dirigido que resolva o Turnstile ainda consegue enviar até o teto diário (50 e-mails);
- o SES no sandbox limita a 200/dia, o que é aceitável;
- o Bookings pode ser usado por robôs para marcar horários (fora do controle do site): acompanhar e, se acontecer,
  exigir confirmação por e-mail no Bookings.

## 7. Para a titular aprovar

1. Texto do aviso nas duas variantes (§1).
2. Bases legais (§3) e retenção da caixa comercial e das reservas.
3. Transferência internacional (§4).
4. Razão social (PUB-09).
5. Depois disso: `aprovacoes.avisoDePrivacidade: true`.
