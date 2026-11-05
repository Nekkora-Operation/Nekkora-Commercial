# Minuta — condições comerciais do Nekkora Delivery

> **MINUTA NÃO APROVADA.** Redação preparada na NEKKORA-COM-008-C a partir das diretrizes aprovadas pela titular na
> COM-008-B e **revisada internamente na NEKKORA-COM-LEGAL-BASE-001 (05/11/2026)** com base no texto vigente do CDC, do
> Código Civil e da Lei do Software (relatório e fontes:
> [`NEKKORA-COM-LEGAL-BASE-001.md`](../release/NEKKORA-COM-LEGAL-BASE-001.md)). **A revisão interna não é parecer
> jurídico e não substitui a revisão por advogado(a)**, que a titular adiou temporariamente — continua pendente. Nada aqui
> foi publicado como cláusula. No site aparecem só os resumos de `src/content.ts`. `aprovacoes.condicoesComerciais`
> continua `false` (PUB-19). Os textos do site foram aprovados em 05/11/2026 (PUB-17), mas isso não aprova esta minuta.
>
> Marcadores: **[D]** diretriz aprovada pela titular · **[R]** redação proposta pelo agente, a revisar ·
> **[C-nn]** proposta de correção da LEGAL-BASE-001 (§9), a decidir pela titular · **⚖** ponto que exige avaliação
> jurídica.
>
> **Leia primeiro o §9.** Onde uma diretriz **[D]** conflita com norma vigente, o §9 registra a incompatibilidade, a
> fonte e a alternativa. A diretriz não prevalece sobre a norma.

## 1. Proposta e contratação

1. **[D]** Cada automação tem proposta com categoria, escopo, prazo estimado, preço, condições de pagamento e critérios
   de homologação e aceite.
2. **[D]** O preço é aprovado pelo cliente antes do início do desenvolvimento.
3. **[D]** Na campanha de lançamento, a proposta pode ser aceita em até **7 dias corridos** da emissão (ver §8).
   **[R]** Fora da campanha, a validade de cada proposta é a indicada nela.
4. **[R]** A contratação se formaliza pelo aceite expresso da proposta (assinatura ou confirmação por escrito, conforme
   a proposta) e pelo pagamento da primeira parcela. ⚖ Definir a forma do aceite (assinatura eletrônica ou e-mail).

## 2. Pagamento

| | Diretriz aprovada **[D]** |
|---|---|
| 1ª parcela | **50%** após a aprovação da proposta e a formalização da contratação |
| 2ª parcela | **50%** após a homologação concluída e o aceite formal |
| Entrega definitiva | Após a confirmação da quitação, respeitados os direitos aplicáveis — ver **[C-05]** |
| Meio | Pix empresarial como possibilidade inicial; gateway de pagamento como evolução futura |

- **[R]** A condição 50% + 50% é forma de **pagamento**. Não se confunde com o desconto promocional de lançamento, que
  é calculado por categoria (33,33% na simples e 20% na média; ver `src/precos.ts`).
- Esta missão **não implementa pagamento online** nem gateway.
- ⚖ Prazo para pagamento de cada parcela, multa e juros por atraso, emissão de nota fiscal.
- ⚖ "Entrega definitiva após a quitação": confirmar como conciliar a retenção da entrega com a garantia legal e com o
  uso já liberado na homologação, sem configurar prática abusiva.

## 3. Homologação e aceite (conceitos)

| Conceito | Definição proposta **[R]** sobre a diretriz **[D]** |
|---|---|
| Testes técnicos | Testes feitos pela Nekkora antes de disponibilizar a automação, conforme o escopo |
| Disponibilização para homologação | Comunicação por escrito de que a automação está pronta para validação no ambiente combinado |
| Registro de defeitos | O cliente registra por escrito (e-mail ou canal combinado) cada defeito, com descrição e, se possível, evidência |
| Correção | A Nekkora corrige os defeitos atribuíveis à entrega e disponibiliza de novo |
| Homologação concluída | Validação do cliente de que a automação atende aos critérios de aceite da proposta |
| Aceite formal | Declaração expressa e por escrito do cliente de que aceita a entrega |
| Entrega definitiva | Entrega do previsto na proposta (código, documentação e dependências identificadas) após o aceite e a quitação |

- **[D]** O **silêncio do cliente não é prova automática** de homologação bem-sucedida.
- **[R]** Um defeito é o descumprimento do escopo e dos critérios aprovados. Pedidos fora do escopo são **mudança de
  escopo** e seguem nova proposta (§6).
- ⚖ Prazo para o cliente homologar e o que acontece se ele não se manifestar. Como o silêncio não vale como aceite, a
  alternativa é prever lembretes e uma reunião de encerramento, ou a suspensão do projeto, sem aceite tácito.
- ⚖ Número de rodadas de correção incluídas. **[C-06]** Limite de rodadas só para ajustes de preferência; defeito (vício) é sempre corrigido.

## 4. Cancelamento e reembolso

Diretrizes aprovadas **[D]**:

| Momento | Regra |
|---|---|
| Antes do início do desenvolvimento | Reembolso **integral** da entrada |
| Durante o desenvolvimento | **Apuração proporcional** do trabalho realizado e das despesas justificadas; devolução do saldo da entrada, se houver |
| Após a homologação concluída | Possibilidade de **retenção dos 50% iniciais** em caso de desistência injustificada, conforme o contrato e a legislação aplicável. **Substituir: [C-04]** (sem retenção automática) |
| Descumprimento da Nekkora | Observar as soluções e restituições legalmente devidas |

- **Não publicar cláusulas absolutas de retenção ou de renúncia de direitos.** O site diz apenas: "Cancelamento,
  reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei."
- ⚖ Direito de arrependimento (CDC, art. 49) em contratação a distância com cliente consumidor ou equiparado. **[C-02]**
- ⚖ Como documentar o "início do desenvolvimento" (sugestão **[R]**: comunicação por escrito da Nekkora com a data de
  início).
- ⚖ Validade da retenção dos 50% após a homologação e o limite da apuração proporcional. **[C-03] [C-04]**

## 5. Garantia

| Diretriz **[D]** | Redação proposta **[R]** |
|---|---|
| Garantia contratual **adicional** proposta de **30 dias** após a entrega definitiva | "Por 30 dias corridos após a entrega definitiva, a Nekkora corrige, sem custo, defeitos atribuíveis à entrega, conforme o escopo aprovado." **Revisar: [C-07]** (o prazo não pode se sobrepor ao legal) |
| Correção de defeitos atribuíveis à entrega, conforme o escopo | "Não são defeitos da entrega: mudanças em sistemas, APIs, telas ou regras de terceiros ou do cliente após a homologação; uso fora do escopo; alterações feitas por terceiros." ⚖ |
| Preservação integral das garantias legais | "Esta garantia é adicional e não substitui nem reduz as garantias previstas em lei." |
| Sustentação, mudanças de escopo e novas funcionalidades avaliadas separadamente | "Suporte, sustentação, evolução e novas funcionalidades dependem de proposta própria." |

- No site, a Transparência diz: em "Definido em proposta", **"Correção de defeitos do que foi entregue: prazo e
  condições, além das garantias legais"**; em "Não incluído automaticamente", **"Suporte, sustentação e garantia
  adicional após a entrega, salvo se previstos"**. O prazo de 30 dias **não** aparece no site enquanto não for
  aprovado juridicamente.
- ⚖ Prazos legais (CDC, arts. 24 a 26) e aplicabilidade a clientes empresariais.

## 6. Várias automações e mudanças de escopo

- **[D]** Cada automação tem **classificação, escopo, preço e aceite próprios**.
- **[D]** Contratar várias automações juntas **não** as transforma em uma automação complexa. Três automações simples
  continuam três automações simples, cada uma com o próprio preço (inclusive o de lançamento, se elegível).
- **[R]** Uma automação só é complexa pela própria natureza (processo ponta a ponta, várias integrações por API etc.),
  definida na avaliação com os critérios publicados.
- **[R]** Mudanças de escopo durante o desenvolvimento geram aditivo ou nova proposta, com preço e prazo próprios.

## 7. Licenças, infraestrutura e propriedade intelectual

### 7.1 Custos de terceiros e infraestrutura (AUD-10)

| Item | Regra **[D]/[R]** |
|---|---|
| Licenças e serviços de terceiros (UiPath, Power Automate, APIs pagas etc.) | Indicados na proposta; em regra, contratados e pagos pelo cliente; não incluídos nos preços publicados |
| Infraestrutura própria do contratante | Servidores, máquinas e ambientes do cliente continuam dele, sob a responsabilidade dele |
| Nekkora Hosting | Infraestrutura e serviços associados contratados à parte, com avaliação de viabilidade e proposta próprias |

### 7.2 Propriedade intelectual — Modelo A (aprovado como diretriz)

1. **[D]** **Licenciamento** da automação entregue ao cliente. **Afasta a regra supletiva da Lei 9.609/1998, art. 4º (direitos do contratante de serviços): só vale com estipulação expressa. Ver [C-09].**
2. **[D]** Direito do cliente de **utilizar e modificar o código específico** da automação, conforme o contrato.
3. **[D]** A Nekkora preserva a titularidade da **arquitetura, das bibliotecas e dos componentes proprietários**.
4. **[D]** A entrega identifica a documentação e as dependências, inclusive as proprietárias da Nekkora e as de
   terceiros.
5. **[D]** **Nenhuma transferência automática** do Nekkora Studio, Agent, Framework ou Platform.
6. ⚖ Redação jurídica definitiva **pendente**: natureza da licença (exclusiva ou não, prazo, território), uso das
   bibliotecas proprietárias embutidas, sublicenciamento e o que acontece com a licença se o pagamento não for
   concluído.

### 7.3 Dados do cliente durante o desenvolvimento (AUD-21) ⚖

Cláusula de proteção de dados (papel de operadora, LGPD, art. 39), confidencialidade e guarda e devolução de
credenciais: **pendente de redação jurídica**. Os requisitos técnicos futuros estão em
`docs/roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md` (PLATFORM-SECRETS-001).

## 8. Campanha de lançamento (AUD-04, AUD-06)

| Regra **[D]** | Como o site trata |
|---|---|
| Duração de **dois meses** a partir da publicação oficial | Datas **informadas pela titular** em 04/11/2026: `publicacao.json → campanhaLancamento` = **06/11/2026 a 06/01/2027** (fuso de Brasília). O código nunca as calcula nem preenche. Se a publicação oficial ocorrer depois de 06/11/2026, a titular decide se ajusta as datas (o portão recusa campanha encerrada) |
| Vale a **data da solicitação** recebida durante a campanha | "Preços especiais de lançamento para solicitações de avaliação recebidas de DD/MM/AAAA a DD/MM/AAAA." |
| Proposta com prazo de aceite de **7 dias corridos** | "A proposta pode ser aceita em até 7 dias corridos da emissão." |
| Preço individual por automação; complexa sob orçamento | Cartões e simulador; a complexa nunca tem valor |
| Solicitações **podem** ser elegíveis (não há garantia automática) | "…conforme a categoria definida na avaliação" |

Estados de exibição (site e simulador): **vigente** (preços de lançamento) · **futura** e **encerrada** (só o preço
padrão) · **pendente** (sem datas: prévia só na versão de homologação, com o aviso "Nenhuma solicitação é elegível
antes do início oficial"; o portão bloqueia a publicação, PUB-13). Fuso: `America/Sao_Paulo`.

### 8.1 Como comprovar a data da solicitação nos canais atuais **[R]**

O site **não envia nem registra** nada: não há backend ativo, e o simulador não guarda dados. A data comprova-se pelos
registros do canal pelo qual a solicitação chegou:

| Canal | Evidência da data | Observação |
|---|---|---|
| **E-mail** (`contato@nekkora.com`, canal principal) | Data e hora de **recebimento** na caixa comercial do Microsoft 365 (cabeçalho `Received` do servidor e data exibida no Outlook), convertidas para o horário de Brasília | O botão do site só abre o aplicativo de e-mail do visitante. Vale o **recebimento**, não o clique: uma mensagem escrita durante a campanha e enviada depois do fim não é elegível. A mensagem não deve ser apagada antes do fim do prazo de aceite |
| **Microsoft Bookings** | Data de **criação da reserva** (e-mail de notificação à responsável e histórico da reserva) | Vale a data da reserva, não a data da reunião |
| **LinkedIn** | Data e hora da mensagem recebida | Registrar uma captura ou exportação ao emitir a proposta |
| Envio automático (futuro, **não ativo**) | Protocolo e data registrados pelo backend | Só depois da ativação autorizada (PUB-21) |

Procedimento sugerido: na proposta, um campo **"Data da solicitação"** com a data, o canal e a referência da mensagem,
por exemplo: "E-mail recebido em 15/11/2026 10:42 (horário de Brasília)". Encaminhar a proposta respondendo à própria
mensagem original preserva a cadeia. Em caso de dúvida (mensagem perto da virada do último dia), vale o registro do
servidor no horário de Brasília. ⚖ Confirmar se o regulamento da campanha deve ser publicado por inteiro. **[C-10]**

## 9. Propostas de correção — NEKKORA-COM-LEGAL-BASE-001 (05/11/2026)

> **Revisão interna, não é parecer jurídico.** Cada linha diz qual **norma** vigente se aplica (texto conferido no
> planalto.gov.br em 05/11/2026; URLs e trechos no [relatório §2](../release/NEKKORA-COM-LEGAL-BASE-001.md)), qual
> **interpretação** o agente adota e qual **proposta** depende de decisão da titular. Nenhuma proposta foi aplicada ao
> site nem marcada como aprovada. Onde a diretriz **[D]** conflita com a norma, vale a norma até haver decisão
> fundamentada.

### 9.1 Quadro geral

| ID | Tema | Norma (texto vigente) | Situação da diretriz | Proposta do agente (a decidir) |
|---|---|---|---|---|
| **C-01** | Consumidor × contratação empresarial | CDC arts. 2º e 29; CDC art. 51, I, parte final: com **consumidor pessoa jurídica**, a indenização pode ser limitada em situações justificáveis; CC art. 421-A: contratos civis e empresariais presumem-se paritários, ressalvadas as leis especiais | As diretrizes não fazem a distinção | Cada proposta registra a **natureza da relação** com o cliente. **Interpretação:** uma pessoa jurídica pode ser consumidora quando contrata como destinatária final, e só o caso concreto define isso. **Na dúvida, aplica-se o regime do CDC**, e o modelo padrão já é compatível com ele. Cláusulas que só valem fora do CDC ficam num anexo próprio, identificado como tal |
| **C-02** | Direito de arrependimento | CDC art. 49 e parágrafo único: 7 dias a contar da assinatura; valores pagos "a qualquer título" devolvidos "de imediato, monetariamente atualizados". Decreto 7.962/2013, art. 5º | ⚖ em aberto; **o §4 não o previa** | Com cliente consumidor, a contratação por e-mail ou por assinatura eletrônica ocorre **fora do estabelecimento**. A proposta informa o prazo de 7 dias e o meio de exercício: resposta ao e-mail da proposta ou mensagem para `contato@nekkora.com`. **Interpretação:** o CDC não prevê exceção para serviço já iniciado. A regra mais segura é **iniciar o desenvolvimento só depois do 7º dia**. Se o cliente pedir para começar antes, ele é informado por escrito de que, se desistir dentro do prazo, recebe a devolução **integral** |
| **C-03** | Cancelamento durante o desenvolvimento | CDC art. 51, II e IV, e §1º; CC arts. 473 e 623 (empreitada: despesas e serviços já feitos); CC arts. 412 e 413 (a cláusula penal não excede a obrigação principal e é reduzida equitativamente) | Compatível se a apuração for objetiva | Trocar a "apuração proporcional" por **marcos definidos na proposta**, cada um com o percentual do preço e a evidência de conclusão (levantamento documentado, desenvolvimento, testes, disponibilização para homologação). No cancelamento, o cliente paga os marcos concluídos e as **despesas de terceiros comprovadas e previstas na proposta**, e recebe o saldo de volta. **Sem multa, sem retenção automática** e, com consumidor, sem cobrança de lucro sobre o que não foi feito. **Interpretação:** aplicar a consumidor a "indenização razoável" do CC art. 623 traz risco de abusividade (CDC art. 51, IV) |
| **C-04** | "Retenção dos 50% iniciais" após a homologação | CDC art. 51, II e IV; CC art. 476 (exceção do contrato não cumprido) | **O texto [D] fala em "retenção"**, o que pode ser lido como cláusula penal ou perda automática | Texto proposto: depois da homologação concluída, **o serviço contratado foi prestado**. Os valores pagos remuneram o que foi feito e **não são devolvidos**, salvo vício (CDC art. 20) ou arrependimento dentro do prazo legal (C-02). A entrega definitiva e os direitos do C-09 dependem da quitação (CC art. 476). Nada de "retenção" como penalidade |
| **C-05** | Entrega definitiva após a quitação | CC art. 476; CDC arts. 24, 26, §1º, e 51, I | Compatível, com ressalvas | A proposta fixa a ordem das etapas: homologação → aceite → pagamento da 2ª parcela → entrega definitiva. **Ressalvas:** (a) reter a entrega nunca impede a correção de vícios; (b) **interpretação:** o prazo decadencial do art. 26, §1º, corre do término da execução do serviço, que pode ser a conclusão da homologação, e não da entrega definitiva. A proposta não deve dizer o contrário; (c) o acesso ao ambiente de homologação não serve de pressão para obter o aceite |
| **C-06** | Homologação sem aceite tácito; rodadas de correção | CDC art. 20 e art. 39, XII (prazo para a obrigação do fornecedor); CC art. 614, §2º (na empreitada, o que foi medido presume-se verificado em 30 dias). **Não adotar por analogia:** a diretriz exige aceite expresso | Compatível | Prazo de manifestação na proposta (sugestão: **10 dias úteis**), com **dois lembretes** por escrito. Sem resposta, o projeto fica **suspenso**: não há aceite tácito, a 2ª parcela não vence e a garantia contratual não começa a correr. O limite de rodadas (sugestão: 2) vale só para **ajustes de preferência** dentro do escopo. **Defeito, ou seja, descumprimento do escopo ou dos critérios aprovados, é sempre corrigido** (CDC art. 20, I), em quantas rodadas forem necessárias |
| **C-07** | Garantia contratual de 30 dias | CDC art. 50 e parágrafo único: garantia contratual "complementar à legal", em termo escrito com forma, prazo e lugar. Arts. 24 e 25; art. 26, II (90 dias para serviço durável); art. 51, I | **[D] proposta: 30 dias após a entrega definitiva** | **Interpretação:** com cliente consumidor, uma automação feita para uso continuado tende a ser serviço **durável** (90 dias, CDC art. 26, II). Uma garantia de 30 dias contada da entrega **cabe inteira dentro do prazo legal** e, sozinha, não acrescenta nada. Alternativas: (a) **30 dias adicionais, contados depois do fim do prazo legal**; (b) informar o prazo total ("até 120 dias…"); (c) manter 30 dias só para clientes fora do CDC, sem chamar de "adicional" a garantia dada a consumidores. Em qualquer caso, termo escrito com o conteúdo do art. 50, parágrafo único. As exclusões do §5 continuam valendo apenas como **delimitação do que não é vício**, sem exclusão genérica de responsabilidade (CDC arts. 24, 25 e 51, I) |
| **C-08** | Mudança de escopo, licenças e custos de terceiros | CDC art. 39, VI (serviço só com orçamento prévio e autorização expressa); art. 40 (orçamento discriminado, com datas de início e término; o §2º o torna vinculante; pelo §3º, o consumidor não responde por custos de terceiros não previstos) | Compatível | Toda mudança de escopo depende de **aditivo aprovado antes** da execução. Licenças e serviços de terceiros ficam **listados na proposta**, com custo estimado e indicação de quem os contrata. **Custo de terceiro não previsto não é repassado** sem nova aprovação |
| **C-09** | Propriedade intelectual | Lei 9.609/1998, art. 4º, caput: "**salvo estipulação em contrário**, pertencerão exclusivamente ao [...] contratante de serviços" os direitos sobre o programa desenvolvido no contrato. §2º: pertence ao contratado o programa gerado sem relação com o contrato e sem recursos do contratante. Arts. 5º e 9º; CDC art. 54, §4º (limitação de direito em destaque) | **O Modelo A afasta a regra supletiva** (licença em vez de titularidade do cliente). É **lícito com estipulação expressa**, mas exige cláusula clara | **Modelo A-R (recomendado):** (a) **código específico** feito para o cliente: titularidade do **contratante** a partir da quitação. Segue a regra legal, e o cliente pode usar, modificar e contratar terceiros para manter; (b) **componentes preexistentes da Nekkora** (bibliotecas, frameworks, Studio, Agent, Platform), criados sem relação com o contrato e sem recursos do cliente (art. 4º, §2º): continuam da Nekkora. O cliente recebe **licença não exclusiva, sem prazo, gratuita e irrevogável após a quitação** para usar e modificar esses componentes **na medida necessária para operar, manter e evoluir a automação entregue**, inclusive por terceiros que contratar, sem exploração comercial separada; (c) a lista de componentes preexistentes e de terceiros vai **anexada à proposta**. Se a titular mantiver o **Modelo A** puro, a cláusula precisa dizer expressamente que afasta o art. 4º e dar ao cliente licença do código específico **perpétua, irrevogável após a quitação e com direito de modificação**, em destaque. Sem isso, prevalece a regra legal, que favorece o contratante |
| **C-10** | Campanha de 06/11/2026 a 06/01/2027 | CDC art. 30 (a oferta suficientemente precisa obriga), arts. 31 e 35; CDC art. 40, §1º (orçamento vale 10 dias "salvo estipulação em contrário"); Decreto 7.962/2013, art. 2º, VI (condições integrais da oferta) | Compatível | (a) O texto do site **vincula**: solicitação recebida no período e enquadrada como simples ou média **tem direito** ao preço de lançamento. Não usar "pode ser elegível" como reserva discricionária; (b) o prazo de aceite de 7 dias é estipulação expressa e precisa estar na proposta; (c) **publicar a regra completa** (período, critério da data de recebimento, categorias, prazo de aceite, preço individual) numa seção acessível. Hoje ela aparece resumida nos cartões. Sugestão: um item "Regras da campanha" no bloco de preços, que **exige nova aprovação dos textos** (PUB-17); (d) se a publicação oficial ocorrer depois de 06/11/2026, a titular ajusta as datas **antes** de publicar (o portão já recusa campanha encerrada) |
| **C-11** | Atraso de pagamento | CDC art. 52, §1º: multa de mora de até 2% no fornecimento com **crédito ou financiamento** | ⚖ em aberto | **Interpretação:** o §1º trata de crédito ou financiamento, e não é pacífico que alcance o parcelamento direto. Para clientes consumidores, a escolha conservadora é **multa de 2% e juros de 1% ao mês**. A proposta fixa o prazo de pagamento de cada parcela (sugestão: 5 dias úteis da cobrança) |
| **C-12** | Prazo e fila | CDC art. 39, XII (proibido deixar o termo inicial "a seu exclusivo critério") e art. 40 (datas de início e término no orçamento) | **Risco**: "o início depende da fila" | O site pode continuar falando da fila, como informação. Mas **cada proposta fixa a data estimada de início e de término**, ou o prazo em dias úteis contado do pagamento da 1ª parcela, além da regra para alterá-los |

### 9.2 Cláusula-modelo de propriedade intelectual (Modelo A-R) — proposta do agente

> **Propriedade intelectual.** (1) Os direitos sobre o código-fonte e a documentação desenvolvidos especificamente para
> o CONTRATANTE no âmbito desta proposta ("Código Específico") pertencem ao CONTRATANTE a partir da quitação integral do
> preço, nos termos do art. 4º da Lei nº 9.609/1998. (2) Continuam pertencendo à NEKKORA os programas, as bibliotecas,
> os frameworks e as ferramentas listados no Anexo de Componentes que tenham sido criados antes desta proposta ou
> independentemente dela, sem uso de recursos ou informações do CONTRATANTE ("Componentes Preexistentes"), entre eles o
> Nekkora Studio, Agent, Framework e Platform. (3) A NEKKORA concede ao CONTRATANTE licença não exclusiva, gratuita, sem
> limite de prazo e irrevogável após a quitação para usar, reproduzir e modificar os Componentes Preexistentes
> incorporados à entrega, na medida necessária para operar, manter e evoluir a automação entregue, diretamente ou por
> terceiros que contratar. Fica vedada a exploração comercial separada desses componentes. (4) Componentes de terceiros
> seguem as licenças de seus titulares, indicadas no Anexo de Componentes. (5) Antes da quitação, o CONTRATANTE pode usar
> a automação apenas para homologação.

**Por que não reduz direitos do contratante:** o código específico segue a regra legal. A licença dos componentes
preexistentes cobre tudo o que é preciso para usar e manter a automação, sem prazo e sem depender da Nekkora.
**Pendente:** a titular escolher entre o Modelo A-R e o Modelo A com cláusula de afastamento; revisão por advogado(a).

### 9.3 O que **não** entra em nenhuma cláusula

Retenção automática de valores; multa por desistência dentro do prazo de arrependimento; renúncia antecipada de
direitos (CC art. 424; CDC art. 51, I); exclusão genérica de responsabilidade (CDC arts. 24, 25 e 51, I); aceite tácito;
cancelamento unilateral sem igual direito para o cliente (CDC art. 51, XI).
