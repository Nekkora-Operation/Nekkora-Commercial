# COM-001 · Gate 01 — Auditoria técnica e visual

Data: 2026-10-15 · Base auditada: `Nekkora-Commercial` `main` @ `da1f8f3` e `Nekkora-lib` `main` @ `c4c479f`
(ambos sincronizados com `origin`). Evidência de partida: [`evidencias/antes/`](evidencias/antes/resumo.md).

## 1. Nekkora-Commercial — estado encontrado

| Item | Situação |
|---|---|
| Stack | Vite 8 + React 19 + TypeScript 7, página única com âncoras. Sem roteador, sem backend. |
| Scripts | `dev`, `build`, `preview`, `typecheck`, `check` (= typecheck + build). **Não há testes automatizados nem lint.** `npm run check` passou na base (334,6 kB JS / 79 kB CSS). |
| Dependência visual | `nekkora-lib` via `file:../Nekkora-lib` (link simbólico em `node_modules`). `dist/` da lib gerado em 2026-10-10, posterior ao último commit da lib — atualizado. |
| Componentes | `src/sections/` (10 seções), `src/illustrations/` (mascote `Neko` + 5 cenas SVG), `src/config.ts` (contatos e menu), `src/styles.css` (223 linhas, só composição + paleta das ilustrações derivada de tokens). |
| Tema | `ThemeProvider` da lib, par Midnight Blue (padrão) ↔ Sage Light, chave `nekkora-commercial-theme`, script anti-piscada no `index.html`. |
| Assets | `public/favicon.ico`, `favicon.svg`, `apple-touch-icon.png` — **idênticos byte a byte** aos de `Nekkora-lib/brand/export/web/` (SHA-1 conferido). Logo sempre via `<Logo>` da lib. |
| Mascote | Desenhado em código em `src/illustrations/Neko.tsx` (gato de óculos Cat-Eye, mesmo traço do símbolo). A lib **não** possui componente nem arquivo de mascote; este é o único desenho existente. |
| Contato | `config.ts` com valores provisórios declarados no próprio arquivo: WhatsApp `5500000000000`, e-mail `contato@nekkora.com` (não confirmado), Instagram e LinkedIn apontando para a página inicial das redes. **Todos os CTAs da página levavam a esses destinos.** |
| Formulário | Valida nome, e-mail e mensagem; ao enviar abre `wa.me/5500000000000` com a mensagem — fluxo aparentemente funcional para destino falso. |
| Documentação | `README.md`, `docs/ARQUITETURA.md` (V1). |
| Repositório | Alteração local **não versionada** em `.gitignore` (adiciona `.env`/`.env.*`) e arquivo `.env` não rastreado com credenciais de outro contexto (Postgres/Azure). Nenhum dos dois foi tocado nem incluído nesta missão. Branch remota `claude/compassionate-knuth-7isa9u` é idêntica à `main`. |

## 2. Conteúdo que afirmava capacidades não autorizadas

| Local (base) | Afirmação | Conflito com a COM-001 |
|---|---|---|
| Hero · painel | "156 execuções", "98,1% sucesso", "3/3 agentes", "Tudo operacional", "Falha detectada e reprocessada" | Restrições 11 e 12 — números e operação fictícios, sem rótulo de demonstração. |
| Hero · selo e texto | "Automação · Hospedagem · Monitoramento · Suporte", "Tudo num só ecossistema, com quem acompanha a sua operação de perto" | Restrições 7 e 9 — monitoramento e suporte apresentados como incluídos. |
| Hero · CTA | "Conhecer o Studio" | Restrição 8 — Studio como porta de entrada. |
| Seção Studio | "Studio · a porta de entrada", "Todo projeto começa estruturado e documentado" (também em Diferenciais) | Restrição 8 — Studio apresentado como disponível e obrigatório. |
| Como funciona | "Estruturamos no Studio" → "Executamos" → "Monitoramos" → "Apoiamos a sustentação" | Restrições 8 e 9 — jornada única que embute Studio, hosting, monitoramento e sustentação. |
| Hospedagem | "Também operamos a execução", "Agendamentos e filas gerenciados pela Nekkora", "com estabilidade" | Hosting com disponibilidade comercial não confirmada apresentado como contratável. |
| Monitoramento | "Você recebe uma operação supervisionada", tabela de execuções com "412 lançamentos conciliados" e badge "Monitorando" | Restrições 7, 11 e 12 — monitoramento contínuo implícito e dados de exemplo com aparência de operação real. |
| Suporte | "Acompanhamento contínuo", "Um serviço contínuo e especializado", "a sua operação tem alguém olhando por ela" | Restrições 7 e 9 — sustentação contínua implícita. |
| Diferenciais / manifesto | "Entregamos clareza, operação e continuidade", "Você não precisa manter infraestrutura própria" | Restrição 9. |
| Contato | "Atendimento em horário comercial", "Respondemos com um caminho claro, do Studio ao suporte" | Horário de atendimento não autorizado; Studio. |
| Footer | "Estruturamos, hospedamos, monitoramos e sustentamos as suas automações", "A Nekkora opera." | Restrição 9. |

## 3. Responsividade e acessibilidade (medidas na base)

Executado `scripts/homologacao.mjs` (Chromium/Playwright 1.63, axe-core 4.13) — [resumo](evidencias/antes/resumo.md):

- Sem rolagem horizontal em 375 / 768 / 1280 / 1440 px. Menu mobile abre com Enter e fecha com Esc.
- **axe `color-contrast` (8 nós)**: `.contact__note` (texto local em `--nk-color-text-muted`), placeholder do
  `SelectMenu` e contador do `Textarea` (estilos da lib, `--nk-color-text-muted`).
- **Link "Pular para o conteúdo" invisível ao receber foco** (`nk-visually-hidden` sem variante de foco).
- **Foco não vai ao primeiro campo inválido** após enviar o formulário com erros.
- Fonte Inter carregada de `fonts.googleapis.com` por `@import` na `foundation.css` da lib (requisição de terceiro
  que não pertence a esta página — registrada como pendência da lib).

## 4. Nekkora-lib — inventário (somente leitura)

| Área | Disponível |
|---|---|
| Temas | `dark` (padrão da lib), `light`, `sakura-dark`, `midnight-blue`, `porcelain-light`, `sage-light`. Cada tema declara só a paleta; tokens semânticos derivados por modo via `color-mix()`. Par natural do Sakura Dark: `light` (Nekkora Light — mesma identidade ameixa/rosa). |
| Tokens | Cores (`--nk-color-*`, `--nk-solid-*` para fundos com texto branco AA), status, tipografia Inter, espaçamento base 4 px, raios `--nk-radius-*`, sombras, anel de foco `--nk-focus-ring`. |
| Marca | `<Logo>` (full, symbol, wordmark, app; tons brand/mono/inverse; tagline oficial "AUTOMATE · OBSERVE · EVOLVE"); SVGs e PNGs em `brand/`; favicons em `brand/export/web/`. |
| Componentes de página | `Navbar` (menu recolhível ≤ 960 px, Esc fecha, `tools`/`actions`), `SectionHeader`, `Steps`, `FloatingButton`, `ThemeToggle`, `ThemeProvider`. |
| Conteúdo | `Card` (+ `CardHeader/Body/Footer`), `Badge`, `IconBox`, `Icon` (73 ícones), `Text`, `Heading`, `Link`, `Button` (`href` vira link), `Table`, `DescriptionList`, `Alert`, `StatusRegion`, `Divider`. |
| Formulário | `Input` (máscaras, `error`, `hint`), `Textarea` (`showCount`), `Select`, `SelectMenu`, `RadioGroup` (fieldset/legend, `error`, `hint`), `Checkbox`, `Fieldset`. |
| Contratos de contraste | Tokens `--nk-solid-*` garantem AA com texto branco; `text-muted` é decorativo (≈ 4:1 em temas escuros) — usar `text-secondary` para texto informativo. |

## 5. Diagnóstico

1. A base é tecnicamente sólida (componentização, tokens, responsividade, foco, menu) e deve ser **preservada**
   na estrutura: Navbar, `ThemeProvider`, cenas SVG, padrões de seção, CSS de composição.
2. O **conteúdo** é incompatível com a COM-001: vende um ecossistema único (Studio → hospedagem → monitoramento →
   suporte) com números fictícios e contatos provisórios funcionais. Precisa ser reescrito a partir de um contrato
   comercial explícito (Gate 02), não ajustado frase a frase.
3. As seções Studio, Monitoramento e Suporte não têm lugar na nova hierarquia como ofertas; seus conceitos válidos
   (monitoramento, operação assistida, sustentação) migram para a delimitação de responsabilidades do Hosting e para
   a Transparência — ver decisões D-03 a D-05 em [04-arquitetura-ux.md](04-arquitetura-ux.md).
4. Problemas de acessibilidade locais (skip link, foco no erro, contraste do aviso) são corrigíveis na página.
   Os de contraste dentro de componentes da lib (placeholder do `SelectMenu`, contador do `Textarea`) são
   contornados pelo uso (escolha de componente/props) e registrados como pendência da lib, sem alterá-la.
