# COM-RELEASE-004 — Homologação final (pré-publicação) e critérios da release

A parte que não depende de publicação foi executada sobre o **build de produção servido pelo runtime do Cloudflare
Pages** (`wrangler pages dev`, com `_headers`/CSP), em 22/10/2026. A homologação pública (§7.6) não foi feita: não há
autorização nem infraestrutura de produção.

## 1. Funcional e visual (§7.1, §7.2)

| Item | Chromium 153.0 | Firefox 155.0 | WebKit 26.6 |
|---|---|---|---|
| Página (70 verificações; 375/768/1280/1440 px × Sage Light e Sakura Dark) | 70/70 | 70/70 | 70/70 |
| Jornada de conversão (33 verificações, dados sintéticos) | 33/33 | 33/33 | 33/33 |

Navegação e âncoras, CTAs (4 abrem o diálogo; "Entrar" sem efeito e declarado indisponível), links externos (isolados,
nenhum destino provisório), formulário, WhatsApp, alternância de tema com persistência, menu do celular, ausência de
rolagem horizontal, bloqueio de pop-up (não se aplica: abertura por link) e WhatsApp que não abre.
Versões exatas dos navegadores em `evidencias/pagina/resumo-*.md`.

## 2. Acessibilidade (§7.3)

axe-core 4.13 (WCAG 2.0/2.1 A e AA) com a página e com o diálogo aberto, nos 2 temas, celular e desktop: **0
violações**; contraste dos nós "incompletos" medido por pixels: 0 abaixo do mínimo. Teclado: link de pular conteúdo,
foco visível nos 40 primeiros Tabs, Esc fecha o diálogo e devolve o foco, foco no primeiro erro, foco na etapa nova do
diálogo. Hierarquia: um `h1`, seções com `h2`. Campos com rótulo visível e mensagens de erro ligadas ao campo.
Leitor de tela real: **não testado**.

## 3. Segurança

CSP sem `unsafe-inline` para scripts (hash gerado no build; a CSP bloqueou de fato uma injeção inline durante o teste),
HSTS, `nosniff`, `DENY`, `Referrer-Policy`, `Permissions-Policy`; nenhuma requisição a terceiros; links externos com
`noopener noreferrer`; nenhum segredo no repositório (`.env` ignorado; `publicacao.json` só tem dados públicos);
`npm audit` 0. O portão recusa artefato de homologação, de árvore suja ou com outra lib.

## 4. SEO e LinkedIn (§7.4)

Título, description, canonical `https://nekkora.com/`, Open Graph completo (imagem 1200×627 JPEG, 71 kB, `og:image:alt`),
`twitter:card`, favicon (ico/svg/apple-touch), `robots.txt` + `sitemap.xml`, 404 real com `noindex`
([`evidencias/seo.txt`](evidencias/seo.txt)). **Pendente:** LinkedIn Post Inspector só funciona com a URL pública.

## 5. Desempenho (§8.2)

Laboratório (Chromium, 375 px, cache vazio, 150 ms / 1,6 Mbps, CPU 4×, mediana de 5): **FCP/LCP 1,58 s · CLS 0 ·
165 kB · 4 requisições** ([`evidencias/desempenho.json`](evidencias/desempenho.json)). Achado e corrigido: a troca da
fonte deslocava o hero (CLS 0,22) → preload da Inter. Medição no domínio público: pendente.

## 6. Monitoramento comercial (§7.5) — proposta, nada ativado

Proporcional e sem cookies: **Cloudflare Web Analytics** (gratuito, sem cookies; ativar pelo painel, sem injeção
automática, e incluir `static.cloudflareinsights.com` na CSP) para acessos; "solicitações iniciadas" e "contatos
recebidos" medidos no próprio WhatsApp Business (etiquetas) — a mensagem montada já começa com "Quero solicitar uma
avaliação de automação". Ativar qualquer análise exige atualizar o aviso de privacidade (PV-03). Decisão da titular.

## 7. Critérios de conclusão da release (§12)

| ID | Critério | Situação |
|---|---|---|
| G01 | Nekkora-lib estabilizada | **Atendido** tecnicamente (PR #6, sem merge) |
| G02 | Commercial consolidado | **Atendido** tecnicamente (PR, sem merge) |
| G03 | Modelo C homologado | **Atendido** (3 motores, local) |
| G04 | Contatos comerciais funcionais | **Pendente** — nenhum canal confirmado (PUB-01..03) |
| G05 | Formulário e WhatsApp testados | **Atendido com dados sintéticos**; com número real, pendente |
| G06 | Preços e condições aprovados | **Pendente** — aprovação da titular (PUB-13/14) |
| G07 | Privacidade revisada | **Pendente** — minuta pronta; aprovação (PUB-09) |
| G08 | Build reproduzível | **Atendido** — lib e Commercial (mesmo sha256 no Windows e no CI) |
| G09 | CI/CD validado | **Parcial** — CI verde no GitHub (run 39826399640, mesmos 70/70 ×3 e 99/99); deploy/preview dependem de INF-01..04 |
| G10 | HTTPS e DNS funcionando | **Pendente** — exige autorização para alterar DNS |
| G11 | Site público homologado | **Pendente** |
| G12 | Rollback disponível | **Parcial** — implementado e testado com API simulada; teste real pendente |
| G13 | Aprovação expressa da titular | **Pendente** |

**A NEKKORA-RELEASE-001 não está concluída.** Status da COM-RELEASE-003 e 004: **BLOQUEADAS** por decisões e
autorizações da titular, listadas em [COM-RELEASE-PENDENCIAS.md](COM-RELEASE-PENDENCIAS.md).
