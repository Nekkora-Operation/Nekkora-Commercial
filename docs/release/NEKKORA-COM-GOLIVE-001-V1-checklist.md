# NEKKORA-COM-GOLIVE-001 — Checklist final para liberar a V1

**Data:** 06/11/2026. A titular decidiu priorizar a publicação, mas isso **não autoriza** merge, flags, deploy nem DNS.
Cada uma dessas ações está marcada abaixo como **[AUTORIZAR]**.

Este checklist reaproveita o [relatório GOLIVE-001](NEKKORA-COM-GOLIVE-001.md): auditoria AWS, DNS e runbook em §6.
Também reaproveita o [relatório CONTRACT-001-R1](NEKKORA-COM-CONTRACT-001-R1.md).

**Parecer de hoje: NO-GO para publicar.** Há 4 bloqueios concretos fora do código:

1. o texto do Bookings;
2. o teste do e-mail;
3. a LOG-01;
4. a JUR-07.

Depois deles vêm as 3 aprovações e a PR de liberação. A parte técnica está pronta.

## 1. Estado verificado hoje

| Item | Resultado | Evidência |
|---|---|---|
| PR #16 (`8d0e437`) e PR #17 (`9f1745b`) | abertas e `MERGEABLE`; CI com 5 de 5 checks verdes nas duas | `gh pr checks 16`, `gh pr checks 17` |
| Integração #16 + #17 sobre a `main` | só a linha `test` do `package.json` conflita. Resolução: manter `diagnostico-dns.test.mjs` **e** `condicoes-delivery.test.mjs`. `npm run check` dá **293 de 293**, preços 5 de 5 e CSP ok | worktree temporária, 06/11/2026 |
| Portão no build integrado | **BLOQUEADO** por PUB-19, PUB-17, PUB-09, PUB-18 e PUB-10 | `verificar-publicacao.mjs --dist dist` |
| E-mail `contato@` (DNS) | MX `nekkora-com.mail.protection.outlook.com`, SPF único, DMARC `p=none` | DoH Cloudflare |
| E-mail (recebimento real) | **não comprovado**: exige envio de uma conta externa | — |
| Bookings | página e serviço no ar, mas o **texto diverge** do site (§2, item 1) | [evidência](evidencias/golive-001/bookings-texto-publico-2026-11-06.md) |
| Campanha | `06/11/2026 a 06/01/2027`. **Começa hoje e a publicação não é hoje** | `publicacao.json` |
| Fora da V1, e assim continua | envio automático (`endpoint: null`), WhatsApp e Instagram (`null`), "Entrar" oculto, Hosting "em avaliação", sem gravação, contratação só por proposta e contrato (fora do site) | `publicacao.json`, `src/content.ts` |

## 2. Bloqueios concretos e ação necessária

| # | Bloqueio | Ação exata | Responsável | Evidência que fecha |
|---|---|---|---|---|
| 1 | **Bookings × site (OPS-02 / CTL-03).** O Bookings diz que a reunião "poderá ser gravada"; o site diz "Conversa sem gravação". Também faltam a base legal, o processamento fora do Brasil, a retenção de 90 dias e o alerta sobre senhas | No Microsoft 365 → Bookings → serviço "Conversa inicial — Nekkora Delivery": **(a)** na descrição, trocar a frase sobre gravação por "Nesta fase, a Nekkora não grava as conversas comerciais."; **(b)** trocar o bloco "Privacidade e gravação de reuniões" pelo texto de [`privacidade-minuta.md` §4](../comercial/privacidade-minuta.md), com a caixa "Li e entendi"; **(c)** deixar "Empresa" opcional | Titular | Repetir a conferência só de leitura (Claude executa) |
| 2 | **Recebimento do e-mail (CTL-05 / REP-04)** | De uma conta **fora** do tenant, enviar mensagem para `contato@nekkora.com`. Confirmar que chegou na Caixa de Entrada (não na quarentena) e responder | Titular | Data e hora, domínio do remetente e resposta recebida |
| 3 | **LOG-01 (Marco Civil, art. 15)** | Ver §3.1. Decisão escrita. Na opção recomendada, a titular ativa os logs na AWS e Claude ajusta o texto do aviso | Titular (decisão e AWS) · Claude (texto) | Decisão em `$origem` + nova auditoria AWS sem falha |
| 4 | **JUR-07 (LGPD, art. 33)** | Ver §3.2. Confirmar a região do tenant e decidir por escrito | Titular | Captura da região + decisão escrita |
| 5 | **Datas da campanha (PUB-13)** | Decidir **antes** da PUB-17: manter as datas ou passar para "data real da publicação + 2 meses" (regra da COM-008-B). Claude só altera com as datas escritas pela titular. Ver §3.3 | Titular | Decisão com as duas datas |
| 6 | **PUB-17, PUB-09, PUB-19** | Aprovar sobre o **mesmo commit candidato**, depois dos itens 1 a 5 (ver §4) | Titular | Declaração citando o commit |
| 7 | **PUB-10, PUB-18** | PR de liberação: `avisoHomologacao: false`, `publicacao: true` e as três aprovações, cada uma com `$origem` | Claude prepara · Titular **[AUTORIZAR]** merge | CI verde e portão "LIBERADA" |

Não bloqueiam a V1, e por isso não estão no caminho:

- C-01 a C-12, JUR-01 a JUR-05 e LIC-02 bloqueiam a **primeira contratação**, não o site.
- OPS-01 (primeira execução da retenção) fica para até 7 dias após o lançamento.
- OPS-09 e OPS-10 só condicionam os prazos do aviso. O texto atual não depende deles.
- Divergência documental do CTL-01 (Teams): para fechar o item 1, a titular só precisa confirmar que a gravação está
  desligada na política `Nekkora-Commercial`.

## 3. Soluções mínimas

### 3.1 LOG-01 — **continua bloqueando**

O art. 15 obriga a pessoa jurídica que explora uma aplicação de internet com fins econômicos a guardar os registros
de acesso por 6 meses. Um site comercial de PJ se enquadra. A opção (b), dizer que o artigo não se aplica, tem
fundamento fraco e **não é recomendada**.

**Recomendação: opção (a).**

- **Configuração na AWS, feita pela titular:**
  - ativar o *standard logging* do CloudFront na distribuição `E3TZD2P6FOEWWR`, com destino S3. Usar a versão 2,
    que entrega no S3 sem exigir ACLs no bucket;
  - o bucket de logs é novo, privado, fica em `sa-east-1`, tem Block Public Access e não é o bucket do site;
  - regra de ciclo de vida: expirar os objetos em **190 dias** (6 meses mais margem);
  - acesso só pela titular.
  - Custo esperado: centavos por mês no volume da V1.
- **Na auditoria:** C13 passa de OK para "info". Isso não é falha.
- **Texto, preparado por Claude numa PR antes da PUB-17 e da PUB-09:**
  - um item novo no aviso: "Registros de acesso ao site (endereço IP, data e hora e página acessada) são guardados
    por 6 meses, sob sigilo, por exigência legal (Marco Civil da Internet, art. 15; LGPD, art. 7º, II)";
  - a linha "Entrega do site" da minuta muda de acordo.

### 3.2 JUR-07 — **continua bloqueando a aprovação do aviso (PUB-09)**

Não é preciso contratar nada novo. O caminho mínimo, sem afirmar mecanismo que não existe:

1. **Titular:** no Centro de administração do Microsoft 365 → Configurações → Perfil da organização → **Local dos
   dados**, capturar a região de Exchange, Teams e SharePoint/OneDrive. A AWS já está confirmada: S3 em `sa-east-1`.
   Os logs da opção 3.1 também ficariam em `sa-east-1`.
2. **Se a região for o Brasil:** os dados armazenados ficam no país, e a entrega pelo CloudFront é coleta
   internacional, não transferência (Res. 19/2024, Anexo I, art. 6º). O que pode sobrar são os acessos de suporte e
   de subprocessadores dos provedores. O art. 33, IX, só serve para os fluxos com base no art. 7º, II e V: quem
   contrata em nome próprio e os registros de acesso. Ainda assim, há o risco de "necessário" ser lido de forma
   estrita. Os contatos de **representantes de empresa** têm base no art. 7º, IX, que o art. 33, IX, não cobre, e hoje
   **não têm mecanismo** (JUR-07 §2, correção R1).
3. **Decisão escrita da titular, com parecer:** o mecanismo de cada fluxo (JUR-07 §3, itens 2 a 5). Aceitar o risco
   não é opção para os fluxos com base no IX.
4. **Se a região não for o Brasil:** sem CPC brasileira verificável, a JUR-07 **continua impeditiva**. A saída é
   parecer jurídico ou mudança de configuração.

A decisão é da titular. Este documento não declara o ponto juridicamente resolvido.

### 3.3 Datas da campanha

- **Se forem mantidas (06/11/2026 a 06/01/2027):** a página publicará um período que começou antes de o site existir,
  e o prazo efetivo fica menor que os dois meses aprovados.
- **Se forem ajustadas:** muda o texto visível. Os testes que fixam as datas também precisam ser atualizados na mesma
  PR, porque fazem isso de propósito para exigir autorização:
  - `condicoes-delivery.test.mjs` R1-27 (linhas 254 e 499);
  - `simulador.test.mjs` (linhas 129 a 133 e 219).

## 4. Sequência exata

| Passo | O quê | Quem | Autorização |
|---|---|---|---|
| 1 | Itens 1 a 5 do §2 (Bookings, e-mail, LOG-01, JUR-07, datas) | Titular | — |
| 2 | Merge da PR #16. Depois, atualizar a PR #17 com a `main` resolvendo o `package.json` como no §1, e esperar o CI verde | Titular · Claude resolve o conflito | **[AUTORIZAR]** os dois merges |
| 3 | PR de texto: item de logs (3.1), datas (3.3) se mudarem, e `05-texto-comercial.md` regenerado. CI verde e merge | Claude · Titular | **[AUTORIZAR]** merge |
| 4 | Aprovações PUB-17, PUB-09 e PUB-19 sobre o commit resultante, citando o SHA. **Nenhum texto muda depois disso** | Titular | declaração expressa |
| 5 | PR de liberação: as flags do §2, item 7, e `version` 1.0.0. CI verde, merge e tag `v1.0.0` | Claude · Titular | **[AUTORIZAR]** merge e tag |
| 6 | Deploy: Actions → "Deploy de produção", `main`, `ref=v1.0.0`, `PUBLICAR`, aprovação no environment | Titular | **[AUTORIZAR]** deploy |
| 7 | Validação no CloudFront: `verificar-site.mjs` verde; sem a faixa de homologação; preços e datas corretos | Titular · Claude confere | — |
| 8 | DNS na Cloudflare: 2 CNAMEs (`@` e `www`) → `dnl1wnnmoqhaj.cloudfront.net`, **DNS only**, TTL Auto. Não mexer em nenhum outro registro | Titular | **[AUTORIZAR]** DNS |
| 9 | `diagnostico-dns.mjs --fase depois` (M01 a M07 = Microsoft 365 intacto); `verificar-site.mjs` no domínio; homologação pública; e-mail e Bookings no ar; `DOMINIO_PUBLICO` no environment | Claude · Titular | variável **[AUTORIZAR]** |
| 10 | Registrar data e hora da publicação e guardar as evidências em `evidencias/golive-001/` | Claude | — |

Os comandos e os critérios para abortar estão no [runbook §6.2 a §6.7](NEKKORA-COM-GOLIVE-001.md#6-runbook--primeira-publicação-do-commercial-v1).

**Rollback da primeira publicação:** excluir os **dois** CNAMEs do site. O Microsoft 365 não é afetado. Depois,
corrigir com nova PR e novo deploy. Só em emergência: desativar a distribuição no console do CloudFront. O workflow
"Rollback de produção" só passa a valer a partir da segunda release (`rollback.mjs` recusa quando não há release
anterior).

## 5. Atualização — decisões da titular (06/11/2026, segunda rodada)

| Tema | Decisão | O que foi preparado | Estado |
|---|---|---|---|
| Campanha | mantém a regra de dois meses a partir da publicação; datas quando a janela de deploy estiver definida | [procedimento e lista de arquivos](NEKKORA-COM-GOLIVE-001-campanha-datas.md) | datas atuais **não alteradas** |
| LOG-01 | standard logging v2, campos mínimos, bucket privado, retenção documentada; AWS só com autorização específica | [`deploy/aws/logs/`](../../deploy/aws/logs/README.md) (política, ciclo de vida de 190 dias, entrega com `date time c-ip c-port x-host-header`), texto [PV-12] do aviso, minuta §6, mensagem da C13 | **preparado, não aplicado** |
| JUR-07 | verificar regiões e transferências; o Brasil não basta | [análise e solução mínima](NEKKORA-COM-GOLIVE-001-JUR-07.md) | **continua impeditiva** |
| Bookings | reconferir depois da correção | `node scripts/conferir-bookings.mjs --saida <pasta>` (12 regras, sem reserva) + 3 testes | hoje: **6 falhas** |
| E-mail | registrar o teste externo | [roteiro e registro](evidencias/golive-001/email-recebimento-externo.md) | **não executado** |
| PRs #16 e #17 | integrar preservando os dois testes e o portão | PR #18 (rascunho): `main` + #16 + #17, conflito do `package.json` resolvido | ver CI da PR #18 |

## 6. Lista final para publicar a V1 (atualizada na R2)

Roteiros: [evidências da titular](NEKKORA-COM-GOLIVE-001-evidencias-titular.md) ·
[integração #17 → #19](NEKKORA-COM-GOLIVE-001-R2-integracao.md) · [LOG-01](../../deploy/aws/logs/README.md) ·
[JUR-07 §4](NEKKORA-COM-GOLIVE-001-JUR-07.md) · [datas](NEKKORA-COM-GOLIVE-001-campanha-datas.md).

**Evidências (titular executa; Claude registra e confere):**

- [ ] **E5 — Teams:** gravação e transcrição desligadas na política `Nekkora-Commercial` (CTL-01). Vem **antes** do
      E1.
- [ ] **E1 — Bookings** corrigido. `conferir-bookings.mjs` com **12 de 12**: as 11 regras mais a B12, da caixa de
      ciência.
- [ ] **E2 — E-mail externo** recebido na Caixa de Entrada e respondido.
- [ ] **E3 — Local dos dados** do Microsoft 365 (captura do cartão).
- [ ] **E4 — Logs v2** ativos e conferidos pelos 7 critérios do README §4.

**Decisões escritas (titular):**

- [ ] **D1 — JUR-07 / JUR-06, com parecer:**
  - respostas às perguntas da JUR-07 §4.5;
  - o mecanismo adotado em cada fluxo;
  - a redação do aviso.

  Aceitar o risco **não** resolve os fluxos com base no IX.
- [ ] **D2 — Datas da campanha.** `scripts/campanha-datas.mjs` está pronto e só simula sem a autorização.

**Autorizações expressas (titular), nesta ordem:**

1. [ ] **A1 — AWS:** aplicar `deploy/aws/logs/README.md` §3.
2. [ ] **A2a — #17:** push do merge da `main` (passo 1 da integração). **A2b:** merge da #17 com o CI verde.
3. [ ] **A2c — #19:** realinhar e reorganizar (passo 3), base `main`, e fazer o merge com o CI verde. Só o grupo A
       entra.
4. [ ] **A3 — PR de texto** (`docs/v1-texto-publico`):
   - o [PV-12], só depois do E4;
   - o texto da JUR-07, só depois do D1;
   - as datas, com o D2.
5. [ ] **A4 — Aprovações sobre o mesmo commit:** PUB-17, PUB-09 e PUB-19.
6. [ ] **A5 — PR de liberação** (`publicacao: true`, `avisoHomologacao: false`, aprovações com `$origem`) e a tag
       `v1.0.0`.
7. [ ] **A6 — Deploy** de produção (aprovação no environment).
8. [ ] **A7 — DNS:** os 2 CNAMEs na Cloudflare, DNS only.
9. [ ] **A8 — Variável** `DOMINIO_PUBLICO`. Em seguida, repetir o E1, porque o link `#privacidade` passa a funcionar.

Sequência técnica, critérios de aborto e rollback: §4 deste checklist e runbook §6 do relatório GOLIVE-001.
