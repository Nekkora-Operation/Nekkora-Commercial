# COM-RELEASE-001 e COM-RELEASE-002 — Modelo C integrado e conversão comercial

Relatório a partir de execuções reais em 22/10/2026. Comandos e saídas: [`evidencias/comandos.txt`](evidencias/comandos.txt).

## Identificação

| Item | Valor |
|---|---|
| Repositório | `Nekkora-Operation/Nekkora-Commercial` |
| Branch | `release/com-release-001` (a partir de `origin/main` = `feae4f9`) |
| Commits | `4ea68f7` merge do Modelo C · `39a8997` implementação · `ef090f2` audit fix · relatórios/evidências |
| Pull Request | ver descrição do PR para `main` — **sem merge** |
| nekkora-lib | `0.2.0`, tarball do CI (`vendor/`), sha256 `1a2e6145…26a6` — [LIB-RELEASE-001](https://github.com/Nekkora-Operation/Nekkora-lib/pull/6) |

## COM-RELEASE-001 — Consolidação

### Análise de integração (§4.1)

| Ref | Conteúdo |
|---|---|
| `origin/main` (`feae4f9`) | PR #1 (COM-001 + R1, até `afc7de7`) + PR #2 (`.gitignore` com `.env`) |
| PR #3 (`cd2c53f`) | Modelo C — **mesclado em `feat/com-001-commercial-positioning`** (`74fa6e9`), nunca na `main` |
| `origin/feat/commercial-modelo-c` (`5f089e6`) | PR #3 + etapa 2 (diálogo "Solicitar avaliação", botão "Entrar") — enviado depois do merge do PR #3 |
| Local `feat/commercial-modelo-c` (`34d0aa5`, não enviado) | **Não integrado** — versiona `.env` com credenciais e muda preços contra a tabela da missão (REP-03 em [pendências](COM-RELEASE-PENDENCIAS.md)) |

Estratégia: branch nova a partir da `main` + `git merge --no-ff origin/feat/commercial-modelo-c` (traz PR #3 e etapa 2).
**Sem conflitos**: o Modelo C descende de `afc7de7` e a `main` só acrescenta o `.gitignore` do PR #2, preservado.
Sem force push. O diretório de trabalho da titular (`Nekkora-Commercial`) não foi tocado — a integração foi feita num
`git worktree` separado.

### Alterações

- **Lib 0.2.0** (contraste AA, Inter local): a página deixa de chamar o Google Fonts; os contornos P-LIB-01..07 que a
  página usava continuam válidos (sem regressão — homologação 70/70 nos 3 motores).
- **Preços (§4.4):** simples R$ 1.000 → R$ 500; média R$ 2.800 → R$ 1.400; **"Automação complexa — Sob orçamento"**;
  bloco "O que define a categoria" (sistemas, integrações, regras, volume, infraestrutura, licenciamento) e "Nem todo
  processo é simples ou médio". Vigência da campanha: com as datas em `publicacao.json`, "com proposta aprovada de
  DD/MM/AAAA a DD/MM/AAAA"; sem elas, o texto do mockup e o deploy bloqueado.
- **Delivery (§4.3):** tecnologias "conforme o caso" (Python, UiPath, Power Automate, integrações via API, sistemas
  web, dados e planilhas) + "A viabilidade com cada sistema é confirmada na avaliação". Hosting segue "Em avaliação de
  viabilidade", sem SLA nem disponibilidade.
- **Condições (§5.5):** sob demanda com escopo em proposta, preço aprovado antes, 50% + 50% conforme a proposta, fila,
  reuniões conforme acordado, licenças e custos externos à parte.
- Matriz de alegações atualizada antes do texto (A-15/16, PR-03/06, CO-01..06, PV-01..05, K-06); texto consolidado
  regenerado (`npm run texto`, agora via Vite).
- Correção visual: itens do card do Hosting espaçados pela altura do card do Delivery (`align-content: start`).
- SEO: canonical, Open Graph/Twitter com imagem 1200×627 (`og-nekkora.jpg`, 71 kB, gerada de `deploy/og/og.html` com o
  logotipo oficial), `robots.txt`, `sitemap.xml`, `404.html`.

Identidade (logotipo, felino, paleta, tipografia, componentes da lib, temas Sage Light ↔ Sakura Dark, responsividade)
mantida; o Modelo C continua a referência.

## COM-RELEASE-002 — Conversão

### Jornada implementada (§5.2/§5.3)

```text
Visitante → Soluções → Preços e condições → "Solicitar avaliação" (4 CTAs) → diálogo
  → Informar necessidade (nome*, empresa, e-mail opcional, descrição*) → validação
  → CONFIRMAR: a mensagem exata + "o que vai para o WhatsApp (Meta)" → [Voltar e editar]
  → "Abrir no WhatsApp": link comum, target=_blank, rel=noopener noreferrer
  → "Pedimos ao navegador para abrir o WhatsApp" + link de novo + copiar mensagem + número + e-mail
```

- **Sem `window.open`:** o WhatsApp abre por link no clique do visitante — bloqueadores de pop-up não barram; opener
  nulo e sem Referer (medidos na aba aberta). A página nunca afirma abertura nem envio.
- **Alternativa manual sempre visível:** copiar a mensagem (resultado sempre anunciado), número formatado e e-mail.
- **Campos mínimos:** nome e descrição obrigatórios; telefone removido (o WhatsApp já identifica); e-mail opcional.
- **Contato direto sem formulário:** "Prefere falar direto?" com WhatsApp/e-mail/LinkedIn/Instagram confirmados.
- **Privacidade (§5.4):** seção "Como tratamos seus dados" (formulário não envia nada; o que vai para o WhatsApp e só com
  confirmação; sem cookies/análise; registros do provedor; uso, retenção e direitos — LGPD art. 7º, V), link no rodapé e
  no formulário. **Minuta** — aprovação da titular e revisão jurídica recomendada.
- **Canais:** nenhum dado real disponível → todos `null` em `publicacao.json`; a página publicada hoje ficaria em modo
  de demonstração, e o portão impede a produção nesse estado. Testes com dados **sintéticos** (`.invalid`, wa.me
  atendido localmente).
- Botão flutuante do WhatsApp recolhe com o diálogo aberto (ficava sobre as ações no celular — achado da homologação).

### Testes

| Bateria | Onde | Resultado |
|---|---|---|
| Página — `homologacao.mjs` (layout 375/768/1280/1440 × 2 temas, axe + contraste por pixels, alegações, preços, privacidade, teclado, foco, tema, diálogo, formulário, menu, rede, console) | runtime do Cloudflare Pages com CSP (`wrangler pages dev`) | **Chromium 70/70 · Firefox 70/70 · WebKit 70/70** |
| Jornada de conversão — `homologacao-canais.mjs` (33 verificações por motor) | build sintético no runtime do Pages | **99/99** (Chromium, Firefox, WebKit) |
| Testes automatizados (`npm test`) | Node | 19/19 |
| Typecheck, build, `npm audit` | — | OK · OK · 0 vulnerabilidades |

Evidências: [`evidencias/pagina/`](evidencias/pagina/) e [`evidencias/conversao/`](evidencias/conversao/) (passo 1
formulário → 2 confirmação → 3 WhatsApp solicitado → 4 página de teste do wa.me; celular nos 3 motores; WhatsApp que
não abre).

### Limitações

- WebKit: Tab não percorre links (padrão do Safari); o link "Pular para o conteúdo" é verificado por foco programático.
- Leitores de tela reais não testados (árvore de acessibilidade via axe).
- WhatsApp real não acionado (sem número confirmado); aplicativo/web do WhatsApp fora do escopo do teste.

## Conclusões

- **COM-RELEASE-001: APROVADA COM RESSALVAS** — integrado, homologado e com build de produção aprovado; ressalvas:
  aprovação dos preços/condições e textos (PUB-14/17) e merge pela titular.
- **COM-RELEASE-002: BLOQUEADA (implementação aprovada)** — jornada homologada em navegador real com dados sintéticos;
  depende dos canais oficiais (PUB-01..03) e da aprovação do aviso de privacidade (PUB-09).
