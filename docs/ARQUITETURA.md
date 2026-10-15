# Nekkora Commercial — Arquitetura da página

Versão atual: **COM-001** (posicionamento comercial Delivery + Hosting). A versão anterior (Commercial Experience
V1: Studio, hospedagem, monitoramento e suporte) está descrita no histórico do git (`da1f8f3`) e na
[auditoria](com-001/01-auditoria.md).

Página única (landing comercial) com navegação por âncoras. Temas: **Sakura Dark** (padrão) e **Sage Light**,
alternados pelo `ThemeToggle` da nekkora-lib na barra de navegação. A escolha fica no `localStorage`
(`nekkora-commercial-tema`) e é aplicada antes da primeira pintura por um script no `index.html`.
Todos os componentes de interface vêm da **nekkora-lib**. O que é específico da página (texto, ilustrações,
composição das seções) fica em `src/`.

## Documentos da COM-001

| Documento | Conteúdo |
|---|---|
| [01-auditoria.md](com-001/01-auditoria.md) | Gate 01: inventário e diagnóstico da V1 e da lib |
| [02-contrato-comercial.md](com-001/02-contrato-comercial.md) | Gate 02: o que a página pode dizer sobre cada oferta |
| [03-matriz-alegacoes.md](com-001/03-matriz-alegacoes.md) | Gate 02: alegações com status comprovada/condicional/pendente/proibida |
| [04-arquitetura-ux.md](com-001/04-arquitetura-ux.md) | Gate 03: hierarquia, avaliação de tema, decisões D-01..D-16, assets e componentes |
| [05-texto-comercial.md](com-001/05-texto-comercial.md) | Texto consolidado (gerado de `src/content.ts`) |
| [06-roteiro-apresentacao.md](com-001/06-roteiro-apresentacao.md) | Roteiro de apresentação curta |
| [07-checklist-homologacao.md](com-001/07-checklist-homologacao.md) | Checklist para a responsável |
| [08-pendencias-publicacao.md](com-001/08-pendencias-publicacao.md) | Decisões pendentes (comerciais, lib, repositório) |
| [09-relatorio-qualidade.md](com-001/09-relatorio-qualidade.md) | Gate 05: comandos executados, resultados e limitações |

## Seções (ordem da página)

`#inicio` Hero → `#solucoes` Soluções → `#delivery` Delivery → `#como-funciona` Como funciona → `#hosting` Hosting →
`#combinado` Solução combinada → `#diferenciais` Diferenciais → `#transparencia` Transparência → `#contato` Contato.
Detalhes em [04-arquitetura-ux.md](com-001/04-arquitetura-ux.md).

## Contato e formulário

Não há backend. Os canais vêm de `src/config.ts`, e só aparecem os que têm valor confirmado e válido. Sem nenhum
canal, a página mostra "Canais de contato em definição", e o formulário valida e exibe o resumo da solicitação,
declarando que nada foi enviado. Com WhatsApp confirmado, o formulário abre o WhatsApp com a mensagem montada e o
botão flutuante volta. Nada é armazenado.

## Acessibilidade

- Contraste AA verificado com axe-core nos dois temas (0 violações). Fundos sólidos usam os tokens `--nk-solid-*` da lib.
- Link "Pular para o conteúdo" visível ao receber foco; foco visível em links, botões e campos.
- Formulário: rótulos visíveis, `RadioGroup` com legenda, erros associados e foco no primeiro campo inválido. Depois da validação, o foco vai ao resumo.
- Status nunca depende só da cor; ilustrações com `role="img"` e texto alternativo.
- Menu mobile operável por teclado (Esc fecha). Rolagem suave desativada com `prefers-reduced-motion`.
