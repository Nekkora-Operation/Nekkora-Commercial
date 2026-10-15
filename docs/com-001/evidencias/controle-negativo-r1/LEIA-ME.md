# Controle negativo — abertura do WhatsApp (revisão de encerramento da R1)

Build temporário com a implementação **anterior** (`window.open(url, '_blank')` seguido de `opener = null`), canais de
teste em `src/config.ts` (WhatsApp e e-mail; LinkedIn não configurado) e fontes restauradas em seguida. Executado com
`scripts/homologacao-canais.mjs`, o `wa.me` sendo respondido por página local.

Resultado: **16 verificações, 2 falhas**, ambas esperadas:

- `aba-sem-referer` — **FALHA**: a aba recebia `Referer: http://127.0.0.1:4176/` (e `document.referrer`). Esse é o
  vazamento que a volta de `noopener,noreferrer` elimina; na versão final a mesma verificação passa (Referer ausente).
- `linkedin-perfil-exibido` — falha esperada: o controle não configurou LinkedIn.

`aba-sem-opener` passou também no controle: no Chromium, a anulação do `opener` logo após o `open` acontece antes
de a página externa carregar. A corrida apontada na revisão não foi reproduzida, mas não há garantia disso entre
navegadores, e por isso a correção aplica `noopener` desde a abertura.
