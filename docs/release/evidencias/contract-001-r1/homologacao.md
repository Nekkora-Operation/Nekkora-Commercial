# Homologação em navegador — NEKKORA-COM-CONTRACT-001-R1

Build de `195f2ce` (`release.json`: `arvoreLimpa: true`), servido por `scripts/servidor-cloudfront-local.mjs --dist dist --porta 4183`; `NEKKORA_DATA=<data> NEKKORA_NAVEGADOR=<navegador> node scripts/homologacao.mjs http://127.0.0.1:4183/ <pasta temporária>` (capturas fora do repositório). 06/11/2026.

| Data simulada | Navegador | Verificações OK | Falhas | Regras da campanha | Critério "Esforço técnico estimado" |
|---|---|---:|---:|---|---|
| 2026-11-05 | chromium | 94 | 0 | ausentes | OK |
| 2026-11-05 | firefox | 94 | 0 | ausentes | OK |
| 2026-11-05 | webkit | 94 | 0 | ausentes | OK |
| 2026-11-15 | chromium | 94 | 0 | presentes | OK |
| 2026-11-15 | firefox | 94 | 0 | presentes | OK |
| 2026-11-15 | webkit | 94 | 0 | presentes | OK |
| 2027-01-07 | chromium | 94 | 0 | ausentes | OK |
| 2027-01-07 | firefox | 94 | 0 | ausentes | OK |
| 2027-01-07 | webkit | 94 | 0 | ausentes | OK |

Rodada inválida descartada: uma primeira execução atingiu um servidor antigo na porta 4173 (build `01c7f6d`) e falhou em `artefato-corresponde-ao-codigo` e `precos-criterios-de-categoria`, como esperado para um artefato desatualizado. As capturas dela não foram versionadas.
