# Anexo de Componentes e propriedade intelectual — Nekkora Delivery (minuta)

> **MINUTA NÃO APROVADA. Não é parecer jurídico.** NEKKORA-COM-CONTRACT-001 (06/11/2026), diretriz **C-09** (Modelo
> **A-R** aprovado pela titular). Integra o [contrato-base](contrato-base-delivery.md), cláusula 14. **Cada proposta
> traz este anexo preenchido** (§3). Marcadores como no contrato-base.
>
> **[COM-VITRINE-001](../release/COM-VITRINE-001.md) (etapa 6, 11/11/2026):** o site apresenta o Modelo A-R como "**A automação é sua**" (V-05),
> com as mesmas exceções. Nova §4: direitos de uso por tipo de componente. **LIC-02 continua pendente**: nenhuma
> titularidade irrestrita de bibliotecas, frameworks ou componentes reutilizáveis é prometida.

## 1. Situação das licenças existentes — verificada em 06/11/2026

| Componente | Repositório | Licença efetiva hoje | Consequência |
|---|---|---|---|
| Nekkora RPA Framework | `Nekkora-Operation/Nekkora-RPA-Framework` (público) | Arquivo `LICENSE`: "Todos os direitos reservados. [...] publicado para consulta. Nenhuma licença de uso, cópia, modificação ou distribuição é concedida até que a Nekkora defina formalmente o licenciamento do projeto." GitHub: `NOASSERTION` | **Repositório público não é software livre nem aberto.** Quem recebe uma automação que usa o Framework **só pode usá-lo pela licença concedida neste contrato** (§2, item 3) |

**[!] LIC-01 — decisão da titular, separada desta missão:** licenciamento público do Framework. A licença não foi
alterada.

**[!] LIC-02 — cadeia de titularidade:** o `LICENSE` identifica o titular como "Nekkora" (marca), não como a pessoa
jurídica. Para a Nekkora (LTDA) conceder a licença do §2, item 3, é preciso confirmar que ela **é a titular** dos
direitos sobre o Framework e os demais componentes preexistentes, ou que tem **autorização para licenciá-los**
(ex.: cessão ou licença da pessoa física autora). ⚖ Impede a primeira contratação que inclua componente preexistente.

## 2. Cláusula de propriedade intelectual (Modelo A-R) **[R]** sobre **[D]**

> (1) **Código Específico.** Os direitos sobre o código-fonte e a documentação desenvolvidos especificamente para o
> CONTRATANTE nesta proposta pertencem ao CONTRATANTE **a partir da quitação integral** do preço. **[N]** Lei
> 9.609/1998, art. 4º (conferida na LEGAL-BASE-001).
>
> (2) **Componentes Preexistentes.** Continuam pertencendo aos respectivos titulares os programas, bibliotecas,
> frameworks e ferramentas listados neste anexo, criados antes da proposta ou independentemente dela, sem recursos ou
> informações do CONTRATANTE, entre eles o Nekkora RPA Framework, Studio, Agent e Platform (art. 4º, §2º).
>
> (3) **Licença ao CONTRATANTE.** Para os Componentes Preexistentes da Nekkora incorporados à entrega, a Nekkora
> concede licença **não exclusiva, gratuita, sem limite de prazo e irrevogável após a quitação** para usar, reproduzir
> e modificar esses componentes **na medida necessária para operar, manter e corrigir a automação entregue**, diretamente
> ou por **outro desenvolvedor que o CONTRATANTE contratar**, vedadas a exploração comercial separada e a
> sublicença fora dessa finalidade. Esta licença existe **independentemente** do licenciamento público do repositório
> (§1). **[!]** Depende de LIC-02.
>
> (4) **Componentes de terceiros** seguem as licenças de seus titulares, indicadas neste anexo; a Nekkora não concede
> direitos que não tem.
>
> (5) **Exclusividade do Código Específico.** A Nekkora **não revende, não sublicencia e não reutiliza** o Código
> Específico em outra entrega sem autorização escrita do CONTRATANTE.
>
> (6) **Trabalhos independentes.** A Nekkora pode desenvolver automações **independentes** para outros clientes sobre o
> mesmo sistema ou com finalidade semelhante, **sem copiar** o Código Específico, dados, credenciais ou informações
> confidenciais do CONTRATANTE. A finalidade semelhante não cria exclusividade sobre a automação daquele sistema.
> *Exemplo: clientes diferentes podem contratar automações para o ReceitaNet BX; cada implementação específica
> continua protegida.*
>
> (7) **Antes da quitação** a automação só é usada para homologação; na desistência antes da conclusão ou durante a
> homologação (contrato-base, cláusulas 9 e 10), nada é entregue e nenhum direito é transferido.
>
> (8) **Manutenção por terceiros.** O CONTRATANTE pode contratar outro desenvolvedor para manter o Código Específico. A
> Nekkora **não oferece alocação permanente** de profissionais no modelo Delivery.

**[D]** O futuro portal de demandas por assinatura é **apenas planejamento** e não é mencionado em proposta nem no
site como funcionalidade.

**[R]** Prática interna para sustentar o item (6): repositório separado por cliente; sem cópia de código entre
repositórios de clientes; credenciais e dados de um cliente nunca usados em outro projeto.

## 3. Modelo do anexo (preencher por proposta)

| Componente | Versão | Tipo | Titular | Licença ao CONTRATANTE | Onde está na entrega |
|---|---|---|---|---|---|
| `{{automação}}` — código específico | — | Código Específico | CONTRATANTE, após a quitação | Titularidade (item 1) | `{{repositório/pasta}}` |
| Nekkora RPA Framework | `{{x.y.z}}` | Preexistente Nekkora | `{{titular confirmado — LIC-02}}` | Item 3 | `{{dependência}}` |
| `{{biblioteca de terceiro}}` | `{{…}}` | Terceiro | `{{…}}` | `{{licença, ex.: MIT}}` | `{{…}}` |
| `{{licença comercial: UiPath, Power Automate…}}` | — | Serviço de terceiro | `{{fornecedor}}` | Contratada pelo CONTRATANTE (contrato-base 4.4) | — |

## 4. Direitos de uso por tipo de componente ([COM-VITRINE-001](../release/COM-VITRINE-001.md) §6) **[R]** sobre **[D]**

Texto do site (V-05): *"O código-fonte, a documentação e os artefatos desenvolvidos especificamente para você e
contratados passam a ser seus conforme o contrato e após a quitação integral. Bibliotecas, frameworks e componentes
preexistentes da Nekkora, componentes reutilizáveis e tecnologias de terceiros continuam com seus titulares e são
licenciados para que você possa usar, manter e executar a automação, nas condições de cada licença."*

| Tipo | Titular | O que o CONTRATANTE recebe | Base |
|---|---|---|---|
| Código Específico, documentação e artefatos feitos para o CONTRATANTE | CONTRATANTE, após a quitação integral (no pacote: DP-05) | Titularidade | §2, item 1 |
| Componentes preexistentes da Nekkora (ex.: Nekkora RPA Framework) | Nekkora (**LIC-02**: confirmar a cadeia de titularidade) | Licença do §2, item 3: usar, reproduzir e modificar na medida necessária para operar, manter e corrigir | §2, itens 2 e 3 |
| Componentes reutilizáveis da Nekkora (rotinas e padrões genéricos usados em várias entregas) | Nekkora | A mesma licença do item 3, na mesma medida ⚖ (confirmar que a definição do §2, item 2 os alcança) | §2, item 3 |
| Bibliotecas e frameworks de terceiros (código aberto) | Seus titulares | A licença do próprio titular (ex.: MIT, Apache-2.0), listada no §3 | §2, item 4 |
| Ferramentas e serviços comerciais (UiPath, Power Automate, APIs pagas) | Fornecedor | Nada é transferido: contratação pelo CONTRATANTE | Contrato-base 4.4 |
| Studio, Agent e Platform | Nekkora | Nada: não fazem parte da entrega | §2, item 2 |

**[!]** Antes da primeira contratação que inclua componente preexistente: resolver a LIC-02 e conferir, na entrega, que
cada linha do §3 corresponde a um tipo desta tabela.
