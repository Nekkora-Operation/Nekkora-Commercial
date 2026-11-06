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
> **Hierarquia (R1, [R] ⚖):** (1) norma obrigatória; (2) **condição particular da proposta** que indique expressamente
> a cláusula deste contrato que altera, desde que não reduza direito legal; (3) [Anexo B2B](anexo-b2b-delivery.md),
> **só quando validamente aplicável** e só nos temas que lista; (4) este contrato-base; (5) termo de garantia e Anexo de
> Componentes, que **detalham** as cláusulas 13 e 14 e prevalecem sobre o resumo delas no mesmo tema. Contradição não
> intencional entre documentos interpreta-se da forma mais favorável ao CONTRATANTE (**[N]** CDC art. 47). Assim, uma
> condição aprovada para uma automação não perde eficácia por divergência documental involuntária. Onde uma diretriz
> conflita com norma, a norma prevalece e o conflito está no [relatório §4](../release/NEKKORA-COM-CONTRACT-001.md).
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

9.1 **[D]** Enquanto o desenvolvimento **não estiver integralmente concluído** (cláusula 7.2), o CONTRATANTE pode
desistir e recebe **reembolso integral dos valores pagos à Nekkora pelo desenvolvimento**, **inclusive se o trabalho já
tiver começado**. Não há apuração por marcos ou por horas, nem cobrança pelo tempo trabalhado.

9.2 **[D]** Despesas contratadas e pagas **diretamente** pelo CONTRATANTE a terceiros não são restituídas pela Nekkora,
que não as controla. **[R]** Ressalva: quando a desistência decorrer de culpa da Nekkora, vale a cláusula 11.

9.3 **[R]** Se houver direito legal de arrependimento em curso, vale a cláusula 3.4, mais ampla (tudo o que foi pago à
Nekkora, a qualquer título).

9.4 **[D]** (R1) Reembolso por Pix em até **5 dias úteis** do pedido válido, com confirmação e registro do pedido e
comprovante da devolução enviado ao CONTRATANTE. **[N]** No exercício válido do direito de arrependimento, a devolução
é **imediata** e monetariamente atualizada (CDC art. 49, parágrafo único): prevalece sempre o prazo legal mais favorável.
**[R]** O prazo operacional de 5 dias úteis **não autoriza postergar** uma restituição que a lei exige de imediato.

## Cláusula 10 — Desistência após a conclusão (C-04) ⚖ ponto crítico

> **R1: decisão da titular de tratar a C-04 de forma diferente conforme o enquadramento** (substitui as Alternativas A
> e B da CONTRACT-001). Os percentuais são **tetos pretendidos**, não valores exigíveis automaticamente: a redação
> continua **sujeita a parecer jurídico**, sobretudo quanto à exigibilidade de pagamento sem aceite formal. Análise:
> [relatório R1 §B e §D](../release/NEKKORA-COM-CONTRACT-001-R1.md).

10.1 **Condições cumulativas, comuns aos dois regimes.** **[D]** Nenhuma cobrança relacionada a esta cláusula é feita
sem que se verifiquem, **todas**:
(a) conclusão técnica **integral** comprovada por evidências (cláusula 7.2);
(b) cumprimento dos critérios de aceite verificáveis da proposta, ressalvada a homologação ainda pendente;
(c) nenhum defeito conhecido nem obrigação técnica pendente atribuível à Nekkora;
(d) **disponibilização real** de ambiente, instruções e meios de teste;
(e) desistência **expressa, por escrito** e voluntária, sem motivo atribuível à Nekkora (o silêncio nunca é desistência
— cláusula 8.4);
(f) inexistência de direito legal de arrependimento que imponha restituição integral (cláusula 3);
(g) ausência de contestação fundamentada pendente de análise (item 10.2);
(h) conformidade com os limites jurídicos aplicáveis ao contrato.
Faltando qualquer uma, vale a cláusula 9 (reembolso integral) ou a 11. Defeito ou entrega incompleta **nunca** levam a
esta cláusula. A cobrança **não é multa, retenção do sinal, penalidade nem presunção de aceite**: é o preço do serviço
efetivamente prestado. **Não** equivale a aceite e **não** é registrada como aceite.

10.2 **Contestação.** **[D]** Antes de cobrar, a Nekkora envia por escrito ao CONTRATANTE as evidências do item 10.1.
O CONTRATANTE tem **10 dias úteis** para contestá-las, apontando defeitos ou itens não concluídos. A contestação
fundamentada **suspende a exigibilidade** da parcela controvertida até a análise e a resposta escrita. **[R]** O prazo
não é renúncia a direito legal: a falta de contestação não impede o CONTRATANTE de exercer depois os direitos que a lei
lhe garante (cláusulas 11 e 13).

10.3 **Regime do consumidor — modelo conservador.** **[D]** Quando a contratação for relação de consumo (padrão deste
contrato-base):
(a) a proposta **reserva previamente 10% do preço** de cada automação às etapas de homologação assistida e de entrega
(proposta, §2, "Reserva das etapas finais"). A reserva **não pode ser fixada depois** da desistência; se ela não
constar da proposta, esta cláusula não é usada e o caso vai à revisão jurídica;
(b) a cobrança máxima pretendida é de **90% do preço contratado**, abatidos os pagamentos já feitos;
(c) não se cobra valor de serviço não realizado nem de entrega incompleta: os 10% reservados **nunca** são cobrados
nesta hipótese.

10.4 **Regime B2B efetivamente não consumerista.** **[D]** Só com o [Anexo B2B](anexo-b2b-delivery.md) validamente
aplicável (os quatro itens do §1, justificados e documentados; ter CNPJ **não** basta): cobrança de **até 100% do
preço**, abatidos os pagamentos já feitos, com as mesmas condições dos itens 10.1 e 10.2. ⚖ Relação dos 100% com as
etapas de homologação e entrega não executadas.

10.5 **Entrega após a quitação.** **[D]** Quitado o valor **validamente apurado** (depois da contestação, se houver), a
Nekkora disponibiliza o desenvolvimento concluído e os entregáveis correspondentes, **sem exigir os 10% reservados** no
regime do consumidor. **[R]** Entregáveis: código-fonte específico concluído; documentação técnica prevista na
proposta; relatório de testes técnicos por critério de aceite; Anexo de Componentes preenchido, com a licença dos
componentes preexistentes (cláusula 14). Transferência: no repositório ou arquivo indicado pelo CONTRATANTE, com
instruções escritas e registro do envio, em prazo **[!]** a definir pela titular. A homologação assistida e a entrega
acompanhada não executadas não são prestadas nem cobradas. As garantias legais continuam valendo.

10.6 **Exemplos (hipóteses contratuais, não valores exigíveis).** **[R]** Calculados por
`resultadoDaDesistencia` (relatório R1 §C):

| Caso | Preço | Entrada paga | Reserva (10%) | Teto pretendido | Saldo máximo pretendido |
|---|---:|---:|---:|---:|---:|
| Consumidor — simples | R$ 1.000 | R$ 500 | R$ 100 | R$ 900 | R$ 400 |
| Consumidor — média | R$ 2.800 | R$ 1.400 | R$ 280 | R$ 2.520 | R$ 1.120 |
| B2B não consumerista — média | R$ 2.800 | R$ 1.400 | — | R$ 2.800 | R$ 1.400 |
| Qualquer regime, antes da conclusão | R$ 2.800 | R$ 1.400 | — | — | Reembolso de R$ 1.400 (cláusula 9) |
| Arrependimento legal | R$ 2.800 | R$ 1.400 | — | — | Restituição de tudo o que foi pago, de imediato (cláusula 3.4) |

10.7 **[N]** Limites que nenhum regime afasta: CDC art. 51, II (opção de reembolso nos casos do Código) e IV
(desvantagem exagerada; §1º, presunções); CDC art. 20 (vícios). **[I]** Fundamento possível da cobrança: o preço
remunera serviço prestado; em contrato empresarial, CC art. 623 (empreitada) dá base adicional. ⚖ Exigibilidade antes
do aceite formal, enquadramento consumerista e percentual cobrável.

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
Componentes preenchido e o termo de garantia. Na desistência após a conclusão, vale o item 10.5 (quitação do valor
validamente apurado, sem a reserva das etapas não executadas).

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

14.2 **[R]** Antes da quitação, a automação só é usada para homologação. Na desistência antes da conclusão (cláusula 9),
nada é entregue e nenhum direito é transferido.

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
