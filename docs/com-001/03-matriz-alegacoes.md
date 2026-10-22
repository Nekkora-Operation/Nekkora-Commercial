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
| PR-01 | Automação simples R$ 1.000 e média R$ 2.800, por automação | autorizada no mockup | Preços | "A faixa é confirmada na avaliação e fica registrada na proposta" no mesmo bloco |
| PR-02 | Lançamento: 50% de desconto em todas as automações nos próximos 2 meses (R$ 500 / R$ 1.400) | autorizada no mockup | Preços | "Vale para propostas aprovadas no período". **Datas de início e fim não definidas** (PUB-13) |
| PR-03 | Automações completas e pacotes: negociação à parte, desconto de lançamento aplicável | autorizada no mockup | Preços | Dimensionada na avaliação |
| PR-04 | Valores baixos porque uma ferramenta própria agiliza documentação e desenvolvimento, sem cortar etapas | autorizada no mockup | Preços | Sem nome de produto; não é oferecida nem exigida do cliente (P-02 continua proibida) |
| PR-05 | Licenças e serviços de terceiros são responsabilidade do cliente, fora dos valores | autorizada no mockup | Preços, Transparência | Indicadas na proposta |

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
| K-01 | Número de WhatsApp | pendente | Não exibido; sem botão flutuante |
| K-02 | E-mail comercial | pendente | Não exibido (antes: `contato@nekkora.com`, não confirmado) |
| K-03 | Perfis Instagram / LinkedIn | pendente | Não exibidos (antes: páginas iniciais das redes) |
| K-04 | Prazo de resposta / horário de atendimento | pendente | Removido ("Atendimento em horário comercial") |
| K-05 | O formulário não envia nem armazena dados nesta versão | comprovada | Fato do código (sem backend, sem rede) — exibido no formulário |
| B-01 | Tagline oficial "AUTOMATE · OBSERVE · EVOLVE" | condicional | Não exibida nesta página: "OBSERVE" pode ser lido como monitoramento incluído. A tagline não foi alterada na lib. |
