# NEKKORA-COM-RELEASE-FIX-001 — evidências

Commit homologado: `3ae538d` (árvore limpa; `release.json` = HEAD, conferido por `artefato-corresponde-ao-codigo` com
`CI=true`, em que o Git é obrigatório). Execução local em 04/11/2026, Windows 11, Playwright 1.63.0, servidores
`scripts/servidor-cloudfront-local.mjs` com a mesma configuração do CI.

## Verificações

| Comando | Resultado |
|---|---|
| `npm test` | 233 testes, 0 falhas |
| `npm run check` (typecheck, testes, build, preços do artefato, política do CloudFront) | OK |
| `scripts/aws/verificar-site.mjs` (artefato servido como no CloudFront) | site confere com o artefato `3ae538d` |
| `homologacao.mjs`, 05/11/2026 (futura) — Chromium, Firefox, WebKit | 90 + 90 + 90 verificações, 0 falhas |
| `homologacao.mjs`, 15/11/2026 (vigente) — Chromium, Firefox, WebKit | 90 + 90 + 90 verificações, 0 falhas |
| `homologacao.mjs`, 07/01/2027 (encerrada) — Chromium, Firefox, WebKit | 90 + 90 + 90 verificações, 0 falhas |
| `homologacao-simulador.mjs` (produção em 05/11, 06/11, 15/11, 06/01, 07/01; fixture sintética; pendente com e sem aviso) | 168 verificações, 0 falhas |
| `homologacao-canais.mjs` — e-mail | 96 verificações, 0 falhas |
| `homologacao-canais.mjs` — WhatsApp (fixture) | 111 verificações, 0 falhas (*) |
| `homologacao-leads.mjs` — Bookings e envio automático com backend local | 144 verificações, 0 falhas |
| `verificar-publicacao.mjs --dist dist` (portão) | **bloqueado** — PUB-20, PUB-19, PUB-17, PUB-09, PUB-18, PUB-10 |

(*) Na primeira execução, 3 verificações de área de transferência/mensagem do WhatsApp falharam só no Chromium
(`confirmacao-mensagem-exata`, `copiar-mensagem-informa-resultado`, `whatsapp-com-mensagem-exata`); passaram em duas
execuções isoladas e na reexecução completa nos três navegadores. O script e o código dessa jornada não foram alterados
nesta missão; fica registrada como intermitência local a observar no CI.

## Situação da campanha por data (publicacao.json: 06/11/2026 a 06/01/2027)

| Data (Brasília) | Estado | Cartões | Simulador (2 simples + 1 média) |
|---|---|---|---|
| 05/11/2026 23h30 | futura | R$ 1.500 · R$ 3.500, sem riscado, percentual, economia nem faixa de lançamento | R$ 6.500, investimento estimado pelo preço padrão |
| 06/11/2026 00h30 | vigente (1º dia) | ~~R$ 1.500~~ R$ 1.000 −33,33% · ~~R$ 3.500~~ R$ 2.800 −20% | R$ 4.800 (padrão R$ 6.500, economia R$ 1.700, 26,15%) |
| 15/11/2026 12h | vigente | idem | idem |
| 06/01/2027 23h30 | vigente (último dia) | idem | idem |
| 07/01/2027 00h30 | encerrada | só preço padrão | R$ 6.500 pelo preço padrão |
| sem datas + aviso de homologação | pendente | prévia promocional com aviso "Prévia para revisão" | R$ 4.800 (prévia) |
| sem datas, sem aviso | pendente | só preço padrão | R$ 6.500 |

## Arquivos

- `resumo-pagina-<data>-<navegador>.md` — homologação completa da página (acessibilidade, responsividade, formulário,
  Bookings, canais, requisições externas, preços).
- `resumo-simulador.md`, `resumo-conversao-*.md`, `resumo-leads.md`.
- `chromium-precos-<data>.png` — cartões de preço em cada estado; `chromium-simulador-producao-*.png` — simulador em
  cada data; `chromium-simulador-pendente-previa.png`.
