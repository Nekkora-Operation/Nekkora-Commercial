# COM-RELEASE-003 — Infraestrutura de produção na AWS (S3 + CloudFront)

Substitui o plano anterior com Cloudflare Pages (decisão da titular, §1.1). A Cloudflare continua **só** como DNS.
Nada aqui foi aplicado na AWS, no GitHub ou no DNS: são o código, as políticas e o passo a passo. Cada item que depende
de configuração externa está marcado como pendente.

```text
GitHub (PR) ── CI: lib reproduzida → npm ci → typecheck → testes → build → CSP conferida → artefato
                   → navegadores reais (Chromium, Firefox, WebKit) servidos como no CloudFront
Deploy (manual, da main) ── autorização → CI do commit → APROVAÇÃO HUMANA (environment production)
                   → portão de publicação → OIDC/STS (credencial de 30 min) → S3 → CloudFront → verificação pública
                                                                   │
                         Cloudflare (DNS only, sem proxy) ── nekkora.com / www ──► CloudFront ──OAC──► S3 privado
```

## 1. Auditoria da infraestrutura existente (D02)

### 1.1 O que foi possível verificar

**Esta máquina não tem a AWS CLI nem credenciais da AWS**. O agente não usou o usuário administrativo da titular, e
**nenhum recurso da AWS foi lido**. Por isso nenhum identificador real foi obtido, e **nenhum foi inventado**:

| Identificador | Valor | Como obter |
|---|---|---|
| AWS Account ID | **não verificado** | `npm run aws:auditar -- --bucket <nome>` (A01) |
| Região do bucket | **não verificado** | idem (`inventory.bucket.regiao`) |
| Nome exato do bucket | **não informado** | console S3 → informar no `--bucket` |
| CloudFront Distribution ID / ARN / domínio | **não verificado** | idem (descobre a distribuição pela origem) |
| OAC | **não verificado** | idem (`inventory.oac`) |
| ACM Certificate ARN e estado | **não verificado** | idem (`inventory.certificados`, com os registros de validação) |

Verificações públicas, sem credencial, feitas em 22/10/2026:

| Fato | Evidência |
|---|---|
| DNS na Cloudflare (`bethany`/`micah.ns.cloudflare.com`) | consulta NS em 1.1.1.1 |
| `nekkora.com` sem A/AAAA e `www.nekkora.com` inexistente: não há site publicado | consultas A, AAAA, CNAME e HTTPS |
| E-mail no Microsoft 365, a preservar: MX `nekkora-com.mail.protection.outlook.com`, SPF `v=spf1 include:spf.protection.outlook.com ~all`, TXT `MS=ms38126768`, DKIM `selector1`/`selector2._domainkey` (CNAME), `autodiscover` (CNAME) | DNS sobre HTTPS (cloudflare-dns.com) |
| Sem registro CAA: qualquer autoridade, inclusive a Amazon, pode emitir | consulta CAA |
| Sem DMARC (`_dmarc` inexistente) | consulta TXT. Fora do escopo: só registrado |
| **O certificado do ACM ainda não foi emitido.** Os logs públicos de Certificate Transparency de `nekkora.com` têm só os certificados automáticos da Cloudflare (Let's Encrypt e Google Trust Services, de 28–29/09/2026), nenhum da Amazon. O ACM registra em CT todo certificado público que emite | certspotter e crt.sh |

**Atualização (22/10/2026, noite):**
- A titular informou que os dois CNAMEs de validação **já foram criados** na Cloudflare, e que bucket, CloudFront, OAC
  e política do bucket foram configurados manualmente e conferidos por capturas de tela.
- Consulta nova aos logs de CT: **ainda nenhum certificado da Amazon**.
- Causas possíveis:
  - validação em andamento (minutos a algumas horas);
  - emissão recente ainda não indexada;
  - erro num registro. Os mais comuns são o proxy da Cloudflare ligado (precisa ser DNS only), o nome com o domínio
    repetido (`_abc.nekkora.com.nekkora.com`, porque a Cloudflare já acrescenta o domínio) e o valor incompleto (tem de
    terminar em `.acm-validations.aws.`).
- A auditoria (K01) mostra o estado e os registros exatos que o ACM espera, e o script do CloudShell lista os
  certificados também na região do bucket, caso o pedido tenha sido feito fora de `us-east-1`.

### 1.2 Auditoria somente leitura (`scripts/aws/auditar.mjs`)

Só faz chamadas `Get`, `List` e `Describe`. O teste `somente leitura` prova isso. Resultados: **ok**, **pendente**
(depende de ação externa), **falha** (configuração errada) ou **info**. Grava `auditoria.json` e `auditoria.md`.

**Caminho recomendado: AWS CloudShell.** Ele abre um terminal já autenticado pelo console, sem instalar nada no
Windows e sem gerar chaves. Entre no console com o usuário administrativo e MFA (nunca o root), abra o CloudShell
(ícone `>_` na barra superior) e rode:

```bash
curl -fsSL https://raw.githubusercontent.com/Nekkora-Operation/Nekkora-Commercial/feat/com-release-003-aws/scripts/aws/auditar-cloudshell.sh -o auditar.sh
bash auditar.sh                 # lista os buckets e pergunta qual é o do Commercial
# ou: bash auditar.sh <nome-do-bucket>
cat nekkora-commercial-auditoria/auditoria/auditoria.md   # para copiar o relatório
```

O script [`scripts/aws/auditar-cloudshell.sh`](../../scripts/aws/auditar-cloudshell.sh) faz o seguinte:
- recusa a identidade root;
- clona esta branch e instala só o AWS SDK, nas versões fixas e sem scripts de instalação;
- lista os certificados ACM de `nekkora.com` em `us-east-1` e na região do bucket;
- roda a auditoria.

O relatório tem IDs e ARNs, mas nenhum segredo.

Alternativas:

```bash
# máquina local com AWS CLI/SSO configurado:
npm run aws:auditar -- --bucket <nome-do-bucket> --saida auditoria
# GitHub: Actions → "Auditoria AWS" (role somente leitura, environment auditoria-aws), depois do §2
```

| ID | Verifica |
|---|---|
| A01 | Identidade da auditoria não é o root |
| S01–S05 | Block Public Access (4 opções), ACLs desabilitadas, criptografia em repouso, política não pública, sem Static Website Hosting |
| S06 | Versionamento (info: o rollback não depende dele) |
| S07–S10 | Política do bucket: leitura só para esta distribuição (`AWS:SourceArn`), nenhuma outra permissão, `_releases/` negado ao CloudFront, escrita única de assets |
| C01–C13 | Distribuição implantada, origem REST única (não website), OAC `sigv4/always`, `index.html` como objeto raiz, HTTP→HTTPS, CachingOptimized + compressão, só GET/HEAD, política de cabeçalhos e função **iguais às versionadas**, erros 403/404 → `/404.html` com 404 (nenhum vira 200), WAF, classe de preço e logs |
| D01–D03 | Domínios alternativos, certificado próprio com **SNI** (o modo de IP dedicado custa US$ 600/mês e é apontado como urgente) e TLS ≥ 1.2 |
| K01–K02 | Certificado em `us-east-1` com `nekkora.com` + `www.nekkora.com`, emitido e associado. Se pendente, lista os CNAMEs de validação |

Testado em `scripts/testes/aws-auditoria.test.mjs` com respostas simuladas da AWS, usando as classes de comando do
próprio SDK (7/7), em três cenários: conta correta, certificado pendente e 14 erros comuns de configuração manual.

## 2. Autenticação GitHub → AWS por OIDC (D03)

Nenhuma chave permanente. No GitHub ficam **só identificadores** (variáveis, não secrets). Cada job recebe do STS uma
credencial temporária de 30 minutos.

### 2.1 Provedor OIDC (uma vez por conta)

IAM → Identity providers → Add provider → OpenID Connect:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

### 2.2 Roles

Os modelos estão em [`deploy/aws/iam/`](../../deploy/aws/iam/). Para preenchê-los com os IDs reais, sem editar à mão:

```bash
node scripts/aws/gerar-config.mjs --conta <12 dígitos> --bucket <nome> --distribuicao <E…> \
  --politica-cabecalhos <id da Response Headers Policy> --saida aws-config   # pasta local, não versionada
```

| Role | Confiança (`sub` do token) | Permissões |
|---|---|---|
| `nekkora-commercial-deploy` | `repo:Nekkora-Operation/Nekkora-Commercial:environment:production` | [`permissoes-deploy.json`](../../deploy/aws/iam/permissoes-deploy.json) |
| `nekkora-commercial-auditoria` | `repo:Nekkora-Operation/Nekkora-Commercial:environment:auditoria-aws` | [`permissoes-auditoria.json`](../../deploy/aws/iam/permissoes-auditoria.json): Get/List/Describe |

A role de deploy **só** pode ser assumida por um job que declara o environment `production`. Esse environment exige
aprovação humana e só aceita a `main`. Por isso nenhum Pull Request publica:

- os jobs de PR não declaram o environment;
- um PR que altere um workflow para declará-lo esbarra na restrição de branches;
- PRs de fork não recebem token OIDC.

Permissões da role de deploy, com a justificativa de cada uma:

| Permissão | Recurso | Para quê |
|---|---|---|
| `s3:GetObject`, `s3:PutObject` | `bucket/*` | gravar a release e ler manifestos e estado (rollback e verificação) |
| `s3:ListBucket` | `bucket` | distinguir "objeto inexistente" (404) de "sem permissão" (403) no `HeadObject` |
| `cloudfront:CreateInvalidation`, `GetInvalidation`, `GetDistribution` | só esta distribuição | invalidar os caminhos sem hash que mudaram e acompanhar a invalidação |
| `cloudfront:GetResponseHeadersPolicy` | só esta política | conferir, **antes de gravar**, se a CSP em uso aceita os scripts do artefato |

Ficam de fora: `s3:DeleteObject` (a publicação nunca apaga), `AdministratorAccess`, IAM, ACM, DNS e qualquer
permissão de alterar a distribuição. **Se o bucket usar SSE-KMS**, a role também precisa de
`kms:GenerateDataKey`/`kms:Decrypt` na chave. SSE-S3 basta para um site público e não tem custo.

### 2.3 GitHub Environments

Como o repositório é **público**, revisor obrigatório e restrição de branches funcionam no plano Free da organização.

| Environment | Proteção | Variáveis |
|---|---|---|
| `production` | revisor obrigatório (a titular), branches: só `main`; recomendado desmarcar "Allow administrators to bypass" | `AWS_ROLE_ARN`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`, `AWS_CLOUDFRONT_DOMAIN`, `AWS_RESPONSE_HEADERS_POLICY_ID` e, depois do DNS, `DOMINIO_PUBLICO=https://nekkora.com` |
| `auditoria-aws` | branches: só `main` | `AWS_AUDIT_ROLE_ARN`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID` |
| `preview` (já existe) | nenhuma credencial, e nenhuma role confia nele | — |

Os workflows de deploy e de rollback **recusam rodar** se o environment `production` não tiver revisor obrigatório e
restrição de branches. Assim, ele não é criado "aberto" pelo primeiro uso.

## 3. Pipeline (D04)

| Workflow | Quando | O que faz |
|---|---|---|
| `ci.yml` | PR, push na `main`, chamado pelo deploy | lib reproduzida a partir do commit registrado (mesmo sha256) → `npm ci` → typecheck → 63 testes automatizados → build → política de cabeçalhos = CSP do build → artefato `commercial-dist-<commit>` (90 dias) → página (71 verificações) e jornadas de e-mail (31) e WhatsApp (37) em Chromium, Firefox e WebKit, **servidas pelo CloudFront local** → resumo da release candidata no environment `preview` |
| `deploy-producao.yml` | manual, da `main`, com `PUBLICAR` | ver §3.1 |
| `rollback-producao.yml` | manual, da `main`, com `REVERTER` | ver §6 |
| `auditoria-aws.yml` | manual, da `main` | auditoria somente leitura (§1.2) |

### 3.1 Deploy

1. **Autorização.** Exige que o disparo venha da `main`, que a confirmação tenha sido digitada, que o ref informado
   já esteja integrado à `main` (`git merge-base --is-ancestor`) e que o environment `production` esteja protegido.
2. **CI completo do commit**, chamando o `ci.yml` com o mesmo commit.
3. **Aprovação humana** (environment `production`).
4. **Conferências antes da credencial.** O artefato tem de ser o do commit; a lib tem de estar íntegra. O portão
   (`verificar-publicacao.mjs`) bloqueia sem contatos, datas da campanha, controlador, aprovações, autorização de
   publicação, lib íntegra ou build limpo, ou com a CSP divergente.
5. **OIDC → STS**, com credencial de 30 minutos e sessão nomeada pelo run.
6. **`scripts/aws/publicar.mjs`**, descrito no §5.
7. **`scripts/aws/verificar-site.mjs`** no domínio do CloudFront (e em `nekkora.com` depois do DNS). Confere:
   - o commit do `release.json` e o SHA-256 de cada arquivo;
   - o tipo de conteúdo e o cache de cada arquivo;
   - os 7 cabeçalhos de segurança;
   - o 404 real e o `_releases/` bloqueado;
   - o bucket fechado ao acesso direto (403);
   - os redirecionamentos HTTP → HTTPS e `www` → apex.

## 4. CloudFront e segurança HTTP (D05)

O `_headers` do Cloudflare Pages foi removido. Os cabeçalhos agora vêm de uma **Response Headers Policy** versionada
em [`deploy/aws/politica-cabecalhos.json`](../../deploy/aws/politica-cabecalhos.json), gerada de
[`deploy/aws/cabecalhos.mjs`](../../deploy/aws/cabecalhos.mjs):

| Cabeçalho | Valor |
|---|---|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'sha256-JDd2…L6tE='; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` (sem preload) |
| X-Content-Type-Options / X-Frame-Options | `nosniff` / `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy (personalizado) | `camera=(), microphone=(), geolocation=(), payment=()` |
| Cross-Origin-Opener-Policy (personalizado) | `same-origin` |
| Removidos | `x-amz-server-side-encryption`, `x-amz-version-id` |

A CSP autoriza **por hash** o único script inline do `index.html`, que aplica o tema antes da primeira pintura. Sem
`'unsafe-inline'` para scripts. O `style-src 'unsafe-inline'` vem de antes (atributos `style` da nekkora-lib) e não
permite executar código.

A política e o artefato **não podem divergir**, e isso é conferido em três pontos:
- o CI compara a política versionada com o build (`npm run aws:config:verificar`);
- o portão bloqueia;
- o deploy lê a política **em uso** na distribuição e recusa publicar antes de gravar qualquer arquivo.

Se o script inline mudar algum dia:
1. `npm run build && npm run aws:config`;
2. commit;
3. atualizar a política no CloudFront;
4. só então publicar.

Configuração da distribuição. A auditoria confere cada item:

| Item | Valor |
|---|---|
| Origem | endpoint **REST** do bucket (`<bucket>.s3.<região>.amazonaws.com`), não o de website, com **OAC** (`sigv4`, `always`) |
| Objeto raiz | `index.html`. Vale só para `/`, sem fallback de SPA (a página é única, com âncoras) |
| Visualizador | Redirect HTTP to HTTPS; GET e HEAD; HTTP/2 e HTTP/3; IPv6 |
| Cache | **Managed-CachingOptimized** (respeita o `Cache-Control` do objeto) + Compress objects = Yes |
| Response headers policy | `nekkora-commercial-seguranca`, criada a partir do JSON versionado |
| Função viewer-request | [`deploy/aws/funcao-viewer-request.js`](../../deploy/aws/funcao-viewer-request.js), runtime `cloudfront-js-2.0`: `www` → `https://nekkora.com` (301, preserva caminho e query) e `_releases/` vira 404 (também com escape e maiúsculas) |
| Páginas de erro | 403 e 404 → `/404.html` com código **404**, TTL 60 s. O S3 privado responde 403 a objeto inexistente. Nenhum erro vira 200 |
| Certificado | ACM `us-east-1`, `nekkora.com` + `www.nekkora.com`, **SNI only**, `TLSv1.2_2021` |
| Classe de preço | `PriceClass_All` (as outras deixam o Brasil fora dos pontos de presença; dentro do nível gratuito, a diferença de custo é nula) |
| WAF / logs | desativados (custo; decisão da titular para o WAF) |

Política do bucket: [`deploy/aws/iam/politica-bucket.json`](../../deploy/aws/iam/politica-bucket.json). Ela tem quatro
declarações:
- leitura só pela distribuição (`AWS:SourceArn`);
- `_releases/*` negado ao CloudFront;
- só HTTPS;
- gravação em `assets/*` e `_releases/<commit>/*` só com `If-None-Match` (escrita única).

Antes de substituir a política atual, compare-a com a auditoria (S07–S10). A condição `s3:if-none-match` é recente
(escrita condicional, 2024): confira no editor de políticas do console se ela é aceita antes de salvar.

## 5. Publicação no S3 (D05/D06 — `scripts/aws/publicar.mjs`)

Organização do bucket:

```text
index.html, 404.html, release.json, favicon.*, og-nekkora.jpg, robots.txt, sitemap.xml   ← sem hash: Cache-Control no-cache
assets/<nome>-<hash8>.<ext>                                                              ← imutáveis: max-age=31536000, immutable
_releases/<commit>/manifest.json         ← commit, versão, data, lib, hashes CSP, testes, SHA-256 de cada arquivo
_releases/<commit>/arquivos/…            ← cópia dos arquivos sem hash da release (para o rollback)
_releases/atual.json, historico.json     ← release em produção e registro de toda publicação/rollback
```

Ordem da publicação. Nenhum passo apaga nada:
1. Estado atual e CSP da distribuição.
2. Cópia da release (escrita única).
3. Assets com `If-None-Match`. Um nome que já existe com outro conteúdo **interrompe** a publicação.
4. Manifesto.
5. Conferência dos SHA-256 no bucket.
6. Troca dos arquivos sem hash: os demais, depois `index.html` e, por último, `release.json`.
7. Conferência da raiz e registro com `If-Match`. Duas operações simultâneas não se sobrepõem.
8. Invalidação **só dos caminhos sem hash que mudaram**, normalmente `/`, `/index.html` e `/release.json`.

Uma falha no meio mantém o site no ar. O `index.html` antigo continua apontando para assets que nunca são apagados.
Repetir a publicação conclui o que faltou.

Cache:
- **Assets com hash:** um ano, `immutable`. Nunca são sobrescritos.
- **HTML, `release.json` e demais arquivos sem hash:** `no-cache`. Navegador e CloudFront revalidam (ETag; com a
  CachingOptimized, a borda guarda no máximo 1 s). Uma publicação aparece mesmo sem a invalidação, que serve só de
  garantia.

O SHA-256 vai em cada `PutObject` (`x-amz-checksum-sha256`). O S3 recusa conteúdo corrompido na chegada e devolve o
valor para conferência.

## 6. Rollback (D06 — `scripts/aws/rollback.mjs`)

**Estratégia:** cópias imutáveis por release em `_releases/` + manifesto + assets preservados. Restaurar é **copiar
no próprio S3** os arquivos sem hash da release escolhida, sem rebuild e sem depender do código-fonte. Foi preferida
ao versionamento de objetos do S3 por três motivos:
- é explícita: a release inteira é conferida pelo manifesto;
- não acumula versões invisíveis;
- custa poucos centavos por ano: cerca de 100 kB por release, porque os assets não são duplicados.

Passos:
1. Release atual (`atual.json`).
2. Destino: o informado ou a release publicada antes da atual. Ele precisa constar no histórico como publicado por
   este processo; commit nunca publicado é recusado.
3. Validação. O manifesto é íntegro; cada asset na raiz tem o SHA-256 do manifesto; cada arquivo da cópia é
   **baixado e conferido pelo conteúdo**; o `index.html` só referencia arquivos do manifesto. Qualquer divergência
   interrompe **antes de tocar na raiz**.
4. Cópia: os demais, `index.html` e `release.json` por último.
5. Conferência da raiz.
6. Registro em `historico.json` (de, para, motivo, autor, execução) e invalidação.
7. Verificação pública com o manifesto restaurado.

Para só validar e ver o que seria restaurado, sem alterar nada, use `--simular` (no workflow, a opção "simular").

Testes: `scripts/testes/aws-publicacao.test.mjs` contra S3/CloudFront **simulados** (17/17), com cenários positivos e
negativos de publicação e de rollback (destino corrompido, incompleto, nunca publicado e igual ao atual). **Nenhum
rollback foi executado na AWS.** O teste real fica para depois da primeira publicação autorizada, com duas releases
publicadas.

## 7. Domínio e HTTPS (D07 — sem alterar DNS)

Na ordem, **somente após autorização expressa da titular** para cada mudança de DNS:

1. **Validação do certificado.** Criar na Cloudflare os CNAMEs de validação que o ACM mostra (a auditoria lista em
   K01), como **DNS only** (nuvem cinza). Aguardar o estado `ISSUED`, sem presumir que a solicitação concluída
   significa emissão.
2. **Distribuição.** Em Alternate domain names, `nekkora.com` e `www.nekkora.com`; certificado ACM; SNI only;
   `TLSv1.2_2021`.
3. **Registros na Cloudflare, ambos DNS only.**
   - `nekkora.com` → CNAME para `<id>.cloudfront.net`. No apex, a Cloudflare aplica **CNAME flattening**
     automaticamente e responde com os IPs do CloudFront. Funciona porque o CloudFront atende pelo nome do certificado
     e do Host.
   - `www` → CNAME para `<id>.cloudfront.net`. O redirecionamento para o apex é feito pela função do CloudFront.
4. **Sem proxy da Cloudflare (nuvem laranja)**, por quatro motivos:
   - seriam duas CDNs em série (cache e TLS duplicados, diagnóstico difícil);
   - recursos como Rocket Loader e Email Obfuscation injetariam scripts e quebrariam a CSP;
   - o CloudFront já entrega HTTPS, HSTS e compressão;
   - o certificado do CloudFront precisa atender o visitante diretamente.
5. **Não tocar** em MX, SPF (`v=spf1…`), `MS=ms38126768`, `selector1/2._domainkey`, `autodiscover` nem em nenhum
   outro registro do Microsoft 365.
6. **Conferir** com `node scripts/aws/verificar-site.mjs --base https://nekkora.com/ --dist dist --http http://nekkora.com/ --www https://www.nekkora.com/`
   e preencher a variável `DOMINIO_PUBLICO`.

O HSTS `includeSubDomains` vale para todos os subdomínios. Os atuais (`autodiscover` e DKIM) não servem páginas por
HTTP, então não há impacto; um subdomínio novo terá de ter HTTPS.

## 8. Custos (COM-RELEASE-003-G)

Preços públicos da AWS no modelo **pay-as-you-go**, em US$, sem impostos. A fatura da AWS no Brasil pode somar
impostos. Conferir no console se a distribuição está nesse modelo ou num plano de preço fixo do CloudFront.

| Item | Situação | Custo mensal estimado |
|---|---|---|
| CloudFront: transferência e requisições | nível gratuito permanente: 1 TB de saída, 10 milhões de requisições e 2 milhões de invocações de CloudFront Functions por mês | **US$ 0**. A página inicial transfere ~150 kB; 1 TB equivale a ~6 milhões de visitas |
| CloudFront Function (www → apex) | dentro dos 2 milhões gratuitos | US$ 0 |
| Invalidações | 1.000 caminhos/mês gratuitos; ~3 por publicação | US$ 0 |
| S3: armazenamento | ~1 MB por release; os assets compartilhados não duplicam. São Paulo: US$ 0,0405/GB-mês | < US$ 0,01 |
| S3: requisições | GET só nas revalidações e faltas de cache da borda; ~40 PUT por publicação | < US$ 0,01 |
| S3 → CloudFront | gratuito | US$ 0 |
| ACM (certificado público) | gratuito | US$ 0 |
| IAM, OIDC, STS | gratuitos | US$ 0 |
| AWS Budgets (alerta) | gratuito nas primeiras duas | US$ 0 |
| **Total esperado** | | **≈ US$ 0,00–0,05/mês** + impostos |

Fora do nível gratuito, com ~5.000 visitas/mês (≈ 1 GB e 75 mil requisições na América do Sul), o custo seria de
≈ US$ 0,11 de saída mais ≈ US$ 0,17 de requisições, **abaixo de US$ 0,50/mês**.

Contas criadas a partir de julho de 2025 recebem **créditos promocionais**, e não o nível gratuito de 12 meses. Os
créditos cobrem esse uso, mas têm validade. Os limites "permanentes" do CloudFront não dependem deles.

Cobranças que **não** existem hoje e aparecem se alguém ativar:

| Item | Custo aproximado |
|---|---|
| AWS WAF | ~US$ 5 por Web ACL + US$ 1 por regra + US$ 0,60 por milhão de requisições |
| Certificado em modo IP dedicado ("Legacy clients support") | **US$ 600/mês**; a auditoria acusa (D02) |
| Logs padrão do CloudFront | armazenamento no S3 |
| Real-time logs, Origin Shield, Lambda@Edge, Route 53 | não usados |
| SSE-KMS com chave própria | US$ 1/mês + requisições |
| Versionamento do S3 sem regra de ciclo de vida | acúmulo de versões |
| Invalidações acima de 1.000 caminhos/mês | US$ 0,005 por caminho |

O **orçamento de US$ 10 é só um alerta**: a AWS não bloqueia gastos ao atingi-lo. A proteção real é não ativar os
itens da tabela acima sem decisão, e a auditoria acusa WAF, IP dedicado, logs e KMS.

### Observabilidade proporcional

O que já existe ou está pronto:
- a verificação pós-publicação em todo deploy e rollback (disponibilidade, integridade e cabeçalhos);
- a auditoria sob demanda;
- o histórico de releases em `_releases/historico.json`;
- as métricas padrão do CloudFront no console (requisições e taxa de erros 4xx/5xx), que são gratuitas.

O alerta de orçamento é da titular. Um alarme do CloudWatch na taxa de 5xx (US$ 0,10/mês) é opcional e não foi criado.

## 9. Runbook — primeira publicação (D07)

| # | Ação | Quem | Situação |
|---|---|---|---|
| 1 | Rodar a auditoria no CloudShell (`bash auditar.sh`, §1.2), enviar o `auditoria.md` e corrigir as **falhas** | titular | pendente (próximo passo) |
| 2 | Validar o certificado: CNAMEs na Cloudflare, DNS only | titular | CNAMEs **criados** (informado em 22/10). Falta confirmar `ISSUED` (K01) |
| 3 | Criar a Response Headers Policy a partir de `deploy/aws/politica-cabecalhos.json`. Console, ou `aws cloudfront create-response-headers-policy --response-headers-policy-config file://deploy/aws/politica-cabecalhos.json` | titular | pendente |
| 4 | Criar e publicar a função `nekkora-commercial-viewer-request` (cloudfront-js-2.0) com `deploy/aws/funcao-viewer-request.js` e associá-la ao viewer request | titular | pendente |
| 5 | Ajustar o comportamento padrão: CachingOptimized, compressão, GET/HEAD, redirect to HTTPS, política do passo 3. Páginas de erro 403/404 → `/404.html` (404) | titular | pendente |
| 6 | Política do bucket (`gerar-config.mjs` → `politica-bucket.json`) | titular | pendente |
| 7 | Provedor OIDC e roles de deploy e auditoria (§2) | titular | pendente |
| 8 | Environments `production` e `auditoria-aws` com as proteções e variáveis do §2.3 | titular | pendente |
| 9 | Rodar a auditoria de novo, também pelo workflow, até ficar sem falhas | titular/agente | pendente |
| 10 | Preencher o que falta em `publicacao.json` (PENDENCIAS) e fazer o merge dos PRs (lib #6, depois Commercial) | titular | pendente |
| 11 | Actions → "Deploy de produção", ref = tag/commit da `main`, `PUBLICAR`; aprovar no environment | titular | pendente |
| 12 | Conferir no domínio do CloudFront (o workflow faz). DNS do site (§7) com **autorização**; preencher `DOMINIO_PUBLICO` | titular | pendente |
| 13 | Homologação pública (COM-RELEASE-004) e, com duas releases publicadas, um rollback real com "simular" e depois efetivo | agente, com autorização | pendente |
