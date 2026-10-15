# Homologação automatizada — 2026-10-15T09:37:06.693Z

URL: http://127.0.0.1:4174/ · Chromium (Playwright) · 39 verificações · 23 falha(s)

| Verificação | Resultado | Detalhe |
|---|---|---|
| tema-aplicado:sakura-dark:mobile | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:sakura-dark:mobile | OK | excesso=0px |
| tema-aplicado:sakura-dark:tablet | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:sakura-dark:tablet | OK | excesso=0px |
| tema-aplicado:sakura-dark:desktop | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:sakura-dark:desktop | OK | excesso=0px |
| tema-aplicado:sakura-dark:wide | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:sakura-dark:wide | OK | excesso=0px |
| tema-aplicado:light:mobile | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:light:mobile | OK | excesso=0px |
| tema-aplicado:light:tablet | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:light:tablet | OK | excesso=0px |
| tema-aplicado:light:desktop | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:light:desktop | OK | excesso=0px |
| tema-aplicado:light:wide | **FALHA** | data-nk-theme=midnight-blue |
| sem-rolagem-horizontal:light:wide | OK | excesso=0px |
| axe:sakura-dark:mobile | **FALHA** | color-contrast(8) |
| axe:sakura-dark:desktop | **FALHA** | color-contrast(8) |
| axe:light:mobile | **FALHA** | color-contrast(8) |
| axe:light:desktop | **FALHA** | color-contrast(8) |
| tema-padrao-sakura-dark | **FALHA** | data-nk-theme=midnight-blue |
| ordem-das-secoes | **FALHA** | inicio > entrega > como-funciona > studio > hospedagem > monitoramento > suporte > diferenciais > contato |
| um-unico-h1 | OK | 1 h1 |
| ancoras-validas | OK | 27 âncoras, quebradas: nenhuma |
| sem-destinos-provisorios | **FALHA** | links externos: https://wa.me/5500000000000?text=Ol%C3%A1!%20Quero%20conhecer%20a%20Nekkora%20e%20entender%20como%20voc%C3%AAs%20podem%20ajudar%20na%20minha%20opera%C3%A7%C3%A3o. \| https://wa.me/5500000000000?text=Ol%C3%A1!%20Quero%20conhecer%20a%20Nekkora%20e%20entender%20como%20voc%C3%AAs%20podem |
| sem-whatsapp-flutuante-provisorio | **FALHA** | botão flutuante presente |
| sem-alegacoes-proibidas | **FALHA** | percentual: "98,1%" |
| produtos-internos-so-em-bloco-informativo | **FALHA** | 13 menção(ões) |
| demonstrativos-identificados | **FALHA** | [] |
| primeiro-tab-pular-conteudo | OK | {"text":"Pular para o conteúdo","href":"#conteudo"} |
| pular-conteudo-visivel-no-foco | **FALHA** | "" |
| foco-visivel-nos-40-primeiros-tabs | OK | 0 sem indicador de foco |
| alternancia-de-tema-persiste | **FALHA** | sage-light → recarregado: sage-light |
| formulario-erros-obrigatorios | OK | 3 campos inválidos; foco no primeiro inválido=false |
| formulario-foco-no-primeiro-erro | **FALHA** | "" |
| execucao:funcionais | **FALHA** | locator.fill: Timeout 30000ms exceeded. |
| menu-mobile-abre-e-fecha-com-esc | OK | aberto=true depois do Esc=false |
| sem-requisicoes-externas | OK | nenhuma |
| console-sem-erros | OK | limpo |

Capturas: pagina-sakura-dark-mobile-375.jpg, pagina-sakura-dark-tablet-768.jpg, pagina-sakura-dark-desktop-1280.jpg, hero-sakura-dark-desktop.png, pagina-sakura-dark-wide-1440.jpg, pagina-light-mobile-375.jpg, pagina-light-tablet-768.jpg, pagina-light-desktop-1280.jpg, hero-light-desktop.png, pagina-light-wide-1440.jpg, formulario-erros.png, menu-mobile-aberto.png

> Nota: execução sobre a versão `main` (da1f8f3), antes da COM-001. Essa versão usa outra chave de tema no localStorage, por isso todas as capturas saíram no tema padrão dela (**Midnight Blue**); as capturas foram renomeadas para `*-midnight-blue-padrao-*` e as duplicadas removidas. As falhas acima são o diagnóstico de partida (Gate 01), não regressões.
