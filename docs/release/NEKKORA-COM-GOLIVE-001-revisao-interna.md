# Revisão interna para a publicação sem parecer jurídico externo — Nekkora Commercial V1

**Data:** 10/11/2026. **Estado: PROPOSTA, NÃO APROVADA.** Este documento **não é parecer jurídico**. É a revisão interna
feita para a decisão da titular de lançar sem contratar assessoria jurídica agora. O parecer externo deixa de ser
condição interna, mas **a LGPD, o Marco Civil, o CDC e as regras de transferência continuam obrigatórios**. As
perguntas do [dossiê](NEKKORA-COM-GOLIVE-001-dossie-juridico.md) seguem sem resposta. **PUB-09, PUB-17, PUB-19 e
PUB-18 continuam não aprovadas.**

**A decisão de 06/11/2026 continua valendo:** aceitar o risco **não** substitui um mecanismo legal de transferência
internacional. Por isso, a §1 separa os fluxos que **são** transferência daqueles que não são.

## 1. Classificação dos fluxos (Res. CD/ANPD 19/2024, Anexo I, arts. 3º a 9º)

Fonte: texto da Resolução na página oficial da ANPD (gov.br/anpd, consultada em 10/11/2026; a página remete ao DOU de
23/08/2024 e à retificação de 18/08/2025).

**Critérios aplicados (paráfrase; o texto exato fica na fonte):**
- **Art. 3º:** "transferência" (III) é transmitir, compartilhar ou **disponibilizar acesso** a dados para outro agente;
  "transferência internacional" (IV) é a transferência para país estrangeiro; "coleta internacional" (V) é a coleta
  feita **diretamente** do titular por agente localizado no exterior.
- **Art. 4º:** cabe ao **controlador** verificar se a operação é transferência internacional, se está sujeita à lei
  brasileira e se tem hipótese legal e mecanismo válidos, e **comprovar** essa verificação (§2º). Esta seção é esse
  registro.
- **Art. 5º:** a transferência internacional existe quando o exportador transfere dados ao importador.
- **Art. 6º:** a coleta internacional **não** é transferência internacional.
- **Arts. 7º e 8º:** aplicação da LGPD. A exceção de **trânsito** sem comunicação nem uso compartilhado (art. 8º, §1º,
  I) trata de dados **vindos do exterior**. Ela **não** é usada aqui para afastar nenhum fluxo da Nekkora.
- **Art. 9º:** a transferência só pode acontecer com **hipótese legal** (art. 7º ou 11 da LGPD) **e** mecanismo válido
  (adequação, CPC ou cláusulas específicas, normas corporativas, ou art. 33, II, "d", e III a IX), limitada ao mínimo
  necessário.

**Escopo:** lançamento **sem o Bookings** (§4) e sem o envio automático (PUB-21, desligado).

| # | Fluxo | Classificação | Comprovado | Mecanismo do art. 33 | Situação |
|---|---|---|---|---|---|
| F1 | **Arquivos do site** (S3, `sa-east-1`) | Não há dados pessoais | Região `sa-east-1` (auditoria 42809550459) | Não se aplica | **Sem pendência** |
| F2 | **Entrega das páginas** (CloudFront) | Processamento pela AWS (operadora) no ponto de presença mais próximo do visitante. Visitante no exterior atendido no exterior: **candidato** a coleta internacional (art. 3º, V; art. 6º). Visitante no Brasil atendido fora do Brasil: **transferência possível** | Sem guarda na entrega. O ponto de presença usado **não** é comprovado | Para a parte que for transferência: base art. 7º, IX (entregar e proteger o site), que **não** tem o art. 33, IX. CPC da AWS **não comprovadas** | **Sem fundamento comprovado** para visitante no Brasil atendido no exterior. A classificação como coleta internacional é interpretação, não evidência |
| F3 | **Registros de acesso** (LOG-01) | Guarda no Brasil. Transferência possível em dois pontos: a API do logging v2 fica em `us-east-1` e o suporte da AWS pode acessar do exterior (art. 3º, III) | Bucket em `sa-east-1`, 5 campos, 190 dias (E4). **Não** comprovado se o conteúdo dos registros passa por `us-east-1` | Base art. 7º, II → **art. 33, IX** (transferência necessária ao cumprimento de obrigação legal) é o **candidato**. Necessidade não avaliada por parecer (J7-3) | **Candidato a fundamento**, não comprovado |
| F4 | **E-mail `contato@`**, de quem contrata em nome próprio | Coleta pela Nekkora no Brasil; Exchange em repouso no Brasil (E3). Transferência possível: proteção do Exchange Online "sem compromisso" de local, processamento em trânsito, suporte e subprocessadores (DPA: EUA e outros) | E3 (repouso). Processamento e suporte **não** comprovados | Base art. 7º, V → **art. 33, IX** é o **candidato** | **Candidato a fundamento**, não comprovado |
| F5 | **E-mail `contato@`**, de representante de empresa | Igual ao F4 | Igual ao F4 | Base art. 7º, IX → o art. 33, IX, **não** cobre. Sobram CPC (II), cláusulas específicas ou consentimento específico (VIII). **Nenhum comprovado**: a busca de 10/11/2026 não achou adoção das CPC pela Microsoft para clientes | **Sem fundamento comprovado.** Pela decisão de 06/11, não se resolve aceitando o risco |
| F6 | **Reunião pelo Teams** (combinada por e-mail) | Mídia hospedada na região do primeiro participante; sem compromisso de residência; chat em repouso no Brasil (E3) | Chat (E3). Mídia **não** comprovada | Contratante: art. 33, IX (candidato). Representante: igual ao F5 | Contratante: candidato. Representante: **sem fundamento comprovado** |
| F7 | **LinkedIn** (link e mensagens na página da Nekkora) | O LinkedIn coleta diretamente do usuário, como agente próprio, sob os termos dele (fora do site). A Nekkora lê a mensagem na plataforma | Nada além do link | Para a Nekkora, nenhum mecanismo próprio identificado. A relação com o LinkedIn não foi analisada | **Não analisado.** Dados copiados do LinkedIn para o e-mail seguem o F4/F5 |
| — | Bookings, envio automático | Fora do lançamento | — | — | Fora do escopo |

**Resumo:** nenhum fluxo tem mecanismo **comprovado**. O F1 não precisa de mecanismo. O F3, o F4 e o F6 (contratante)
têm **candidato** no art. 33, IX. O F2 (parte), o F5 e o F6 (representante) estão **sem fundamento comprovado**.

## 2. Avaliação do legítimo interesse: atendimento a representante de empresa (art. 7º, IX; art. 10)

**Situação:** avaliação **interna e documentada**, proporcional a um atendimento comercial. **Não é parecer** e só vale
como fundamentação **depois de aprovada pela titular**. Ela trata da **base legal** e **não resolve** a transferência
do F5 e do F6 (o art. 33, IX, não cobre o art. 7º, IX).

| Etapa | Avaliação |
|---|---|
| **Finalidade** (art. 10, *caput* e I) | Responder ao contato que um empregado ou representante faz, em nome de uma empresa, pedindo avaliação ou proposta, e conduzir a negociação. Finalidade legítima, concreta e atual: o contato já existe |
| **Necessidade** (art. 10, §1º; art. 6º, III) | Só os dados que a própria pessoa envia: nome, e-mail, empresa e descrição do processo. Nenhum dado sensível é pedido. Sem cookies, análise, publicidade, enriquecimento de cadastro ou uso para marketing |
| **Expectativa do titular** (art. 10, II) | Quem escreve pedindo proposta espera ser respondido por aquele e-mail. O aviso informa a finalidade antes do envio, e o "Abrir no e-mail" não envia nada sozinho |
| **Riscos** | Baixos para dados de contato profissional. Riscos residuais: (a) a pessoa incluir na descrição dados de terceiros ou sigilosos; (b) transferência internacional sem mecanismo comprovado (F5); (c) guarda além do necessário |
| **Salvaguardas** | Guarda por até 6 meses após o último contato relevante; acesso só da titular; direitos pelo `contato@`, **inclusive oposição** (art. 18, §2º, agora citada no aviso); nenhum uso para outra finalidade; consentimento à parte para qualquer outro uso |
| **Conclusão interna** | O equilíbrio é **favorável** ao uso do art. 7º, IX, para esse atendimento, **com o risco (b) em aberto**. Revisar se o escopo mudar (marketing, gravação, CRM, novos provedores) |

## 3. Ajustes no diff (working tree, sem commit)

1. **Condições (CO-11):** a frase dos 50% na homologação continua **fora do site**. A cl. 10 do contrato continua
   pendente e **não** deve ser usada automaticamente em novas contratações.
2. **[PV-12]:** "Pela lei, a disponibilização desses registros a terceiros depende de ordem judicial (Marco Civil da
   Internet, art. 10, §1º, e art. 15, §3º). Autoridades podem pedir que eles sejam guardados por mais tempo (art. 15,
   §2º), mas o acesso continua dependendo de ordem judicial. Os registros não contêm dados cadastrais, como nome ou
   endereço, que seguem regras legais próprias (art. 10, §3º)." A versão anterior dizia "em regra", o que dava a
   entender que poderia haver acesso sem ordem judicial. Isso saiu.
3. **"Onde os dados são processados" ([PV-10]):** sem mudança neste ajuste. Diz só o que foi verificado e não cita
   mecanismo.
4. **"Uso e seus direitos" ([PV-08]):** mantidos o art. 7º, V, e o IX. Entrou a **oposição** ao tratamento com base no
   interesse legítimo, e saiu "os dados são necessários para atender ao seu pedido", que não serve ao IX.
5. **Testes:** o `aviso-logs` exige a dependência de ordem judicial, a guarda cautelar e a distinção dos dados
   cadastrais, e proíbe "em regra" ou "sem ordem judicial". Nenhum teste foi removido.

## 4. Lançamento sem o Bookings: `publicacao.json` (aplicado em 10/11/2026, com autorização da titular)

```diff
   "agendamento": {
-    "url": "https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/",
-    "obrigatorio": true
+    "url": null,
+    "obrigatorio": false
   },
```

**Efeito nos controles:**
- O portão continua satisfeito: com `url` nula, exige só `obrigatorio !== true` (linhas 70 e 71). PUB-09, 10, 17, 18 e
  19 não mudam.
- A homologação de um build com essa configuração (cópia em área temporária) passou 94/94.
- `aprovacoes` (inclusive `agendamento: true`) e as datas da campanha não mudam.
- **Teste adaptado:** `scripts/testes/agendamento-url.test.mjs` aceita só duas configurações: `url: null` com
  `obrigatorio: false`, ou a URL oficial, válida em produção, com `obrigatorio: true`.
- **Defeito corrigido:** `scripts/conferir-bookings.mjs` exigia a URL ao ser importado, e o teste das regras B01 a B12
  quebrava. Agora a exigência vale só na execução pela linha de comando, e as regras não mudaram.
- O `$origem.agendamento` **não** foi alterado, porque nenhuma outra propriedade podia mudar. Ele ainda descreve a URL
  de 28/10/2026.
- **Achado:** sem o Bookings, o site publicado não menciona o Teams (0 ocorrências no build). Se houver reunião pelo
  Teams combinada por e-mail (F6), o aviso não a descreve (§7, item 4).

## 5. Riscos que permanecem sem parecer

1. **F5 e F6 (representante):** transferência possível sem mecanismo comprovado. Pela decisão de 06/11, isso **não** se
   resolve aceitando o risco. Saídas que não dependem de parecer: (a) evidência de que não há transferência efetiva
   (por exemplo, acesso de suporte controlado e registrado); (b) obter CPC ou cláusulas da Microsoft; (c) consentimento
   específico (art. 33, VIII) no primeiro contato. **Nenhuma está aplicada.**
2. **F2:** a classificação como coleta internacional é interpretação. Para visitante no Brasil atendido no exterior,
   não há mecanismo comprovado.
3. **F3, F4 e F6 (contratante):** o art. 33, IX, é candidato; a "necessidade" não foi avaliada por parecer.
4. **Cl. 10 do contrato (50%)** e J3-a e J3-b: pendentes. Nenhuma contratação usa a cl. 10 sem nova decisão.
5. **F7 (LinkedIn):** não analisado.

## 6. Como registrar no portão sem inventar parecer

O portão **não muda**. Na PR única, cada aprovação leva um `$origem` com a fonte real, por exemplo: "Titular, <data>:
aprovado sobre o commit <sha> com base na revisão interna (NEKKORA-COM-GOLIVE-001-revisao-interna.md), **sem parecer
jurídico externo**." Nenhum `$origem` pode dizer "aprovado juridicamente" ou "conforme parecer". A §5, item 1, depende
de decisão expressa da titular, compatível com a decisão de 06/11.

## 7. Última verificação antes de propor a liberação (10/11/2026)

Conclusões internas, **não** parecer. Nenhuma presume transferência só pela região de uma API, e nenhuma propõe
consentimento posterior para transferência já feita.

1. **F2 e F3 (AWS).**
   - **Plano de controle × dados.** A API do logging v2 em `us-east-1` é onde a **configuração** da entrega fica
     guardada (plano de controle). Isso, sozinho, **não** comprova que os registros passem pelos EUA. A configuração da
     distribuição e da entrega não contém dados pessoais dos visitantes.
   - **F2, entrega.** A distribuição usa `PriceClass_All` (C12, run 42809550459), com os pontos de presença da América
     do Sul habilitados. O roteamento para o ponto mais próximo é o funcionamento normal, mas **não** é garantia. Para
     visitante no exterior atendido no exterior, a leitura de **coleta internacional** (art. 3º, V; art. 6º) é
     **candidata**. Para visitante no Brasil, **não há transferência efetiva comprovada**, mas também não há prova de
     que ela nunca ocorra.
   - **F3, registros.** Cada registro nasce no ponto de presença que atendeu o acesso (ligado ao F2) e é guardado em
     `sa-east-1` (E4). O caminho entre um e outro **não** está documentado nas evidências.
   - **Conclusão:** não há transferência efetiva comprovada no F2 nem no F3. O que existe é possibilidade. Se ela se
     confirmar para os registros, o candidato é o art. 33, IX (art. 7º, II).
   - **Evidência barata que falta:** a entidade contratante da conta AWS, impressa na fatura. Se for uma empresa
     brasileira, a análise de quem é importador muda.
2. **F4 e F5 (Microsoft 365).**
   - **Em repouso, não há transferência:** o Exchange está em Brasil/Brasil (E3).
   - **Transferência efetiva possível em três pontos:**
     - acesso de suporte a partir do exterior ("disponibiliza acesso", art. 3º, III), que **só ocorre se houver acesso**;
     - processamento da proteção do Exchange Online, mostrada em Brasil, mas "sem compromisso";
     - subprocessadores (o DPA autoriza os EUA).
   - **Nada disso está comprovado como ocorrido, nem como impossível.**
   - **Mecanismos que poderiam ser comprovados:**
     - **(a) Contratante:** art. 33, IX, com o art. 7º, V (candidato, sem custo).
     - **(b) Representante (art. 7º, IX):** o art. 33, IX, não cobre esse caso. Restam as CPC ou cláusulas específicas
       com a Microsoft. A adoção pela Microsoft para clientes não foi encontrada, e um pedido formal seria necessário.
       Consentimento posterior está **excluído**. Consentimento prévio só valeria antes de qualquer transferência,
       e o "Abrir no e-mail" não o garante.
     - **(c) Para qualquer remetente: mostrar que, por padrão, não há transferência efetiva.** O Customer Lockbox faz o
       suporte depender da aprovação da Nekkora. Isso **não é um mecanismo do art. 33**. É uma forma de evitar que o
       acesso aconteça sem decisão da Nekkora. A disponibilidade, a licença e o custo **não foram verificados**, e
       ativar exige autorização para mexer no M365.
   - **Conclusão:** o atendimento por e-mail de representantes continua **sem fundamento comprovado**. A rota (c) é a
     única que não depende da Microsoft assinar cláusulas, e mesmo assim não cobre os subprocessadores nem o
     processamento "sem compromisso".
3. **F7 (LinkedIn).**
   - **O link:** o site tem um link comum para a página da Nekkora no LinkedIn. Não há incorporação, pixel ou script do
     LinkedIn, e a política `strict-origin-when-cross-origin` envia só a origem `https://nekkora.com`.
   - **Ao clicar no link**, a Nekkora **não transfere** dados: o LinkedIn coleta diretamente do usuário, como agente
     independente e sob os termos dele.
   - **Mensagem na página da Nekkora no LinkedIn:** quem coleta é o LinkedIn. A Nekkora a lê na plataforma e a usa para
     responder, inclusive para a regra da campanha. Isso não é exportação pela Nekkora.
   - **Conclusão:** só há transferência pela Nekkora se ela **enviar** dados do Brasil para o LinkedIn, e isso não faz
     parte do fluxo.
4. **Fluxos de captação sem fundamento suficiente e alternativa mínima.**
   - **E-mail de representante (F5):** não pode ser separado do e-mail em geral, porque não dá para saber antes quem
     vai escrever. O e-mail também é o canal de contato obrigatório no rodapé (Decreto 7.962/2013, art. 2º). Por isso,
     **não há versão do site sem ele**. A alternativa mínima é a **publicação institucional com o e-mail como canal de
     contato** (a configuração atual), com o F5 registrado como pendência em aberto e uma das rotas do item 2 decidida
     pela titular.
   - **Reunião pelo Teams (F6):** sem o Bookings, o site não a descreve. Alternativa mínima, **sem código**: na V1,
     atender só por e-mail, sem reunião pelo Teams, até que o aviso a descreva. Se a titular preferir manter as
     reuniões, o aviso precisa de nova redação (PUB-09 e PUB-17).

## 8. Estado final de F2 a F5 para a publicação (10/11/2026)

Decisões preservadas:
- a de 06/11/2026: aceitar o risco não substitui o requisito legal de uma transferência efetiva;
- nenhum mecanismo é dado como comprovado;
- a cl. 10 (50%) não está aprovada para uso contratual;
- o Bookings fica desligado na publicação inicial;
- desligar o Bookings **não elimina** os tratamentos no Microsoft 365, porque o e-mail continua.

O **Customer Lockbox não é mecanismo jurídico** e não aparece abaixo como tal.

| Fluxo | Tecnicamente demonstrado | Permanece incerto | Depende de informação do fornecedor | O que impediria o uso do fluxo |
|---|---|---|---|---|
| **F2**: entrega das páginas (CloudFront) | Arquivos em `sa-east-1`; `PriceClass_All` com os pontos da América do Sul habilitados; nenhuma guarda na entrega (auditoria 42809550459) | Qual ponto atende cada visitante no Brasil; se a leitura de coleta internacional vale para o visitante no exterior | AWS: entidade contratante da conta (fatura); onde ficam os pontos que atendem o Brasil | Comprovar que acessos do Brasil são atendidos no exterior **sem** mecanismo válido. A base é o art. 7º, IX, que o art. 33, IX, não cobre |
| **F3**: registros de acesso | Bucket privado em `sa-east-1`; só 5 campos; expiração em 190 dias; entrega real (E4). A região da API (`us-east-1`) é só o plano de controle e **não** foi tratada como transferência | O caminho dos registros entre o ponto de presença e o bucket; o acesso de suporte | AWS: o trajeto dos dados do logging v2; a entidade contratante; a adoção das CPC | Comprovar uma transferência a que o art. 33, IX (com o art. 7º, II), não se aplique, sem outro mecanismo. Como a guarda é obrigatória (Marco Civil, art. 15), a saída seria mudar o local ou o meio da guarda, não desligá-la |
| **F4**: e-mail, quem contrata em nome próprio | Exchange em repouso em Brasil/Brasil (E3); MX, SPF e DMARC (06/11) | Processamento da proteção do Exchange Online ("sem compromisso"); acesso de suporte; subprocessadores | Microsoft: local efetivo desse processamento; política de acesso de suporte; lista de subprocessadores por serviço; adoção das CPC | Comprovar uma transferência sem que a necessidade do art. 33, IX (com o art. 7º, V), se sustente, e sem outro mecanismo |
| **F5**: e-mail, representante de empresa | Igual ao F4 | Igual ao F4. **Não há candidato** a mecanismo: o art. 33, IX, não cobre o art. 7º, IX | Microsoft: oferta e assinatura das CPC da Res. 19/2024 ou de cláusulas específicas | **Já hoje:** se uma transferência efetiva se confirmar, não existe mecanismo, e o atendimento por e-mail de representantes não teria fundamento. Hoje a transferência efetiva **não está comprovada**, e a ausência dela também não |

**Reuniões pelo Teams (F6):**
- **Desligado no lançamento:** o atendimento inicial é por e-mail e LinkedIn, e o site **não anuncia** reuniões pelo Teams. O botão "Agendar conversa", os itens [PV-06] e [PV-11] e as frases sobre o Bookings e o Teams **não aparecem** sem a URL do Bookings. A homologação confirmou: 0 botões, 0 links e nenhum item de reunião.
- **O que fica:** o item "Reuniões e acompanhamento conforme as condições acordadas" (CO-05) é sobre o acompanhamento depois da contratação e não cita o Teams.
- **Para voltar a ter reuniões pelo Teams:** nova redação do aviso, depois nova aprovação (PUB-09 e PUB-17).
