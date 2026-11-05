# NEKKORA-COM-LEGAL-BASE-001 — Revisão legal interna para a publicação inicial

**Data de referência:** 05/11/2026 · **Base:** `main` após o merge do PR #14 (`e9bb413`) · **Branch:** `feat/legal-base-001`

> **Não é parecer jurídico.** É uma revisão interna feita pelo agente sobre o texto vigente das normas, consultado nas
> fontes oficiais em 05/11/2026. **Não afirma conformidade integral**, não substitui evidências que ainda não existem e
> **não equivale a revisão por advogado(a)**. A titular **adiou temporariamente** essa revisão, mas não dispensou as
> obrigações legais. A revisão externa continua pendente. Nenhuma aprovação foi marcada: `condicoesComerciais`,
> `avisoDePrivacidade` e `publicacao` continuam `false`, e o portão continua bloqueando.

**Legenda (usada em todo o relatório):**
**[N] Norma:** obrigação ou faculdade expressa na fonte oficial ·
**[I] Interpretação:** conclusão fundamentada que pode depender do caso concreto ·
**[D] Diretriz da titular:** decisão comercial expressa ·
**[P] Proposta do agente:** sugestão que ainda precisa de confirmação ·
**[E] Evidência operacional:** comportamento efetivamente testado ·
**[!] Pendência:** informação, controle ou validação ainda não comprovados.

---

## 1. Resultado em uma página

| Grupo | Itens | Efeito |
|---|---|---|
| **Impeditivos da publicação** (o site não deve ir ao ar sem eles) | R-01 endereço do fornecedor (PUB-22) · R-04 transferência internacional sem mecanismo verificado (JUR-07) · R-06 registros de acesso (Marco Civil, art. 15): decidir · R-13 texto real do Bookings (OPS-02) · R-14 teste de recebimento do `contato@` (REP-04) · R-03 **nova aprovação dos textos** alterados nesta missão (PUB-17) · aprovações já pendentes (PUB-09, PUB-19, PUB-18, PUB-10) | O portão bloqueia: PUB-09, PUB-10, PUB-18 e PUB-19. **PUB-22** foi preenchido pela titular em 05/11/2026 (§3.1, item 8) |
| **Corrigido nesta missão** | R-02 nome empresarial e CNPJ no rodapé (Decreto 7.962/2013, art. 2º, I) · R-03 o aviso dizia que a conversa "pode ser gravada", mas não há gravação nesta fase | Site alterado; homologação no navegador aprovada (§7) |
| **Antes da primeira contratação** (não impede o site) | Condições comerciais C-01 a C-12: arrependimento, retenção, garantia, propriedade intelectual, prazos | Minuta revisada e [proposta-modelo](../comercial/proposta-modelo-delivery.md) criada; decisão da titular |
| **Antes de qualquer gravação futura** | JUR-10, OPS-05 a OPS-08, CTL-01 | Fora do lançamento: sem gravação nesta fase |

---

## 2. Fontes oficiais consultadas (05/11/2026)

O texto vigente foi lido nas páginas compiladas. Os trechos citados estão nas minutas e neste relatório. Observações de
acesso: `https://www.planalto.gov.br` recusou conexões HTTPS neste ambiente; as mesmas páginas foram lidas em
`https://planalto.gov.br` (sem `www`) ou `http://www.planalto.gov.br`, com conteúdo idêntico.

| Norma | Dispositivos usados | URL oficial | Observação de vigência |
|---|---|---|---|
| CDC — Lei 8.078/1990 | arts. 2º, 3º, 6º (III, IV, VIII), 20, 24, 25, 26, 29, 30, 31, 35, 39 (I, V, VI, XII), 40, 46, 47, 49, 50, 51 (I, II, IV, XI, XV, §1º), 52 §1º, 54 §§3º e 4º | https://planalto.gov.br/ccivil_03/leis/l8078compilado.htm | Texto compilado. Art. 6º, III, com redação da Lei 12.741/2012; art. 52, §1º, da Lei 9.298/1996 |
| Código Civil — Lei 10.406/2002 | arts. 113, 412, 413, 421, 421-A, 422, 423, 424, 427, 473, 475, 476, 477, 593, 594, 597, 603, 607, 610, 614, 615, 616, 623, 624, 966, 1.142 | https://planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm (conferida com `l10406.htm`) | Arts. 113 §§, 421 e 421-A pela Lei 13.874/2019; art. 1.142 §§ pela Lei 14.382/2022. O endereço `l10406compilado.htm` não existe (404) |
| Lei do Software — Lei 9.609/1998 | arts. 1º, 2º, 4º, 5º, 6º, 9º, 10, 11 | https://planalto.gov.br/ccivil_03/leis/l9609.htm | Sem marcas de alteração; o Planalto não publica versão compilada |
| Decreto 7.962/2013 | arts. 1º a 7º | https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm | Sem marcas de alteração. No art. 4º, VI, a página traz "referidas no inciso ," sem o número do inciso |
| LGPD — Lei 13.709/2018 | arts. 5º, 6º, 7º, 9º, 10, 15, 16, 18, 19, 33 a 38, 41, 46, 48, 50, 52, 55-J XVIII | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm | Alterada pelas Leis 13.853/2019 e **15.352/2026** (esta mudou o art. 5º, VIII e XIX, e transformou a ANPD em "Agência Nacional de Proteção de Dados"). [!] A Lei 15.352/2026 em si não foi lida; só as marcas no texto compilado |
| Marco Civil — Lei 12.965/2014 | art. 5º, VII e VIII; art. 15 | https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm | Valem os textos originais (a MP 1.068/2021 foi rejeitada) |
| Res. CD/ANPD nº 2/2022 | Anexo, arts. 1º a 16 | https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022 | "Vigente com alterações pela Res. CD/ANPD nº 15/2024" (só o art. 14, II). A Res. 18/2024 (encarregado) remete ao art. 11, sem alterá-lo |
| Res. CD/ANPD nº 19/2024 | Resolução, art. 2º, parágrafo único; Anexo I, arts. 1º, 6º, 9º, 16, 17, 18, 20, 21 | https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024 | "Vigente com as alterações da retificação de 18/08/2025" (só uma remissão no Anexo II) |
| Res. CD/ANPD nº 32/2026 | arts. 1º, 2º, 4º, 5º | https://www.in.gov.br/web/dou/-/resolucao-n-32-de-26-de-janeiro-de-2026-683334547 | Adequação da UE e do EEE (art. 33, I) |
| Res. CD/ANPD nº 18/2024 | Anexo, arts. 3º §3º e 9º | https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-18-de-16-de-julho-de-2024-572632074 | Vigente |

**Documentos de provedores (não são normas; servem como evidência do que está publicado):**

| Documento | URL | O que diz (05/11/2026) |
|---|---|---|
| Microsoft Products and Services DPA ("Last updated November 1, 2026") | https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA | Não menciona Brasil, ANPD nem LGPD. As transferências tratadas são as que saem da UE, do EEE, do Reino Unido e da Suíça |
| Microsoft PO Terms para fornecedores, Brasil (set./2026) | https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/accex/documents/presentations/PO-Terms-and-Conditions_en-BR.pdf | Incorpora as CPC da Res. 19/2024, mas **só para os fornecedores da Microsoft**, não para clientes de nuvem |
| AWS Data Processing Addendum (PDF sem data visível) | https://d1.awsstatic.com/legal/aws-dpa/aws-dpa.pdf | Não menciona ANPD nem LGPD; as SCCs valem para dados sujeitos ao GDPR |
| AWS "Brazil Data Privacy" | https://aws.amazon.com/compliance/brazil-data-privacy/ | Diz que o DPA "meets the requirements of LGPD", sem citar as CPC |

Não foi usada jurisprudência nem orientação de autoridade que não esteja nesta tabela.

---

## 3. Achados por tema

### 3.1 Identificação do fornecedor e oferta eletrônica

| # | Tipo | Achado |
|---|---|---|
| 1 | [N] | Decreto 7.962/2013, art. 2º: o site usado para **oferta** de contrato de consumo deve exibir, "em local de destaque e de fácil visualização": I nome empresarial e CNPJ; II **endereço físico e eletrônico**; III características essenciais; IV despesas adicionais; V condições integrais da oferta (pagamento, disponibilidade, forma e prazo de execução); VI restrições à fruição |
| 2 | [I] | O site **oferta** serviços com preço a um público que inclui consumidores (CDC arts. 2º e 29). Mesmo sem contratação online, o art. 2º se aplica, porque menciona "oferta **ou** conclusão" |
| 3 | [E] | Antes: nome empresarial e CNPJ só na descrição do aviso de privacidade; rodapé "© Nekkora". **Agora:** rodapé com "NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA · CNPJ 68.337.624/0001-32 · contato@nekkora.com" (homologação `rodape-identificacao-do-fornecedor`) |
| 4 | [!] | **Endereço físico: ausente** na primeira versão desta revisão (ver item 8). Criado `publicacao.json → fornecedor.endereco: null` e item **PUB-22** no portão. O agente **não** inventou nem pesquisou endereço |
| 5 | [N] | CC art. 1.142, §§1º e 2º: o estabelecimento pode ser virtual, e nesse caso o endereço de registro pode ser o de um dos sócios |
| 6 | [I]/[P] | Alternativas para a titular decidir: (a) publicar o endereço da sede **tal como registrado no CNPJ**, que já é público na Receita Federal; se for residencial, a decisão precisa ser consciente; (b) contratar endereço comercial (escritório virtual ou coworking) e **atualizar o registro**. Antes da atualização, publicar endereço diferente do registrado tem risco de não ser considerado "informação necessária para sua localização"; (c) não publicar e não lançar: o portão bloqueia. Nenhuma alternativa dispensa o requisito |
| 8 | [D]/[E] | **Atualização (05/11/2026):** a titular informou o endereço com base no cartão CNPJ (alternativa (a)): `Rua Pais Leme, 215, Conjunto 1713, Pinheiros, São Paulo/SP, CEP 05424-150`, endereço de escritório virtual. Preenchido em `fornecedor.endereco`; o rodapé mostra o endereço sem sugerir atendimento presencial (homologação `rodape-sem-atendimento-presencial`). O agente não conferiu o cartão CNPJ: a correspondência é declaração da titular |
| 7 | [E] | Art. 2º, III a VI: características (cartões, critérios de categoria, Transparência), despesas adicionais ("licenças e custos externos… não incluídos"), pagamento 50% + 50%, restrições ("conforme a categoria definida na avaliação"; a complexa sob orçamento). O **prazo de execução** não é publicado: é definido na proposta |
| 8 | [I] | Pelo art. 2º, V, "forma e prazo da execução do serviço" integram as condições da oferta. Para serviço sob encomenda, o prazo depende da avaliação. O site já diz que o prazo é "definido em proposta" (Transparência). Risco **baixo**, desde que a proposta o fixe (C-12) |
| 9 | [N] | Art. 4º: sumário do contrato antes da contratação, confirmação imediata do aceite, contrato em meio conservável, atendimento eletrônico e resposta **em até 5 dias** (parágrafo único). Art. 5º: meios para o arrependimento |
| 10 | [P] | Tudo isso é atendido na contratação por e-mail pela [proposta-modelo](../comercial/proposta-modelo-delivery.md) (§8 arrependimento, §12 aceite) e pelo controle CTL-06 do [procedimento](../comercial/procedimento-retencao-e-direitos.md) |

### 3.2 Condições comerciais (PUB-19)

Detalhe completo, com norma, interpretação e proposta por item: [`condicoes-comerciais-minuta.md` §9](../comercial/condicoes-comerciais-minuta.md).
Síntese dos conflitos entre diretriz e norma:

| Diretriz [D] | Norma [N] | Conflito? | Alternativa [P] |
|---|---|---|---|
| "Retenção dos 50% iniciais" após a homologação, se houver desistência | CDC art. 51, II e IV; CC arts. 412, 413 e 476 | **Sim, na redação.** "Retenção" pode ser lida como penalidade ou perda automática | C-04: os valores remuneram o serviço prestado; nada de retenção como penalidade |
| Cancelamento durante o desenvolvimento com "apuração proporcional" | CDC art. 51, IV; CC art. 623 | Risco se a apuração ficar a critério da Nekkora | C-03: marcos objetivos na proposta; sem multa |
| Garantia contratual "adicional" de 30 dias após a entrega | CDC arts. 26, II, e 50 | **Sim, para consumidor:** cabe dentro do prazo legal de 90 dias [I] e não acrescenta nada | C-07: contar depois do prazo legal, ou declarar o total |
| Modelo A (licença; a Nekkora mantém a titularidade) | Lei 9.609/1998, art. 4º ("salvo estipulação em contrário", os direitos são do contratante de serviços) | Afasta a regra supletiva. **Lícito com estipulação expressa** | C-09: Modelo A-R (código específico do cliente; componentes preexistentes da Nekkora, com licença ampla) |
| Direito de arrependimento: não previsto | CDC art. 49; Decreto 7.962, art. 5º | **Lacuna** | C-02: 7 dias, devolução integral; início depois do prazo |
| "O início depende da fila" | CDC arts. 39, XII, e 40 | Risco se a proposta não fixar datas | C-12: datas estimadas de início e término em cada proposta |
| 50% + 50%; entrega após a quitação; sem aceite tácito | CC art. 476; CDC art. 20 | Compatível, com ressalvas (C-05, C-06) | Defeito sempre corrigido; o prazo legal não depende da entrega definitiva |
| Campanha de 06/11/2026 a 06/01/2027 | CDC arts. 30, 31 e 35; Decreto 7.962, art. 2º, VI | Compatível | C-10: a oferta vincula; publicar a regra completa (exige nova aprovação de texto) |

[I] **B2B × CDC:** não se presume que toda empresa fique fora do CDC (arts. 2º e 29). O modelo é compatível com o CDC
por padrão, e as cláusulas só para contratação empresarial ficam no Anexo B da proposta (C-01).

### 3.3 Privacidade (PUB-09)

Detalhe: [`privacidade-minuta.md`](../comercial/privacidade-minuta.md) §1, §2, §5.1, §6 (inventário) e §7 (pequeno porte).

| # | Tipo | Achado |
|---|---|---|
| 1 | [D] | **Sem gravação comercial nesta fase** (diretriz desta missão). Ela substitui a decisão da COM-PRIVACY-001 ("pode ser gravada") |
| 2 | [N]/[E] | LGPD art. 6º, VI, e art. 9º: informação clara e precisa sobre o tratamento **realizado**. O aviso dizia "pode ser gravada" e citava o "prazo padrão de 30 dias das gravações". **Corrigido:** item "Conversa sem gravação" e frase das gravações retirada da retenção (homologação `privacidade-sem-gravacao`) |
| 3 | [!] | A política do Teams `Nekkora-Commercial` **ainda permite** gravar com concordância. Desligar a gravação ou manter a regra só operacional é decisão da titular (CTL-01). O agente não alterou o M365 |
| 4 | [N]/[I] | Art. 7º, V, exige que o titular seja **parte** do contrato. Para representante de empresa, a base candidata é o art. 7º, IX (com art. 10 e registro). Proposta de texto na minuta §2, **não aplicada** (alteraria texto aprovado) |
| 5 | [N]/[!] | Transferência internacional: art. 33; Res. 19/2024 (CPC adotadas integralmente; transparência do art. 17, §2º); nenhuma equivalência de cláusulas estrangeiras; a UE é adequada (Res. 32/2026). **Microsoft e AWS não publicam adoção das CPC brasileiras para clientes** (§2). **Região do tenant e dos serviços: não verificada.** Ter contrato com provedor estrangeiro **não demonstra**, por si só, cumprimento da Res. 19/2024 |
| 6 | [N]/[I] | Agente de pequeno porte (Res. 2/2022): provável (LTDA; sem alto risco pelos critérios do art. 4º), mas **a titular precisa confirmar** a receita e o grupo econômico. Dispensa do encarregado (art. 11) **com canal obrigatório** (§1º): `contato@nekkora.com`. Prazo em dobro (art. 14) é limite, não meta |
| 7 | [N]/[I] | **Marco Civil, art. 15:** provedor de aplicações de internet constituído como pessoa jurídica, com atividade organizada, profissional e com fins econômicos, **deve** manter registros de acesso a aplicações por **6 meses**. [I] Um site comercial de pessoa jurídica é "aplicação de internet" (art. 5º, VII), e a aplicação do art. 15 a site institucional estático não foi afastada por nenhuma fonte consultada. [E] **Os logs do CloudFront estão desativados** (COM-RELEASE-003-aws: "WAF / logs: desativados"). Ver R-06 |
| 8 | [E] | Retenção: revisão **manual**, não automática. O aviso descreve prazos e não promete eliminação. [!] Itens recuperáveis do M365 e exclusão de reservas do Bookings não verificados (OPS-09, OPS-10) |

### 3.4 Controles operacionais

[`procedimento-retencao-e-direitos.md`](../comercial/procedimento-retencao-e-direitos.md): revisão mensal com corte de
**5 meses** para contatos e **60 dias** para reservas. Com intervalo de no máximo 30 dias entre revisões, nenhum item
passa de 6 meses ou 90 dias. O procedimento também traz: registro sem dados pessoais, pedidos dos titulares (art. 18 e
19), conferência do texto real do Bookings (CTL-03), confirmação de que não há gravação (CTL-01), data de recebimento da
campanha (CTL-04), teste externo do `contato@` (CTL-05) e resposta em até 5 dias (CTL-06).

---

## 4. Matriz de riscos

Severidade: **A** alta · **M** média · **B** baixa. "Impede publicação?" = o site não deve ir ao ar sem tratar o item.

| ID | Risco | Fonte | Sev. | Impede publicação? | Situação | Quem decide |
|---|---|---|---|---|---|---|
| R-01 | Endereço físico do fornecedor ausente | Decreto 7.962, art. 2º, II | A | ~~Sim~~ | **Resolvido**: endereço informado pela titular em 05/11/2026 (cartão CNPJ); entra na nova aprovação dos textos (R-03) | Titular |
| R-02 | Nome empresarial e CNPJ fora de local de destaque | Decreto 7.962, art. 2º, I | M | — | **Corrigido** (rodapé) | — |
| R-03 | Aviso dizia "pode ser gravada" sem gravação nesta fase; textos aprovados alterados | LGPD arts. 6º, VI, e 9º | M | **Sim** (nova aprovação) | **Corrigido no site**; `textosComerciais` **continua `true`** e precisa de nova decisão | Titular |
| R-04 | Transferência internacional sem mecanismo verificado e sem regiões confirmadas | LGPD art. 33; Res. 19/2024; Res. 32/2026 | A | **Sim** (para o aviso) | Pendente (JUR-07) | Titular + revisão |
| R-05 | Art. 7º, V, para representante de empresa | LGPD arts. 7º, V e IX, e 10 | M | Não | Proposta de texto; decisão | Titular |
| R-06 | Sem registros de acesso por 6 meses | Marco Civil art. 15 | A [I] | **Decidir antes** | Logs desativados | Titular: (a) ativar os logs padrão do CloudFront num bucket em `sa-east-1`, com acesso restrito, ciclo de vida de 6 meses e item no aviso (mudança na AWS, **não feita**); ou (b) registrar, com fundamento, por que o art. 15 não se aplicaria |
| R-07 | Regra da campanha resumida | CDC arts. 30 e 31; Decreto art. 2º, V e VI | M | Recomendado | Proposta C-10 (exige nova aprovação de texto) | Titular |
| R-08 | Condições sem arrependimento, com "retenção", garantia sobreposta e PI sem cláusula | CDC arts. 49, 50, 51; Lei 9.609 art. 4º | A | Não (impede a **1ª contratação**) | C-01 a C-12 propostas | Titular |
| R-09 | Exigências do Decreto 7.962, art. 4º, na contratação por e-mail | Decreto art. 4º | M | Não | Proposta-modelo + CTL-06 | Titular |
| R-10 | Enquadramento como agente de pequeno porte não confirmado | Res. 2/2022, arts. 2º, 3º e 5º | B | Não | Pendente (JUR-08) | Titular |
| R-11 | Eliminação manual sem comprovação de efeito no M365 | LGPD arts. 15 e 16 | M | Não | OPS-09, OPS-10 | Titular |
| R-12 | Política do Teams ainda permite gravar | LGPD art. 6º, VI | M | Não (se a regra for cumprida) | CTL-01 | Titular |
| R-13 | Texto real do Bookings diferente do aviso | LGPD arts. 6º, VI, e 9º | A | **Sim** (para o aviso) | OPS-02 / CTL-03 | Titular |
| R-14 | Caixa `contato@` sem teste externo de recebimento | Decreto 7.962, art. 2º, II, e art. 4º, V | A | **Sim** | REP-04 / CTL-05 | Titular |
| R-15 | Revisão por advogado(a) adiada | — | M | Decisão da titular | **Adiada pela titular**, não dispensada | Titular |
| R-16 | Lei 15.352/2026 não lida na íntegra | LGPD | B | Não | Nenhum efeito encontrado nos dispositivos usados | — |

---

## 5. Matriz JUR-01 a JUR-10 (atualizada)

| ID | Tema | Revisão interna (LEGAL-BASE-001) | Situação |
|---|---|---|---|
| JUR-01 | Pagamento 50% + 50%, entrega após a quitação, atraso, nota fiscal | Compatível com o CC art. 476, com as ressalvas C-05. Atraso: C-11 (2% + 1% a.m., conservador). Nota fiscal: fora do escopo | Propostas; **decisão da titular** + advogado(a) |
| JUR-02 | Homologação sem aceite tácito | C-06: prazo de 10 dias úteis, 2 lembretes, suspensão; defeito sempre corrigido | Propostas; decisão |
| JUR-03 | Cancelamento, reembolso, arrependimento, retenção | C-02 (arrependimento), C-03 (marcos), C-04 (sem "retenção"). **A diretriz da retenção conflita na redação** | Propostas; decisão |
| JUR-04 | Garantia de 30 dias e garantias legais | C-07: a garantia de 30 dias cabe dentro do prazo legal (interpretação: serviço durável, 90 dias) | Propostas; decisão |
| JUR-05 | Propriedade intelectual e dados do cliente | C-09: Modelo A-R e cláusula 9.2. A cláusula de operadora (LGPD art. 39) **continua sem redação** | Parcial; decisão |
| JUR-06 | Base legal do atendimento; ciência × consentimento | Art. 7º, V, para o contratante; IX para o representante (proposta de texto não aplicada). Ciência no Bookings mantida | Proposta; decisão |
| JUR-07 | Transferência internacional | Sem CPC verificável da Microsoft ou da AWS; nenhuma equivalência estrangeira; UE adequada; regiões não confirmadas; transparência do art. 17, §2º, se houver CPC | **Pendente, impede a aprovação do aviso** |
| JUR-08 | Pequeno porte e encarregado | Provável enquadramento; dispensa com canal; prazo em dobro; registro simplificado | Depende de a titular confirmar ME/EPP e a receita |
| JUR-09 | Identificação do fornecedor; oferta vinculante | Nome, CNPJ e endereço no rodapé (endereço informado pela titular em 05/11/2026, PUB-22); oferta da campanha vincula (C-10) | Atendido no site, sujeito à nova aprovação dos textos |
| JUR-10 | Gravação de reuniões | **Fora do lançamento:** sem gravação nesta fase. Volta a ser necessária antes de qualquer gravação | Adiada (não se aplica ao lançamento) |

---

## 6. Separação pedida na missão

**Impede a publicação do site:** ~~R-01~~ (resolvido em 05/11/2026), R-03 (nova aprovação), R-04, R-06 (decisão), R-13, R-14 e as aprovações já
pendentes (PUB-09, PUB-10, PUB-18, PUB-19).

**Específico de futuras contratações (não impede o site, impede a 1ª proposta):** C-01 a C-12, a cláusula de operadora
(JUR-05), a forma do aceite (assinatura eletrônica ou e-mail), a nota fiscal.

**Específico de futuras gravações:** JUR-10, OPS-05 a OPS-08, CTL-01, novo texto do aviso e do Bookings, nova
aprovação.

---

## 7. O que foi alterado e como foi verificado

| Arquivo | Alteração | Fundamento |
|---|---|---|
| `src/content.ts` (`FOOTER.supplier`), `src/sections/Footer.tsx`, `src/styles.css` | Linha de identificação no rodapé: nome empresarial, CNPJ, endereço (quando houver) e e-mail, lidos de `publicacao.json` | Decreto 7.962, art. 2º, I e II |
| `src/content.ts` (`PRIVACY`) | "Gravação da conversa" → **"Conversa sem gravação"**; frase das gravações retirada de "Por quanto tempo guardamos" | LGPD arts. 6º, VI, e 9º; diretriz da titular |
| `src/config.ts`, `src/publicacao.d.ts`, `publicacao.json` | `fornecedor.endereco` (+ `$origem`) e `SUPPLIER_ADDRESS`. Primeiro `null`; depois preenchido com o endereço informado pela titular (05/11/2026, cartão CNPJ) | Nenhum endereço presumido pelo agente |
| `scripts/verificar-publicacao.mjs` | Novo item **PUB-22** (endereço comercial) | Atendido depois que a titular informou o endereço; o portão continua bloqueado pelos demais itens |
| `scripts/homologacao.mjs` | Verificações `privacidade-sem-gravacao`, `rodape-identificacao-do-fornecedor` e `rodape-sem-atendimento-presencial` | Evidência no navegador |
| Testes | `verificar-publicacao.test.mjs` (PUB-22 no versionado + 3 casos), `simulador.test.mjs` (endereço informado pela titular) | — |
| `docs/com-001/05-texto-comercial.md`, `docs/release/com-release-005/texto-com-envio-automatico-e-bookings.md` | Regenerados com `npm run texto` | Gerados do código |
| Docs | Este relatório; minutas de condições (§9) e de privacidade; [proposta-modelo](../comercial/proposta-modelo-delivery.md); [procedimento](../comercial/procedimento-retencao-e-direitos.md); pendências | — |

**Não alterado:** preços, campanha, funcionalidades, simulador, formulário, aprovações, aviso de homologação,
infraestrutura (AWS, DNS, Microsoft 365). Nenhum deploy, nenhuma gravação, nenhum envio por API.

Evidências de execução: ver a descrição do PR (`npm test`, `npm run check`, homologação no navegador).

---

## 8. Decisões que dependem da titular

1. ~~**Endereço comercial** (R-01/PUB-22)~~: **decidido** em 05/11/2026 (endereço do cartão CNPJ, §3.1, item 8).
2. **Nova aprovação dos textos** (R-03/PUB-17): rodapé com identificação e endereço, item "Conversa sem gravação" e retenção sem
   gravações. Enquanto não houver nova decisão, `textosComerciais: true` corresponde ao texto **anterior**.
3. **Registros de acesso** (R-06): ativar os logs do CloudFront por 6 meses ou registrar a conclusão contrária.
4. **Transferência internacional** (R-04): confirmar as regiões e escolher um mecanismo por provedor.
5. **Política do Teams** (CTL-01): desligar a gravação ou manter a regra só operacional.
6. **Condições comerciais**: C-01 a C-12, em especial a C-07 (garantia), a C-09 (Modelo A-R ou A) e a C-04 (fim da "retenção").
7. **Base legal para representantes** (R-05) e **regras da campanha** (C-10): os dois exigem texto novo e nova aprovação.
8. **Enquadramento como agente de pequeno porte** (JUR-08).
9. **Quando fazer a revisão por advogado(a)**, que continua pendente.
