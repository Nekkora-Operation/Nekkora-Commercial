# COM-RELEASE-003 — revisão corretiva da auditoria AWS (26/10/2026)

Falsos positivos da auditoria real no CloudShell: S07 (`ArnLike` não reconhecido), K01 e K02 (certificado antigo
`VALIDATION_TIMED_OUT` escolhido no lugar do emitido e associado à distribuição `E3TZD2P6FOEWWR`). Detalhes em
[COM-RELEASE-003-aws.md §1.3](../../../COM-RELEASE-003-aws.md).

- `testes-corrigido.txt`: testes da auditoria com o auditor corrigido (16/16).
- `testes-auditor-anterior.txt`: os mesmos testes contra o auditor do commit `e937e65`; os 9 novos falham,
  reproduzindo os falsos positivos.
- `check.txt`: `npm run check` (typecheck, 72 testes, build, configuração AWS).

Nenhum recurso da AWS foi criado, alterado ou apagado, e a política do bucket não mudou. O resultado esperado da
próxima auditoria real (21 ok, 5 pendentes, 0 falha, 3 info) vem do cenário reconstruído no teste e só fica
confirmado quando `bash auditar.sh` rodar de novo no CloudShell.
