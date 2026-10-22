# COM-RELEASE-003 — Infraestrutura, CI/CD, publicação e rollback

## 1. Auditoria de infraestrutura (22/10/2026, consultas públicas)

| Item | Achado | Como foi verificado |
|---|---|---|
| Provedor DNS | **Cloudflare** — NS `bethany.ns.cloudflare.com`, `micah.ns.cloudflare.com` | `Resolve-DnsName -Server 1.1.1.1` |
| Hospedagem existente | **Nenhuma**: `nekkora.com` sem A/AAAA/CNAME; `www.nekkora.com` não existe (NXDOMAIN) | idem |
| E-mail | Microsoft 365 (MX `nekkora-com.mail.protection.outlook.com`, SPF `spf.protection.outlook.com`, TXT de verificação `MS=`) | idem |
| HTTPS | Inexistente (não há site); a Cloudflare emite o certificado ao ligar o domínio ao Pages | — |
| Repositórios | `Nekkora-Commercial` e `Nekkora-lib` **públicos**, plano Free da organização, nenhum workflow antes desta release | API do GitHub |
| CI/CD / publicação | Nenhum processo existente | — |
| Credenciais Cloudflare | Nenhuma nesta máquina (sem `wrangler` autenticado); o agente **não acessou** a conta | — |

**Escolha: Cloudflare Pages (plano gratuito).** O DNS já está na Cloudflare (ligar o domínio é automático, com
certificado), há preview por branch, `_headers` para segurança/cache, histórico de deploys com rollback instantâneo e
nenhum custo para um site estático deste porte. Nada foi contratado nem criado na conta.

Alternativa avaliada: GitHub Pages (gratuito para repositório público) — descartada por não aplicar cabeçalhos HTTP
(CSP, HSTS) e não ter preview por PR nem rollback sem rebuild.

## 2. Pipeline (`.github/workflows/ci.yml`)

```text
PULL REQUEST / push na main
  └─ lib ............. scripts/verificar-lib.mjs --reconstruir: baixa a nekkora-lib no commit registrado em
  │                    vendor/nekkora-lib.json, npm ci + build + pack e exige o MESMO sha256 do tarball versionado
  └─ commercial ...... npm ci (lockfile) → typecheck → npm test (portão + rollback) → build → portão (informativo)
  │                    → artefato commercial-dist-<sha> (90 dias), com release.json (commit, lib, origem dos dados)
  └─ integracao ...... Playwright 1.63.0 (Chromium, Firefox, WebKit): homologacao.mjs na página e
  │                    homologacao-canais.mjs na jornada de conversão (build com dados sintéticos)
  └─ preview ......... (PR) Cloudflare Pages, branch do PR — pulado enquanto INF-01..03 não existirem
APROVAÇÃO DE RELEASE → workflow "Deploy de produção" (manual, environment production com revisor)
DEPLOY ............... rebuild determinístico da tag → portão BLOQUEANTE → wrangler pages deploy → verificação pública
```

Versões controladas: Node `24.19.0` (`.nvmrc`), dependências pelo `package-lock.json`, Playwright `1.63.0` e axe-core
`4.13.0` exatos, wrangler `4.149.0` fixo nos workflows, actions em versão maior fixa. A nekkora-lib entra como tarball
em `vendor/` (integridade sha512 no lockfile) — instalação determinística sem acesso a outra pasta ou registro.

`.gitattributes` com `eol=lf`: sem isso, o checkout do Windows gerava CRLF e o hash da CSP calculado no build não
batia com o calculado pelos navegadores (o parser HTML normaliza para LF) — achado da homologação local.

## 3. Ambiente de homologação (preview)

- **Local, sem custo e já validado:** `npx wrangler@4.149.0 pages dev dist` serve o build com o mesmo runtime e os
  mesmos `_headers` do Cloudflare Pages. A homologação completa passou nele em Chromium e Firefox (70/70) e no WebKit
  (ver §6 e o relatório COM-RELEASE-004).
- **Preview por PR (depois de INF-01..03):** o job `preview` publica cada PR em `<branch>.<projeto>.pages.dev`; o
  Cloudflare marca previews com `X-Robots-Tag: noindex`. Testes de conversão com dados sintéticos usam o build de
  homologação (`NEKKORA_PUBLICACAO=scripts/fixtures/publicacao-homologacao.json`) — nunca publicado em produção: o
  portão recusa artefato com `release.json.homologacao = true`.

## 4. Produção — procedimento (só com autorização expressa)

1. Titular preenche `publicacao.json` (pendências PUB-*) e aprova; PR mesclado com CI verde.
2. Titular cria a tag `vX.Y.Z` na `main`.
3. Cloudflare (INF-01..06): projeto Pages; domínio personalizado `nekkora.com` e `www.nekkora.com` (o Pages cria os
   registros CNAME na zona e emite o certificado); regra de redirecionamento `www.nekkora.com/*` → `https://nekkora.com/$1`
   (301, *Rules → Redirect Rules*); SSL/TLS "Full" e "Always Use HTTPS" ligados; Rocket Loader, Email Obfuscation e
   injeção automática de Web Analytics desligados (injetam script e a CSP bloquearia).
   **Os registros de e-mail (MX, SPF, TXT `MS=`) não são tocados.**
4. GitHub → Actions → "Deploy de produção" → `ref = vX.Y.Z`, `confirmacao = PUBLICAR` → aprovação do revisor.
5. O workflow reconstrói, roda o portão, publica e confere no domínio: `release.json.commit` = commit da tag, CSP e
   HSTS presentes, HTTP → HTTPS.
6. Homologação pública (COM-RELEASE-004 §7.6).

### Cabeçalhos (`deploy/headers.template` → `dist/_headers`)

| Cabeçalho | Valor |
|---|---|
| Content-Security-Policy | `default-src 'self'`; `script-src 'self'` + hash SHA-256 do script de tema (gerado no build); `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `font-src 'self'`; `connect-src 'self'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` (sem `preload` — decisão da titular) |
| X-Content-Type-Options / X-Frame-Options | `nosniff` / `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` (os links do WhatsApp já usam `noreferrer`) |
| Permissions-Policy | câmera, microfone, geolocalização e pagamento desligados |
| Cache | `/assets/*` imutável por 1 ano (nome com hash); `/`, `index.html`, `release.json` com `no-cache` — publicação nova aparece na hora |

Arquivos estáticos: `robots.txt`, `sitemap.xml`, `404.html` (status 404 real, `noindex`), `og-nekkora.jpg`,
favicons. Rotas: página única com âncoras; endereço inexistente → 404 (não cai no `index.html`).

## 5. Rollback

**Sem rebuild.** O Cloudflare Pages guarda todos os deploys; voltar é apontar a produção para um deploy anterior.

- **Automático:** GitHub → Actions → "Rollback de produção" (`motivo` obrigatório; `deployment_id` opcional — vazio =
  o deploy de produção bem-sucedido anterior ao atual). Usa a API de rollback do Pages e confere no domínio que o
  `release.json` passou a ser o do commit de destino. Mesma aprovação do environment `production`.
- **Manual (equivalente):** Cloudflare → Workers & Pages → `nekkora-commercial` → Deployments → deploy anterior →
  "Rollback to this deployment". Conferir `https://nekkora.com/release.json`.
- **Teste:** `scripts/rollback-pages.mjs` testado contra uma API do Cloudflare **simulada** (5/5: escolhe o anterior
  pulando deploys falhos e de preview, aceita destino explícito, recusa destino inválido sem chamar a API, falha sem
  anterior e com token errado). **O teste na conta real está pendente** (depende de INF-01..04): após o primeiro deploy,
  publicar uma segunda versão e executar o rollback uma vez antes de divulgar o site.

## 6. Resultados

| Verificação | Resultado |
|---|---|
| Reconstrução da lib a partir do GitHub (Windows) | mesmo sha256 do CI (`1a2e6145…`) |
| `npm test` (portão de publicação 14 + rollback 5) | 19/19 testes (`node:test`) |
| Portão no estado atual | **BLOQUEADO** — 11 pendências da titular (esperado) |
| `_headers` no runtime do Pages (`wrangler pages dev`) | todos os cabeçalhos aplicados; CSP bloqueou de fato um script inline não autorizado (injeção do axe, prova de que está ativa); 404 real |
| Deploy de preview/produção, DNS, HTTPS, rollback real | **não executados** — sem autorização/credenciais (INF-*) |
