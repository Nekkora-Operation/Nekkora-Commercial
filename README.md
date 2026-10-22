# nekkora-commercial

Página comercial da Nekkora (**COM-001 — posicionamento comercial**). Apresenta duas ofertas complementares:

- **Nekkora Delivery** — desenvolvimento de automações por demanda, com escopo, preço e aceite definidos em proposta.
- **Nekkora Hosting** — infraestrutura e serviços para executar automações, em avaliação de viabilidade.

Feita com **Vite + React + TypeScript** e a **[nekkora-lib](../Nekkora-lib)** (design system da Nekkora).
Tema padrão **Sakura Dark**, com alternância para **Sage Light**.

> **Versão para homologação.** Os canais de contato ainda não foram confirmados: a página não mostra WhatsApp,
> e-mail nem redes sociais, e o formulário funciona em modo de demonstração (valida, mas não envia nada).
> Veja [docs/com-001/08-pendencias-publicacao.md](docs/com-001/08-pendencias-publicacao.md).

## Rodando localmente

As duas pastas precisam ficar lado a lado, porque a lib é instalada direto da pasta vizinha:

```
projetos/
├── Nekkora-lib/
└── Nekkora-Commercial/
```

```bash
# 1. gerar a lib (uma vez, ou sempre que a lib mudar)
cd Nekkora-lib && npm install && npm run build

# 2. rodar a página
cd ../Nekkora-Commercial && npm install
npm run dev        # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build estático em `dist/` |
| `npm run preview` | Serve o build para conferir |
| `npm run check` | Tipos + build (rodar antes de juntar uma branch) |
| `npm run homologacao -- <url> <pasta>` | Verificação em navegador real: capturas, axe-core, teclado, formulário, links e alegações proibidas. Precisa de Playwright e axe-core (`NEKKORA_PW_MODULES=<node_modules que os contenha>`) |
| `npm run texto` | Gera `docs/com-001/05-texto-comercial.md` a partir de `src/content.ts` |

## Onde mudar o quê

| Quero mudar… | Arquivo |
|---|---|
| Qualquer texto da página | `src/content.ts` (os comentários `[A-01]`… apontam a [matriz de alegações](docs/com-001/03-matriz-alegacoes.md)) |
| Canais de contato, menu, aviso de homologação | `src/config.ts` |
| Layout de uma seção | `src/sections/*.tsx` |
| Espaçamentos e composição | `src/styles.css` (somente tokens `--nk-*`) |

Antes de mudar uma promessa comercial, atualize o [contrato](docs/com-001/02-contrato-comercial.md) e a matriz.

## Estrutura

```
src/
├── content.ts           texto comercial (fonte única)
├── config.ts            canais de contato validados, menu, aviso de homologação, chave do tema
├── App.tsx              Navbar, seções, footer e WhatsApp flutuante (só com número confirmado)
├── styles.css           layout e composição (cores e componentes vêm da lib)
├── sections/            Hero, Solutions, Delivery, HowItWorks, Hosting, Combined, Differentials,
│                        Transparency, Contact, Footer
└── illustrations/       mascote (Neko) e cenas em SVG
scripts/                 homologacao.mjs, homologacao-canais.mjs, exportar-texto.mjs
docs/ARQUITETURA.md      visão geral da página
docs/com-001/            auditoria, contrato, matriz, arquitetura, texto, roteiro, checklist, pendências,
                         relatório e evidências
public/                  favicons da marca (idênticos aos da nekkora-lib)
```

## Release, homologação e publicação (NEKKORA-RELEASE-001)

- Dados que só a titular confirma (canais, campanha, controlador, aprovações): [`publicacao.json`](publicacao.json).
  `npm run verificar:publicacao` lista o que falta e **bloqueia o deploy de produção**.
- nekkora-lib: tarball do CI em [`vendor/`](vendor/) (`npm run verificar:lib -- --reconstruir` refaz e confere o hash).
- `npm test` (portão + rollback) · `npm run homologacao` (página) · `npm run homologacao:canais` (jornada, build sintético)
  · `node scripts/desempenho.mjs` — Playwright e axe-core são devDependencies (`npx playwright install`).
- CI, preview, deploy de produção manual e rollback: [`docs/release/COM-RELEASE-003-operacao.md`](docs/release/COM-RELEASE-003-operacao.md).
- Relatórios: [`docs/release/`](docs/release/) · pendências: [`COM-RELEASE-PENDENCIAS.md`](docs/release/COM-RELEASE-PENDENCIAS.md).
