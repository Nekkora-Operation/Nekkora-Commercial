# NEKKORA-COM-007 — Integração oficial do Microsoft Bookings

**Data:** 28/10/2026 · **Branch:** `feat/com-007-bookings-integration` (a partir de `main` @ `5783b51`) · **PR:** aberto,
sem merge, aguardando a revisão da titular.

Escopo autorizado: desenvolvimento, testes e abertura do PR. Nada foi publicado; AWS, CloudFront, S3, DNS, Microsoft
365 e Nekkora-lib não foram tocados; nenhuma aprovação de `publicacao.json` foi alterada.

## 1. Problema encontrado

1. **Domínio novo recusado.** O Bookings gerou a página em `https://bookings.cloud.microsoft/book/…`, mas a
   validação (página e portão) só aceitava `outlook.office365.com` e `outlook.office.com`. Com a URL real, o botão
   "Agendar conversa" ficaria oculto e o portão acusaria "URL oficial" inválida.
2. **Qualquer tenant `*.onmicrosoft.com` era aceito.** Uma caixa `X@outra-empresa.onmicrosoft.com` passava, sem prova
   de que o tenant é o da Nekkora.
3. **Caminho decodificado antes da checagem.** `decodeURIComponent` no caminho fazia a validação ler `%2F`, `%5C` etc.
   de um jeito e o servidor da Microsoft de outro (ambiguidade explorável para disfarçar a caixa).
4. **Regra duplicada.** Página (`src/config.ts`) e portão (`scripts/verificar-publicacao.mjs`) tinham cópias da
   mesma regra, com pequenas diferenças, mantidas à mão.

O restante do contrato (botões ocultos sem URL válida, nova aba, `noopener noreferrer`, sem iframe, sem
`window.open`, nenhuma afirmação de reserva) estava correto e foi preservado.

## 2. Solução

### 2.1 Regra única

`src/agendamento-url.js` (JavaScript puro, sem dependências, tipos em `agendamento-url.d.ts`) é importado pela página
**e** pelo portão — uma só implementação, sem build para o Node. O teste `agendamento-url.test.mjs` confere que os dois
importam a função e que nenhum deles mantém lista própria de hosts.

### 2.2 Formatos aceitos

| Formato | Exemplo |
|---|---|
| **Atual** | `https://bookings.cloud.microsoft/book/<caixa>@<domínio>/` (também `/book/<caixa>@<domínio>/<subpáginas>`) |
| Legado | `https://outlook.office365.com/book/<caixa>@<domínio>/` · `https://outlook.office.com/book/…` |
| Legado | `https://outlook.office365.com/owa/calendar/<caixa>@<domínio>/bookings/` (só nos hosts `outlook.*`) |

`<domínio>` = domínio do e-mail comercial (`canais.email` → `nekkora.com`). Uma caixa `*.onmicrosoft.com` só é
aceita se o próprio tenant for declarado em `publicacao.json → agendamento.dominioDoTenant` (campo opcional, **não**
preenchido hoje) e for exatamente esse domínio.

### 2.3 Controles

- `https` obrigatório; sem porta, usuário ou senha; sem query nem fragmento.
- Lista **explícita** de hosts (`bookings.cloud.microsoft`, `outlook.office365.com`, `outlook.office.com`) por
  igualdade exata — nada de "termina com `microsoft.com`". Subdomínios (à esquerda ou à direita), ponto final
  (`host.`), hosts parecidos e IDN (letras cirílicas, convertidas em `xn--…` pelo parser) são recusados.
- URL em forma canônica (`new URL(u).href === u`): espaços, tabulações, maiúsculas no host, `..` e barras invertidas
  são recusados em vez de normalizados em silêncio.
- No caminho, nenhum caractere codificado além de `%40` (`@`): `%2F`, `%5C`, `%2E`, `%2540` são recusados.
- Caminho de página de reservas com caixa explícita; página inicial e `/book/` sem caixa são recusados.
- Caixa no domínio da Nekkora por igualdade exata (recusa `nekkora.com.evil…` e `falsonekkora.com`).
- No portão (modo produção), também recusa domínios reservados (`.invalid`, `.example`, `.test`, `.localhost`), como
  já fazia com o e-mail. A homologação usa esses domínios nas fixtures sintéticas.

### 2.4 URL oficial

`publicacao.json → agendamento.url = "https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/"`.

Conferência feita pelo agente em 28/10/2026, só leitura, no navegador: o endereço abre a página pública **"Nekkora"**
com o serviço **"Conversa inicial — Nekkora Delivery"** (30 minutos) e a grade de horários; o próprio Bookings
acrescenta `?ismsaljsauthenabled=true` ao carregar (não faz parte da URL registrada). Como contraprova, uma caixa
inexistente no mesmo domínio (`…/book/CaixaInexistenteTeste123@nekkora.com/`) mostra "Some error occurred".
Nenhum horário foi selecionado e nenhuma reserva foi feita.

`agendamento.obrigatorio` continua `true`; **`aprovacoes.agendamento` continua `false`**.

### 2.5 Fluxo de agendamento na página

1. Com a URL válida, "Agendar conversa" aparece no topo (Hero), no contato e, como atalho, no diálogo "Solicitar
   avaliação" — os três apontam para a mesma URL oficial.
2. O clique abre o Bookings em **nova aba**, por link comum (`target="_blank"`, `rel="noopener noreferrer"`), sem
   iframe e sem `window.open`; a URL é a de `publicacao.json`, sem nenhum dado do visitante.
3. A página de origem não muda e **não afirma** que a conversa foi marcada: "A conversa só fica marcada quando o
   Bookings confirmar." A confirmação é do Bookings (tela e e-mail).
4. Sem URL válida, nenhum botão nem link de agendamento aparece (`data-agendamento="pendente"`).

## 3. Testes

### 3.1 Testes reais realizados pela titular (relatados na missão; não reexecutados pelo agente)

Configuração: página compartilhada "Nekkora"; serviço "Conversa inicial — Nekkora Delivery"; 30 min; Microsoft Teams;
segunda a sexta, 09h–18h; antecedência mínima 24 h e máxima 30 dias; 15 min de intervalo posterior; uma reserva por
horário; responsável corporativa atribuída; formulário personalizado; confirmação automática por e-mail; lembrete de
2 h configurado.

| # | Evidência | Situação |
|---|---|---|
| 1 | Cliente externo conseguiu reservar | Realizado pela titular |
| 2 | Bookings apresentou a confirmação | Realizado pela titular |
| 3 | Cliente recebeu o e-mail de confirmação | Realizado pela titular |
| 4 | Convite com acesso ao Microsoft Teams | Realizado pela titular |
| 5 | Responsável recebeu a notificação | Realizado pela titular |
| 6 | Compromisso no calendário corporativo | Realizado pela titular |
| 7 | Horário reservado ficou indisponível | Realizado pela titular |
| 8 | Intervalo posterior de 15 min respeitado | Realizado pela titular |

### 3.2 Testes ainda pendentes (titular) — **não aprovados**

| Teste | Situação |
|---|---|
| Recebimento do lembrete automático de 2 horas | Pendente |
| Cancelamento e liberação do horário | Pendente |
| Abertura efetiva do link do Teams (não só a presença no convite) | Pendente |

Enquanto não forem concluídos e a titular gravar `aprovacoes.agendamento: true`, o PUB-20 continua bloqueando.

### 3.3 Testes automatizados executados pelo agente

Pipeline local equivalente aos três checks obrigatórios do `ci.yml`, no commit `d69d76c` (logs em
[`evidencias/com-007/logs`](evidencias/com-007/logs/pipeline-resumo.txt)). O CI do PR repete tudo no GitHub.

| Etapa | Resultado |
|---|---|
| Nekkora-lib: tarball, lockfile e reconstrução a partir do commit registrado | OK (mesmo sha256) |
| Typecheck (`tsc --noEmit`) | OK |
| `npm test` | **220/220** (152 anteriores + 55 da matriz de URL + 13 casos novos no portão) |
| Build de produção limpo (`arvoreLimpa: true`) | OK |
| Preços do código = preços do artefato · política de cabeçalhos do CloudFront | OK · OK |
| Portão de publicação | **BLOQUEADA**, 8 pendências (§4) |
| Artefato servido como no CloudFront local | OK |
| Página de produção (Chromium, Firefox, WebKit) | 90/90 em cada; `agendamento-conforme-configuracao`: 2 botões para `https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/`, nova aba sem opener e sem Referer |
| Jornada por e-mail (3 navegadores) | 96/96; Bookings de outra organização recusado (nenhum botão) |
| Jornada por WhatsApp (3 navegadores) | 111/111 |
| Agendamento e envio automático simulados (3 navegadores) | 144/144; inclui `agendamento-dominio-atual-do-bookings`, nova aba, teclado, sem `window.open`, atalho no diálogo, Bookings indisponível, celular, axe nos dois temas e nenhuma requisição externa real |

Os testes de navegador não criam reservas nem falam com a Microsoft: a página do Bookings é respondida localmente e
qualquer outra requisição externa é abortada e registrada.

**Casos cobertos pela matriz** (`scripts/testes/agendamento-url.test.mjs`) — aceitos: URL oficial no domínio atual,
`%40`, sem barra final, subpágina de serviço, três formatos legados. Recusados: ausente, vazia, malformada, sem
esquema, http, credenciais, usuário embutido, porta, página inicial (atual e legada), `/book/` sem caixa, caminho
inválido, `/owa/calendar` no domínio novo ou sem `/bookings`, outra organização, domínio da Nekkora como prefixo ou
sufixo de outro, `*.onmicrosoft.com` sem tenant declarado ou de outro tenant, hosts parecidos (`.microsoft.com`,
hífens, dígito, cirílico), subdomínio à direita e à esquerda, ponto final, outro `*.microsoft.com`, maiúsculas,
espaço, tabulação, barras invertidas, query, fragmento, `%2F`, `%2E`, `%5C`, `%2540`, `..`, `javascript:` e
domínios fictícios em produção.

**Evidências da interface:** [`evidencias/com-007/producao`](evidencias/com-007/producao) (build de produção com a
URL real: página inteira e diálogo "Solicitar avaliação" com o atalho "Agendar conversa") e
[`evidencias/com-007/agendamento-simulado`](evidencias/com-007/agendamento-simulado) (Hero, contato, celular e a página
de teste local aberta em nova aba, nos três navegadores).

## 4. Portão de publicação

```
PUBLICAÇÃO BLOQUEADA — 8 pendência(s):
  - PUB-20 — confirmação da titular: serviço do Bookings configurado e página oficial testada
  - PUB-13 — datas de início e fim da campanha de lançamento
  - PUB-09 — controlador dos dados: razão social (ou nome) para o aviso de privacidade
  - PUB-19 — aprovação das condições comerciais (50/50, fila, reuniões, licenças, garantia e aceite)
  - PUB-17 — aprovação dos textos comerciais
  - PUB-09 — aprovação do aviso de privacidade
  - PUB-18 — autorização expressa de publicação em produção
  - PUB-10 — desligar o aviso "Versão para homologação"
```

O PUB-20 deixou de acusar a URL (ela é válida) e passou a acusar só a confirmação da titular. Nenhuma regra do portão
foi afrouxada; o teste "o publicacao.json versionado continua bloqueado" passou a exigir exatamente isso.

## 5. Texto e privacidade

Com a URL válida, a versão de produção passa a mostrar "Agendar conversa" e o aviso de privacidade ganha o item
"Agendamento pelo Microsoft Bookings" (PV-06), além de "realizar a conversa agendada" no item de uso. O texto
exportado para aprovação (`docs/com-001/05-texto-comercial.md`) foi regenerado com `npm run texto` e mostra essa
diferença. As aprovações PUB-17 e PUB-09 devem considerar esse texto.

## 6. Riscos


- **Mudança de domínio pela Microsoft.** Se o Bookings voltar a gerar outro host (por exemplo `outlook.cloud.microsoft`),
  o botão some e o portão bloqueia até a lista ser atualizada — falha segura, mas exige nova alteração de código.
- **Query recusada.** Links copiados com `?ismsaljsauthenabled=true` ou similares são recusados; a titular deve gravar a
  URL sem query (como está).
- **Duração divergente da documentação antiga.** O guia de configuração (COM-RELEASE-005 §5) previa 20 min; o serviço
  real tem 30 min. A página não promete duração, então nada a ajustar no texto; o guia recebeu uma nota com os valores
  homologados.
- **Testes reais pendentes** (§3.2): o portão continua bloqueado por PUB-20 até a confirmação da titular.
- **Simulação local.** Os testes de navegador respondem a página do Bookings localmente; o Bookings real só foi
  exercitado pela titular (§3.1) e, em leitura, pela conferência do §2.4.
