# Proposta-modelo — Nekkora Delivery

> **MODELO NÃO APROVADO. Não é parecer jurídico.** Preparado na
> [NEKKORA-COM-LEGAL-BASE-001](../release/NEKKORA-COM-LEGAL-BASE-001.md) (05/11/2026) a partir das diretrizes da titular
> e das propostas de correção C-01 a C-12 de [`condicoes-comerciais-minuta.md` §9](condicoes-comerciais-minuta.md).
> Uso só depois da decisão da titular sobre as propostas e da aprovação das condições comerciais (PUB-19). A revisão por
> advogado(a) foi adiada pela titular e **continua pendente**. Os campos `{{…}}` são preenchidos em cada proposta.
> Nenhum dado real de cliente deve ser versionado neste repositório.
>
> Fica de fora deste modelo: cláusula de tratamento de dados do cliente (operadora, LGPD art. 39), confidencialidade e
> guarda de credenciais (JUR-05, AUD-21). Essas cláusulas precisam de redação própria antes da primeira contratação
> que envolva dados pessoais do cliente.

---

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| Fornecedor | NICOLLY OLIVEIRA DE CARVALHO DESENVOLVIMENTO DE SOFTWARE LTDA · CNPJ 68.337.624/0001-32 · `{{endereço comercial definido pela titular — PUB-22}}` · contato@nekkora.com |
| Cliente | `{{razão social ou nome}}` · `{{CNPJ/CPF}}` · `{{representante e e-mail}}` |
| **Natureza da relação** (C-01) | ☐ Consumidor (pessoa física, ou pessoa jurídica que contrata como destinatária final) · ☐ Contratação empresarial (o serviço integra a atividade produtiva do cliente). **Na dúvida, marcar "Consumidor".** As cláusulas do Anexo B só valem para contratação empresarial |
| Número e data de emissão | `{{NK-AAAA-NNN}}` · `{{DD/MM/AAAA}}` |
| **Data da solicitação** (campanha, OPS-03) | `{{data e hora de recebimento, horário de Brasília}}` · canal `{{e-mail / Bookings / LinkedIn}}` · referência `{{assunto ou identificador da mensagem}}` |
| Validade da proposta | `{{7 dias corridos da emissão, na campanha / N dias fora dela}}` (estipulação expressa; CDC art. 40, §1º) |

## 2. Escopo (uma seção por automação — C-08)

| Campo | Conteúdo |
|---|---|
| Automação | `{{nome}}` |
| Categoria | ☐ Simples ☐ Média ☐ Complexa. Critérios: sistemas, integrações, regras e exceções, volume, infraestrutura, licenciamento |
| Descrição do processo e resultado esperado | `{{…}}` |
| Sistemas e integrações | `{{…}}` |
| Fora do escopo | `{{…}}` (sustentação, novas funcionalidades e hosting dependem de proposta própria) |
| Responsabilidades do cliente | Acessos e credenciais, ambiente de homologação, equipe disponível para validar |
| **Critérios de aceite** | `{{lista objetiva e verificável}}` |

## 3. Preço e despesas

| Campo | Conteúdo |
|---|---|
| Preço por automação | `{{R$}}` (padrão) · `{{R$}}` (lançamento, se a data da solicitação estiver no período e a categoria for simples ou média) |
| Licenças e serviços de terceiros | `{{item · quem contrata · custo estimado}}`. **Custo de terceiro não previsto aqui não é cobrado sem nova aprovação** (CDC art. 40, §3º) |
| Tributos e nota fiscal | `{{…}}` ⚖ |

## 4. Prazo (C-12)

| Campo | Conteúdo |
|---|---|
| Início estimado | `{{DD/MM/AAAA ou N dias úteis após o pagamento da 1ª parcela}}`. **Cliente consumidor:** depois do fim do prazo de arrependimento (§8), salvo pedido expresso do cliente |
| Término estimado da disponibilização para homologação | `{{DD/MM/AAAA}}` |
| Alteração de prazo | Só por escrito, com motivo (dependência do cliente ou de terceiros, mudança de escopo) |

## 5. Pagamento (C-11)

| Parcela | Valor | Quando |
|---|---|---|
| 1ª | 50% · `{{R$}}` | Depois do aceite desta proposta, até `{{5 dias úteis}}` da cobrança |
| 2ª | 50% · `{{R$}}` | Depois da homologação concluída e do aceite formal, até `{{5 dias úteis}}` da cobrança |

Meio: Pix para a conta da empresa. Atraso: multa de `{{até 2%}}` e juros de `{{1% ao mês}}`.

## 6. Marcos (base do cancelamento — C-03)

| Marco | % do preço | Evidência de conclusão |
|---|---|---|
| M1 Levantamento documentado | `{{%}}` | Documento enviado ao cliente |
| M2 Desenvolvimento | `{{%}}` | Comunicação escrita de conclusão |
| M3 Testes técnicos | `{{%}}` | Relatório de testes |
| M4 Disponibilização para homologação | `{{%}}` | Comunicação escrita |

## 7. Homologação e aceite (C-06)

1. A Nekkora avisa por escrito quando a automação está disponível para homologação.
2. O cliente tem `{{10 dias úteis}}` para validar e registrar por escrito os defeitos encontrados.
3. **Defeito** é o descumprimento do escopo ou dos critérios de aceite, e é sempre corrigido sem custo. Ajustes de
   preferência dentro do escopo: até `{{2}}` rodadas.
4. **O silêncio não vale como aceite.** Sem manifestação, a Nekkora envia dois lembretes. Se continuar sem resposta, o
   projeto fica suspenso: a 2ª parcela não vence e a garantia contratual não começa.
5. O aceite formal é uma declaração expressa e por escrito do cliente.

## 8. Direito de arrependimento (cliente consumidor — C-02)

> Você pode desistir desta contratação em até **7 dias** contados do aceite, porque ela é feita fora de estabelecimento
> comercial (CDC, art. 49). Basta responder a este e-mail ou escrever para contato@nekkora.com. Os valores pagos serão
> devolvidos **integralmente e de imediato**, com atualização monetária. O desenvolvimento só começa depois desse
> prazo, salvo se você pedir por escrito que comece antes. Mesmo nesse caso, a desistência dentro do prazo dá direito à
> devolução integral.

## 9. Cancelamento (C-03, C-04)

| Momento | Regra |
|---|---|
| No prazo de arrependimento (consumidor) | Devolução integral e imediata (§8) |
| Antes do início do desenvolvimento | Devolução integral da 1ª parcela |
| Durante o desenvolvimento | O cliente paga os **marcos concluídos** (§6) e as despesas de terceiros comprovadas e previstas no §3, e recebe o saldo de volta. Sem multa |
| Depois da homologação concluída | O serviço foi prestado: os valores pagos remuneram o que foi feito. A entrega definitiva e os direitos do §11 dependem da quitação. Os vícios continuam garantidos |
| Descumprimento da Nekkora | O cliente pode exigir a correção, a devolução do que pagou ou o abatimento do preço (CDC art. 20), sem prejuízo de perdas e danos |
| Cancelamento pela Nekkora | Só nos casos previstos aqui, com o mesmo direito para o cliente (CDC art. 51, XI) |

## 10. Entrega definitiva e garantia (C-05, C-07)

1. Depois do aceite e da quitação, a Nekkora entrega o código, a documentação e o Anexo de Componentes.
2. **Garantias legais preservadas** (CDC arts. 24 a 26). Esta proposta não as reduz.
3. **Garantia contratual** (termo escrito, CDC art. 50): `{{opção escolhida pela titular em C-07 — ex.: 30 dias adicionais, contados depois do fim do prazo legal}}`. Durante a garantia, a Nekkora corrige sem custo os defeitos da entrega. Para exercê-la: e-mail para contato@nekkora.com, com descrição do defeito.
4. Não são defeitos da entrega: mudanças em sistemas, APIs ou regras de terceiros ou do cliente depois da homologação; uso fora do escopo; alterações feitas por terceiros.

## 11. Propriedade intelectual (C-09 — Modelo A-R, a decidir)

Cláusula em [`condicoes-comerciais-minuta.md` §9.2](condicoes-comerciais-minuta.md). Anexo de Componentes:

| Componente | Tipo | Titular | Licença ao cliente |
|---|---|---|---|
| `{{…}}` | Código específico · Preexistente Nekkora · Terceiro | `{{…}}` | `{{…}}` |

## 12. Aceite

O aceite se dá por `{{assinatura eletrônica / resposta escrita a este e-mail}}` ⚖, com a declaração: "Li e aceito a
proposta `{{número}}`, inclusive as regras de pagamento, homologação, cancelamento, garantia e propriedade
intelectual."

---

**Anexo B — só para contratação empresarial** (C-01): limitação de indenização em situações justificáveis (CDC art. 51,
I, parte final, se houver relação de consumo com pessoa jurídica; CC art. 421-A, II, se não houver), com teto e
exceções `{{a definir}}` ⚖.
