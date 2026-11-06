# Datas definitivas da campanha de lançamento — procedimento

**Regra aprovada (COM-008-B, mantida pela titular em 06/11/2026):** a campanha dura dois meses a partir da
publicação oficial. As datas atuais (`06/11/2026 a 06/01/2027`) são históricas e **só mudam com as datas escritas
pela titular**, depois de a janela de deploy estar definida. O código não calcula as datas; elas ficam em
`publicacao.json`.

## Como calcular (fuso de Brasília)

- `inicio` = dia da publicação oficial (D): o dia em que o domínio `nekkora.com` passa a servir a V1.
- `fim` = o mesmo dia do mês, dois meses depois. É inclusivo até as 23:59 de Brasília, como no par atual
  `06/11 → 06/01`. Se esse dia não existir no mês, usa-se o último dia do mês (exemplo: `31/12/2026 → 28/02/2027`).

| D (exemplo) | inicio | fim |
|---|---|---|
| 13/11/2026 | 2026-11-13 | 2027-01-13 |
| 20/11/2026 | 2026-11-20 | 2027-01-20 |

**Cuidado com a ordem.** As datas aparecem no texto público ("solicitações recebidas de … a …"). Por isso têm de
estar no commit aprovado na PUB-17, **antes** do deploy. Se o deploy atrasar depois da aprovação, há duas saídas:
manter as datas aprovadas (o período fica menor que dois meses) ou fazer nova PR, nova PUB-17 e novo commit
candidato.

## Arquivos que mudam na mesma PR

Os testes fixam as datas atuais **de propósito**, para que nenhuma mudança passe sem autorização.

| Arquivo | O que muda |
|---|---|
| `publicacao.json` | `campanhaLancamento.inicio/fim` e `$origem.campanhaLancamento` com a autorização datada da titular |
| `scripts/testes/condicoes-delivery.test.mjs` | linhas 254 e 499 (R1-27: "datas históricas"), que passam a esperar as datas novas citando a autorização |
| `scripts/testes/simulador.test.mjs` | testes 9 a 11: bordas `D-1 23:30`, `D 00:30`, um dia no meio, `fim 23:30` e `fim+1 00:30`; e o bloco `campanhaLancamento` (linhas 219 e 220) |
| `scripts/homologacao-simulador.mjs` | `DATES` (linhas 73 a 77) com as mesmas bordas, e `vigente`/`pendente` (linhas 62 e 66) num dia dentro do período |
| `scripts/homologacao-canais.mjs`, `scripts/homologacao-leads.mjs` | `IN_CAMPAIGN`, um dia dentro do período |
| `.github/workflows/ci.yml` | linha 144: `D-1`, um dia dentro e `fim+1` |
| `docs/com-001/05-texto-comercial.md` | regenerar com `npm run texto` |
| `docs/release/COM-RELEASE-PENDENCIAS.md` | PUB-13 com as datas e a autorização |

**Verificações:**

- `npm run check`;
- a homologação nos três navegadores com `NEKKORA_DATA` em `D-1`, `D` e `fim+1`;
- o portão, que tem de continuar bloqueado até a PR de liberação.

Claude prepara essa PR assim que receber as datas escritas.
