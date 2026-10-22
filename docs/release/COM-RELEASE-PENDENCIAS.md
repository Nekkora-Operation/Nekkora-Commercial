# NEKKORA-RELEASE-001 — Pendências que dependem da titular

Nada abaixo foi presumido. Enquanto um item estiver pendente, a página não faz a afirmação correspondente e o portão
`npm run verificar:publicacao` **bloqueia o deploy de produção** (ele lista os mesmos IDs). Todos os dados entram em um
único arquivo: [`publicacao.json`](../../publicacao.json).

## 1. Dados para publicar (preencher em `publicacao.json`)

| ID | Item | Campo | Observação |
|---|---|---|---|
| PUB-01 | Número oficial do WhatsApp comercial | `canais.whatsapp` | Só dígitos com DDI+DDD, ex. `55` + DDD + número |
| PUB-02 | E-mail comercial | `canais.email` | O domínio `nekkora.com` tem e-mail no Microsoft 365 (MX `nekkora-com.mail.protection.outlook.com`), mas **nenhum endereço foi confirmado** |
| PUB-03 | Página oficial do LinkedIn (obrigatória) e Instagram (opcional) | `canais.linkedin`, `canais.instagram` | URL do perfil (página inicial da rede é recusada) |
| PUB-13 | Início e fim da campanha de lançamento (50%) | `campanhaLancamento.inicio/fim` (AAAA-MM-DD) | Com as datas, a página passa a dizer "com proposta aprovada de DD/MM/AAAA a DD/MM/AAAA". O portão recusa campanha encerrada |
| PUB-09 | Controlador dos dados pessoais (razão social e CNPJ, ou nome e CPF) | `controlador.nome/documento` | Aparece no aviso de privacidade |
| PUB-11 | Provedor de hospedagem | `hospedagem.provedor` | Proposta: "Cloudflare" (ver §2) |

## 2. Decisões e aprovações (`publicacao.json → aprovacoes`)

| ID | Decisão | Campo |
|---|---|---|
| PUB-14 | Preços e condições: tabela da missão (R$ 1.000→500, R$ 2.800→1.400, complexa sob orçamento), "desconto de lançamento aplicável" na complexa (vem do mockup), condições 50/50, fila, reuniões, licenças à parte | `precosECondicoes` |
| PUB-17 | Textos comerciais — [`docs/com-001/05-texto-comercial.md`](../com-001/05-texto-comercial.md) (gerado do código) | `textosComerciais` |
| PUB-09 | Aviso de privacidade (seção "Como tratamos seus dados"; minuta — revisão jurídica recomendada) | `avisoDePrivacidade` |
| PUB-10 | Desligar o aviso "Versão para homologação" | `avisoHomologacao: false` |
| PUB-18 | Autorização expressa de publicação em produção | `publicacao` |
| PUB-16 | Botão "Entrar" sem destino (não há área do cliente). Recomendação: **ocultar no lançamento** (é o único CTA sem destino) — mantido por ser decisão anterior da titular (D-24) | — (código) |

## 3. Infraestrutura (ações na conta da titular — não feitas pelo agente)

O DNS de `nekkora.com` está na **Cloudflare** (NS `bethany`/`micah.ns.cloudflare.com`); o apex não tem A/AAAA e
`www` não existe — não há site publicado hoje. Proposta sem custo: **Cloudflare Pages (plano gratuito)** na mesma conta.
Passo a passo em [COM-RELEASE-003-operacao.md](COM-RELEASE-003-operacao.md).

| ID | Ação | Onde |
|---|---|---|
| INF-01 | Criar o projeto Pages `nekkora-commercial` (upload direto; sem conectar o Git) | Cloudflare → Workers & Pages |
| INF-02 | Criar token de API com "Cloudflare Pages: Edit" (só esta conta) | Cloudflare → My Profile → API Tokens |
| INF-03 | Secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e variável `CLOUDFLARE_PAGES_PROJECT` nos environments `preview` e `production` | GitHub → Settings → Environments |
| INF-04 | Environment `production` com **revisor obrigatório** (a titular) — é a "aprovação de release" do pipeline | GitHub → Settings → Environments |
| INF-05 | **Autorização para alterar DNS**: domínio personalizado `nekkora.com` + `www.nekkora.com` no projeto Pages; regra de redirecionamento `www` → apex (301) | Cloudflare (após autorização) |
| INF-06 | Desligar recursos que injetam script no HTML (Rocket Loader, Email Obfuscation, Web Analytics automático): quebrariam a CSP | Cloudflare → zona nekkora.com |
| INF-07 | Proteção da `main` (PR obrigatório + CI verde) | GitHub → Branches |

## 4. Repositório

| ID | Situação | Recomendação |
|---|---|---|
| REP-03 | **Commit local não publicado `34d0aa5` ("fix: changing price")** na pasta `Nekkora-Commercial` (branch `feat/commercial-modelo-c`, 1 à frente do remoto) **versiona o arquivo `.env` com credenciais** (Postgres, Azure `CLIENT_SECRET`) e muda os preços para R$ 1.500→1.000 / R$ 3.500→2.800 (rótulo "−50%" incoerente com esses valores). Ele **não foi incluído** na integração, **não foi enviado** a nenhum remoto e o diretório não foi alterado | Não dar `push` nessa branch. Desfazer o commit localmente (ex.: `git reset --soft HEAD~1` e tirar o `.env` do índice) e **rotacionar as credenciais** do `.env` por precaução. Se os preços novos forem a intenção, informar: a tabela usada é a da NEKKORA-RELEASE-001 (§4.4), mais recente |
| REP-02 | `.env` com credenciais de outro contexto dentro da pasta do site | Mover para fora do projeto |
| L-01 | Merge do PR #6 da nekkora-lib (o Commercial usa o tarball do CI, já fixado por hash) | Titular |

## 5. Pós-publicação (COM-RELEASE-004 §7.6)

Depois da autorização e do primeiro deploy: `npm run homologacao` contra `https://nekkora.com`, verificação HTTPS/DNS/
redirecionamentos, LinkedIn Post Inspector (`https://www.linkedin.com/post-inspector/`) e medição de desempenho no
domínio. Só então G10/G11 podem ser declarados.
