# Contrato-base — Nekkora Delivery (minuta)

> **MINUTA NÃO APROVADA. Não é parecer jurídico. Não autoriza contratação.** Redigida na
> [NEKKORA-COM-CONTRACT-001](../release/NEKKORA-COM-CONTRACT-001.md) (06/11/2026) a partir das **decisões empresariais
> definitivas da titular C-01 a C-12**. Essas decisões são aprovações empresariais: **não aprovam esta redação**, não
> substituem a revisão por advogado(a) (adiada pela titular, **pendente**) e não autorizam marcar
> `aprovacoes.condicoesComerciais` como `true` (PUB-19).
>
> **Atualizado na [R1](../release/NEKKORA-COM-CONTRACT-001-R1.md) (06/11/2026)** com as decisões complementares da
> titular (C-03 prazo do reembolso, C-04 por enquadramento, C-06 lembretes, C-07 atendimento, C-10 critérios por horas,
> C-11 atualização monetária). A redação anterior está no histórico do git (commit `43da08f`).
>
> **Alterações da titular de 09/11/2026:** sem espera obrigatória para o início (cl. 3.1) e nova regra de desistência
> durante a homologação, com reembolso de 50% do valor pago (cl. 10). As duas estão sujeitas à revisão jurídica.
>
> **[COM-VITRINE-001](../release/COM-VITRINE-001.md) (etapa 6, 11/11/2026), MINUTA NÃO APROVADA:** cláusula 6.1 atualizada (duas tabelas), nova
> **cláusula 6-A** (pacote de três), nova **cláusula 9-A** (cancelamento parcial do pacote) e item **14.3** (titularidade
> no pacote). Diretrizes da titular (V-02, V-03, V-05) **[D]**; redação e opções **[R]**; decisões em aberto **DP-01 a
> DP-05** ([COM-VITRINE-001 §10.5](../release/COM-VITRINE-001.md)). A cláusula 10 continua **não aprovada** e **não se
> aplica aos pacotes**. Esta minuta deve ser validada **antes da primeira contratação**.
>
> **Diretrizes da titular de 12/11/2026 para DP-01 a DP-05:** registradas abaixo como **propostas para análise
> contratual**, marcadas **[P]**. **Não são aprovação definitiva** e esta minuta **não é contrato pronto para
> assinatura**. Antes da primeira contratação com pacote: aprovação expressa das condições finais e avaliação jurídica
> proporcional aos riscos.
>
> **Hierarquia (R1, [R] ⚖):** (1) norma obrigatória; (2) **condição particular da proposta** que indique expressamente
> a cláusula deste contrato que altera, desde que não reduza direito legal; (3) [Anexo B2B](anexo-b2b-delivery.md),
> **só quando validamente aplicável** e só nos temas que lista; (4) este contrato-base; (5) termo de garantia e Anexo de
> Componentes, que **detalham** as cláusulas 13 e 14 e prevalecem sobre o resumo delas no mesmo tema. Contradição não
> intencional entre documentos interpreta-se da forma mais favorável ao CONTRATANTE (**[N]** CDC art. 47). Assim, uma
> condição aprovada para uma automação não perde eficácia por divergência documental involuntária. Onde uma diretriz
> conflita com norma, a norma prevalece e o conflito está no [relatório §4](../release/NEKKORA-COM-CONTRACT-001.md).
>
> Marcadores: **[D]** diretriz da titular · **[R]** redação proposta pelo agente · **[N]** norma conferida no texto
> oficial · **[I]** interpretação do agente · **⚖** exige parecer jurídico · **[!]** decisão ou evidência ainda pendente · **[P]** proposta da titular para análise
> contratual, ainda não aprovada.
>
> Documentos ligados: [proposta-modelo](proposta-modelo-delivery.md) · [termo de garantia](termo-garantia-delivery.md) ·
> [Anexo de Componentes](anexo-componentes-delivery.md) · [Anexo B2B](anexo-b2b-delivery.md) ·
> [regulamento da campanha](regulamento-campanha-lancamento.md) · [procedimento operacional](procedimento-operacional-delivery.md) ·
> histórico das decisões: [`condicoes-comerciais-minuta.md`](condicoes-comerciais-minuta.md). Regras executáveis e
> testadas: [`scripts/comercial/regras-delivery.mjs`](../../scripts/comercial/regras-delivery.mjs).

---

## Cláusula 1 — Partes, objeto e natureza da contratação (C-01)

1.1 **[R]** CONTRATADA: NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA ("Nekkora"), CNPJ
68.337.624/0001-32, Rua Pais Leme, 215, Conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150, contato@nekkora.com.
CONTRATANTE: identificado na proposta.

1.2 **[R]** Objeto: desenvolvimento das automações descritas na proposta, **cada uma com escopo, preço, cronograma e
critérios de aceite próprios** (C-08, C-12). Não inclui sustentação, monitoramento, hospedagem, alocação permanente de
profissionais nem novas funcionalidades, salvo proposta específica (C-07, C-09).

1.3 **[D]** Este contrato-base é **compatível com o Código de Defesa do Consumidor** e se aplica a todos os clientes.
**[D]** Ter CNPJ **não** afasta, por si, a relação de consumo. **[N]** CDC arts. 2º e 29. **[I]** Uma pessoa jurídica
pode ser consumidora quando contrata como destinatária final; só o caso concreto define.

1.4 **[D]** O [Anexo B2B](anexo-b2b-delivery.md) só se aplica quando a proposta registrar **a justificativa concreta**
do enquadramento empresarial, conforme os critérios do anexo. **[R]** Na dúvida, não se usa o anexo.

## Cláusula 2 — Proposta, aceite e validade (C-10)

2.1 **[R]** A contratação se forma pelo aceite expresso da proposta, na forma nela indicada, e pela assinatura deste
contrato-base. ⚖ Forma do aceite e da assinatura (assinatura eletrônica ou e-mail): **[!]** pendente (OPS-04).

2.2 **[D]** Na campanha de lançamento, a proposta tem validade expressa de **7 dias corridos a partir da emissão**.
**[N]** CDC art. 40, §1º: o orçamento vale 10 dias "salvo estipulação em contrário" (conferido na LEGAL-BASE-001).
**[R]** A contagem exclui o dia da emissão e inclui o último (ex.: emitida em 10/11, aceitável até 17/11). Fora da
campanha, a validade é a indicada na proposta.

## Cláusula 3 — Início do desenvolvimento e direito de arrependimento (C-02)

3.1 **[D]** Não há prazo de espera obrigatório depois da assinatura. O desenvolvimento de cada automação começa na
**data prevista de início** informada na proposta, conforme a fila operacional (cláusula 5). Desde a formalização, a
Nekkora mantém o atendimento ao CONTRATANTE pelos canais deste contrato. Isso não é promessa de início imediato nem de
prazo igual para todas as automações. **[!]** Alteração da titular de 09/11/2026, que substitui a espera de 7 dias da
redação anterior. Está sujeita à revisão jurídica (JUR-03).

3.2 **[N]** CDC art. 49: o consumidor pode desistir em 7 dias, a contar da assinatura ou do recebimento do serviço,
quando a contratação ocorre fora do estabelecimento comercial; os valores pagos "a qualquer título" são devolvidos de
imediato, monetariamente atualizados. **[R]** Este contrato **preserva integralmente** esse direito e **não fixa** um
termo final diferente do legal: o início do desenvolvimento, mesmo dentro do prazo legal, **não extingue** direito legal
com termo inicial ou forma de exercício diferente, nem reduz a restituição do item 3.4. ⚖ Termo inicial do arrependimento em serviço sob encomenda
("recebimento do serviço").

3.3 **[R]** Exercício: resposta ao e-mail da proposta ou mensagem para **contato@nekkora.com**, sem necessidade de
justificativa. **[N]** Decreto 7.962/2013, art. 5º, caput e §1º (meio claro e ostensivo; mesma ferramenta da
contratação) e §4º: **confirmação imediata** do recebimento. **[R]** A Nekkora confirma por escrito, no mesmo canal, o
recebimento do pedido. **[!]** Como garantir a confirmação **imediata** (resposta automática ou rotina): OPS-11.

3.4 **[R]** No arrependimento legal, a Nekkora devolve **tudo o que recebeu do CONTRATANTE, a qualquer título**, de
imediato e com atualização monetária, sem multa nem desconto. **[N]** Decreto 7.962/2013, art. 5º, §2º: o
arrependimento rescinde os contratos acessórios sem ônus. **[R]** Para evitar custo de terceiros dentro do prazo, a
Nekkora **não pede** ao CONTRATANTE que contrate licenças ou serviços externos enquanto houver prazo legal de
arrependimento em curso. ⚖ Alcance de "contratos acessórios" para licenças contratadas diretamente pelo CONTRATANTE.

## Cláusula 4 — Escopo, mudanças e custos externos (C-08)

4.1 **[D]** Escopo **fechado por automação**, descrito na proposta com critérios objetivos de aceite.

4.2 **[D]** Funcionalidade adicional ou mudança de escopo **exige aditivo ou nova proposta, com orçamento e aprovação
expressa antes da execução**. **[N]** CDC art. 39, VI, e art. 40 (conferidos na LEGAL-BASE-001).

4.3 **[D]** Correção de defeito do escopo contratado **nunca é cobrada** (cláusulas 8 e 11).

4.4 **[D]** Licenças (UiPath, Power Automate etc.), APIs, infraestrutura e demais despesas externas são **discriminadas
na proposta antes do aceite**, com quem contrata e o custo estimado. **[D]** Preferencialmente, o CONTRATANTE contrata e
paga diretamente. **[R]** Custo externo não previsto na proposta **não é repassado** sem nova aprovação expressa do
CONTRATANTE. **[N]** CDC art. 40, §3º.

## Cláusula 5 — Cronograma e fila operacional (C-12)

5.1 **[D]** Cada automação tem, na proposta: escopo, preço, **data prevista de início**, **data prevista de
disponibilização para homologação**, dependências informadas e critérios objetivos de aceite.

5.2 **[D]** A Nekkora organiza as demandas em fila, mas **a fila não deixa o início a critério exclusivo da Nekkora**:
vale a data prevista na proposta. **[N]** CDC art. 39, XII. **[R]** A data prevista de início é definida em cada
proposta, nunca antes da assinatura, e não há data universal (cláusula 3.1).

5.3 **[D]** "Dois dias úteis de desenvolvimento" é referência operacional possível, **nunca promessa universal**; não
aparece como prazo garantido.

5.4 **[D]** Mudança de cronograma: **justificada, comunicada e acordada por escrito**. **[R]** Sem a concordância escrita
do CONTRATANTE, valem as datas da proposta; atraso imputável à Nekkora segue a cláusula 11. Atraso causado por
dependência do CONTRATANTE ou de terceiro indicado na proposta desloca o cronograma pelo mesmo período, comunicado por
escrito.

5.5 **[D]** Não há reuniões diárias obrigatórias. **[D]** Não se promete painel de acompanhamento nem portal de
solicitações (não existem).

## Cláusula 6 — Preço e pagamento (C-05, C-10, C-11)

6.1 **[D]** Preço por automação, definido na proposta. Na campanha, conforme o
[regulamento](regulamento-campanha-lancamento.md). Os valores da tabela oficial (`src/precos.ts`) não são alterados por
este contrato. **[D] (COM-VITRINE-001, V-02)** Solicitação recebida **antes** da data de início das novas condições:
tabela anterior (regulamento §2 e §3), com a condição mais favorável apenas **proposta** quando houver equivalência;
recebida **a partir** dela: preço individual ou de pacote (cláusula 6-A) da tabela nova (regulamento §7).

6.2 **[D]** **50% na contratação** e **50% após a homologação e o aceite formal** (cláusula 8). **[D]** Cada parcela
vence em **5 dias úteis** da cobrança, com a **data de vencimento escrita na cobrança**.

6.3 **[D]** O silêncio do CONTRATANTE **não torna exigível** a segunda parcela (cláusula 8.4). A desistência também não
o torna exigível: durante a homologação, vale a cláusula 10, sem cobrança adicional.

6.4 Meio: Pix para a conta da Nekkora. ⚖ **[!]** Nota fiscal e tributos: pendente (JUR-01).

## Cláusula 6-A — Pacote de três automações (COM-VITRINE-001, V-03) — MINUTA NÃO APROVADA

6-A.1 **[D]** O pacote reúne **três automações da mesma categoria**, pelo preço do pacote da tabela vigente na data da
solicitação. É avulso: sem mensalidade, renovação ou compromisso de novas contratações.

6-A.2 **[D]** Cada automação do pacote tem **escopo, documentação, critérios de aceite, cronograma, homologação e aceite
próprios** (cláusulas 4, 5, 7 e 8). O pacote não transforma as três em uma automação só nem muda a categoria de
nenhuma.

6-A.3 **[D]** Pagamento **50% + 50% por pacote**. A 1ª parcela é **50% do preço do pacote**, na contratação (6.2).
⚖ **[!] DP-01 — vencimento da 2ª parcela:**
- **(a)** 50% do preço do pacote depois do aceite formal da **última** automação do pacote; ou
- **(b) [R] recomendada:** a 2ª parcela dividida em **três frações iguais** (1/6 do preço do pacote cada), cada uma
  depois do aceite formal da respectiva automação.

A opção (b) acompanha o aceite individual (6-A.2) e a titularidade por automação (14.3). Em qualquer opção, o silêncio
não torna nada exigível (6.3).

**[P] Proposta para análise (DP-01, 12/11/2026), não aprovada:** entrada de 50% do valor do pacote e saldo cobrado
proporcionalmente ao aceite individual de cada uma das três automações (direção da opção b). A parcela de uma automação
**não é cobrada antes da homologação e do aceite formal dela**. O saldo de cada automação é o seu valor de referência
(6-A.4) menos a parte da entrada alocada a ela, pela mesma regra de centavos.

6-A.4 **[R]** ⚖ **[!] DP-02 — valor de referência de cada automação no pacote:** preço do pacote ÷ 3, para reembolso,
quitação e titularidade. Simples: R$ 500,00. Média: R$ 1.166,67, R$ 1.166,67 e R$ 1.166,66, para fechar R$ 3.500,00.
É valor contratual interno e **não é preço publicado** (o site não mostra valor unitário no pacote — V-07).

**[P] Proposta para análise (DP-02, 12/11/2026), não aprovada:** o valor do pacote, em **centavos inteiros**, é
dividido por três; cada automação recebe o quociente inteiro e o resíduo (0, 1 ou 2 centavos) vai, um centavo por vez,
às primeiras automações na ordem da proposta. A soma é **exatamente** o preço contratado. A entrada é alocada pela mesma
regra. Exemplos: simples, referência R$ 500,00 cada, entrada R$ 250,00 e saldo R$ 250,00 cada; média, referência
R$ 1.166,67, R$ 1.166,67 e R$ 1.166,66, entrada R$ 583,34, R$ 583,33 e R$ 583,33, saldo R$ 583,33, R$ 583,34 e
R$ 583,33. Os valores de referência servem só para contabilização, quitação e cancelamentos, **não criam preço
público** novo.

6-A.5 **[D]** Com 4 ou 5 automações da mesma categoria: um pacote e as demais no preço individual; com 6, dois pacotes.
**Pacote misto** (categorias diferentes) só por **proposta específica**, com preço e regras escritos nela.

6-A.6 **[D]** O pacote não se acumula com outro desconto nem com o preço de lançamento da tabela anterior.

## Cláusula 7 — Desenvolvimento, testes e disponibilização (C-05)

7.1 **[D]** Sequência padrão: (1) desenvolvimento; (2) testes técnicos; (3) disponibilização para homologação;
(4) homologação e aceite expresso; (5) cobrança e pagamento da segunda parcela; (6) entrega definitiva.

7.2 **[R]** **Conclusão técnica integral e comprovada** de uma automação exige, cumulativamente:
(a) relatório de testes técnicos cobrindo **cada** critério de aceite da proposta, com o resultado de cada um;
(b) documentação prevista na proposta pronta;
(c) nenhum defeito conhecido pendente;
(d) **disponibilização efetiva** para homologação: comunicação escrita com o ambiente, os acessos e as instruções, e
confirmação técnica de que o ambiente está operacional para o CONTRATANTE.
Sem todos esses itens, o desenvolvimento **não está concluído** para os fins das cláusulas 9 e 10.

## Cláusula 8 — Homologação e aceite (C-06)

8.1 **[D]** O CONTRATANTE tem **10 dias úteis** da disponibilização (ou da redisponibilização após correções) para
validar e registrar por escrito defeitos e ajustes.

8.2 **[D]** **Defeito** é o descumprimento do escopo ou dos critérios aprovados. É corrigido **sem custo e sem limite de
rodadas**, enquanto subsistir a obrigação aplicável. **[D]** **Ajuste de preferência** dentro do escopo: até **2
rodadas**; além disso, aditivo (cláusula 4.2). Nova funcionalidade nunca é ajuste.

8.3 **[D]** (R1) Calendário da homologação, contado da disponibilização (dia 0), em dias úteis, descontados fins de
semana e feriados nacionais e os locais informados na disponibilização:

| Momento | Ação da Nekkora |
|---|---|
| Dia 0 | Disponibilização com ambiente, instruções, critérios de aceite e a **data final escrita** |
| **5º dia útil** | 1º lembrete escrito, se não houver resposta conclusiva |
| **9º dia útil** | 2º lembrete escrito, se continuar sem resposta conclusiva |
| Fim do 10º dia útil | Termina o prazo inicial de manifestação |
| Dia útil seguinte | Se não houver manifestação: status **"Homologação suspensa — aguardando cliente"**, registrado e comunicado por escrito |
| 30 dias corridos após a suspensão | A Nekkora pede por escrito a **reprogramação formal**; **não há cancelamento automático** |

**[D]** A suspensão não elimina direitos legais nem encerra o contrato.

8.4 **[D]** **Não existe aceite tácito.** O silêncio, isoladamente, **não** conclui a homologação, **não** torna exigível
a segunda parcela, **não** equivale a desistência e **não** inicia a cobertura contratual.

8.5 **[D]** (R1) A retomada depende de **alinhamento documentado**: a Nekkora redisponibiliza e comunica por escrito a
**nova data-base**, a partir da qual corre novo prazo de 10 dias úteis com o mesmo calendário do item 8.3. O mesmo vale
para a redisponibilização após correções. **[R]** Nenhum prazo é reiniciado ou prorrogado em silêncio: sem a
comunicação escrita da nova data-base, vale a anterior. **[!]** O que acontece se o CONTRATANTE não responder ao pedido
de reprogramação: sem regra nesta versão (sem aceite tácito, sem desistência presumida, sem cancelamento automático) ⚖.

8.6 **[D]** **Aceite formal** é declaração expressa e escrita do CONTRATANTE de que a automação atende aos critérios de
aceite.

## Cláusula 9 — Desistência antes da conclusão (C-03)

9.1 **[D]** Enquanto o desenvolvimento **não estiver integralmente concluído** (cláusula 7.2) **e formalmente
disponibilizado para homologação** (item 10.1, d), o CONTRATANTE pode desistir e recebe **reembolso integral dos valores pagos à Nekkora pelo desenvolvimento**, **inclusive se o trabalho já
tiver começado**. Não há apuração por marcos ou por horas, nem cobrança pelo tempo trabalhado.

9.2 **[D]** Despesas contratadas e pagas **diretamente** pelo CONTRATANTE a terceiros não são restituídas pela Nekkora,
que não as controla. **[R]** Ressalva: quando a desistência decorrer de culpa da Nekkora, vale a cláusula 11.

9.3 **[R]** Se houver direito legal de arrependimento em curso, vale a cláusula 3.4, mais ampla (tudo o que foi pago à
Nekkora, a qualquer título).

9.4 **[D]** (R1) Reembolso por Pix em até **5 dias úteis** do pedido válido, com confirmação e registro do pedido e
comprovante da devolução enviado ao CONTRATANTE. **[N]** No exercício válido do direito de arrependimento, a devolução
é **imediata** e monetariamente atualizada (CDC art. 49, parágrafo único): prevalece sempre o prazo legal mais favorável.
**[R]** O prazo operacional de 5 dias úteis **não autoriza postergar** uma restituição que a lei exige de imediato.

## Cláusula 9-A — Cancelamento parcial do pacote (COM-VITRINE-001, V-03) — MINUTA NÃO APROVADA

9-A.1 **[D]** O CONTRATANTE pode desistir de uma ou mais automações do pacote, conforme as regras abaixo, **sem
penalidade nem retenção automática**.

9-A.2 **[R]** Automação do pacote ainda **não** concluída e formalmente disponibilizada para homologação: vale a
cláusula 9 **por automação**. O CONTRATANTE recebe o reembolso integral do que pagou à Nekkora atribuível a ela, ou
seja, a parte da 1ª parcela proporcional ao valor de referência (6-A.4) e, se já paga, a fração da 2ª. Prazo: 9.4.

9-A.3 **[R]** ⚖ **[!] DP-03 — automações mantidas:** proposta **sem recálculo**. As automações que continuam no
contrato, ou que já foram aceitas, ficam pelo valor de referência do pacote e não passam ao preço individual. Recalcular
funcionaria como penalidade, que a diretriz V-03 exclui.
**[P] Proposta para análise (DP-03, 12/11/2026), não aprovada:** sem recálculo retroativo das automações que permanecem
e sem multa ou retenção automática.

9-A.4 **[D]** A **cláusula 10** (retenção de 50% durante a homologação) **não se aplica** a automações de pacote.
⚖ **[!] DP-04 — desistência de automação do pacote durante a homologação:** regra a definir. **[R]** Até a decisão,
aplica-se a regra mais favorável ao CONTRATANTE: reembolso integral do que foi pago atribuível a ela, como em 9-A.2.
**[P] Proposta para análise (DP-04, 12/11/2026), não aprovada:** devolução integral do valor efetivamente pago
relativo à automação cancelada, sem cobrança de parcela que dependa de aceite não ocorrido. A cláusula 10 não se aplica.
⚖ Antes de qualquer contratação, avaliar a viabilidade comercial, os direitos legais aplicáveis e a redação.

9-A.5 **[R]** O direito legal de arrependimento (cláusula 3) alcança o pacote inteiro e prevalece sobre esta cláusula.

9-A.6 **[R]** Cancelamento por defeito, descumprimento ou atraso da Nekkora segue a cláusula 11, por automação.

## Cláusula 10 — Desistência durante a homologação (C-04) ⚖ ponto crítico

> **Decisão da titular de 09/11/2026**, que substitui a regra anterior (cobrança de até 90% do preço no regime do
> consumidor, com reserva de 10%, e de até 100% no B2B). A retenção parcial do item 10.3 está **sujeita à revisão
> jurídica (JUR-03)**: esta redação não afirma que ela é válida.

10.1 **Quando se aplica.** **[D]** Só na desistência **voluntária** do CONTRATANTE **durante a homologação**, com
**todas** as condições abaixo:
(a) conclusão técnica **integral** comprovada por evidências (cláusula 7.2). A conclusão interna da Nekkora, sozinha,
**não basta**;
(b) cumprimento dos critérios de aceite verificáveis da proposta, ressalvada a homologação em curso;
(c) nenhum defeito conhecido nem obrigação técnica pendente atribuível à Nekkora;
(d) **disponibilização formal** da automação ao CONTRATANTE para validação, com ambiente, instruções e meios de teste,
e com a **data da disponibilização registrada** e comunicada por escrito (cláusula 8.1). A homologação começa nessa
data;
(e) desistência **expressa, por escrito** e voluntária, sem motivo atribuível à Nekkora, feita depois da data do item
(d) e antes do aceite formal (o silêncio nunca é desistência — cláusula 8.4);
(f) inexistência de direito legal de arrependimento que imponha restituição integral (cláusula 3);
(g) ausência de contestação fundamentada pendente de análise (item 10.2);
(h) conformidade com os limites jurídicos aplicáveis ao contrato.
Faltando qualquer uma, vale a cláusula 9 (reembolso integral) ou a 11. Defeito, descumprimento ou entrega incompleta
**nunca** levam a esta cláusula. A desistência **não** equivale a aceite e **não** é registrada como aceite.

10.2 **Contestação.** **[D]** Antes de reter qualquer valor, a Nekkora envia por escrito ao CONTRATANTE as evidências do
item 10.1. O CONTRATANTE tem **10 dias úteis** para contestá-las, apontando defeitos ou itens não concluídos. A
contestação fundamentada **suspende a retenção** da parcela controvertida até a análise e a resposta escrita. **[R]** O
prazo não é renúncia a direito legal: a falta de contestação não impede o CONTRATANTE de exercer depois os direitos que
a lei lhe garante (cláusulas 11 e 13).

10.3 **Reembolso de 50% do valor pago.** **[D]** A Nekkora devolve **50% dos valores efetivamente pagos** pelo
CONTRATANTE à Nekkora pelo desenvolvimento da automação até a desistência e retém os outros 50%. A base de cálculo é o
**valor pago**, **nunca** o preço total do contrato. **Não há cobrança adicional**: o CONTRATANTE não paga a segunda
parcela nem qualquer outro valor por causa da desistência. A regra é a mesma nos dois regimes (consumidor e
[Anexo B2B](anexo-b2b-delivery.md)). A devolução segue o prazo do item 9.4 (5 dias úteis do pedido válido). **[R]**
Centavos ímpares são arredondados a favor do CONTRATANTE.

10.4 **Efeito da desistência.** **[D]** A desistência voluntária durante a homologação **encerra o desenvolvimento e a
contratação daquela automação**: não há entrega definitiva nem transferência do software cancelado ou de direitos sobre
ele (cláusula 14; Anexo de Componentes, item 7). **[D]** Enquanto não houver desistência, o CONTRATANTE pode concluir
normalmente a contratação, com homologação, aceite formal e pagamento integral (cláusulas 6, 8 e 12). ⚖ A retenção de
50% sem entrega está **sujeita à revisão jurídica** (JUR-03); esta redação não presume a sua validade.

10.5 **Exemplos (hipóteses contratuais).** **[R]** Calculados por `resultadoDaDesistencia`:

| Caso | Preço | Pago à Nekkora | Devolução | Retido |
|---|---:|---:|---:|---:|
| Desistência na homologação | R$ 2.000 | R$ 1.000 | R$ 500 | R$ 500 |
| Desistência na homologação — média | R$ 2.800 | R$ 1.400 | R$ 700 | R$ 700 |
| Antes da disponibilização formal (cláusula 9) | R$ 2.800 | R$ 1.400 | R$ 1.400 | — |
| Defeito ou descumprimento da Nekkora (cláusula 11) | R$ 2.800 | R$ 1.400 | Conforme a lei | — |
| Arrependimento legal (cláusula 3.4) | R$ 2.800 | R$ 1.400 | Tudo o que foi pago, de imediato | — |

10.6 **Após o aceite formal.** **[D]** Esta cláusula deixa de se aplicar: valem as condições do contrato para essa
etapa (cláusulas 6, 12 e 13) e os direitos legais.

10.7 **[N]** Limites que nenhum regime afasta: CDC art. 51, II (opção de reembolso nos casos do Código) e IV
(desvantagem exagerada; §1º, presunções); CDC art. 20 (vícios); CDC arts. 24 a 26 (garantias legais). ⚖ Validade da
retenção de 50% do valor pago na relação de consumo, inclusive diante do CDC art. 53 e do art. 51, IV.

## Cláusula 11 — Defeitos, descumprimento e atraso da Nekkora

11.1 **[N]** CDC art. 20: diante de vício do serviço, o CONTRATANTE escolhe reexecução sem custo, restituição imediata
do que pagou, com atualização, ou abatimento proporcional, sem prejuízo de perdas e danos.
**[R]** Atraso injustificado da Nekkora além da data prevista, sem acordo escrito (cláusula 5.4), permite ao CONTRATANTE
desistir com a restituição da cláusula 9.1, sem prejuízo dos direitos legais.

11.2 **[R]** Mudanças posteriores em sistemas, APIs ou regras de terceiros ou do CONTRATANTE **não são defeitos da
implementação**. Mas a automação deixar de tratar um comportamento de terceiro **que estava no escopo** é defeito. Não há
exclusão genérica de responsabilidade por sistemas de terceiros (**[D]** C-07; **[N]** CDC arts. 24, 25 e 51, I).

## Cláusula 12 — Entrega definitiva (C-05)

12.1 **[D]** Após o aceite formal **e** a quitação, a Nekkora entrega o código específico, a documentação, o Anexo de
Componentes preenchido e o termo de garantia. Na desistência durante a homologação, vale o item 10.4.

12.2 **[D]** Condicionar a entrega à quitação **não impede** a verificação nem a correção de defeitos: durante a
homologação o CONTRATANTE tem acesso para testar; defeitos apontados são corrigidos independentemente da quitação. **[R]**
O acesso à homologação não é usado como pressão para obter aceite.

12.3 **[I]** O prazo legal de reclamação por vícios corre do **término da execução do serviço** (CDC art. 26, §1º), que
pode anteceder a entrega definitiva. Este contrato não diz o contrário. ⚖

## Cláusula 13 — Garantias (C-07)

13.1 **[D]** Garantias legais **integralmente preservadas**. **[D]** Cobertura corretiva contratual **adicional de 30
dias**, em [termo escrito](termo-garantia-delivery.md). **[N]** CDC art. 50: a garantia contratual é complementar à
legal e conferida em termo escrito.

13.2 **[D]** Cobertura: defeitos atribuíveis à implementação da Nekkora. Não inclui manutenção evolutiva, sustentação,
monitoramento contínuo nem novas funcionalidades. ⚖ Contagem dos 30 dias: termo de garantia, §3.

13.3 **[D]** (R1) Atendimento: a Nekkora confirma o recebimento da solicitação de garantia em até **2 dias úteis**, faz
o diagnóstico inicial em até **5 dias úteis** e, depois da avaliação técnica, informa a previsão de correção do caso.
São metas contratuais de atendimento, **não** prazo máximo de correção nem limite dos direitos legais (termo de
garantia, §4).

## Cláusula 14 — Propriedade intelectual (C-09)

14.1 **[D]** Modelo **A-R**. Cláusula completa no [Anexo de Componentes](anexo-componentes-delivery.md) §2, que
integra este contrato. Resumo: código específico do CONTRATANTE após a quitação; componentes preexistentes continuam de
seus titulares, com licença ao CONTRATANTE na medida necessária para operar e manter a automação; o CONTRATANTE pode
contratar outro desenvolvedor; código exclusivo não é revendido nem reutilizado; a Nekkora pode fazer automações
independentes para outros clientes sobre o mesmo sistema ou finalidade, sem copiar código exclusivo, dados, credenciais
ou informações confidenciais.

14.2 **[R]** Antes da quitação, a automação só é usada para homologação. Na desistência antes da conclusão (cláusula 9)
ou durante a homologação (cláusula 10), nada é entregue e nenhum direito é transferido.

14.3 **[D] (V-05)** "A automação é sua": o Código Específico passa ao CONTRATANTE conforme este contrato e **após a
quitação integral**, preservadas as exceções do item 14.1. Nenhum direito irrestrito sobre bibliotecas, frameworks,
componentes reutilizáveis ou tecnologias de terceiros; **LIC-02** continua pendente.
⚖ **[!] DP-05 — titularidade no pacote:**
- **(a) [R] recomendada:** por automação, depois da quitação do valor de referência dela (6-A.4), com a fração da
  2ª parcela da opção (b) de DP-01;
- **(b)** só depois da quitação do pacote inteiro.

**[P] Proposta para análise (DP-05, 12/11/2026), não aprovada:** transferência dos direitos patrimoniais acordados
sobre o **desenvolvimento específico de cada automação** depois da quitação do seu valor alocado (6-A.4), preservadas
as exceções de componentes preexistentes, reutilizáveis, de código aberto e licenciados por terceiros (14.1 e Anexo de
Componentes). **LIC-02** continua pendente até demonstrar os direitos necessários sobre os componentes usados.

## Cláusula 15 — Atraso no pagamento (C-11)

15.1 **[D]** Cada parcela vence na data escrita na cobrança (5 dias úteis). **[D]** Antes de qualquer encargo, a
Nekkora envia **1º e 2º lembretes amigáveis** e oferece negociação. A Nekkora pode **dispensar** os encargos.

15.2 **[D]** Encargos: **multa moratória única de 2%** e **juros simples de 1% ao mês, proporcionais aos dias de
atraso**, **sem capitalização**. **[R]** Redação proposta: "juros de mora de 1% ao mês, *pro rata die*, **limitados ao
máximo permitido em lei para a relação**". ⚖ **Conflito potencial** para CONTRATANTE que não seja pessoa jurídica:
relatório §4, C-11 (Lei de Usura × taxa legal da Lei 14.905/2024). **[R]** O percentual de 1% ao mês **não é
presumido permitido** para todas as categorias de cliente: se o teto legal for menor, aplica-se o teto, calculado com
base normativa e período de referência verificáveis.

15.2-A **[D]** (R1) **Atualização monetária**, quando juridicamente devida, pelo índice aplicável (**[N]** CC arts. 389,
parágrafo único, e 395: IPCA na falta de índice convencionado), **sem cumulação indevida** de encargos: a correção
incide uma única vez sobre o principal, e a multa e os juros incidem sobre o principal atualizado. **[R]** Não se usa
como índice de correção uma taxa que já embute juros (ex.: Selic) junto com juros de mora. ⚖ Revisão jurídica
separada para (1) consumidor, (2) pessoa física fora de relação de consumo e (3) B2B não consumerista: Lei
14.905/2024, Lei de Usura e exceções, índice, momento de incidência, arredondamento e risco de duplicidade entre taxa
legal, juros convencionais e correção. A calculadora (`encargosDeAtraso`) devolve sempre resultado **indicativo**.

15.3 **[D]** **Não há cancelamento automático** por atraso.

15.4 **[D]** Contestação fundamentada sobre valor, defeito ou cumprimento **suspende** medidas de cobrança que dependam
do valor controvertido até a análise.

## Cláusula 16 — Dados do CONTRATANTE, confidencialidade e credenciais **[!]**

Pendente de redação jurídica (papel de operadora, LGPD art. 39; confidencialidade; guarda e devolução de credenciais —
JUR-05, AUD-21). **Impede a primeira contratação que envolva dados pessoais do CONTRATANTE.**

## Cláusula 17 — Comunicações, rescisão e foro

17.1 **[R]** "Por escrito" = e-mail entre os endereços da proposta. Vale o recebimento no servidor, no horário de
Brasília.

17.2 **[R]** A Nekkora só rescinde nos casos aqui previstos, com **igual direito** ao CONTRATANTE. **[N]** CDC art. 51,
XI (conferido na LEGAL-BASE-001).

17.3 ⚖ **[!]** Foro: com consumidor, o domicílio do consumidor não pode ser afastado em prejuízo dele. Redação pendente.

## O que nenhuma cláusula contém

Retenção automática de valores; multa por desistência; aceite tácito; silêncio como desistência; renúncia antecipada de
direitos; exclusão genérica de responsabilidade; início antecipado do desenvolvimento; capitalização de juros;
cancelamento automático por atraso; promessa de prazo garantido, painel, portal ou alocação permanente.
