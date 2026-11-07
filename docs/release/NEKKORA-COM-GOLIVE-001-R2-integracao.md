# Integração #17 → #19 — sequência exata (NEKKORA-COM-GOLIVE-001-R2)

Estado verificado em 06/11/2026: a **#16** foi mesclada na `main` (`978bd0b`). A **#17** (`docs/contract-001`, head
`9f1745b`) está aberta e em **conflito**. A **#18** foi fechada sem merge. A **#19** (`docs/v1-preparacao`) é rascunho,
com base na antiga `integracao/v1` (`3e088aa`). Essa base contém **merges duplicados** da #16 (`2496ff5`) e da #17
(`3e088aa`), que não podem chegar à `main`.

**Nada abaixo foi executado no GitHub.** Cada passo com ✋ exige autorização expressa da titular. A sequência foi
**simulada localmente**, num worktree descartável e sem push, com estes resultados:

- **conflito:** só a linha `test` do `package.json`, resolvida com os dois testes;
- **árvore resultante:** idêntica à da antiga `integracao/v1`;
- **rebase da #19:** sem conflitos, e a árvore final ficou idêntica à da #19 atual;
- **commits da #19 contra a `main`:** só os da própria #19, sem os merges `2496ff5` e `3e088aa`.

## Passo 1 ✋ — atualizar a #17 com a `main`

```bash
git fetch origin
git switch docs/contract-001 && git merge --ff-only origin/docs/contract-001
git merge --no-ff origin/main -m "Merge main (#16) na docs/contract-001"
# Conflito esperado: só package.json, linha "test". Manter os DOIS testes:
#   …api-solicitacoes.test.mjs scripts/testes/diagnostico-dns.test.mjs scripts/testes/condicoes-delivery.test.mjs
git show 3e088aa:package.json > package.json     # mesma resolução já validada na #18 (CI verde)
git add package.json && git commit --no-edit
git diff 3e088aa HEAD --stat                      # tem de ser VAZIO
npm run check                                     # local
git push origin docs/contract-001                 # dispara o CI da #17
```

**Critério:** o CI da #17 fica verde nos 5 jobs, incluindo os testes de navegador. Além disso, `publicacao.json`,
`scripts/verificar-publicacao.mjs` e `src/precos.ts` não podem ter diff contra a `main`.

## Passo 2 ✋ — merge da #17

Com o CI verde e a autorização, faça o merge pelo GitHub com **merge commit**, sem squash e sem rebase, para preservar
os hashes que a #19 usa como base.

## Passo 3 ✋ — realinhar a #19 (reorganizada; ver §Organização)

```bash
git fetch origin
M17=$(git rev-parse origin/docs/contract-001)     # o merge do passo 1
git switch docs/v1-preparacao
git rebase --onto "$M17" 3e088aa                  # tira 2496ff5 e 3e088aa; os commits da #19 ficam sobre a #17
#   (com a reorganização, a lista de commits é a do §Organização: ver o roteiro ao final)
git log --oneline origin/main..HEAD               # depois do passo 2: só commits da #19
git push --force-with-lease origin docs/v1-preparacao
gh pr edit 19 --base main
```

**Critério:**

- o diff da #19 contra a `main` mostra só os arquivos da #19;
- o CI fica verde;
- o portão continua **BLOQUEADO**.

Se o passo 3 acontecer antes do passo 2, use a base `docs/contract-001` e troque para `main` depois do merge da #17.

## Organização dos commits da #19

| Grupo | Conteúdo | Pode ir para a `main` | Onde fica |
|---|---|---|---|
| **A. Documentação e ferramentas** | `deploy/aws/logs/*` (preparado, **não aplicado**), JUR-07 (análise), `conferir-bookings.mjs` com B12, `campanha-datas.mjs`, roteiros e registros de evidência (pendentes), checklist e pendências | **Sim**: não descreve recurso inexistente como existente, e o texto público não muda | **#19** |
| **B. Texto público [PV-12]** | `src/content.ts`, `05-texto-comercial.md`, `aviso-logs.test.mjs` | **Não**, enquanto os logs não estiverem ativos e conferidos (E4) | Branch `docs/v1-texto-publico`, **sem PR**, até E4. Depois vira a PR de texto (A3) |
| **C. Texto da JUR-07 no aviso** | Item "Onde os dados são processados" com o mecanismo por fluxo | **Não**, enquanto não houver parecer | Ainda não escrito no `content.ts`; entra na mesma PR de texto (A3) |
| **D. Ações externas** | Aplicar os logs na AWS, Bookings, Teams, DNS, deploy | Não são commits | Autorizações A1, A6 a A8 e as evidências E1 a E5 |

**Roteiro da reorganização** (no passo 3, em vez do `rebase --onto` simples):

```bash
git switch -c docs/v1-preparacao-r2 "$M17"
# Grupo A: preparação, JUR-07 R1 e R2
git cherry-pick 55f52c3 ede1c15 158a15b 8e539c4 c48a05a
# conflito esperado só no c48a05a, em package.json: manter a linha "test" do c48a05a SEM aviso-logs.test.mjs
git switch -c docs/v1-texto-publico
# Grupo B: os dois commits do [PV-12]; no package.json, acrescentar aviso-logs.test.mjs
git cherry-pick e3df785 d1df3b8
# conflito esperado só no d1df3b8, em package.json: acrescentar aviso-logs.test.mjs ao fim da linha "test"
git push origin docs/v1-texto-publico             # sem abrir PR
git switch docs/v1-preparacao && git reset --hard docs/v1-preparacao-r2
git push --force-with-lease origin docs/v1-preparacao
gh pr edit 19 --base main
```

Com isso, o merge da #19 com o CI verde não leva o [PV-12] ao ar antes de os logs existirem.

**Simulação local de 06/11/2026 (worktree descartável, sem push):**

| Etapa | Resultado |
|---|---|
| M17: merge da `main` na `docs/contract-001` | Conflito só no `package.json`; árvore **idêntica** à da `3e088aa` |
| Grupo A (5 commits) | Conflito só no `package.json` do `c48a05a`; sem [PV-12] no `content.ts`; `npm run check` **301/301** |
| Grupo B (+2 commits) | Conflito só no `package.json` do `d1df3b8`; árvore igual à da #19 atual (só muda a ordem dos testes na linha `test`); `npm run check` **304/304** |

Os hashes acima são os da #19 em 06/11/2026. Se a #19 receber novos commits, a lista do grupo A precisa ser
atualizada antes do passo 3.
