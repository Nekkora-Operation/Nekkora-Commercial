# Anexo de Componentes e propriedade intelectual — Nekkora Delivery (minuta)

> **MINUTA NÃO APROVADA. Não é parecer jurídico.** NEKKORA-COM-CONTRACT-001 (06/11/2026), diretriz **C-09** (Modelo
> **A-R** aprovado pela titular). Integra o [contrato-base](contrato-base-delivery.md), cláusula 14. **Cada proposta
> traz este anexo preenchido** (§3). Marcadores como no contrato-base.

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
> (7) **Antes da quitação** a automação só é usada para homologação; na desistência antes da conclusão nada é entregue
> e nenhum direito é transferido.
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
