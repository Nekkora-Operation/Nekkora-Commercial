# COM-001 · Gate 03 — Arquitetura UX/UI, decisões, assets e componentes

## 1. Hierarquia da página

| # | Âncora | Seção | Objetivo | CTA |
|---|---|---|---|---|
| — | — | Navbar fixa | Navegar; acesso à avaliação | "Solicitar avaliação" → `#contato` |
| 1 | `#inicio` | Hero | Automação sob medida, da necessidade à execução | Solicitar avaliação · Ver como funciona |
| 2 | `#solucoes` | Soluções | Apresentar Delivery e Hosting **separados**, com o estágio de cada um | Conhecer o Delivery · Entender o Hosting |
| 3 | `#delivery` | Delivery | Proposta por automação, como a demanda é tratada, exemplos rotulados | Solicitar avaliação de uma automação |
| 4 | `#como-funciona` | Como funciona | Ciclo de 6 etapas + fatores que influenciam o prazo | — |
| 5 | `#hosting` | Hosting | Disponibilidade em avaliação + 8 serviços com "como é contratado" | Solicitar avaliação de viabilidade |
| 6 | `#combinado` | Solução combinada | 3 modalidades, quando cada uma faz sentido, condições e limites | — |
| 7 | `#diferenciais` | Diferenciais | 6 mecanismos concretos de método (sem resultado prometido) | — |
| 8 | `#transparencia` | Transparência | Definido em proposta · Não incluído automaticamente · Dependências · Produtos em desenvolvimento | — |
| 9 | `#contato` | Contato | Solicitação de avaliação; canais só quando confirmados | Revisar solicitação (demonstração) |
| — | — | Footer | Atalhos, estado dos canais, aviso de homologação | — |

Menu: Soluções, Delivery, Como funciona, Hosting, Transparência, Contato (seis itens — Combinado e Diferenciais
ficam no rodapé e nos links internos para não sobrecarregar a barra).

**Mobile (≤ 900 px):** uma coluna; ilustrações depois do texto; Steps vertical (comportamento da lib); cards de
oferta empilhados; catálogo do Hosting em 2 colunas até 640 px e, abaixo disso, acordeão (D-17); CTAs do hero ocupam a largura.
Menu recolhível da `Navbar` (≤ 960 px), Esc fecha.

## 2. Direção visual — avaliação do Sakura Dark

Medições no Chromium (tokens computados da lib, razão de contraste WCAG):

| Par | Sakura Dark | Sage Light | Nekkora Light | Midnight Blue (V1) |
|---|---|---|---|---|
| texto / fundo | 17,09 | 14,01 | 14,98 | 17,30 |
| texto secundário / fundo | 7,37 | 5,13 | 6,21 | 7,46 |
| texto secundário / superfície | 5,94 | 5,58 | 6,82 | 6,82 |
| acento / fundo | 9,55 | 5,33 | **4,36** | 8,62 |
| acento / superfície | 7,70 | 5,80 | 4,78 | 7,88 |
| branco / `solid-accent` | 5,01 | 5,80 | 4,78 | 4,96 |
| texto muted / fundo | 4,06 | 2,66 | 2,94 | 4,10 |

axe-core (WCAG 2.1 AA) na página final: **Sakura Dark 0 violações** (mobile e desktop) · **Sage Light 0** (os nós sobre gradiente que o axe não decide foram medidos por pixels, todos ≥ 4,5:1 — ver relatório) ·
Nekkora Light **8 nós** de `color-contrast` (acento `#C2466D` sobre o fundo `#F8F3F5` = 4,35:1 em eyebrows, links
pequenos e botões outline) · Porcelain Light 1 nó (corpo do `Alert` info, 4,47:1).

**Decisão D-01 — tema principal: Sakura Dark.** Identidade mais "Nekkora" segundo a própria lib, contraste alto em
todos os pares de texto, sem efeitos novos (os brilhos radiais já existiam e usam tokens).
**Decisão D-02 — tema claro alternativo: Sage Light** (par do `ThemeToggle`). O par natural seria o Nekkora
Light, mas ele falha AA com o token oficial de acento. Corrigir isso exigiria sobrescrever um token da lib, o que a
missão proíbe. O Sage Light já era o tema claro aprovado na V1 e passa sem violações. A correção do acento do Nekkora
Light é **pendência da lib** (P-LIB-01), e só depois dela o par pode voltar a ser Sakura Dark ↔ Nekkora Light.

O texto `muted` não é usado em conteúdo informativo da página: o aviso do formulário, antes em muted, passou a
`text-secondary`. O muted continua presente em placeholders de componentes da lib (P-LIB-02).

## 3. Decisões de conteúdo e estrutura

| ID | Decisão | Motivo | Dependências avaliadas |
|---|---|---|---|
| D-03 | Seção **Studio** removida | Restrição 8 (Studio não pode ser porta de entrada nem produto disponível) | Links do menu, footer e hero (`#studio`) removidos; a cena SVG foi reaproveitada no Delivery (`StudioScene` → `DeliveryScene`, sem referência visual ao Studio) |
| D-04 | Seção **Monitoramento** removida | Tabela de execuções e painel com números fictícios (restrições 7, 11, 12); monitoramento não pode parecer incluído | O conceito virou dois componentes opcionais do Hosting (técnico e de processos). `ObservabilityScene` foi mantida no código, sem uso (o tree-shaking a tira do bundle), para quando houver oferta autorizada |
| D-05 | Seção **Suporte** removida | "Acompanhamento contínuo" e "operação assistida" implícitos (restrições 7 e 9) | Os conceitos viraram componentes opcionais do Hosting (operação assistida, correção de incidentes, sustentação). `SupportScene` foi mantida no código, sem uso |
| D-06 | Nova chave de tema `nekkora-commercial-tema` | Quem visitou a V1 tem `midnight-blue` salvo, e o `ThemeProvider` aplicaria essa escolha antiga | A preferência antiga não é migrada (a direção visual mudou); `index.html` aceita só `sakura-dark` e `sage-light` |
| D-07 | Painel do hero trocado pela **jornada ilustrativa** | O painel tinha "156 execuções / 98,1% / 3/3 agentes" | A nova jornada não tem números, horários nem status. Tem o selo visível "Ilustração" e o atributo `data-demo` |
| D-08 | Textos centralizados em `src/content.ts` | Revisão comercial em um só arquivo, com IDs da matriz em comentários | As seções só montam o layout |
| D-09 | Canais com **validação**, e `null` como padrão | Não há canal confirmado; destino provisório não pode parecer funcional | `CHANNELS` filtra número/e-mail/URL inválidos. Sem canal: aviso, formulário em demonstração, sem botão flutuante, CTA da barra vai para `#contato`. Com canal: comportamento da V1 preservado (WhatsApp com mensagem pronta), verificado em `evidencias/canais/` |
| D-10 | Interesse principal via **`RadioGroup`**, não `SelectMenu` | São 4 opções curtas, com descrição, e todas ficam visíveis. Evita o placeholder do `SelectMenu`, que falhava contraste na V1. O campo passou a ser obrigatório | `SelectMenu` continua disponível na lib; nada foi alterado nela |
| D-11 | Contador do `Textarea` substituído por `hint` com o limite | O contador da lib usa `text-muted` (falha axe na V1) | `maxLength` 1000 mantido |
| D-12 | Skip link próprio (`.skip-link`) | `nk-visually-hidden` deixava o link invisível mesmo com foco | — |
| D-13 | Foco no primeiro campo inválido e, depois de validar, no resumo | Teclado e leitor de tela; o resumo ficava sob a barra fixa | `scroll-margin-top` no resumo |
| D-14 | Tagline oficial fora do rodapé | "AUTOMATE · OBSERVE · EVOLVE" poderia sugerir monitoramento incluído (B-01) | Nada mudou na lib; outras aplicações seguem usando a tagline |
| D-15 | Aviso "Versão para homologação" no rodapé (`PREVIEW_NOTICE`) | Deixa claro que esta versão não está publicada | Desligar só com autorização de publicação |
| D-17 | **R1 —** Catálogo do Hosting em acordeão nativo (`<details>`/`<summary>`) até 640 px; expandido em tablet e desktop | Revisão do PR #1: página mobile longa. A condição "Como é contratado" fica **no resumo**, sempre visível; só a definição do serviço recolhe | Teclado nativo (Tab, Enter, Espaço), foco visível com `--nk-focus-ring`, sem dependência nova. Altura mobile 375 px: ~14.300 → 13.735 px |
| D-18 | WhatsApp: `window.open(url, '_blank', 'noopener,noreferrer')` **desde a abertura**. A página não tenta detectar se a aba foi criada: diz só "Pedimos ao navegador para abrir o WhatsApp" e mostra **sempre** o link manual (`rel="noopener noreferrer"`) com a mensagem pronta | Revisões do PR #1: não afirmar sucesso sem confirmação; a 1ª versão da R1 (sem `noopener` + `opener = null` depois) deixava um intervalo sem garantia e **enviava o Referer** à aba externa (comprovado no [controle negativo](evidencias/controle-negativo-r1/LEIA-ME.md)) | Mesmo texto com aba aberta ou bloqueada. Medido na aba: `opener` nulo e sem Referer |
| D-19 | **Modelo C (Poster)** aplicado a partir do mockup da responsável: hero centralizado com arco, cards numerados, seção Preços, etapas em cards, Hosting em faixa de acento sólido, Transparência em blocos, contato em pôster centralizado, rodapé enxuto, **Sage Light como tema padrão**, entrelinha 1,5 → 1,55 | Pedido da responsável (zip `Website UI mockups redesign`) | Seções Delivery, Combinado e Diferenciais, catálogo de 8 serviços com acordeão (D-17), ilustração da jornada, mascote e bloco de produtos internos removidos, como no mockup (PUB-15). Altura mobile 375 px: 13.735 → 8.476 px |
| D-20 | Contato: o botão "Solicitar avaliação" do pôster leva ao formulário logo abaixo (`#solicitacao`) | No mockup o botão tinha `href="#"` (sem destino) e a legenda citava o formulário em demonstração | Formulário validado, modo demonstração e fluxo do WhatsApp (D-18) mantidos sem alteração |
| D-21 | Link "Conhecer o Delivery" aponta para `#precos` (no mockup, `#contato`) | A seção Delivery deixou de existir; Preços é o bloco do Delivery | — |
| D-22 | Ajustes de contraste sobre o mockup: aviso da faixa do Hosting com fundo escurecido (`rgba(0,0,0,.16)`, era branco 14%) e selo "−50%" sólido | axe: texto branco do aviso e o selo soft de sucesso ficavam < 4,5:1 no Sage Light | Valores lidos por leitor de tela com "Valor sem desconto / com desconto de lançamento" (o riscado não é anunciado) |
| D-16 | Brilhos decorativos com intensidade por modo (`--glow-hero`/`--glow-contact`: 16/18 % escuros, 7/10 % claros) e bloco de contato sobre `surface-sunken`, com o brilho atrás do formulário | Medição por pixels: no Sage Light mobile o brilho do hero baixava o texto secundário a 4,32:1; no Sakura Dark o `Alert` de aviso ficava em 3,5–4,1:1 | Variáveis locais de composição, sem alterar token da lib |

## 4. Inventário de assets

| Asset | Origem | Uso | Situação |
|---|---|---|---|
| Logo (símbolo + nome) | `<Logo>` da lib | Navbar, footer, manifesto (símbolo) | Oficial, sem alteração |
| Favicons (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`) | `Nekkora-lib/brand/export/web/` | `public/` | Byte a byte iguais aos da lib (SHA-1 conferido) |
| Mascote Neko (gato de óculos Cat-Eye) | `src/illustrations/Neko.tsx` (único desenho existente; a lib não tem mascote) | Hero (`NekoPeek`), cenas | Preservado sem alteração de traço; cores via `--ill-*` derivadas dos tokens |
| `DeliveryScene` (antes `StudioScene`) | `src/illustrations/Scenes.tsx` | Delivery | Só renomeada; texto alternativo inalterado ("fluxo de uma automação e documento") |
| `HostingScene` | idem | Hosting | Sem alteração |
| `ObservabilityScene`, `SupportScene` | idem | — | Mantidas sem uso (D-04, D-05) |
| Fonte Inter | `@import` do Google Fonts na `foundation.css` da lib | Toda a página | Requisição a terceiro (P-LIB-03) |

**Referências visuais aprovadas:** a missão não anexou nenhuma referência. A comparação foi feita contra o que a
lib define como oficial (símbolo Cat-Eye, wordmark, paletas). Se existir uma referência aprovada fora dos
repositórios, a conferência fica como pendência PUB-07.

## 5. Componentes da nekkora-lib utilizados

`ThemeProvider`, `ThemeToggle`, `Navbar`, `Logo`, `Button` (inclusive como link), `Link`, `Badge`, `Card`,
`CardHeader`, `IconBox`, `Icon`, `Text`, `SectionHeader`, `Steps`, `Alert`, `DescriptionList`, `Input` (máscara de
telefone), `RadioGroup`, `Textarea`, `FloatingButton` (só com WhatsApp confirmado).

O CSS local (`src/styles.css`) cuida de composição: grids, espaçamentos, a jornada do hero, cartões de serviço,
blocos de limite e transparência, skip link e paleta das ilustrações. Usa somente tokens `--nk-*`; não há cor
literal nova, exceto o `rgba` preto da sombra do painel, que já vinha da V1.
