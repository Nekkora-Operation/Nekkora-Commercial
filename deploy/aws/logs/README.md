# LOG-01 — registros de acesso do CloudFront (standard logging v2)

**Estado: APLICADO E CONFERIDO em 10/11/2026.** A titular executou o §3 no CloudShell e conferiu o §4.
- Entrega `BMl6sEOG0xUZrwzd`; os critérios do §4 foram atendidos.
- No critério 5, a entrega real foi comprovada, mas o intervalo de 30 minutos **não foi medido**.
- Registro: [`log-01-2026-11-10.md`](../../../docs/release/evidencias/golive-001/log-01-2026-11-10.md).
- Com isso, o texto [PV-12] do aviso pode ser integrado. A aprovação dele continua na PUB-09 e na PUB-17.
- Qualquer nova alteração na AWS depende de **autorização específica da titular**.

## 1. Fundamento e campos mínimos

| Fonte | O que exige |
|---|---|
| Lei 12.965/2014, art. 5º, VIII, e art. 15 | Guarda, por **6 meses**, de "data e hora de uso de uma determinada aplicação de internet a partir de um determinado endereço IP", sob sigilo, em ambiente controlado |
| Decreto 8.771/2016, art. 15-A (incluído pelo Decreto 12.975/2026) | A guarda do IP **abrange a porta lógica de origem**, quando necessária à identificação. No mesmo sentido: STJ, REsp 1.777.769-SP |
| LGPD, art. 6º, III, e art. 7º, II | Só o necessário; a base legal é o cumprimento de obrigação legal |

**Campos escolhidos** (`recordFields`): `date`, `time` (UTC), `c-ip`, `c-port` e `x-host-header`.

- Os quatro primeiros cumprem o art. 15 e o art. 15-A.
- `x-host-header` identifica qual aplicação foi acessada: o domínio ou o endereço `cloudfront.net`.
- **Ficam de fora**, por minimização: URL e query, user agent, referer, cookies e país.
- A AWS permite mudar os campos depois (`UpdateDeliveryConfiguration`, efeito em até 12 h). Mas qualquer mudança aqui exige, **antes**, mudar o aviso [PV-12] e o teste `aviso-logs.test.mjs`. O formato (`json`) não pode ser mudado.
- `c-ip` é o IP que abriu a conexão com o CloudFront. Se o visitante usar proxy, é o IP do proxy. Por isso o aviso diz "endereço IP e porta de origem da conexão".

Definição versionada: [`entrega.json`](entrega.json).

## 2. Decisões técnicas

| Item | Valor | Por quê |
|---|---|---|
| Bucket | novo e exclusivo, `${LOGS_BUCKET}` (sugestão: `nekkora-commercial-registros-acesso`), em **`sa-east-1`** | separado do bucket do site; armazenado no Brasil |
| Bloqueio público | os quatro *Block Public Access* ativos | sigilo (art. 15) |
| Object Ownership | `BucketOwnerEnforced` (ACLs desabilitadas) | O v2 usa bucket policy, não ACL. O S3 aceita o cabeçalho `bucket-owner-full-control` com ACLs desabilitadas. **Conferir no §4** que os objetos chegam |
| Criptografia | SSE-S3 (`AES256`) | Com SSE-KMS seria preciso uma chave gerenciada pelo cliente (custo) |
| Política | [`politica-bucket-logs.json`](politica-bucket-logs.json): só `delivery.logs.amazonaws.com` grava (`s3:PutObject`), em `AWSLogs/<conta>/*`, restrito à conta (`aws:SourceAccount`) e a **esta** *delivery source* (`aws:SourceArn`); HTTPS obrigatório. Ninguém mais tem permissão concedida pela política | menor privilégio; o prefixo é o da política que a própria AWS gera (R2). Com o `suffixPath` não está documentado se as chaves passam por `CloudFront/`; por isso a política usa o prefixo da conta |
| Retenção | [`ciclo-de-vida.json`](ciclo-de-vida.json): expiração em **190 dias**, aplicada ao **bucket inteiro** (`"Filter": {}`), que é exclusivo dos logs | 6 meses mais margem. O S3 conta os dias a partir da criação de cada arquivo, arredonda para a meia-noite UTC seguinte e remove os objetos de forma assíncrona, sem cobrar o atraso. O filtro vazio garante a expiração mesmo que o caminho das chaves seja diferente do esperado |
| Versionamento | desligado | evita cópias que escapariam da expiração |
| Acesso | só a titular (console e CloudShell). As roles de deploy e de auditoria **não** leem os objetos | sigilo |
| Região da API | `us-east-1`, que é exigência do CloudFront para o v2, com entrega cruzada para `sa-east-1` | documentação AWS (standard-logging) |
| Formato | `json`; não pode ser mudado depois | leitura simples |

**Custo (fontes oficiais, R2):**

- **CloudFront.** O guia do CloudFront (standard-logging, seção Pricing) diz: "There are no additional charges for log
  delivery to Amazon S3, though you incur Amazon S3 charges for storing and accessing the log files". Só a opção
  Parquet gera cobrança do CloudWatch. Por isso a configuração usa `json`, sem Parquet.
- **CloudWatch Logs.** A página genérica de *vended logs* diz que "CloudWatch delivery charges apply" também para o
  S3. As duas fontes **divergem**, e o valor por GB não estava legível na página de preços.
- **No volume da V1**, mesmo pela leitura menos favorável, a conta é de poucos MB por mês. O custo fica em centavos de
  dólar, mais o armazenamento S3 Standard, que não tem duração mínima cobrada.
- **Expiração e remoção** não são cobradas, nem o período entre a data de expiração e a remoção efetiva.
- **Controle:** criar um alerta do AWS Budgets (gratuito) de US$ 1 por mês para a conta e, na fatura do primeiro mês,
  conferir as linhas `S3-Egress-Bytes` / *Vended Logs* (critério 6 do §4).

**Transferência internacional:** a entrega v2 é configurada em `us-east-1`, e a AWS não informa se os registros
passam por lá antes de chegar ao bucket. Por isso o fluxo entra na análise da [JUR-07](../../../docs/release/NEKKORA-COM-GOLIVE-001-JUR-07.md).

## 3. Aplicação (titular, AWS CloudShell, **só depois da autorização**)

Quem executa precisa de `s3:CreateBucket`/`Put*` no novo bucket, de `logs:PutDeliverySource`,
`logs:PutDeliveryDestination` e `logs:CreateDelivery`, e de `cloudfront:AllowVendedLogDeliveryForResource` na
distribuição.

```bash
export AWS_ACCOUNT_ID=055408888315 AWS_CLOUDFRONT_DISTRIBUTION_ID=E3TZD2P6FOEWWR LOGS_BUCKET=nekkora-commercial-registros-acesso
sub() { sed -e "s/\${AWS_ACCOUNT_ID}/$AWS_ACCOUNT_ID/g" -e "s/\${LOGS_BUCKET}/$LOGS_BUCKET/g" "$1"; }

# 3.1 Bucket privado em sa-east-1
aws s3api create-bucket --bucket "$LOGS_BUCKET" --region sa-east-1 --create-bucket-configuration LocationConstraint=sa-east-1
aws s3api put-public-access-block --bucket "$LOGS_BUCKET" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-ownership-controls --bucket "$LOGS_BUCKET" --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'
aws s3api put-bucket-encryption --bucket "$LOGS_BUCKET" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-lifecycle-configuration --bucket "$LOGS_BUCKET" --lifecycle-configuration file://deploy/aws/logs/ciclo-de-vida.json
sub deploy/aws/logs/politica-bucket-logs.json > /tmp/pol.json && aws s3api put-bucket-policy --bucket "$LOGS_BUCKET" --policy file:///tmp/pol.json

# 3.2 Entrega v2 (API em us-east-1)
aws logs put-delivery-source --region us-east-1 --name nekkora-commercial-cloudfront --log-type ACCESS_LOGS \
  --resource-arn "arn:aws:cloudfront::$AWS_ACCOUNT_ID:distribution/$AWS_CLOUDFRONT_DISTRIBUTION_ID"
DEST_ARN=$(aws logs put-delivery-destination --region us-east-1 --name nekkora-commercial-registros-s3 --output-format json \
  --delivery-destination-configuration "destinationResourceArn=arn:aws:s3:::$LOGS_BUCKET" --query deliveryDestination.arn --output text)
aws logs create-delivery --region us-east-1 --delivery-source-name nekkora-commercial-cloudfront --delivery-destination-arn "$DEST_ARN" \
  --record-fields date time c-ip c-port x-host-header \
  --s3-delivery-configuration '{"suffixPath":"{DistributionId}/{yyyy}/{MM}/{dd}","enableHiveCompatiblePath":false}'
```

`--s3-delivery-configuration` vai em **JSON**. Na sintaxe *shorthand* (`suffixPath=...,enableHiveCompatiblePath=...`),
o CLI tenta interpretar as chaves de `{DistributionId}/{yyyy}/{MM}/{dd}` e o comando falha. O conteúdo é o mesmo de
`delivery.s3DeliveryConfiguration` em [`entrega.json`](entrega.json). Corrigido em 10/11/2026, depois da aplicação.

## 4. Conferência (só leitura; a evidência vai sem IPs)

```bash
aws logs describe-deliveries --region us-east-1 --query 'deliveries[?deliverySourceName==`nekkora-commercial-cloudfront`].[id,recordFields]'
aws s3api get-public-access-block --bucket "$LOGS_BUCKET"
aws s3api get-bucket-ownership-controls --bucket "$LOGS_BUCKET"
aws s3api get-bucket-lifecycle-configuration --bucket "$LOGS_BUCKET"
aws s3api get-bucket-location --bucket "$LOGS_BUCKET"            # "sa-east-1"
# Acesse https://dnl1wnnmoqhaj.cloudfront.net/ e espere alguns minutos:
aws s3api get-bucket-policy-status --bucket "$LOGS_BUCKET"       # "IsPublic": false
aws s3 ls "s3://$LOGS_BUCKET/AWSLogs/$AWS_ACCOUNT_ID/" --recursive | tail -3
# Só os NOMES dos campos do primeiro registro (nenhum IP vai para a evidência):
OBJ=$(aws s3 ls "s3://$LOGS_BUCKET/AWSLogs/$AWS_ACCOUNT_ID/" --recursive | tail -1 | awk '{print $4}')
aws s3 cp "s3://$LOGS_BUCKET/$OBJ" - | (gunzip 2>/dev/null || cat) | head -1 | jq -c 'keys'
#   esperado: ["c-ip","c-port","date","time","x-host-header"]
```

Critérios objetivos para dar a LOG-01 como aplicada. Todos são necessários, e a saída de cada comando entra na
evidência `docs/release/evidencias/golive-001/log-01-<data>.md`, **sem IPs**:

1. `describe-deliveries` mostra uma entrega com `recordFields` = exatamente `date, time, c-ip, c-port, x-host-header`;
2. `get-bucket-location` = `sa-east-1`;
3. os quatro *Block Public Access* estão `true`, `IsPublic` = `false` e `ObjectOwnership` = `BucketOwnerEnforced`;
4. o ciclo de vida tem uma regra `Enabled`, com `Expiration.Days` = 190, igual ao `ciclo-de-vida.json`;
5. pelo menos um objeto chegou em até 30 minutos depois do acesso de teste, e o `jq 'keys'` mostra só os 5 campos.
   Se nada chegar, o `BucketOwnerEnforced` ou o prefixo da política são os primeiros suspeitos: desfazer (§5) e
   avisar Claude, **sem** afrouxar a política;
6. o alerta do Budgets está criado. Na primeira fatura, conferir a cobrança de entrega, se houver;
7. a auditoria AWS dá 0 falha.

Só depois disso o texto [PV-12] pode ser integrado e aprovado (PUB-09 e PUB-17).

**Limite da auditoria automática:** a C13 só enxerga o logging legado. Para que a auditoria confira o v2 sozinha,
a role `nekkora-commercial-auditoria` precisaria de `logs:DescribeDeliveries`, `logs:DescribeDeliverySources` e
`logs:DescribeDeliveryDestinations`, de `s3:GetLifecycleConfiguration`/`GetBucketPublicAccessBlock` no novo bucket
e do SDK do CloudWatch Logs. É uma melhoria futura; até lá vale a conferência manual acima.

## 5. Desfazer

```bash
aws logs delete-delivery --region us-east-1 --id <id do describe-deliveries>
aws logs delete-delivery-destination --region us-east-1 --delivery-destination-name nekkora-commercial-registros-s3
aws logs delete-delivery-source --region us-east-1 --name nekkora-commercial-cloudfront
```

**Não apagar o bucket nem os objetos antes dos 6 meses:** a guarda é obrigação legal. Se os logs forem desligados,
o aviso precisa ser atualizado antes.

**Quando desfazer:** se algum critério do §4 falhar e não for resolvido no mesmo dia. Se isso acontecer **antes** do
merge do [PV-12], o site não diz nada sobre logs, e basta desfazer. Se acontecer **depois**, o aviso volta ao texto
anterior na mesma janela.

**Conferência de que foi desfeito:** `describe-deliveries` não mostra a entrega `nekkora-commercial-cloudfront`, e
nenhum objeto novo chega ao bucket depois de um acesso de teste.
