# NEKKORA-COM-GOLIVE-001 — Preparação final do lançamento do Commercial V1

Data: 06/11/2026. Base: `main` no merge `01c7f6d` (PR #15). Missão de **preparação**: nenhum deploy, merge, alteração na
AWS, na Cloudflare ou no Microsoft 365, nenhuma aprovação registrada e nenhum portão liberado. Todas as consultas
externas foram **somente leitura** (API do GitHub, DNS público por DNS-over-HTTPS e requisições `GET`/`HEAD` ao
domínio do CloudFront).

> **Parecer: NO-GO para publicar hoje.** A parte técnica está pronta para a publicação (infraestrutura auditada,
> pipeline protegido, CI verde, DNS mapeado). O lançamento depende de decisões e evidências da titular (§5, grupos B
> e C) e, depois delas, de uma PR de liberação e da execução do runbook (§6). Nada aqui libera a publicação.

## 1. Estado técnico atual

| Item | Resultado | Evidência |
|---|---|---|
| `main` | `01c7f6d` (merge da PR #15) | `git log origin/main` |
| CI do merge | **Sucesso** nos 4 jobs: lib reproduzível, validação e build, testes de integração (Chromium, Firefox, WebKit), proteções do environment `production`. Preview pulado (só roda em PR) | Run `42222312259` (push, 06/11/2026, concluído 13:17Z) |
| Testes locais na branch desta missão | 247/247 (236 existentes + 11 do diagnóstico de DNS), typecheck ok | `npm test`, `npm run typecheck` |
| Build | ok; `release.json` do commit `01c7f6d`, árvore limpa, `homologacao: false` | `npm run build` |
| Preços do artefato = código | 5 verificações, 0 falha | `npm run verificar:precos` |
| CSP do build = política versionada | ok. O hash `sha256-JDd2nuan…` do build é **o mesmo** que o CloudFront já envia hoje | `npm run aws:config:verificar` + `HEAD` no domínio do CloudFront |
| `nekkora-lib` | 0.2.0, commit `638f030`, tarball com sha256 e sha512 conferidos, lockfile apontando para ele; reconstrução reproduzível conferida no CI | `node scripts/verificar-lib.mjs` (local) e job "Build nekkora-lib" (CI) |
| Portão de publicação | **Bloqueado — 5 pendências:** PUB-19, PUB-17, PUB-09, PUB-18, PUB-10. PUB-22 não aparece mais | `node scripts/verificar-publicacao.mjs --dist dist` |
| Bucket de produção | **Vazio de site**: o CloudFront responde 403 do S3 na raiz, em `/release.json` e sem `/404.html`. Confirma que nunca houve deploy | `GET https://dnl1wnnmoqhaj.cloudfront.net/` |
| Domínio | `nekkora.com` e `www` **não resolvem** para o site (§3) | DoH Cloudflare e Google |
| Versão | `package.json` = `1.0.0-rc.1` (vai para o `release.json`); não há tags nem releases no repositório | `git tag`, `gh release list` |
| Campanha | `06/11/2026 a 06/01/2027`, **começa hoje**. Não alterada (§4.2) | `publicacao.json` |

## 2. Auditoria AWS — evidências

| Campo | Valor |
|---|---|
| Workflow / run | "Auditoria AWS" / `42223072197` (workflow_dispatch, `main`, commit `01c7f6d`, 06/11/2026 13:08Z) |
| Identidade | `arn:aws:sts::055408888315:assumed-role/nekkora-commercial-auditoria/nekkora-commercial-auditoria-42223072197` |
| OIDC | Token do environment `auditoria-aws` trocado no STS sem chave permanente: **primeiro teste OIDC concluído** (COM-RELEASE-003-aws §2.4) |
| Resultado | **26 OK, 0 pendente, 0 falha, 3 informativos** |
| Deploy | Nenhum. A role de auditoria só tem Get/List/Describe |

Resultado completo:

| Grupo | IDs OK | Conteúdo |
|---|---|---|
| Identidade | A01 | não é root |
| S3 | S01–S05, S07–S10 | Block Public Access (4), ACLs desabilitadas, SSE AES256, política não pública, website hosting desligado, leitura só pela distribuição `E3TZD2P6FOEWWR` (`AWS:SourceArn`), nenhuma outra permissão, `_releases/` negado ao CloudFront, gravação única (`If-None-Match`) |
| CloudFront | C01–C10, C13 | distribuição `Deployed`, origem REST única com OAC `sigv4/always`, `index.html`, HTTP→HTTPS, CachingOptimized + compressão, só GET/HEAD, política de cabeçalhos `dc2d71f5…` igual à versionada, função viewer-request igual à versionada, 403/404 → `/404.html` com 404, logs padrão desabilitados |
| Domínio e TLS | D01–D03, K01, K02 | aliases `nekkora.com` e `www.nekkora.com`, SNI, `TLSv1.2_2021`, certificado `566da593…` `ISSUED` até 11/05/2027 e associado à distribuição |
| Informativos | S06, C11, C12 | versionamento do S3 desligado (o rollback usa `_releases/`), WAF desligado (sem custo), `PriceClass_All` |

**O que a auditoria aprova e o que não aprova.** É uma aprovação **técnica** da configuração da AWS. Não autoriza a
publicação, não aprova textos, aviso ou condições e não resolve obrigações legais:

- **C13 × LOG-01.** C13 marca "OK" porque logs desligados não geram custo; é um critério técnico. A obrigação do
  Marco Civil, art. 15 (LOG-01) **continua pendente** de decisão. Se a titular decidir ativar os logs, C13 passa a
  "info" (não a "falha"), então a auditoria continua compatível com as duas decisões.
- **WAF e versionamento do S3:** sem necessidade comprovada. Não se recomenda ativar (custo de ~US$ 6+/mês no WAF;
  versionamento redundante com `_releases/`).
- **Certificado `d968dcac…` (`VALIDATION_TIMED_OUT`):** não está em uso e não bloqueia nada. A exclusão no ACM é
  manutenção opcional. **Não apagar os CNAMEs de validação** na Cloudflare: são os mesmos nomes que o certificado em
  uso (`566da593…`) precisa para renovar sozinho antes de 11/05/2027.
- **Role de deploy não testada.** A auditoria comprova o OIDC da role `nekkora-commercial-auditoria`, não da
  `nekkora-commercial-deploy`. Só a publicação autorizada comprova: a assunção da role de deploy pelo environment
  `production` (condição `sub` própria), o `PutObject` com as condições da política do bucket, a invalidação, a leitura
  da política de cabeçalhos e a verificação pública. O workflow "Teste OIDC (auditoria)" ficou redundante e não precisa
  ser executado.

## 3. DNS e domínio (somente leitura)

Consultas DoH em `cloudflare-dns.com` e `dns.google` (06/11/2026 ~13:15Z) e o novo
[`scripts/aws/diagnostico-dns.mjs`](../../scripts/aws/diagnostico-dns.mjs) (`--fase antes`: 11 ok, 2 pendentes,
0 falha).

| Nome | Tipo | Resposta pública | Avaliação |
|---|---|---|---|
| `nekkora.com` | NS | `bethany`, `micah.ns.cloudflare.com` | delegado à Cloudflare |
| `nekkora.com` | A / AAAA / CNAME | **nenhum** (NOERROR, sem dados) | **site fora do DNS** |
| `www.nekkora.com` | A / CNAME | **nenhum** (NOERROR sem dados porque existe `_25da….www.nekkora.com`, o CNAME do ACM) | **site fora do DNS** |
| `nekkora.com` | MX | `0 nekkora-com.mail.protection.outlook.com` | Microsoft 365 |
| `nekkora.com` | TXT | `MS=ms38126768`; `v=spf1 include:spf.protection.outlook.com ~all` (um único SPF) | Microsoft 365 |
| `autodiscover` | CNAME | `autodiscover.outlook.com` | Microsoft 365 |
| `selector1/2._domainkey` | CNAME | `selectorN-nekkora-com._domainkey.radiantsai.n-v1.dkim.mail.microsoft` | DKIM do Microsoft 365 |
| `enterpriseregistration` / `enterpriseenrollment` | CNAME | `windows.net` / `manage.microsoft.com` | Intune/Entra |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@nekkora.com` | presente |
| `_2bf0…nekkora.com`, `_25da….www.nekkora.com` | CNAME | `…acm-validations.aws` | validação do ACM — **manter** |
| `nekkora.com` | CAA | nenhum | não restringe a Amazon |
| `dnl1wnnmoqhaj.cloudfront.net` | A | 4 IPv4 | distribuição responde (403 do S3: bucket vazio) |

Teste HTTPS direto no CloudFront com SNI `nekkora.com` (`curl --resolve`): o certificado é aceito
(`ssl_verify_result=0`). Os aliases do CloudFront **não** foram tomados como prova de DNS: o DNS público não aponta.

**Faltam exatamente dois registros** (a criar só com autorização, item D-04):

| Tipo | Nome | Destino | Proxy | TTL |
|---|---|---|---|---|
| CNAME | `nekkora.com` (`@`) | `dnl1wnnmoqhaj.cloudfront.net` | **DNS only** (nuvem cinza) | Auto |
| CNAME | `www` | `dnl1wnnmoqhaj.cloudfront.net` | **DNS only** (nuvem cinza) | Auto |

**Impacto no Microsoft 365: nenhum previsto.** Os dois nomes do site não têm registro hoje, então nada é substituído.
No apex, a Cloudflare aplica CNAME flattening e mantém MX e TXT no mesmo nome. Os registros de MX, SPF, `MS=`,
`autodiscover`, DKIM, DMARC, Intune e ACM ficam em nomes ou tipos distintos e **não devem ser tocados**. O HSTS do
site (`includeSubDomains`) só é aplicado por navegadores que visitarem `nekkora.com`; `autodiscover` e DKIM não servem
páginas HTTP. O diagnóstico compara esses registros antes e depois (`M01`–`M07`, `K01`, `K02`).

## 4. Pipeline de publicação

| Controle | Estado verificado | Evidência |
|---|---|---|
| Proteção da `main` | PR obrigatório; checks obrigatórios e atualizados (`strict`): lib, validação e build, integração; `enforce_admins` ativo; conversas resolvidas; sem force push nem exclusão. Aprovações exigidas: 0 (titular única; o merge é o ato humano) | `GET /branches/main/protection` |
| CI do merge atual | sucesso (§1) | run `42222312259` |
| Environment `production` | revisor obrigatório `Nekkolly`; só a branch `main`; `can_admins_bypass: false`; `prevent_self_review: false` (necessário com titular única) | `GET /environments` |
| Variáveis de `production` | `AWS_ROLE_ARN` (role **deploy**), `AWS_REGION=sa-east-1`, bucket, distribuição `E3TZD2P6FOEWWR`, domínio CloudFront, política `dc2d71f5…`. **`DOMINIO_PUBLICO` ausente**, como esperado antes do DNS | `GET /environments/production/variables` |
| Separação das roles | `auditoria-aws` só tem `AWS_AUDIT_ROLE_ARN` (role auditoria); `production` só tem a role de deploy. Cada confiança exige o `sub` do próprio environment e `ref = refs/heads/main` (COM-RELEASE-003-aws §2.2). Nenhuma variável de repositório | API + `deploy/aws/iam/` |
| Deploy manual | só `workflow_dispatch`; da `main`; `PUBLICAR`; ref integrado à `main`; environment conferido por script antes; CI completo do commit; **aprovação humana**; artefato = commit; lib íntegra; **portão bloqueante**; variáveis; OIDC de 30 min; publicação; verificação pública | `deploy-producao.yml` |
| `publicacao.json` | validado pelo portão no deploy (informativo no CI) | §1 |
| Pós-deploy | `verificar-site.mjs`: commit e SHA-256 de cada arquivo, tipos, cache, 7 cabeçalhos, 404 real, `_releases/` bloqueado, bucket fechado; no domínio só se `DOMINIO_PUBLICO` existir | `deploy-producao.yml`, passo "Verificação pública" |
| Rollback | `REVERTER`, da `main`, mesma aprovação, opção "simular". **Na primeira publicação não há release anterior:** `rollback.mjs` recusa ("não há release anterior aprovada"). O rollback do primeiro lançamento é retirar o DNS (§6, passo 9) | `rollback-producao.yml`, `scripts/aws/rollback.mjs:40` |

**Observações (nenhuma bloqueia):**

1. **O deploy já é publicação.** Depois do primeiro deploy, o site fica acessível em
   `https://dnl1wnnmoqhaj.cloudfront.net/` mesmo sem DNS. Por isso as aprovações precisam vir antes do deploy, e não
   antes do DNS.
2. **Verificação no domínio.** No primeiro deploy, `DOMINIO_PUBLICO` não existe e a verificação do domínio é pulada.
   Depois do DNS, ela é feita à mão (runbook, passo 6.4) e a variável é preenchida para os próximos deploys.
3. **Ações por tag de versão** (`@v4`), não por SHA. Fixar por SHA reduz o risco de cadeia de suprimentos; é melhoria
   futura, não requisito. O aviso de Node 20 nos runners é informativo.
4. Testes do CI fixam as datas da campanha atual (05/11, 15/11/2026 e 07/01/2027). Se as datas mudarem (§4.2), o
   CI da PR de liberação mostrará se as expectativas precisam de ajuste.

### 4.1 Escopo do release Commercial V1

Conferido no build de `01c7f6d` e no texto exportado (`docs/com-001/05-texto-comercial.md`, sem diferença ao
regenerar):

| Preservado | Estado |
|---|---|
| Site institucional, Nekkora Delivery | presentes |
| Nekkora Hosting | "Em avaliação de viabilidade", proposta própria (posicionamento aprovado) |
| Preços e simulador | preços aprovados (PUB-14); simulador homologado nos três navegadores |
| E-mail `contato@nekkora.com`, LinkedIn, Microsoft Bookings | preenchidos; Bookings aprovado (PUB-20) |
| Aviso de privacidade e condições comerciais | no código; **aprovações pendentes** (PUB-09, PUB-19) |
| Fora do escopo | envio automático (`endpoint: null`), WhatsApp e Instagram (`null`), área de clientes ("Entrar" oculto), gravação ("Conversa sem gravação") |

Nenhuma funcionalidade nova foi implementada.

### 4.2 Datas da campanha (decisão da titular, não alterada)

`campanhaLancamento` = **06/11/2026 a 06/01/2027**, regra aprovada na COM-008-B: "dois meses a partir da publicação
oficial". A publicação não acontece hoje. Opções da titular:

- **manter:** a página dirá "solicitações recebidas de 06/11/2026 a 06/01/2027", com dias anteriores à publicação (a
  oferta vincula, CDC art. 30); ou
- **ajustar** para a data real: muda texto visível, então tem de ser decidido **antes** da nova aprovação dos textos
  (PUB-17).

## 5. Pendências por responsabilidade

Nenhuma aprovação foi presumida. "Bloqueia" = impede a publicação; "Condiciona" = precisa estar decidido antes de
outra aprovação.

### A. Técnico — Claude pode preparar agora

| ID | Ação exata | Evidência | Impacto |
|---|---|---|---|
| A-01 | Registrar a auditoria `42223072197` e o teste OIDC no planejamento | Esta PR (PENDÊNCIAS INF-01/07/09/10; COM-RELEASE-003-aws §2.4 e §9) | Feito nesta PR |
| A-02 | Diagnóstico de DNS somente leitura, antes e depois | `scripts/aws/diagnostico-dns.mjs` + 11 testes | Feito nesta PR |
| A-03 | Runbook definitivo | §6 | Feito nesta PR |
| A-04 | Preparar a **PR de liberação**: só os valores que a titular decidir por escrito em `publicacao.json` (com `$origem`), `version` 1.0.0 se ela quiser | decisões C-xx e D-01/D-02 registradas | Bloqueia; só depois do grupo C |
| A-05 | Ajustar textos se a titular decidir algo que os altere (datas, LOG-01 (a), JUR-06) — PR própria, **antes** de PUB-17 | diff + CI verde | Condiciona PUB-17/PUB-09 |
| A-06 | Pós-publicação: `npm run homologacao` contra `https://nekkora.com`, diagnóstico `--fase depois`, desempenho | relatório de homologação | Depois de D-03/D-04 |

### B. Operacional — depende de execução ou evidência da titular

| ID | Ação exata | Evidência necessária | Impacto |
|---|---|---|---|
| CTL-05 / REP-04 | De uma conta **externa** ao tenant, enviar e-mail para `contato@nekkora.com`; confirmar chegada na caixa de entrada (não em quarentena) e responder. Testar "Abrir no e-mail" num computador e num celular com aplicativo configurado | data/hora, domínio do remetente, "recebido na Caixa de Entrada", resposta recebida; capturas sem dados pessoais | **Bloqueia** |
| OPS-02 / CTL-03 | Conferir o texto real do Bookings contra `privacidade-minuta.md` §4 (ciência, sem "telefone", Teams, sem gravação, "Empresa" opcional) | captura do formulário público do Bookings | **Bloqueia** (LEGAL-BASE §2d) |
| PUB-20 (smoke) | No dia, abrir a página pública do Bookings numa janela anônima e conferir o serviço "Conversa inicial — Nekkora Delivery" | captura | Já aprovado; conferência do dia |
| OPS-09 | Ver o prazo dos itens recuperáveis e da lixeira (Exchange, OneDrive) | captura das configurações | Condiciona PUB-09 (prazos do aviso) |
| OPS-10 | Ver se reservas passadas do Bookings podem ser excluídas e se saem dos calendários | resultado do teste | Condiciona PUB-09 |
| OPS-01 | Primeira execução registrada do procedimento semanal de retenção | linha no registro (sem dados pessoais) | Até 7 dias após o lançamento |
| CTL-01 (Teams) | **Não reaberto.** Divergência documental: a titular informou validação anterior, mas o repositório registra CTL-01 "Pendente" com E-1 a E-7 vazios (`procedimento-teams-sem-gravacao.md` §5), e a última evidência versionada (COM-PRIVACY-001, E-03/E-04) descreve a política `Nekkora-Commercial` **permitindo** gravação com concordância | registrar E-1 a E-7, ou uma declaração datada da titular, para alinhar o documento | Não bloqueia o site (LEGAL-BASE §2d); o site afirma "Conversa sem gravação" |
| — | Alerta de orçamento da AWS (Budgets, gratuito) | captura | Recomendado, não bloqueia |

### C. Jurídico/comercial — depende de decisão expressa da titular

**Ordem importa:** primeiro tudo o que **muda texto visível** (C-01 a C-04); depois as aprovações (C-05 a C-07). Na
R1, uma mudança de texto depois da aprovação anulou PUB-17.

| ID | Ação exata | Evidência necessária | Impacto |
|---|---|---|---|
| C-01 · PUB-13 | Manter ou ajustar as datas da campanha (§4.2) | decisão escrita com as datas | Condiciona PUB-17 se mudar |
| C-02 · LOG-01 | Decidir: (a) ativar os logs padrão do CloudFront num bucket em `sa-east-1`, acesso restrito, ciclo de vida de 6 meses, com item no aviso; ou (b) registrar, com fundamento, por que o art. 15 não se aplicaria. A auditoria não resolve isto | decisão escrita; em (a), a mudança feita pela titular e nova auditoria | **Bloqueia**; (a) muda o aviso → antes de PUB-09/PUB-17 |
| C-03 · JUR-07 | Decidir como o aviso trata a transferência internacional (AWS e Microsoft 365) sem mecanismo verificado | decisão escrita; texto final do aviso | **Bloqueia** a aprovação do aviso |
| C-04 · JUR-06 / JUR-08 | Base legal do atendimento (texto proposto não aplicado) e confirmação de ME/EPP | decisão; se mudar o texto, PR (A-05) | Condiciona PUB-09 |
| C-05 · PUB-17 | Nova aprovação dos textos do **commit candidato** (`05-texto-comercial.md` gerado dele) | declaração expressa citando o commit | **Bloqueia** (portão) |
| C-06 · PUB-09 | Aprovação do aviso de privacidade (revisão por advogado(a) adiada pela titular) | declaração expressa | **Bloqueia** (portão) |
| C-07 · PUB-19 | Aprovação das condições comerciais **exibidas no site** (50% + 50%, aceite, cancelamento/garantia "conforme a proposta e o contrato") | declaração expressa | **Bloqueia** (portão). C-01 a C-12 da minuta e JUR-01 a JUR-05 bloqueiam a 1ª contratação, não o site |

### D. Produção — somente após autorização

| ID | Ação exata | Evidência necessária | Impacto |
|---|---|---|---|
| D-01 · PUB-10 | `avisoHomologacao: false` na PR de liberação | merge com CI verde | Bloqueia (portão) |
| D-02 · PUB-18 | `aprovacoes.publicacao: true` na PR de liberação, com a autorização em `$origem` | autorização expressa datada | Bloqueia (portão) |
| D-03 | Workflow "Deploy de produção" com o commit candidato, `PUBLICAR` e aprovação no environment | run verde; `release.json` | Publicação no CloudFront |
| D-04 · INF-09 | Os dois CNAMEs do §3 na Cloudflare, DNS only | `diagnostico-dns.mjs --fase depois` sem falha | Publicação no domínio |
| D-05 | Variável `DOMINIO_PUBLICO=https://nekkora.com` no environment `production` | captura | Próximos deploys verificam o domínio |
| D-06 | Homologação pública (COM-RELEASE-004 §5), LinkedIn Post Inspector | relatórios | Fecha G10 |
| D-07 | Rollback real ("simular" e depois efetivo) | runs | Só com duas releases publicadas |

## 6. Runbook — primeira publicação do Commercial V1

Executável pela titular. Cada passo diz o que precisa estar verdadeiro **antes** de seguir; nada presume aprovação.

### 6.1 Pré-requisitos obrigatórios

- [ ] Grupo B: CTL-05/REP-04 e OPS-02/CTL-03 com evidência.
- [ ] Grupo C: C-01 a C-04 decididos; textos alterados por eles já integrados à `main` com CI verde.
- [ ] C-05, C-06 e C-07 aprovados **sobre o mesmo commit** que será publicado.
- [ ] PR de liberação (A-04: `textosComerciais`, `avisoDePrivacidade`, `condicoesComerciais`, `publicacao` = `true`,
      `avisoHomologacao` = `false`, cada um com `$origem`) revisada e integrada; CI do merge verde.
- [ ] Janela de ~1 h com acesso ao GitHub, à Cloudflare, ao console da AWS e à caixa `contato@`.

### 6.2 Verificações antes do deploy (no commit candidato, só leitura)

```bash
git fetch origin && git switch --detach <commit-candidato>
npm ci && npm run check                                  # typecheck, testes, build, preços, CSP
node scripts/verificar-lib.mjs                           # nekkora-lib íntegra
node scripts/verificar-publicacao.mjs --dist dist        # deve dizer "PUBLICAÇÃO LIBERADA"
node scripts/aws/diagnostico-dns.mjs --fase antes        # 0 falha; S01/S02 pendentes
gh run list --commit <commit-candidato>                  # CI "success"
```

E: Actions → "Auditoria AWS" → Run workflow (`main`) → 0 falha. Se a PR de liberação alterar `deploy/aws/politica-cabecalhos.json`
(CSP de script inline novo), a política da AWS tem de ser atualizada antes e C08 acusa a diferença; de todo modo, o
`publicar.mjs` confere a CSP da distribuição **antes** de gravar qualquer arquivo.

### 6.3 Commit ou tag candidata

- Candidato = **merge da PR de liberação** na `main` (o `01c7f6d` não pode ser publicado: o portão bloqueia).
- Recomendado: tag anotada `v1.0.0` nesse merge (`git tag -a v1.0.0 <commit> -m "Commercial V1" && git push origin v1.0.0`).

### 6.4 Ordem exata das operações

1. **Deploy.** Actions → "Deploy de produção" → *Run workflow* com **branch `main`**; `ref` = `v1.0.0` (ou o SHA);
   `confirmacao` = `PUBLICAR`.
2. **Aguardar** os jobs "Autorização" e "Pipeline completo do commit" (~30 min com a integração).
3. **Aprovar** no environment `production` (*Review deployments* → *Approve*). Aprovar só se o resumo mostrar o
   commit esperado.
4. **Acompanhar** "Portão de publicação", "Credenciais temporárias (OIDC → STS)" (primeira prova da role de deploy),
   "Publicar no S3…" e "Verificação pública (CloudFront)". Tudo verde → o site está em
   `https://dnl1wnnmoqhaj.cloudfront.net/`.
5. **Conferir no navegador** o domínio do CloudFront: sem a faixa "Versão para homologação", preços da campanha,
   rodapé com o commit.
6. **DNS (Cloudflare → nekkora.com → DNS → Records):** criar os dois CNAMEs do §3, **DNS only**, TTL Auto.
   **Não editar nem excluir nenhum outro registro.**
7. **Diagnóstico pós-DNS** (repetir até passar; propagação típica de minutos):
   ```bash
   node scripts/aws/diagnostico-dns.mjs --fase depois --json diagnostico-dns-depois.json
   node scripts/aws/verificar-site.mjs --base https://nekkora.com/ --dist dist --tentativas 10 \
     --http http://nekkora.com/ --www https://www.nekkora.com/
   ```
8. **Variável** `DOMINIO_PUBLICO=https://nekkora.com` no environment `production`.

### 6.5 Testes de disponibilidade e segurança

- `verificar-site.mjs` (passo 7): commit, SHA-256 de cada arquivo, 7 cabeçalhos, 404, `_releases/` bloqueado,
  `http→https`, `www→apex`.
- `npm run homologacao` contra `https://nekkora.com/` (COM-RELEASE-004).
- `https://www.ssllabs.com/ssltest/` e `https://securityheaders.com/` (gratuitos): esperado TLS 1.2+ e cabeçalhos
  presentes.
- Diagnóstico de DNS `--fase depois`: `M01`–`M07` continuam OK (Microsoft 365 intacto).

### 6.6 Validação de contato e agendamento

- "Abrir no e-mail" no computador e no celular → mensagem chega em `contato@` vinda de conta externa.
- Botão de agendamento abre `https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/` numa janela anônima; serviço
  correto. Uma reserva de teste é opcional: se feita, cancelar e excluí-la conforme OPS-10.
- Link do LinkedIn abre a página da empresa; Post Inspector mostra título e imagem.

### 6.7 Critérios objetivos para abortar

| Momento | Abortar se | Como |
|---|---|---|
| Antes do deploy | portão não diz "LIBERADA"; CI do candidato não verde; auditoria com falha; qualquer item de 6.1 sem evidência | não disparar |
| Durante o deploy | commit no resumo ≠ candidato; qualquer passo vermelho | **rejeitar** a aprovação ou cancelar o run. Falha antes de "Publicar" não altera nada; falha em "Publicar" deixa o site anterior no ar: a raiz só muda no fim, nada é apagado e `release.json` é o último arquivo (`publicar.mjs`, cabeçalho) |
| Depois do deploy, antes do DNS | `verificar-site` falha; faixa de homologação visível; preço ou texto divergente | **não criar o DNS**; corrigir por nova PR e novo deploy |
| Depois do DNS | `diagnostico-dns --fase depois` com falha em M01–M07 (Microsoft 365 afetado) | desfazer a última mudança de DNS **imediatamente** |
| Depois do DNS | IP da Cloudflare (nuvem laranja), certificado inválido, site fora por mais de 30 min, e-mail sem chegar | rollback (6.8) |

### 6.8 Rollback

- **Primeira publicação (não há release anterior):** excluir os **dois** CNAMEs do site na Cloudflare. Com TTL Auto,
  o domínio sai em minutos; o Microsoft 365 não é afetado. O conteúdo continua no endereço `cloudfront.net` sem
  divulgação; correção por nova PR e novo deploy ("roll forward"). Só em emergência (conteúdo que não pode ficar
  acessível): a titular desativa a distribuição no console do CloudFront (*Disable*), mudança na AWS reversível.
- **A partir da segunda release:** Actions → "Rollback de produção" (`main`), `simular` marcado → conferir →
  repetir sem `simular`, com `motivo` e `REVERTER`, e aprovar no environment.

### 6.9 Evidências a guardar

Sem dados pessoais. No repositório, em `docs/release/evidencias/golive-001/`, por PR:

- URL e conclusão dos runs: CI do candidato, auditoria pré-deploy, deploy (com o resumo e o `release.json`);
- commit e tag publicados; hash do artefato (`_releases/<commit>/manifesto`);
- saída de `verificar-site.mjs` no CloudFront e no domínio;
- `diagnostico-dns-depois.json` e a saída `--fase antes` do mesmo dia;
- captura dos dois registros criados na Cloudflare (sem outros registros visíveis, se possível);
- resultado da homologação pública e do teste de e-mail/agendamento;
- data e hora da publicação oficial (referência para a campanha e para OPS-01).

## 7. Recomendações de menor escopo

1. **Começar hoje pelo teste externo do e-mail (CTL-05).** É o bloqueio mais barato e independe dos outros.
2. **Fechar primeiro o que muda texto** (datas, LOG-01, JUR-06, JUR-07) e **só então** aprovar textos, aviso e
   condições (C-05 a C-07). Isso evita uma terceira rodada de aprovação.
3. **Uma única PR de liberação** com todos os valores de `publicacao.json`; o merge dela é o candidato e a tag
   `v1.0.0`.
4. **Deploy e DNS na mesma janela**, nessa ordem: o domínio só aponta depois da verificação no CloudFront.
5. **Não ativar** WAF, versionamento, Origin Shield nem alarmes pagos: nada disso é necessário para o V1.
6. **Rollback da primeira release = retirar o DNS.** O rollback por workflow só existe a partir da segunda.

## 8. Parecer GO/NO-GO

| Dimensão | Parecer |
|---|---|
| Infraestrutura AWS | **GO técnico** (26 OK, 0 falha) |
| Pipeline e controles | **GO técnico** (proteções verificadas; role de deploy só provada na publicação) |
| DNS | **Pronto para executar** (2 registros; Microsoft 365 preservado) |
| Portão de publicação | **NO-GO** — PUB-19, PUB-17, PUB-09, PUB-18, PUB-10 |
| Operacional (B) | **NO-GO** — CTL-05/REP-04 e OPS-02/CTL-03 sem evidência |
| Jurídico/comercial (C) | **NO-GO** — LOG-01 e JUR-07 sem decisão; aprovações pendentes |
| **Geral** | **NO-GO.** Passa a GO quando 6.1 estiver todo marcado; a decisão é da titular |
