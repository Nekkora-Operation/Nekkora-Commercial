# COM-VITRINE-001 — Evolução da vitrine: Delivery por automação e pacote, Monitor, AI e Hosting

> **Estado:** documento de trabalho na branch `feat/com-vitrine-001`, com as diretrizes da titular de 11/11/2026
> incorporadas. Diretriz não é aprovação definitiva: os itens da §11 continuam pendentes. Nada aqui altera produção,
> flags de aprovação ou registros históricos da V1.0.0 (tag `v1.0.0`, commit `a167070`). Merge, deploy e alterações
> de produção ou infraestrutura dependem de autorização expressa, etapa por etapa.
>
> **Base:** "COM-VITRINE-001 — Decisões comerciais revisadas" e "COM-VITRINE-001 — Diretrizes e avanço incremental"
> (titular, 11/11/2026). Substituem a proposta anterior de renomear o Delivery e de encerrar a campanha antes do prazo.

Legenda: **[D]** diretriz da titular · **[P]** proposta do agente · **[!]** risco ou pendência.

## 1. Objetivo

Manter a Nekkora Commercial como vitrine oficial, evoluindo a apresentação e a forma de contratação das automações e
incorporando novos serviços ao catálogo, sem substituir a arquitetura, a identidade visual, a nomenclatura, a campanha
atual nem os canais comerciais já homologados.

## 2. Diretrizes gerais **[D]**

1. **Nomes:** Nekkora Delivery, Nekkora Monitor, Nekkora AI e Nekkora Hosting. Sem renomeação.
2. **Campanha de lançamento:** mantém o período de **06/11/2026 a 06/01/2027**, inclusive, no horário de Brasília. Sem
   encerramento antecipado e sem nova campanha com outras datas. A nova tabela é incorporada à campanha a partir da
   aprovação e publicação da atualização.
3. **Delivery:** contratação por automação ou por pacote, sem mensalidade obrigatória. O pacote é avulso e reúne três
   automações da mesma categoria. Cada automação tem escopo, documentação, critérios de homologação e condições de
   entrega e aceite próprios.
4. **Automação complexa fora da vitrine:** sem cartão, preço, pacote ou campo no simulador.
5. **Canais:** e-mail e LinkedIn continuam sendo os canais até que outros estejam homologados.
6. **Fora do escopo:** funcionalidades operacionais da Platform, do Monitor e da AI; checkout; cobrança recorrente;
   mudanças de DNS ou infraestrutura (o DNS A7 foi configurado pela titular na Cloudflare e não é tocado).

## 3. Tabela do Delivery

| Categoria | Individual | Pacote de 3 | Três individuais | Economia do pacote |
|---|---:|---:|---:|---:|
| Simples | R$ 650 | R$ 1.500 | R$ 1.950 | R$ 450 |
| Média | R$ 1.400 | R$ 3.500 | R$ 4.200 | R$ 700 |

- **[D]** Preço por automação ou por pacote; nenhuma mensalidade.
- **[D] V-07:** a página mostra o preço individual, o valor total do pacote de três e a economia total calculada. **Não**
  mostra o valor unitário aproximado dentro do pacote nesta versão.
- **[D]** A economia é calculada contra três unidades individuais da tabela nova, nunca contra a tabela anterior. Sem
  acúmulo de descontos: o pacote não parte de preço de lançamento anterior nem recebe outro desconto por cima.
- **[D]** Saem da página as comparações que deixam de ser corretas ("de R$ 1.500 por R$ 1.000", "de R$ 3.500 por
  R$ 2.800" e os percentuais correspondentes).
- **[P]** Economia e totais são **calculados** em `src/precos.ts`, nunca digitados (mesma regra da V1).
- **[!]** R$ 1.500 e R$ 3.500 mudam de significado: eram o preço padrão de **uma** automação e passam a ser o preço de
  **três**. Os valores sempre aparecem com "pacote de 3 automações" ao lado.

### 3.1 Solicitações e propostas anteriores — **V-02 [D]**

A campanha passa a ter duas tabelas dentro do mesmo período, separadas pela **data de início das novas condições** (a
data da publicação aprovada da atualização, registrada em `publicacao.json` e no regulamento).

- As condições comerciais e os direitos associados às ofertas anteriores são preservados: solicitação recebida de
  06/11/2026 até a véspera do início das novas condições mantém o preço de lançamento da tabela anterior (R$ 1.000
  simples, R$ 2.800 média, por automação), inclusive com proposta emitida depois, e os 7 dias para aceite.
- Quando houver **equivalência de escopo e modalidade**, a Nekkora **propõe** ao cliente a condição mais favorável
  (na prática, a tabela nova), sem substituir unilateralmente proposta já aceita. A proposta já aceita só muda por
  acordo das partes.
- Automação complexa solicitada antes da atualização continua sendo avaliada individualmente; a oferta anterior não
  fixava preço para ela.
- **[!]** O levantamento das solicitações recebidas desde 06/11/2026 (e-mail e LinkedIn) é da titular: o agente não
  acessa o Microsoft 365 nem o LinkedIn.

### 3.2 Depois de 06/01/2027 — **V-01 [D], pendente de aprovação comercial definitiva**

- **Proposta comercial adotada:** a nova tabela (§3) continua valendo depois de 06/01/2027.
- A campanha mantém o período original; a **comunicação promocional** (faixa e regras da campanha) termina em
  06/01/2027, sem nova data.
- **Não** há retorno automático aos preços anteriores. Hoje, sem esta mudança, a página voltaria sozinha a R$ 1.500 /
  R$ 3.500 por automação em 07/01/2027; a etapa 1 remove esse comportamento.
- **[!]** Essa regra depende da aprovação comercial definitiva da titular **antes do deploy** (PUB-14).
- **[P]** O portão hoje recusa campanha encerrada (PUB-13: fim < hoje), o que bloquearia qualquer deploy a partir de
  07/01/2027. Com a tabela contínua, a regra passa a ser: depois do fim, a página não pode exibir comunicação
  promocional (verificado), em vez de bloquear o deploy. Implementado na etapa do portão.

## 4. Pacotes — **V-03 [D]**

1. Pagamento **50% + 50% por pacote** (a segunda parcela na forma das condições comerciais).
2. Escopo, documentação, homologação e aceite **individualizados por automação**.
3. Quatro ou cinco automações da mesma categoria: **um pacote de três mais unidades avulsas**. Seis: **dois pacotes**.
   Regra geral do simulador: pacotes de três enquanto houver três, e o restante no preço individual.
4. **Pacotes mistos** (categorias diferentes) **somente por proposta específica**; não aparecem na vitrine nem no
   simulador.
5. **Cancelamento parcial e reembolso:** sujeitos a regras contratuais expressas, **sem penalidade nem retenção
   automática**.
6. **[!]** A redação contratual (condições comerciais e contrato) será revisada **antes da primeira contratação**. A
   cláusula 10 (retenção de 50%) continua **não aprovada** e não se aplica aos pacotes.

## 5. Demandas fora das modalidades — **V-04 [D]**

- Texto público: "Não encontrou uma modalidade adequada à sua necessidade? Entre em contato com nossa equipe para uma
  avaliação individual."
- Sem categoria complexa, preço ou pacote específico, e sem "sob orçamento" como terceira categoria do Delivery.
- **[P]** O critério principal publicado passa a ser "simples até 8 horas; média acima de 8 até 16 horas" de esforço
  técnico estimado; a frase "complexa acima de 16 horas" sai da página. O regulamento (§5) e as condições comerciais
  recebem nota de transição com a data de início das novas condições, sem apagar o texto anterior do histórico.

## 6. Titularidade — **V-05 [D]**

Texto público proposto, coerente com o Modelo A-R do
[Anexo de Componentes](../comercial/anexo-componentes-delivery.md):

> **A automação é sua.** O código-fonte, a documentação e os artefatos desenvolvidos especificamente para você e
> contratados passam a ser seus conforme o contrato e após a quitação integral. Bibliotecas, frameworks e componentes
> preexistentes da Nekkora, componentes reutilizáveis e tecnologias de terceiros continuam com seus titulares e são
> licenciados para que você possa usar, manter e executar a automação, nas condições de cada licença.

- **[!] LIC-02** (cadeia de titularidade da `nekkora-lib`) continua pendente e impede a primeira contratação que inclua
  componente preexistente.
- Nenhuma promessa de propriedade irrestrita sobre componentes que não possam ser transferidos.
- **[P]** O anexo de componentes ganha a lista dos direitos de uso necessários para manter e executar a solução, por
  tipo de componente.

## 7. Novos serviços — **V-06 [D]**

| Serviço | Preço previsto | Unidade | Contratação | Estado |
|---|---|---|---|---|
| Nekkora Monitor | R$ 75 | por automação/mês | Independente do Delivery; sem mínimo de 3 automações; automações próprias e de terceiros, conforme integrações suportadas | Em preparação |
| Nekkora AI | R$ 100 | por empresa/mês | Independente dos demais; limites de uso a definir | Em preparação |
| Nekkora Hosting | Sob orçamento | — | Assistida e independente | Disponível (como hoje) |

- Monitor e AI aparecem com o estado **"Em preparação"**, sem checkout, assinatura ativa ou promessa de disponibilidade
  imediata, e com o aviso: "Valores e condições definitivos dependem da disponibilização comercial."
- **[!]** Preço publicado é oferta (CDC art. 30). A titular decidiu exibir os preços previstos com o aviso acima; ao
  disponibilizar o serviço, a divergência em relação ao valor previsto deve ser tratada antes de qualquer contratação.
- **[!] Nekkora AI:** exige análise de privacidade própria (dados dos clientes, provedores de IA, transferência
  internacional e mecanismo do art. 33 da LGPD) **antes da ativação**, separada da F5. Limites e franquias são definidos
  e homologados antes de qualquer contratação.
- **[!] Monitor:** cobrança recorrente exige condições próprias (vigência, cancelamento, reajuste) antes da primeira
  contratação; fora do escopo desta missão.
- **[P]** Sem lista de espera ou formulário de interesse: uma nova finalidade de coleta alteraria o aviso de privacidade
  (PUB-09). O interesse pode ser manifestado pelos canais gerais.
- **[P]** Cada serviço tem um estado em `publicacao.json` (`disponivel` | `em-preparacao`); o portão só aceita
  `disponivel` com aprovação própria registrada.

## 8. Simulador

- Campos: automações simples e automações médias (0 a 20 cada). Sem campo complexa.
- Composição (§4, item 3): por categoria, pacotes de três enquanto houver três e o restante no individual.
- Resultado: linhas por categoria (pacotes e individuais), total estimado e economia contra o preço individual da tabela
  **nova**. Sem comparação com a tabela anterior e sem valor unitário dentro do pacote.
- O simulador continua sendo só uma estimativa: categoria, escopo e preço são definidos na avaliação e na proposta.

## 9. Governança, aprovações e portão

1. **Histórico da V1.0.0 intacto:** os registros `$origem` de 11/11/2026 não são editados, só complementados.
2. **Reabertura de PUB-14, PUB-17 e PUB-19:** somente na branch da missão e **mediante autorização específica da
   titular**, com o diff apresentado antes; um registro novo em `$origem` informa a reabertura para a COM-VITRINE-001 e
   que a aprovação de 11/11/2026 continua valendo para a `v1.0.0`.
3. **Portão de preços versionados [P]:** o `publicacao.json` registra a impressão digital (SHA-256) da tabela aprovada
   (Delivery, pacotes, Monitor e AI, de forma canônica). O portão calcula a impressão da tabela em `src/precos.ts` e
   bloqueia (PUB-14) se ela divergir da aprovada, mesmo com a flag `true`. **Rastreabilidade (autorização da etapa 2):**
   a impressão sozinha não é aprovação. O portão também exige o registro expresso da titular em
   `$origem["tabelaDePrecos.impressao"]`, começando por "Titular, DD/MM/AAAA" (data válida, de 11/11/2026 até o dia do
   deploy) e citando uma única impressão, igual à aprovada e à do código; sem ele, ou com outra impressão, bloqueia.
   Alterar ou regenerar o hash não é nova aprovação comercial, e os registros da `v1.0.0` não servem. Nenhuma impressão
   ou registro é preenchido automaticamente: a tabela nova segue **não aprovada para publicação**.
4. **Disponibilidade no portão [P]:** Monitor ou AI em `disponivel` sem aprovação própria bloqueiam o deploy.
5. **Data de início das novas condições:** obrigatória no `publicacao.json`, igual à do regulamento.
6. **PUB-18:** a publicação da atualização exige nova autorização expressa.

## 10. Plano incremental (branch `feat/com-vitrine-001`)

Antes de cada commit de implementação: diff e testes apresentados à titular. Nenhum merge, deploy ou mudança de
infraestrutura sem autorização.

| Etapa | Conteúdo | Situação |
|---|---|---|
| 0 | Esta especificação | autorizada |
| 1 | `src/precos.ts`: tabela nova, pacotes, economia calculada, preços previstos de Monitor e AI; fim do retorno automático à tabela anterior; simulador com pacotes e sem complexa; valores dos cartões de simples e média; testes e homologação de preços e simulador | concluída (autorizada pela titular em 11/11/2026) |
| 2 | Portão de preços versionados, data de início das novas condições, regra pós-campanha (§3.2) e estados de disponibilidade, com testes; regras de proposta com a tabela nova a partir da data de início e pacotes (V-02, V-03) | concluída (commit `5e21315`, autorizada pela titular em 11/11/2026) |
| 3 | Vitrine do Delivery: sai o cartão complexo, entram "A automação é sua", o texto V-04, critérios sem complexa e regras da campanha atualizadas; tabela nova só a partir da data de início (sem retroatividade) | concluída (autorizada pela titular em 11/11/2026; registro em §10.2) |
| 4 | Catálogo: cartões de Monitor e AI "Em preparação", Hosting mantido; componentes e tokens existentes | concluída (autorizada pela titular em 11/11/2026; registro em §10.3) |
| 5 | Fluxos de solicitação: tipos existentes do Delivery (com interesse em pacote) e do Hosting; sem coleta nova | concluída (autorizada pela titular em 11/11/2026; registro em §10.4) |
| 6 | Documentos: nota de transição no regulamento, condições comerciais (pacotes), anexo de componentes, proposta-modelo | — |
| 7 | Reabertura de PUB-14, PUB-17 e PUB-19 na branch e PR em rascunho | autorização específica |

### 10.1 Pendências temporárias depois da etapa 1 **[!]**

Estado intermediário da branch, que **não pode ser integrado à `main` nem publicado** enquanto estes itens existirem:

| Pendência | Onde | Resolvida na etapa |
|---|---|---|
| ~~O portão ainda aceita a tabela nova com as flags de aprovação da V1.0.0~~ — etapa 2: o portão exige a impressão digital aprovada da tabela do código (PUB-14) e a data de início (PUB-13); hoje bloqueia | `scripts/verificar-publicacao.mjs`, `publicacao.json` | 2 (resolvida); reabertura de PUB-17/19 na 7 |
| ~~Cartão "Automação complexa" com "Sob orçamento" e CTA próprio~~ — etapa 3: dois cartões e o texto V-04 com link para a solicitação | `src/content.ts` (`PRICING.tiers`), `src/sections/Pricing.tsx` | 3 (resolvida) |
| ~~Textos promocionais antigos~~ — etapa 3: "Campanha de lançamento…" (período mantido), tabela nova a partir de `novasCondicoes.inicio`; sem a data, aviso de prévia | `src/content.ts` (`PRICING.launch`) | 3 (resolvida); textos novos dependem de PUB-17 (etapa 7) |
| ~~Critério "complexa acima de 16 horas" na lista pública~~ — etapa 3: "simples até 8 horas; média acima de 8 até 16 horas" | `src/content.ts` (`PRICING.criteria`) | 3 (resolvida) |
| Regulamento da campanha e condições comerciais ainda citam o preço de lançamento e a complexa | `docs/comercial/` | 6 |
| ~~Regras de proposta aplicam só a tabela anterior~~ — etapa 2: tabela nova a partir de `novasCondicoes.inicio`, pacotes na proposta e condição mais favorável só sugerida | `scripts/comercial/regras-delivery.mjs` | 2 (resolvida) |
| V-01 (tabela contínua depois de 06/01/2027) é diretriz, não aprovação definitiva | §3.2, §11 | aprovação da titular antes do deploy |

### 10.2 Registro da etapa 3 (autorização da titular, 11/11/2026)

**Decisões confirmadas:** selo "Lançamento" mantido para o período de 06/11/2026 a 06/01/2027; CTA "Falar com a
equipe" para demandas fora das categorias, reutilizando a solicitação existente; horas como referência (até 8 h simples;
acima de 8 até 16 h média), sem classificação garantida só por elas; "A automação é sua" com as exceções; cada
automação com escopo, documentação, homologação e aceite próprios, também no pacote.

**Continuam pendentes:** `novasCondicoes.inicio` (PUB-13); impressão e registro da tabela (PUB-14); V-01; nova aprovação
dos textos (PUB-17) e das condições (PUB-19) antes da publicação; 50/50 por pacote, cancelamento e reembolso na revisão
contratual (etapa 6); LIC-02 (não resolvida).

**Homologação (build local, servidor que reproduz o CloudFront):**

| Execução | Dados | Resultado |
|---|---|---|
| Página, 15/11/2026: Chromium, Firefox e WebKit (celular, tablet, desktop e tela larga; dois temas) | reais (`publicacao.json`) | 97 verificações, 0 falha em cada navegador |
| Página, 05/11/2026 e 07/01/2027: Chromium | reais | 97 verificações, 0 falha em cada data |
| Página, 15/11/2026: Chromium, depois da nota dos critérios (item 4 da autorização) | reais | 97 verificações, 0 falha |
| Simulador: Chromium, Firefox e WebKit | reais + fictícios | 171 verificações, 0 falha |
| Canais (e-mail): Chromium, Firefox e WebKit | fictícios (`publicacao-homologacao-email.json`) | 96 verificações, 0 falha |
| Página, 31/10/2026, 15/11/2026 e 07/01/2027 (Chromium; 15/11 também Firefox e WebKit) | fictícios (`publicacao-homologacao.json`) | **97 verificações, 2 falhas em cada execução — NÃO aprovada integralmente** |

**As duas falhas com dados fictícios** (registradas à parte, sem alteração das verificações):

- `sem-destinos-provisorios`: a verificação recusa destinos de contato provisórios (domínio `.invalid`, número de
  WhatsApp sintético). O arquivo fictício usa exatamente esses destinos (`contato@exemplo.invalid`, `wa.me/5511912345678`),
  de propósito, para não apontar para canais reais. A verificação existe para impedir a publicação com contatos de
  teste e continua valendo.
- `dialogo-canal-da-publicacao`: a verificação exige o canal da publicação real (e-mail, sem WhatsApp, decisão de
  22/10/2026). O arquivo fictício configura WhatsApp, então o diálogo segue o caminho do WhatsApp.

Nas mesmas execuções, todas as verificações da etapa 3 passaram (sem categoria complexa, texto V-04, "A automação é
sua", regras da campanha com a data de início fictícia de 10/11/2026, tabela oficial). A página deve ser homologada
com os dados reais; os arquivos fictícios cobrem simulador, canais e campanha.

### 10.3 Registro da etapa 4 (autorização da titular, 11/11/2026)

**Conteúdo:** catálogo com os quatro serviços em Soluções, nesta ordem: Delivery ("Contratação assistida"), Monitor e
AI ("Em preparação", cartões de fundo liso, sem contratação, só com o link "Ver valores previstos") e Hosting ("Sob
avaliação e orçamento"). Os valores previstos (R$ 75 por automação/mês e R$ 100 por empresa/mês, calculados de
`src/precos.ts`) aparecem só no bloco de preços ("Serviços em preparação"), com o aviso V-06. Não há botão, formulário,
checkout, assinatura, lista de espera nem chamada à Platform. A matriz de alegações ganhou MO-01..MO-04 e AI-01..AI-04.

**Homologação (build local, servidor que reproduz o CloudFront):**

| Execução | Dados | Resultado |
|---|---|---|
| Página, 15/11/2026: Chromium, Firefox e WebKit | reais | 100 verificações, 0 falha em cada navegador |
| Página, 05/11/2026 e 07/01/2027: Chromium | reais | 100 verificações, 0 falha em cada data |
| Página, 15/11/2026 (Chromium, Firefox e WebKit), 05/11/2026 e 07/01/2027 (Chromium), com `catalogo-link-valores-previstos` | reais | 102 verificações, 0 falha em cada execução |
| Simulador: Chromium, Firefox e WebKit | reais + fictícios | 171 verificações, 0 falha |
| Canais (e-mail): Chromium, Firefox e WebKit | fictícios | 96 verificações, 0 falha |
| Página, 15/11/2026: Chromium e WebKit | fictícios | **100 verificações, 3 falhas — NÃO aprovada integralmente** |
| Página, 15/11/2026: Firefox | fictícios | **100 verificações, 2 falhas — NÃO aprovada integralmente** |

**Falhas com dados fictícios** (registradas à parte; nenhuma verificação foi alterada):

- `sem-destinos-provisorios` e `dialogo-canal-da-publicacao`: as mesmas da etapa 3 (§10.2), por causa dos canais
  simulados.
- `contraste-por-pixels:sage-light:mobile` (Chromium 4,05:1 e WebKit 4,13:1, na nota de Soluções): a medição alinha o
  elemento à borda inferior da tela e captura o recorte. Reproduzido nessa posição, o botão flutuante do WhatsApp
  (`nk-fab--whatsapp`, animado), que só existe com o WhatsApp sintético da fixture, cobre a nota. No build com os dados
  reais, sem WhatsApp, nada cobre a nota e a medição passa nos três navegadores (pior folga 4,63:1). Durante a
  preparação, o selo "Em preparação" chegou a ser acusado da mesma forma (3,57 a 4,54:1 com dados fictícios). Ele passou
  de `neutral` para `info`, e os cartões de Monitor e AI passaram a ter fundo liso (`surface`). Com isso a medição do
  selo passou em todas as execuções.

**[!] Pendência de acessibilidade, decisão da titular de 11/11/2026 (autorização da etapa 4, item 4):** o botão
flutuante fictício do WhatsApp cobre conteúdo da página no celular. Essa configuração não existe na produção atual, que
não tem WhatsApp. O problema deve ser corrigido e homologado antes de uma eventual ativação do WhatsApp (§11). As
verificações não foram alteradas, e a homologação com dados fictícios **não** está aprovada integralmente.

**Decisões da titular na autorização da etapa 4:** mantidos o tom `info` e o fundo liso de Monitor e AI; valores
previstos só no bloco de preços ("Serviços em preparação"), sem segundo bloco; textos de Monitor e AI aprovados como
**preliminares** (a aprovação formal PUB-17 fica para a revisão final da vitrine). Foi acrescentada a verificação
`catalogo-link-valores-previstos`: o link "Ver valores previstos" é acionado pelo teclado e leva à área correspondente.

### 10.4 Registro da etapa 5 (autorização da titular, 11/11/2026)

**Conteúdo:** as jornadas reais de solicitação seguem pelo diálogo existente e pelos canais autorizados (e-mail e
LinkedIn). Continuam três tipos: automação (Delivery), hospedagem e infraestrutura (Hosting). Não há tipo para Monitor
ou AI. Abaixo do tipo, uma orientação por serviço aparece só na tela e não entra na mensagem. Para o Delivery, ela
explica que o interesse em pacote de 3 da mesma categoria vai na descrição; para o Hosting, que ele é "sob avaliação e
orçamento". A primeira linha da mensagem do Delivery passa a dizer "(Nekkora Delivery)", como as do Hosting já faziam.
O link V-04 ("Falar com a equipe") abre a solicitação de automação. Não há campo novo, coleta nova, checkout, cobrança,
cadastro, assinatura ou integração com a Platform. A lista do que vai na mensagem, no aviso de privacidade, não muda.

**Homologação (build local, servidor que reproduz o CloudFront):**

| Execução | Dados | Resultado |
|---|---|---|
| Página, 15/11/2026: Chromium, Firefox e WebKit; 05/11/2026 e 07/01/2027: Chromium | reais | 104 verificações, 0 falha em cada execução |
| Simulador: Chromium, Firefox e WebKit | reais + fictícios | 171 verificações, 0 falha |
| Canais (e-mail), com a nova primeira linha: Chromium, Firefox e WebKit | fictícios | 96 verificações, 0 falha |
| Página, 15/11/2026: Chromium e WebKit | fictícios | **104 verificações, 3 falhas — NÃO aprovada integralmente** |
| Página, 15/11/2026: Firefox | fictícios | **104 verificações, 2 falhas — NÃO aprovada integralmente** |

As falhas com dados fictícios são as mesmas registradas em §10.2 e §10.3: canais simulados e o botão flutuante do
WhatsApp sobre a nota de Soluções (pendência de §11). As duas verificações novas (`solicitacao-tipos-delivery-e-hosting`
e `solicitacao-orientacao-por-servico`) passaram em todas as execuções. Ajuste da verificação durante a preparação: o
tipo pedido pelo CTA é aplicado logo depois da primeira pintura do diálogo, então a leitura espera até 1 s por ele. Sem o
tipo aplicado, a verificação continua falhando.

**Decisões da titular na autorização da etapa 5:** sem campo próprio para pacotes; o visitante informa na descrição
quantas automações pretende e o interesse no pacote de 3, sem precisar classificar a automação; a primeira linha do
Delivery foi aprovada e entra na revisão PUB-17. Na homologação, as esperas do diálogo e do link "Ver valores
previstos" acompanham o estado aplicado na tela (até 1 s e 2 s), e não uma pausa fixa.

**[P] Integração futura com a Nekkora Platform:** o catálogo fica tipado (identificador, nome, preço, unidade,
disponibilidade) para ser consumido depois, sem nenhuma chamada à Platform nesta missão.

## 11. Pendente de aprovação definitiva

| Item | O que falta | Bloqueia |
|---|---|---|
| V-01 | Aprovação comercial definitiva da tabela contínua depois de 06/01/2027 | deploy |
| Data de início | Data de início das novas condições (= data da publicação aprovada) | deploy |
| PUB-14 / PUB-17 / PUB-19 | Reabertura na branch e nova aprovação dos preços, textos e condições | deploy |
| PUB-18 | Autorização expressa de publicação da atualização | deploy |
| V-03 | Redação contratual dos pacotes (pagamento, cancelamento parcial, reembolso) | primeira contratação |
| V-05 / LIC-02 | Cadeia de titularidade da `nekkora-lib` | primeira contratação com componente preexistente |
| Minuta contratual | Validação antes da primeira contratação; cláusula 10 não aprovada | primeira contratação |
| Nekkora AI | Análise de privacidade própria; limites e franquias | ativação |
| Nekkora Monitor | Condições da cobrança recorrente | primeira contratação |
| Botão flutuante do WhatsApp | No celular, o botão (`nk-fab--whatsapp`) cobre conteúdo da página (medido na homologação com dados fictícios, §10.3); corrigir e homologar | ativação do WhatsApp |
| F5 | Resposta da Microsoft; não resolvida pela publicação nem por esta missão | — |
