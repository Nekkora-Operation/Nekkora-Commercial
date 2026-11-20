# nekkora-commercial

Página comercial da Nekkora. Desde a **NEKKORA-COM-ECOSYSTEM-001** (v1.2.0, em homologação) apresenta o ecossistema
**Crie. Monitore. Execute.**, com três produtos independentes, contratados sozinhos ou em qualquer combinação:

- **Nekkora AI — Piloto** — criação de automações com inteligência artificial (a partir de R$ 100 por automação).
- **Nekkora Monitor** — acompanhamento das execuções (R$ 75 por automação, por mês).
- **Nekkora Hosting** — execução em máquina Windows ou Linux (por hora-máquina).

O Nekkora Delivery deixou de ser produto comercial; seus documentos ficam em [`docs/comercial/`](docs/comercial/) como
histórico dos compromissos assumidos.

Feita com **Vite + React + TypeScript** e a **[nekkora-lib](../Nekkora-lib)** (design system da Nekkora).
Tema padrão **Sakura Dark**, com alternância para **Sage Light**.

> **Versão para homologação.** Atendimento comercial só pelo WhatsApp oficial: o formulário de atendimento prepara a
> mensagem no navegador e abre o WhatsApp, sem envio automático. A publicação continua bloqueada até as aprovações da
> titular: veja [docs/release/NEKKORA-COM-ECOSYSTEM-001.md](docs/release/NEKKORA-COM-ECOSYSTEM-001.md) e
> [docs/release/COM-RELEASE-PENDENCIAS.md](docs/release/COM-RELEASE-PENDENCIAS.md).

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
| `npm run check` | Tipos + testes + build + política do CloudFront conferida (rodar antes de juntar uma branch) |
| `npm run homologacao -- <url> <pasta>` | Verificação em navegador real: capturas, axe-core, teclado, formulário, links, preços e alegações proibidas (Playwright e axe-core são devDependencies) |
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
├── precos.ts            tabela de preços e simulador (fonte única dos valores)
├── mensagem.ts          validação e montagem da mensagem do formulário de atendimento
├── atendimento.tsx      formulário de atendimento (diálogo) e botões que o abrem
├── App.tsx              Navbar, seções, footer e botão flutuante (só com número confirmado)
├── styles.css           layout e composição (cores e componentes vêm da lib)
└── sections/            Hero, Solutions, Pricing, Simulator, HowItWorks, Hosting, Transparency, Contact,
                         Privacy, Footer
scripts/                 homologacao.mjs, homologacao-canais.mjs, exportar-texto.mjs
docs/ARQUITETURA.md      visão geral da página
docs/com-001/            auditoria, contrato, matriz, arquitetura, texto, roteiro, checklist, pendências,
                         relatório e evidências
public/                  favicons da marca (idênticos aos da nekkora-lib)
```

## Release, homologação e publicação (NEKKORA-RELEASE-001)

- Dados que só a titular confirma (canais, campanha, controlador, aprovações): [`publicacao.json`](publicacao.json).
  `npm run verificar:publicacao` lista o que falta e **bloqueia o deploy de produção**.
- Preços: [`src/precos.ts`](src/precos.ts) é a fonte única (PUB-14 por impressão:
  `node scripts/comercial/impressao-precos.mjs`). As tabelas do Delivery ficam só em
  [`scripts/comercial/tabelas-anteriores.mjs`](scripts/comercial/tabelas-anteriores.mjs), fora da página.
- nekkora-lib: tarball do CI em [`vendor/`](vendor/). `npm run verificar:lib -- --reconstruir` refaz e confere o hash.
- Hospedagem: **AWS S3 + CloudFront** (DNS na Cloudflare). Cabeçalhos, cache, função e políticas IAM estão em
  [`deploy/aws/`](deploy/aws/), e os scripts de publicação, rollback, verificação e auditoria em
  [`scripts/aws/`](scripts/aws/).
- `npm test`: preços, portão, publicação/rollback simulados, auditoria, CloudFront local e backend de solicitações.
- `npm run cloudfront:local`: serve o `dist/` como o CloudFront (CSP, erros, cache, função).
- `npm run homologacao` (página) e `npm run homologacao:canais` (formulário de atendimento, WhatsApp, botão flutuante e ausência de envio automático, e-mail e Bookings).
- `npm run aws:auditar -- --bucket <nome>`: auditoria somente leitura da conta AWS.
- `npm run verificar:precos`: confere que o bundle tem a tabela de `src/precos.ts` e nenhum percentual digitado.
- **Contato (NEKKORA-COM-CANAIS-001 e NEKKORA-COM-ECOSYSTEM-001)**: o WhatsApp oficial é o único canal público de
  atendimento. Os CTAs e o botão flutuante "Fale com um analista" abrem o formulário de atendimento, que só prepara a
  mensagem no navegador e abre o WhatsApp; a página não tem envio por e-mail, envio automático nem agendamento, e o
  portão bloqueia `agendamento.url` e `envioAutomatico.endpoint`. "Entrar" leva à Nekkora Platform. O backend de
  solicitações em [`api/solicitacoes/`](api/solicitacoes/) continua no repositório (testes de unidade e
  `npm run api:local`), sem uso pela página; histórico em [`COM-RELEASE-005-leads.md`](docs/release/COM-RELEASE-005-leads.md).
- CI, deploy manual com aprovação, rollback, OIDC, DNS e custos:
  [`docs/release/COM-RELEASE-003-aws.md`](docs/release/COM-RELEASE-003-aws.md).
- Relatórios: [`docs/release/`](docs/release/) · pendências: [`COM-RELEASE-PENDENCIAS.md`](docs/release/COM-RELEASE-PENDENCIAS.md).
