# Nekkora Platform — backlog de políticas (handoff da NEKKORA-COM-008-C)

**Origem:** decisões da titular na COM-008-B, registradas na NEKKORA-COM-008-C (28/10/2026).
**Natureza:** handoff para os produtos futuros. **Nada aqui foi implementado.** O Nekkora Commercial não tem cadastro,
autenticação, área do cliente, cofre de segredos nem relatórios de execução. Os repositórios `Nekkora-Platform-API`,
Agent e Framework **não foram modificados** nesta missão.

Cada item abaixo é um requisito de produto a detalhar quando a Platform for planejada. Os prazos de retenção foram
aprovados pela titular. Antes da implementação, ainda passam por revisão jurídica e pelo registro nos documentos de
privacidade da Platform.

---

## PLATFORM-SECURITY-001 — Identidades, organizações e acesso

| Requisito | Detalhe |
|---|---|
| Identidades | Conta individual por pessoa; nenhuma credencial compartilhada |
| Organizações | Cada cliente é uma organização isolada; usuários vinculados a uma ou mais organizações |
| Permissões | Papéis por organização (ex.: administrador, operador, leitura), pelo princípio do menor privilégio |
| MFA | Obrigatório para administradores; recomendado para os demais usuários |
| Acesso supervisionado à produção do cliente | Acesso da Nekkora ao ambiente do cliente só quando solicitado ou autorizado, por tempo limitado, com registro (ver PLATFORM-AUDIT-001) |
| Servidores próprios da Nekkora | Administração exclusiva da Nekkora; o cliente não recebe acesso administrativo à infraestrutura compartilhada |

**Critérios de aceite (proposta):** usuário sem MFA não acessa funções administrativas; um usuário de uma organização
não lê dados de outra (teste automatizado de isolamento); todo acesso supervisionado tem início, fim, responsável e
justificativa registrados.

## PLATFORM-SECRETS-001 — Cofre de segredos

| Requisito | Detalhe |
|---|---|
| Armazenamento | Segredos criptografados em repouso e em trânsito, num cofre dedicado |
| Isolamento | Por cliente (organização); nenhuma automação lê segredo de outra organização |
| Acesso mínimo | Cada automação acessa só os segredos de que precisa |
| Rotação e revogação | Rotação sem reimplantação da automação; revogação imediata |
| Auditoria | Toda leitura, criação, alteração e revogação registrada (quem, quando, qual segredo, sem o valor) |
| Logs | **Nenhuma credencial pode aparecer em logs**, relatórios, mensagens de erro ou evidências |

**Critérios de aceite (proposta):** teste automatizado que injeta segredos conhecidos e procura os valores em todos os
logs e relatórios gerados (zero ocorrências); segredo revogado deixa de funcionar na execução seguinte.

## PLATFORM-AUDIT-001 — Registros de acesso administrativo

| Requisito | Detalhe |
|---|---|
| Escopo | Acessos administrativos e supervisionados (login, elevação de privilégio, acesso à produção do cliente, operações no cofre) |
| Retenção aprovada | **12 meses**, prorrogáveis por **até mais 12 meses** mediante justificativa documentada (ex.: incidente, auditoria, processo) |
| Integridade | Registros imutáveis ou com detecção de alteração |
| Acesso aos registros | Restrito; o próprio acesso aos registros também é registrado |

## PLATFORM-REPORTS-001 — Relatórios e histórico de execuções

Política em três níveis (aprovada):

| Tipo | Retenção aprovada |
|---|---|
| Logs técnicos detalhados | 90 dias |
| Histórico estruturado de execuções | 12 meses |
| Relatórios mensais consolidados | 24 meses |

Requisitos adicionais:

- **Exportação** pelo cliente, em formato aberto (ex.: CSV/JSON), antes do fim de cada prazo.
- **Minimização:** logs e relatórios sem dados pessoais ou sigilosos além do necessário; mascaramento por padrão.
- **Isolamento por organização** em armazenamento, consulta e exportação.
- **Retenção contratual específica:** um contrato pode prever prazo diferente, registrado por organização (por exemplo,
  um cliente obrigado a guardar por mais tempo), sem alterar o padrão dos demais.
- Eliminação automática ao fim do prazo, com registro da rotina.

## PLATFORM-PRIVACY-001 — Encerramento de contas

| Requisito | Detalhe |
|---|---|
| Prazo | Solicitação de encerramento processada em **até três dias úteis** |
| Confirmação | Confirmação por e-mail ao solicitante (recebimento e conclusão) |
| Desistência | Possibilidade de **cancelar a solicitação antes da execução** |
| Eliminação | Eliminação dos dados aplicáveis da conta e da organização |
| Obrigações legais | Preservação do que a lei exigir (ex.: registros fiscais, registros de acesso exigidos pelo Marco Civil da Internet), pelo prazo legal e com uso restrito |

## PLATFORM-CONSENT-001 — Aceites, ciência e consentimentos

| Requisito | Detalhe |
|---|---|
| Termos | Aceite explícito dos termos de uso no cadastro (sem caixa pré-marcada) |
| Privacidade | Registro de **ciência** da política de privacidade (não é consentimento) |
| Consentimentos específicos | Pedidos à parte, só para finalidades que realmente dependam dessa base legal (ex.: comunicações de marketing), com revogação tão simples quanto o aceite |
| Contratação por serviço | Novo aceite contratual para cada serviço contratado (Delivery, Hosting, outros) |
| Evidências | Guardar versão do documento, data e hora, usuário, organização e meio do aceite ou consentimento, e a revogação, se houver |

---

## Relação com o Commercial

| Tema | No Commercial (hoje) | Na Platform (futuro) |
|---|---|---|
| Área do cliente / "Entrar" | Botão **oculto** (COM-008-B, AUD-26) | PLATFORM-SECURITY-001 |
| Cadastro e aceites | Não existe; contratação por proposta e contrato | PLATFORM-CONSENT-001 |
| Retenção | Contatos sem contratação: 6 meses após o último contato relevante; reservas do Bookings: 90 dias após a reunião ou o cancelamento (`docs/comercial/privacidade-minuta.md`) | PLATFORM-REPORTS-001, PLATFORM-AUDIT-001 |
| Credenciais do cliente | Tratadas fora do site, conforme a proposta e o contrato; o site pede para não enviar senhas | PLATFORM-SECRETS-001 |
