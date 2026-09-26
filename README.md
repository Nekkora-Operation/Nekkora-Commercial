# nekkora-commercial

Página comercial da Nekkora (**Commercial Experience V1**): apresenta o Studio, a hospedagem de automações, o
monitoramento e o suporte operacional, com contato direto por WhatsApp.

Feita com **Vite + React + TypeScript** e a **[nekkora-lib](../Nekkora-lib)** (design system da Nekkora).

## Rodando localmente

As duas pastas precisam ficar lado a lado, porque a lib é instalada direto da pasta vizinha:

```
projetos/
├── Nekkora-lib/
└── nekkora-commercial/
```

```bash
# 1. gerar a lib (uma vez, ou sempre que a lib mudar)
cd Nekkora-lib && npm install && npm run build

# 2. rodar a página
cd ../nekkora-commercial && npm install
npm run dev        # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build estático em `dist/` |
| `npm run preview` | Serve o build para conferir |
| `npm run check` | Tipos + build (rodar antes de juntar uma branch) |

> Mudou algo na lib? Rode `npm run build` na `Nekkora-lib`. A página usa um link para a pasta, então basta recarregar.

## Antes de divulgar

Preencha os dados reais em **`src/config.ts`**: número do WhatsApp, e-mail, Instagram e LinkedIn.
Hoje estão com valores provisórios.

## Estrutura

```
src/
├── config.ts            contatos, links do menu e mensagem padrão do WhatsApp
├── App.tsx              Navbar, seções, footer e WhatsApp flutuante
├── styles.css           layout e composição (cores e componentes vêm da lib)
├── sections/            Hero, Services, HowItWorks, Studio, Hosting, Monitoring, Support,
│                        Differentials, Contact, Footer
└── illustrations/       mascote (Neko) e cenas em SVG
docs/ARQUITETURA.md      seções, wireframe, ilustrações e decisões
public/                  favicons da marca
```
