# NEKKORA-RELEASE-001 — Pendências que dependem da titular

Atualizado na COM-RELEASE-005 (22/10/2026), na **NEKKORA-COM-008-C (28/10/2026)**, com as decisões da COM-008-B, e na
**NEKKORA-COM-PRIVACY-001 (05/11/2026)**, com as decisões sobre gravação e as evidências do Bookings e do Teams (§2c), e na **NEKKORA-COM-LEGAL-BASE-001 (05/11/2026)**, revisão legal interna com fontes oficiais ([relatório](NEKKORA-COM-LEGAL-BASE-001.md); **não é parecer jurídico**; a revisão por advogado(a) foi adiada pela titular e continua pendente).
Nada abaixo foi presumido; nenhuma aprovação foi marcada. Enquanto um item estiver pendente, a página
não faz a afirmação correspondente e o portão `npm run verificar:publicacao` **bloqueia o deploy de produção** (ele
lista os mesmos IDs). Todos os dados entram em um único arquivo: [`publicacao.json`](../../publicacao.json). O campo
`$origem` registra de onde veio cada valor já preenchido.

## 1. Dados para publicar (`publicacao.json`)

| ID | Item | Campo | Situação |
|---|---|---|---|
| PUB-01 | WhatsApp comercial | `canais.whatsapp` | **Fora do lançamento**: a titular decidiu publicar só e-mail e LinkedIn (22/10/2026). O campo fica `null`, a página não mostra WhatsApp e a jornada usa o e-mail. Para incluir depois, basta o número (só dígitos, DDI+DDD) |
| PUB-02 | E-mail comercial | `canais.email` | **Preenchido**: `contato@nekkora.com`. O domínio tem e-mail no Microsoft 365; confirme que a caixa recebe mensagens antes de publicar |
| PUB-03 | LinkedIn (obrigatório) e Instagram (opcional) | `canais.linkedin`, `canais.instagram` | **Preenchido**: `https://www.linkedin.com/company/nekkora`. Instagram fora (`null`) |
| PUB-13 | Início e fim da campanha de lançamento | `campanhaLancamento.inicio/fim` (AAAA-MM-DD) | **Preenchido** pela titular em 04/11/2026: **06/11/2026 a 06/01/2027**. Regra aprovada na COM-008-B: dois meses a partir da publicação oficial; o código não calcula as datas. Dentro do período (fuso de Brasília) a página diz "para solicitações de avaliação recebidas de 06/11/2026 a 06/01/2027" e mostra os preços de lançamento nos cartões e no simulador; antes e depois, só o preço padrão (homologado nos três navegadores na COM-RELEASE-FIX-001). O portão recusa campanha encerrada. **Atenção:** se a publicação oficial ocorrer depois de 06/11/2026, a titular decide se ajusta as datas. Comprovação da data da solicitação: [`condicoes-comerciais-minuta.md` §8.1](../comercial/condicoes-comerciais-minuta.md) |
| PUB-09 | Controlador dos dados pessoais | `controlador.nome/documento` | **Preenchido**: razão social "NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA" (04/11/2026) e CNPJ `68.337.624/0001-32` (dígitos verificadores conferidos). O aviso mostra os dois. Falta só a **aprovação** do aviso (PUB-09 em §2) |
| PUB-11 | Provedor de hospedagem | `hospedagem.provedor` | **Preenchido**: "Amazon Web Services (AWS)" (COM-RELEASE-003 §1.1) |
| **PUB-22** | **Endereço comercial do fornecedor** no rodapé (Decreto 7.962/2013, art. 2º, II) — NEKKORA-COM-LEGAL-BASE-001 | `fornecedor.endereco` | **Pendente — decisão da titular.** Nome empresarial, CNPJ e e-mail já aparecem no rodapé (art. 2º, I). O agente **não** preencheu nem presumiu endereço. Alternativas: [relatório §3.1](NEKKORA-COM-LEGAL-BASE-001.md) (endereço registrado no CNPJ; endereço comercial com atualização do registro). O portão bloqueia enquanto for `null` |
| PUB-20 | **Agendamento (Microsoft Bookings)**: URL oficial da página de reservas e confirmação de que o serviço foi configurado e testado | `agendamento.url`, `aprovacoes.agendamento` | **Aprovado pela titular em 05/11/2026** (`aprovacoes.agendamento: true`). URL registrada em 28/10/2026 (NEKKORA-COM-007): `https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/`, aceita pela validação. Critérios definidos para a aprovação: lembrete de 2 h, cancelamento com liberação do horário e abertura efetiva do link do Teams ([NEKKORA-COM-007 §3.2](NEKKORA-COM-007-bookings.md)). Faz parte do lançamento (`obrigatorio: true`). Formatos aceitos: `https://bookings.cloud.microsoft/book/<caixa>@nekkora.com/` e o legado `https://outlook.office365.com/book/…`. Para lançar sem agendamento: `obrigatorio: false` |
| PUB-21 | **Envio automático** do formulário (opcional): endpoint do backend, chave do Turnstile e autorização | `envioAutomatico.*`, `aprovacoes.envioAutomatico` | Não exigido enquanto `endpoint` for `null` (a jornada continua pelo e-mail). Com endpoint: https, chave real do Turnstile e autorização, depois da homologação na AWS (INF-11 a INF-16) |

## 2. Decisões e aprovações (`publicacao.json → aprovacoes`)

| ID | Decisão | Campo | Situação |
|---|---|---|---|
| PUB-14 | Preços: simples R$ 1.500 → R$ 1.000 (−33,33%, economia de R$ 500); média R$ 3.500 → R$ 2.800 (−20%, economia de R$ 700); complexa sob orçamento, sem desconto automático | `precos` | **Aprovado** na COM-RELEASE-003-R1 §3.1 |
| PUB-19 | Condições comerciais (COM-008-B): 50% após a aprovação e a formalização + 50% após a homologação e o aceite formal; várias automações com preço e aceite próprios; cancelamento, reembolso e garantia conforme a proposta e o contrato, com os direitos legais. Minuta: [`docs/comercial/condicoes-comerciais-minuta.md`](../comercial/condicoes-comerciais-minuta.md) — **não aprovada juridicamente** | `condicoesComerciais` | Pendente. **Revisão interna feita na LEGAL-BASE-001** ([minuta §9](../comercial/condicoes-comerciais-minuta.md): C-01 a C-12, inclusive conflitos de diretriz com norma: "retenção" (C-04), garantia de 30 dias sobreposta ao prazo legal (C-07), Modelo A × Lei 9.609, art. 4º (C-09), arrependimento ausente (C-02)) e [proposta-modelo](../comercial/proposta-modelo-delivery.md). Depende de decisão da titular e da revisão por advogado(a) (JUR-01 a JUR-05) |
| PUB-17 | Textos comerciais — [`docs/com-001/05-texto-comercial.md`](../com-001/05-texto-comercial.md) (gerado do código), inclusive o **simulador de investimento**, o formulário com tipo de solicitação, a jornada por e-mail e, na seção 7b, o envio automático e o agendamento. Revisados na COM-008-C (AUD-07, 09, 10, 13, 18, 19, 25). Variante com tudo ligado: [`com-release-005/texto-com-envio-automatico-e-bookings.md`](com-release-005/texto-com-envio-automatico-e-bookings.md) | `textosComerciais` | **Aprovado pela titular em 05/11/2026** (`aprovacoes.textosComerciais: true`). A evolução futura da jornada por e-mail (mailto) ficou registrada no [backlog do Commercial](../roadmap/NEKKORA-COMMERCIAL-BACKLOG.md) (COMMERCIAL-LEADS-001), sem implementação agora. ⚠ **Textos alterados depois da aprovação, na LEGAL-BASE-001:** rodapé com identificação do fornecedor, item "Conversa sem gravação" (substitui "Gravação da conversa") e retenção sem a frase das gravações. **Precisa de nova aprovação da titular.** O campo continua `true` e o portão não acusa a mudança: a aprovação registrada corresponde ao texto anterior |
| PUB-09 | Aviso de privacidade (seção "Como tratamos seus dados"), revisado na COM-008-C (razão social e CNPJ, Teams, retenção de 6 meses / 90 dias, transferência internacional, escopo de "sem cookies", sem consentimento para o atendimento) e na COM-PRIVACY-001 (item **"Gravação da conversa"** e prazo padrão de 30 dias das gravações). Minuta: [`docs/comercial/privacidade-minuta.md`](../comercial/privacidade-minuta.md). Revisão jurídica **obrigatória** | `avisoDePrivacidade` | Pendente (JUR-06 a JUR-09, OPS-01, OPS-02, OPS-09, OPS-10, LOG-01). **LEGAL-BASE-001:** sem gravação nesta fase (aviso corrigido; JUR-10 e OPS-05 saem do lançamento); inventário de tratamentos, transferência internacional e pequeno porte com fontes ([minuta §5.1, §6 e §7](../comercial/privacidade-minuta.md)) |
| PUB-10 | Desligar o aviso "Versão para homologação" | `avisoHomologacao: false` | Pendente |
| PUB-18 | Autorização expressa de publicação em produção | `publicacao` | Pendente |
| PUB-16 | Botão "Entrar" sem destino (não há área do cliente) | — (código) | **Resolvido na COM-008-C**: oculto por decisão da COM-008-B (AUD-26). Área de clientes: futura Platform ([backlog](../roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md)) |

## 2a. Revisão jurídica (antes das aprovações PUB-09 e PUB-19) ⚖

A **revisão interna** da NEKKORA-COM-LEGAL-BASE-001 (05/11/2026) está registrada na última coluna. **Ela não é parecer
jurídico.** A revisão por advogado(a) foi **adiada pela titular** e continua pendente em todos os itens. Matriz completa:
[relatório §5](NEKKORA-COM-LEGAL-BASE-001.md).

| ID | Tema | Documento | Revisão interna (LEGAL-BASE-001) |
|---|---|---|---|
| JUR-01 | Pagamento 50% + 50%, entrega definitiva após a quitação, atraso e nota fiscal | `condicoes-comerciais-minuta.md` §2 | C-05, C-11: compatível com o CC art. 476, com ressalvas. Decisão pendente |
| JUR-02 | Homologação sem aceite tácito: prazo de manifestação e rodadas de correção | §3 | C-06: 10 dias úteis, 2 lembretes, suspensão; defeito sempre corrigido. Decisão pendente |
| JUR-03 | Cancelamento e reembolso, inclusive o direito de arrependimento (CDC, art. 49) e a retenção após a homologação | §4 | C-02, C-03, C-04: **arrependimento ausente; "retenção" conflita na redação.** Decisão pendente |
| JUR-04 | Garantia contratual adicional de 30 dias e garantias legais (CDC, arts. 24 a 26) | §5 | C-07: **30 dias caem dentro do prazo legal** (interpretação). Decisão pendente |
| JUR-05 | Propriedade intelectual (Modelo A) e cláusula de dados do cliente (operadora, LGPD art. 39) | §7 | C-09: Modelo A-R (Lei 9.609, art. 4º). Cláusula de operadora **sem redação**. Decisão pendente |
| JUR-06 | Base legal do atendimento (art. 7º, V ou IX) e ciência × consentimento no Bookings | `privacidade-minuta.md` §2, §4 | V para o contratante; IX para o representante (texto proposto, **não aplicado**). Decisão pendente |
| JUR-07 | Transferência internacional (art. 33) e regiões da AWS e do Microsoft 365 | §5, §5.1 | **Sem mecanismo verificado**: Microsoft e AWS não publicam as CPC brasileiras para clientes; nenhuma equivalência estrangeira; UE adequada (Res. 32/2026); regiões não confirmadas. **Impede a aprovação do aviso** |
| JUR-08 | Agente de pequeno porte e encarregado (Res. CD/ANPD nº 2/2022) | `privacidade-minuta.md` §7 | Enquadramento provável; canal obrigatório (`contato@`); prazo em dobro. A titular confirma ME/EPP e a receita |
| JUR-09 | Identificação do fornecedor no site (Decreto 7.962/2013) e oferta vinculante com preços publicados (CDC, art. 30) | Relatório LEGAL-BASE-001 §3.1 | Nome e CNPJ no rodapé (**feito**); **endereço pendente (PUB-22)**; a oferta da campanha vincula (C-10) |
| JUR-10 | **Gravação de reuniões** (COM-PRIVACY-001): base legal (consentimento, art. 7º, I, ou outra base com a concordância como salvaguarda), consequência da recusa e da revogação, finalidade, prazo de 30 dias e transferência internacional das gravações (art. 33) | `privacidade-minuta.md` §2, §4a, §5 | **Fora do lançamento:** sem gravação nesta fase. Continua pendente para qualquer gravação futura |

## 2b. Operação (titular; fora do código)

| ID | Ação | Situação |
|---|---|---|
| OPS-01 | Procedimento de retenção **manual, sob responsabilidade da titular** (decidido em 05/11/2026): caixa `contato@` (até 6 meses), reservas do Bookings (até 90 dias) e gravações (prazo padrão de 30 dias; conferir que nenhuma teve a expiração estendida). Falta registrar periodicidade e registro de execução | **Procedimento registrado na LEGAL-BASE-001:** [`procedimento-retencao-e-direitos.md`](../comercial/procedimento-retencao-e-direitos.md) (revisão mensal, corte de 5 meses e 60 dias, registro sem dados pessoais, pedidos dos titulares). Pendente: **primeira execução registrada** pela titular. O aviso descreve o prazo, não uma eliminação automática |
| OPS-02 | Configurar no Bookings o texto proposto ([`privacidade-minuta.md` §4](../comercial/privacidade-minuta.md)): ciência em vez de "concorda", sem "telefone", com Teams, link do aviso depois da publicação; "Empresa" opcional | Pendente (M365 não alterado pelo agente). LEGAL-BASE-001: o texto proposto agora diz que **não há gravação**; conferência do texto real = CTL-03 |
| OPS-03 | Registrar "Data da solicitação" (canal e referência) em cada proposta da campanha | A partir do lançamento |
| OPS-04 | Proposta-modelo com campos de categoria, validade de 7 dias na campanha e critérios de aceite | **Rascunho criado na LEGAL-BASE-001:** [`proposta-modelo-delivery.md`](../comercial/proposta-modelo-delivery.md) (escopo, preço, pagamento, marcos, aceite, arrependimento, garantia, PI, cancelamento). Pendente: decisões C-01 a C-12, aprovação (PUB-19) e revisão por advogado(a) |
| OPS-05 | Gravação: definir a conduta quando um participante **não concorda** (parar a gravação ou seguir sem ela) e testar a recusa com um participante externo | Pendente — **fora do lançamento** (sem gravação nesta fase, LEGAL-BASE-001) |
| OPS-06 | Transcrição, anotações automáticas e chat da reunião: verificar se ficam ativos e qual a retenção (não cobertos pelos 30 dias) | Pendente — não verificado |
| OPS-07 | Comprovar a **eliminação** de uma gravação de teste depois dos 30 dias e do ciclo da lixeira do M365 | Pendente — só a expiração padrão foi verificada. Fora do lançamento enquanto não houver gravação |
| OPS-08 | Conferir o padrão de compartilhamento das novas gravações (a verificação cobriu só o arquivo testado) | Pendente — fora do lançamento enquanto não houver gravação |
| OPS-09 | Prazo dos itens recuperáveis e da lixeira no Microsoft 365 (Exchange e OneDrive): a eliminação manual só se completa depois deles | Pendente — não verificado (LEGAL-BASE-001) |
| OPS-10 | Bookings: verificar se reservas passadas podem ser excluídas e se a exclusão também tira os dados dos calendários da página e da organizadora | Pendente — não verificado (LEGAL-BASE-001) |
| CTL-01 | **Sem gravação comercial nesta fase** (diretriz da LEGAL-BASE-001). A política `Nekkora-Commercial` do Teams **ainda permite** gravar com concordância: decidir se a gravação é desligada na política ou se a regra fica só operacional | Pendente — decisão da titular (M365 não alterado pelo agente) |
| LOG-01 | **Registros de acesso** (Marco Civil, Lei 12.965/2014, art. 15: pessoa jurídica provedora de aplicação, 6 meses, sob sigilo). Os logs do CloudFront estão **desativados**. Decidir: ativar os logs padrão num bucket em `sa-east-1`, com acesso restrito, ciclo de vida de 6 meses e item no aviso, ou registrar, com fundamento, por que o artigo não se aplicaria | Pendente — **decidir antes da publicação** (mudança na AWS não feita pelo agente; [relatório R-06](NEKKORA-COM-LEGAL-BASE-001.md)) |
| CTL-05 | Teste externo de recebimento em `contato@nekkora.com` (mesmo item de REP-04), com passo a passo no procedimento §4 | Pendente — **impede a publicação** |

## 2c. Privacidade e gravações — controles homologados × pendências (COM-PRIVACY-001)

Evidências (sem URLs de compartilhamento, sem dados de participantes e sem gravações):
[`evidencias/com-privacy-001`](evidencias/com-privacy-001/README.md). Nada foi alterado no Microsoft 365, no DNS ou na
AWS pelo agente.

**Homologado pela titular (05/11/2026)**

| Controle | Evidência |
|---|---|
| Serviço "Conversa inicial — Nekkora Delivery", 30 min, Teams | Configuração do Bookings |
| Conta responsável pela reunião: `nicolly@nekkora.com` | Configuração do Bookings |
| Política personalizada `Nekkora-Commercial` criada e atribuída à conta responsável | Centro de administração do Teams |
| Pedido de concordância com a gravação exibido pelo Teams | Reunião real de teste |
| Sem gravação automática | Decisão da titular |
| Expiração padrão de 30 dias | Conferida visualmente no SharePoint |
| Link de acesso público removido | Arquivo de teste |
| Nenhum compartilhamento com grupos | Arquivo de teste |
| Tenant no domínio histórico `radiantsai-my.sharepoint.com`, administrado pela titular — **não renomear** | — |

**Não comprovado ou pendente**

| Tipo | Itens |
|---|---|
| Jurídico ⚖ | JUR-06 (base do atendimento), JUR-07 (transferência internacional), JUR-08 (encarregado), **JUR-10 (base legal e regras das gravações)** |
| Operacional | OPS-01 (procedimento manual), OPS-02 (texto do Bookings), OPS-05 (recusa), OPS-06 (transcrição e chat), OPS-07 (eliminação definitiva), OPS-08 (padrão de compartilhamento) |
| Aprovação | `aprovacoes.avisoDePrivacidade` continua `false` (PUB-09) |

## 2d. Revisão legal interna (NEKKORA-COM-LEGAL-BASE-001, 05/11/2026) — o que impede a publicação

Separação do [relatório §6](NEKKORA-COM-LEGAL-BASE-001.md). **Nenhuma aprovação foi presumida.** A revisão por
advogado(a) continua pendente (adiada pela titular).

| Grupo | Itens |
|---|---|
| **Impede a publicação** | PUB-22 (endereço) · **nova aprovação dos textos** alterados (PUB-17) · JUR-07 (transferência internacional) · LOG-01 (registros de acesso: decidir) · OPS-02/CTL-03 (texto real do Bookings) · REP-04/CTL-05 (recebimento do `contato@`) · PUB-09, PUB-19, PUB-18, PUB-10 |
| Impede a **1ª contratação** (não o site) | C-01 a C-12 da [minuta de condições §9](../comercial/condicoes-comerciais-minuta.md) · cláusula de operadora (JUR-05) · forma do aceite · nota fiscal |
| Só para **gravações futuras** | JUR-10 · OPS-05 a OPS-08 · CTL-01 |

## 3. Infraestrutura AWS (ações na conta da titular; nada foi feito pelo agente)

Passo a passo e justificativas em [COM-RELEASE-003-aws.md](COM-RELEASE-003-aws.md) §9. Esta máquina não tem
credenciais da AWS, então **nenhum identificador real foi lido**.

| ID | Ação | Onde |
|---|---|---|
| INF-01 | **Resolvido (27/10/2026).** Auditoria no CloudShell com 26 ok, 0 pendente, 0 falha. As falhas anteriores S07, K01, K02 (COM-RELEASE-003-aws §1.3) e C08 (§1.4) eram falsos positivos do auditor | AWS CloudShell |
| INF-02 | **Resolvido (26/10/2026).** Certificado ACM (us-east-1, `nekkora.com` + `www.nekkora.com`) `ISSUED` e associado à distribuição `E3TZD2P6FOEWWR`. Um pedido anterior ficou `VALIDATION_TIMED_OUT` e pode ser excluído no ACM quando a titular quiser (não afeta nada) | ACM |
| INF-03 | **Resolvido (27/10/2026, auditoria sem pendências).** Response Headers Policy a partir de `deploy/aws/politica-cabecalhos.json` | CloudFront → Policies |
| INF-04 | **Resolvido (27/10/2026, auditoria sem pendências).** CloudFront Function `deploy/aws/funcao-viewer-request.js` (viewer request) | CloudFront → Functions |
| INF-05 | **Resolvido (27/10/2026, auditoria sem pendências).** Comportamento padrão: CachingOptimized, compressão, GET/HEAD, redirect to HTTPS, política INF-03; páginas de erro 403/404 → `/404.html` (404) | CloudFront → distribuição |
| INF-06 | **Resolvido (27/10/2026, auditoria sem pendências).** Política do bucket `deploy/aws/iam/politica-bucket.json` (gerada com os IDs reais) | S3 → Permissions |
| INF-07 | **Resolvido (27/10/2026).** Provedor OIDC `token.actions.githubusercontent.com` e as roles `nekkora-commercial-deploy` e `nekkora-commercial-auditoria`. Confiança com a identidade imutável do repositório e `ref` = `refs/heads/main` (COM-RELEASE-003-aws §2.2). Falta o primeiro teste OIDC pelo workflow "Auditoria AWS", depois do merge (§2.4) | IAM |
| INF-08 | **Resolvido (27/10/2026).** Environment `production` (revisor obrigatório, só `main`) e `auditoria-aws`, com as variáveis do §2.3 | GitHub → Settings → Environments |
| INF-09 | **Autorização para alterar DNS do site**: `nekkora.com` e `www` como CNAME para o CloudFront, **DNS only**, sem tocar nos registros do Microsoft 365 | Cloudflare (após autorização) |
| INF-10 | Proteção da `main` (PR obrigatório + CI verde) | GitHub → Branches |

### 3.1 Agendamento e envio automático (COM-RELEASE-005). Só com autorização; nada foi criado

Passo a passo e custos (< US$ 0,05/mês no volume de referência) em [COM-RELEASE-005-leads §5 a §7](COM-RELEASE-005-leads.md).

| ID | Ação | Onde |
|---|---|---|
| EXT-01 | ~~Confirmar a licença; criar a página e o serviço e publicar~~ **Feito pela titular** (NEKKORA-COM-007): página "Nekkora", serviço "Conversa inicial — Nekkora Delivery", 30 min, Teams. Na COM-PRIVACY-001 houve uma reunião real de teste no Teams (pedido de concordância com a gravação exibido). Agendamento aprovado pela titular em 05/11/2026 → PUB-20 | Microsoft 365 / Bookings |
| INF-11 | SES: identidade `nekkora.com` com Easy DKIM. **Exige autorização de DNS** (3 CNAMEs `…._domainkey`, DNS only), sem tocar em MX, SPF, `selector1/2` nem `MS=` | SES + Cloudflare |
| INF-12 | DynamoDB `nekkora-commercial-solicitacoes` (pk String, sob demanda, TTL `expira`) | DynamoDB |
| INF-13 | SSM SecureString: `/nekkora-commercial/solicitacoes/turnstile` e `/segredo-ip` | Systems Manager |
| INF-14 | Role (`gerar-config.mjs --solicitacoes`), Lambda (concorrência 2, logs de 14 dias) e HTTP API (throttling 1/s, rajada 5; CORS só `https://nekkora.com`) | IAM, Lambda, API Gateway |
| INF-15 | Widget do Turnstile para `nekkora.com` (gratuito). Chave do site → `publicacao.json`, segredo → INF-13 | Cloudflare |
| INF-16 | Homologação real com **uma solicitação de teste aprovada pela titular** (envio real) → `aprovacoes.envioAutomatico` (PUB-21). Alertas: filtro `limite-diario`, 5xx e Budgets de US$ 1 | AWS + caixa `contato@` |

## 4. Repositório

| ID | Situação | Recomendação |
|---|---|---|
| REP-03 | Na pasta `Nekkora-Commercial`, o commit local `34d0aa5` ("fix: changing price") versionava o `.env` com credenciais. Ele nunca foi enviado. **Tratado na COM-RELEASE-003**: o commit foi desfeito localmente, o `.env` ficou intacto no disco e fora do índice, as mudanças de preço daquele commit continuam como alterações não commitadas e `.env`/`.env.*` estão no exclude local do repositório (`.git/info/exclude`), porque o `.gitignore` daquela branch não os cobria. As branches de release já os têm no `.gitignore`. Os preços oficiais foram implementados na branch limpa, **sem usar aquele commit**. Detalhes em [COM-RELEASE-003-relatorio.md](COM-RELEASE-003-relatorio.md) §6 | **Trocar as credenciais do `.env`** (senha do Postgres e `CLIENT_SECRET` do Azure). O conteúdo ainda fica no reflog local por ~90 dias: `git reflog expire --expire=now --all && git gc --prune=now` remove de vez, mas a decisão de apagar histórico é da titular |
| REP-04 | Contato por e-mail: confirmar que `contato@nekkora.com` **recebe** mensagens (enviar um teste de fora) e testar manualmente o "Abrir no e-mail" num computador e num celular com aplicativo de e-mail configurado. A homologação automatizada confere o mailto exato, mas não abre um aplicativo real. Lembrete: a mensagem só chega se o visitante enviá-la pelo próprio aplicativo | Titular — **impede a publicação** (CTL-05 na LEGAL-BASE-001) |
| PR-05 | Depois do merge do PR #6, atualizar a descrição do PR #5 (ainda cita Cloudflare Pages e os preços antigos) | Agente, quando autorizado |
| REP-02 | `.env` com credenciais de outro contexto dentro da pasta do site | Mover para fora do projeto |
| REP-05 | **Origem do "−50%"** (COM-RELEASE-005 §1): a tela vinha do `vite` em `http://localhost:5173`, rodando da pasta `Nekkora-Commercial` (branch `feat/commercial-modelo-c`), cujo `src/content.ts` tem a alteração não commitada com percentuais digitados (o resto do REP-03). A versão candidata está no worktree `Nekkora-Commercial-release` e mostra o commit no rodapé | Parar aquele servidor e **descartar** a alteração (`git -C Nekkora-Commercial checkout -- src/content.ts`), ou revisar em `npm run build && npm run cloudfront:local` no worktree da release. O agente não alterou nada (decisão da titular) |
| L-01 | Merge do PR #6 da nekkora-lib (o Commercial usa o tarball do CI, já fixado por hash) | Titular |

## 5. Pós-publicação (COM-RELEASE-004)

Depois da autorização e do primeiro deploy:
- `npm run homologacao` contra `https://nekkora.com`;
- `verificar-site.mjs` com `--http` e `--www`;
- LinkedIn Post Inspector (`https://www.linkedin.com/post-inspector/`);
- medição de desempenho no domínio;
- com duas releases publicadas, um rollback real ("simular" e depois efetivo).

Só então G10/G11 podem ser declarados.
