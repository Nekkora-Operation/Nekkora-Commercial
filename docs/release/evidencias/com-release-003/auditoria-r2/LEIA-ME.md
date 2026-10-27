# COM-RELEASE-003 — revisão corretiva do C08 (27/10/2026)

Falso positivo da auditoria real no CloudShell: a AWS devolve `XSSProtection: {}` na política
`nekkora-commercial-seguranca` (`dc2d71f5-a25d-4718-82b0-fe57ad674e13`), que no resto é idêntica a
`deploy/aws/politica-cabecalhos.json`. Detalhes em [COM-RELEASE-003-aws.md §1.4](../../../COM-RELEASE-003-aws.md).

- `testes-corrigido.txt`: testes da auditoria com o auditor corrigido (19/19).
- `testes-auditor-anterior.txt`: os mesmos testes contra o auditor do commit `5298bbc`. As duas regressões do C08
  falham. O teste unitário de `structuralDiff` foi pulado, porque essa função não existia.
- `check.txt`: `npm run check` (typecheck, 75 testes, build, configuração AWS).

Nada foi alterado na AWS (política do CloudFront, bucket, DNS) nem no arquivo versionado, e não houve deploy.
"Nenhuma falha" é o resultado esperado da próxima auditoria real e só fica confirmado quando `bash auditar.sh`
rodar de novo no CloudShell.
