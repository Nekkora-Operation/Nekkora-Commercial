# Dossiê para o parecer jurídico — Nekkora Commercial V1

Data: 10/11/2026. Base: branch `release/v1` (a partir de `55c4969`). Este documento **não é parecer jurídico** e não
presume nenhuma resposta. Ele reúne, para o(a) advogado(a), as perguntas já registradas na
[JUR-07 §4.5](NEKKORA-COM-GOLIVE-001-JUR-07.md), na [minuta de condições §12 e §13](../comercial/condicoes-comerciais-minuta.md)
(JUR-03) e a pendência do texto [PV-12]. **PUB-09, PUB-17, PUB-19 e PUB-18 continuam não aprovadas.**

**Como responder:** por identificador (por exemplo, "J7-1: …"). Para cada resposta que exija mudança, a seção D já
indica onde ela entra.

**Escopo:** JUR-03 (reembolso e retenção na homologação), JUR-06 (base legal), JUR-07 (transferência internacional e
mecanismos) e [PV-12] (compartilhamento dos registros de acesso).

**Natureza de cada informação.** As categorias não se misturam:

| Categoria | Onde | O que vale |
|---|---|---|
| Decisão empresarial | §A | Escolha da titular. Não confirma validade jurídica |
| Evidência técnica | §B | Verificada por captura, comando ou teste, com registro no repositório |
| Relato da titular | §B.1 | Informado pela titular, **sem** evidência arquivada |
| Leitura documental | §B.2 | O que foi ou não encontrado em documentos públicos. **Não é** evidência técnica nem parecer |
| Parecer jurídico | §C | **Ainda não existe.** As perguntas aguardam resposta |

## A. Decisões empresariais já tomadas pela titular

Estas decisões são da titular. Valem como **escolha de negócio**, e não como confirmação da validade jurídica.

| Tema | Decisão | Data | Registro |
|---|---|---|---|
| Período da campanha (D2/PUB-13) | Manter **06/11/2026 a 06/01/2027**, no lugar da regra de dois meses a partir da publicação; o período no ar fica menor que dois meses | 09/11/2026 | [decisões](evidencias/golive-001/decisoes-titular-2026-11-09.md); regulamento §1 |
| Início do desenvolvimento (C-02) | **Sem espera obrigatória** depois da assinatura. O início segue a proposta e a fila, sem promessa de início imediato. Arrependimento legal preservado | 09/11/2026 | minuta §12; contrato-base cl. 3 |
| Desistência antes da conclusão (C-03) | Devolução **integral** do valor pago pelo desenvolvimento, antes da disponibilização formal para homologação | 09/11/2026 | contrato-base cl. 10; site |
| Desistência durante a homologação (C-04) | Devolução de **50% do valor pago**, sem cobrança adicional. A desistência encerra a contratação, sem entrega definitiva nem transferência. Regra igual para consumidor e B2B | 09/11/2026 | minuta §13; contrato-base cl. 10; Anexo B2B §2-A; site (CO-11) |
| Pagamento e proposta | 50% + 50%; prazo de **7 dias corridos** para aceitar a proposta; fila operacional | anterior, preservado | minuta §8; contrato-base cl. 6 |
| Textos comerciais (PUB-17) | Redação aprovada (referência `50f3dc1`). As mudanças posteriores no site (C-02, C-04 e [PV-12]) exigem aprovação sobre o commit final | 09/11/2026 | decisões |
| Registros de acesso (LOG-01) | Opção (a): guarda pelo Marco Civil, art. 15, com campos mínimos e expiração em 190 dias | 06/11 e 10/11/2026 | [E4](evidencias/golive-001/log-01-2026-11-10.md) |
| Reuniões | **Sem gravação** comercial nesta fase (CTL-01) | 05/11/2026 | procedimento Teams |
| Fluxos de representantes (art. 7º, IX) | "Aceitar o risco" **não** é solução: exige mecanismo do art. 33, fluxo a fluxo | 06/11/2026 | JUR-07 §2 |
| E5 (Teams) e E2 (e-mail) | **Não repetir** os testes (o conteúdo deles é relato: §B.1) | 09/11/2026 | decisões |
| "Abrir no e-mail" (REP-04) | Testado na homologação pública, depois da A8. **Não impede** a publicação | 09/11/2026 | [roteiro](evidencias/golive-001/email-recebimento-externo.md) |

## B. Evidências técnicas comprovadas

| Item | O que está comprovado | O que **não** está | Registro |
|---|---|---|---|
| **E1**: Bookings (09/11/2026) | Texto público passa nas 12 regras (B01 a B12): sem gravação, Teams, base legal (art. 7º, V), processamento fora do Brasil, retenção de 90 dias, alerta sobre senhas, canal `contato@`, remissão ao aviso, sem telefone, ciência em vez de consentimento, caixa "Li e entendi" | Validade jurídica do texto; o campo livre "Adicionar solicitações especiais" não é citado (J7-8) | [registro](evidencias/golive-001/bookings-validacao-final/registro.md) |
| **E3**: Microsoft 365 (10/11/2026) | Dados em repouso de Exchange, Teams, OneDrive e SharePoint em **Brasil/Brasil** | Bookings (fora do cartão), processamento, acesso de suporte, subprocessadores, mídia do Teams, Copilot | [registro](evidencias/golive-001/m365-local-dos-dados-2026-11-10.md) |
| **E4**: LOG-01 (10/11/2026) | Logs v2 ativos; bucket privado em `sa-east-1`; só os 5 campos; expiração em 190 dias; entrega real comprovada | O intervalo de 30 min não foi medido; a API do v2 fica em `us-east-1` (J7-3) | [registro](evidencias/golive-001/log-01-2026-11-10.md) |
| Auditoria AWS (10/11/2026) | Run `42809550459`: 26 OK, 3 informativos, 0 falhas; site em `sa-east-1` | A C13 não enxerga o v2 (coberto pelo E4) | E4 |
| Build e homologação | 304 testes, homologação 94/94; o portão bloqueia só por aprovações (PUB-19, 17, 09, 18 e 10) | — | `npm run check`, `scripts/homologacao.mjs` |

### B.1 Relatos da titular (sem evidência arquivada)

| Item | O que foi relatado | O que falta para virar evidência | Registro |
|---|---|---|---|
| E5: Teams (CTL-01) | "Configurações ajustadas e teste realizado" | Valores da política, data do teste e capturas (E-1 a E-7) | [decisões](evidencias/golive-001/decisoes-titular-2026-11-09.md) |
| E2: e-mail | Envio externo, recebimento em `contato@` e resposta testados | Data e hora, pasta de chegada, domínio do remetente | [decisões](evidencias/golive-001/decisoes-titular-2026-11-09.md) |

### B.2 Leitura documental (06/11/2026; não é evidência técnica nem parecer)

| Documento | O que a leitura encontrou | Limite da leitura | Registro |
|---|---|---|---|
| DPA da Microsoft (01/11/2026) | Transferência autorizada para os EUA e para os países dos subprocessadores; SCC da UE, IDTA e DPF só para dados que saem da UE, do EEE, do Reino Unido ou da Suíça. **Não foi encontrada** menção a LGPD, ANPD ou às CPC da Res. 19/2024 | Anexos e rodapés não foram lidos por inteiro. A **adoção das CPC não foi comprovada**, e isso não quer dizer que ela não exista ou que não possa ser pedida | JUR-07 §1 e §4.3 |
| DPA e página "Brazil Data Privacy" da AWS | A página diz que o DPA "meets the requirements of LGPD". **Não foi encontrada** menção às CPC da Res. 19/2024 | Não foi possível extrair o texto do PDF do DPA. A **adoção das CPC não foi comprovada** | JUR-07 §1 e §4.3 |

## C. Questões que exigem parecer

### C.1 Transferência internacional e base legal (JUR-06/JUR-07). Bloqueiam a **PUB-09**

Texto integral e contexto: [JUR-07 §4.5](NEKKORA-COM-GOLIVE-001-JUR-07.md).

| ID | Pergunta |
|---|---|
| **J7-1** | O empregado ou representante que pede proposta em nome da empresa pode ser atendido com base no **art. 7º, V**, ou a base é o **IX**? (JUR-06) |
| **J7-2** | O acesso de suporte do operador, a partir do exterior, a dados armazenados no Brasil é **transferência internacional** ("disponibiliza acesso", Res. 19/2024, art. 3º, III)? |
| **J7-3** | Para os fluxos com base no art. 7º, V e II (inclusive os registros de acesso), a transferência ao operador estrangeiro pode ser considerada **"necessária"** (art. 33, IX), se o operador foi escolha da Nekkora? |
| **J7-4** | Nos fluxos com base no IX, e sem adoção comprovada das CPC pela Microsoft (§B.2), qual mecanismo é admissível? (a) pedir à Microsoft a adoção das CPC; (b) consentimento específico (art. 33, VIII) no Bookings; (c) outra saída. Para o **e-mail de entrada**, há saída que não dependa da Microsoft? |
| **J7-5** | A entrega por ponto de presença do CloudFront no exterior é **coleta internacional** (Res. 19/2024, Anexo I, art. 6º) ou transferência? |
| **J7-6** | Qual é a **redação mínima** do aviso que cumpre o art. 33 e a Res. 19/2024 (país de destino, mecanismo) sem prometer mecanismo que não esteja comprovado? |
| **J7-7** | Com o E3 em Brasil (e sem Customer Lockbox comprovado no tenant), o que sobra de transferência sem mecanismo? É impeditivo para publicar o site **sem** o Bookings, ou só para o atendimento? |
| **J7-8** | O aviso do Bookings cita "as respostas deste formulário (empresa e processo, quando informados)", mas não o campo livre "Adicionar solicitações especiais". A redação basta ou precisa citá-lo? |

### C.2 Registros de acesso: texto [PV-12]. Bloqueia a **PUB-09**

Texto no site ("Registros de acesso"):

> "…Esses registros só são fornecidos a terceiros mediante ordem judicial, nos termos da lei (LGPD, art. 7º, II)."

| ID | Pergunta |
|---|---|
| **PV12-1** | As **hipóteses de compartilhamento** estão corretas e completas? Em especial: (a) se "só mediante ordem judicial" basta diante do Marco Civil (art. 10, §1º e §3º; art. 15, §3º) e de requisições de autoridades administrativas sobre dados cadastrais; (b) se a referência à LGPD, art. 7º, II, está adequada. |

### C.3 Condições comerciais (JUR-03). Bloqueiam a **1ª contratação**; podem mudar o texto do site (PUB-19)

Contexto: [minuta §12 e §13](../comercial/condicoes-comerciais-minuta.md).

| ID | Pergunta |
|---|---|
| **J3-a** | O início do desenvolvimento **dentro do prazo do CDC, art. 49**, exige alguma informação adicional ao consumidor? (C-02) |
| **J3-b** | A regra de não pedir licenças durante o prazo de arrependimento (contrato-base 3.4) basta para os **contratos acessórios**? (C-02) |
| **J3-c** | A retenção de **50% do valor pago** na relação de consumo é válida (CDC, art. 51, IV, e art. 53)? (C-04) |
| **J3-d** | A retenção de 50% **sem entrega** é equilibrada, já que a desistência encerra a contratação sem entrega definitiva (contrato-base 10.4)? (C-04) |
| **J3-e** | A mesma regra serve ao **B2B** sem ajuste? (C-04) |

**Decisão da titular, fora do parecer:** publicar o site com o texto de condições atual (PUB-19) antes das respostas
J3, ou esperar o parecer. Nenhuma das duas está presumida aqui.

## D. Alterações obrigatórias se o parecer determinar correção

Depois de **qualquer** mudança: `npm run texto`, `npm run check`, homologação (`scripts/homologacao.mjs`) e **nova
aprovação sobre o commit final** (PUB-09, PUB-17 e PUB-19, conforme o caso). Mudanças no Microsoft 365 ou na AWS só
com **autorização específica** da titular.

| Se o parecer disser… | Muda no código ou no aviso | Muda fora do repositório |
|---|---|---|
| **J7-1**: representante com base no IX | `src/content.ts`: item "Uso e seus direitos" (hoje cita só o art. 7º, V); `privacidade-minuta.md` §2 e §6; regra B04 de `conferir-bookings.mjs` | Texto do Bookings (M365; hoje também cita só o art. 7º, V), depois repetir o E1 |
| **J7-4**: consentimento (art. 33, VIII) | Aviso: o item "Onde os dados são processados"; `conferir-bookings.mjs` com uma regra nova para a confirmação | Bookings: pergunta obrigatória e registro do consentimento (M365) |
| **J7-4**: CPC | Aviso: o mecanismo citado por fluxo | Pedido formal à Microsoft e assinatura das CPC |
| **J7-2, J7-3, J7-5, J7-6, J7-7** | `src/content.ts`: o item "Onde os dados são processados", com o texto-base da JUR-07 §3, item 7, e o mecanismo de cada caso; `privacidade-minuta.md` §5 | Eventual contratação (Customer Lockbox ou ADR), só se o parecer exigir |
| **J7-8**: citar o campo livre | `privacidade-minuta.md` §4 e a regra correspondente em `conferir-bookings.mjs` | Texto do Bookings (M365), depois repetir o E1 |
| **PV12-1**: mudar as hipóteses de compartilhamento | `src/content.ts`: a frase final do [PV-12]; `privacidade-minuta.md` (linha "Registros de acesso") | — |
| **PV12-1**: mudar campos ou retenção | `deploy/aws/logs/entrega.json` ou `ciclo-de-vida.json`, o [PV-12] e `aviso-logs.test.mjs` | AWS: `UpdateDeliveryConfiguration` ou ciclo de vida, com autorização |
| **J3-c, J3-d, J3-e**: ajustar a retenção na homologação | `src/content.ts` (condições, CO-11); `scripts/comercial/regras-delivery.mjs` (`RETENCAO_NA_HOMOLOGACAO_PERCENTUAL`, `resultadoDaDesistencia`); `condicoes-delivery.test.mjs`; contrato-base cl. 10; Anexo B2B §2-A; proposta-modelo; procedimento §5 e §6; matriz CO-11 | — |
| **J3-a, J3-b**: informação adicional ou regra de licenças | Contrato-base cl. 3.1 a 3.4; proposta-modelo; procedimento §1 e §2; `src/content.ts` só se a informação tiver de aparecer no site | — |

## E. Depois do parecer: o que resta para publicar

1. Aplicar as correções da seção D, se houver, com o diff revisado pela titular.
2. Titular: aprovar a PUB-17, a PUB-09 e a PUB-19 **sobre o mesmo commit**.
3. PR única da release (`release/v1` → `main`), com `publicacao: true`, `avisoHomologacao: false` e as aprovações
   com `$origem`.
4. Titular: PUB-18 (autorização expressa), merge, tag `v1.0.0` e deploy.
5. DNS (A7) e `DOMINIO_PUBLICO` (A8), com autorização.
6. Homologação pública: repetir o E1 e testar o "Abrir no e-mail" (REP-04).
