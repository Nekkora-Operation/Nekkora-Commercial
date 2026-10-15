# COM-001 · Gate 02 — Contrato comercial (fonte de verdade das mensagens)

Este documento define **o que a página pode dizer** sobre cada oferta. O texto exibido vive em
[`src/content.ts`](../../src/content.ts) e cada bloco referencia os IDs da
[matriz de alegações](03-matriz-alegacoes.md). Mudou uma regra aqui? A matriz e o `content.ts` mudam juntos.

Fonte das regras: missão COM-001 (§1, §2 e §4), emitida pela responsável pela Nekkora. Onde a missão não decide
(preço, prazo, disponibilidade do Hosting, canais de contato), a página **não afirma** — a lacuna vira pendência
em [08-pendencias-publicacao.md](08-pendencias-publicacao.md).

## 1. Nekkora Delivery

**Definição:** desenvolvimento de automações por demanda, com escopo, prazo, preço e aceite próprios para cada
automação, definidos em proposta.

**Ciclo (exibido em "Como funciona")**

| # | Etapa | O que a página diz |
|---|---|---|
| 1 | Entendimento da necessidade | O cliente descreve processo, regras e resultado esperado. |
| 2 | Avaliação de viabilidade e dimensionamento | Sistemas, acessos e complexidade são analisados para dimensionar a automação. |
| 3 | Proposta | Escopo, preço e condições por escrito; o desenvolvimento só começa após aprovação. |
| 4 | Desenvolvimento e testes | Construção e testes conforme o escopo aprovado. |
| 5 | Homologação e aceite | O cliente valida no seu cenário e formaliza o aceite. |
| 6 | Entrega e transferência | Entrega e transferência do que foi previsto na proposta. |

**Regras obrigatórias de comunicação**

- Cada automação é dimensionada individualmente (A-04); o mesmo cliente pode solicitar vários processos (A-05).
- As demandas respeitam fila operacional (A-06); reuniões são combinadas conforme a necessidade (A-07).
- Tecnologias **podem** incluir Python, UiPath, Power Automate e integrações — escolhidas na avaliação (A-08).
- Licenças e serviços de terceiros dependem de avaliação e proposta (A-09).
- Alterações futuras, sustentação e novas funcionalidades **não** estão incluídas automaticamente (A-10).
- O prazo depende de fila, acessos, sistemas externos e homologação (A-11). A página não mostra prazo.
- Exemplos de aplicação são rotulados como exemplos, com viabilidade avaliada caso a caso (A-12).

**CTA adequado ao estágio:** "Solicitar avaliação" — leva ao formulário; nunca "contratar" ou "comprar".

## 2. Nekkora Hosting

**Definição:** infraestrutura e serviços associados à execução de automações, com componentes e responsabilidades
explicitamente delimitados.

**Estágio:** disponibilidade comercial **não confirmada** (H-02 pendente). Toda a seção usa linguagem de
**avaliação de viabilidade**: sem preço, sem "contrate agora", sem capacidade reservada (H-05 proibida).

**Componentes — distintos e não obrigatórios entre si (H-03)**

| Componente | Significado exibido | Como é tratado |
|---|---|---|
| Infraestrutura para execução | Ambiente (máquinas, servidores ou serviços) onde a automação roda. | Avaliada conforme requisitos técnicos e compatibilidade. |
| Configuração inicial | Preparação do ambiente: instalação, dependências e acessos. | Definida na proposta, quando contratada. |
| Administração e manutenção do ambiente | Atualizações e cuidados com o ambiente ao longo do tempo. | Serviço à parte, com escopo próprio. |
| Monitoramento técnico | Acompanhamento da saúde do ambiente (máquinas e serviços). | Escopo, horários e forma definidos em proposta, se contratado. |
| Monitoramento de processos | Acompanhamento das execuções da automação e de seus resultados. | Escopo definido em proposta, se contratado. |
| Operação assistida | Acompanhamento de execuções em período combinado, junto à equipe do cliente. | Período e responsabilidades definidos em proposta. |
| Correção de incidentes | Análise e correção de falhas na execução. | Abrangência e condições definidas em proposta. |
| Sustentação e evolução das automações | Ajustes por mudanças no processo ou nos sistemas e novas funcionalidades. | Não incluída no desenvolvimento; contratada à parte. |

**CTA adequado ao estágio:** "Solicitar avaliação de viabilidade".

## 3. Oferta combinada

| Modalidade | Mensagem | Condição |
|---|---|---|
| Delivery independente | Automação desenvolvida e entregue para rodar no ambiente que o cliente indicar. | — |
| Hosting independente | Execução de automações existentes, desenvolvidas pelo cliente ou por terceiros. | Sujeita a compatibilidade técnica e disponibilidade (H-04). |
| Delivery + Hosting | Desenvolvimento e ambiente avaliados em conjunto. | Requisitos do ambiente **podem** ser considerados desde a proposta (C-03, condicional). |

**Limites (exibidos):** contratar os dois não inclui automaticamente sustentação, evolução, monitoramento nem
correção de incidentes; cada serviço mantém escopo, preço, condições e aceite próprios.
**Nenhuma modalidade exige produtos internos da Nekkora** (C-02).

## 4. Produtos internos

Studio, Platform e Agent: em desenvolvimento. Podem ser mencionados **apenas** em bloco informativo da
Transparência, dizendo que não fazem parte das ofertas e não são necessários (P-01). Qualquer apresentação como
porta de entrada, ferramenta obrigatória ou produto disponível é proibida (P-02).

## 5. Contato

Nenhum canal real está confirmado (K-01 a K-04 pendentes). Regras:

- Canal sem valor confirmado e válido **não é exibido como link**. O código valida o formato (número de WhatsApp
  com DDI+DDD, não nulo; e-mail; URL de perfil, não página inicial da rede).
- Sem canais confirmados, a página informa "canais em definição" e o formulário funciona em **modo de
  demonstração**: valida, mostra o resumo e declara que nada foi enviado nem armazenado (K-05).
- Botão flutuante de WhatsApp e CTA de WhatsApp na barra só aparecem com número confirmado.
- Nenhum prazo de resposta ou horário de atendimento é exibido até decisão (K-04).
