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
   bloqueia (PUB-14) se ela divergir da aprovada, mesmo com a flag `true`.
4. **Disponibilidade no portão [P]:** Monitor ou AI em `disponivel` sem aprovação própria bloqueiam o deploy.
5. **Data de início das novas condições:** obrigatória no `publicacao.json`, igual à do regulamento.
6. **PUB-18:** a publicação da atualização exige nova autorização expressa.

## 10. Plano incremental (branch `feat/com-vitrine-001`)

Antes de cada commit de implementação: diff e testes apresentados à titular. Nenhum merge, deploy ou mudança de
infraestrutura sem autorização.

| Etapa | Conteúdo | Situação |
|---|---|---|
| 0 | Esta especificação | autorizada |
| 1 | `src/precos.ts`: tabela nova, pacotes, economia calculada, preços previstos de Monitor e AI; fim do retorno automático à tabela anterior; simulador com pacotes e sem complexa; valores dos cartões de simples e média; testes e homologação de preços e simulador | autorizada para início |
| 2 | Portão de preços versionados, data de início das novas condições, regra pós-campanha (§3.2) e estados de disponibilidade, com testes | — |
| 3 | Vitrine do Delivery: sai o cartão complexo, entram "A automação é sua", o texto V-04, critérios sem complexa e regras da campanha atualizadas | — |
| 4 | Catálogo: cartões de Monitor e AI "Em preparação", Hosting mantido; componentes e tokens existentes | — |
| 5 | Fluxos de solicitação: tipos existentes do Delivery (com interesse em pacote) e do Hosting; sem coleta nova | — |
| 6 | Documentos: nota de transição no regulamento, condições comerciais (pacotes), anexo de componentes, proposta-modelo | — |
| 7 | Reabertura de PUB-14, PUB-17 e PUB-19 na branch e PR em rascunho | autorização específica |

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
| F5 | Resposta da Microsoft; não resolvida pela publicação nem por esta missão | — |
