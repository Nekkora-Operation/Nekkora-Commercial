# NEKKORA-COM-008-C — Implementação comercial, Calculadora de Investimento e preparação para lançamento

**Data:** 28/10/2026 · **Branch:** `feat/com-008-c-commercial-readiness` (a partir de `main` @ `de5feda`) ·
**PR:** aberto para `main`, **sem merge**.

> **Nada foi publicado nem aprovado.** O portão de publicação continua **BLOQUEADO** (8 pendências, §8).
> `publicacao.json` não foi alterado: aprovações, datas da campanha, controlador e `avisoHomologacao` estão
> exatamente como na `main`. Nenhuma alteração em AWS, S3, CloudFront, DNS, Microsoft 365, Nekkora-lib, backend,
> Platform, Agent ou Framework. O PR #4 não foi tocado. A alteração local não commitada em
> `Nekkora-Commercial/src/content.ts` (com "−50%", AUD-03) foi preservada e **não** foi incorporada.

## 0. Pré-condições

| Verificação | Resultado |
|---|---|
| `main` remota | `de5feda` (merge do PR #9) — igual à baseline informada |
| CI da `main` | run `40742503109`, **sucesso** |
| Relatório COM-008-A | `053870c` (branch `docs/com-008-a-auditoria`), **incluído nesta branch sem alteração** (`90058c2`), como evidência histórica |
| Estado local | Pasta `Nekkora-Commercial` com `M src/content.ts` da titular: intocada. Trabalho feito num worktree separado |
| Contratos e testes existentes | Lidos antes da implementação (`precos.ts`, `config.ts`, portão, homologações) |
| Divergência entre documentos | `02-contrato-comercial.md` e `08-pendencias-publicacao.md` (COM-001) contradiziam decisões posteriores → marcados como **histórico**, prevalecendo as decisões da COM-008-B |

## 1. Classificação do que foi feito

### 1.1 Decisões comerciais aprovadas pela titular (COM-008-B) — usadas como estão

| Tema | Decisão |
|---|---|
| Campanha | 2 meses a partir da publicação oficial; vale a solicitação recebida durante a campanha; proposta com aceite em 7 dias corridos; preço individual; complexa sob orçamento |
| Pagamento | 50% após aprovação e formalização; 50% após homologação e aceite formal; entrega definitiva após a quitação; Pix inicialmente; gateway no futuro |
| Cancelamento | Integral antes do início; proporcional durante; possível retenção dos 50% após a homologação (desistência injustificada); restituições legais em descumprimento da Nekkora |
| Garantia | 30 dias adicionais propostos; defeitos atribuíveis à entrega; garantias legais preservadas |
| Várias automações | Classificação, escopo, preço e aceite próprios; juntas não viram complexa |
| Propriedade intelectual | Modelo A (licença; código específico utilizável e modificável; componentes proprietários preservados) |
| Textos | "Como chegamos a esses valores" (opção A); "Entrar" oculto; formulário também para Hosting |
| Privacidade | 6 meses (contatos sem contratação); 90 dias (reservas do Bookings); distinguir aceite, ciência e consentimento |
| Platform | Políticas de segurança, segredos, auditoria, relatórios, encerramento e consentimento (só backlog) |

### 1.2 Funcionalidades implementadas (no código, testadas)

1. **Simulador de Investimento — Nekkora Delivery** (NEKKORA-CALC-001), §2.
2. **Quatro estados da campanha** (vigente, futura, encerrada, pendente) nos cartões e no simulador, no fuso de Brasília.
3. **Formulário de avaliação** com tipo de solicitação (automação nova, hospedagem, infraestrutura). O CTA do Hosting
   abre com a hospedagem marcada, e o resumo da simulação pode ser incluído **opcionalmente**.
4. **Botão "Entrar" oculto.**
5. **Textos** revisados (§3) e aviso de privacidade em revisão (§4).
6. Correção de um defeito de layout antigo, a grade de cartões que transbordava (§6.3).

### 1.3 Funcionalidades apenas planejadas (documentadas, não implementadas)

- Pagamento online / gateway (minuta §2: "evolução futura").
- Backend de recebimento automático: continua desligado (`endpoint: null`, PUB-21).
- Retenção automática: não existe; o procedimento é manual (OPS-01).
- Tudo de [`docs/roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md`](../roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md).

### 1.4 Revisões jurídicas pendentes ⚖

JUR-01 a JUR-09 em [`COM-RELEASE-PENDENCIAS.md` §2a](COM-RELEASE-PENDENCIAS.md): pagamento e entrega após quitação,
homologação sem aceite tácito, cancelamento/arrependimento, garantia, propriedade intelectual e dados do cliente, base
legal, transferência internacional, encarregado, identificação do fornecedor e oferta vinculante. As minutas
[`docs/comercial/condicoes-comerciais-minuta.md`](../comercial/condicoes-comerciais-minuta.md) e
[`docs/comercial/privacidade-minuta.md`](../comercial/privacidade-minuta.md) estão marcadas **NÃO APROVADAS
JURIDICAMENTE**.

### 1.5 Homologações operacionais pendentes (titular)

- Bookings: lembrete de 2 h, cancelamento com liberação e abertura efetiva do Teams (PUB-20).
- `contato@nekkora.com` recebe mensagens de fora (REP-04).
- Texto proposto no Bookings (OPS-02), procedimento de retenção (OPS-01), "Data da solicitação" nas propostas (OPS-03),
  proposta-modelo (OPS-04).

### 1.6 Autorizações de publicação pendentes

PUB-13 (datas), PUB-09 (razão social e aviso), PUB-19 (condições), PUB-17 (textos), PUB-20 (agendamento), PUB-10
(aviso de homologação) e PUB-18 (publicação). **Nenhuma foi presumida.**

## 2. Simulador de Investimento (NEKKORA-CALC-001)

| Requisito | Implementação |
|---|---|
| Posição | Seção Preços, **logo abaixo dos cartões**, dentro do bloco `data-pricing` (único lugar onde preços podem aparecer) |
| Identidade e componentes | `Card`, `Button`, `Input`, `Icon`, `StatusRegion` da nekkora-lib 0.2.0 (sem alteração da lib); tokens `--nk-*`; temas claro e escuro |
| Controles | Simples, médias, complexas: botões − e +, campo numérico (com `role="spinbutton"` e setas ↑/↓), quantidade inicial 0, total selecionado visível |
| Proteção | Só dígitos (sem sinal, vírgula ou expoente); máximo 20 por categoria; vazio volta a 0; botões no limite ficam `aria-disabled` e sem efeito, mas continuam focáveis. Totais sempre inteiros seguros |
| Fonte dos preços | `src/precos.ts` (`PRICE_TABLE`, `simulate`): nenhum valor nem percentual digitado no componente ou nos textos (testado) |
| Cálculo | Total padrão, total de lançamento, economia promocional e percentual equivalente **truncado** em 2 casas |
| Exemplo obrigatório | 2 simples + 1 média → **R$ 6.500 → R$ 4.800**, economia **R$ 1.700**, **26,15%** (unitário e navegador) |
| "Calcular meu investimento" | O resultado só aparece com o clique (ou Enter num campo). Mudou a quantidade? O resultado some até um novo cálculo: nunca há valor desatualizado. "Limpar simulação" zera tudo |
| Complexas | Nunca têm valor. Só complexas: "esta simulação não mostra um valor". Com outras: "**Subtotal estimado**… não é o preço completo da contratação" |
| Campanha | Vigente: preços de lançamento e economia. Futura/encerrada: só o preço padrão, sem economia nem percentual. **Pendente** (datas não aprovadas): prévia **só** com `avisoHomologacao: true`, com "Nenhuma solicitação é elegível antes do início oficial". Sem o aviso e sem datas, só o preço padrão. Datas **não** foram preenchidas |
| Transparência | Aviso obrigatório, literal; "a economia… não é uma economia operacional comprovada"; ajuda "Não sabe a categoria da sua automação?" com link para os critérios. Sem ROI, horas economizadas ou classificação automática |
| Caminhos | "**Agendar uma conversa**" (URL oficial do Bookings, nova aba, `noopener noreferrer`) e "**Solicitar avaliação**" (formulário existente) |
| Resumo no formulário | Opcional (caixa **desmarcada**); aparece na etapa de confirmação antes de qualquer envio; nada é dito como "enviado" (o e-mail só abre o aplicativo) |
| Privacidade | Sem cadastro, sem requisição, sem `localStorage`/`sessionStorage`/cookie/IndexedDB (testado no código e no navegador) |
| Acessibilidade | Teclado completo, ordem de Tab, foco visível, resultado anunciado numa região viva (`role="status"`), axe sem violações (claro e escuro, 375/768/1280 px), contraste por pixels |

Capturas (Chromium, Firefox e WebKit) em `evidencias/simulador/` no artefato do CI: inicial, pendente (produção),
vigente, futura, encerrada, só complexas, misto, celular claro e escuro, tablet, desktop escuro, formulário com o resumo,
confirmação com a simulação e formulário do Hosting.

## 3. Textos comerciais (gerados em [`05-texto-comercial.md`](../com-001/05-texto-comercial.md))

| AUD | Antes | Agora |
|---|---|---|
| 04/06 | "…para propostas aprovadas de…" | "…para **solicitações de avaliação recebidas** de…"; "…conforme a categoria definida na avaliação. A proposta pode ser aceita em até 7 dias corridos da emissão." |
| 07 | "Complexa · pacotes"; "…ou várias automações contratadas em conjunto" | "Complexa"; "Processos ponta a ponta ou com várias integrações por API." |
| 13 | — | "Pode solicitar várias automações: cada uma tem categoria, escopo, preço e aceite próprios" |
| 16 | "50% na contratação e 50% na entrega, conforme a proposta" | "50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal" |
| 17/18 | — | "Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei" |
| 09 | "Por que os valores são baixos… Menos horas de levantamento e retrabalho…" | "**Como chegamos a esses valores**: processos padronizados e ferramentas internas… sem retirar etapas" |
| 10 | "Licenças ficam por conta do cliente… (…servidores)" | "**Licenças e infraestrutura**: … em regra, a contratação é do cliente… infraestrutura do próprio cliente ou, se contratado à parte, no Nekkora Hosting" |
| 19 | "Seis etapas. Nenhuma sem a sua aprovação."; "cada etapa mediante a sua aprovação" | "Seis etapas, com a sua aprovação nos pontos de decisão."; "A entrega só é concluída depois de… da sua homologação e do aceite formal" |
| §5.4 | "Homologação e aceite: … formaliza o aceite"; "Entrega e transferência" | Registro e correção de defeitos; "só é concluída com o seu aceite formal"; "**Entrega definitiva**: após o aceite e a confirmação do pagamento…" |
| 18 | "Garantia após a entrega, salvo se prevista" | "Suporte, sustentação e garantia adicional após a entrega, salvo se previstos" + em "Definido em proposta": "Correção de defeitos… além das garantias legais" |
| 20 | "Entrega e transferência conforme contratado" | "Entrega definitiva com documentação e dependências identificadas, nos termos do contrato" |
| 25 | "Conte qual processo você quer automatizar" | "Conte o que você precisa: uma automação nova, a hospedagem de uma automação existente ou infraestrutura…" + escolha do tipo |
| 26 | Botão "Entrar" indisponível | Oculto |

## 4. Privacidade (aviso do site, em revisão)

CNPJ no aviso (razão social **não** inventada) · Microsoft Teams no item do Bookings · "Esta página" não usa cookies; o
simulador não guarda nem envia nada; o Bookings segue as regras da Microsoft · "Por quanto tempo guardamos" (6 meses /
90 dias, sem afirmar eliminação automática) · "Onde os dados são processados" (Microsoft e AWS podem processar fora do
Brasil) · atendimento sem consentimento; consentimento só para outro uso, à parte · direitos do art. 18 completos.
Texto proposto para o Bookings (ciência, sem "telefone", com Teams): `privacidade-minuta.md` §4, **para a titular
configurar** (o M365 não foi alterado).

## 5. Documentação

| Documento | Mudança |
|---|---|
| `docs/release/NEKKORA-COM-008-A-auditoria.md` | Incluído como estava (evidência histórica) |
| `docs/com-001/03-matriz-alegacoes.md` | Atualizada (PR-03..PR-08, CO-03/07/08, A-05/09/13/14, D-01/02/04, PV-03/05..10 com a numeração do código, K-07/09/10, X-03; seções removidas marcadas) |
| `docs/com-001/05-texto-comercial.md` e a variante da COM-RELEASE-005 | Regenerados (`npm run texto`) |
| `docs/release/COM-RELEASE-PENDENCIAS.md` | PUB-13/16/17/19/09 atualizados; JUR-01..09 e OPS-01..04 |
| `docs/comercial/condicoes-comerciais-minuta.md` | **Novo** — minuta (não aprovada juridicamente), com a comprovação da data da solicitação (§8.1) |
| `docs/comercial/privacidade-minuta.md` | **Novo** — minuta (não aprovada juridicamente) e texto do Bookings |
| `docs/roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md` | **Novo** — PLATFORM-SECURITY/SECRETS/AUDIT/REPORTS/PRIVACY/CONSENT-001 |
| `02-contrato-comercial.md`, `08-pendencias-publicacao.md` | Marcados como **histórico** (AUD-31) |
| `COM-RELEASE-005-privacidade.md` | Nota apontando para a nova minuta e o estado do Bookings |

## 6. Testes

### 6.1 Testes novos

- `scripts/testes/simulador.test.mjs` (12 testes, no `npm test`): itens 1–13, 16, 17, 19 e 20 da missão.
  Inclui uma varredura de todas as 440 combinações de simples × médias (o percentual é sempre truncado e nunca chega a 50%).
- `scripts/homologacao-simulador.mjs` (**40 verificações por navegador**, no CI, Chromium, Firefox e WebKit):
  integração, estado inicial, exemplo obrigatório, quatro estados da campanha com relógio fixo, complexas, recalcular,
  limpar, entradas inválidas, teclado e ordem de Tab, responsivo (375/768/1280), sem armazenamento, sem envio externo,
  axe, resumo opcional no formulário, consistência com os cartões, Bookings oficial e formulário do Hosting.

| # (missão §12) | Onde |
|---|---|
| 1–8, 13 | `simulador.test.mjs` + `homologacao-simulador.mjs` (`calculo-exemplo-obrigatorio`, `so-complexas…`, `protecao…`) |
| 9–12 | `simulador.test.mjs` (fuso de Brasília) + `campanha-*`, `datas-pendentes-previa-sem-elegibilidade` |
| 14 | `teclado-completo`, `ordem-de-tab` |
| 15 | `responsivo-sem-rolagem-horizontal:*` |
| 16–17 | `simulador.test.mjs` (código) + `sem-armazenamento:*`, `sem-envio-externo:*` |
| 18 | `formulario-recebe-resumo-opcional`, `resumo-so-com-a-escolha-e-revisado-antes` |
| 19 | `simulador.test.mjs` + `consistente-com-os-cartoes` |
| 20 | `simulador.test.mjs` (aprovações, aviso, campanha, controlador, endpoint) + portão (§8) |

### 6.2 Testes existentes atualizados (sem enfraquecer)

| Teste | Mudança | Por quê |
|---|---|---|
| `precos.test.mjs` (item 7) | Confere a nova frase do pagamento e **acrescenta** que ela é única e não fala em desconto | Decisão AUD-16 |
| `homologacao.mjs` | Condição da campanha com "solicitadas" **e** "7 dias corridos"; condições com o novo pagamento **e** "várias automações"; "Entrar" → `entrar-oculto-sem-area-de-clientes` (procura qualquer controle de acesso) | COM-008-B |
| `homologacao-canais.mjs` | Frases da vigência e do pagamento atualizadas | COM-008-B |

### 6.3 Defeitos encontrados pela homologação e corrigidos

1. **Cartões cobrindo o rodapé:** a grade `.cards--poster` usava `gap: max(16px, 2%)`; na vertical, o percentual
   sobre uma lista de altura indefinida fazia o último cartão sair do grid. Com 8 itens no aviso de privacidade, ele
   passou a cobrir o rodapé no celular (`contraste-por-pixels`, 2,57:1). Correção: espaço vertical fixo de 20 px.
2. **Link de ajuda do simulador** com o acento sobre o cartão: 3,78–4,13:1. Correção: cor do texto, sublinhado.
3. **Corrida no teste do WebKit** (resumo lido antes do efeito do React): o teste agora espera o bloco.

### 6.4 Resultados

Pipeline local equivalente ao CI (`lib` + `commercial` + `integracao`, sem preview e sem AWS), no commit `6c0566f`
([`evidencias/com-008-c/pipeline-local.txt`](evidencias/com-008-c/pipeline-local.txt)):

| Etapa | Resultado |
|---|---|
| nekkora-lib reconstruída a partir do commit registrado | OK — mesmo sha256 (`1a2e6145…`) |
| `npm ci` · typecheck | OK |
| `npm test` | **232/232** (220 anteriores + 12 do simulador) |
| Build de produção · preços do artefato = código · política do CloudFront | OK |
| Portão de publicação | **BLOQUEADO** (8 pendências, §8) — esperado |
| Site servido como no CloudFront (integridade, cabeçalhos, 404) | OK |
| Página (`homologacao.mjs`) | **90/90** no Chromium, Firefox e WebKit |
| Simulador e formulário (`homologacao-simulador.mjs`) | **120/120** (40 × 3 navegadores) |
| Jornada por e-mail · WhatsApp | **96/96** · **111/111** |
| Agendamento e envio automático com backend local | **144/144** |

A primeira rodada (commit `23ba249`) reprovou em `contraste-por-pixels` (§6.3, itens 1 e 2) e em uma leitura do teste
no WebKit (item 3). Corrigido em `6c0566f`; nenhuma verificação foi removida ou afrouxada.

Capturas (Chromium; celular escuro também no WebKit) em [`evidencias/com-008-c/`](evidencias/com-008-c/), com o resumo
[`resumo-simulador.md`](evidencias/com-008-c/resumo-simulador.md). O conjunto completo dos três navegadores vai no
artefato `evidencias-<commit>` de cada run do CI.

## 7. Riscos e observações

- **Prévia sem datas:** na versão de homologação (a única possível sem datas), o simulador mostra preços de lançamento
  identificados como prévia. Sem `avisoHomologacao`, mostra só o preço padrão. O portão bloqueia a publicação sem datas.
- **Aba aberta na virada da campanha:** os cartões avaliam a campanha no carregamento; o simulador, a cada cálculo.
- **"Data da solicitação" por e-mail:** vale o recebimento na caixa, não o clique no site (minuta §8.1).
- **Oferta vinculante (CDC, art. 30):** os valores do simulador são estimativas por categoria declarada pelo
  visitante; a categoria é confirmada na avaliação. O aviso obrigatório está ao lado do resultado ⚖ (JUR-09).

## 8. Portão de publicação

`node scripts/verificar-publicacao.mjs --dist dist` → **PUBLICAÇÃO BLOQUEADA — 8 pendências**: PUB-20, PUB-13, PUB-09
(razão social), PUB-19, PUB-17, PUB-09 (aviso), PUB-18 e PUB-10 — as mesmas da `main`. O portão continua bloqueado até
a aprovação expressa da titular.
