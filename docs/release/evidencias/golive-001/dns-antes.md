# GOLIVE-001 — DNS público antes da publicação (somente leitura)

Comando: `node scripts/aws/diagnostico-dns.mjs --fase antes`. Nenhuma alteração na Cloudflare.

Diagnóstico de DNS (somente leitura) — fase "antes", resolvedor https://cloudflare-dns.com/dns-query, 2026-11-06T13:21:16.273Z

| ID | Nível | Verificação | Detalhe |
|---|---|---|---|
| N01 | ok | Delegação na Cloudflare | bethany.ns.cloudflare.com, micah.ns.cloudflare.com |
| M01 | ok | MX do Microsoft 365 | 0 nekkora-com.mail.protection.outlook.com |
| M02 | ok | TXT de verificação do domínio no Microsoft 365 | ms=ms38126768 |
| M03 | ok | SPF único, incluindo o Microsoft 365 | v=spf1 include:spf.protection.outlook.com ~all |
| M04 | ok | autodiscover → Microsoft 365 | autodiscover.outlook.com |
| M05 | ok | DKIM selector1 do Microsoft 365 | selector1-nekkora-com._domainkey.radiantsai.n-v1.dkim.mail.microsoft |
| M06 | ok | DKIM selector2 do Microsoft 365 | selector2-nekkora-com._domainkey.radiantsai.n-v1.dkim.mail.microsoft |
| M07 | ok | DMARC (recomendado, não bloqueia o lançamento) | v=dmarc1; p=none; rua=mailto:dmarc@nekkora.com |
| K01 | ok | CNAME de validação do ACM (renovação automática) — nekkora.com | _32e05c72a0ed2d70066a5a797e2f9420.wzccmgtwzk.acm-validations.aws |
| K02 | ok | CNAME de validação do ACM (renovação automática) — www.nekkora.com | _ec343f04889a25353e6371b6031e3b24.wzccmgtwzk.acm-validations.aws |
| S00 | ok | Distribuição do CloudFront resolve | dnl1wnnmoqhaj.cloudfront.net: 4 IPv4 |
| S01 | pendente | nekkora.com → CloudFront | sem A/AAAA/CNAME: o site ainda não está no DNS (esperado antes da autorização; registro a criar) |
| S02 | pendente | www.nekkora.com → CloudFront | sem registro: criar CNAME www → dnl1wnnmoqhaj.cloudfront.net (DNS only) |

11 ok, 2 pendente(s), 0 falha(s), 0 info
