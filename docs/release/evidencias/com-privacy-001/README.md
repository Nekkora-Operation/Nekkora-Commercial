# NEKKORA-COM-PRIVACY-001 — evidências da homologação do Bookings e das gravações do Teams

**Data:** 05/11/2026 · **Fonte:** verificação feita pela titular no Microsoft 365 (Bookings, centro de administração
do Teams, reunião real de teste e SharePoint/OneDrive) e confirmada por ela nesta missão. **O agente não acessou nem
alterou o Microsoft 365.**

## O que esta pasta não guarda (de propósito)

Para não publicar dados pessoais no GitHub, esta pasta **não** contém e **não deve** receber:

- URLs de compartilhamento, de gravação ou de reunião do Teams (nem links do SharePoint/OneDrive);
- gravações, transcrições, legendas ou trechos de áudio e vídeo;
- nomes, e-mails, imagens ou vozes de participantes;
- capturas de tela que mostrem qualquer um dos itens acima.

O [`.gitignore`](.gitignore) desta pasta recusa arquivos de mídia e de transcrição. Se a titular quiser guardar
capturas, elas ficam fora do repositório ou são recortadas/anonimizadas antes.

## Verificações

| # | Controle | Resultado | Como foi verificado | Limite |
|---|---|---|---|---|
| E-01 | Serviço do Bookings | "Conversa inicial — Nekkora Delivery", 30 min, reunião pelo Teams | Configuração do serviço no Bookings | — |
| E-02 | Conta responsável pela reunião | `nicolly@nekkora.com` | Configuração do Bookings | Conta corporativa da titular |
| E-03 | Política de reunião do Teams | Política personalizada `Nekkora-Commercial` criada e **atribuída** à conta responsável | Centro de administração do Teams | Os demais parâmetros da política não foram transcritos aqui |
| E-04 | Concordância explícita com a gravação | O Teams **exibiu a solicitação de concordância** | Reunião real de teste | Recusa por participante externo não testada (OPS-05) |
| E-05 | Gravação automática | **Não** configurada | Decisão da titular | — |
| E-06 | Expiração da gravação | Expiração padrão de **30 dias** após a reunião | **Visualmente**, no SharePoint, no arquivo de teste | **Eliminação definitiva não comprovada** (OPS-07) |
| E-07 | Acesso público por link | **Removido** | Painel de compartilhamento do arquivo de teste | Só o arquivo testado (OPS-08) |
| E-08 | Compartilhamento com grupos | **Nenhum** identificado | Painel de acesso do arquivo de teste | Só o arquivo testado (OPS-08) |
| E-09 | Domínio do tenant | Domínio histórico `radiantsai-my.sharepoint.com`, administrado pela titular | — | **Não renomear** (decisão da titular) |

## Decisões registradas com estas evidências

- Reuniões comerciais **podem** ser gravadas, com aviso e concordância específica dos participantes.
- Retenção: gravações com prazo padrão de 30 dias; contatos sem contratação até seis meses; reservas do Bookings até
  90 dias.
- Revisão e eliminação inicialmente **manuais**, sob responsabilidade da titular.

## Homologação da página (texto do aviso)

Commit `679d5c3` (árvore limpa, já com a `main` integrada e os ajustes da revisão do PR #12), artefato servido por `scripts/servidor-cloudfront-local.mjs`, relógio do navegador em
15/11/2026 (campanha vigente). Execução local em 05/11/2026, Windows 11.

| Comando | Resultado |
|---|---|
| `npm test` | 233 testes, 0 falhas |
| `npm run check` | OK |
| `homologacao.mjs` — Chromium, Firefox, WebKit | 90 + 90 + 90 verificações, 0 falhas (inclui `privacidade-visivel`, `sem-alegacoes-proibidas`, axe e `artefato-corresponde-ao-codigo` = `679d5c3`) |
| `verificar-publicacao.mjs --dist dist` | **Bloqueado** — PUB-20, PUB-19, PUB-17, PUB-09 (aprovação do aviso), PUB-18, PUB-10 |

O item "Gravação da conversa" está no bundle (`dist/assets/index-*.js`). Capturas não foram versionadas.

## Situação

Controles técnicos homologados. **Não** aprovados: `aprovacoes.avisoDePrivacidade`, `condicoesComerciais` e
`publicacao` continuam `false`. Pendências jurídicas (JUR-06 a JUR-10) e operacionais (OPS-01, OPS-02, OPS-05 a
OPS-08) em [`COM-RELEASE-PENDENCIAS.md` §2c](../../COM-RELEASE-PENDENCIAS.md).
