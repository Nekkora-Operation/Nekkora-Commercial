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

## Alteração preparada (R2): `scripts/campanha-datas.mjs`

O script troca as datas em todos os arquivos da tabela acima, menos os dois documentos, que são atualizados à mão. Por
padrão ele **só simula**.

```bash
# 1. Simulação: mostra cada troca e não grava nada
node scripts/campanha-datas.mjs --publicacao AAAA-MM-DD
# 2. Só com a autorização escrita da titular, numa branch:
node scripts/campanha-datas.mjs --publicacao AAAA-MM-DD --autorizacao "Titular, DD/MM/AAAA: campanha de DD/MM/AAAA a DD/MM/AAAA (fuso de Brasília)." --aplicar
npm run texto && npm run check   # e atualizar a PUB-13 em COM-RELEASE-PENDENCIAS.md
```

**Proteções:**

- recusa um início anterior a hoje em Brasília, que encurtaria a vigência efetiva;
- `--aplicar` exige a autorização, que é gravada em `$origem.campanhaLancamento`;
- se alguma contagem de ocorrências divergir do esperado, **nada** é gravado;
- não muda nenhum outro campo do `publicacao.json`: flags, aprovações e `avisoHomologacao`;
- não toca as datas sintéticas de fixtures nem o teste de fuso.

O teste `scripts/testes/campanha-datas.test.mjs` monta o plano em memória: confere o cálculo do fim (inclusive fim de
mês e ano bissexto), a colisão de datas e a repetição depois de um atraso.

**Para não reduzir a vigência:**

- escolher D = o dia em que o domínio passa a servir a V1;
- rodar o script **na mesma PR aprovada na PUB-17**;
- se o deploy escorregar para depois de D, repetir o script com a nova data, o que exige nova PUB-17. Isso é melhor que
  publicar um período já iniciado.

Claude executa o passo 2 assim que receber as datas escritas.
