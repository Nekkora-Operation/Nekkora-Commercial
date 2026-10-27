# COM-RELEASE-005 — Relatório técnico

**Data:** 22/10/2026 · **Branch:** `feat/com-release-005-leads-bookings` (a partir de `feat/com-release-003-aws` @
`e937e65`) · **Código:** commit `3ed9f18` · **PR:** direcionado a `feat/com-release-003-aws`, para revisão isolada e sem merge · **Evidências:**
[`evidencias/com-release-005/`](evidencias/com-release-005/).

Navegadores: Chromium 153.0.8010.12, Firefox 155.0 e WebKit 26.6 (Playwright 1.63.0), Windows 11. Tudo local: nada foi
criado na AWS, no Microsoft 365 ou na Cloudflare. Nenhum DNS foi alterado, nenhum e-mail real foi enviado e nenhum merge
foi feito.

## 1. COM-005-A — o "−50%" no cartão da automação média (D01)

### 1.1 Origem: não era o código do PR #6

A tela observada vinha de um **servidor de desenvolvimento antigo**, aberto em outra pasta e em outra branch:

| Evidência | Resultado |
|---|---|
| Processo na porta 5173 | `vite` rodando da pasta **`C:\Users\nicol\nekkora\Nekkora-Commercial`** (o checkout principal), **não** do worktree da versão candidata |
| Branch daquela pasta | `feat/commercial-modelo-c` @ `5f089e6`, a do modelo C, anterior à COM-RELEASE-003 |
| Alteração não commitada nessa pasta | `src/content.ts` com **valores digitados à mão**: `from: 'R$ 3.500', to: 'R$ 2.800', discount: '−50%'` (e `'R$ 1.500' → 'R$ 1000'`, também com `−50%`). É a alteração que restou do commit local desfeito no REP-03 (COM-RELEASE-003 §6), que ficou como mudança não commitada para a titular decidir |
| O que o servidor 5173 entrega ao navegador | `discount: "−50%"` (`curl http://localhost:5173/src/content.ts`) |
| Captura daquela tela | [`causa-raiz/antes-…5173….png`](evidencias/com-release-005/causa-raiz/antes-servidor-dev-5173-pasta-Nekkora-Commercial.png): R$ 3.500 riscado, **R$ 2.800** e **−50%**, exatamente o descrito |
| Build antigo daquela pasta (`dist/`, 15/10) | `verificar-precos-artefato`: **5/5 falhas** (`−50% −50%` fixos, sem a tabela oficial, sem `release.json`) |
| Versão candidata (esta branch e o PR #6) | Selo **calculado** (`priceFacts` → `−33,33%` e `−20%`). `verificar-precos-artefato` 5/5 OK. [Captura](evidencias/com-release-005/causa-raiz/depois-build-candidato.png) |

Comandos e saídas: [`causa-raiz/comandos.txt`](evidencias/com-release-005/causa-raiz/comandos.txt). Nada foi
alterado naquela pasta nem no processo 5173: apagar a mudança ou parar o servidor é decisão da titular (REP-05).

Também foram descartados:

- **Badge da Nekkora-lib:** só exibe o texto recebido, sem cálculo próprio.
- **Cache do navegador:** o servidor de desenvolvimento serve o código atual daquela pasta. O problema era a pasta, não
  o cache.
- **CloudFront:** nada publicado ainda.

### 1.2 O que mudou para que isso não se repita

1. **O build aparece na tela.** O aviso "Versão para homologação" do rodapé agora mostra o commit (`build e937e65`) e
   avisa "com alterações locais" e "servidor de desenvolvimento". A tela antiga não tem esse texto, e só essa
   ausência já denuncia que é outra versão.
2. **Código-fonte × artefato** (`npm run verificar:precos`, também no CI, depois do build):
   - o bundle contém exatamente a `PRICE_TABLE` de `src/precos.ts`;
   - nenhum percentual `−NN%` digitado;
   - nenhum `discount: '…'`;
   - o `release.json` tem o commit em disco.
3. **Valores renderizados** em cada combinação (`scripts/homologacao.mjs`, 3 navegadores × 2 temas × 4 larguras):
   - `precos-renderizados`: valores, percentual e economia lidos da tela (`data-price`), comparados com a tabela oficial
     **digitada no teste**, que por sua vez é conferida com `src/precos.ts` antes de abrir qualquer navegador;
   - `precos-padrao-riscado`: `<s>` com `text-decoration: line-through`, visível;
   - `precos-sem-percentual-inconsistente`: só `−33,33%` e `−20%` nos selos;
   - `artefato-corresponde-ao-codigo`: o `release.json` servido, o HEAD do repositório e o commit no rodapé coincidem.
4. **Teste estático** (`precos.test.mjs`): nenhum `−NN%` nem `discount:` em `src/`. O selo é
   `−{t.price.percentLabel}`.

Tabela, economia (R$ 500 e R$ 700), percentuais (33,33% truncado e 20%) e a condição 50% + 50% **não mudaram**.

**Capturas dos cartões**, em 3 navegadores × 2 temas × celular, tablet e desktop (18 imagens):
[`precos-chromium/`](evidencias/com-release-005/precos-chromium/),
[`precos-firefox/`](evidencias/com-release-005/precos-firefox/) e
[`precos-webkit/`](evidencias/com-release-005/precos-webkit/).

## 2. O que foi implementado

| Entregável | Onde |
|---|---|
| D01 | §1 acima; `scripts/verificar-precos-artefato.mjs`, `src/sections/Footer.tsx`, `vite.config.ts` (`__NEKKORA_BUILD__`) |
| D02 | `src/agendamento.tsx`, `config.ts` (`isBookingsUrl`, `BOOKINGS_URL`), Hero, Contato e diálogo; portão PUB-20; [leads §1 e §5](COM-RELEASE-005-leads.md) |
| D03 | `src/sections/Contact.tsx` (modo `api`: revisão → enviando → recebida/falha, mesmo id na nova tentativa, dados preservados, alternativa por e-mail), `src/envio.ts`, `src/desafio.tsx` |
| D04 | `api/solicitacoes/*` (contrato, abuso, idempotência, SES, Lambda), `scripts/api-local.mjs`, IAM em `deploy/aws/solicitacoes/` |
| D05 | [leads §4](COM-RELEASE-005-leads.md): Graph × SES → **SES** |
| D06 | [COM-RELEASE-005-privacidade.md](COM-RELEASE-005-privacidade.md); aviso em `content.ts → PRIVACY`; matriz PV-05..07, K-07, K-08 |
| D07 | §3 abaixo |
| D08 | [leads §5 a §7](COM-RELEASE-005-leads.md): Bookings, provisionamento e custos |

A CSP continua por hash. Origens externas (API e Turnstile) entram **só** quando configuradas, a partir do
`release.json`, e são conferidas pelo portão, pelo deploy e pela homologação (`--politica-do-build`). **A política de
produção não mudou:** `politica-cabecalhos.json` é idêntica à da COM-RELEASE-003.

## 3. Testes (D07)

| Conjunto | Resultado | Cobre |
|---|---|---|
| Unitários (`npm test`) | **127/127** | preços 7 · portão 40 (PUB-20/21: URL oficial, outra organização, `.example`, http, página inicial, endpoint http/caminho, sem desafio, chave de teste, sem autorização, CSP com e sem as origens) · publicação/rollback 17 · auditoria 7 · CloudFront 8 · **backend 48** |
| Backend (`api-solicitacoes.test.mjs`, 48) | **48/48** | contrato (24 recusas: tipo, tamanho, JSON, UTF-8, campos extras, injeção de cabeçalho, limites), CORS, rota/método, 202 com remetente/destinatário fixos, sem eco, idempotência (duplicada, conflito, em andamento), falha temporária e permanente do SES e nova tentativa, erro interno sem detalhes, armadilha, tempo mínimo, limite por IP, teto diário com alerta, desafio recusado/indisponível, Turnstile (corpo, idempotency_key, hostname, rede), **logs sem dados pessoais**, SES e DynamoDB com clientes simulados, Lambda montado ponta a ponta, configuração inválida, **IAM mínimo** |
| `verificar-precos-artefato` | **5/5** (candidata) · 5/5 falhas no build antigo | §1.2 |
| Página (`homologacao.mjs`) | **90/90** em Chromium, Firefox e WebKit | inclui as novas `precos-renderizados` e `precos-padrao-riscado` (×8 cada), `precos-sem-percentual-inconsistente`, `artefato-corresponde-ao-codigo`, `agendamento-conforme-configuracao` (sem URL: nenhum botão) e o restante da COM-RELEASE-003 |
| Jornada por e-mail (`homologacao-canais`, `NEKKORA_CANAL=email`) | **96/96** (3 navegadores) | + `agendamento-de-outra-organizacao-recusado` |
| Jornada por WhatsApp | **111/111** | sem regressão |
| **Agendamento + envio automático** (`homologacao-leads.mjs`) | **141/141** (47 por navegador) | ver abaixo |

**Agendamento**, verificações `agendamento-*`:

- botões no topo, no contato e no diálogo, com a URL configurada;
- nova aba sem opener e sem Referer;
- nome acessível "(abre o Microsoft Bookings em outra aba)" e foco visível;
- abertura pelo teclado;
- sem `window.open`;
- Bookings fora do ar sem quebrar a página;
- nenhuma afirmação de reunião marcada;
- celular a 375 px;
- axe nos dois temas.

**Envio automático**:

- e-mail obrigatório e armadilha fora do foco e do leitor de tela;
- nada enviado antes da confirmação, e o envio espera o desafio;
- estado "Enviando" (`aria-busy` e anúncio);
- "Recebida" só com a confirmação do servidor, com o protocolo igual ao da caixa simulada;
- um único POST mesmo com duplo clique;
- dados só no corpo, sem cookie.

**Falhas**:

- entrega (502): dados preservados e alternativa por e-mail; a nova tentativa usa o **mesmo id** e gera **uma**
  entrega;
- rede: "Voltar e editar" preserva os dados;
- limite (429);
- desafio recusado: o token é descartado, o desafio é refeito e o envio passa;
- envio rápido demais: recusado sem e-mail;
- Turnstile indisponível: sem envio, com alternativa;
- celular e axe em revisão, recebida e falha;
- **logs do backend sem dados pessoais**.

**Defeitos encontrados e corrigidos na homologação:**

1. Depois de uma recusa do desafio, o token já usado continuava valendo, e "Tentar novamente" ficava habilitado com um
   token inválido. Agora o token é descartado e o botão espera um novo.
2. WebKit no celular: o React reaproveitava o botão "Voltar" (desabilitado durante o envio) como "Fechar", e a
   transição de cor da lib deixava o contraste abaixo do AA no instante da medição. Os botões de cada etapa agora têm
   chave própria.
3. Com o Turnstile fora do ar, a mensagem dizia "use o e-mail abaixo" sem mostrar o e-mail na revisão. Agora mostra.

## 4. Critérios de aceite (§11)

| Critério | Situação |
|---|---|
| Descontos matematicamente corretos | **Atendido**: `precos.test` + `precos-descontos-coerentes` sobre os valores exibidos |
| Nenhum selo de preço com percentual incorreto | **Atendido** na versão candidata (3 × 2 × 4 combinações + bundle). A tela com "−50%" era de outra pasta/branch (§1.1) |
| As duas opções de contato na interface | **Atendido no código e na homologação.** Na publicação atual, "Agendar conversa" fica oculto até a URL oficial (PUB-20) |
| Formulário existente continua funcional | **Atendido**: e-mail 96/96, WhatsApp 111/111 |
| Agendamento com URL oficial e válida | **Pendência externa (PUB-20)**: URL não informada. A validação e o bloqueio estão prontos |
| Integração com Bookings preparada | **Atendido** (simulado). O Bookings real não foi testado |
| Backend serverless implementado e testado localmente | **Atendido**: 48 unitários + 141 de navegador com o backend local. **Sem deploy** |
| Envio automático com tratamento de erros | **Atendido** (local) |
| Controles de segurança documentados e testados | **Atendido** ([privacidade §6](COM-RELEASE-005-privacidade.md)) |
| Revisão de privacidade preparada | **Atendido como minuta**. A aprovação é da titular (PUB-09) |
| Testes automatizados aprovados | **Atendido** localmente. O CI do PR fica registrado no PR |
| Nenhuma credencial exposta | **Atendido**: nenhuma chave no código, nos workflows ou nas evidências. O `.env` da outra pasta não foi lido nem exibido |
| Nenhum serviço AWS criado | **Atendido** |
| Nenhum DNS alterado | **Atendido** |
| Nenhum merge | **Atendido** |

**Não declarado como aprovado**, por depender de recursos externos:

- o Bookings real;
- o Turnstile real;
- o backend e o SES na AWS;
- o recebimento em `contato@`.

Esses itens estão nas pendências: PUB-20, PUB-21 e INF-11 a INF-16.

## 5. Segredos e dados

- **Varredura do diff:** só identificadores públicos e valores sintéticos (`.invalid`, a chave de **teste** do
  Turnstile e o token de teste da Cloudflare). Nenhuma chave, senha ou token real.
- **Evidências:** só dados sintéticos. O único dado real é o CNPJ e o e-mail comercial, já públicos em
  `publicacao.json`.
- **Logs:** os do backend local foram conferidos sem dados pessoais (`logs-sem-dados-pessoais`).
