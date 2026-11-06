# Nekkora Commercial — backlog

**Natureza:** evoluções futuras da página comercial. **Nada aqui foi implementado nem aprovado.** Cada item é
registrado para planejamento posterior e depende de decisão da titular antes de qualquer alteração no código, nos
textos ou na infraestrutura.

---

## COMMERCIAL-LEADS-001 — Evolução da jornada por e-mail (mailto)

**Origem:** aprovação dos textos comerciais pela titular em 05/11/2026 (PUB-17). Os textos aprovados descrevem a
jornada atual; esta evolução fica para depois e **não altera** o que foi aprovado.

**Hoje:** a jornada "Solicitar avaliação" termina no aplicativo de e-mail do visitante (`mailto:` para
`contato@nekkora.com`) com a mensagem revisada. A página não afirma envio: a mensagem só chega se o visitante enviá-la
pelo próprio aplicativo ([COM-RELEASE-005-leads](../release/COM-RELEASE-005-leads.md), REP-04). Quem não tem aplicativo
de e-mail configurado não conclui a solicitação por esse caminho.

**Evolução a avaliar:**

| Tema | Ponto de partida |
|---|---|
| Recebimento sem depender do aplicativo do visitante | Envio automático já preparado e testado só localmente (COM-RELEASE-005 §5; `envioAutomatico` em `publicacao.json`). Exige INF-11 a INF-16 e a aprovação PUB-21 |
| Papel do mailto depois disso | Precedência já definida em COM-RELEASE-005-leads: com envio automático ativo, o e-mail aparece só como alternativa de contato na falha, nunca como segundo envio |
| Textos | Variante com tudo ligado em [`texto-com-envio-automatico-e-bookings.md`](../release/com-release-005/texto-com-envio-automatico-e-bookings.md); precisa de nova aprovação de textos antes de ir ao ar |
| Privacidade | Novo tratamento (backend na AWS) a refletir no aviso de privacidade (PUB-09) |

**Fora do escopo agora:** nenhuma alteração de funcionalidade, texto, preço, campanha ou infraestrutura.

---

## COMMERCIAL-REC-001 — Gravação de reuniões comerciais (futura)

**Origem:** decisão da titular na NEKKORA-COM-LEGAL-BASE-001 (05/11/2026): no lançamento inicial, a Nekkora **não grava**
reuniões comerciais. A R1 recomendou desligar a gravação na política `Nekkora-Commercial` do Teams
([procedimento](../comercial/procedimento-teams-sem-gravacao.md), CTL-01).

**Hoje:** o aviso do site diz "Conversa sem gravação". O histórico da configuração homologada na COM-PRIVACY-001
(gravação só com concordância, expiração de 30 dias) está preservado em
[`privacidade-minuta.md` §4a](../comercial/privacidade-minuta.md).

**Para retomar, uma nova revisão precisa cobrir:**

| Tema | Ponto de partida |
|---|---|
| Finalidade e base legal | JUR-10 |
| Aviso de privacidade e texto do Bookings | Novo texto, com **nova aprovação da titular** (PUB-09, PUB-17) |
| Conduta quando um participante não concorda | OPS-05 |
| Transcrição, Copilot e anotações | OPS-06, CTL-02 |
| Retenção e eliminação comprovadas | OPS-07, OPS-09 |
| Compartilhamento dos arquivos | OPS-08 |
| Configuração do Teams | Religar a gravação na política só depois dos itens acima |

**Fora do escopo agora:** nenhuma gravação, transcrição ou alteração no Microsoft 365.
