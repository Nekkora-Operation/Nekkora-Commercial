# NEKKORA-COM-GOLIVE-001 — Pré-liberação final (10/11/2026)

> **Preparação, sem aprovação.** Este documento organiza o que a titular precisa decidir. Ele não aprova nada, não
> altera flags e não substitui parecer jurídico. Base: branch `release/v1`, commit `5562f1c`. Nada foi alterado na AWS,
> no GitHub nem no Microsoft 365. Tudo o que vem de leitura está marcado como tal.

Aguardando: resposta da Microsoft sobre o F5 (e-mail de representantes de empresa, revisão interna §7–§8). Este
documento trata só do que **não** depende dessa resposta.

## 1. Textos comerciais que serão publicados (PUB-17 e PUB-19)

Fonte: `src/content.ts` em `5562f1c`, gerado em [`docs/com-001/05-texto-comercial.md`](../com-001/05-texto-comercial.md).
Configuração publicada: sem Bookings, sem WhatsApp, sem envio automático; contato por e-mail e LinkedIn.

### 1.1 Texto público (o que o visitante lê)

| Tema | O que o site diz |
|---|---|
| **Serviços** | Nekkora Delivery: automação sob proposta (escopo, prazo e preço por automação; conclusão só após documentação, desenvolvimento, testes, homologação e aceite formal). Nekkora Hosting: "em avaliação de viabilidade"; a solicitação não é contratação nem reserva de capacidade. |
| **Preços** | Simples R$ 1.500 (lançamento R$ 1.000); média R$ 3.500 (lançamento R$ 2.800); complexa sob orçamento. Licenças e serviços de terceiros à parte. Simulador = estimativa, sem envio nem armazenamento. |
| **Campanha** | Solicitações **recebidas** de 06/11/2026 a 06/01/2027, inclusive (Brasília), por e-mail ou LinkedIn. Vale para simples e média; a categoria é definida na avaliação; proposta aceitável em até 7 dias corridos da emissão. |
| **Pagamento** | 50% após a aprovação da proposta e a formalização da contratação; 50% após a homologação e o aceite formal. |
| **Fila e prazos** | Demandas em fila; cada proposta informa as datas previstas de início e de disponibilização para homologação. "Prazo estimado" é item da proposta. |
| **Cancelamento e reembolso** | Desistência **antes** da conclusão e da disponibilização para homologação: devolução integral do valor pago pelo desenvolvimento, sem entrega definitiva. Demais casos: "conforme a proposta e o contrato, preservados os direitos previstos em lei". |
| **Garantias** | Garantia contratual de correção de defeitos em termo escrito, além das garantias legais. Sem aceite tácito: o silêncio não vale como aceite. |
| **Contato** | contato@nekkora.com (formulário que abre o aplicativo de e-mail; nada é armazenado na página) e página da Nekkora no LinkedIn. Sem agendamento, sem Teams e sem WhatsApp nesta versão. |

**Não aparece no site:** a regra dos 50% de reembolso na desistência **durante** a homologação (removida em
`5562f1c`); qualquer menção a reuniões pelo Teams ou ao Bookings.

### 1.2 Cláusulas contratuais ainda pendentes (não são texto público)

A [minuta do contrato](../comercial/contrato-base-delivery.md) continua **não aprovada** e não autoriza contratação. O
site remete ao contrato em "Cancelamento, reembolso e garantia conforme a proposta e o contrato".

| Ponto | Situação |
|---|---|
| Cl. 10: desistência durante a homologação com devolução de 50% do valor pago (C-04) | **Não aprovada para contratação.** Sujeita à JUR-03; não pode ser usada sem nova decisão da titular. |
| Cl. 9: reembolso integral antes da conclusão | Coerente com o texto público (CO-11). Faz parte da minuta, que segue não aprovada. |
| Forma do aceite e da assinatura (OPS-04) | Pendente. |
| Nota fiscal e tributos (cl. 6.4, JUR-01) | Pendente. |
| Papel de operadora, confidencialidade e credenciais (LGPD art. 39) | Pendente de redação. |
| Foro com consumidor (17.3) | Pendente de redação. |
| Reprogramação sem resposta do contratante (8.5) | Sem regra nesta versão. |

**Consequência prática:** publicar o site permite receber solicitações e fazer avaliações. A **primeira contratação**
depende da aprovação do contrato pela titular, que inclui decidir a cl. 10. Isso não bloqueia o deploy.

## 2. Registros de aprovação preparados (flags NÃO alteradas)

As flags continuam `false` no `publicacao.json`. Quando a titular aprovar **expressamente**, o commit de aprovação
altera só as propriedades abaixo e o `$origem` correspondente, sobre o conteúdo de `5562f1c`.

**PUB-17** (`aprovacoes.textosComerciais` → `true`), texto proposto para `$origem.aprovacoes.textosComerciais`, mantendo o histórico existente:

> Titular, <data> (NEKKORA-COM-GOLIVE-001, pré-liberação §1): textos comerciais aprovados na versão do commit 5562f1c
> (release/v1), configuração sem Bookings. Revisão interna, sem parecer jurídico externo (dispensado pela titular como
> condição interna em 10/11/2026; obrigações legais preservadas).

**PUB-19** (`aprovacoes.condicoesComerciais` → `true`), novo `$origem.aprovacoes.condicoesComerciais`:

> Titular, <data> (NEKKORA-COM-GOLIVE-001, pré-liberação §1.1): condições comerciais do site aprovadas no commit
> 5562f1c (pagamento 50/50, fila e prazos por proposta, reembolso integral antes da disponibilização para homologação,
> demais casos conforme proposta e contrato). Não aprova a minuta do contrato nem a cláusula 10 (50% na desistência
> durante a homologação). Revisão interna, sem parecer jurídico externo.

**PUB-09** (`aprovacoes.avisoDePrivacidade` → `true`), novo `$origem.aprovacoes.avisoDePrivacidade`:

> Titular, <data> (NEKKORA-COM-GOLIVE-001, pré-liberação §2): aviso de privacidade aprovado no commit 5562f1c,
> configuração sem Bookings e sem envio automático, junto com a avaliação do legítimo interesse (revisão interna §2).
> Revisão interna, sem parecer jurídico externo. Pendência registrada: F5 (e-mail de representantes de empresa no
> Microsoft 365) aguarda a resposta da Microsoft; nenhum mecanismo do art. 33 da LGPD está demonstrado para uma eventual
> transferência internacional efetiva, e esta aprovação não o substitui (decisão de 06/11/2026 mantida). O aviso informa
> que parte do tratamento pode ocorrer fora do Brasil, sem afirmar mecanismo nem conformidade não demonstrados.

### 2.1 Decisão da titular de 10/11/2026 (avançar para publicação)

O site sai como canal de divulgação e de solicitação de avaliações: sem pagamento, Bookings, envio automático ou
contratação automática. O texto público já diz que a solicitação "inicia uma avaliação — não é uma contratação e não
gera compromisso". As condições contratuais da primeira contratação, incluindo a cl. 10, serão resolvidas **antes** da
primeira contratação, não antes da publicação.

### 2.2 Pendências que seguem depois da publicação

| Pendência | Quando precisa estar resolvida |
|---|---|
| F5: resposta da Microsoft e, se houver transferência efetiva, mecanismo do art. 33 ou decisão da titular | Assim que houver a resposta; o tratamento continua sujeito à LGPD |
| Minuta do contrato, inclusive a cl. 10 (50%), OPS-04, JUR-01, cl. 16 e 17.3 | Antes da primeira contratação |
| Rollback real e role de deploy exercida | Na primeira publicação (§3) |
| Reativação do Bookings ou do Teams | Só com o aviso ajustado e nova validação |

## 3. Infraestrutura de publicação (somente leitura, 10/11/2026)

| Item | Resultado | Fonte |
|---|---|---|
| Environment `production` | Revisor obrigatório (a titular); só a branch `main`. `scripts/verificar-environment.mjs` executado localmente: **protegido**. Aviso: `prevent_self_review` desligado (a titular dispara e aprova; esperado com uma pessoa só). | API do GitHub (GET) |
| Variáveis do deploy | As 6 obrigatórias existem e têm valor: `AWS_ROLE_ARN`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`, `AWS_CLOUDFRONT_DOMAIN`, `AWS_RESPONSE_HEADERS_POLICY_ID`. `DOMINIO_PUBLICO` ainda não existe (esperado: A8, depois do DNS). Nenhum segredo no repositório nem no environment. | API do GitHub (GET) |
| Proteção da `main` | 3 checks obrigatórios (lib, validação e build, integração em navegador real); administradores incluídos; sem force push. | API do GitHub (GET) |
| Bucket e CloudFront | Auditoria run `42809550459` (10/11, commit `50f3dc1`): 26 OK, 3 info, 0 falha. Bucket privado com OAC, política restrita à distribuição, `_releases/` negado, escrita única; distribuição implantada, HTTPS, cabeçalhos e função iguais aos versionados, 404 real, certificado ACM emitido (válido até 11/05/2027) e associado. | Log do workflow (leitura) |
| Role OIDC de deploy | A confiança OIDC foi provada só com a role de **auditoria**. A role de **deploy** nunca foi exercida: será provada na primeira publicação (COM-RELEASE-003-aws §2.4). Se o STS recusar, o deploy para antes de gravar qualquer arquivo. | Documentação + histórico de runs |
| Workflow de publicação | Nunca executado. Ordem: disparo na `main` com `PUBLICAR` → ref integrado à `main` → CI completo do commit → aprovação humana → artefato = commit → lib → **portão** → variáveis → OIDC → S3/CloudFront → verificação pública. | `deploy-producao.yml` |
| Rollback | Workflow pronto (`REVERTER`, opção "simular"), testado só contra AWS simulada (17/17). **Na primeira publicação não há release anterior para restaurar.** A proteção da V1 é a ordem das etapas: publicar e verificar no domínio do CloudFront **antes** do DNS (A7); com problema, não apontar o DNS e publicar a correção pelo mesmo fluxo. | `rollback-producao.yml`, COM-RELEASE-003-aws §6 |
| CI do candidato | O CI roda em PR e na `main`, não em push para `release/v1`: `5562f1c` ainda **não** passou pelo CI do GitHub (localmente: 306/306 e homologação 94/94). Ele roda ao abrir a PR. | `ci.yml` |
| Integração | `origin/main` (`50f3dc1`) é ancestral de `release/v1`: merge sem conflito. 8 commits, 36 arquivos. | git (leitura) |

**Conclusão:** nenhum problema técnico impede o deploy. Os dois pontos ainda não provados na prática (role de deploy e
rollback real) são cobertos pelo desenho do fluxo: a falha da role interrompe antes de gravar, e o DNS só muda depois da
verificação no domínio do CloudFront.

## 4. PR final (rascunho; não abrir ainda)

**Base:** `main` ← **head:** `release/v1` (commit final = o commit das aprovações sobre `5562f1c`).

**Título:** `release: Nekkora Commercial V1 (sem Bookings, e-mail e LinkedIn)`

**Descrição:**

```markdown
## Nekkora Commercial V1 — publicação inicial

Release única da V1 (NEKKORA-COM-GOLIVE-001). Configuração inicial: contato por e-mail e LinkedIn, sem Bookings,
sem Teams, sem WhatsApp e sem envio automático. Campanha de lançamento de 06/11/2026 a 06/01/2027.

### O que entra
- Condições comerciais: sem espera de 7 dias após a assinatura (C-02); reembolso integral na desistência antes da
  disponibilização para homologação (CO-11). A regra de 50% na desistência durante a homologação (C-04, commit
  1d0dc60) **foi retirada do site** em 5562f1c e continua só na minuta do contrato, **não aprovada**.
- Privacidade: registros de acesso [PV-12] (LOG-01 v2 ativo), local de armazenamento e possibilidade de tratamento
  fora do Brasil, bases legais (art. 7º, V e IX) e direito de oposição.
- Bookings desativado na publicação inicial (`agendamento.url` null); a aprovação PUB-20 e a validação da URL oficial
  continuam nos testes.
- Evidências E1–E5, LOG-01, revisão interna (sem parecer jurídico externo) e regulamento da campanha.

### Aprovações da titular (publicacao.json)
- [ ] PUB-17 textos comerciais: commit <sha>
- [ ] PUB-19 condições comerciais: commit <sha> (não aprova a cl. 10 do contrato)
- [ ] PUB-09 aviso de privacidade: commit <sha> (após a decisão sobre o F5)
- [ ] PUB-10 aviso de homologação desligado
- [ ] PUB-18 autorização de publicação

### Verificações
- [ ] CI desta PR verde (lib, validação e build, integração em navegador real)
- [ ] `npm run check`: 306/306
- [ ] Homologação 94/94 no commit final (artefato = HEAD)
- [ ] `node scripts/verificar-publicacao.mjs` sem bloqueios no commit final

### Depois do merge (cada etapa com autorização própria)
1. Tag `v1.0.0` no merge commit.
2. Deploy de produção (`ref: v1.0.0`, `PUBLICAR`) com aprovação no environment `production`.
3. Verificação no domínio do CloudFront.
4. DNS (A7), depois `DOMINIO_PUBLICO=https://nekkora.com` (A8) e nova verificação.

### Referências
- Checklist: docs/release/NEKKORA-COM-GOLIVE-001-V1-checklist.md
- Revisão interna (F1–F7, legítimo interesse, estado de F2–F5): docs/release/NEKKORA-COM-GOLIVE-001-revisao-interna.md
- Pré-liberação: docs/release/NEKKORA-COM-GOLIVE-001-pre-liberacao.md
- Evidências: docs/release/evidencias/golive-001/ (E1 Bookings, E2/E5 decisões, E3 M365, E4/LOG-01, e-mail, DNS antes)
- Auditoria AWS: run 42809550459

Sem parecer jurídico externo: a titular dispensou o parecer como condição interna em 10/11/2026. As obrigações legais
(LGPD, Marco Civil, CDC, transferência internacional) continuam valendo, e a decisão de 06/11/2026 está mantida.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Ordem para liberar sem retrabalho, depois da decisão sobre o F5:**
1. Titular aprova PUB-17, PUB-19 e PUB-09 → um commit em `release/v1` com só essas flags e os `$origem`.
2. Mesmo commit ou o seguinte: PUB-10 (`avisoHomologacao` false) e PUB-18, com autorização expressa.
3. `npm run check`, homologação no commit final e portão local sem bloqueios.
4. Abrir a PR acima → CI verde → merge autorizado → tag → deploy → DNS → A8.
