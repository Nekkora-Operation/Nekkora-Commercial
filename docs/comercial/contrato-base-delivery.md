# Contrato-base — Nekkora Delivery (minuta)

> **MINUTA NÃO APROVADA. Não é parecer jurídico. Não autoriza contratação.** Redigida na
> [NEKKORA-COM-CONTRACT-001](../release/NEKKORA-COM-CONTRACT-001.md) (06/11/2026) a partir das **decisões empresariais
> definitivas da titular C-01 a C-12**. Essas decisões são aprovações empresariais: **não aprovam esta redação**, não
> substituem a revisão por advogado(a) (adiada pela titular, **pendente**) e não autorizam marcar
> `aprovacoes.condicoesComerciais` como `true` (PUB-19).
>
> **Hierarquia:** norma obrigatória > este contrato-base > proposta > anexos. Onde uma diretriz conflita com norma, a
> norma prevalece e o conflito está no [relatório §4](../release/NEKKORA-COM-CONTRACT-001.md).
>
> Marcadores: **[D]** diretriz da titular · **[R]** redação proposta pelo agente · **[N]** norma conferida no texto
> oficial · **[I]** interpretação do agente · **⚖** exige parecer jurídico · **[!]** decisão ou evidência ainda pendente.
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

## Cláusula 3 — Espera inicial e direito de arrependimento (C-02)

3.1 **[D]** O desenvolvimento **só começa depois de transcorridos 7 dias corridos da assinatura** deste contrato.
**[D]** Nesta versão, **não há início antecipado**, nem a pedido do CONTRATANTE. Qualquer exceção futura depende de
revisão jurídica e de nova autorização da titular.

3.2 **[N]** CDC art. 49: o consumidor pode desistir em 7 dias, a contar da assinatura ou do recebimento do serviço,
quando a contratação ocorre fora do estabelecimento comercial; os valores pagos "a qualquer título" são devolvidos de
imediato, monetariamente atualizados. **[R]** Este contrato **preserva integralmente** esse direito e **não fixa** um
termo final diferente do legal: a espera de 7 dias do item 3.1 é regra operacional da Nekkora e **não extingue** direito
legal com termo inicial ou forma de exercício diferente. ⚖ Termo inicial do arrependimento em serviço sob encomenda
("recebimento do serviço").

3.3 **[R]** Exercício: resposta ao e-mail da proposta ou mensagem para **contato@nekkora.com**, sem necessidade de
justificativa. **[N]** Decreto 7.962/2013, art. 5º, caput e §1º (meio claro e ostensivo; mesma ferramenta da
contratação) e §4º: **confirmação imediata** do recebimento. **[R]** A Nekkora confirma por escrito, no mesmo canal, o
recebimento do pedido. **[!]** Como garantir a confirmação **imediata** (resposta automática ou rotina): OPS-11.

3.4 **[R]** No arrependimento legal, a Nekkora devolve **tudo o que recebeu do CONTRATANTE, a qualquer título**, de
imediato e com atualização monetária, sem multa nem desconto. **[N]** Decreto 7.962/2013, art. 5º, §2º: o
arrependimento rescinde os contratos acessórios sem ônus. **[R]** Para evitar custo de terceiros dentro do prazo, a
Nekkora **não pede** ao CONTRATANTE que contrate licenças ou serviços externos antes de iniciado o desenvolvimento
(item 3.1). ⚖ Alcance de "contratos acessórios" para licenças contratadas diretamente pelo CONTRATANTE.

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
vale a data prevista na proposta. **[N]** CDC art. 39, XII. **[R]** A data prevista de início nunca é anterior ao 8º dia
após a assinatura (cláusula 3.1).

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
este contrato.

6.2 **[D]** **50% na contratação** e **50% após a homologação e o aceite formal** (cláusula 8). **[D]** Cada parcela
vence em **5 dias úteis** da cobrança, com a **data de vencimento escrita na cobrança**.

6.3 **[D]** O silêncio do CONTRATANTE **não torna exigível** a segunda parcela (cláusula 8.4). A única outra hipótese de
cobrança do saldo é a desistência após a conclusão (cláusula 10).

6.4 Meio: Pix para a conta da Nekkora. ⚖ **[!]** Nota fiscal e tributos: pendente (JUR-01).

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

8.3 **[D]** Sem manifestação no prazo, a Nekkora envia **dois lembretes escritos**. **[R]** Intervalo proposto: o 1º
lembrete no dia útil seguinte ao fim do prazo; o 2º, **5 dias úteis** depois; **[!]** intervalo a confirmar pela
titular. Persistindo o silêncio por 5 dias úteis após o 2º lembrete, o status passa a **"Homologação suspensa —
aguardando cliente"**, registrado por escrito.

8.4 **[D]** **Não existe aceite tácito.** O silêncio, isoladamente, **não** conclui a homologação, **não** torna exigível
a segunda parcela, **não** equivale a desistência e **não** inicia a cobertura contratual.

8.5 **[R]** Durante a suspensão, o CONTRATANTE pode retomar a homologação a qualquer tempo, com novo prazo de 10 dias
úteis. **[!]** Prazo máximo de suspensão e o que acontece depois dele: **decisão pendente da titular** (sem aceite
tácito, sem cancelamento automático).

8.6 **[D]** **Aceite formal** é declaração expressa e escrita do CONTRATANTE de que a automação atende aos critérios de
aceite.

## Cláusula 9 — Desistência antes da conclusão (C-03)

9.1 **[D]** Enquanto o desenvolvimento **não estiver integralmente concluído** (cláusula 7.2), o CONTRATANTE pode
desistir e recebe **reembolso integral dos valores pagos à Nekkora pelo desenvolvimento**, **inclusive se o trabalho já
tiver começado**. Não há apuração por marcos ou por horas, nem cobrança pelo tempo trabalhado.

9.2 **[D]** Despesas contratadas e pagas **diretamente** pelo CONTRATANTE a terceiros não são restituídas pela Nekkora,
que não as controla. **[R]** Ressalva: quando a desistência decorrer de culpa da Nekkora, vale a cláusula 11.

9.3 **[R]** Se houver direito legal de arrependimento em curso, vale a cláusula 3.4, mais ampla (tudo o que foi pago à
Nekkora, a qualquer título).

9.4 **[R]** Reembolso por Pix, em até `{{prazo — [!] decisão da titular; sugestão: 5 dias úteis}}` do pedido, salvo no
arrependimento legal, em que é imediato.

## Cláusula 10 — Desistência após a conclusão (C-04) ⚖ ponto crítico

> **Duas redações para decisão da titular.** A diretriz (Alternativa A) tem dúvida jurídica substancial em contrato de
> consumo; a Alternativa B é a conservadora. Análise: [relatório §4, C-04](../release/NEKKORA-COM-CONTRACT-001.md).
> Nenhuma delas está aprovada.

10.1 **[D]** Condições comuns às duas alternativas. A cláusula só se aplica quando, **cumulativamente**:
(a) o desenvolvimento está **concluído e comprovado** (cláusula 7.2) e **efetivamente disponibilizado** para homologação;
(b) o CONTRATANTE **declara por escrito** que desiste (o silêncio nunca é desistência — cláusula 8.4);
(c) a desistência **não** tem justificativa atribuível à Nekkora (defeito, descumprimento ou atraso — cláusula 11);
(d) **não** há direito legal de arrependimento em curso (cláusula 3);
(e) não há defeito conhecido pendente.
A cobrança **não é multa, retenção do sinal nem penalidade**: é o preço do serviço prestado. **Não** equivale a aceite e
**não** é registrada como aceite.

10.2 **Contestação.** **[R]** Antes de cobrar, a Nekkora envia ao CONTRATANTE as evidências da cláusula 7.2. O
CONTRATANTE pode contestá-las por escrito em **10 dias úteis**, apontando defeitos ou itens não concluídos. Contestação
fundamentada **suspende a cobrança** até a análise; defeito confirmado leva à cláusula 9 (ainda não concluído) ou à 11.

10.3 **Alternativa A — diretriz da titular.** **[D]** A Nekkora pode cobrar **até 100% do preço** contratado (abatido o
que já foi pago). **[D]** Após o pagamento integral, o CONTRATANTE recebe o desenvolvimento e todos os entregáveis
(cláusula 12), mesmo que não queira usá-los, e as garantias (cláusula 13) se aplicam normalmente.

10.4 **Alternativa B — conservadora (recomendada pelo agente para cliente consumidor até o parecer).** **[R]** A Nekkora
pode cobrar o preço **menos** o valor da etapa de homologação assistida, correções e entrega, fixado na proposta em
`{{R$ ou % — [!] decisão da titular}}`. Após o pagamento, mesmas consequências do item 10.3. A Alternativa A ficaria
restrita ao [Anexo B2B](anexo-b2b-delivery.md).

10.5 **[N]** Limites que nenhuma alternativa afasta: CDC art. 51, II (opção de reembolso nos casos do Código) e IV
(desvantagem exagerada; §1º, presunções); CDC art. 20 (vícios). **[I]** Fundamento possível da cobrança: o preço
remunera serviço prestado; em contrato empresarial, CC art. 623 (empreitada) dá base adicional. ⚖ Exigibilidade do
preço integral sem aceite formal em contrato de consumo.

## Cláusula 11 — Defeitos, descumprimento e atraso da Nekkora

11.1 **[N]** CDC art. 20: diante de vício do serviço, o CONTRATANTE escolhe reexecução sem custo, restituição imediata
do que pagou, com atualização, ou abatimento proporcional, sem prejuízo de perdas e danos.
**[R]** Atraso injustificado da Nekkora além da data prevista, sem acordo escrito (cláusula 5.4), permite ao CONTRATANTE
desistir com a restituição da cláusula 9.1, sem prejuízo dos direitos legais.

11.2 **[R]** Mudanças posteriores em sistemas, APIs ou regras de terceiros ou do CONTRATANTE **não são defeitos da
implementação**. Mas a automação deixar de tratar um comportamento de terceiro **que estava no escopo** é defeito. Não há
exclusão genérica de responsabilidade por sistemas de terceiros (**[D]** C-07; **[N]** CDC arts. 24, 25 e 51, I).

## Cláusula 12 — Entrega definitiva (C-05)

12.1 **[D]** Após o aceite formal (ou, na cláusula 10, a desistência após a conclusão) **e** a quitação, a Nekkora
entrega o código específico, a documentação e o Anexo de Componentes preenchido.

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

## Cláusula 14 — Propriedade intelectual (C-09)

14.1 **[D]** Modelo **A-R**. Cláusula completa no [Anexo de Componentes](anexo-componentes-delivery.md) §2, que
integra este contrato. Resumo: código específico do CONTRATANTE após a quitação; componentes preexistentes continuam de
seus titulares, com licença ao CONTRATANTE na medida necessária para operar e manter a automação; o CONTRATANTE pode
contratar outro desenvolvedor; código exclusivo não é revendido nem reutilizado; a Nekkora pode fazer automações
independentes para outros clientes sobre o mesmo sistema ou finalidade, sem copiar código exclusivo, dados, credenciais
ou informações confidenciais.

14.2 **[R]** Antes da quitação, a automação só é usada para homologação. Na desistência antes da conclusão (cláusula 9),
nada é entregue e nenhum direito é transferido.

## Cláusula 15 — Atraso no pagamento (C-11)

15.1 **[D]** Cada parcela vence na data escrita na cobrança (5 dias úteis). **[D]** Antes de qualquer encargo, a
Nekkora envia **1º e 2º lembretes amigáveis** e oferece negociação. A Nekkora pode **dispensar** os encargos.

15.2 **[D]** Encargos: **multa moratória única de 2%** e **juros simples de 1% ao mês, proporcionais aos dias de
atraso**, **sem capitalização**. **[R]** Redação proposta: "juros de mora de 1% ao mês, *pro rata die*, **limitados ao
máximo permitido em lei para a relação**". ⚖ **Conflito potencial** para CONTRATANTE que não seja pessoa jurídica:
relatório §4, C-11 (Lei de Usura × taxa legal da Lei 14.905/2024). **[!]** Atualização monetária (CC arts. 389 e 395,
IPCA na falta de índice): aplicar ou dispensar — decisão da titular.

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
