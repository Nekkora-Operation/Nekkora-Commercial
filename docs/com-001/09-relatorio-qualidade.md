# COM-001 · Gate 05 — Relatório técnico e comercial

Data: 2026-10-15 · Branch `feat/com-001-commercial-positioning` · Base `main` @ `da1f8f3` · nekkora-lib @ `c4c479f`
(não alterada: `git status --porcelain` vazio).
Ambiente: Windows 11, Node 24.19.0, npm 11.17.0, Chromium do Playwright 1.63.0 (headless), axe-core 4.13.0.
Saída integral dos comandos: [evidencias/comandos.txt](evidencias/comandos.txt).

## 1. Comandos executados e resultados reais

| Comando | Resultado |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run build` | exit 0 — JS 337,3 kB (gzip 103,6 kB), CSS 82,8 kB (gzip 13,8 kB). Base V1: 334,6 kB / 79,0 kB |
| `npm run check` | exit 0 (typecheck + build) |
| `npm run texto` | exit 0 — gerou `05-texto-comercial.md` a partir de `src/content.ts` |
| `npm run homologacao` (estado padrão, sem canais) | **54 verificações, 0 falhas** — [resumo](evidencias/depois/resumo.md) (50 na entrega inicial + 4 do acordeão na R1) |
| `scripts/homologacao-canais.mjs` (build temporário com canais de teste) | **16 verificações, 0 falhas** — [resultados](evidencias/canais/resultados.json) (aba aberta e aba bloqueada; `opener` e Referer medidos na aba) |
| Controle negativo da abertura do WhatsApp (implementação anterior) | 2 falhas esperadas, entre elas o Referer vazando — [LEIA-ME](evidencias/controle-negativo-r1/LEIA-ME.md) |
| Mesma homologação sobre a V1 (linha de base) | 39 verificações, **23 falhas** — [resumo](evidencias/antes/resumo.md) |

O projeto **não tem testes unitários nem lint** (não havia na base, e a missão não autorizou novas dependências).
A verificação comportamental é feita pelos scripts em navegador real descritos abaixo.

## 2. O que a homologação automatizada cobre

| Área | Verificações | Resultado |
|---|---|---|
| Layout | 4 larguras (375, 768, 1280, 1440) × 2 temas: tema aplicado e sem rolagem horizontal | 16/16 |
| Acessibilidade | axe-core WCAG 2.0/2.1 A+AA (28 regras aprovadas, 0 violações) em mobile e desktop × 2 temas; nenhum item de revisão manual além de contraste | 8/8 |
| Contraste sobre gradiente | 54–55 nós por cenário que o axe não consegue decidir (fundo com gradiente/pseudo-elemento), medidos por pixels: pior folga **4,59:1** (Sage Light mobile, `Alert` de aviso), exigência 4,5:1 | 4/4 |
| Estrutura | Tema padrão Sakura Dark; ordem das 9 seções; um único `h1`; 30 âncoras sem quebra | 4/4 |
| Promessas | Nenhum link externo; sem WhatsApp flutuante; alegações proibidas só no bloco de exclusões (3 ocorrências: "24 horas", "alta disponibilidade", "SLA"); Studio/Platform/Agent só no bloco informativo (1 menção); demonstrativo rotulado "Ilustração" | 5/5 |
| Teclado | Primeiro Tab no "Pular para o conteúdo", visível; foco visível nos 40 primeiros Tabs; menu mobile com Enter/Esc; opção de rádio por teclado | 5/5 |
| Tema | Alternância para Sage Light persiste após recarregar | 1/1 |
| Formulário | 7 campos marcados inválidos (nome, e-mail, 4 rádios, descrição); foco no primeiro erro; modo demonstração com resumo; sem pop-up, navegação ou requisição; resumo focado e visível abaixo da barra fixa | 6/6 |
| Rede e console | Nenhuma requisição externa além da fonte Inter importada pela lib; console sem erros nem avisos | 2/2 |
| Hosting no celular (R1) | Acordeão com 8 itens recolhidos; "Como é contratado" visível nos 8 resumos; Enter abre, Espaço fecha, foco visível; desktop com 8 definições visíveis | 4/4 |
| Canais configurados (build de teste) | WhatsApp, e-mail e LinkedIn viram links; Instagram com URL de página inicial é **rejeitado**; botão flutuante volta; o formulário pede a abertura do WhatsApp com a mensagem montada (o `wa.me` é respondido por uma página local de teste). Medido na aba aberta: `opener` nulo, sem cabeçalho Referer e com `document.referrer` vazio. A mensagem neutra é a mesma com a aba aberta ou bloqueada, e o link manual (`noopener noreferrer`) está sempre presente | 16/16 |

## 3. Problemas resolvidos (V1 → COM-001)

| # | Problema | Evidência antes | Evidência depois |
|---|---|---|---|
| 1 | Números fictícios no hero ("98,1%", "156", "3/3") | `sem-alegacoes-proibidas` FALHA | OK; jornada sem dados com selo "Ilustração" |
| 2 | Todos os CTAs para `wa.me/5500000000000`, `mailto` não confirmado e páginas iniciais de redes | `sem-destinos-provisorios` FALHA (15 links) | 0 links externos; canais validados em `config.ts` |
| 3 | Botão flutuante de WhatsApp provisório | FALHA | Só aparece com número válido (verificado no build de teste) |
| 4 | Studio como porta de entrada, citado 13 vezes | `produtos-internos…` FALHA | 1 menção, no bloco informativo |
| 5 | Monitoramento, suporte e sustentação apresentados como incluídos | Auditoria §2 | Componentes opcionais do Hosting + lista "Não incluído automaticamente" |
| 6 | Contraste (`.contact__note`, placeholder do `SelectMenu`, contador do `Textarea`) | axe `color-contrast` 8 nós | 0 violações (D-10, D-11) |
| 7 | "Pular para o conteúdo" invisível com foco | FALHA | OK (D-12) |
| 8 | Foco não ia ao primeiro erro do formulário | FALHA | OK (D-13) |
| 9 | Resumo do formulário escondido sob a barra fixa | — | OK, com verificação de posição |
| 10 | `aria-labelledby` em `div` sem papel (introduzido e corrigido nesta missão) | axe `incomplete` | Removido |
| 11 | Brilhos decorativos reduzindo o contraste real (achado pela medição por pixels) | 3,5–4,3:1 | ≥ 4,59:1 (D-16) |
| 12 | Sucesso do WhatsApp anunciado sem confirmação; na 1ª versão da R1, a abertura sem `noopener,noreferrer` enviava o Referer | Revisões do PR #1; controle negativo | `noopener,noreferrer` desde a abertura, mensagem neutra e link manual sempre visível (D-18) |
| 13 | **R1:** página mobile extensa | ~14.300 px | 13.735 px, com acordeão do Hosting (D-17) |
| 14 | **R1:** `.gitignore` sem proteção para `.env` | Alteração local não versionada | PR #2 isolado |

## 4. Problemas conhecidos e limitações

- **Sem testes em dispositivos reais nem leitor de tela real.** As larguras foram emuladas no Chromium headless.
  Safari/iOS, Firefox, Android e NVDA/VoiceOver não foram testados (checklist, itens manuais).
- **Só Chromium.** O Playwright desta máquina tem apenas o Chromium instalado.
- **Ferramentas emprestadas.** Playwright e axe-core vêm do `node_modules` do Nekkora-Platform-Web (`NEKKORA_PW_MODULES`).
  Não foram adicionados ao Commercial para não ampliar o escopo de dependências; quem for reproduzir precisa de uma
  pasta com essas ferramentas.
- **O axe tem limites.** Ele não avalia clareza do texto, ordem lógica de leitura nem adequação do texto alternativo.
  O contraste por pixels usa o percentil 10 do fundo da caixa do elemento: é uma aproximação, não uma medição por glifo.
- **Fonte de terceiro.** A Inter é carregada do Google Fonts pela lib (P-LIB-03); a verificação de rede permite
  esse domínio de forma explícita.
- **Nekkora Light não usado.** O acento oficial falha AA (P-LIB-01); a página usa Sage Light como tema claro.
- **Placeholders** dos campos usam `text-muted` da lib (P-LIB-02). Os rótulos são sempre visíveis.
- **O formulário não envia nada** por decisão de escopo (sem backend e sem canal confirmado).
- **Capturas de tela inteira.** Nas capturas por elemento de seções mais altas que a janela, o Playwright pode
  desenhar a barra fixa sobre o conteúdo. Isso é artefato da captura: verifiquei que o skip link fica fora da tela
  (top −64 px) sem foco.
- **Mobile ainda longo.** Com o acordeão do Hosting (R1), a página caiu de ~14.300 para 13.735 px a 375 px (−4 %).
  O ganho é pequeno porque a condição comercial de cada serviço continua visível, por decisão. O restante da altura
  está em Delivery, Transparência e Contato. Novas reduções exigiriam esconder conteúdo de outras seções, decisão
  comercial a tomar na homologação visual.
- **Bloqueio de pop-up simulado.** O cenário de aba bloqueada sobrescreve `window.open` para devolver `null`, que é o
  contrato dos bloqueadores. O bloqueador real de cada navegador não foi exercitado. Como a página já não depende do
  retorno de `window.open`, o resultado não muda com o bloqueador.
- **Corrida do `opener` não reproduzida.** No Chromium, anular o `opener` logo após a abertura já impedia o acesso.
  A correção não depende disso: aplica `noopener` desde a abertura.

## 5. Avaliação comercial

- **Delivery e Hosting separados:** cards próprios em Soluções, seções próprias, estágio explícito
  ("Sob proposta" / "Em avaliação de viabilidade").
- **Contratação combinada:** três modalidades, cada uma com quando faz sentido e com suas condições; limites explícitos.
  Nenhuma dependência de produtos internos.
- **Promessas:** todas as frases rastreiam um ID da matriz (comentários em `content.ts`). Sem preço, prazo,
  percentual, SLA, 24 h, ROI, casos ou depoimentos.
- **Contato:** nenhum destino falso. A página diz com clareza que os canais estão em definição e que o formulário é demonstração.
- **Pendências:** 12 comerciais/operacionais, 6 da lib, 2 do repositório — [08-pendencias-publicacao.md](08-pendencias-publicacao.md).

## 6. Reproduzir

```bash
cd Nekkora-Commercial && npm install && npm run check
npx vite preview --host 127.0.0.1 --port 4174 &
NEKKORA_PW_MODULES=../Nekkora-Platform-Web/node_modules npm run homologacao -- http://127.0.0.1:4174/ /tmp/homologacao
```
