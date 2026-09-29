# Nekkora Commercial Experience V1 — Arquitetura da página

Página única (landing comercial) com navegação por âncoras. Temas: **Midnight Blue** (escuro, padrão) e
**Sage Light** (claro), alternados pelo `ThemeToggle` da nekkora-lib na barra de navegação. A escolha fica no
`localStorage` (`nekkora-commercial-theme`) e é aplicada antes da primeira pintura por um script no `index.html`.
Todos os componentes de interface vêm da **nekkora-lib**; o que é específico da página
(ilustrações, composição das seções) fica em `src/`.

## Seções (ordem da página)

| # | Âncora | Seção | Objetivo | Blocos | Componentes da lib |
|---|---|---|---|---|---|
| — | — | Navbar fixa | Navegar e falar com a gente a qualquer momento | Logo, Início, Studio, Hospedagem, Monitoramento, Suporte, Contato, CTA WhatsApp | `Navbar`, `Logo`, `Button` (href) |
| 1 | `#inicio` | Hero | Dizer em segundos quem somos e o que oferecemos | Selo dos 4 pilares, headline, subheadline, CTA WhatsApp, CTA Studio, pilares, painel de operação com o gato espiando | `Badge`, `Button`, `Card`, `Icon`, `Text` |
| 2 | `#entrega` | O que a Nekkora entrega | Apresentar os 4 pilares | 4 cards: ícone, título, descrição, destaque de valor, link | `SectionHeader`, `Card`, `IconBox`, `Link` |
| 3 | `#como-funciona` | Como funciona | Mostrar a jornada do cliente | Linha do tempo com 5 etapas | `SectionHeader`, `Steps` |
| 4 | `#studio` | Studio | Vender o Studio como porta de entrada | Texto, 3 selos de valor, 5 benefícios, CTA, ilustração (gato analisando fluxo + documento) | `SectionHeader`, `Badge`, `Icon`, `Button` |
| 5 | `#hospedagem` | Hospedagem | "Não somos só software: operamos a execução" | Texto, 4 recursos, ilustração (gato guardando o rack) | `SectionHeader`, `IconBox` |
| 6 | `#monitoramento` | Monitoramento | "Não basta executar, é preciso acompanhar" | Texto, 5 tópicos, ilustração (central de telas), tabela de execuções de exemplo | `SectionHeader`, `IconBox`, `Card`, `Table`, `Badge` |
| 7 | `#suporte` | Suporte | Apoio humano e contínuo | Texto, 4 itens, frase de destaque, ilustração (gato com fone) | `SectionHeader`, `IconBox` |
| 8 | `#diferenciais` | Diferenciais | Posicionamento comercial | 6 cards + manifesto "clareza, operação e continuidade" | `SectionHeader`, `Card`, `IconBox`, `Logo` |
| 9 | `#contato` | Contato | Converter | Chamada, WhatsApp, e-mail, Instagram, LinkedIn, formulário | `SectionHeader`, `Button`, `Link`, `Input`, `SelectMenu`, `Textarea`, `Badge` |
| — | — | Footer | Fechamento e atalhos | Logo + tagline, links de produto e empresa, contatos, copyright | `Logo`, `Link` |
| — | — | WhatsApp flutuante | Contato em qualquer ponto | Canto inferior direito, tooltip "Fale conosco" | `FloatingButton` |

## Wireframe (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ [logo]   Início Studio Hospedagem Monitor. Suporte Contato [WA]│  Navbar fixa
├──────────────────────────────────────────────────────────────┤
│ selo · HEADLINE (2–3 linhas)          │   🐱 (espiando)       │
│ subheadline                           │ ┌ painel operação ┐   │  Hero
│ [Falar no WhatsApp] [Conhecer Studio] │ │ 156 · 98% · 3/3 │   │
│ ✦ Studio ▤ Hospedagem ∿ Monit. ☊ Sup.  │ └ execuções ─────┘   │
├──────────────────────────────────────────────────────────────┤
│              O QUE A NEKKORA ENTREGA (centralizado)          │
│   [Studio]   [Hospedagem]   [Monitoramento]   [Suporte]      │  4 cards
├──────────────────────────────────────────────────────────────┤
│ COMO FUNCIONA   ①──②──③──④──⑤                                │  Steps
├──────────────────────────────────────────────────────────────┤
│ texto + benefícios + CTA            │  ilustração Studio     │
│ ilustração Hospedagem               │  texto + 4 recursos    │  alterna lados
│        MONITORAMENTO (faixa destacada, centralizado)         │
│ ilustração central de telas         │  5 tópicos             │
│ [ tabela de execuções de exemplo — largura total ]           │
│ texto + itens + frase               │  ilustração Suporte    │
├──────────────────────────────────────────────────────────────┤
│ DIFERENCIAIS  [6 cards 3×2]   [manifesto com o símbolo]      │
├──────────────────────────────────────────────────────────────┤
│ ┌ CONTATO (bloco destacado) ────────────────────────────────┐│
│ │ chamada + WhatsApp + e-mail  │  formulário               ││
│ │ Instagram · LinkedIn         │  (abre o WhatsApp pronto) ││
│ └───────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│ logo+tagline │ Produto │ Empresa │ Fale com a gente           │  Footer
└──────────────────────────────────────────────────────────────┘
                                                        (◉ WA)  flutuante
```

**Mobile (≤ 900 px):** tudo vira uma coluna, as ilustrações vêm depois do texto e a Navbar vira menu recolhível
(≤ 960 px). O Steps fica vertical, os cards passam a 2 colunas e depois a 1, e os CTAs do hero ocupam a largura toda.
O botão flutuante some enquanto a seção de contato está na tela, para não cobrir o formulário.

## Ilustrações

Todas em SVG, desenhadas em código (`src/illustrations/`), com o mesmo gato de óculos Cat-Eye do logo. As cores
vêm de variáveis `--ill-*` (`src/styles.css`) derivadas dos tokens do tema ativo, então as cenas acompanham o
tema escolhido — nos temas claros o corpo do gato usa a cor secundária para os óculos continuarem visíveis:

| Componente | Tema | Cena |
|---|---|---|
| `NekoPeek` | Operação (hero) | Gato espiando por cima do painel de operação |
| `StudioScene` | Studio | Gato com lupa diante do fluxo da automação e de um documento gerado |
| `HostingScene` | Hospedagem | Gato guardando o rack de servidores, com um escudo |
| `ObservabilityScene` | Monitoramento | Gato numa central de telas (gráfico, volume, status e alerta) |
| `SupportScene` | Suporte | Gato com fone, entre mensagens e alertas resolvidos |

Cada ilustração tem `role="img"` e texto alternativo descritivo.

## Formulário de contato

Não há back-end nesta fase. O formulário valida os campos e, ao enviar, abre o WhatsApp com a mensagem já
montada (nome, empresa, interesse, mensagem e contatos). Nada é armazenado.

## Acessibilidade

- Contraste AA: textos sobre fundos sólidos usam os tokens `--nk-solid-*` da lib.
- Foco visível em links, botões e campos.
- Link "Pular para o conteúdo".
- Status nunca depende só da cor: todo badge tem texto.
- Navegação por teclado no menu mobile (Esc fecha) e no SelectMenu.
- Rolagem suave desativada com `prefers-reduced-motion`, que também desliga o pulso do botão flutuante.
