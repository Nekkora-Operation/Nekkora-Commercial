# NEKKORA-RELEASE-001 — Pendências que dependem da titular

Atualizado na COM-RELEASE-003 (22/10/2026). Nada abaixo foi presumido. Enquanto um item estiver pendente, a página
não faz a afirmação correspondente e o portão `npm run verificar:publicacao` **bloqueia o deploy de produção** (ele
lista os mesmos IDs). Todos os dados entram em um único arquivo: [`publicacao.json`](../../publicacao.json). O campo
`$origem` registra de onde veio cada valor já preenchido.

## 1. Dados para publicar (`publicacao.json`)

| ID | Item | Campo | Situação |
|---|---|---|---|
| PUB-01 | WhatsApp comercial | `canais.whatsapp` | **Fora do lançamento**: a titular decidiu publicar só e-mail e LinkedIn (22/10/2026). O campo fica `null`, a página não mostra WhatsApp e a jornada usa o e-mail. Para incluir depois, basta o número (só dígitos, DDI+DDD) |
| PUB-02 | E-mail comercial | `canais.email` | **Preenchido**: `contato@nekkora.com`. O domínio tem e-mail no Microsoft 365; confirme que a caixa recebe mensagens antes de publicar |
| PUB-03 | LinkedIn (obrigatório) e Instagram (opcional) | `canais.linkedin`, `canais.instagram` | **Preenchido**: `https://www.linkedin.com/company/nekkora`. Instagram fora (`null`) |
| PUB-13 | Início e fim da campanha de lançamento | `campanhaLancamento.inicio/fim` (AAAA-MM-DD) | **Pendente.** Com as datas, a página diz "para propostas aprovadas de DD/MM/AAAA a DD/MM/AAAA" e **só mostra os preços de lançamento dentro do período** (fuso de Brasília); fora dele, só o preço padrão. O portão recusa campanha encerrada |
| PUB-09 | Controlador dos dados pessoais | `controlador.nome/documento` | CNPJ **preenchido**: `68.337.624/0001-32`, com dígitos verificadores conferidos. **Falta a razão social**, que aparece no aviso de privacidade |
| PUB-11 | Provedor de hospedagem | `hospedagem.provedor` | **Preenchido**: "Amazon Web Services (AWS)" (COM-RELEASE-003 §1.1) |

## 2. Decisões e aprovações (`publicacao.json → aprovacoes`)

| ID | Decisão | Campo | Situação |
|---|---|---|---|
| PUB-14 | Preços: simples R$ 1.500 → R$ 1.000 (−33,33%, economia de R$ 500); média R$ 3.500 → R$ 2.800 (−20%, economia de R$ 700); complexa sob orçamento, sem desconto automático | `precos` | **Aprovado** na COM-RELEASE-003-R1 §3.1 |
| PUB-19 | Condições comerciais: sob demanda com escopo em proposta, preço aprovado antes, 50% + 50% conforme a proposta, fila, reuniões, licenças à parte, garantia e aceite conforme a proposta. A aprovação dos preços **não** inclui as condições (§3.5) | `condicoesComerciais` | Pendente |
| PUB-17 | Textos comerciais — [`docs/com-001/05-texto-comercial.md`](../com-001/05-texto-comercial.md) (gerado do código), inclusive a jornada por e-mail | `textosComerciais` | Pendente |
| PUB-09 | Aviso de privacidade (seção "Como tratamos seus dados"): o item do canal agora descreve o e-mail, e o do provedor cita a AWS. É uma minuta; revisão jurídica recomendada | `avisoDePrivacidade` | Pendente |
| PUB-10 | Desligar o aviso "Versão para homologação" | `avisoHomologacao: false` | Pendente |
| PUB-18 | Autorização expressa de publicação em produção | `publicacao` | Pendente |
| PUB-16 | Botão "Entrar" sem destino (não há área do cliente). Recomendação: **ocultar no lançamento**, por ser o único botão sem destino. Mantido por ser decisão anterior da titular (D-24) | — (código) | Decisão pendente |

## 3. Infraestrutura AWS (ações na conta da titular; nada foi feito pelo agente)

Passo a passo e justificativas em [COM-RELEASE-003-aws.md](COM-RELEASE-003-aws.md) §9. Esta máquina não tem
credenciais da AWS, então **nenhum identificador real foi lido**.

| ID | Ação | Onde |
|---|---|---|
| INF-01 | **Próximo passo.** Auditoria executada no CloudShell em 26/10/2026; as três falhas (S07, K01, K02) eram falsos positivos do auditor, corrigidos sem mexer na AWS (COM-RELEASE-003-aws §1.3). Rodar `bash auditar.sh` de novo e enviar o `auditoria.md`: o esperado é 21 ok, 5 pendentes, 0 falha, 3 info | AWS CloudShell (usuário administrativo com MFA, nunca root) |
| INF-02 | **Resolvido (26/10/2026).** Certificado ACM (us-east-1, `nekkora.com` + `www.nekkora.com`) `ISSUED` e associado à distribuição `E3TZD2P6FOEWWR`. Um pedido anterior ficou `VALIDATION_TIMED_OUT` e pode ser excluído no ACM quando a titular quiser (não afeta nada) | ACM |
| INF-03 | Response Headers Policy a partir de `deploy/aws/politica-cabecalhos.json` | CloudFront → Policies |
| INF-04 | CloudFront Function `deploy/aws/funcao-viewer-request.js` (viewer request) | CloudFront → Functions |
| INF-05 | Comportamento padrão: CachingOptimized, compressão, GET/HEAD, redirect to HTTPS, política INF-03; páginas de erro 403/404 → `/404.html` (404) | CloudFront → distribuição |
| INF-06 | Política do bucket `deploy/aws/iam/politica-bucket.json` (gerada com os IDs reais) | S3 → Permissions |
| INF-07 | Provedor OIDC `token.actions.githubusercontent.com` e as roles `nekkora-commercial-deploy` e `nekkora-commercial-auditoria` | IAM |
| INF-08 | Environment `production` (revisor obrigatório, só `main`) e `auditoria-aws`, com as variáveis do §2.3 | GitHub → Settings → Environments |
| INF-09 | **Autorização para alterar DNS do site**: `nekkora.com` e `www` como CNAME para o CloudFront, **DNS only**, sem tocar nos registros do Microsoft 365 | Cloudflare (após autorização) |
| INF-10 | Proteção da `main` (PR obrigatório + CI verde) | GitHub → Branches |

## 4. Repositório

| ID | Situação | Recomendação |
|---|---|---|
| REP-03 | Na pasta `Nekkora-Commercial`, o commit local `34d0aa5` ("fix: changing price") versionava o `.env` com credenciais. Ele nunca foi enviado. **Tratado na COM-RELEASE-003**: o commit foi desfeito localmente, o `.env` ficou intacto no disco e fora do índice, as mudanças de preço daquele commit continuam como alterações não commitadas e `.env`/`.env.*` estão no exclude local do repositório (`.git/info/exclude`), porque o `.gitignore` daquela branch não os cobria. As branches de release já os têm no `.gitignore`. Os preços oficiais foram implementados na branch limpa, **sem usar aquele commit**. Detalhes em [COM-RELEASE-003-relatorio.md](COM-RELEASE-003-relatorio.md) §6 | **Trocar as credenciais do `.env`** (senha do Postgres e `CLIENT_SECRET` do Azure). O conteúdo ainda fica no reflog local por ~90 dias: `git reflog expire --expire=now --all && git gc --prune=now` remove de vez, mas a decisão de apagar histórico é da titular |
| REP-04 | Contato por e-mail: confirmar que `contato@nekkora.com` **recebe** mensagens (enviar um teste de fora) e testar manualmente o "Abrir no e-mail" num computador e num celular com aplicativo de e-mail configurado. A homologação automatizada confere o mailto exato, mas não abre um aplicativo real. Lembrete: a mensagem só chega se o visitante enviá-la pelo próprio aplicativo | Titular |
| PR-05 | Depois do merge do PR #6, atualizar a descrição do PR #5 (ainda cita Cloudflare Pages e os preços antigos) | Agente, quando autorizado |
| REP-02 | `.env` com credenciais de outro contexto dentro da pasta do site | Mover para fora do projeto |
| L-01 | Merge do PR #6 da nekkora-lib (o Commercial usa o tarball do CI, já fixado por hash) | Titular |

## 5. Pós-publicação (COM-RELEASE-004)

Depois da autorização e do primeiro deploy:
- `npm run homologacao` contra `https://nekkora.com`;
- `verificar-site.mjs` com `--http` e `--www`;
- LinkedIn Post Inspector (`https://www.linkedin.com/post-inspector/`);
- medição de desempenho no domínio;
- com duas releases publicadas, um rollback real ("simular" e depois efetivo).

Só então G10/G11 podem ser declarados.
