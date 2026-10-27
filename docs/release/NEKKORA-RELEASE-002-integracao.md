# NEKKORA-RELEASE-002 — Integração e preparação para produção

27/10/2026. Versão candidata: `c94f33c` (topo do PR #7, contém #5, #6 e a `main` com o PR #8). **Nenhum merge, deploy,
rollback, alteração na AWS, no DNS da Cloudflare, no Microsoft 365 ou nas roles IAM foi feito.** `publicacao.json` não
foi alterado. A alteração local não commitada em `Nekkora-Commercial/src/content.ts` (branch `feat/commercial-modelo-c`)
continua intacta: todo o trabalho foi feito nos worktrees `Nekkora-Commercial-r001`, `-r003` e `-release`.

## 1. Situação dos PRs e dependências

| PR | Branch → base | Cabeça | CI | Depende de |
|---|---|---|---|---|
| Nekkora-lib #6 | `release/lib-release-001` → `main` | `edb1b46` (0 commits atrás da `main`) | [verde](https://github.com/Nekkora-Operation/Nekkora-lib/pull/6) | — |
| Commercial #5 | `release/com-release-001` → `main` | `53db313` | [40526222290](https://github.com/Nekkora-Operation/Nekkora-Commercial/actions/runs/40526222290) verde | lib 0.2.0 (tarball fixado por hash) |
| Commercial #6 | `feat/com-release-003-aws` → `release/com-release-001` | `a20ea1d` | [40526230577](https://github.com/Nekkora-Operation/Nekkora-Commercial/actions/runs/40526230577) verde | #5 |
| Commercial #7 | `feat/com-release-005-leads-bookings` → `feat/com-release-003-aws` | `c94f33c` | [40526235680](https://github.com/Nekkora-Operation/Nekkora-Commercial/actions/runs/40526235680) verde | #6 |
| Commercial #8 | `ci/teste-oidc-auditoria` → `main` | integrado (`8d43173`) | OIDC homologado no run `40515377397` | — |

A pilha é linear: `main ⊂ #5 ⊂ #6 ⊂ #7`. Depois da sincronização, o #7 tem 0 commits atrás do #6, o #6 tem 0 atrás do
#5 e o #5 tem 0 atrás da `main`.

**Dependência crítica:** o #5 sozinho ainda tem o pipeline do Cloudflare Pages (preview, deploy e rollback com
`secrets.CLOUDFLARE_*` e `wrangler`). Quem o substitui pelo S3 + CloudFront é o #6. A `main` nunca deve receber o #5
sem o #6 (ordem no §7).

**Dependência da lib:** `vendor/nekkora-lib.json` registra o commit `638f030`, que hoje só existe em
`release/lib-release-001`. O PR #6 da lib deve entrar com **merge commit** (sem squash ou rebase), para o commit
continuar alcançável pela `main` e a reconstrução reproduzível (`verificar-lib.mjs --reconstruir`) seguir válida.

## 2. Alterações feitas na sincronização (todas por merge, sem force push)

| Commit | Branch | O quê |
|---|---|---|
| `5393175` | #7 | Merge dos 3 commits recentes do #6 (S07/K01/K02, C08 estrutural, confiança OIDC). Conflito em `package.json` resolvido mantendo `aws-iam.test.mjs` (#6) **e** `api-solicitacoes.test.mjs` (#7) no `npm test`, e `verificar:precos` (#7) no `check` |
| `53db313` | #5 | Merge da `main` (só entra `.github/workflows/teste-oidc-auditoria.yml`, do PR #8) |
| `7ee2332` | #6 | Merge do #5 atualizado |
| `be821d9` | #6 | `aws-iam.test.mjs` reconhece o smoke test OIDC. Sem isso, o CI do #6 quebraria com a `main` (comprovado: "workflow inesperado com OIDC"). Teste novo: o smoke test é só manual, sem `secrets`, sem a role de deploy, sem checkout e sem outra chamada AWS além de `sts get-caller-identity` |
| `a20ea1d` | #6 | Proteções do environment `production` conferidas por `scripts/verificar-environment.mjs` (§4, R1), com testes e com um job no CI que comprova a chamada com o `GITHUB_TOKEN` real |
| `c94f33c` | #7 | Merge do #6 atualizado (conflito em `package.json` resolvido com todos os 8 arquivos de teste) |

Nenhum arquivo de `deploy/aws/iam/` mudou desde `d6f1ff2`. As duas confianças continuam com `StringEquals` em
`aud = sts.amazonaws.com`, `sub = repo:Nekkora-Operation@333915842/Nekkora-Commercial@1389833224:environment:<env>`
(`production` no deploy, `auditoria-aws` na auditoria) e `ref = refs/heads/main`. Os 8 arquivos `*.test.mjs` de
`scripts/testes/` estão no `npm test`, inclusive `aws-iam.test.mjs`.

## 3. Resultados dos testes

### 3.1 Pipeline local completo (mesmos passos do `ci.yml`, sobre `c94f33c`) — evidências em [`evidencias/release-002/`](evidencias/release-002/)

| Etapa | Resultado |
|---|---|
| nekkora-lib 0.2.0: hash, lockfile e reconstrução a partir do commit registrado | OK (sha256 `1a2e6145…26a6`) |
| `npm ci`, typecheck, build de produção | OK |
| Testes unitários e de integração (`npm test`) | **152/152** (preços, portão, publicação e rollback simulados, auditoria AWS simulada, IAM/OIDC, environment, CloudFront local, backend serverless simulado) |
| Preços no artefato | 5/5: simples 1500 → 1000, média 3500 → 2800, nenhum percentual digitado, nenhum `discount` fixo |
| Política de cabeçalhos e CSP = build | OK |
| Portão de publicação | **Bloqueado**, com 8 pendências (esperado, §5) |
| Artefato servido como no CloudFront (integridade, cabeçalhos, 404, prefixo interno, bucket sem acesso público) | OK |
| Página — Chromium / Firefox / WebKit | 90/90 · 90/90 · 90/90 (4 larguras × 2 temas: sem rolagem horizontal, axe, contraste por pixels, preços riscados, tabela oficial, descontos coerentes, sem percentual inconsistente, foco e teclado, sem requisições externas) |
| Jornada por e-mail (3 navegadores) | 96/96 (mailto exato com assunto) |
| Jornada por WhatsApp com dados sintéticos (3 navegadores) | 111/111 |
| Bookings com dados de teste + envio automático com backend local (3 navegadores) | 141/141 (URL oficial, nova aba isolada, desafio Turnstile, limite 429, falhas preservam os dados, console limpo) |

Preços exibidos em todas as larguras e temas: **Simples R$ 1.500 → R$ 1.000** (−33,33%, economia de R$ 500),
**Média R$ 3.500 → R$ 2.800** (−20%, economia de R$ 700), **Complexa sob orçamento**, sem desconto.

### 3.2 GitHub Actions (os três PRs, depois do push)

Todos os jobs verdes nos runs do §1. No #6 e no #7, o job novo "Proteções do environment production (API do GitHub)"
rodou com `permissions: contents: read` e registrou `environment production protegido: revisores Nekkolly; branches
branch:main`. Isso comprova que a chamada à API usada pelo deploy e pelo rollback funciona com as permissões reais do
`GITHUB_TOKEN`.

### 3.3 Nekkora-lib #6 (local, `edb1b46`)

`npm run check`: 112/112 testes (11 arquivos), build da lib e da documentação. `verificar:pacote`: 27/27.

### 3.4 Análise estática

actionlint 1.7.7 (com shellcheck): 0 erros. Ficam 2 avisos antigos e intencionais em `ci.yml` (variável de laço `i`,
e `node -e` entre aspas simples). Eram 3 antes desta release: o terceiro saiu com a troca do script inline do deploy.

## 4. Riscos técnicos

| ID | Risco | Situação |
|---|---|---|
| R1 | A verificação do environment no deploy e no rollback só exigia `deployment_branch_policy` não nulo: uma política `*` ou com outra branch passaria | **Corrigido** (`a20ea1d`): agora exige revisor e política explícita com exatamente `main`, e bloqueia em 403/404/erro de rede |
| R2 | O `GITHUB_TOKEN` com `contents: read` poderia não ler `/environments` | **Descartado com prova** (§3.2). A documentação: "Anyone with read access to the repository can use this endpoint" |
| R3 | Merge do #5 isolado levaria o Cloudflare Pages à `main` | Evitado pela ordem do §7 |
| R4 | `main` sem proteção nos dois repositórios (sem PR obrigatório, sem checks obrigatórios, sem rulesets; conferido pela API) | Aberto (INF-10). Hoje um push direto na `main` não passa por CI. O deploy ainda exige commit na `main`, CI completo dentro do próprio workflow e aprovação humana |
| R5 | Squash do PR #6 da lib deixaria `638f030` fora da `main` | Evitado: merge commit (§7) |
| R6 | `prevent_self_review` desligado no environment `production`: quem dispara pode aprovar | Aceitável com uma titular só; o CI registra aviso |
| R7 | Actions em `@v4` rodam em Node 20, depreciado; o GitHub já força Node 24 (aviso no CI) | Não bloqueante; atualizar `checkout`, `setup-node`, `upload/download-artifact` e `configure-aws-credentials` depois do lançamento, de preferência fixando por SHA |
| R8 | No portão, se o bloco `agendamento` for **removido** de `publicacao.json`, o Bookings deixa de ser obrigatório (padrão `obrigatorio: false`) | Baixo, porque qualquer mudança no arquivo passa por PR. Endurecer depois exigindo o campo explícito |
| R9 | A descrição do PR #5 ainda cita Cloudflare Pages e os preços antigos (PR-05) | Só documentação |

## 5. Pendências e classificação

**Bloqueantes para merge**

| ID | Pendência |
|---|---|
| M-01 | Autorização expressa da titular para integrar os PRs |
| M-02 | Respeitar a ordem do §7: o #5 não entra sozinho; a lib entra por merge commit |

**Bloqueantes apenas para publicação** (o portão já bloqueia as marcadas com ✱)

| ID | Pendência | Responsável |
|---|---|---|
| PUB-20 ✱ | URL oficial do Microsoft Bookings e confirmação do teste (`agendamento.obrigatorio: true` mantido); depende de EXT-01 | Titular / M365 |
| PUB-13 ✱ | Datas de início e fim da campanha de lançamento | Titular |
| PUB-09 ✱ | Razão social do controlador e aprovação do aviso de privacidade | Titular |
| PUB-19 ✱ | Aprovação das condições comerciais (50% + 50%, fila, reuniões, licenças, garantia, aceite) | Titular |
| PUB-17 ✱ | Aprovação dos textos comerciais | Titular |
| PUB-10 ✱ | Desligar o aviso "Versão para homologação" | Titular |
| PUB-18 ✱ | Autorização expressa de publicação | Titular |
| INF-09 | Autorização do DNS (`nekkora.com` e `www` → CloudFront, DNS only, sem tocar no Microsoft 365) | Titular / Cloudflare |
| INF-10 | Proteção da `main` (PR obrigatório + CI verde) nos dois repositórios | Titular / GitHub |
| REP-04 | Confirmar que `contato@nekkora.com` recebe mensagens e testar o "Abrir no e-mail" num aparelho real | Titular |
| AUD-01 | Primeira "Auditoria AWS" pelo workflow (OIDC, só leitura) depois do merge (COM-RELEASE-003-aws §2.4) | Agente, quando autorizado |

**Não bloqueantes**

| ID | Pendência |
|---|---|
| PUB-21 / INF-11–16 | Envio automático: continua opcional (`endpoint: null`) até o backend real ser homologado na AWS |
| PUB-16 | Botão "Entrar" sem destino (recomendação: ocultar no lançamento) |
| REP-02 | `.env` de outro contexto dentro da pasta do site: mover para fora do projeto (não foi lido nem alterado) |
| REP-05 | Alteração local em `src/content.ts` com percentuais digitados: só local, fora de todas as branches. Fica a decisão da titular |
| PR-05 | Atualizar as descrições dos PRs #5, #6 e #7 |
| R6, R7, R8 | §4 |

## 6. Prontidão

Os quatro PRs estão **tecnicamente prontos para integração**: sincronizados, sem conflitos (mergeable/clean), com CI
verde e a mesma versão candidata validada localmente e no GitHub. A **publicação não está pronta**, por decisão de
projeto: o portão bloqueia as 7 pendências comerciais e de aprovação, e faltam DNS, proteção da `main` e a
confirmação do e-mail.

## 7. Ordem recomendada de merge (sempre "Create a merge commit")

1. **Nekkora-lib #6** → `main`.
2. **Commercial #7** → `feat/com-release-003-aws` (a base dele).
3. **Commercial #6** → `release/com-release-001` (agora com o #7).
4. Esperar o CI do #5 ficar verde na nova cabeça. Ela tem a mesma árvore de `c94f33c`, mais os merges.
5. **Commercial #5** → `main`. A `main` recebe tudo de uma vez e nunca fica com o Cloudflare Pages.
6. Depois, com autorização: "Teste OIDC (auditoria)" e "Auditoria AWS" na `main`, ambos só leitura.

Recomendado antes do passo 1: ativar a proteção da `main` (INF-10) com o check "Validação e build do Commercial" e
"Testes de integração" obrigatórios.

## 8. Nenhum deploy automático

| Workflow | Gatilhos | Credencial AWS |
|---|---|---|
| `ci.yml` | `pull_request`, `push` na `main`, `workflow_dispatch`, `workflow_call` | **nenhuma** (`id-token` ausente; o job `preview` não tem credencial e roda só em PR) |
| `deploy-producao.yml` | só `workflow_dispatch` + digitar `PUBLICAR` + commit já na `main` + environment protegido + aprovação humana + portão bloqueante **antes** das credenciais | role de deploy, OIDC, só `production` |
| `rollback-producao.yml` | só `workflow_dispatch` + digitar `REVERTER` + `main` + aprovação humana | role de deploy, OIDC, só `production` |
| `auditoria-aws.yml` | só `workflow_dispatch`, só `main` | role de auditoria (Get/List/Describe) |
| `teste-oidc-auditoria.yml` | só `workflow_dispatch`, só `main` | role de auditoria, só `GetCallerIdentity` |

Não há `workflow_run`, `repository_dispatch`, `schedule` nem `secrets.*` nos workflows da candidata, e nenhuma
Access Key. O merge dispara apenas o CI. A role de deploy só confia no environment `production`, cuja aprovação é
manual, e o portão de publicação, que hoje bloqueia, roda antes de qualquer credencial.
