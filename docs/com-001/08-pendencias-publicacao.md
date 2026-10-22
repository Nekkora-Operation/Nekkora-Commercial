# COM-001 — Decisões pendentes para publicação

Nenhum item abaixo foi presumido. Enquanto estiver pendente, a página **não faz a afirmação** correspondente.

## Comerciais e operacionais (responsável pela Nekkora)

| ID | Pendência | Efeito atual na página | O que muda quando decidido |
|---|---|---|---|
| PUB-01 | Número oficial de WhatsApp (K-01) | Sem link, sem botão flutuante; formulário em demonstração | Preencher `CONTACT.whatsappNumber` em `src/config.ts`. Formulário passa a abrir o WhatsApp; botão flutuante volta |
| PUB-02 | E-mail comercial (K-02) — `contato@nekkora.com` da V1 não estava confirmado | Não exibido | `CONTACT.email` |
| PUB-03 | Perfis oficiais de Instagram/LinkedIn (K-03) | Não exibidos | `CONTACT.instagram` / `CONTACT.linkedin` (URL de perfil; página inicial é rejeitada) |
| PUB-04 | Prazo de primeira resposta e horário de atendimento (K-04) | Nada exibido | Texto em `CONTACT_COPY` + matriz |
| PUB-05 | Disponibilidade comercial do Hosting (H-02) e quais dos 8 serviços serão oferecidos | Selo "Em avaliação de viabilidade", aviso e CTA de avaliação | Ajustar `SOLUTIONS`/`HOSTING` em `content.ts` e a matriz; os serviços não oferecidos podem sair do catálogo |
| PUB-06 | Uso de cases, clientes ou depoimentos reais (X-10) | Nenhum | Seção nova, só com autorização e material real |
| PUB-07 | Referências visuais aprovadas (logo/mascote) fora dos repositórios | Conferido contra a nekkora-lib | Conferência visual pela responsável |
| PUB-08 | Destino do formulário em produção (backend/CRM/e-mail) | Sem envio (fora de escopo) | Missão própria: armazenamento, LGPD, consentimento e aviso de privacidade |
| PUB-09 | Aviso de privacidade / LGPD para coleta de dados no formulário — **inclusive no envio pelo WhatsApp**, que encaminha dados pessoais para uma conversa externa | Não necessário hoje (nada é enviado nem armazenado) | Obrigatório antes de ativar formulário ou WhatsApp (COM-002) |
| PUB-10 | Desligar `PREVIEW_NOTICE` (aviso "Versão para homologação") | Aviso visível no rodapé | Somente com autorização de publicação |
| PUB-11 | Domínio, hospedagem e deploy da própria página | Não realizado (proibido nesta missão) | Missão de publicação |
| PUB-12 | Segurança, estabilidade ou desempenho do ambiente de Hosting (H-06) | Nenhuma afirmação | Só com definição técnica |
| PUB-13 | **Modelo C —** datas de início e fim da campanha de lançamento (PR-02). "Nos próximos 2 meses" não tem referência fixa numa página publicada | Texto do mockup, sem datas | Definir período (ex.: "até DD/MM/AAAA") em `PRICING.launch` antes de publicar |
| PUB-14 | **Modelo C —** confirmação final dos valores R$ 1.000 / R$ 2.800 e do texto "Por que os valores são baixos" (PR-01, PR-04) | Exibidos na seção Preços para revisão da PR | Homologação comercial da responsável |
| PUB-16 | **Modelo C, etapa 2 —** destino do botão "Entrar" (área do cliente) | Botão sem efeito, marcado como indisponível (D-24) | Definir destino quando houver área do cliente; até lá, avaliar se o botão deve aparecer na página publicada |
| PUB-15 | **Modelo C —** catálogo detalhado dos 8 serviços de Hosting (com "Como é contratado") e as seções Delivery, Combinado e Diferenciais saíram da página, como no mockup | A faixa do Hosting lista os serviços numa frase e diz que cada um só vale se constar na proposta | Se quiser recuperar algum bloco, ele está no commit `afc7de7` (PR #1) |

## Da nekkora-lib (não alterada — registrar para o time da lib)

| ID | Pendência | Evidência | Contorno nesta página |
|---|---|---|---|
| P-LIB-01 | Acento do **Nekkora Light** (`#C2466D`) sobre o fundo (`#F8F3F5`) = **4,35:1**, abaixo de AA para texto pequeno (eyebrow do `SectionHeader`, `Link` sm, `Button` outline, `Badge` accent soft = 4,19:1) | axe, 8 nós — [04-arquitetura-ux.md §2](04-arquitetura-ux.md) | Tema claro da página = Sage Light (0 violações) |
| P-LIB-02 | `--nk-color-text-muted` usado em placeholders (`Input`, `Textarea`, `SelectMenu`) e no contador do `Textarea`: 4,06:1 no Sakura Dark e 2,66:1 no Sage Light | axe na V1 (`.nk-selectmenu__placeholder`, `.nk-textarea__count`) | `RadioGroup` no lugar do `SelectMenu`; `hint` no lugar do contador. Placeholders continuam (WCAG não os exige como texto essencial; os rótulos são visíveis) |
| P-LIB-03 | `foundation.css` importa a Inter do Google Fonts (requisição a terceiro em toda página que usa a lib) | `fonts.googleapis.com` / `fonts.gstatic.com` em `evidencias/depois/resultados.json` → `fonts` | Nenhum (exige mudar a lib, por exemplo hospedar a fonte junto com ela). Relevante para LGPD |
| P-LIB-04 | Porcelain Light: corpo do `Alert` info = 4,47:1 | axe | Tema não usado |
| P-LIB-05 | Sakura Dark: corpo do `Alert` warning sobre `--nk-color-surface` fica entre 3,5 e 4,1:1 (fundo translúcido `warning-soft` clareia a superfície) | Medição por pixels (`contraste-por-pixels`) | Bloco de contato sobre `surface-sunken` → 4,73:1 |
| P-LIB-07 | **Modelo C —** Sage Light: `Badge` success soft sobre card claro = **4,25:1** | axe + pixels (`.price__row .nk-badge--success`) | Selo "−50%" com `variant="solid"` (branco sobre `#15803d`) |
| P-LIB-08 | **Modelo C, etapa 2 —** `Dialog` sem espaço para ícone no cabeçalho (o mockup usa um `IconBox`) | `Dialog.tsx`: o cabeçalho só tem título, descrição e Fechar | Diálogo sem ícone |
| P-LIB-06 | `Steps` e outros componentes não expõem contraste mensurável pelo axe quando estão sobre fundo com gradiente (sem violação: apenas "revisão manual") | axe `incomplete` | Medição por pixels no `homologacao.mjs` cobre os 54–55 nós |

## Do repositório Commercial (pré-existentes, não tocados)

| ID | Situação | Recomendação |
|---|---|---|
| REP-01 | Alteração **não versionada** em `.gitignore` (adiciona `.env` e `.env.*`) já existia antes da missão | **R1:** versionada isoladamente na branch `chore/gitignore-env`, PR #2 (aguarda merge) |
| REP-02 | Arquivo `.env` não rastreado com credenciais de outro contexto (Postgres, Azure) dentro da pasta da página | **R1:** `git log --all -- .env .env.*` = 0 commits (nunca versionado em nenhuma ref). Remover da pasta e avaliar rotação é ação da responsável: o arquivo não foi lido, movido nem apagado |
