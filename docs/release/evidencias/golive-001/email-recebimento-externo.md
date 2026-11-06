# CTL-05 / REP-04 — teste externo de recebimento em `contato@nekkora.com`

**Estado: PENDENTE.** O teste ainda não foi executado. A titular o executa e Claude registra o resultado aqui. Nenhum
campo pode ser preenchido sem evidência.

## Pré-condições já verificadas (DNS público, 06/11/2026, somente leitura)

| Registro | Valor | Resultado |
|---|---|---|
| MX `nekkora.com` | `0 nekkora-com.mail.protection.outlook.com` | Microsoft 365 |
| SPF | `v=spf1 include:spf.protection.outlook.com ~all` (um só) | ok |
| DMARC | `v=DMARC1; p=none; rua=mailto:dmarc@nekkora.com` | presente |

O DNS correto **não comprova** o recebimento.

## Roteiro (titular)

1. De uma conta **fora** do tenant `nekkora.com` (por exemplo, Gmail ou Outlook.com pessoal), enviar uma mensagem
   para `contato@nekkora.com` com o assunto `Teste CTL-05 <data>`.
2. Na caixa `contato@`, confirmar se a mensagem chegou na **Caixa de Entrada** (e não em Lixo eletrônico nem na
   quarentena do Defender) e anotar o horário.
3. Responder de `contato@` e confirmar que a resposta chegou à conta externa, fora do spam.
4. No site (pré-visualização da PR ou CloudFront depois do deploy), clicar em "Abrir no e-mail" num computador e
   num celular com aplicativo de e-mail configurado. Conferir o destinatário `contato@nekkora.com` e o texto
   pré-preenchido. Esse envio também conta como teste externo, se sair de conta externa.
5. Excluir as mensagens de teste depois do registro (procedimento de retenção).

## Registro do resultado (sem dados pessoais: indicar só o **domínio** do remetente)

| Campo | Valor |
|---|---|
| Data e hora do envio (Brasília) | |
| Domínio do remetente | |
| Pasta em que chegou | |
| Atraso aproximado | |
| Resposta recebida pela conta externa (pasta) | |
| "Abrir no e-mail", computador (aplicativo) | |
| "Abrir no e-mail", celular (aplicativo) | |
| Capturas (sem endereços pessoais) | |
| Conclusão | |
