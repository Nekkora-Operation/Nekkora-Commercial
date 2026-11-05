# NEKKORA-COM-PRIVACY-001 — Consolidação de privacidade e gravações

**Data:** 05/11/2026 · **Branch:** `docs/com-privacy-001` (a partir de `feat/publicacao` @ `369a25f`)
**Natureza:** documentação e texto do aviso de privacidade. **Sem deploy**, sem alteração no Microsoft 365, no DNS ou
na AWS, sem gravação automática. Preços, datas da campanha, testes e infraestrutura preservados.
`aprovacoes.avisoDePrivacidade`, `condicoesComerciais` e `publicacao` continuam `false`.

**Não é parecer jurídico.** A revisão jurídica continua obrigatória (JUR-06 a JUR-10).

## 1. Decisões da titular registradas

| Tema | Decisão |
|---|---|
| Serviço do Bookings | "Conversa inicial — Nekkora Delivery", 30 min |
| Conta responsável pela reunião | `nicolly@nekkora.com` |
| Política do Teams | `Nekkora-Commercial`, criada e atribuída à conta responsável |
| Gravação | Possível, com aviso e concordância específica dos participantes; **nunca automática** |
| Retenção das gravações | Prazo padrão de 30 dias após a reunião |
| Retenção de contatos sem contratação | Até seis meses |
| Retenção das reservas do Bookings | Até 90 dias |
| Revisão e eliminação | Inicialmente manuais, sob responsabilidade da titular |
| Tenant | Domínio histórico `radiantsai-my.sharepoint.com`, administrado pela titular; **não renomear** |

## 2. Alterações

| # | Pedido | Arquivo(s) | O que mudou |
|---|---|---|---|
| 1 | Minuta de privacidade | [`docs/comercial/privacidade-minuta.md`](../comercial/privacidade-minuta.md) | Novo §4a (gravações: decisão, controles homologados, limites do que foi comprovado); concordância com a gravação no §2; gravações na retenção (§3); texto do Bookings com a gravação (§4); pendências atualizadas (§6) |
| 2 | Aviso do site | `src/content.ts → PRIVACY` | Novo item **"Gravação da conversa"** (PV-11, só com a URL do Bookings, como os outros itens que citam o Teams); "Por quanto tempo guardamos" ganhou o prazo padrão de 30 dias das gravações; comentário do controlador atualizado |
| 3 | Pendências | [`COM-RELEASE-PENDENCIAS.md`](COM-RELEASE-PENDENCIAS.md) | Novo §2c (controles homologados × pendências); PUB-13 e PUB-09 (dados) como preenchidos; JUR-10; OPS-01 manual pela titular; OPS-05 a OPS-08 |
| 4 | Referências antigas (razão social e datas) | `publicacao.json → $origem` (só metadados), `COM-RELEASE-005-privacidade.md` §1, `condicoes-comerciais-minuta.md` §8, notas de atualização em `NEKKORA-COM-007-bookings.md` §4 e `NEKKORA-COM-008-A-auditoria.md`; `05-texto-comercial.md` e a variante da COM-RELEASE-005 gerados de novo por `npm run texto` | Os relatórios datados (COM-007, COM-008-A, COM-008-C) não foram reescritos: são retratos da época e ganharam uma nota apontando para a situação atual |
| 5 | Evidências | [`evidencias/com-privacy-001/README.md`](evidencias/com-privacy-001/README.md) + `.gitignore` | E-01 a E-09, sem URLs de compartilhamento, sem dados de participantes e sem gravações. O `.gitignore` da pasta recusa mídia e transcrições |
| — | Matriz de alegações | [`03-matriz-alegacoes.md`](../com-001/03-matriz-alegacoes.md) | PV-09 com as gravações; nova PV-11 |

### Texto novo no site

> **Gravação da conversa** — A conversa pelo Microsoft Teams pode ser gravada para registrar o que foi conversado e
> apoiar a avaliação e a proposta. A gravação nunca é automática: só começa com aviso, e o próprio Teams pede a sua
> concordância específica. Você pode não concordar. As gravações ficam no Microsoft 365, com acesso gerenciado pela
> Nekkora conforme as permissões de cada arquivo.

Acréscimo em "Por quanto tempo guardamos": *"Gravações de conversas, quando houver, têm prazo padrão de 30 dias após a
reunião."*

**O texto não promete** eliminação definitiva em 30 dias (só a expiração padrão foi vista), o que acontece com a
recusa (OPS-05), quem exatamente tem acesso (só o arquivo testado foi conferido) nem a base legal da gravação (JUR-10).
A finalidade "registrar o que foi conversado e apoiar a avaliação e a proposta" é uma proposta de redação e deve ser
confirmada pela titular na aprovação do aviso.

## 3. Verificações

| Comando | Resultado |
|---|---|
| `npm test` | 233 testes, 0 falhas |
| `npm run check` (typecheck, testes, build, preços do artefato, política do CloudFront) | OK |
| `npm run verificar:publicacao -- --dist dist` | **Bloqueado**, como esperado: PUB-20, PUB-19, PUB-17, PUB-09 (aprovação do aviso), PUB-18, PUB-10. PUB-13 e o PUB-09 do controlador não aparecem mais |
| Homologação no navegador (`679d5c3`, depois da revisão do PR #12) | 90 + 90 + 90, 0 falhas. Ver [`evidencias/com-privacy-001/README.md`](evidencias/com-privacy-001/README.md) §Homologação da página |

## 4. Pendências (resumo; detalhe em [`COM-RELEASE-PENDENCIAS.md` §2c](COM-RELEASE-PENDENCIAS.md))

**Jurídicas ⚖:** JUR-06 (base do atendimento), JUR-07 (transferência internacional, inclusive das gravações), JUR-08
(encarregado), JUR-09 (identificação do fornecedor), **JUR-10 (base legal, recusa, revogação e prazo das gravações)**.

**Operacionais (titular):** OPS-01 (procedimento manual de retenção, com periodicidade e registro), OPS-02 (texto do
Bookings), OPS-05 (conduta e teste da recusa), OPS-06 (transcrição, anotações e chat), OPS-07 (comprovar a eliminação
depois dos 30 dias e da lixeira), OPS-08 (padrão de compartilhamento das novas gravações).

**Observação sobre a campanha:** as datas gravadas pela titular começam em 06/11/2026. Se a publicação oficial ocorrer
depois disso, cabe à titular decidir se ajusta as datas (regra: dois meses a partir da publicação oficial).
