# Homologação do simulador e do formulário — 2026-10-29T02:59:45.053Z

120 verificações · 0 falha(s) · chromium,firefox,webkit

| Navegador | Verificação | Resultado | Detalhe |
|---|---|---|---|
| chromium | integrado-na-secao-de-precos | OK | {"inPricing":true,"afterCards":true,"title":"Simulador de Investimento — Nekkora Delivery","noForm":true} |
| chromium | inicia-com-zero | OK | {"values":["0","0","0"],"total":"0","result":false,"minusDisabled":true} |
| chromium | calculo-exemplo-obrigatorio | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} |
| chromium | datas-pendentes-previa-sem-elegibilidade | OK | pendente |
| chromium | aviso-de-transparencia | OK | texto obrigatório e economia comercial ≠ operacional |
| chromium | consistente-com-os-cartoes | OK | R$ 1.000 cada · R$ 2.800 cada · sob orçamento individual \| simples:2 automações simples × R$ 1.000 R$ 2.000 · media:1 automação média × R$ 2.800 R$ 2.800 |
| chromium | agendar-uma-conversa-bookings-oficial | OK | {"href":"https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/","target":"_blank","rel":"noopener noreferrer","text":"Agendar uma conversa (abre o Microsoft Bookings em outra aba)"} |
| chromium | resultado-anunciado-em-regiao-viva | OK | Resultado da simulação atualizado. 2 automações simples (R$ 1.000 cada). 1 automação média (R$ 2.800 cada). Investimento |
| chromium | campanha-vigente-precos-de-lancamento | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} |
| chromium | campanha-futura-so-preco-padrao | OK | {"estimativa":"R$ 6.500"} ·  |
| chromium | campanha-encerrada-so-preco-padrao | OK | {"estimativa":"R$ 6.500"} ·  |
| chromium | so-complexas-sem-valor-inventado | OK |  · Preços de lançamento em vigor para solicitações recebidas durante a campanha. ·  |
| chromium | alterar-e-recalcular | OK | resultado oculto após mudança=true; aviso=1 |
| chromium | complexas-com-outras-subtotal-estimado | OK | As automações complexas exigem orçamento individual e não entram no valor acima, que não é o preço completo da contratação. |
| chromium | protecao-contra-valores-invalidos | OK | -5→5 · abc→ · 2,5→20 · 1e3→13 · 999→20 · 007→7 · vazio+saída→0 · máximo=20 |
| chromium | limpar-e-calcular-vazio | OK | {"values":["0","0","0"],"result":false} |
| chromium | teclado-completo | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} · foco visível=true · {"role":"spinbutton","now":"1","max":"20","name":"Automações médias"} |
| chromium | ordem-de-tab | OK | Diminuir automações simples → simples → Aumentar automações simples → Diminuir automações médias → media → Aumentar automações médias → Diminuir automações complexas → complexa → Aumentar automações complexas → Limpar simulação → Calcular meu investimento |
| chromium | responsivo-sem-rolagem-horizontal:celular-claro | OK | excesso=0px; controles fora da tela=0 |
| chromium | sem-armazenamento:celular-claro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| chromium | sem-envio-externo:celular-claro | OK | nenhuma requisição durante a simulação |
| chromium | axe-simulador:celular-claro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| chromium | responsivo-sem-rolagem-horizontal:celular-escuro | OK | excesso=0px; controles fora da tela=0 |
| chromium | sem-armazenamento:celular-escuro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| chromium | sem-envio-externo:celular-escuro | OK | nenhuma requisição durante a simulação |
| chromium | axe-simulador:celular-escuro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| chromium | responsivo-sem-rolagem-horizontal:tablet-claro | OK | excesso=0px; controles fora da tela=0 |
| chromium | sem-armazenamento:tablet-claro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| chromium | sem-envio-externo:tablet-claro | OK | nenhuma requisição durante a simulação |
| chromium | axe-simulador:tablet-claro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| chromium | responsivo-sem-rolagem-horizontal:desktop-escuro | OK | excesso=0px; controles fora da tela=0 |
| chromium | sem-armazenamento:desktop-escuro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| chromium | sem-envio-externo:desktop-escuro | OK | nenhuma requisição durante a simulação |
| chromium | axe-simulador:desktop-escuro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| chromium | formulario-recebe-resumo-opcional | OK | desmarcado por padrão=true |
| chromium | resumo-so-com-a-escolha-e-revisado-antes | OK | sem marcar: ausente=true; marcado: na mensagem e no mailto; requisições=0 |
| chromium | tipo-escolhido-preservado-ao-reabrir | OK | reaberto pelo topo, a escolha anterior continua |
| chromium | hosting-formulario-adequado | OK | hospedagem marcada=true |
| chromium | sem-requisicoes-externas | OK | nenhuma |
| chromium | console-sem-erros | OK | limpo |
| firefox | integrado-na-secao-de-precos | OK | {"inPricing":true,"afterCards":true,"title":"Simulador de Investimento — Nekkora Delivery","noForm":true} |
| firefox | inicia-com-zero | OK | {"values":["0","0","0"],"total":"0","result":false,"minusDisabled":true} |
| firefox | calculo-exemplo-obrigatorio | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} |
| firefox | datas-pendentes-previa-sem-elegibilidade | OK | pendente |
| firefox | aviso-de-transparencia | OK | texto obrigatório e economia comercial ≠ operacional |
| firefox | consistente-com-os-cartoes | OK | R$ 1.000 cada · R$ 2.800 cada · sob orçamento individual \| simples:2 automações simples × R$ 1.000 R$ 2.000 · media:1 automação média × R$ 2.800 R$ 2.800 |
| firefox | agendar-uma-conversa-bookings-oficial | OK | {"href":"https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/","target":"_blank","rel":"noopener noreferrer","text":"Agendar uma conversa (abre o Microsoft Bookings em outra aba)"} |
| firefox | resultado-anunciado-em-regiao-viva | OK | Resultado da simulação atualizado. 2 automações simples (R$ 1.000 cada). 1 automação média (R$ 2.800 cada). Investimento |
| firefox | campanha-vigente-precos-de-lancamento | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} |
| firefox | campanha-futura-so-preco-padrao | OK | {"estimativa":"R$ 6.500"} ·  |
| firefox | campanha-encerrada-so-preco-padrao | OK | {"estimativa":"R$ 6.500"} ·  |
| firefox | so-complexas-sem-valor-inventado | OK |  · Preços de lançamento em vigor para solicitações recebidas durante a campanha. ·  |
| firefox | alterar-e-recalcular | OK | resultado oculto após mudança=true; aviso=1 |
| firefox | complexas-com-outras-subtotal-estimado | OK | As automações complexas exigem orçamento individual e não entram no valor acima, que não é o preço completo da contratação. |
| firefox | protecao-contra-valores-invalidos | OK | -5→5 · abc→ · 2,5→20 · 1e3→13 · 999→20 · 007→7 · vazio+saída→0 · máximo=20 |
| firefox | limpar-e-calcular-vazio | OK | {"values":["0","0","0"],"result":false} |
| firefox | teclado-completo | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} · foco visível=true · {"role":"spinbutton","now":"1","max":"20","name":"Automações médias"} |
| firefox | ordem-de-tab | OK | Diminuir automações simples → simples → Aumentar automações simples → Diminuir automações médias → media → Aumentar automações médias → Diminuir automações complexas → complexa → Aumentar automações complexas → Limpar simulação → Calcular meu investimento |
| firefox | responsivo-sem-rolagem-horizontal:celular-claro | OK | excesso=0px; controles fora da tela=0 |
| firefox | sem-armazenamento:celular-claro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| firefox | sem-envio-externo:celular-claro | OK | nenhuma requisição durante a simulação |
| firefox | axe-simulador:celular-claro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| firefox | responsivo-sem-rolagem-horizontal:celular-escuro | OK | excesso=0px; controles fora da tela=0 |
| firefox | sem-armazenamento:celular-escuro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| firefox | sem-envio-externo:celular-escuro | OK | nenhuma requisição durante a simulação |
| firefox | axe-simulador:celular-escuro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| firefox | responsivo-sem-rolagem-horizontal:tablet-claro | OK | excesso=0px; controles fora da tela=0 |
| firefox | sem-armazenamento:tablet-claro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| firefox | sem-envio-externo:tablet-claro | OK | nenhuma requisição durante a simulação |
| firefox | axe-simulador:tablet-claro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| firefox | responsivo-sem-rolagem-horizontal:desktop-escuro | OK | excesso=0px; controles fora da tela=0 |
| firefox | sem-armazenamento:desktop-escuro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| firefox | sem-envio-externo:desktop-escuro | OK | nenhuma requisição durante a simulação |
| firefox | axe-simulador:desktop-escuro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| firefox | formulario-recebe-resumo-opcional | OK | desmarcado por padrão=true |
| firefox | resumo-so-com-a-escolha-e-revisado-antes | OK | sem marcar: ausente=true; marcado: na mensagem e no mailto; requisições=0 |
| firefox | tipo-escolhido-preservado-ao-reabrir | OK | reaberto pelo topo, a escolha anterior continua |
| firefox | hosting-formulario-adequado | OK | hospedagem marcada=true |
| firefox | sem-requisicoes-externas | OK | nenhuma |
| firefox | console-sem-erros | OK | limpo |
| webkit | integrado-na-secao-de-precos | OK | {"inPricing":true,"afterCards":true,"title":"Simulador de Investimento — Nekkora Delivery","noForm":true} |
| webkit | inicia-com-zero | OK | {"values":["0","0","0"],"total":"0","result":false,"minusDisabled":true} |
| webkit | calculo-exemplo-obrigatorio | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} |
| webkit | datas-pendentes-previa-sem-elegibilidade | OK | pendente |
| webkit | aviso-de-transparencia | OK | texto obrigatório e economia comercial ≠ operacional |
| webkit | consistente-com-os-cartoes | OK | R$ 1.000 cada · R$ 2.800 cada · sob orçamento individual \| simples:2 automações simples × R$ 1.000 R$ 2.000 · media:1 automação média × R$ 2.800 R$ 2.800 |
| webkit | agendar-uma-conversa-bookings-oficial | OK | {"href":"https://bookings.cloud.microsoft/book/Nekkora@nekkora.com/","target":"_blank","rel":"noopener noreferrer","text":"Agendar uma conversa (abre o Microsoft Bookings em outra aba)"} |
| webkit | resultado-anunciado-em-regiao-viva | OK | Resultado da simulação atualizado. 2 automações simples (R$ 1.000 cada). 1 automação média (R$ 2.800 cada). Investimento |
| webkit | campanha-vigente-precos-de-lancamento | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} |
| webkit | campanha-futura-so-preco-padrao | OK | {"estimativa":"R$ 6.500"} ·  |
| webkit | campanha-encerrada-so-preco-padrao | OK | {"estimativa":"R$ 6.500"} ·  |
| webkit | so-complexas-sem-valor-inventado | OK |  · Preços de lançamento em vigor para solicitações recebidas durante a campanha. ·  |
| webkit | alterar-e-recalcular | OK | resultado oculto após mudança=true; aviso=1 |
| webkit | complexas-com-outras-subtotal-estimado | OK | As automações complexas exigem orçamento individual e não entram no valor acima, que não é o preço completo da contratação. |
| webkit | protecao-contra-valores-invalidos | OK | -5→5 · abc→ · 2,5→20 · 1e3→13 · 999→20 · 007→7 · vazio+saída→0 · máximo=20 |
| webkit | limpar-e-calcular-vazio | OK | {"values":["0","0","0"],"result":false} |
| webkit | teclado-completo | OK | {"estimativa":"R$ 4.800","padrao":"R$ 6.500","economia":"R$ 1.700","percentual":"26,15%"} · foco visível=true · {"role":"spinbutton","now":"1","max":"20","name":"Automações médias"} |
| webkit | ordem-de-tab | OK | Diminuir automações simples → simples → Aumentar automações simples → Diminuir automações médias → media → Aumentar automações médias → Diminuir automações complexas → complexa → Aumentar automações complexas → Limpar simulação → Calcular meu investimento |
| webkit | responsivo-sem-rolagem-horizontal:celular-claro | OK | excesso=0px; controles fora da tela=0 |
| webkit | sem-armazenamento:celular-claro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| webkit | sem-envio-externo:celular-claro | OK | nenhuma requisição durante a simulação |
| webkit | axe-simulador:celular-claro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| webkit | responsivo-sem-rolagem-horizontal:celular-escuro | OK | excesso=0px; controles fora da tela=0 |
| webkit | sem-armazenamento:celular-escuro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| webkit | sem-envio-externo:celular-escuro | OK | nenhuma requisição durante a simulação |
| webkit | axe-simulador:celular-escuro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| webkit | responsivo-sem-rolagem-horizontal:tablet-claro | OK | excesso=0px; controles fora da tela=0 |
| webkit | sem-armazenamento:tablet-claro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| webkit | sem-envio-externo:tablet-claro | OK | nenhuma requisição durante a simulação |
| webkit | axe-simulador:tablet-claro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| webkit | responsivo-sem-rolagem-horizontal:desktop-escuro | OK | excesso=0px; controles fora da tela=0 |
| webkit | sem-armazenamento:desktop-escuro | OK | localStorage=nekkora-commercial-tema; sessionStorage=—; cookie=—; IndexedDB=— |
| webkit | sem-envio-externo:desktop-escuro | OK | nenhuma requisição durante a simulação |
| webkit | axe-simulador:desktop-escuro | OK | sem violações (1 nó(s) de contraste indeterminado) |
| webkit | formulario-recebe-resumo-opcional | OK | desmarcado por padrão=true |
| webkit | resumo-so-com-a-escolha-e-revisado-antes | OK | sem marcar: ausente=true; marcado: na mensagem e no mailto; requisições=0 |
| webkit | tipo-escolhido-preservado-ao-reabrir | OK | reaberto pelo topo, a escolha anterior continua |
| webkit | hosting-formulario-adequado | OK | hospedagem marcada=true |
| webkit | sem-requisicoes-externas | OK | nenhuma |
| webkit | console-sem-erros | OK | limpo |

Capturas: chromium-simulador-inicial-producao.png, chromium-simulador-pendente-producao.png, chromium-simulador-vigente.png, chromium-simulador-futura.png, chromium-simulador-encerrada.png, chromium-simulador-so-complexas.png, chromium-simulador-misto-com-complexas.png, chromium-simulador-celular-claro.png, chromium-simulador-celular-escuro.png, chromium-simulador-tablet-claro.png, chromium-simulador-desktop-escuro.png, chromium-formulario-com-resumo-da-simulacao.png, chromium-formulario-confirmacao-com-simulacao.png, chromium-formulario-hosting.png, firefox-simulador-inicial-producao.png, firefox-simulador-pendente-producao.png, firefox-simulador-vigente.png, firefox-simulador-futura.png, firefox-simulador-encerrada.png, firefox-simulador-so-complexas.png, firefox-simulador-misto-com-complexas.png, firefox-simulador-celular-claro.png, firefox-simulador-celular-escuro.png, firefox-simulador-tablet-claro.png, firefox-simulador-desktop-escuro.png, firefox-formulario-com-resumo-da-simulacao.png, firefox-formulario-confirmacao-com-simulacao.png, firefox-formulario-hosting.png, webkit-simulador-inicial-producao.png, webkit-simulador-pendente-producao.png, webkit-simulador-vigente.png, webkit-simulador-futura.png, webkit-simulador-encerrada.png, webkit-simulador-so-complexas.png, webkit-simulador-misto-com-complexas.png, webkit-simulador-celular-claro.png, webkit-simulador-celular-escuro.png, webkit-simulador-tablet-claro.png, webkit-simulador-desktop-escuro.png, webkit-formulario-com-resumo-da-simulacao.png, webkit-formulario-confirmacao-com-simulacao.png, webkit-formulario-hosting.png
