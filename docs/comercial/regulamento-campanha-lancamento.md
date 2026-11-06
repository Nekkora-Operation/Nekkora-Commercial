# Regulamento da campanha de lançamento — Nekkora Delivery (minuta)

> **MINUTA NÃO APROVADA.** NEKKORA-COM-CONTRACT-001 (06/11/2026), diretriz **C-10**. Os preços são os já aprovados
> (PUB-14) e vêm de `src/precos.ts`, sem alteração. **As datas não foram fixadas nesta missão:** o período em
> `publicacao.json` (06/11/2026 a 06/01/2027) é **histórico** e não vale como nova autorização (§1). O resumo exibido no
> site está em `src/content.ts` (`PRICING.launch.rules`) e depende da nova aprovação dos textos (PUB-17).
> Marcadores como no [contrato-base](contrato-base-delivery.md). **R1 (06/11/2026):** critérios de classificação por
> esforço técnico estimado (§5), aprovados pela titular; as datas continuam pendentes.

## 1. Período **[!]**

**[D]** Dois meses a partir da **publicação oficial**. **[!] Datas fixas pendentes de aprovação da titular** (PUB-13).
O código nunca calcula nem preenche as datas: a titular registra `campanhaLancamento.inicio/fim` em `publicacao.json`.
O portão recusa campanha encerrada.

## 2. Preços

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

| Canal | Evidência | Observação |
|---|---|---|
| E-mail `contato@nekkora.com` | Data e hora de recebimento no servidor do Microsoft 365 (cabeçalho `Received`), no horário de Brasília | Vale o recebimento, não o clique no site nem a data de escrita. Não apagar a mensagem antes do fim do prazo de aceite |
| Microsoft Bookings | Data de **criação** da reserva (notificação e histórico) | Não a data da reunião |
| LinkedIn | Data e hora da mensagem recebida | Captura ou exportação ao emitir a proposta |
| Envio automático (inativo) | Protocolo do backend | Só após PUB-21 |

A proposta registra "Data da solicitação" com data, hora, canal e referência (OPS-03). Na dúvida perto da virada do
último dia, vale o registro do servidor.

## 5. Critérios de classificação **[D]** (R1, 06/11/2026), redação **[R]**

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

## 6. Exemplos testados (`scripts/testes/condicoes-delivery.test.mjs`)

Com um período sintético de 01/12/2026 a 31/01/2027: e-mail recebido em 01/12 00:05 (Brasília) → lançamento; em 31/01
23:59 → lançamento; em 01/02 00:00 → padrão; recebido em 31/01, proposta emitida em 05/02 → lançamento, aceitável até
12/02.
