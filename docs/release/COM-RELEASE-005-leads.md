# COM-RELEASE-005 — Agendamento e recebimento automático de solicitações (D02, D04, D05, D08)

**Data:** 22/10/2026 · **Branch:** `feat/com-release-005-leads-bookings` (a partir de `feat/com-release-003-aws` @ `e937e65`)
· Relatório e testes em [COM-RELEASE-005-relatorio.md](COM-RELEASE-005-relatorio.md) · Privacidade em
[COM-RELEASE-005-privacidade.md](COM-RELEASE-005-privacidade.md).

**Nada foi criado fora do repositório.** Nenhum serviço da AWS, nenhuma configuração do Microsoft 365, nenhum widget da
Cloudflare e nenhum DNS. Tudo abaixo que é "na conta" é instrução para quando a titular autorizar. Os valores
apresentados como reais vêm de `publicacao.json`, e os da homologação são sintéticos.

## 1. Os dois caminhos

| Caminho | Como funciona | Situação na publicação atual |
|---|---|---|
| **Solicitar avaliação** | Diálogo existente (formulário → revisão → envio). O envio usa **um único mecanismo** por vez, nesta precedência: (1) **envio automático** ao backend, quando houver endpoint; (2) WhatsApp, quando houver número; (3) **e-mail** (mailto), que é o canal atual. Com o envio automático ativo, o e-mail aparece só como **alternativa de contato** na falha, nunca como um segundo envio | E-mail (mailto). Sem endpoint, nada muda para o visitante |
| **Agendar conversa** | Botão que abre a **página oficial do Microsoft Bookings** em outra aba: link comum, `rel="noopener noreferrer"`, sem `window.open` e sem iframe. Aparece no topo (no lugar de "Ver como funciona", que continua no menu), no contato (ao lado de "Solicitar avaliação") e no diálogo | **Oculto**, porque a URL oficial não foi informada (PUB-20) |

Configuração em [`publicacao.json`](../../publicacao.json):

```json
"agendamento": { "url": null, "obrigatorio": true },
"envioAutomatico": { "endpoint": null, "chaveDoSiteTurnstile": null },
"aprovacoes": { …, "agendamento": false, "envioAutomatico": false, … }
```

- **`agendamento.url`**: a URL só é aceita (pela regra única de `src/agendamento-url.js`, usada pela página e pelo
  portão) se for `https`, em `bookings.cloud.microsoft` (endereço atual) ou nos legados `outlook.office365.com` e
  `outlook.office.com`, com caminho de página de reservas (`/book/…` ou, nos legados, `/owa/calendar/…/bookings`) e
  com a caixa de reservas **no domínio do e-mail comercial** (`@nekkora.com`). Uma caixa `*.onmicrosoft.com` só vale
  com o tenant declarado em `agendamento.dominioDoTenant`. Ficam de fora a página inicial, URLs de outras organizações,
  domínios de exemplo, query, credenciais e caracteres codificados no caminho. Detalhes em
  [NEKKORA-COM-007](NEKKORA-COM-007-bookings.md). **URL registrada em 28/10/2026:**
  `https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/` (`aprovacoes.agendamento` continua `false`).
  Sem uma URL válida, **o botão não aparece**: a página não aponta para endereço inexistente nem apresenta o
  agendamento como disponível.
- **`agendamento.obrigatorio: true`**: o agendamento faz parte do lançamento (§4, P0), então o portão **bloqueia** a
  publicação sem a URL (PUB-20). Se a titular decidir lançar sem agendamento, basta `false`.
- **`envioAutomatico.endpoint`**: só com o backend publicado e homologado na AWS (PUB-21).
- **`chaveDoSiteTurnstile`**: a chave pública do desafio. O portão recusa a chave de teste da Cloudflare.

A página **nunca afirma que uma reunião foi agendada**. A nota no contato diz: "A conversa só fica marcada quando o
Bookings confirmar."

## 2. Arquitetura do recebimento automático

```text
Formulário React ─ revisão ─ "Enviar solicitação" (+ token do Turnstile)
      │  POST JSON  https://<api>/v1/commercial/requests   (dados só no corpo; sem cookies)
      ▼
Amazon API Gateway (HTTP API, estágio $default)
      │  throttling da rota (1 req/s, rajada 5) · CORS só https://nekkora.com
      ▼
AWS Lambda nekkora-commercial-solicitacoes (Node 22, arm64, 128 MB, 10 s, concorrência reservada 2)
      ├─ CORS (Origin) ─ rota/método ─ contrato (8 KiB, campos e limites)
      ├─ armadilha + tempo mínimo ─ limite por IP (HMAC) e teto diário ─ Turnstile (siteverify)
      ├─ idempotência (idSolicitacao) ──────────── DynamoDB (on-demand, TTL; sem dados pessoais)
      └─ entrega ──────────────────────────────── Amazon SES → contato@nekkora.com (Reply-To = visitante)
Segredos: SSM Parameter Store (SecureString) · Logs: CloudWatch, 14 dias, sem dados pessoais
```

Código em [`api/solicitacoes/`](../../api/solicitacoes/), sem dependências além do SDK da AWS, que o runtime do Lambda já
traz:

| Arquivo | Papel |
|---|---|
| `contrato.mjs` | Contrato e validação no servidor. Limites: corpo ≤ 8 KiB, nome 2–100, e-mail ≤ 254 (obrigatório), empresa ≤ 120, descrição 20–1.000. Recusa campos desconhecidos (ex.: `para`, `cc`), caracteres de controle e CR/LF em campos de uma linha (injeção de cabeçalho) |
| `antiabuso.mjs` | Armadilha (`site`), tempo mínimo de 3 s, limite de 5/hora e 10/dia por IP (guardado só como HMAC), teto global de 50/dia (alerta no log) e verificador do Turnstile |
| `armazenamento.mjs` | Idempotência e contadores: em memória (testes e servidor local) ou DynamoDB (produção) |
| `entrega.mjs` | Composição da mensagem (texto puro, assunto fixo com protocolo) e entrega pelo SES. Destinatário e remetente **fixos** |
| `manipulador.mjs` | O handler HTTP: ordem dos controles, respostas e logs |
| `lambda.mjs` | Entrada do Lambda: variáveis de ambiente, segredos do SSM e clientes reais |

### 2.1 Contrato HTTP

`POST /v1/commercial/requests`, `Content-Type: application/json`:

```json
{ "idSolicitacao": "<UUID v4>", "nome": "…", "email": "…", "empresa": "…", "descricao": "…",
  "desafio": "<token Turnstile>", "preenchimentoMs": 12345, "site": "" }
```

| Status | `codigo` | Quando | A página |
|---|---|---|---|
| **202** | — (`recebida: true`, `protocolo`, `duplicada`) | Entregue à caixa comercial, ou já tinha sido (mesma solicitação) | "Solicitação recebida — Protocolo NK-…" (só com o **mesmo** `idSolicitacao`) |
| 400 | `campo-invalido`, `json-invalido`, `campo-desconhecido`, `corpo-vazio` | Contrato | "Não foi possível enviar…", sem "Tentar novamente" |
| 400 | `solicitacao-recusada` | Armadilha preenchida ou envio rápido demais | idem |
| 403 | `origem-nao-permitida` / `desafio-invalido` | Outra origem / token recusado | — / refaz o desafio |
| 404 / 405 / 413 / 415 | `rota` / `metodo` / `corpo-grande-demais` / `tipo-de-conteudo` | — | "Não foi possível enviar…" |
| 409 | `conflito` / `em-processamento` | Mesmo id com outro conteúdo / outra tentativa em andamento | recusada / tentar de novo |
| 429 | `limite` (`Retry-After`) | Limite por IP ou teto diário | "Muitas solicitações… use o e-mail" |
| 502 | `entrega-indisponivel` | SES falhou. O pedido é liberado para nova tentativa | "Falha temporária… tente de novo ou use o e-mail" |
| 503 | `desafio-indisponivel` | Cloudflare fora do ar | refaz o desafio |
| 500 | `erro-interno` | Inesperado, sem detalhes | falha temporária |

Respostas sempre em JSON, com `Cache-Control: no-store`, sem eco dos dados enviados. Os **logs** têm uma linha por
pedido, com `requestId`, hash do id, status, resultado, motivo e latência. Ficam **fora** nome, e-mail, empresa,
descrição, IP, token e segredos, o que é verificado em testes unitários e na homologação.

### 2.2 Por que a API não serve para enviar e-mails arbitrários

1. **Destinatário fixo** (`DESTINO`) e **remetente fixo** (`REMETENTE`), lidos da configuração. Nenhum campo do
   visitante vai para To, Cc, Bcc ou From. Campos extras são recusados (`campo-desconhecido`).
2. O e-mail do visitante vai só em **Reply-To** e no corpo, depois de validado (sem CR/LF nem vírgulas).
3. O **IAM repete a regra**: `ses:SendEmail` só com `ses:FromAddress = REMETENTE` e `ses:Recipients = [DESTINO]`
   ([`permissoes-lambda.json`](../../deploy/aws/solicitacoes/permissoes-lambda.json)). Vale mesmo se o código for
   alterado.
4. O **teto diário** (50) limita o volume total, e a concorrência reservada (2) limita o paralelismo e o custo.
5. **O CORS não é uma proteção contra abuso** e não foi tratado como tal. Ele só impede que outra página use a API pelo
   navegador de um visitante e leia a resposta. Quem protege a API são os controles 1 a 4, mais o throttling do API
   Gateway, a armadilha, o tempo mínimo, o limite por IP e o Turnstile.

### 2.3 Idempotência

O navegador gera um `idSolicitacao` (UUID v4) na revisão. **"Tentar novamente" reenvia o mesmo id.** Se o conteúdo
mudar ("Voltar e editar"), sai um id novo. O servidor registra o id antes de entregar:

- **mesmo id e mesmo conteúdo, já entregue** → 202 com o **mesmo protocolo**, sem segundo e-mail;
- **em andamento** → 409 recuperável;
- **falha na entrega** → o registro é desfeito e a nova tentativa entrega uma vez;
- **mesmo id com outro conteúdo** → 409.

O registro dura 24 h e não guarda dados pessoais.

## 3. Desafio antiautomação (§5.5)

| Opção | Custo | Acessibilidade | CSP / terceiros | Privacidade | Decisão |
|---|---|---|---|---|---|
| **Cloudflare Turnstile** (modo gerenciado, `interaction-only`) | Gratuito | Na maioria das vezes não pede nada; quando pede, o widget é operável por teclado e leitor de tela (a Cloudflare declara conformidade WCAG 2.1 AA) | `script-src` e `frame-src https://challenges.cloudflare.com`, **só nos builds com a chave** | A Cloudflare analisa sinais técnicos do navegador. Sem cookies no domínio do site. A Cloudflare já é o DNS da Nekkora | **Escolhido** |
| hCaptcha | Gratuito (com quebra-cabeças) | Pior: desafios visuais frequentes | Outro terceiro | Outro operador | Não |
| Google reCAPTCHA v3 | Gratuito até certo volume | Invisível | Google | Usa cookies e sinais do Google: pede outra revisão de privacidade | Não |
| AWS WAF CAPTCHA / Bot Control | ≥ US$ 5/mês pelo Web ACL, mais regras e desafios | Quebra-cabeça visual/sonoro | — | AWS | **Não**: a missão proíbe ativar WAF automaticamente e o custo não cabe na fase atual |
| Só armadilha + limites | Gratuito | Total | Nenhum | Nenhum | É a reserva e já está implementada. Sozinha, não para robôs dirigidos |

Implementação ([`src/desafio.tsx`](../../src/desafio.tsx)):

- O script só carrega **na etapa de confirmação** e só com `chaveDoSiteTurnstile`, então quem não envia nada não fala com a Cloudflare.
- O botão "Enviar" fica desabilitado até chegar o token.
- O token vale uma vez. Depois de uma recusa ele é descartado, e "Tentar novamente" espera um token novo.
- Se o script não carregar, a página avisa e oferece o e-mail.
- No servidor, o `siteverify` recebe o segredo e o token **no corpo**, com `idempotency_key` = id do pedido (uma nova tentativa com o mesmo token é aceita) e o hostname conferido.
- A CSP é gerada do `release.json`, portanto é a mesma no CloudFront, no portão e na homologação.

## 4. Entrega das solicitações: Microsoft Graph × Amazon SES (D05)

| Critério | **A — Microsoft Graph** (`sendMail` em nome de uma caixa do M365) | **B — Amazon SES** (SendEmail v2) |
|---|---|---|
| Custo | Incluído na licença do M365 | US$ 0,10 por 1.000 e-mails: **centavos por ano** neste volume |
| Credencial | Registro de aplicativo no Entra ID com **segredo ou certificado**, guardado no SSM e com rotação manual | **Nenhuma**: a role do Lambda usa credenciais temporárias |
| Permissões | `Mail.Send` de aplicativo, com **consentimento de administrador**. Sem uma *Application Access Policy* ou RBAC for Applications, o aplicativo pode enviar **como qualquer caixa do tenant**. Exige alterar permissões do M365 (não autorizado nesta missão) | IAM com condições `ses:FromAddress` e `ses:Recipients`: só o remetente fixo, só para a caixa comercial |
| Configuração | Registro do app, consentimento, política de acesso à caixa, segredo/certificado e rotação | Identidade de domínio com DKIM (3 CNAMEs na Cloudflare, sem tocar nos registros do M365) e, opcionalmente, MAIL FROM próprio |
| Limites | Limites de envio do Exchange Online (folgados para este volume) | No **sandbox**: 200/dia e 1/s, e **só para destinatários verificados**. Como o único destinatário é `contato@nekkora.com` (do domínio verificado), **o sandbox basta**: não é preciso pedir acesso de produção |
| Entregabilidade | Excelente: a mensagem nasce dentro do tenant | Boa, com DKIM alinhado (`d=nekkora.com`). Sem DKIM, o M365 tenderia a marcar como falsificação do próprio domínio |
| Disponibilidade | Graph/Exchange Online | SES regional (us-east-1). Falhas temporárias viram 502 recuperável |
| Monitoramento | Logs de auditoria do M365 | Configuration set (rejeições e reclamações), métricas e o log da função |
| Complexidade | Maior: duas plataformas, credencial de longa duração e risco de escopo amplo no tenant | Menor: tudo na mesma conta AWS, sem segredo de envio |

**Escolha: Amazon SES.** Elimina a credencial de longa duração, que é justamente o tipo de segredo que vazou no REP-03
(`CLIENT_SECRET` do Azure). Prende o envio por IAM a um remetente e um destinatário. Não exige alterar permissões do
Microsoft 365 e funciona no sandbox, sem pedido de produção. O custo é desprezível. O ponto de atenção é a **entrega no
M365**: DKIM do domínio no SES é obrigatório antes de ativar, e o primeiro envio real precisa da aprovação da titular.

## 5. Configuração do Microsoft Bookings (D02, ação da titular)

**Atualização (NEKKORA-COM-007, 28/10/2026):** a titular configurou a página compartilhada "Nekkora" com o serviço
"Conversa inicial — Nekkora Delivery" (30 min, Teams, seg–sex 09h–18h, 24 h a 30 dias de antecedência, 15 min de
intervalo) e fez uma reserva real de teste. Evidências e testes pendentes em
[NEKKORA-COM-007 §3](NEKKORA-COM-007-bookings.md#3-testes). O roteiro abaixo é o original; os valores homologados
são os da titular.

Os nomes dos menus podem variar conforme a versão do Bookings.

1. **Licença:** confirmar que o plano inclui o Bookings (Microsoft 365 Business Basic, Standard ou Premium, ou E3/E5).
   No centro de administração, o Bookings precisa estar habilitado para a organização.
2. **Página de reservas:** criar a página "Nekkora Delivery" (cria-se uma caixa de reservas, por exemplo
   `NekkoraDelivery@nekkora.com`). Fuso: **(UTC−03:00) Brasília**.
3. **Serviço** "Avaliação inicial de automação — Nekkora Delivery":
   - duração 20 min, **reunião do Teams** ligada, preço **gratuito**;
   - antecedência mínima 24 h e intervalo de 15 min após cada reunião;
   - disponibilidade definida pela titular.
4. **Perguntas** (quando o Bookings permitir):
   - Empresa;
   - Processo que deseja automatizar;
   - Sistemas envolvidos;
   - Breve descrição da necessidade.

   Nome e e-mail o Bookings já pede. Incluir na descrição do serviço: "Não informe senhas, tokens, credenciais nem
   documentos sigilosos." Não pedir telefone nem documento.
5. **Privacidade da página:** se existir a opção, desligar a indexação por buscadores. Conferir o texto de privacidade
   que o Bookings mostra.
6. **Publicar** e copiar a URL pública, no formato `https://bookings.cloud.microsoft/book/<caixa>@nekkora.com/` (o
   formato legado `https://outlook.office365.com/book/…` também é aceito), sem query (`?…`). Abrir em
   computador e em celular, numa janela anônima, e conferir horários, fuso, duração e perguntas.
7. Gravar a URL em `publicacao.json → agendamento.url` e, depois do teste, `aprovacoes.agendamento: true`. O portão
   (PUB-20) e a homologação (`agendamento-*`) conferem o restante.

## 6. Provisionamento do backend (D08). **Não executar sem autorização**

Ordem sugerida. Tudo em us-east-1, com o usuário administrativo com MFA (nunca o root).

| # | Recurso | Configuração | Observação |
|---|---|---|---|
| 1 | **SES**: identidade de domínio `nekkora.com` | Easy DKIM (RSA 2048). Opcional: MAIL FROM `envio.nekkora.com` | **DNS:** 3 CNAMEs `…._domainkey` na Cloudflare (DNS only), mais MX/TXT do MAIL FROM se usado. Não tocar em MX, SPF, `selector1`/`selector2` nem `MS=`. Precisa de autorização (alteração de DNS) |
| 2 | **SES**: configuration set `nekkora-commercial` (opcional) | Eventos de rejeição e reclamação | Se usar, acrescentar o ARN dele à política |
| 3 | **DynamoDB**: tabela `nekkora-commercial-solicitacoes` | Chave `pk` (String), sob demanda, TTL no atributo `expira` | Sem PITR: não há dados pessoais |
| 4 | **SSM**: `/nekkora-commercial/solicitacoes/turnstile` e `/nekkora-commercial/solicitacoes/segredo-ip` | SecureString (chave `aws/ssm`). O segundo com 32+ caracteres aleatórios | Nunca no GitHub nem em variáveis do Lambda |
| 5 | **IAM**: role `nekkora-commercial-solicitacoes` | `node scripts/aws/gerar-config.mjs --solicitacoes --conta <ID> --identidade nekkora.com --remetente formulario@nekkora.com --destino contato@nekkora.com --saida <pasta>` gera a confiança e as permissões | Só Lambda desta conta e função. Sem curingas e sem administração (teste `IAM da função`) |
| 6 | **Lambda** `nekkora-commercial-solicitacoes` | nodejs22.x, arm64, 128 MB, timeout 10 s, **concorrência reservada 2**, handler `lambda.handler` (zip com `api/solicitacoes/*.mjs`), variáveis do cabeçalho de `lambda.mjs`, logs com retenção de **14 dias** | O SDK v3 vem do runtime. Fixar a versão no zip só se o comportamento mudar |
| 7 | **API Gateway** HTTP API | Rota `POST /v1/commercial/requests` → Lambda (payload 2.0), estágio `$default`, **throttling 1 req/s e rajada 5**. CORS: origem `https://nekkora.com`, método POST, cabeçalho `content-type`, max-age 600, sem credenciais | O endpoint (`https://<id>.execute-api.us-east-1.amazonaws.com/v1/commercial/requests`) vai em `publicacao.json`. Domínio próprio (`api.nekkora.com`) exigiria certificado e DNS |
| 8 | **Turnstile** (painel da Cloudflare) | Widget gerenciado para `nekkora.com`. Chave do site em `publicacao.json`, segredo no SSM (passo 4) | Gratuito |
| 9 | **Alertas** | Filtro de métrica em `"alerta":"limite-diario"` e erros 5xx → SNS por e-mail. **AWS Budgets** com alerta de US$ 1 | Opcional, recomendado |
| 10 | **Build e CSP** | Com o endpoint e a chave em `publicacao.json`: `npm run build` e `node scripts/aws/gerar-config.mjs`. A CSP passa a incluir a origem da API e o Turnstile. Atualizar a Response Headers Policy (INF-03) | O portão recusa a política divergente |
| 11 | **Homologação real** | Uma solicitação de teste pela página publicada, **com aprovação da titular** (envio real), conferindo o recebimento em `contato@`, o Reply-To e o protocolo | Só então `aprovacoes.envioAutomatico: true` (PUB-21) |

**Sem endpoint, nada disso é necessário para publicar.** A jornada continua pelo e-mail (mailto) e o portão não exige
PUB-21.

## 7. Estimativa de custos (us-east-1, antes de provisionar)

Volume de referência: **100 solicitações/mês** (o teto diário de 50 limita o máximo a cerca de 1.500/mês). São preços
públicos de lista. **Confirme na [calculadora da AWS](https://calculator.aws/) antes de provisionar.**

| Serviço | Preço de lista | 100/mês | No teto (1.500/mês) |
|---|---|---:|---:|
| API Gateway HTTP API | US$ 1,00 por milhão de requisições | < US$ 0,01 | < US$ 0,01 |
| Lambda (arm64, 128 MB, ~200 ms) | 1 milhão de requisições e 400 mil GB-s grátis por mês | US$ 0 | US$ 0 |
| DynamoDB sob demanda | Centavos por milhão de requisições; 25 GB grátis | < US$ 0,01 | < US$ 0,01 |
| SES | US$ 0,10 por 1.000 e-mails | ~US$ 0,01 | ~US$ 0,15 |
| SSM Parameter Store (padrão) | Gratuito | US$ 0 | US$ 0 |
| CloudWatch Logs (14 dias) | US$ 0,50/GB ingerido | < US$ 0,01 | < US$ 0,01 |
| Cloudflare Turnstile | Gratuito | US$ 0 | US$ 0 |
| Microsoft Bookings | Incluído na licença do M365 (se o plano tiver) | US$ 0 | US$ 0 |
| **Total estimado** | | **< US$ 0,05/mês** | **< US$ 0,25/mês** |

**Fora da estimativa, de propósito:**

- AWS WAF: a partir de US$ 5/mês, não ativado;
- domínio próprio para a API;
- SNS por SMS;
- qualquer VPS ou banco relacional (nenhum é usado).

## 8. Homologação local (o que foi exercitado)

- **Build sintético:** `scripts/fixtures/publicacao-homologacao-api.json`, com endpoint local, chave de teste do Turnstile e Bookings `@exemplo.invalid`.
- **Servidor:** CloudFront local com a política do próprio build (`--politica-do-build`).
- **Backend:** `scripts/api-local.mjs`, com o mesmo manipulador do Lambda, armazenamento em memória e **entrega simulada**.
- **Resultado:** `scripts/homologacao-leads.mjs` passou com **141/141** nos três navegadores.
- **Simulações dentro da homologação:**
  - o script do Turnstile e a página do Bookings são respondidos localmente;
  - **nenhuma requisição sai da máquina e nenhum e-mail real foi enviado**;
  - o Bookings real, o Turnstile real e o backend na AWS **não foram testados**: dependem das ações dos §5 e §6.
