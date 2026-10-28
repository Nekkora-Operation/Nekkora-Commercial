# Agendamento e envio automático (COM-RELEASE-005) — 2026-10-28T17:13:53.473Z

URL: http://127.0.0.1:4177/ · backend local http://127.0.0.1:4178/ (entrega simulada) · chromium 153.0.8010.12 · firefox 155.0 · webkit 26.6 · 144 verificações · 0 falha(s)

Simulação local: Bookings, Turnstile e backend na AWS não foram exercitados.

| Navegador | Verificação | Resultado | Detalhe |
|---|---|---|---|
| chromium | agendamento-configurado | OK |  |
| chromium | agendamento-botoes-nas-areas-de-conversao | OK | inicio, contato |
| chromium | agendamento-url-oficial-configurada | OK | https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/ |
| chromium | agendamento-dominio-atual-do-bookings | OK | bookings.cloud.microsoft |
| chromium | agendamento-nova-aba-isolada | OK |  |
| chromium | agendamento-nome-acessivel | OK | 2 link(s) com o nome completo |
| chromium | agendamento-aviso-de-confirmacao | OK |  |
| chromium | agendamento-foco-visivel | OK |  |
| chromium | agendamento-teclado-abre-bookings | OK | https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/ |
| chromium | agendamento-sem-opener-e-sem-referer | OK | {"opener":true,"referrer":"","url":"https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/","refererHeader":null} |
| chromium | agendamento-pagina-de-origem-intacta | OK | nenhuma afirmação de reunião marcada |
| chromium | agendamento-sem-window-open | OK |  |
| chromium | agendamento-atalho-no-dialogo | OK |  |
| chromium | agendamento-servico-indisponivel | OK | página de origem intacta; botão continua disponível para nova tentativa |
| chromium | agendamento-celular | OK | {"overflow":0,"inside":true,"n":4} |
| chromium | pagina-axe-com-agendamento:sage-light | OK | sem violações |
| chromium | pagina-axe-com-agendamento:sakura-dark | OK | sem violações |
| chromium | envio-sem-atalho-de-canal | OK | o envio automático é o único mecanismo do formulário |
| chromium | envio-validacao-email-obrigatorio | OK | nome, e-mail e descrição |
| chromium | envio-armadilha-inacessivel-a-pessoas | OK | {"tabIndex":-1,"hidden":true,"offscreen":true} |
| chromium | envio-revisao-mostra-dados-e-destino | OK |  |
| chromium | envio-aguarda-desafio | OK | botão desabilitado até o token do desafio |
| chromium | envio-nada-enviado-antes-de-confirmar | OK | 0 requisição(ões) à API |
| chromium | axe-revisao | OK | sem violações |
| chromium | envio-estado-enviando | OK | {"busy":true,"status":"Enviando a solicitação. Aguarde a confirmação."} |
| chromium | envio-recebida-so-com-confirmacao-do-servidor | OK | protocolo NK-9CFD4D4A; 1 mensagem(ns) na caixa simulada |
| chromium | envio-sem-duplicidade | OK | 1 POST |
| chromium | envio-dados-so-no-corpo | OK | POST http://127.0.0.1:4178/v1/commercial/requests |
| chromium | envio-conteudo-entregue | OK | Reply-To=pessoa@exemplo.invalid; preenchimento=4386 ms |
| chromium | axe-recebida | OK | sem violações |
| chromium | envio-novo-atendimento-com-formulario-vazio | OK |  |
| chromium | falha-entrega-mensagem-clara | OK |  |
| chromium | falha-alternativa-por-email | OK |  |
| chromium | falha-dados-preservados-no-resumo | OK |  |
| chromium | axe-falha | OK | sem violações |
| chromium | falha-nova-tentativa-mesmo-id-uma-entrega | OK | ids: 13db3cfa, 13db3cfa; 1 entrega(s) |
| chromium | falha-rede-mensagem-clara | OK |  |
| chromium | falha-voltar-e-editar-preserva-dados | OK |  |
| chromium | falha-limite-429 | OK |  |
| chromium | falha-desafio-mensagem | OK | "Tentar novamente" desabilitado até novo token: true |
| chromium | falha-desafio-refeito-e-enviado | OK | desafio feito 3 vez(es); 1 entrega |
| chromium | envio-rapido-demais-recusado | OK | robô simples: recusado sem e-mail; sem "tentar novamente" |
| chromium | desafio-indisponivel-sem-envio-com-alternativa | OK |  |
| chromium | celular-envio-cabe | OK | {"review":{"page":0,"left":0,"right":375},"done":{"page":0,"left":0,"right":375}} |
| chromium | celular-axe-recebida | OK | sem violações |
| chromium | logs-sem-dados-pessoais | OK | 1 linha(s); com dado pessoal: 0 |
| chromium | sem-requisicao-externa-real | OK | Turnstile e Bookings respondidos localmente; nada mais saiu |
| chromium | console-sem-erros | OK | limpo (falhas de rede provocadas pelos testes desconsideradas) |
| firefox | agendamento-configurado | OK |  |
| firefox | agendamento-botoes-nas-areas-de-conversao | OK | inicio, contato |
| firefox | agendamento-url-oficial-configurada | OK | https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/ |
| firefox | agendamento-dominio-atual-do-bookings | OK | bookings.cloud.microsoft |
| firefox | agendamento-nova-aba-isolada | OK |  |
| firefox | agendamento-nome-acessivel | OK | 2 link(s) com o nome completo |
| firefox | agendamento-aviso-de-confirmacao | OK |  |
| firefox | agendamento-foco-visivel | OK |  |
| firefox | agendamento-teclado-abre-bookings | OK | https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/ |
| firefox | agendamento-sem-opener-e-sem-referer | OK | {"opener":true,"referrer":"","url":"https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/","refererHeader":null} |
| firefox | agendamento-pagina-de-origem-intacta | OK | nenhuma afirmação de reunião marcada |
| firefox | agendamento-sem-window-open | OK |  |
| firefox | agendamento-atalho-no-dialogo | OK |  |
| firefox | agendamento-servico-indisponivel | OK | página de origem intacta; botão continua disponível para nova tentativa |
| firefox | agendamento-celular | OK | {"overflow":0,"inside":true,"n":4} |
| firefox | pagina-axe-com-agendamento:sage-light | OK | sem violações |
| firefox | pagina-axe-com-agendamento:sakura-dark | OK | sem violações |
| firefox | envio-sem-atalho-de-canal | OK | o envio automático é o único mecanismo do formulário |
| firefox | envio-validacao-email-obrigatorio | OK | nome, e-mail e descrição |
| firefox | envio-armadilha-inacessivel-a-pessoas | OK | {"tabIndex":-1,"hidden":true,"offscreen":true} |
| firefox | envio-revisao-mostra-dados-e-destino | OK |  |
| firefox | envio-aguarda-desafio | OK | botão desabilitado até o token do desafio |
| firefox | envio-nada-enviado-antes-de-confirmar | OK | 0 requisição(ões) à API |
| firefox | axe-revisao | OK | sem violações |
| firefox | envio-estado-enviando | OK | {"busy":true,"status":"Enviando a solicitação. Aguarde a confirmação."} |
| firefox | envio-recebida-so-com-confirmacao-do-servidor | OK | protocolo NK-46B30CD2; 1 mensagem(ns) na caixa simulada |
| firefox | envio-sem-duplicidade | OK | 1 POST |
| firefox | envio-dados-so-no-corpo | OK | POST http://127.0.0.1:4178/v1/commercial/requests |
| firefox | envio-conteudo-entregue | OK | Reply-To=pessoa@exemplo.invalid; preenchimento=4737 ms |
| firefox | axe-recebida | OK | sem violações |
| firefox | envio-novo-atendimento-com-formulario-vazio | OK |  |
| firefox | falha-entrega-mensagem-clara | OK |  |
| firefox | falha-alternativa-por-email | OK |  |
| firefox | falha-dados-preservados-no-resumo | OK |  |
| firefox | axe-falha | OK | sem violações |
| firefox | falha-nova-tentativa-mesmo-id-uma-entrega | OK | ids: c3367323, c3367323; 1 entrega(s) |
| firefox | falha-rede-mensagem-clara | OK |  |
| firefox | falha-voltar-e-editar-preserva-dados | OK |  |
| firefox | falha-limite-429 | OK |  |
| firefox | falha-desafio-mensagem | OK | "Tentar novamente" desabilitado até novo token: true |
| firefox | falha-desafio-refeito-e-enviado | OK | desafio feito 3 vez(es); 1 entrega |
| firefox | envio-rapido-demais-recusado | OK | robô simples: recusado sem e-mail; sem "tentar novamente" |
| firefox | desafio-indisponivel-sem-envio-com-alternativa | OK |  |
| firefox | celular-envio-cabe | OK | {"review":{"page":0,"left":0,"right":375},"done":{"page":0,"left":0,"right":375}} |
| firefox | celular-axe-recebida | OK | sem violações |
| firefox | logs-sem-dados-pessoais | OK | 2 linha(s); com dado pessoal: 0 |
| firefox | sem-requisicao-externa-real | OK | Turnstile e Bookings respondidos localmente; nada mais saiu |
| firefox | console-sem-erros | OK | limpo (falhas de rede provocadas pelos testes desconsideradas) |
| webkit | agendamento-configurado | OK |  |
| webkit | agendamento-botoes-nas-areas-de-conversao | OK | inicio, contato |
| webkit | agendamento-url-oficial-configurada | OK | https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/ |
| webkit | agendamento-dominio-atual-do-bookings | OK | bookings.cloud.microsoft |
| webkit | agendamento-nova-aba-isolada | OK |  |
| webkit | agendamento-nome-acessivel | OK | 2 link(s) com o nome completo |
| webkit | agendamento-aviso-de-confirmacao | OK |  |
| webkit | agendamento-foco-visivel | OK |  |
| webkit | agendamento-teclado-abre-bookings | OK | https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/ |
| webkit | agendamento-sem-opener-e-sem-referer | OK | {"opener":true,"referrer":"","url":"https://bookings.cloud.microsoft/book/AvaliacaoHomologacao@exemplo.invalid/","refererHeader":null} |
| webkit | agendamento-pagina-de-origem-intacta | OK | nenhuma afirmação de reunião marcada |
| webkit | agendamento-sem-window-open | OK |  |
| webkit | agendamento-atalho-no-dialogo | OK |  |
| webkit | agendamento-servico-indisponivel | OK | página de origem intacta; botão continua disponível para nova tentativa |
| webkit | agendamento-celular | OK | {"overflow":0,"inside":true,"n":4} |
| webkit | pagina-axe-com-agendamento:sage-light | OK | sem violações |
| webkit | pagina-axe-com-agendamento:sakura-dark | OK | sem violações |
| webkit | envio-sem-atalho-de-canal | OK | o envio automático é o único mecanismo do formulário |
| webkit | envio-validacao-email-obrigatorio | OK | nome, e-mail e descrição |
| webkit | envio-armadilha-inacessivel-a-pessoas | OK | {"tabIndex":-1,"hidden":true,"offscreen":true} |
| webkit | envio-revisao-mostra-dados-e-destino | OK |  |
| webkit | envio-aguarda-desafio | OK | botão desabilitado até o token do desafio |
| webkit | envio-nada-enviado-antes-de-confirmar | OK | 0 requisição(ões) à API |
| webkit | axe-revisao | OK | sem violações |
| webkit | envio-estado-enviando | OK | {"busy":true,"status":"Enviando a solicitação. Aguarde a confirmação."} |
| webkit | envio-recebida-so-com-confirmacao-do-servidor | OK | protocolo NK-93BFAA50; 1 mensagem(ns) na caixa simulada |
| webkit | envio-sem-duplicidade | OK | 1 POST |
| webkit | envio-dados-so-no-corpo | OK | POST http://127.0.0.1:4178/v1/commercial/requests |
| webkit | envio-conteudo-entregue | OK | Reply-To=pessoa@exemplo.invalid; preenchimento=5668 ms |
| webkit | axe-recebida | OK | sem violações |
| webkit | envio-novo-atendimento-com-formulario-vazio | OK |  |
| webkit | falha-entrega-mensagem-clara | OK |  |
| webkit | falha-alternativa-por-email | OK |  |
| webkit | falha-dados-preservados-no-resumo | OK |  |
| webkit | axe-falha | OK | sem violações |
| webkit | falha-nova-tentativa-mesmo-id-uma-entrega | OK | ids: 66030cd5, 66030cd5; 1 entrega(s) |
| webkit | falha-rede-mensagem-clara | OK |  |
| webkit | falha-voltar-e-editar-preserva-dados | OK |  |
| webkit | falha-limite-429 | OK |  |
| webkit | falha-desafio-mensagem | OK | "Tentar novamente" desabilitado até novo token: true |
| webkit | falha-desafio-refeito-e-enviado | OK | desafio feito 3 vez(es); 1 entrega |
| webkit | envio-rapido-demais-recusado | OK | robô simples: recusado sem e-mail; sem "tentar novamente" |
| webkit | desafio-indisponivel-sem-envio-com-alternativa | OK |  |
| webkit | celular-envio-cabe | OK | {"review":{"page":0,"left":0,"right":375},"done":{"page":0,"left":0,"right":375}} |
| webkit | celular-axe-recebida | OK | sem violações |
| webkit | logs-sem-dados-pessoais | OK | 2 linha(s); com dado pessoal: 0 |
| webkit | sem-requisicao-externa-real | OK | Turnstile e Bookings respondidos localmente; nada mais saiu |
| webkit | console-sem-erros | OK | limpo (falhas de rede provocadas pelos testes desconsideradas) |
