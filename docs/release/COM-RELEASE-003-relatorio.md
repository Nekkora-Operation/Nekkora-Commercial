# COM-RELEASE-003 — Relatório técnico e evidências (D08)

**Data:** 22/10/2026 · **Branch:** `feat/com-release-003-aws` (a partir de `release/com-release-001` @ `318a1a6`, sem a
branch contaminada) · **Código:** commit `06448fb` · **Evidências:** [`evidencias/com-release-003/`](evidencias/com-release-003/)
(comandos e saídas em [`comandos.txt`](evidencias/com-release-003/comandos.txt)) · Infraestrutura, runbook e custos em
[COM-RELEASE-003-aws.md](COM-RELEASE-003-aws.md).

Navegadores: Chromium 153.0.8010.12, Firefox 155.0 e WebKit 26.6 (Playwright 1.63.0), Windows 11. A homologação foi
servida pelo **CloudFront local** (`scripts/servidor-cloudfront-local.mjs`), que aplica a política de cabeçalhos, a
função, as páginas de erro, o cache e a compressão versionados. É uma simulação: nada foi acessado na AWS.

## 1. Precificação (COM-RELEASE-003-R1)

| Categoria | Preço padrão | Preço de lançamento | Economia | Desconto | Fora da campanha |
|---|---:|---:|---:|---:|---|
| Automação simples | R$ 1.500 | **R$ 1.000** | R$ 500 | 33,33% | R$ 1.500 |
| Automação média | R$ 3.500 | **R$ 2.800** | R$ 700 | 20% | R$ 3.500 |
| Automação complexa | Sob orçamento | Sob orçamento | — | sem desconto automático | Sob orçamento |

- **Fonte única** em `src/precos.ts`. Página, testes e homologação leem dali. Economia e percentual são
  **calculados**; o percentual é truncado em 2 casas, então nunca anuncia mais do que o real.
- **Comunicação:** "Preços especiais de lançamento". Cada preço mostra a própria economia, e não há nenhum "50% de
  desconto", "metade do preço" ou desconto único. A condição de pagamento "50% na contratação e 50% na entrega"
  continua, separada do desconto.
- **Leitor de tela:** "Preço padrão: R$ 1.500", "Preço especial de lançamento: R$ 1.000", "Desconto de −33,33%".
- **Vigência:** com as datas aprovadas, os preços de lançamento só aparecem dentro do período (fuso de Brasília);
  antes e depois, só o preço padrão. Sem datas, a página mostra os preços de lançamento para revisão e o portão
  bloqueia a publicação.
- **Conferência visual:** [`precos-*.png`](evidencias/com-release-003/pagina-chromium/) nos 3 navegadores × 2 temas
  × celular e desktop.

## 2. Testes (§11.1)

| ID | Verificação | Resultado | Como |
|---|---|---|---|
| T01 | Integridade da Nekkora-lib | **aprovado** | `verificar-lib.mjs --reconstruir`: tarball refeito a partir do commit registrado, sha256 `1a2e6145…26a6` idêntico |
| T02 | Typecheck | **aprovado** | `tsc --noEmit` |
| T03 | Testes unitários | **aprovado: 63/63** | preços 6, portão 25, publicação/rollback 17, auditoria 7, CloudFront 8 |
| T04 | Build de produção | **aprovado** | árvore limpa, `release.json` com o commit em disco |
| T05 | Valores comerciais | **aprovado** | `precos.test.mjs` (itens 1–4) + `precos-tabela-oficial`, lida da tela via `data-price`, nos 3 navegadores |
| T06 | Descontos corretos | **aprovado** | `precos.test.mjs` (item 5) + `precos-descontos-coerentes` sobre os valores exibidos |
| T07 | Sem alegações incorretas | **aprovado** | regra `desconto-50` no texto renderizado (3 navegadores) + varredura de `src/`, `index.html`, `publicacao.json` e texto comercial |
| T08 | Jornada comercial | **aprovado** | e-mail (canal da publicação): 31/31 por navegador. WhatsApp (pronto para quando houver número): 37/37 |
| T09 | Chromium | **aprovado** | página 71/71 · e-mail 31/31 · WhatsApp 37/37 |
| T10 | Firefox | **aprovado** | página 71/71 · e-mail 31/31 · WhatsApp 37/37 |
| T11 | WebKit | **aprovado** | página 71/71 · e-mail 31/31 · WhatsApp 37/37 |
| T12 | Segurança dos cabeçalhos | **aprovado (simulado)** | política versionada = cabeçalhos esperados com a CSP exata do build; 7 cabeçalhos servidos; a página funciona sob essa CSP nos 3 navegadores, sem erro no console. **Não verificado no CloudFront real** |
| T13 | Integridade dos assets | **aprovado (simulado)** | `verificar-site.mjs`: 13 arquivos com SHA-256, tipo e cache do artefato |
| T14 | Configuração S3/OAC | **não executado** | auditoria pronta e testada com respostas simuladas (7/7); sem credenciais nesta máquina |
| T15 | Credenciais temporárias OIDC | **não executado** | políticas de confiança e workflows prontos (`actionlint` sem erros); depende do provedor OIDC, das roles e dos environments |
| T16 | Bloqueio de deploy sem aprovação | **aprovado (portão) / não executado (workflow)** | portão: 25/25, inclusive o `publicacao.json` versionado continuar bloqueado. Workflow: só dispara da `main`, exige `PUBLICAR`, commit integrado à `main` e environment com revisor (verificação estática) |
| T17 | Estratégia de rollback | **aprovado (simulado)** | 17/17 contra S3/CloudFront simulados, inclusive destino corrompido, incompleto, nunca publicado e igual ao atual. **Nenhum rollback na AWS** |
| T18 | release.json | **aprovado** | commit, árvore limpa, lib e hashes CSP conferidos pelo portão, pelo deploy (artefato = commit aprovado) e pela verificação pós-publicação |
| T19 | Sem exposição de credenciais | **aprovado** | nenhuma chave no repositório nem nos workflows (só OIDC e identificadores); varredura do diff; `.env` fora do versionamento; REP-03 tratado (§6) |
| T20 | Compatibilidade com CloudFront | **aprovado (simulado)** | servidor local com a configuração versionada: objeto raiz só em `/`, 403/404 → `/404.html` (404), `_releases/` → 404, `www` → 301, 304 na revalidação, brotli/gzip. **Distribuição real não auditada** |

**Desempenho** (laboratório: celular 375 px, 4G lento, CPU 4×, mediana de 5): LCP 1,75 s, CLS 0, 150 kB, 4
requisições. Na medição anterior (Cloudflare Pages local) foram 1,58 s, CLS 0 e 165 kB. A diferença está dentro da
variação local. Nesse processo apareceu um problema do simulador: sem compressão, a medição dava 460 kB e 3,1 s. O
servidor local passou a comprimir como o CloudFront.

**Defeitos encontrados e corrigidos durante a homologação:**
1. O rollback confiava no checksum guardado nos metadados. Agora baixa e confere o conteúdo de cada arquivo que vai
   copiar.
2. O `release.json` registrava `GITHUB_SHA`. Num deploy de uma tag, esse é o commit da `main` que disparou o workflow,
   não o publicado. Agora registra o commit em disco.

## 3. Segurança

O que foi verificado ou implementado:
- **OIDC** com credencial de 30 minutos. A role de deploy só confia no environment `production` deste repositório.
- **Permissões mínimas:** a role de deploy não tem `s3:DeleteObject`, não tem permissões de administrador e não altera
  a distribuição.
- **Deploy e rollback** recusam environment sem revisor obrigatório ou sem restrição de branches.
- **Bucket:** a política recomendada libera leitura só para a distribuição, nega `_releases/` ao CloudFront e impõe
  HTTPS e escrita única.
- **CSP por hash, sem `unsafe-inline` para scripts.** A política e o artefato são conferidos no CI, no portão e
  **antes de qualquer gravação** no deploy.
- **Nenhuma requisição a terceiros** na página (homologação: `sem-requisicoes-externas`). O mailto e o WhatsApp abrem
  por link, sem `window.open`.

## 4. CI/CD

Workflows validados com `actionlint` 1.7.7, sem erros: `ci.yml`, `deploy-producao.yml`, `rollback-producao.yml` e
`auditoria-aws.yml`. O resultado do CI no GitHub está na seção 7.

## 5. O que não foi feito e por quê

| Item | Motivo |
|---|---|
| Leitura dos recursos reais (conta, bucket, distribuição, OAC, certificado) | sem credenciais da AWS nesta máquina; o agente não usou contas da titular |
| Deploy e rollback na AWS | não autorizados (§17) e sem infraestrutura OIDC |
| DNS | não autorizado (§9.3) |
| Datas da campanha, razão social, aprovações | decisões da titular (PENDENCIAS) |

## 6. REP-03 — commit local com `.env`

Na pasta `Nekkora-Commercial`, branch `feat/commercial-modelo-c`:
1. **Inspeção, sem imprimir conteúdo.** O commit `34d0aa5` adicionava `.env` e alterava `src/content.ts`. Só essa
   branch local o continha: nenhuma tag, nenhum stash e nunca enviado ao remoto.
2. **`git reset --mixed HEAD~1`.** A branch voltou a ser idêntica a `origin/feat/commercial-modelo-c` (`5f089e6`).
   Nenhum arquivo do disco mudou: o `.env` está intacto (mesmo hash) e não rastreado, e a mudança de preço em
   `content.ts` ficou como alteração não commitada, para a titular decidir.
3. **Proteção.** O `.gitignore` daquela branch não cobria `.env`, então `.env` e `.env.*` foram para o exclude local
   do repositório (`.git/info/exclude`, não versionado). As branches de release já os ignoram.
4. **Não feito, por depender da titular:** apagar o reflog (`git reflog expire --expire=now --all && git gc
   --prune=now`; até lá o commit fica recuperável localmente por ~90 dias), mover o `.env` para fora do projeto e
   **trocar as credenciais** (senha do Postgres e `CLIENT_SECRET` do Azure). Nenhum valor foi impresso em log ou
   relatório.

Os preços oficiais foram implementados na branch limpa, a partir da especificação. Nada daquele commit foi usado.

## 7. CI no GitHub

Preenchido depois do push.
