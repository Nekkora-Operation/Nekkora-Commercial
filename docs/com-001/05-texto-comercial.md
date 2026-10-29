# Texto comercial consolidado (modelo C — Poster · COM-RELEASE-001/002/003 · NEKKORA-COM-008-C)

> **Em revisão.** Textos ajustados às decisões da COM-008-B; não aprovados (aprovacoes.textosComerciais,
> condicoesComerciais e avisoDePrivacidade = false) e sujeitos a revisão jurídica.

> Gerado por `npm run texto` a partir de [`src/content.ts`](../../src/content.ts). Não edite este arquivo: altere
> o `content.ts` (e a [matriz de alegações](03-matriz-alegacoes.md), se a mudança afetar uma promessa) e gere de novo.

## 1. Hero

Selo: Delivery · Hosting

**Automação sob medida, da necessidade à execução.**

Automações por demanda, com escopo, preço e aceite definidos em proposta para cada uma. Infraestrutura para executá-las, sujeita a avaliação. Cada serviço contratado de forma independente.

CTAs: "Solicitar avaliação" · "Ver como funciona"

- Proposta por automação
- Homologação e aceite
- Sem pacote obrigatório

## 2. Soluções

**Soluções** — Duas ofertas. Você escolhe o arranjo.

### 01 · Nekkora Delivery · _Sob proposta_

Desenvolvimento de automações por demanda.

- Escopo, prazo e preço definidos em proposta para cada automação
- A entrega só é concluída depois de documentação, desenvolvimento, testes, da sua homologação e do aceite formal
- Entrega definitiva com documentação e dependências identificadas, nos termos do contrato

Tecnologias, conforme o caso: Python · UiPath · Power Automate · Integrações via API · Sistemas web · Dados e planilhas. _A viabilidade com cada sistema é confirmada na avaliação._

Link: "Conhecer o Delivery" (#precos)

### 02 · Nekkora Hosting · _Em avaliação de viabilidade_

Infraestrutura e serviços associados à execução de automações.

- Componentes escolhidos conforme a necessidade, nenhum obrigatório
- Responsabilidades de cada parte delimitadas por escrito
- Disponibilidade confirmada em avaliação de viabilidade

Link: "Entender o Hosting" (#hosting)

Delivery e Hosting podem ser contratados separadamente ou em conjunto. Nenhum deles exige o uso de produtos próprios da Nekkora.

## 3. Preços (bloco data-pricing)

**Preços · Nekkora Delivery** — Quanto custa uma automação

Valores por automação. A categoria é definida na avaliação e fica registrada na proposta, junto com escopo e condições.

> **Lançamento** — Preços especiais de lançamento. Valem para automações simples e médias solicitadas durante a campanha, conforme a categoria definida na avaliação. A proposta pode ser aceita em até 7 dias corridos da emissão. A automação complexa tem orçamento individual.

Sem datas aprovadas (só na versão de homologação): _Prévia para revisão: as datas da campanha ainda não foram definidas. Nenhuma solicitação é elegível antes do início oficial._

| Faixa | Para | Valor (campanha em vigor) | Fora da campanha |
|---|---|---|---|
| Automação simples | Um sistema ou planilha, regras diretas, poucas exceções. | ~~R$ 1.500~~ **R$ 1.000** −33,33% · Economia de R$ 500 — por automação · preço de lançamento | **R$ 1.500** — por automação |
| Automação média | Mais de um sistema, validações, tratamento de exceções e relatórios. | ~~R$ 3.500~~ **R$ 2.800** −20% · Economia de R$ 700 — por automação · preço de lançamento | **R$ 3.500** — por automação |
| Automação complexa | Processos ponta a ponta ou com várias integrações por API. | **Sob orçamento** — dimensionada na avaliação · orçamento individual | **Sob orçamento** |

Leitor de tela: "Preço padrão: <preço padrão>", "Preço especial de lançamento: <preço de lançamento>", "Desconto de <percentual>". Valores de src/precos.ts.

### Simulador de Investimento — Nekkora Delivery (NEKKORA-CALC-001 — logo abaixo dos cartões)

Escolha quantas automações de cada categoria você tem em mente e veja uma estimativa do investimento. Sem cadastro: nada do que você seleciona é enviado ou guardado.

Controles: Automações simples · Automações médias · Automações complexas — botões "Diminuir …" / "Aumentar …", campo numérico (0 a 20), "Até 20 por categoria. Para mais, fale com a Nekkora."

Barra: "Total selecionado: 3 automações" · botões "Limpar simulação" e "Calcular meu investimento". Sem seleção: _Selecione ao menos uma automação para calcular._ Mudou depois de calcular: _As quantidades mudaram. Clique em "Calcular meu investimento" para atualizar a estimativa._

**Resultado da simulação** — linhas "2 automações simples × <preço>", depois:
- "Investimento estimado" / "Investimento estimado com preços de lançamento" / "Subtotal estimado" / "Subtotal estimado com preços de lançamento"
- Com a campanha em vigor: "Pelo preço padrão", "Economia promocional", "Desconto equivalente sobre o total calculável" — A economia é a diferença entre o preço padrão e o preço de lançamento das categorias selecionadas — não é uma economia operacional comprovada.
- Com complexa: A automação complexa exige orçamento individual e não entra no valor acima, que não é o preço completo da contratação. Só complexas: Automações complexas têm orçamento individual, definido na avaliação. Por isso, esta simulação não mostra um valor.
- Campanha vigente: Preços de lançamento em vigor para solicitações recebidas durante a campanha.
- Campanha pendente: Prévia para revisão: as datas da campanha ainda não foram definidas. Nenhuma solicitação é elegível antes do início oficial.
- Campanha futura: Valores pelo preço padrão. Os preços de lançamento ainda não estão em vigor.
- Campanha encerrada: Valores pelo preço padrão. A campanha de lançamento foi encerrada.

> Esta simulação é uma estimativa baseada nas categorias selecionadas. A classificação, o escopo e o investimento definitivo serão confirmados na avaliação e registrados em proposta comercial.

Próximo passo: "Agendar uma conversa" (Microsoft Bookings, nova aba) · "Solicitar avaliação" (abre o formulário; o resumo da simulação é opcional)

**Não sabe a categoria da sua automação?** A categoria depende de sistemas, integrações, regras, volume e licenças, e é confirmada na avaliação. Na dúvida, solicite uma avaliação ou veja o que define a categoria (link para os critérios).

Exemplo de homologação: 2 simples + 1 média → padrão R$ 6.500; lançamento R$ 4.800; economia R$ 1.700; 26,15% (truncado).

- **Como chegamos a esses valores** — Trabalhamos com processos padronizados e ferramentas internas de documentação e desenvolvimento. Isso nos permite oferecer estes valores sem retirar etapas: documentação, desenvolvimento, testes e homologação continuam no escopo.
- **Licenças e infraestrutura** — Indicamos na proposta as licenças e os serviços de terceiros necessários (UiPath, Power Automate, APIs pagas); em regra, a contratação é do cliente, e esses custos não estão incluídos nos valores acima. A automação pode rodar na infraestrutura do próprio cliente ou, se contratado à parte, no Nekkora Hosting.

**O que define a categoria**

- Quantidade de sistemas envolvidos
- Complexidade das integrações
- Regras de negócio e exceções
- Volume de processamento
- Exigências de infraestrutura
- Necessidade de licenciamento

Nem todo processo é simples ou médio: a avaliação indica a categoria antes de qualquer proposta.

**Condições comerciais**

- Desenvolvimento sob demanda, com escopo formalizado em proposta
- Pode solicitar várias automações: cada uma tem categoria, escopo, preço e aceite próprios
- Preço aprovado por você antes do início do desenvolvimento
- Pagamento de 50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal
- Demandas organizadas em fila: o início depende da fila e da aprovação da proposta
- Reuniões e acompanhamento conforme as condições acordadas
- Licenças e custos externos tratados à parte, quando aplicáveis
- Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei

Hosting tem avaliação e proposta próprias.

## 4. Como funciona

**Como funciona** — Seis etapas, com a sua aprovação nos pontos de decisão.

1. **Entendimento da necessidade** — Você descreve o processo, as regras e o resultado esperado.
2. **Viabilidade e dimensionamento** — Analisamos sistemas, acessos e complexidade para dimensionar a automação.
3. **Proposta** — Escopo, preço e condições por escrito. O desenvolvimento começa após a sua aprovação.
4. **Desenvolvimento e testes** — Construímos e testamos a automação conforme o escopo aprovado.
5. **Homologação e aceite** — Você valida a automação no seu cenário e registra os defeitos encontrados. Depois das correções, a homologação só é concluída com o seu aceite formal.
6. **Entrega definitiva** — Após o aceite e a confirmação do pagamento, entregamos o que foi previsto na proposta, com documentação e dependências identificadas.

## 5. Hosting

**Nekkora Hosting** — Infraestrutura para executar automações, com responsabilidades delimitadas.

Hosting reúne serviços distintos — infraestrutura, configuração, administração, monitoramento, operação assistida, correção de incidentes, sustentação. Cada um é avaliado separadamente e só faz parte do contrato quando consta na proposta.

> **Disponibilidade em avaliação.** Uma solicitação inicia uma avaliação de viabilidade e compatibilidade — não representa contratação nem reserva de capacidade.

CTA: "Solicitar avaliação de viabilidade"

## 6. Transparência

**Transparência** — Letras grandes, não miúdas

O que é definido em proposta, o que não está incluído sem acordo explícito e do que o andamento depende.

**Definido em proposta**

- Escopo de cada automação
- Preço e condições de pagamento
- Prazo estimado
- Tecnologias e licenças necessárias
- Responsabilidades de cada parte
- Critérios de homologação e aceite
- Correção de defeitos do que foi entregue: prazo e condições, além das garantias legais

**Não incluído automaticamente**

- Alterações futuras e novas funcionalidades
- Sustentação e evolução das automações
- Suporte, sustentação e garantia adicional após a entrega, salvo se previstos
- Infraestrutura e serviços de Hosting
- Licenças e serviços de terceiros — em regra, contratados pelo cliente
- Monitoramento, 24 horas, alta disponibilidade ou SLA

**Depende de você e de terceiros**

- Liberação de acessos e credenciais
- Estabilidade de sistemas externos
- Disponibilidade da sua equipe para homologação
- Fila operacional da Nekkora

## 7. Contato

**Vamos olhar o seu processo de perto?**

A solicitação inicia uma avaliação — não é uma contratação e não gera compromisso.

Botão: "Solicitar avaliação" (abre o diálogo)

Sem canais confirmados: _Canais oficiais em definição · formulário em modo de demonstração_

Diálogo **Solicitar avaliação** — Conte o que você precisa: uma automação nova, a hospedagem de uma automação existente ou infraestrutura e serviços relacionados. Antes de qualquer envio, você revisa a mensagem. A solicitação inicia uma avaliação — não é uma contratação.

Canal da solicitação: WhatsApp, se confirmado; senão o e-mail (publicação atual: e-mail). Sem canal: _Canais oficiais em definição · formulário em modo de demonstração_

Formulário: "O que você precisa?"* (Desenvolver uma nova automação · Hospedar uma automação existente · Infraestrutura e serviços relacionados; o CTA do Hosting abre com a hospedagem), Nome*, Empresa (opcional), E-mail (Opcional — só se preferir retorno por e-mail.), "Descreva o processo ou a necessidade"* — O que acontece hoje, quais sistemas envolve, com que frequência e qual resultado você espera. Até 1.000 caracteres.. Rodapé: "Cancelar" + envio; link "Como tratamos seus dados".

Segunda linha da mensagem, por tipo: _Quero solicitar uma avaliação de automação._ · _Quero solicitar uma avaliação de viabilidade para hospedar uma automação existente (Nekkora Hosting)._ · _Quero solicitar uma avaliação de infraestrutura e serviços relacionados (Nekkora Hosting)._

Vindo do simulador: caixa "Incluir o resumo da minha simulação na mensagem" (desmarcada) — Opcional. Você confere o texto antes de enviar; a simulação não é guardada. Na mensagem: "Simulação feita no site (estimativa, sujeita à avaliação):" + resumo.

Modo demonstração: botão "Revisar solicitação"; nota "Modo de demonstração: nenhum dado é enviado ou armazenado."; resultado **Solicitação validada — envio desativado nesta versão** — Nenhum dado foi enviado ou armazenado. Quando os canais oficiais forem publicados, este formulário passará a encaminhar a solicitação.

### Pelo e-mail (publicação atual)

Link direto: "Escrever diretamente por e-mail" + divisor "ou preencha o formulário". Botão: "Revisar mensagem"; nota "Na próxima etapa você confere a mensagem antes de abrir o seu aplicativo de e-mail. Nada é armazenado nesta página."

Etapa de confirmação: **Confirme a sua solicitação** — Esta é a mensagem que será aberta no seu aplicativo de e-mail, endereçada à Nekkora. Confira antes de continuar.

> **Antes de continuar** — Ao continuar, o seu aplicativo de e-mail é aberto com esta mensagem — tipo de solicitação, nome, empresa, e-mail, descrição e, se você o incluiu, o resumo da simulação, como estão acima. Ela só chega à Nekkora se você a enviar pelo aplicativo. Esta página não guarda o que você digitou.

Botões: "Voltar e editar" · "Abrir no e-mail". Alternativas: "Copiar mensagem"; "Se o aplicativo de e-mail não abrir, copie a mensagem e envie para <e-mail>".

- Após abrir: **Pedimos ao navegador para abrir o seu aplicativo de e-mail** — Se nenhum aplicativo abriu, copie a mensagem e envie para o endereço abaixo. A mensagem só é enviada quando você a enviar pelo seu e-mail.
- Link manual (sempre): "Abrir no e-mail novamente"

### Pelo WhatsApp (quando houver número confirmado)

Link direto: "Falar diretamente pelo WhatsApp" + divisor "ou preencha o formulário". Botão: "Revisar mensagem"; nota "Na próxima etapa você confere a mensagem antes de abrir o WhatsApp. Nada é armazenado nesta página."

Etapa de confirmação: **Confirme a sua solicitação** — Esta é a mensagem que será aberta no WhatsApp. Confira antes de continuar.

> **Antes de continuar** — Ao continuar, o WhatsApp (serviço da Meta) é aberto em outra aba com esta mensagem — tipo de solicitação, nome, empresa, e-mail, descrição e, se você o incluiu, o resumo da simulação, como estão acima. Ela só chega à Nekkora se você tocar em enviar na conversa. Esta página não guarda o que você digitou.

Botões: "Voltar e editar" · "Abrir no WhatsApp". Alternativas: "Copiar mensagem"; "Se o WhatsApp não abrir, copie a mensagem e envie para <número>"; "Prefere e-mail? Escreva para <e-mail>".

- Após abrir: **Pedimos ao navegador para abrir o WhatsApp** — Se a conversa não apareceu em uma nova aba, use o botão abaixo. A mensagem só é enviada quando você a confirmar no WhatsApp.
- Link manual (sempre): "Abrir conversa no WhatsApp"

Canais diretos (sem formulário): "Prefere falar direto?"

## 7b. Envio automático e agendamento (COM-RELEASE-005 — só com endpoint e URL do Bookings confirmados)

Precedência: envio automático (se houver endpoint) → WhatsApp → e-mail. Um único mecanismo de envio por vez.

Formulário: E-mail obrigatório — "Obrigatório — é por ele que respondemos." (erro: "Informe um e-mail para recebermos e respondermos a sua solicitação, como nome@empresa.com."). Nota: "Na próxima etapa você confere os dados antes de enviar."

Confirmação: **Confirme a sua solicitação** — Confira os dados abaixo. Eles serão enviados à Nekkora quando você tocar em "Enviar solicitação".

> **Antes de enviar** — Ao enviar, tipo de solicitação, nome, empresa, e-mail, descrição e, se incluído, o resumo da simulação vão para a Nekkora por um serviço da AWS, que entrega a solicitação na caixa de e-mail comercial. Só usamos os dados para responder e preparar a avaliação.

Desafio: "Verificação de segurança automática (Cloudflare Turnstile) para evitar envios por robôs." · aguardando: "Aguardando a verificação de segurança…" · indisponível: "A verificação de segurança não carregou. Você pode tentar de novo ou usar o e-mail abaixo."

Botões: "Voltar e editar" · "Enviar solicitação" (durante o envio: "Enviando…"; leitor de tela: "Enviando a solicitação. Aguarde a confirmação.")

- Recebida (só com a confirmação do servidor): **Solicitação recebida** — Protocolo NK-XXXXXXXX. Vamos responder pelo e-mail informado. A solicitação inicia uma avaliação — não é uma contratação.
- Falha: **A solicitação não foi enviada**
- _rede_: Não conseguimos falar com o servidor. Confira a sua conexão e tente de novo — os dados continuam aqui.
- _limite_: Recebemos muitas solicitações em pouco tempo. Tente de novo mais tarde ou use o e-mail abaixo.
- _desafio_: Não foi possível confirmar a verificação de segurança. Faça a verificação de novo e tente enviar.
- _indisponivel_: O envio não foi concluído por uma falha temporária. Os dados continuam aqui: tente de novo em instantes ou use o e-mail abaixo.
- _recusada_: Não foi possível enviar esta solicitação. Revise os dados ou escreva diretamente para o e-mail abaixo.

Ações na falha: "Tentar novamente" (não aparece quando a solicitação é recusada) · "Se preferir, envie a mesma mensagem pelo seu e-mail para <e-mail>" · "Abrir no e-mail" · "Copiar mensagem"

**Agendamento** — botão "Agendar conversa" (nome acessível: "Agendar conversa (abre o Microsoft Bookings em outra aba)") no topo e no contato; no diálogo: "Prefere conversar antes? Agendar conversa". Nota no contato: "Escolha um horário na agenda da Nekkora, no Microsoft Bookings. A conversa só fica marcada quando o Bookings confirmar."

## 7a. Privacidade

**Privacidade** — Como tratamos seus dados

Responsável pelos dados pessoais desta página: a Nekkora (CNPJ 68.337.624/0001-32).

- **O formulário não envia nada** — O que você digita fica apenas no seu navegador. Nenhum dado vai para servidores da Nekkora por esta página.
- **O que vai para o e-mail** — Só quando você confirma: nome, empresa e e-mail (se informados) e a descrição do processo vão para uma mensagem aberta no seu aplicativo de e-mail, endereçada a contato@nekkora.com. Ela só é enviada se você a enviar pelo aplicativo.
- **Agendamento pelo Microsoft Bookings** — Ao agendar, você sai desta página para o Microsoft Bookings, serviço da Microsoft usado pela Nekkora. Nome, e-mail, respostas às perguntas do agendamento e o horário escolhido ficam registrados na agenda da Nekkora no Microsoft 365 e são usados para confirmar e lembrar o horário e realizar a conversa pelo Microsoft Teams. Não informe senhas, credenciais nem documentos sigilosos.
- **Sem cookies nem rastreamento** — Esta página não usa cookies nem ferramentas de análise ou de publicidade. O navegador guarda apenas a sua escolha de tema (claro ou escuro); o simulador de investimento não guarda nem envia o que você seleciona. Fontes e imagens vêm do próprio site. O Microsoft Bookings, para onde leva o botão "Agendar conversa", segue as regras da Microsoft.
- **Registros de acesso** — A Amazon Web Services (AWS), que hospeda este site, processa dados técnicos de acesso, como endereço IP e navegador, para entregar as páginas e proteger o serviço.
- **Por quanto tempo guardamos** — Mensagens e dados de contato de quem não chegou a contratar ficam guardados por até seis meses após o último contato relevante. Reservas do Microsoft Bookings, por até 90 dias após a reunião ou o cancelamento. Dados ligados a uma contratação seguem os prazos do contrato e os exigidos por lei.
- **Onde os dados são processados** — Os serviços da Microsoft (Microsoft 365, Bookings e Teams) e da Amazon Web Services (AWS) usados pela Nekkora podem processar dados em servidores fora do Brasil.
- **Uso e seus direitos** — Usamos os dados que você nos envia só para responder à solicitação, realizar a conversa agendada e preparar avaliação e proposta, a seu pedido (LGPD, art. 7º, V). Para isso não pedimos consentimento: os dados são necessários para atender ao seu pedido. Se algum outro uso depender de consentimento, ele será pedido à parte. Você pode pedir confirmação, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade e informações sobre o compartilhamento dos seus dados e, quando houver consentimento, revogá-lo (LGPD, art. 18), pelo e-mail contato@nekkora.com.

## 8. Barra de navegação

Links: Soluções · Preços · Como funciona · Hosting · Transparência. Sem botão "Entrar": oculto enquanto não houver área de clientes (COM-008-B, AUD-26).

## 9. Rodapé

- © Nekkora. Todos os direitos reservados.
- Link "Privacidade"
- Versão para homologação (enquanto publicacao.json mantiver avisoHomologacao)
- Neko (猫) observa os detalhes.
