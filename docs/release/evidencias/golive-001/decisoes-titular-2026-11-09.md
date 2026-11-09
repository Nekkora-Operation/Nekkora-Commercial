# Relatos e decisões da titular, 09/11/2026

Registro da mensagem da titular de 09/11/2026. **Relato não é evidência arquivada:** este arquivo guarda o que foi
informado e o que existe no repositório. Ele não aprova PUB-09 nem PUB-18, não muda flags nem datas, e nada aqui é parecer
jurídico.

## Testes

| Item | Relato da titular | Evidência arquivada | Estado |
|---|---|---|---|
| **E1 — Bookings** | — | [Registro, texto e captura](bookings-validacao-final/registro.md) | **Verificado**, 12/12 |
| **E5 — Teams** (CTL-01) | Configurações ajustadas e teste realizado | Nenhuma no repositório | **Relatado; evidência não arquivada** |
| **E2 — E-mail** (CTL-05 / REP-04) | Envio, recebimento e resposta testados | Nenhuma no repositório | **Relatado; evidência não arquivada** |

Por decisão da titular, E5 e E2 **não serão repetidos**. Se já existirem capturas ou anotações, elas podem ser anexadas
sem novo teste. O relato não detalhou:

- **E5:** valores da política, Copilot, conta atribuída, organizador das reuniões do Bookings, data do teste e ausência de
  arquivos depois dele (E-1 a E-7 do procedimento);
- **E2:** data e hora, pasta de chegada, domínio do remetente e o teste de "Abrir no e-mail" no computador e no celular
  (REP-04), que o relato não cita.

O procedimento só dá CTL-01 como "verificado" com E-1 a E-7 preenchidos. Quem aceita o relato no lugar deles, se for o
caso, é a titular, por escrito.

## Decisões

| Tema | Decisão | Consequência registrada |
|---|---|---|
| **Campanha (D2 / PUB-13)** | **Manter 06/11/2026 a 06/01/2027**, sem alterações | Substitui a regra de "dois meses a partir da publicação" e o procedimento de novas datas. Como o site vai ao ar depois de 06/11/2026, o período efetivo no ar fica **menor que dois meses**. `publicacao.json` não muda. O regulamento (minuta) ainda diz "datas pendentes", e o teste R1-27 fixa essa frase: os dois mudam juntos na PR da release |
| **Textos comerciais (PUB-17)** | **Já aprovados pela titular**; preservar a redação atual | Referência da redação: `docs/com-001/05-texto-comercial.md` em `50f3dc1`. A flag `textosComerciais` continua `false` até a PR de liberação (A5). Mudança material no aviso por LOG-01 ou JUR-06/JUR-07 será apresentada à parte, para aprovação específica |

## Continuam pendentes

- **E3:** captura do "Local dos dados" do Microsoft 365.
- **LOG-01 (A1/E4):** aplicação ainda não autorizada de forma específica, sem evidência `log-01-<data>.md`.
- **JUR-06/JUR-07 (D1):** dependem de E3, do parecer e do mecanismo de cada fluxo.
- **PUB-09, PUB-18 e PUB-10:** continuam abertas, sem marcação automática.
- **PUB-19:** a decisão sobre textos comerciais não cita as condições comerciais; a flag continua `false`.
