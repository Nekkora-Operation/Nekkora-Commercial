# COM-RELEASE-003 — confiança OIDC com a identidade imutável do repositório (27/10/2026)

`deploy/aws/iam/confianca-deploy.json` e `confianca-auditoria.json` passaram a exigir, com `StringEquals`, `aud` =
`sts.amazonaws.com`, `sub` = `repo:Nekkora-Operation@333915842/Nekkora-Commercial@1389833224:environment:<env>`
(`production` / `auditoria-aws`) e `ref` = `refs/heads/main`. Detalhes em
[COM-RELEASE-003-aws.md §2.2 e §2.4](../../../COM-RELEASE-003-aws.md).

- `testes-iam.txt`: `scripts/testes/aws-iam.test.mjs` (8/8): os dois modelos, as permissões, o gerador e os workflows.
- `testes-modelos-anteriores.txt`: os mesmos testes contra os modelos do commit `1f55716`. Os três testes de
  confiança falham.
- `gerador.txt`: `gerar-config.mjs` com identificadores **fictícios**, e as duas confianças geradas.
- `check.txt`: `npm run check` (typecheck, 83 testes, build, configuração AWS).

Nada foi enviado à AWS, e não houve deploy, merge nem mudança de DNS. A validação das políticas pelo IAM Access
Analyzer e a configuração das roles e environments foram feitas pela titular. O teste real de autenticação OIDC
(role de auditoria) só é possível depois do merge (§2.4) e ainda não foi executado.
