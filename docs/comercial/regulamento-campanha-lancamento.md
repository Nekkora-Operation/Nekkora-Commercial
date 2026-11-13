# Regulamento da campanha de lançamento — Nekkora Delivery

> **Situação de aprovação (COM-VITRINE-001):** não fica registrada neste arquivo. Este regulamento só vale como
> aprovado com a impressão de **PUB-19** (`impressoesDeConteudo.condicoesComerciais`) aprovada em `publicacao.json` e o
> registro expresso da titular em `$origem`. Sem esse registro, ele **não está aprovado**. A aprovação de PUB-19
> **não aprova** o contrato-base, os anexos, a proposta-modelo nem o procedimento operacional, e **não libera a
> contratação de pacotes**, que depende de aprovação contratual específica (§7.6).
>
> **Histórico.** NEKKORA-COM-CONTRACT-001 (06/11/2026), diretriz **C-10**: os preços da tabela anterior (§2) foram
> aprovados na v1.0.0; a tabela nova (§7) tem aprovação própria (PUB-14). **Datas (09/11/2026):** a titular decidiu **manter 06/11/2026 a
> 06/01/2027**, o período já gravado em `publicacao.json` (§1; [registro](../release/evidencias/golive-001/decisoes-titular-2026-11-09.md)).
> O resumo exibido no site está em `src/content.ts` (`PRICING.launch.rules`) e depende da aprovação dos textos
> (PUB-17). Marcadores como no [contrato-base](contrato-base-delivery.md). **R1 (06/11/2026):** critérios de
> classificação por esforço técnico estimado (§5), aprovados pela titular.
>
> **[COM-VITRINE-001](../release/COM-VITRINE-001.md) — nota de transição (etapa 6, 11/11/2026). MINUTA NÃO APROVADA.** O período continua
> **06/11/2026 a 06/01/2027**. Dentro dele passam a existir **duas tabelas**, separadas pela **data de início das novas
> condições** (`novasCondicoes.inicio` em `publicacao.json`, **ainda não definida** — PUB-13): solicitações recebidas
> de 06/11/2026 até a véspera dessa data seguem os §2 a §6, **preservados como histórico e como compromisso** (V-02);
> as recebidas a partir dela seguem o **§7**. Nenhum texto anterior foi apagado. A tabela nova depende da aprovação
> própria (PUB-14, impressão digital e registro da titular) e a continuidade depois de 06/01/2027, da V-01.

## 1. Período

**[D]** De **06/11/2026 a 06/01/2027**, incluindo o primeiro e o último dia, no horário de Brasília.
- As datas foram mantidas pela titular em 09/11/2026 (D2/PUB-13).
- Elas substituem a regra anterior de "dois meses a partir da publicação oficial" (COM-008-B).
- Como a publicação ocorre depois de 06/11/2026, o período efetivo com o site no ar fica **menor que dois meses**.
O código nunca calcula nem preenche as datas: a titular registra `campanhaLancamento.inicio/fim` em `publicacao.json`.
O fim da campanha encerra só a comunicação promocional; a tabela do §7 continua depois dele (§7.5, V-01).

## 2. Preços

> **Tabela anterior** — vale só para solicitações recebidas **antes** da data de início das novas condições (§7.4).
> Não é mais exibida no site.

| Categoria | Padrão | Lançamento |
|---|---:|---:|
| Simples | R$ 1.500 | R$ 1.000 |
| Média | R$ 3.500 | R$ 2.800 |
| Complexa | Sob orçamento | Sob orçamento, **sem desconto automático** |

**[D]** Preço **por automação**. Não existe desconto geral de 50% (os 50% + 50% são forma de pagamento).

## 3. Quem tem direito **[D]**, redação **[R]**

1. Solicitação de avaliação **recebida pela Nekkora** dentro do período, inclusive o primeiro e o último dia, no horário
   de Brasília.
2. Automação classificada como **simples ou média** pelos critérios do §5 (esforço técnico estimado), com a classificação e a justificativa
   escritas na proposta.
3. Nesse caso, o preço de lançamento da categoria **é devido** — a oferta vincula (**[N]** CDC art. 30, conferido na
   LEGAL-BASE-001). Não há reserva discricionária.
4. **Proposta emitida depois do fim da campanha** mantém o preço de lançamento da solicitação recebida no período.
5. A proposta pode ser aceita em até **7 dias corridos da emissão** (contagem: exclui o dia da emissão, inclui o
   último).
6. **Mudança de escopo posterior** à proposta é avaliada em aditivo ou nova proposta, que informa o preço aplicável; o
   preço de lançamento **não** se estende automaticamente a ela.
7. Várias automações: cada uma com categoria e preço próprios; pedir várias juntas não muda a categoria de nenhuma.

## 4. Prova da data de recebimento **[R]**

> **NEKKORA-COM-CANAIS-001 — PROPOSTA pendente de conferência da titular (PUB-19), 12 e 13/11/2026.** Aprovada
> conceitualmente em 13/11/2026; não vale como PUB-19 aprovada até a conferência do texto definitivo e da impressão.
>
> - **WhatsApp:** único canal promovido na vitrine para novas solicitações comerciais.
> - **E-mail e LinkedIn:** a vitrine não os usa como formulário nem como botão comercial, mas uma solicitação ainda pode
>   chegar por eles e vale pela data em que for recebida.
> - **Microsoft Bookings e envio automático:** indisponíveis na nova vitrine. As linhas abaixo continuam valendo para as
>   solicitações e compromissos já recebidos por eles; nada desse histórico é apagado.
>
> **Abrir o WhatsApp não é solicitação.** O clique no site só abre o aplicativo com uma mensagem sugerida, que o
> visitante pode editar ou não enviar. Vale a mensagem **efetivamente recebida** na conversa, com data e hora
> verificáveis. A vigência da campanha, os preços e os compromissos anteriores não mudam.

| Canal | Evidência | Observação |
|---|---|---|
| WhatsApp `+55 (11) 91772-4200` (único canal promovido na vitrine, NEKKORA-COM-CANAIS-001) | Data e hora da mensagem recebida na conversa, no horário de Brasília | Vale o recebimento, não o clique no site, a abertura do aplicativo nem a data de escrita. Captura ou exportação da conversa, com data e hora visíveis, ao emitir a proposta; não apagar a conversa antes do fim do prazo de aceite |
| E-mail `contato@nekkora.com` (sem botão na vitrine; vale o que chegar por ele) | Data e hora de recebimento no servidor do Microsoft 365 (cabeçalho `Received`), no horário de Brasília | Vale o recebimento, não o clique no site nem a data de escrita. Não apagar a mensagem antes do fim do prazo de aceite |
| Microsoft Bookings (indisponível na vitrine desde a NEKKORA-COM-CANAIS-001; vale para o histórico) | Data de **criação** da reserva (notificação e histórico) | Não a data da reunião |
| LinkedIn (rede institucional; vale o que chegar por ele) | Data e hora da mensagem recebida | Captura ou exportação ao emitir a proposta |
| Envio automático (indisponível na vitrine: sem formulário) | Protocolo do backend | Vale para o histórico; nenhuma solicitação nova chega por ele |

A proposta registra "Data da solicitação" com data, hora, canal e referência (OPS-03). Na dúvida perto da virada do
último dia, vale o registro do servidor.

## 5. Critérios de classificação **[D]** (R1, 06/11/2026), redação **[R]**

> **COM-VITRINE-001 (V-04):** a partir da data de início das novas condições, a vitrine tem só **simples** (até 8 h) e
> **média** (acima de 8 até 16 h); as horas são **referência**, e o enquadramento definitivo depende da avaliação
> técnica e dos demais critérios. A faixa "complexa acima de 16 horas" e a exceção do §5.3 continuam valendo **só** para
> as solicitações anteriores. Depois da data, a demanda que não se enquadra como simples ou média recebe **avaliação
> individual** (proposta específica), sem categoria pública, preço de tabela ou pacote.

**5.1 Parâmetro principal — esforço técnico estimado de uma automação individual.** Parâmetros iniciais aprovados
pela titular:

| Categoria | Esforço técnico estimado |
|---|---|
| Simples | **até 8 horas** |
| Média | **acima de 8 até 16 horas** |
| Complexa | **acima de 16 horas**, ou complexidade ou risco excepcional justificado (§5.3) |

É o esforço de **desenvolvimento da automação**, não o tempo de espera na fila. A proposta continua informando as
datas previstas de início e de disponibilização para homologação (contrato-base cláusula 5); não se promete que toda
automação seja concluída em dois dias.

**5.2 Critérios complementares.** A estimativa de horas é justificada, na proposta, por fatos observáveis sobre:
quantidade de sistemas; tipo e dificuldade das integrações; regras de negócio e exceções; volume e criticidade dos
dados; dependências externas; estabilidade dos sistemas; infraestrutura e licenciamento; riscos técnicos,
operacionais e de segurança; esforço de testes e homologação. **[D]** Não há enquadramento automático pela
**contagem isolada** de sistemas ou APIs: duas APIs simples, por exemplo, não tornam a automação complexa. Os fatos
fundamentam a estimativa; não sobem a categoria sozinhos.

**5.3 Exceção — complexa abaixo de 16 horas.** **[D]** Só com justificativa técnica **excepcional**, **verificável** e
**informada ao cliente antes do aceite**, escrita na proposta com os fatos. A exceção **não pode ser usada para negar o
preço promocional**: sem os três requisitos, vale a categoria pelo esforço (`classificarAutomacao` recusa a exceção
incompleta).

**5.4 Questionamento.** **[R]** O cliente pode questionar a classificação por escrito antes do aceite; a Nekkora
responde citando a estimativa, os critérios e os fatos.

**5.5 Lacunas registradas (COM-10) [!].** **[R]** (a) A estimativa de horas é feita pela própria Nekkora: para torná-la
verificável, propõe-se registrar na proposta a decomposição da estimativa (atividades e horas). (b) Não há regra para
elevar de simples a média por critério complementar sem passar pelas horas; esta versão **não** cria essa elevação.
(c) Os perfis dos cartões de preço ("um sistema ou planilha", "mais de um sistema", "ponta a ponta ou com várias
integrações por API") passam a ser **exemplos típicos**, e o site informa o critério do esforço (PUB-17). Alternativas
para (a) e (b), para decisão da titular: manter assim; ou fixar uma tabela de referência de horas por tipo de
atividade. ⚖ Validade dos critérios como base de uma oferta vinculante (CDC arts. 30 e 31).

## 6. Exemplos testados — tabela anterior (`scripts/testes/condicoes-delivery.test.mjs`)

Com um período sintético de 01/12/2026 a 31/01/2027: e-mail recebido em 01/12 00:05 (Brasília) → lançamento; em 31/01
23:59 → lançamento; em 01/02 00:00 → padrão; recebido em 31/01, proposta emitida em 05/02 → lançamento, aceitável até
12/02.

## 7. Novas condições — [COM-VITRINE-001](../release/COM-VITRINE-001.md) (a partir da data de início)

**7.1 Tabela [D]** (valores de `src/precos.ts`, aprovados só com a impressão e o registro de PUB-14):

| Categoria | Individual | Pacote de 3 (mesma categoria) | Economia do pacote |
|---|---:|---:|---:|
| Simples | R$ 650 | R$ 1.500 | R$ 450 |
| Média | R$ 1.400 | R$ 3.500 | R$ 700 |

A economia é a diferença entre três automações individuais e o pacote, sempre na tabela nova. Não há comparação com a
tabela anterior nem acúmulo de descontos. Sem mensalidade. O site não mostra valor unitário dentro do pacote (V-07).

**7.2 Quem tem direito [D], redação [R].**
1. Solicitação de avaliação **recebida** a partir da data de início, inclusive, no horário de Brasília, provada como no
   §4. A data de início é a da **publicação efetiva** da nova vitrine em produção, registrada pela titular
   (`novasCondicoes.inicio` e `$origem`); nunca retroativa ao início da campanha.
2. Automação classificada como **simples ou média** pelo §5 (com a nota da COM-VITRINE-001), com a justificativa na
   proposta. Demanda fora dessas categorias: **avaliação individual**, sem preço de tabela.
3. Proposta aceitável em até **7 dias corridos** da emissão (mesma contagem do §3, item 5). Mudança de escopo posterior:
   aditivo ou nova proposta (§3, item 6).

**7.3 Pacote de três [D] (V-03).**
1. Três automações **da mesma categoria**, pelo preço do pacote. Com 4 ou 5, um pacote e as demais no preço
   individual; com 6, dois pacotes. Regra: pacotes de três enquanto houver três, e o restante no individual.
2. **Pacote misto** (categorias diferentes) só por proposta específica; não aparece no site nem no simulador.
3. Cada automação do pacote tem **escopo, documentação, critérios de homologação, aceite e cronograma próprios**.
4. Pagamento: 50% do valor do pacote após a aprovação da proposta e a formalização da contratação, e 50% após a
   homologação e o aceite formal. O vencimento do saldo, o cancelamento parcial e o reembolso no pacote são definidos
   na proposta e no contrato (§7.6); este regulamento não os fixa.

**7.4 Compromissos anteriores [D] (V-02).**
1. Solicitação recebida de 06/11/2026 até a véspera da data de início mantém a oferta anterior (§2 e §3): preço de
   lançamento da categoria, inclusive com proposta emitida depois, e os 7 dias para aceite.
2. Havendo **equivalência de escopo e modalidade**, a Nekkora **propõe** ao cliente a condição mais favorável (em
   regra, a tabela nova), registrando na proposta a condição anterior e a oferecida.
3. Proposta **já aceita** só muda por acordo escrito das partes; nada é substituído unilateralmente.
4. Automação complexa solicitada antes da data continua com avaliação individual (a oferta anterior não fixava preço).
5. O levantamento das solicitações recebidas desde 06/11/2026 é da titular (e-mail e LinkedIn).

**7.5 Depois de 06/01/2027 (V-01).** A tabela do §7.1 continua valendo **até nova revisão expressa**; a comunicação
promocional (faixa e regras da campanha no site) termina em 06/01/2027, sem nova data e sem retorno automático aos
preços anteriores. Vale só com a aprovação V-01 registrada pela titular (`tabelaDePrecos.posCampanha` e `$origem`);
sem ela, a nova vitrine não é publicada.

**7.6 O que este regulamento não aprova [!].** A redação contratual dos pacotes (contrato-base, cl. 6-A e 9-A; propostas
DP-01 a DP-05 em [COM-VITRINE-001 §10.5](../release/COM-VITRINE-001.md)), os anexos, a proposta-modelo e o procedimento
operacional têm aprovação própria, com avaliação jurídica. **Até essa aprovação, nenhum pacote é contratado**: a
solicitação é recebida e avaliada, sem formalização do pacote.

**7.7 Exemplos testados (`scripts/testes/condicoes-delivery.test.mjs`, teste V-02):** com data de início sintética,
solicitação recebida antes mantém o preço de lançamento e recebe só a **sugestão** da tabela nova (não aplicada);
recebida a partir dela, tabela nova; três médias formam um pacote; categorias diferentes não formam pacote.
