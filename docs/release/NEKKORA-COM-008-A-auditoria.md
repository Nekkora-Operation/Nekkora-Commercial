# NEKKORA-COM-008-A — Auditoria comercial, contratual e de privacidade

**Data:** 28/10/2026 · **Base:** `main` @ `de5feda` (merge do PR #9) · **Branch:** `docs/com-008-a-auditoria`
**Natureza:** análise e documentação. **Nada foi aprovado, publicado ou alterado** no conteúdo público, em
`publicacao.json`, nos preços, nas aprovações ou em `avisoHomologacao`. Os textos alternativos abaixo são propostas
para a COM-008-B: **não substituem** o texto atual.

**Este relatório não é parecer jurídico.** Os pontos marcados com ⚖ precisam de avaliação de advogado(a).

## 0. Pré-condição

| Verificação | Resultado |
|---|---|
| PR #9 integrado à `main` | Sim: merge `de5feda` em 28/10/2026, por Nekkolly. Árvore idêntica à do commit validado `1800056` |
| CI da `main` no merge | Run `40742503109`: **sucesso**. Proteções do environment, Build nekkora-lib, Validação e build e Testes de integração aprovados; o Preview é pulado em push, como previsto |
| Portão sobre a `main` | **PUBLICAÇÃO BLOQUEADA**, 8 pendências (PUB-20, PUB-13, PUB-09 ×2, PUB-19, PUB-17, PUB-18, PUB-10) |
| Texto exportado × código | `npm run texto` não gera diferença: `docs/com-001/05-texto-comercial.md` corresponde ao código da `main` |
| Testes de preço | `precos.test.mjs` 7/7 (valores, percentuais, ausência de "50%") |

**Método.** Leitura das 15 fontes obrigatórias e dos documentos que elas citam (`08-pendencias-publicacao.md`,
`06-roteiro-apresentacao.md`), das seções em `src/sections/` e da página pública do Microsoft Bookings, só em leitura:
o formulário e o texto de consentimento foram lidos sem preencher nem reservar. Nenhuma mensagem foi enviada.

**Legenda de natureza:** **F** = fato técnico comprovado (código, teste ou página observada) · **H** = hipótese ou
interpretação do agente · ⚖ = exige revisão jurídica · **T** = decisão da titular.

---

## A. Resumo executivo

A página está **tecnicamente pronta e comercialmente quase pronta**:

- os preços aprovados estão corretos e calculados;
- não há desconto universal;
- o Hosting está em linguagem de avaliação;
- as exclusões estão explícitas;
- o agendamento pelo Bookings funciona.

**Não está pronta para lançamento**, por três grupos de motivos:

1. **Impedimentos já conhecidos (portão).** Datas da campanha, razão social, aprovações de condições, textos e
   privacidade, testes complementares do Bookings, aviso de homologação e autorização de publicação.
2. **Inconsistências novas encontradas nesta auditoria**, que deveriam ser decididas antes das aprovações:
   - O texto de consentimento do Bookings usa **consentimento** como base legal; o aviso do site e a minuta de
     privacidade usam **procedimentos preliminares de contrato** (art. 7º, V). O texto do Bookings também cita
     "telefone", que o formulário não pede.
   - O aviso de privacidade do site **não menciona o Microsoft Teams**, a transferência internacional nem prazos de
     retenção concretos.
   - **Condições comerciais incompletas:** gatilho do saldo de 50% (entrega × aceite), cancelamento e reembolso do
     sinal, garantia, propriedade do código entregue e tratamento de dados do cliente durante o desenvolvimento.
   - **Contradições de texto:**
     - "Complexa · pacotes" × "Sem pacote obrigatório";
     - "servidores" como custo do cliente × oferta de infraestrutura do Hosting;
     - "Nenhuma [etapa] sem a sua aprovação";
     - CTA do Hosting abrindo um diálogo sobre automação.
   - **"Por que os valores são baixos"** afirma redução de horas e de retrabalho que **não foi medida**.
   - **Identificação do fornecedor no site** (razão social, CNPJ e endereço): possivelmente exigida pelo Decreto
     7.962/2013 ⚖.
3. **Risco operacional local (REP-05).** A pasta `Nekkora-Commercial` (branch `feat/commercial-modelo-c`) ainda tem a
   alteração não commitada em `src/content.ts` com **"−50%"** e "R$ 1000" (sem separador). Ela não está na `main` e
   não foi tocada, mas, se for commitada ou servida para revisão, reintroduz a propaganda de desconto universal.

**Documentos desatualizados**, que não devem ser tratados como autoridade:

- `02-contrato-comercial.md`: §5 Contato e falta de preços e condições;
- `08-pendencias-publicacao.md`: substituído por `COM-RELEASE-PENDENCIAS.md`;
- trechos de `03-matriz-alegacoes.md`: K-07, numeração PV e seções removidas;
- `COM-RELEASE-005-privacidade.md`: Bookings "não ativo";
- roteiro do Bookings em `COM-RELEASE-005-leads.md` §5: 20 min × 30 min reais.

Em todos os casos, a decisão mais recente está registrada e identificada na §B.

---

## B. Matriz de decisões

Situação: **OK** = pronto · **INC** = inconsistente · **PEND** = pendente de decisão · **DESAT** = documento
desatualizado. Impacto: **Bloqueia** = impede o lançamento · **Antes** = recomendado antes da aprovação
correspondente · **Depois** = pode aguardar.

### B.1 Preços e campanha

| ID | Descrição | Situação | Evidência (arquivo) | Risco | Recomendação | Decisão da titular | Impacto |
|---|---|---|---|---|---|---|---|
| AUD-01 | Tabela aprovada R$ 1.500 → 1.000 e R$ 3.500 → 2.800; complexa sob orçamento | **OK** (F) | `src/precos.ts` `PRICE_TABLE`; `precos.test.mjs` 7/7; PUB-14 aprovado | — | Preservar | Nenhuma | — |
| AUD-02 | Percentuais −33,33% (truncado) e −20%; economia R$ 500 e R$ 700 calculadas | **OK** (F) | `discountPercent` com truncamento; homologação `precos-*` | — | Preservar | Nenhuma | — |
| AUD-03 | Ausência de "50%" ou "metade do preço" na `main` | **OK** na `main` (F) / **risco local** | `precos.test.mjs`; REP-05: `Nekkora-Commercial/src/content.ts` local com "−50%" | Alto, se a alteração local for commitada ou mostrada como versão candidata | Descartar a alteração local ou mantê-la fora de qualquer revisão. O agente não tocou nela | **T**: descartar ou guardar a alteração local | Antes |
| AUD-04 | Datas da campanha | **PEND** (F) | `publicacao.json` `campanhaLancamento` nulo; portão PUB-13 | Sem datas, a página mostra o preço de lançamento sem prazo (só em homologação; o portão bloqueia) | Definir início e fim (AAAA-MM-DD). O agente **não** definiu datas | **T**: datas | **Bloqueia** |
| AUD-05 | Comportamento fora da campanha | **OK** (F) | `launchActive` + `Pricing.tsx`: fora do período, só o preço padrão e sem faixa "Lançamento" | Conferido no código: a avaliação acontece no carregamento da página, então uma aba aberta na virada do dia mostra o estado anterior até recarregar (H, impacto baixo) | Aceitável | Nenhuma | — |
| AUD-06 | Regra "propostas aprovadas durante a campanha" | **INC** leve (H) | `content.ts` `PRICING.launch` | Uma avaliação iniciada na campanha e com proposta aprovada depois perde o preço; pode gerar reclamação | Esclarecer na proposta-modelo e, se desejado, no site (ex.: "solicitações recebidas até…" ou "propostas emitidas até…") | **T**: qual evento fixa o preço | Antes (PUB-19) |
| AUD-07 | "Complexa · pacotes" × "Sem pacote obrigatório" e várias automações | **INC** (F/H) | `content.ts` `tiers[2].fit` ("várias automações contratadas em conjunto") e `HERO.points` | Um cliente com 3 automações **simples** pode entender que vira "complexa, sob orçamento" e perde o preço de lançamento. "Pacotes" contradiz "sem pacote obrigatório" | Ver F.3 | **T**: várias automações simples contratadas juntas mantêm o preço unitário? | Antes (PUB-17/19) |
| AUD-08 | Critérios de enquadramento | **OK** (F) | `PRICING.criteria` + "Nem todo processo é simples ou médio" | Oferta vinculante (CDC, art. 30) ⚖: o preço publicado obriga; a categoria definida na avaliação mitiga | Registrar a categoria e a justificativa em cada proposta | Nenhuma | — |
| AUD-09 | "Por que os valores são baixos" | **INC** (H) | `content.ts` `PRICING.notes[0]` (PR-04, "autorizada no mockup") | "Menos horas de levantamento e retrabalho, preço menor para você" afirma um efeito **não medido**. "Ferramenta própria" pode ser associada a produtos internos (P-02). Risco de publicidade enganosa (CDC, art. 37) ⚖ se não houver como demonstrar | Ver F.1 | **T**: escolher o texto | Antes (PUB-17) |
| AUD-10 | Licenças e serviços de terceiros | **INC** leve (F) | `PRICING.notes[1]` ("servidores… responsabilidade do cliente") × `HOSTING` (infraestrutura) × CO-06 ("tratados à parte, quando aplicáveis") × A-09 ("dependem de avaliação e proposta") | Três formulações diferentes. "Servidores" como sempre do cliente contradiz o Hosting | Ver F.4 | **T**: licenças sempre do cliente, ou "salvo se a proposta disser outra coisa"? | Antes (PUB-17) |
| AUD-11 | Promessas de economia operacional | **OK** (F) | Nenhuma ocorrência de ROI, "economize X horas" ou similar; X-03/X-04 verificados pela homologação | "Economia de R$ 500" é desconto de preço, não economia operacional: correto, mas a matriz chama X-03 de "economia percentual" (ver AUD-30) | Preservar | Nenhuma | — |

### B.2 Modelo comercial: Delivery

| ID | Descrição | Situação | Evidência | Risco | Recomendação | Decisão | Impacto |
|---|---|---|---|---|---|---|---|
| AUD-12 | Desenvolvimento por demanda, escopo e proposta individuais | **OK** (F) | `HERO.lead`, `SOLUTIONS`, `HOW_IT_WORKS` | — | — | — | — |
| AUD-13 | Várias automações para o mesmo cliente (A-05) | **INC** leve (F) | A matriz diz que A-05 aparece na seção "Delivery", que **não existe** no modelo C (PUB-15). Hoje só aparece de forma indireta em "várias automações contratadas em conjunto" | O site não diz claramente que um cliente pode pedir vários processos com proposta para cada um | Incluir junto com a decisão de AUD-07 | **T** | Antes |
| AUD-14 | Fila operacional | **OK** (F) | `PRICING.conditions` + `TRANSPARENCY.dependencies`, sem prazo nem posição | — | — | — | — |
| AUD-15 | Reuniões conforme acordado, sem reunião diária obrigatória | **OK** (F) | "Reuniões e acompanhamento conforme as condições acordadas" | Não diz explicitamente "sem reuniões diárias". Aceitável | Opcional: "frequência definida na proposta" | **T** (opcional) | Depois |
| AUD-16 | Pagamento 50% + saldo | **INC** (F) | Site: "50% na contratação e 50% na entrega, conforme a proposta". Missão COM-008: "saldo conforme proposta". PUB-19 menciona "aceite" | Ambiguidade entre **entrega** e **aceite**: se o cliente não homologa, quando vence o saldo? | Definir o gatilho (entrega, aceite ou aceite tácito após N dias) e se pode haver parcelamento diferente "conforme a proposta" | **T** ⚖ | **Bloqueia** (PUB-19) |
| AUD-17 | Cancelamento e reembolso do sinal | **PEND** (F: inexistente) | Nenhuma menção no site nem nos documentos | Sem regra, o cancelamento após o sinal vira disputa. Direito de arrependimento de 7 dias (CDC, art. 49) ⚖ se a contratação for a distância e o cliente for consumidor | **Não inventar política.** Definir na proposta-modelo: cancelamento antes e depois do início, retenção proporcional ao trabalho feito e arrependimento | **T** ⚖ | **Bloqueia** (PUB-19) |
| AUD-18 | Garantia e correções | **INC** ⚖ (F) | Transparência: "Garantia após a entrega, salvo se prevista"; roteiro: "só vale se previsto" | A garantia **legal** contra vícios não depende de termo e não pode ser afastada quando o CDC se aplica (arts. 24, 25 e 26; 51, I). O texto pode ser lido como "não há garantia nenhuma" | Distinguir **garantia legal** (correção de defeitos do que foi contratado) de **garantia contratual adicional e sustentação**. Ver F.5 | **T** ⚖: prazo e abrangência das correções pós-aceite | **Bloqueia** (PUB-17/19) |
| AUD-19 | Homologação e aceite | **INC** leve (F/H) | "Entrega considerada pronta só com… cada etapa mediante a sua aprovação"; "Seis etapas. Nenhuma sem a sua aprovação" | Etapas 1, 2 e 4 não têm aprovação formal. A frase promete um rito que o processo talvez não tenha. Falta definir rodadas de ajuste e aceite tácito | Ver F.2 | **T** | Antes (PUB-17) |
| AUD-20 | Entrega de documentação e artefatos | **PEND** (F) | "Entregamos e transferimos o que foi previsto na proposta" (A-13: "conteúdo não especificado") | **Propriedade intelectual** do código, acesso ao repositório, credenciais e licenças de bibliotecas não definidos ⚖ | Definir na proposta-modelo o que é transferido (código-fonte, documentação, direitos) | **T** ⚖ | Antes (PUB-19) |
| AUD-21 | Dados do cliente durante o desenvolvimento | **PEND** ⚖ (H) | "Liberação de acessos e credenciais" em Transparência | Ao acessar sistemas do cliente com dados pessoais, a Nekkora atua como **operadora** (LGPD, art. 39). Faltam cláusula de tratamento de dados (DPA), confidencialidade e guarda de credenciais | Cláusula-padrão de proteção de dados e confidencialidade na proposta | **T** ⚖ | Antes (PUB-19) |

### B.3 Modelo comercial: Hosting

| ID | Descrição | Situação | Evidência | Risco | Recomendação | Decisão | Impacto |
|---|---|---|---|---|---|---|---|
| AUD-22 | Em avaliação de viabilidade, sem disponibilidade imediata | **OK** (F) | Selo "Em avaliação de viabilidade"; "não representa contratação nem reserva de capacidade" | — | — | — | — |
| AUD-23 | Sem SLA, 24×7 ou capacidade reservada | **OK** (F) | Só aparecem no bloco de exclusão (`data-exclusion`); homologação `sem-alegacoes-proibidas` | — | — | — | — |
| AUD-24 | Cada componente depende de proposta | **OK** (F) | "Cada um é avaliado separadamente e só faz parte do contrato quando consta na proposta" | — | — | — | — |
| AUD-25 | CTA "Solicitar avaliação de viabilidade" | **INC** (F) | `Hosting.tsx` usa o mesmo diálogo de "Solicitar avaliação", que pede "Conte qual processo você quer automatizar" | Quem quer só hospedar uma automação existente recebe um formulário sobre automação nova | Ajustar o texto do diálogo para os dois casos, ou passar um assunto ("Hosting") na mensagem. Ver F.6 | **T** | Antes (PUB-17) |

### B.4 Textos, botões e canais

| ID | Descrição | Situação | Evidência | Risco | Recomendação | Decisão | Impacto |
|---|---|---|---|---|---|---|---|
| AUD-26 | Botão "Entrar" sem destino | **PEND** (F) | `App.tsx` (`aria-disabled`, tooltip "Acesso de clientes ainda não disponível"); PUB-16 | Único controle sem função. Sugere uma área de cliente inexistente (Platform, P-02) | Recomendação anterior mantida: **ocultar no lançamento** | **T**: manter ou ocultar | Antes |
| AUD-27 | Linguagem técnica | **INC** leve (H) | "Integrações via API", "Sistemas web", "infraestrutura, configuração, administração, monitoramento, operação assistida, correção de incidentes, sustentação" | Público não técnico pode não entender o Hosting | Opcional: uma frase de exemplo ("ex.: um servidor ou serviço em nuvem onde a automação roda") | **T** (opcional) | Depois |
| AUD-28 | Produtos internos | **OK** (F) | Nenhuma menção a Studio, Platform ou Agent; "ferramenta própria" sem nome (ver AUD-09) | — | — | — | — |
| AUD-29 | Canais de contato | **OK** (F) | E-mail e LinkedIn; WhatsApp fora por decisão de 22/10; mailto só com confirmação; nada é enviado pelo site | REP-04: confirmar que `contato@` **recebe** (pendente da titular) | Teste manual de recebimento | **T**: executar REP-04 | **Bloqueia** (operacional) |
| AUD-30 | Matriz de alegações desatualizada | **DESAT** (F) | `03-matriz-alegacoes.md`: K-07 "URL não informada"; PV-05/06/07 numerados de forma diferente dos comentários de `content.ts` (lá PV-05 = envio automático, PV-06 = Bookings, PV-07 = Turnstile); C-03, H-04, D-01..D-05 citam seções removidas; X-03 "economia percentual" × "Economia de R$" no preço | Revisão comercial feita sobre uma matriz que não corresponde ao site | Atualizar a matriz na COM-008-C (só documentação) | Nenhuma (técnica) | Antes (PUB-17) |
| AUD-31 | Contrato comercial e pendências antigas | **DESAT** (F) | `02-contrato-comercial.md` §5 ("Nenhum canal real está confirmado"), sem preços nem condições; `08-pendencias-publicacao.md` (PUB-01..03 "não exibidos"), ainda citado por `config.ts` e pelo §0 do contrato | Leitura de regra revogada como vigente | Marcar como histórico e apontar para `COM-RELEASE-PENDENCIAS.md` e `src/content.ts` | Nenhuma | Depois |
| AUD-32 | Prazo de resposta e horário (K-04) | **PEND** (F) | Nada exibido | Nenhum, enquanto não for prometido | Pode aguardar | **T** (opcional) | Depois |

### B.5 Privacidade e LGPD

| ID | Descrição | Situação | Evidência | Risco | Recomendação | Decisão | Impacto |
|---|---|---|---|---|---|---|---|
| AUD-33 | Identificação do controlador | **PEND** (F) | `publicacao.json`: `controlador.nome` nulo; CNPJ informado, mas o aviso **não mostra o CNPJ** sem o nome (`content.ts`, `controller`) | Aviso com "a Nekkora", sem pessoa jurídica identificável | Informar a razão social. O agente **não** inventa | **T** | **Bloqueia** (PUB-09) |
| AUD-34 | Identificação do fornecedor no site (Decreto 7.962/2013, art. 2º) | **PEND** ⚖ | O site exibe preços (oferta), mas não mostra razão social, CNPJ nem endereço | Possível exigência para site com oferta de serviços a consumidores | Avaliar com advogado(a). Se aplicável, rodapé com razão social, CNPJ e endereço | **T** ⚖ | Antes |
| AUD-35 | **Base legal do Bookings × site** | **INC** ⚖ (F) | Bookings: "Ao marcar esta caixa, você **concorda** com o tratamento…"; site e `COM-RELEASE-005-privacidade.md` §3: art. 7º, V, "o consentimento **não** é a base adotada" | Base legal contraditória. Consentimento exige revogação livre; se o visitante revogar, a reserva (que depende dos dados) ficaria sem base | Trocar a caixa por ciência ("Li e entendi…"), ou adotar consentimento de forma coerente nos dois lugares. Ver F.7 | **T** ⚖ | **Bloqueia** (PUB-09/PUB-20) |
| AUD-36 | Dados citados no Bookings × coletados | **INC** (F) | O texto do Bookings cita "telefone", mas o formulário pede nome, e-mail, notas, empresa e processo. Nenhum telefone | Aviso impreciso (princípio da transparência, art. 6º, VI) | Retirar "telefone" ou acrescentar o campo, se houver motivo | **T** | Antes |
| AUD-37 | Campo "Empresa" obrigatório no Bookings × opcional no site | **INC** leve (F; correspondência pela ordem dos campos) | Bookings: a primeira pergunta personalizada é obrigatória e a segunda não; no site, Empresa é opcional e o processo é obrigatório | Experiência diferente nos dois caminhos; pessoa física fica sem como preencher | Alinhar: empresa opcional e processo obrigatório (ou o inverso nos dois) | **T** | Depois |
| AUD-38 | Microsoft Teams no aviso do site | **PEND** (F) | O item PV-06 do site fala em Bookings e Microsoft 365, **não em Teams**. O Bookings cita Teams | Reunião por Teams trata nome, e-mail, imagem e voz (e gravação, se houver) | Citar o Teams no item de agendamento e decidir sobre gravação (recomendação: não gravar sem aviso específico) | **T** | Antes (PUB-09) |
| AUD-39 | Retenção e exclusão | **PEND** (F) | Site: "pelo tempo necessário… ou exigido por lei"; minuta §2: retenção da caixa e das reservas "a definir" | Indeterminado | Definir prazos (ex.: solicitações sem contrato: N meses; reservas: N meses após a reunião) | **T** ⚖ | Antes (PUB-09) |
| AUD-40 | Transferência internacional | **PEND** ⚖ (F/H) | Minuta §4: AWS (CloudFront global; região do bucket **não verificada**), região do tenant M365 a confirmar, Cloudflare (só com envio automático). O aviso do site **não menciona** | Falta de transparência (art. 33 c/c art. 9º) | Confirmar as regiões e incluir uma frase no aviso | **T** ⚖ | Antes (PUB-09) |
| AUD-41 | Encarregado / canal do titular | **PEND** ⚖ (F) | Canal: `contato@nekkora.com` (site e Bookings coerentes) | Dispensa de encarregado para agente de pequeno porte (Res. CD/ANPD nº 2/2022) depende do enquadramento | Confirmar o enquadramento; manter o canal | **T** ⚖ | Antes |
| AUD-42 | Operadores e compartilhamento | **INC** leve (F) | O site cita Microsoft (Bookings/M365) e AWS; a minuta cita Cloudflare só com envio automático. Teams ausente (AUD-38) | — | Lista única de operadores no aviso | **T** | Antes (PUB-09) |
| AUD-43 | "Sem cookies nem rastreamento" | **OK no site** (F) / **escopo** (H) | Homologação: fontes do próprio site, só `localStorage` de tema; nenhuma requisição externa | O Bookings (Microsoft) usa cookies e scripts próprios. O texto pode ser lido como valendo para toda a jornada | Acrescentar "nesta página" e citar que o Bookings segue as regras da Microsoft | **T** | Antes (PUB-09) |
| AUD-44 | Link "Políticas e Práticas de Nekkora" no Bookings | **PEND** (F) | O rodapé do Bookings cita as políticas da Nekkora **sem link**; o único link é o da Microsoft | O visitante não chega ao aviso do site | Configurar no Bookings o link para `https://nekkora.com/#privacidade` (depois da publicação) | **T** (M365) | Antes |
| AUD-45 | Minimização | **OK** (F) | Site: nome, e-mail opcional, empresa opcional e descrição; aviso "não informe senhas" no site e no Bookings | Bookings: campo livre "Adicionar solicitações especiais" | Aceitável com o aviso existente | — | — |

### B.6 Bookings e operação

| ID | Descrição | Situação | Evidência | Risco | Recomendação | Decisão | Impacto |
|---|---|---|---|---|---|---|---|
| AUD-46 | Testes reais já feitos pela titular | **OK** (relatado) | `NEKKORA-COM-007-bookings.md` §3.1: reserva externa, confirmação, e-mail, convite com Teams, notificação à responsável, calendário, bloqueio do horário e intervalo de 15 min | — | — | — | — |
| AUD-47 | Lembrete de 2 h, cancelamento com liberação do horário, abertura efetiva do Teams | **PEND** (F) | Mesmo documento, §3.2; `aprovacoes.agendamento: false` (mantido) | — | Executar os três testes | **T** | **Bloqueia** (PUB-20) |
| AUD-48 | Fuso horário do Bookings | **OK** (F) | Página observada: "(UTC-03:00) Brasília" selecionado para um navegador em São Paulo | Para visitante em outro fuso, o Bookings converte | — | — | — |
| AUD-49 | Descrição do serviço no Bookings | **OK** (F) | "Conversa inicial gratuita… 30 minutos… Microsoft Teams… proposta com escopo, prazo e investimento" | Coerente com o site; "prazo" na proposta está de acordo com "Prazo estimado" da Transparência | — | — | — |
| AUD-50 | Botões de contato e agendamento | **OK** (F) | Homologação na `main` (COM-007): 2 botões + atalho no diálogo, nova aba, `noopener noreferrer`, sem `window.open`; mailto exato; nada enviado | — | — | — | — |

---

## C. Matriz de alegações comerciais (estado atual da página de produção)

### Comprovadas (fato do código ou decisão registrada)

- Desenvolvimento de automações por demanda, com escopo, preço e aceite em proposta (A-01, A-02).
- Ciclo em seis etapas (A-03). Tecnologias "conforme o caso", com viabilidade confirmada na avaliação (A-15, A-16).
- Preço padrão R$ 1.500 / R$ 3.500; lançamento R$ 1.000 / R$ 2.800 com economia e percentual calculados; complexa
  sob orçamento (PR-01..PR-03, PUB-14).
- Critérios de categoria (PR-06). Fila operacional, reuniões conforme acordado, licenças à parte (CO-04..CO-06).
- Hosting em avaliação de viabilidade, componentes não obrigatórios (H-01, H-03).
- E-mail e LinkedIn oficiais (K-02, K-03). O site não envia nem guarda dados (K-05, PV-01). Sem cookies no site (PV-03).
- O agendamento abre o Bookings oficial e a página não afirma que a reunião foi marcada.

### Condicionais (válidas só com a condição no mesmo bloco)

- Preços de lançamento: só dentro do período aprovado (PUB-13), "para propostas aprovadas durante a campanha".
- "Pagamento de 50% na contratação e 50% na entrega" (CO-03): "conforme a proposta". **O gatilho precisa de
  decisão** (AUD-16).
- Hosting independente e combinação (H-04, C-03): hoje **não aparecem** no site (seção removida). Se voltarem, só com
  "sujeito a compatibilidade e disponibilidade".
- Itens do aviso de privacidade que mudam com a configuração (envio automático, Turnstile, Bookings).

### Pendentes (não aparecem ou dependem de decisão)

- Datas da campanha (PUB-13); razão social (PUB-09); Hosting disponível (H-02); prazo de resposta (K-04).
- Garantia e correções pós-aceite, cancelamento e reembolso, propriedade do código entregue (AUD-17, AUD-18, AUD-20).
- Retenção, transferência internacional e Teams no aviso (AUD-38..AUD-40).

### Proibidas (só como exclusão)

- Desconto único de 50%, "metade do preço" (PR-02). **Atenção:** presente na alteração local não commitada (AUD-03).
- Prazo garantido, ROI, economia operacional, SLA, 24 h, alta disponibilidade, monitoramento contínuo, garantia ou
  sustentação incluídas (X-02..X-09).
- Depoimentos, clientes, números de operação (X-10..X-12). Produtos internos como porta de entrada (P-02).

### Potencialmente contraditórias

| Trecho A | Trecho B | Conflito | ID |
|---|---|---|---|
| "Sem pacote obrigatório" (Hero) | "Complexa · pacotes … várias automações contratadas em conjunto" | Várias simples viram complexa? | AUD-07 |
| "servidores … responsabilidade do cliente" (Preços) | Hosting oferece infraestrutura para execução | Quem paga o servidor quando há Hosting? | AUD-10 |
| "Licenças … responsabilidade do cliente" | "Licenças … tratados à parte, quando aplicáveis" / A-09 "dependem de avaliação e proposta" | Sempre do cliente ou negociável? | AUD-10 |
| "Seis etapas. Nenhuma sem a sua aprovação." | Etapas 1, 2 e 4 sem aprovação formal | Promessa de rito | AUD-19 |
| "Garantia após a entrega, salvo se prevista" (não incluída) | Garantia legal contra vícios ⚖ | Exclusão possivelmente sem efeito | AUD-18 |
| "50% na entrega" | Aceite na homologação | Saldo vence na entrega ou no aceite? | AUD-16 |
| Site: base legal art. 7º, V | Bookings: "você concorda" (consentimento) | Base legal | AUD-35 |
| "Solicitar avaliação de viabilidade" (Hosting) | Diálogo "Conte qual processo você quer automatizar" | Formulário inadequado ao pedido | AUD-25 |
| "Menos horas de levantamento e retrabalho, preço menor" | Nenhuma medição | Efeito não comprovado | AUD-09 |

---

## D. Revisão contratual: lacunas

O site diz corretamente que as condições valem "conforme a proposta". A lacuna é a **proposta-modelo**, que não existe
no repositório. Para aprovar o PUB-19, recomenda-se que a titular decida:

| Tema | O que existe | Lacuna | Pergunta para a titular |
|---|---|---|---|
| Contratação | Proposta escrita, preço aprovado antes do início | Forma do aceite da proposta (assinatura, e-mail), validade da proposta | Como o cliente aceita e por quanto tempo a proposta vale? |
| Pagamento | 50% na contratação, 50% na entrega | Gatilho do saldo; prazo de pagamento; atraso (multa e juros) ⚖; nota fiscal | O saldo vence na entrega, no aceite ou N dias após a entrega sem manifestação? |
| Entrega | "Conforme previsto na proposta" | Lista de artefatos (código, documentação, manual), forma de transferência, propriedade intelectual ⚖ | O cliente recebe o código-fonte e os direitos de uso, ou de propriedade? |
| Homologação e aceite | Validação no cenário do cliente | Número de rodadas de ajuste; prazo para homologar; aceite tácito; o que é defeito × mudança de escopo | Quantas rodadas? O que acontece se o cliente não homologar em N dias? |
| Garantia | "Não incluída automaticamente, salvo se prevista" | Correção de defeitos do escopo (garantia legal ⚖); prazo; exclusões (mudança em sistema de terceiro) | Por quanto tempo a Nekkora corrige defeitos do que entregou? |
| Cancelamento e reembolso | Nenhuma regra | Antes e depois do início; retenção proporcional; arrependimento de 7 dias ⚖ | Qual parte do sinal é devolvida em cada fase? |
| Mudança de escopo | "Alterações futuras não incluídas" | Procedimento de aditivo | Mudanças durante o desenvolvimento geram nova proposta? |
| Dados e acessos do cliente | "Liberação de acessos e credenciais" | Papel de operadora (LGPD, art. 39), confidencialidade, guarda e devolução de credenciais ⚖ | Cláusula-padrão de proteção de dados? |
| Responsabilidade | Dependências de terceiros listadas | Limitação de responsabilidade ⚖ (com os limites do CDC) | — (advogado) |
| Foro e lei aplicável | — | ⚖ | — (advogado) |

**Aplicabilidade do CDC** ⚖: os clientes são majoritariamente empresas. O CDC pode se aplicar a pequenas empresas
vulneráveis (teoria finalista mitigada). A redação deve funcionar nos dois cenários.

---

## E. Revisão de privacidade

### E.1 Inventário por canal

| Canal | Dados | Quem trata | Ativo na publicação | Fato × hipótese |
|---|---|---|---|---|
| Site institucional | IP e navegador (entrega); tema no `localStorage` | AWS (CloudFront; logs desligados) | Sim | F (homologação e documentação da AWS no repo) |
| Formulário → aplicativo de e-mail | Nome, empresa e e-mail (opcionais), descrição, **só se o visitante enviar** | Provedor de e-mail do visitante → Microsoft (caixa `contato@`) | Sim | F |
| Microsoft Bookings | Nome, e-mail, notas, empresa, processo e horário | Microsoft (caixa de reservas e calendário) | Sim (URL configurada) | F (página observada) |
| Microsoft Teams | Nome, e-mail, imagem e voz; gravação, se houver | Microsoft | Sim (o convite contém Teams) | F (evidência da titular) / gravação: H |
| Caixa comercial M365 | Mensagens e respostas | Microsoft | Sim | F |
| AWS (envio automático) | Em trânsito; código técnico de 24 h; HMAC do IP por 2 dias; logs sem dados pessoais | AWS (+ Cloudflare Turnstile) | **Não** (PUB-21; backend não ativado) | F (testes locais) |

### E.2 Riscos e recomendações

1. **Base legal incoerente** (AUD-35): ajustar o texto do Bookings (F.7) ou a minuta, nunca deixar os dois
   diferentes. ⚖
2. **Teams ausente do aviso** (AUD-38): incluir; definir se haverá gravação.
3. **Retenção indefinida** (AUD-39): definir prazos para a caixa comercial e as reservas.
4. **Transferência internacional não informada** (AUD-40): confirmar a região do bucket S3 (a auditoria AWS não a
   registrou) e a do tenant M365; informar no aviso. ⚖
5. **Controlador sem nome** (AUD-33) e possível exigência de identificação do fornecedor (AUD-34). ⚖
6. **"Sem cookies"** com escopo (AUD-43).
7. **Imprecisões no Bookings:** "telefone" (AUD-36); link das políticas (AUD-44).
8. **Dados do cliente no desenvolvimento** (AUD-21): cláusula de operadora. ⚖

### E.3 Questões para avaliação jurídica ⚖

- Art. 7º, V (procedimentos preliminares a pedido do titular) é adequado quando quem contata é **empregado** de uma
  empresa, e não a parte do futuro contrato? Ou é preferível o legítimo interesse (art. 7º, IX) com LIA?
- Consentimento no Bookings: manter (com revogação) ou substituir por ciência?
- Enquadramento como agente de pequeno porte e dispensa de encarregado (Res. CD/ANPD nº 2/2022).
- Transferência internacional: os termos da AWS, da Microsoft e da Cloudflare atendem ao art. 33 (Res. CD/ANPD
  nº 19/2024)?
- Decreto 7.962/2013 e CDC, arts. 30, 37, 49 e 24 a 26, aplicados a um site B2B com preços publicados.

---

## F. Propostas de melhoria (textos alternativos, **não aplicados**)

### F.1 "Por que os valores são baixos" (AUD-09)

Atual: *"Usamos uma ferramenta própria que agiliza a documentação e o desenvolvimento de cada automação. Menos horas
de levantamento e retrabalho, preço menor para você — sem cortar etapas: documentação, testes e homologação continuam
no escopo."*

- **Opção A (processo, sem afirmar efeito):** título **"Como chegamos a esses valores"**: "Trabalhamos com um
  processo padronizado e ferramentas internas de documentação e desenvolvimento. Isso nos permite oferecer estes
  valores sem retirar etapas: documentação, testes e homologação continuam no escopo."
- **Opção B (mais curta):** título **"Valores de lançamento"**: "Estamos começando e queremos os primeiros clientes.
  Os valores de lançamento valem só durante a campanha, sem retirar etapas: documentação, testes e homologação
  continuam no escopo." (Só se for verdade que o motivo é a campanha.)
- **Opção C (manter o atual):** só se a titular tiver **medição** de horas economizadas que sustente "menos horas de
  levantamento e retrabalho".

Recomendação do agente: **Opção A**. Ela comunica eficiência e qualidade sem afirmar resultado não medido e sem
associar a um produto interno.

### F.2 Aprovação nas etapas (AUD-19)

- "Seis etapas. Nenhuma sem a sua aprovação." → **"Seis etapas, com a sua aprovação nos pontos de decisão."**
- "Entrega considerada pronta só com documentação, desenvolvimento, testes e homologação com você — cada etapa
  mediante a sua aprovação" → **"A entrega só é concluída depois de documentação, desenvolvimento, testes e da sua
  homologação."**

### F.3 Várias automações e "pacotes" (AUD-07, AUD-13)

Se a titular decidir que várias automações simples ou médias mantêm o preço unitário:

- Card complexa: **"Processos ponta a ponta ou com várias integrações por API."** (sem "várias automações" e sem
  "pacotes"; overline **"Complexa"**).
- Nova linha em "Condições comerciais": **"Pode solicitar várias automações: cada uma tem categoria, proposta e preço
  próprios."**

Se decidir que conjuntos são orçados juntos: **"Conjuntos de automações contratadas juntas podem ter orçamento
próprio, definido na avaliação"**, e retirar "Sem pacote obrigatório" ou trocar por "Contrate só o que precisar".

### F.4 Licenças (AUD-10)

**"Licenças de software e serviços de terceiros (UiPath, Power Automate, APIs pagas) não estão incluídas nos valores.
Indicamos na proposta o que é necessário; em regra, a contratação é do cliente. Servidores e ambiente de execução podem
ser contratados à parte com o Nekkora Hosting."**

### F.5 Garantia (AUD-18) ⚖

Na Transparência, trocar "Garantia após a entrega, salvo se prevista" por:

- em "Não incluído automaticamente": **"Suporte, sustentação e garantia adicional após a entrega, salvo se previstos"**;
- em "Definido em proposta": **"Correção de defeitos do que foi entregue: prazo e condições"**.

A redação final depende da decisão da AUD-18 e de advogado(a).

### F.6 Diálogo para o Hosting (AUD-25)

Descrição do diálogo: **"Conte o que você precisa: uma automação nova ou um ambiente para executar automações
existentes. Antes de qualquer envio, você revisa a mensagem."** Rótulo do campo: **"Descreva a necessidade"**.

### F.7 Texto do Bookings (AUD-35, AUD-36, AUD-38) ⚖ — para a titular configurar no M365

> Para agendar a conversa, a Nekkora usa o nome, o e-mail e as respostas deste formulário (empresa e processo, quando
> informados). Esses dados servem para organizar o agendamento, enviar confirmação e lembrete, realizar a reunião pelo
> Microsoft Teams e responder à sua solicitação, a seu pedido (LGPD, art. 7º, V). O agendamento e a reunião usam o
> Microsoft Bookings e o Microsoft Teams (Microsoft 365). Saiba mais em nekkora.com/#privacidade. Dúvidas ou pedidos
> sobre seus dados: contato@nekkora.com. Não inclua senhas nem informações sensíveis.
>
> ☐ Li e entendi como meus dados serão usados.

### F.8 Aviso do site: item de agendamento e cookies (AUD-38, AUD-43)

- Agendamento: **"… ficam registrados na agenda da Nekkora no Microsoft 365 e são usados para realizar a conversa
  pelo Microsoft Teams. As reuniões não são gravadas."** (a última frase só se for decidido não gravar).
- Cookies: **"Esta página não usa cookies nem ferramentas de análise ou de publicidade. … O Microsoft Bookings, ao
  qual o botão "Agendar conversa" leva, segue as regras da Microsoft."**

---

## G. Plano de implementação da COM-008-C (depois das decisões da COM-008-B)

| Decisão | Arquivos a alterar | Testes e verificações a atualizar |
|---|---|---|
| AUD-07, AUD-09, AUD-10, AUD-13, AUD-15, AUD-16, AUD-18, AUD-19 (textos de preço, condições, transparência e etapas) | `src/content.ts` (`PRICING`, `TRANSPARENCY`, `HOW_IT_WORKS`, `SOLUTIONS`, `HERO`) | `npm run texto` → `docs/com-001/05-texto-comercial.md`; `scripts/homologacao.mjs` (textos verificados, `sem-alegacoes-proibidas`); `precos.test.mjs` sem mudança de valores |
| AUD-25 (diálogo Hosting) | `src/content.ts` (`CONTACT_COPY.dialogDescription`, `processHint`); talvez `src/sections/Contact.tsx` e `src/request.tsx` (assunto por origem) | `homologacao-canais.mjs` (mensagem exata do mailto) |
| AUD-26 (botão Entrar) | `src/App.tsx`, `src/content.ts` (`LOGIN`) | `homologacao.mjs` (cabeçalho, navegação, celular) |
| AUD-33, AUD-34 (controlador e identificação) | `publicacao.json` (**pela titular**: `controlador.nome`); `src/sections/Footer.tsx` e `src/content.ts` (`FOOTER`), se a identificação no rodapé for decidida; `src/publicacao.d.ts` se entrar endereço | `verificar-publicacao.mjs` e testes, se o endereço virar item do portão |
| AUD-38..AUD-43 (aviso de privacidade) | `src/content.ts` (`PRIVACY`) | `npm run texto`; `homologacao*.mjs` (`privacidade-*`); `docs/release/COM-RELEASE-005-privacidade.md` |
| AUD-35..AUD-37, AUD-44 (Bookings) | **Nenhum arquivo**: configuração no Microsoft 365, pela titular | Registrar evidência em `NEKKORA-COM-007-bookings.md` |
| AUD-04, PUB-10, PUB-18, aprovações | `publicacao.json`: **somente a titular** | Portão |
| AUD-30, AUD-31 (documentos) | `docs/com-001/03-matriz-alegacoes.md`, `02-contrato-comercial.md`, `08-pendencias-publicacao.md` (marcar como histórico), `docs/release/COM-RELEASE-005-privacidade.md`, `COM-RELEASE-005-leads.md` §5, `COM-RELEASE-PENDENCIAS.md`; comentário em `src/config.ts` (`PREVIEW_NOTICE`) | — |
| AUD-03 (alteração local) | Nenhum (decisão da titular sobre a pasta `Nekkora-Commercial`) | — |
| AUD-16..AUD-21 (contrato) | Fora do site: proposta-modelo (novo documento, se a titular quiser no repositório: `docs/comercial/proposta-modelo.md`) | — |

Sem alteração na Nekkora-lib, na AWS, no DNS ou no backend.

---

## H. Checklist de lançamento

### Impedimentos obrigatórios (o portão ou a lei bloqueiam)

- [ ] PUB-13: datas da campanha (AUD-04)
- [ ] PUB-09: razão social (AUD-33)
- [ ] PUB-19: condições comerciais, com gatilho do saldo, cancelamento e reembolso, garantia (AUD-16..AUD-18) ⚖
- [ ] PUB-17: textos comerciais, depois das decisões de AUD-07, AUD-09, AUD-10, AUD-19 e AUD-25
- [ ] PUB-09: aviso de privacidade, depois de AUD-35, AUD-38..AUD-40 ⚖
- [ ] AUD-35: coerência da base legal entre o Bookings e o site ⚖
- [ ] PUB-20: lembrete de 2 h, cancelamento com liberação e abertura efetiva do Teams (AUD-47)
- [ ] REP-04: confirmar que `contato@nekkora.com` recebe mensagens (AUD-29)
- [ ] PUB-10 e PUB-18: aviso de homologação e autorização de publicação (só no fim)
- [ ] INF-09: autorização de DNS (fora desta missão)

### Recomendações (antes da publicação, não bloqueiam no portão)

- [ ] AUD-03 / REP-05: descartar ou isolar a alteração local com "−50%"
- [ ] AUD-34: identificação do fornecedor no rodapé ⚖
- [ ] AUD-26: ocultar "Entrar"
- [ ] AUD-20, AUD-21: propriedade do código e cláusula de dados na proposta-modelo ⚖
- [ ] AUD-36, AUD-44: "telefone" e link das políticas no Bookings
- [ ] AUD-41: enquadramento de pequeno porte ⚖
- [ ] AUD-30: atualizar a matriz de alegações antes de aprovar o PUB-17
- [ ] Confirmar a região do bucket S3 e do tenant M365 (AUD-40)

### Podem aguardar

- [ ] AUD-15: frequência de reuniões explícita
- [ ] AUD-27: exemplo simples no Hosting
- [ ] AUD-32: prazo de resposta (K-04)
- [ ] AUD-37: empresa opcional no Bookings
- [ ] AUD-31: marcar documentos antigos como histórico
- [ ] Envio automático (PUB-21): continua opcional; o backend **não** foi ativado

---

## Entrega final

1. **Pronto:**
   - tabela de preços, percentuais e lógica da campanha;
   - ausência de 50% na `main`;
   - critérios de categoria;
   - Hosting sem promessas;
   - bloco de exclusões;
   - canais (e-mail e LinkedIn);
   - integração técnica do Bookings;
   - portão e CI.
2. **Com inconsistências:** AUD-07, 09, 10, 13, 16, 19, 25, 35, 36, 37, 38, 42 e 43; documentos desatualizados
   (AUD-30, 31).
3. **Depende de decisão comercial:**
   - datas da campanha;
   - várias automações e pacotes;
   - texto "Por que os valores são baixos";
   - licenças × Hosting;
   - gatilho do saldo, cancelamento e garantia;
   - botão Entrar;
   - diálogo do Hosting;
   - retenção.
4. **Depende de revisão jurídica:** AUD-16..AUD-18, AUD-20, AUD-21, AUD-34, AUD-35, AUD-39..AUD-41 e as questões de E.3.
5. **Impede o lançamento:** os itens de "Impedimentos obrigatórios" (§H).
6. **Pode ser resolvido depois:** os itens de "Podem aguardar" (§H).

**Nenhuma aprovação foi presumida.** `publicacao.json`, preços, aprovações, `avisoHomologacao` e o conteúdo público
estão inalterados. A alteração local em `src/content.ts` da pasta `Nekkora-Commercial` foi só lida, não modificada.
