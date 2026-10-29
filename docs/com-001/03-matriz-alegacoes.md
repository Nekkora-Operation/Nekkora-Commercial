# COM-001 · Gate 02 — Matriz de alegações

> **Atualizada na NEKKORA-COM-008-C (28/10/2026)** com as decisões da titular na COM-008-B e as correções da
> auditoria COM-008-A (AUD-30): campanha (PR-07), simulador (PR-08), condições (CO-03, CO-07, CO-08), textos de
> preço (PR-03..PR-05), etapas (A-13, A-14, D-01), privacidade (PV-05..PV-10, numeração igual à dos comentários de
> `src/content.ts`) e agendamento (K-07). Linhas de seções que **não existem** no modelo C estão marcadas como tal.
> Os textos continuam **em revisão**: `aprovacoes.textosComerciais`, `condicoesComerciais` e `avisoDePrivacidade` são
> `false`, e a revisão jurídica é obrigatória.

Status:
**comprovada** — consta da missão COM-001 (decisão da responsável) ou é fato verificável no código ·
**condicional** — só pode aparecer com a condição explícita no mesmo bloco ·
**pendente** — depende de decisão; **não aparece** na página até ser decidida ·
**proibida** — não pode aparecer, exceto como exclusão explícita (blocos `data-exclusion`).

A verificação automatizada (`scripts/homologacao.mjs`, `sem-alegacoes-proibidas`) procura percentuais, preços,
"24 h/24x7", SLA, ROI, "prazo garantido", "economia de N", "alta disponibilidade" e "monitoramento contínuo" no
texto renderizado e falha se aparecerem fora de um bloco de exclusão.

## Delivery

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| A-01 | A Nekkora desenvolve automações por demanda | comprovada | Hero, Soluções, Delivery | — |
| A-02 | Cada automação tem escopo, preço, condições e aceite próprios, definidos em proposta | comprovada | Hero, Soluções, Preços, Como funciona | Valores só no bloco `data-pricing` (PR-01..PR-05) |
| A-03 | Ciclo em 6 etapas (entendimento → entrega) | comprovada | Como funciona, Hero (ilustração) | — |
| A-04 | Dimensionamento individual por automação | comprovada | Preços (critérios), Soluções | — |
| A-05 | Vários processos podem ser solicitados pelo mesmo cliente, cada um com categoria, escopo, preço e aceite próprios | comprovada (COM-008-B, AUD-13) | Preços → Condições comerciais (CO-07), simulador | Contratar várias juntas não as transforma em uma complexa (AUD-07) |
| A-06 | Demandas respeitam fila operacional | comprovada | Preços (condições), Transparência | Sem posição, tempo de fila ou prioridade prometidos |
| A-07 | Reuniões combinadas conforme necessidade | comprovada | Preços (condições) | — |
| A-08 | Tecnologias podem incluir Python, UiPath, Power Automate e integrações | condicional | Soluções (ver A-15) | "conforme o caso" |
| A-09 | Licenças e serviços de terceiros indicados na proposta; em regra, contratados pelo cliente | comprovada (COM-008-B, AUD-10) | Preços (PR-05), Transparência | Mesma formulação nos dois blocos; servidores podem ser do cliente ou do Nekkora Hosting |
| A-10 | Alterações futuras, sustentação e novas funcionalidades não incluídas automaticamente | comprovada | Transparência, Hosting | — |
| A-11 | Prazo depende de fila, acessos, sistemas externos e homologação | comprovada | Como funciona, Transparência | Nenhum prazo numérico |
| A-12 | Exemplos de aplicação (conciliações, portais, e-mails/documentos, APIs, relatórios) | condicional | Delivery | Rotulados "exemplos"; viabilidade caso a caso |
| A-13 | Entrega definitiva após o aceite e a confirmação do pagamento, com documentação e dependências identificadas, nos termos do contrato | comprovada (COM-008-B, AUD-20) | Soluções, Como funciona (etapa 6) | Direitos sobre o código: Modelo A, **redação jurídica pendente** (`docs/comercial/condicoes-comerciais-minuta.md` §7.2) |
| A-14 | A entrega só é concluída depois de documentação, desenvolvimento, testes, homologação e aceite formal | comprovada (COM-008-B, AUD-19) | Soluções | Substitui "cada etapa mediante a sua aprovação" (aprovação só nos pontos de decisão) |
| A-15 | Tecnologias, conforme o caso: Python, UiPath, Power Automate, integrações via API, sistemas web, dados e planilhas | condicional (NEKKORA-RELEASE-001 §4.3) | Soluções (card Delivery) | "conforme o caso" + "A viabilidade com cada sistema é confirmada na avaliação" no mesmo bloco — sem compatibilidade universal |
| A-16 | Viabilidade com cada sistema confirmada na avaliação | comprovada | Soluções | — |

## Hosting

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| H-01 | Hosting = infraestrutura e serviços associados à execução de automações | comprovada | Soluções, Hosting | — |
| H-02 | Hosting disponível para contratação | **pendente** | — | Página usa "avaliação de viabilidade" |
| H-03 | Os 8 componentes são distintos; cada um só vale se constar na proposta | comprovada | Hosting | Nenhum apresentado como incluído |
| H-04 | Hosting independente para automações de terceiros | condicional | Diálogo: tipo "Hospedar uma automação existente" (AUD-25) | Só como pedido de **avaliação de viabilidade**; "sujeito a compatibilidade e disponibilidade". A seção "Combinado" não existe no modelo C |
| H-05 | Contratação imediata / capacidade reservada | proibida | — | — |
| H-06 | Segurança, estabilidade ou desempenho do ambiente | pendente | — | Sem afirmação até definição técnica |

## Oferta combinada e diferenciais

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| C-01 | Delivery e Hosting contratados separadamente ou em conjunto | comprovada | Soluções (nota) | Hosting com H-02/H-04 |
| C-02 | Nenhuma modalidade exige produtos internos | comprovada | Soluções | — |
| C-03 | Na combinação, requisitos do ambiente podem ser considerados desde a proposta | condicional | **Não aparece** (seção "Combinado" removida no modelo C) | "podem" |
| D-01 | Proposta escrita antes do desenvolvimento; aprovação nos pontos de decisão | comprovada (COM-008-B, AUD-19) | Como funciona ("Seis etapas, com a sua aprovação nos pontos de decisão."), Hero | Substitui "Nenhuma sem a sua aprovação" |
| D-02 | Homologação com registro e correção de defeitos e aceite formal; o silêncio não vale como aceite | comprovada (COM-008-B §5.4) | Hero, Como funciona (etapa 5) | Conceitos em `docs/comercial/condicoes-comerciais-minuta.md` §3 |
| D-03 | Responsabilidades de cada parte descritas na proposta | comprovada | Soluções, Transparência | Missão §1 ("explicitamente delimitados") |
| D-04 | Serviços independentes, sem pacote obrigatório | comprovada | Hero ("Sem pacote obrigatório") | Coerente com PR-03/CO-07: não há "pacotes" na complexa (AUD-07) |
| D-05 | Ferramenta escolhida pelo processo, não por plataforma própria | comprovada | **Não aparece** (seção "Diferenciais" removida) | Deriva de A-08 + C-02 |

## Produtos internos

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| P-01 | Studio, Platform e Agent em desenvolvimento, não necessários | comprovada | Modelo C: nenhuma menção (bloco removido pelo mockup) | Se voltar, só em bloco `data-internal-products` |
| P-02 | Studio como porta de entrada, obrigatório ou disponível | proibida | — | Removido (seção Studio, Hero, Como funciona, Diferenciais) |

## Preços do Delivery (modelo C — mockup da responsável, 2026-10-15)

Origem: `Website UI mockups redesign.zip` → `Commercial C - Poster.dc.html`, entregue pela responsável com o pedido
"atualize o código e depois abra a PR". Tratadas como **autorização para a PR**, não para publicação: a confirmação
final é a PUB-13/PUB-14. Só aparecem no bloco `data-pricing` (verificado: `precos-so-no-bloco-de-precos`).

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| PR-01 | Preço padrão por automação: simples **R$ 1.500**, média **R$ 3.500** | **aprovada** (COM-RELEASE-003-R1 §3.1, 22/10/2026; substitui R$ 1.000 / R$ 2.800 do mockup) | Preços | "A categoria é definida na avaliação e fica registrada na proposta" no mesmo bloco. Valores em `src/precos.ts` |
| PR-02 | Preços especiais de lançamento: simples **R$ 1.000** (economia de R$ 500, −33,33%), média **R$ 2.800** (economia de R$ 700, −20%) | **aprovada** (COM-RELEASE-003-R1 §3.1–3.3) | Preços | Cada preço mostra a própria economia, **calculada**, nunca digitada. Percentual truncado em 2 casas, para nunca anunciar mais do que o real. Só dentro do período aprovado (PUB-13); fora dele, só o preço padrão. **Proibido**: "50% de desconto", "metade do preço" ou qualquer desconto único para todas as automações (verificado pela homologação e por `precos.test.mjs`). Datas não definidas (PUB-13) |
| PR-03 | Automação complexa: **sob orçamento**, orçamento individual | **aprovada** (COM-RELEASE-003-R1 §3.4; COM-008-B) | Preços, simulador | Dimensionada na avaliação. **Sem desconto automático**. "Pacotes" e "várias automações contratadas em conjunto" **removidos** (AUD-07): a complexa é pela natureza do processo. No simulador, nunca tem valor; com ela, o total é "subtotal estimado" |
| PR-06 | A categoria (simples, média, complexa) é definida na avaliação por: sistemas, integrações, regras de negócio, volume, infraestrutura e licenciamento | comprovada (§4.4) | Preços | "Nem todo processo é simples ou médio" no mesmo bloco |
| PR-04 | "Como chegamos a esses valores": processos padronizados e ferramentas internas de documentação e desenvolvimento, sem retirar etapas | **opção A da COM-008-B** (AUD-09) | Preços | Sem nome de produto (P-02). **Proibido** afirmar redução de horas, de retrabalho ou ROI (não medidos). Substitui "Por que os valores são baixos" |
| PR-05 | Licenças e serviços de terceiros indicados na proposta, em regra contratados pelo cliente e fora dos valores; a automação pode rodar na infraestrutura do cliente ou no Nekkora Hosting, contratado à parte | COM-008-B (AUD-10) | Preços ("Licenças e infraestrutura"), Transparência | Não diz mais "servidores… responsabilidade do cliente" |
| PR-07 | Campanha de lançamento: dois meses a partir da publicação oficial; vale a **solicitação** recebida durante a campanha; proposta aceitável em até 7 dias corridos; preço individual por automação | **diretriz aprovada** (COM-008-B, AUD-04/AUD-06). **Datas pendentes** (PUB-13) | Preços (faixa "Lançamento"), simulador | Sem datas: preços de lançamento só como **prévia de homologação**, com "Nenhuma solicitação é elegível antes do início oficial". Fora do período: só o preço padrão. Comprovação da data da solicitação: `condicoes-comerciais-minuta.md` §8.1 |
| PR-08 | Simulador de investimento: estimativa por categoria; com a campanha vigente, "economia promocional" (diferença entre preços comerciais) e "desconto equivalente sobre o total calculável" (truncado) | NEKKORA-CALC-001 | Preços (dentro de `data-pricing`) | Valores só de `src/precos.ts`. Aviso obrigatório de estimativa; "não é uma economia operacional comprovada". **Proibidos** no simulador: ROI, horas economizadas, classificação automática da automação, valor para a complexa. Sem cadastro, sem envio, sem armazenamento |

## Condições comerciais (NEKKORA-RELEASE-001 §5.5)

Exibidas no bloco `data-pricing` ("Condições comerciais"). Nenhuma vira promessa de prazo, resultado ou disponibilidade.

| ID | Alegação | Status | Condição / restrição |
|---|---|---|---|
| CO-01 | Desenvolvimento sob demanda, escopo formalizado em proposta | comprovada | — |
| CO-02 | Preço aprovado pelo cliente antes do início do desenvolvimento | comprovada | — |
| CO-03 | Pagamento de 50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal | **diretriz aprovada** (COM-008-B, AUD-16) | Forma de **pagamento**, nunca desconto. Minuta: `condicoes-comerciais-minuta.md` §2 ⚖ |
| CO-04 | Demandas organizadas em fila | comprovada | "o início depende da fila e da aprovação da proposta" — sem posição ou prazo |
| CO-05 | Reuniões e acompanhamento | comprovada | "conforme as condições acordadas" |
| CO-06 | Licenças e custos externos tratados à parte | comprovada | "quando aplicáveis" |
| CO-07 | Pode solicitar várias automações: cada uma tem categoria, escopo, preço e aceite próprios | **diretriz aprovada** (COM-008-B, AUD-07/AUD-13) | — |
| CO-08 | Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei | **diretriz aprovada** (COM-008-B, AUD-17/AUD-18) | Nenhuma cláusula absoluta de retenção ou renúncia no site. Regras em `condicoes-comerciais-minuta.md` §4–§5 ⚖ |

## Privacidade (COM-RELEASE-002 §5.4 — minuta para aprovação da titular)

| ID | Alegação | Status | Base |
|---|---|---|---|
| PV-01 | O formulário não envia dados a servidores da Nekkora | comprovada | Código: sem back-end; homologação `sem-requisicoes-externas` |
| PV-02 | Só com confirmação do visitante, os dados seguem no texto da mensagem para o canal: o aplicativo de e-mail do visitante, endereçado a `contato@nekkora.com` (publicação atual), ou o WhatsApp (Meta), quando houver número | comprovada | Etapa "Confirme a sua solicitação"; jornadas `confirmacao-sem-abrir-nada` e `email-com-mensagem-exata`. O item do aviso descreve o canal em uso |
| PV-03 | **Esta página** não usa cookies, análise ou publicidade; só a preferência de tema no navegador; o simulador não guarda nem envia nada; o Bookings segue as regras da Microsoft | comprovada | Código (localStorage `nekkora-commercial-tema`); fonte e imagens do próprio site; homologação `sem-armazenamento:*` do simulador (AUD-43) |
| PV-04 | A Amazon Web Services (AWS), que hospeda o site, processa dados técnicos de acesso (IP, navegador) para entregar as páginas e proteger o serviço | comprovada (PUB-11) | Não afirma "registra": os logs do CloudFront estão desligados (COM-RELEASE-003-aws §4); a AWS processa esses dados para entregar as páginas |
| PV-05 | Com envio automático: o formulário envia os dados à Nekkora por um serviço na AWS, que os entrega na caixa comercial (Microsoft 365); o serviço guarda só um código técnico por 24 h e contadores por HMAC do IP por até 2 dias | **condicional** — só com endpoint (PUB-21) | Código: `api/solicitacoes/` (sem conteúdo no armazenamento; logs sem dados pessoais — testes `api-solicitacoes`, `logs-sem-dados-pessoais`). Substitui PV-01/K-05 quando ativo |
| PV-06 | Com Bookings: nome, e-mail, respostas e horário ficam na agenda da Nekkora no Microsoft 365 e são usados para confirmar, lembrar e realizar a conversa **pelo Microsoft Teams** | **condicional** — só com a URL do Bookings (configurada na COM-007; aprovação PUB-20 pendente) | AUD-38. Texto do Bookings proposto em `docs/comercial/privacidade-minuta.md` §4 (para a titular configurar no M365) |
| PV-07 | O Turnstile (Cloudflare) analisa sinais técnicos do navegador na confirmação do envio | **condicional** — só com a chave do desafio (PUB-21) | — |
| PV-08 | Uso dos dados só para responder, realizar a conversa agendada e preparar avaliação e proposta, a pedido do titular (art. 7º, V), **sem consentimento** (consentimento só para outro uso, pedido à parte); direitos do art. 18 pelo e-mail comercial | pendente de aprovação ⚖ | PUB-09. Distinção aceite × ciência × consentimento em `privacidade-minuta.md` §2 |
| PV-09 | Retenção: contatos sem contratação até seis meses após o último contato relevante; reservas do Bookings até 90 dias após a reunião ou o cancelamento | **diretriz aprovada** (COM-008-B, AUD-39); pendente de aprovação do aviso | O texto descreve o prazo, **não** uma eliminação automática (que não existe: procedimento manual pendente) |
| PV-10 | Microsoft e AWS podem processar dados fora do Brasil | comprovada (fato) / ⚖ adequação pendente | AUD-40. Regiões a confirmar |

## Proibidas (só como exclusão)

| ID | Alegação | Status | Tratamento |
|---|---|---|---|
| X-01 | Preço fixo ou faixa de preço | proibida **fora do bloco `data-pricing`** | Modelo C: valores autorizados no mockup (PR-01..PR-03) |
| X-02 | Prazo garantido | proibida | Fatores que influenciam o prazo |
| X-03 | Economia **operacional** (horas, custos, produtividade), em valor ou percentual | proibida | Não usado. A "economia" do bloco de preços e do simulador é só a **diferença entre preços comerciais** (PR-02, PR-08), e o simulador diz isso por extenso |
| X-04 | ROI | proibida | Não usado |
| X-05 | SLA | proibida | Listado em "Não incluído automaticamente" |
| X-06 | Atendimento 24 horas | proibida | Listado em "Não incluído automaticamente" |
| X-07 | Alta disponibilidade | proibida | Listado em "Não incluído automaticamente" |
| X-08 | Monitoramento contínuo incluído | proibida | Monitoramento só como componente opcional do Hosting |
| X-09 | Garantia, sustentação, evolução ou infraestrutura incluídas no desenvolvimento | proibida | Listado em "Não incluído automaticamente" |
| X-10 | Depoimentos, clientes, cases, logos de clientes | proibida | Não usado |
| X-11 | Números de execução, taxas de sucesso, indicadores | proibida | Painel do hero com "156 / 98,1% / 3/3" removido |
| X-12 | Exemplos demonstrativos com aparência de operação real | proibida | Modelo C: nenhuma ilustração de jornada (removida com o mascote) |

## Contato e marca

| ID | Alegação | Status | Tratamento |
|---|---|---|---|
| K-01 | Número de WhatsApp | fora do lançamento (decisão da titular, 22/10/2026) | Não exibido: sem botão flutuante, sem menção na página nem no aviso de privacidade. O código continua pronto para quando houver número |
| K-02 | E-mail comercial `contato@nekkora.com` | **confirmada** (titular, 22/10/2026) | Link no contato e canal da jornada "Solicitar avaliação": a mensagem confirmada abre no aplicativo de e-mail do visitante (mailto), sem afirmar envio |
| K-03 | LinkedIn `https://www.linkedin.com/company/nekkora` | **confirmada** (titular, 22/10/2026) | Link no contato (nova aba, isolada). Instagram fora (`null`) |
| K-04 | Prazo de resposta / horário de atendimento | pendente | Removido ("Atendimento em horário comercial") |
| K-05 | O formulário não envia nem armazena dados | comprovada | Fato do código (sem backend, sem rede). Com canal confirmado, a página só abre o WhatsApp ou o aplicativo de e-mail com a mensagem que o visitante confirmou |
| K-06 | Canais (WhatsApp, e-mail, LinkedIn, Instagram) | e-mail e LinkedIn confirmados | Vêm de `publicacao.json`. O portão exige e-mail e LinkedIn válidos; WhatsApp e Instagram são opcionais (se informados, precisam ser válidos) |
| K-07 | "Agendar conversa" pelo Microsoft Bookings | URL oficial **configurada** (NEKKORA-COM-007); aprovação **pendente** (PUB-20: lembrete de 2 h, cancelamento e abertura do Teams) | No topo, no contato, no diálogo e, como "Agendar uma conversa", no resultado do simulador: mesma URL, nova aba, sem opener nem Referer. A página não promete duração nem antecedência e nunca afirma que a reunião foi marcada |
| K-09 | Botão "Entrar" / área de clientes | **oculto** (COM-008-B, AUD-26) | Nenhum controle de acesso na página (homologação `entrar-oculto-sem-area-de-clientes`). Área de clientes é da futura Platform (`docs/roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md`) |
| K-10 | O formulário atende automação nova, hospedagem de automação existente e infraestrutura | comprovada (COM-008-C §8, AUD-25) | O CTA do Hosting abre com "Hospedar uma automação existente"; a mensagem diz o tipo de solicitação |
| K-08 | "Solicitação recebida" (envio automático) | **condicional** (PUB-21) | Só com a confirmação do backend (202, mesmo `idSolicitacao`). Sem endpoint publicado, a jornada continua pelo e-mail |
| B-01 | Tagline oficial "AUTOMATE · OBSERVE · EVOLVE" | condicional | Não exibida nesta página: "OBSERVE" pode ser lido como monitoramento incluído. A tagline não foi alterada na lib. |
