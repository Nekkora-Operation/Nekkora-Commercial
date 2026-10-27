# COM-001 · Gate 02 — Matriz de alegações

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
| A-04 | Dimensionamento individual por automação | comprovada | Delivery, Diferenciais | — |
| A-05 | Vários processos podem ser solicitados pelo mesmo cliente | comprovada | Delivery | — |
| A-06 | Demandas respeitam fila operacional | comprovada | Delivery, Como funciona, Transparência | Sem posição, tempo de fila ou prioridade prometidos |
| A-07 | Reuniões combinadas conforme necessidade | comprovada | Delivery | — |
| A-08 | Tecnologias podem incluir Python, UiPath, Power Automate e integrações | condicional | Delivery, Diferenciais | "podem incluir" / "escolhidas na avaliação" |
| A-09 | Licenças e serviços de terceiros dependem de avaliação e proposta | comprovada | Delivery, Transparência | — |
| A-10 | Alterações futuras, sustentação e novas funcionalidades não incluídas automaticamente | comprovada | Transparência, Combinado, Hosting | — |
| A-11 | Prazo depende de fila, acessos, sistemas externos e homologação | comprovada | Como funciona, Transparência | Nenhum prazo numérico |
| A-12 | Exemplos de aplicação (conciliações, portais, e-mails/documentos, APIs, relatórios) | condicional | Delivery | Rotulados "exemplos"; viabilidade caso a caso |
| A-13 | Entrega e transferência conforme contratado | comprovada | Como funciona | Conteúdo da transferência não especificado |
| A-14 | Entrega pronta só com documentação, desenvolvimento, testes e homologação, cada etapa com aprovação do cliente | comprovada (modelo C) | Soluções | Texto do mockup da responsável |
| A-15 | Tecnologias, conforme o caso: Python, UiPath, Power Automate, integrações via API, sistemas web, dados e planilhas | condicional (NEKKORA-RELEASE-001 §4.3) | Soluções (card Delivery) | "conforme o caso" + "A viabilidade com cada sistema é confirmada na avaliação" no mesmo bloco — sem compatibilidade universal |
| A-16 | Viabilidade com cada sistema confirmada na avaliação | comprovada | Soluções | — |

## Hosting

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| H-01 | Hosting = infraestrutura e serviços associados à execução de automações | comprovada | Soluções, Hosting | — |
| H-02 | Hosting disponível para contratação | **pendente** | — | Página usa "avaliação de viabilidade" |
| H-03 | Os 8 componentes são distintos; cada um só vale se constar na proposta | comprovada | Hosting | Nenhum apresentado como incluído |
| H-04 | Hosting independente para automações de terceiros | condicional | Combinado | "sujeito a compatibilidade e disponibilidade" |
| H-05 | Contratação imediata / capacidade reservada | proibida | — | — |
| H-06 | Segurança, estabilidade ou desempenho do ambiente | pendente | — | Sem afirmação até definição técnica |

## Oferta combinada e diferenciais

| ID | Alegação | Status | Onde aparece | Condição / restrição |
|---|---|---|---|---|
| C-01 | Três modalidades: Delivery, Hosting, Delivery + Hosting | comprovada | Soluções, Combinado | Hosting com H-04 |
| C-02 | Nenhuma modalidade exige produtos internos | comprovada | Soluções, Combinado, Transparência | — |
| C-03 | Na combinação, requisitos do ambiente podem ser considerados desde a proposta | condicional | Combinado | "podem" |
| D-01 | Proposta escrita antes do desenvolvimento | comprovada | Diferenciais, Como funciona | Deriva de A-02/A-03 |
| D-02 | Homologação com aceite formal | comprovada | Diferenciais | Deriva de A-03 |
| D-03 | Responsabilidades de cada parte descritas na proposta | comprovada | Diferenciais, Transparência | Missão §1 ("explicitamente delimitados") |
| D-04 | Serviços independentes, sem pacote obrigatório | comprovada | Diferenciais | — |
| D-05 | Ferramenta escolhida pelo processo, não por plataforma própria | comprovada | Diferenciais | Deriva de A-08 + C-02 |

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
| PR-03 | Automação complexa (e pacotes): **sob orçamento**, orçamento individual | **aprovada** (COM-RELEASE-003-R1 §3.4) | Preços | Dimensionada na avaliação. **Sem desconto automático**: "desconto de lançamento aplicável" (do mockup) foi removido |
| PR-06 | A categoria (simples, média, complexa) é definida na avaliação por: sistemas, integrações, regras de negócio, volume, infraestrutura e licenciamento | comprovada (§4.4) | Preços | "Nem todo processo é simples ou médio" no mesmo bloco |
| PR-04 | Valores baixos porque uma ferramenta própria agiliza documentação e desenvolvimento, sem cortar etapas | autorizada no mockup | Preços | Sem nome de produto; não é oferecida nem exigida do cliente (P-02 continua proibida) |
| PR-05 | Licenças e serviços de terceiros são responsabilidade do cliente, fora dos valores | autorizada no mockup | Preços, Transparência | Indicadas na proposta |

## Condições comerciais (NEKKORA-RELEASE-001 §5.5)

Exibidas no bloco `data-pricing` ("Condições comerciais"). Nenhuma vira promessa de prazo, resultado ou disponibilidade.

| ID | Alegação | Status | Condição / restrição |
|---|---|---|---|
| CO-01 | Desenvolvimento sob demanda, escopo formalizado em proposta | comprovada | — |
| CO-02 | Preço aprovado pelo cliente antes do início do desenvolvimento | comprovada | — |
| CO-03 | Pagamento de 50% na contratação e 50% na entrega | comprovada | "conforme a proposta" |
| CO-04 | Demandas organizadas em fila | comprovada | "o início depende da fila e da aprovação da proposta" — sem posição ou prazo |
| CO-05 | Reuniões e acompanhamento | comprovada | "conforme as condições acordadas" |
| CO-06 | Licenças e custos externos tratados à parte | comprovada | "quando aplicáveis" |

## Privacidade (COM-RELEASE-002 §5.4 — minuta para aprovação da titular)

| ID | Alegação | Status | Base |
|---|---|---|---|
| PV-01 | O formulário não envia dados a servidores da Nekkora | comprovada | Código: sem back-end; homologação `sem-requisicoes-externas` |
| PV-02 | Só com confirmação do visitante, os dados seguem no texto da mensagem para o canal: o aplicativo de e-mail do visitante, endereçado a `contato@nekkora.com` (publicação atual), ou o WhatsApp (Meta), quando houver número | comprovada | Etapa "Confirme a sua solicitação"; jornadas `confirmacao-sem-abrir-nada` e `email-com-mensagem-exata`. O item do aviso descreve o canal em uso |
| PV-03 | Sem cookies, análise ou publicidade; só a preferência de tema no navegador | comprovada | Código (localStorage `nekkora-commercial-tema`); fonte e imagens do próprio site |
| PV-04 | A Amazon Web Services (AWS), que hospeda o site, processa dados técnicos de acesso (IP, navegador) para entregar as páginas e proteger o serviço | comprovada (PUB-11) | Não afirma "registra": os logs do CloudFront estão desligados (COM-RELEASE-003-aws §4); a AWS processa esses dados para entregar as páginas |
| PV-05 | Uso dos dados só para responder, realizar a conversa agendada (com Bookings) e preparar avaliação/proposta, a pedido do titular (LGPD art. 7º, V); retenção pelo tempo necessário ou exigido por lei; direitos do art. 18 pelo e-mail comercial | pendente de aprovação | Texto jurídico: aprovação `avisoDePrivacidade` (PUB-09). Bases legais por finalidade em [COM-RELEASE-005-privacidade](../release/COM-RELEASE-005-privacidade.md) |
| PV-06 | Com envio automático: o formulário envia os dados à Nekkora por um serviço na AWS, que os entrega na caixa comercial (Microsoft 365); o serviço guarda só um código técnico por 24 h e contadores por HMAC do IP por até 2 dias | **condicional** — só com endpoint (PUB-21) | Código: `api/solicitacoes/` (sem conteúdo no armazenamento; logs sem dados pessoais — testes `api-solicitacoes`, `logs-sem-dados-pessoais`). Substitui PV-01/K-05 quando ativo |
| PV-07 | Com Bookings: nome, e-mail, respostas e horário ficam na agenda da Nekkora no Microsoft 365; o Turnstile (Cloudflare) analisa sinais técnicos do navegador na confirmação do envio | **condicional** — só com URL do Bookings (PUB-20) / chave do desafio (PUB-21) | Depende da configuração real do Bookings (perguntas) — conferir antes da aprovação |

## Proibidas (só como exclusão)

| ID | Alegação | Status | Tratamento |
|---|---|---|---|
| X-01 | Preço fixo ou faixa de preço | proibida **fora do bloco `data-pricing`** | Modelo C: valores autorizados no mockup (PR-01..PR-03) |
| X-02 | Prazo garantido | proibida | Fatores que influenciam o prazo |
| X-03 | Economia percentual | proibida | Não usado |
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
| K-07 | "Agendar conversa" pelo Microsoft Bookings | **pendente** (PUB-20): URL oficial não informada | Sem a URL, o botão não aparece. A página não promete duração, plataforma nem antecedência (configuração do Bookings ainda não confirmada) e nunca afirma que a reunião foi marcada |
| K-08 | "Solicitação recebida" (envio automático) | **condicional** (PUB-21) | Só com a confirmação do backend (202, mesmo `idSolicitacao`). Sem endpoint publicado, a jornada continua pelo e-mail |
| B-01 | Tagline oficial "AUTOMATE · OBSERVE · EVOLVE" | condicional | Não exibida nesta página: "OBSERVE" pode ser lido como monitoramento incluído. A tagline não foi alterada na lib. |
