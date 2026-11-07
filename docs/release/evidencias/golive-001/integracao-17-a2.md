# Integração da #17 na `main` — autorizações A2a e A2b

NEKKORA-COM-V1. Registro das duas etapas, com as verificações feitas antes e depois de cada uma.

## A2a — atualização da `docs/contract-001` com a `main` (06/11/2026)

| Item | Resultado |
|---|---|
| Base | `main` em `978bd0b` (merge da #16); #17 em `9f1745b`, em conflito |
| Commit | `8a0abc5` — "Merge main (#16) na docs/contract-001" (pais `9f1745b` e `978bd0b`) |
| Conflito | Só a linha `test` do `package.json`. Resolvida com os dois testes (`diagnostico-dns.test.mjs` e `condicoes-delivery.test.mjs`) |
| Combinado automaticamente | `docs/release/COM-RELEASE-PENDENCIAS.md`. Recebeu só as linhas vindas da `main` |
| Árvore | Idêntica à da `3e088aa` (resolução validada antes) |
| CONTRACT-001-R1 | `docs/comercial/`, `scripts/comercial/`, `src/` e `condicoes-delivery.test.mjs` idênticos ao `9f1745b` |
| Arquivos protegidos | `publicacao.json`, `scripts/verificar-publicacao.mjs` e `src/precos.ts` sem diff contra a `main` |
| `npm run check` local | 293/293 testes, build, preços e CSP OK |
| Portão | BLOQUEADO (PUB-19, PUB-17, PUB-09, PUB-18, PUB-10) |
| CI da #17 em `8a0abc5` | 5/5 jobs aprovados, incluindo os testes de navegador real (13 min 31 s); run `42331724456` |

## A2b — merge da #17 na `main` (07/11/2026)

| Item | Resultado |
|---|---|
| Executado por | A titular, pelo GitHub (conta `Nekkolly`), às 00:49:26 (UTC−3). Claude não fez um segundo merge |
| Condições antes do merge | Head `8a0abc5` e CI 5/5 aprovado, conferidos depois do merge (o head que entrou é o `8a0abc5`) |
| Tipo | **Merge commit** (sem squash e sem rebase) |
| SHA na `main` | `72c6898deadeac0e52b86657585021617a4d1c96`, com pais `978bd0b` (#16) e `8a0abc5` (#17) |
| Histórico | `9f1745b` (CONTRACT-001-R1) e `978bd0b` (#16) são ancestrais da `main` |
| Árvore | `main` = `8a0abc5`, sem nenhuma diferença |
| Testes | A linha `test` mantém os testes da #16 (`diagnostico-dns`) e da #17 (`condicoes-delivery`) |
| Arquivos protegidos | `publicacao.json`, `scripts/verificar-publicacao.mjs` e `src/precos.ts` iguais aos de `978bd0b`; `avisoHomologacao: true`; campanha 06/11/2026 a 06/01/2027 (sem alteração) |
| Portão na `main` | BLOQUEADO (PUB-19, PUB-17, PUB-09, PUB-18, PUB-10) |
| CI da `main` em `72c6898` | Run `42335723888`: **success**. 4 jobs aprovados, incluindo os testes de navegador real. O job Preview é ignorado por regra (`if: github.event_name == 'pull_request'`), igual ao run anterior da `main` (`978bd0b`) |

**Fora do escopo e não feito:** deploy, DNS, AWS, Microsoft 365, tag de release, alteração de flags e integração da #19.

## A2c — realinhamento da #19 sobre a `main` (07/11/2026)

| Item | Resultado |
|---|---|
| Base | `origin/main` em `72c6898` |
| Referências de segurança (locais) | Branch `seguranca/v1-preparacao-6b05311` e tag `seguranca-19-pre-a2c`, ambas no antigo head `6b05311` |
| Excluídos do histórico | Os merges duplicados da antiga `integracao/v1`: `2496ff5` (#16) e `3e088aa` (#17). O conteúdo deles já está na `main` |
| Grupo A, na #19 | `55f52c3`→`a26aaab`, `ede1c15`→`a9837c3`, `158a15b`→`dc13a91`, `8e539c4`→`b8f4488`, `c48a05a`→`47bf233`, `6b05311`→`1098b29`, mais este registro |
| Conflito | Só a linha `test` do `package.json` no `c48a05a`. Mantida sem `aviso-logs.test.mjs` |
| Grupo B, fora da #19 | Branch `docs/v1-texto-publico`, **sem PR**: `e3df785` e `d1df3b8` sobre o grupo A. Conflito só na linha `test` do `d1df3b8`: `aviso-logs.test.mjs` acrescentado ao fim |
| Nada perdido | Árvore do grupo B = árvore do antigo `6b05311`, exceto a ordem dos testes na linha `test`. O grupo A difere do `6b05311` só nos três arquivos do grupo B (`src/content.ts`, `05-texto-comercial.md` e `aviso-logs.test.mjs`) |
| Grupo C | Não escrito (depende do parecer da JUR-07) |
