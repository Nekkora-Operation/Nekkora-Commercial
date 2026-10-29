# Minuta — condições comerciais do Nekkora Delivery

> **MINUTA NÃO APROVADA JURIDICAMENTE.** Redação preparada na NEKKORA-COM-008-C a partir das diretrizes aprovadas
> pela titular na COM-008-B. Serve de base para a proposta-modelo e o contrato e **depende de revisão por advogado(a)**
> antes de qualquer uso. Nada aqui foi publicado como cláusula. No site aparecem só os resumos de `src/content.ts`,
> também em revisão: `aprovacoes.condicoesComerciais` e `aprovacoes.textosComerciais` continuam `false`.
>
> Marcadores: **[D]** diretriz aprovada pela titular · **[R]** redação proposta pelo agente, a revisar ·
> **⚖** ponto que exige avaliação jurídica.

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
| Entrega definitiva | Após a confirmação da quitação, respeitados os direitos aplicáveis |
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
- ⚖ Número de rodadas de correção incluídas.

## 4. Cancelamento e reembolso

Diretrizes aprovadas **[D]**:

| Momento | Regra |
|---|---|
| Antes do início do desenvolvimento | Reembolso **integral** da entrada |
| Durante o desenvolvimento | **Apuração proporcional** do trabalho realizado e das despesas justificadas; devolução do saldo da entrada, se houver |
| Após a homologação concluída | Possibilidade de **retenção dos 50% iniciais** em caso de desistência injustificada, conforme o contrato e a legislação aplicável |
| Descumprimento da Nekkora | Observar as soluções e restituições legalmente devidas |

- **Não publicar cláusulas absolutas de retenção ou de renúncia de direitos.** O site diz apenas: "Cancelamento,
  reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei."
- ⚖ Direito de arrependimento (CDC, art. 49) em contratação a distância com cliente consumidor ou equiparado.
- ⚖ Como documentar o "início do desenvolvimento" (sugestão **[R]**: comunicação por escrito da Nekkora com a data de
  início).
- ⚖ Validade da retenção dos 50% após a homologação e o limite da apuração proporcional.

## 5. Garantia

| Diretriz **[D]** | Redação proposta **[R]** |
|---|---|
| Garantia contratual **adicional** proposta de **30 dias** após a entrega definitiva | "Por 30 dias corridos após a entrega definitiva, a Nekkora corrige, sem custo, defeitos atribuíveis à entrega, conforme o escopo aprovado." |
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

1. **[D]** **Licenciamento** da automação entregue ao cliente.
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
| Duração de **dois meses** a partir da publicação oficial | As datas exatas **não** estão definidas. A titular as grava em `publicacao.json → campanhaLancamento` depois da publicação oficial; o código nunca as calcula nem preenche |
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
servidor no horário de Brasília. ⚖ Confirmar se o regulamento da campanha deve ser publicado por inteiro.
