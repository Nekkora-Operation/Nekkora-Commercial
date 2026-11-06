# LOG-01 — registros de acesso do CloudFront (standard logging v2)

**Estado: PREPARADO, NÃO APLICADO.** Nenhuma alteração foi feita na AWS. A execução depende de **autorização
específica da titular**. Até lá, o texto [PV-12] do aviso (`src/content.ts`) **não pode** ser integrado à `main`,
porque descreveria um tratamento que ainda não ocorre.

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
- Para incluir algum campo depois, é preciso criar uma nova entrega e mudar o aviso.

Definição versionada: [`entrega.json`](entrega.json).

## 2. Decisões técnicas

| Item | Valor | Por quê |
|---|---|---|
| Bucket | novo e exclusivo, `${LOGS_BUCKET}` (sugestão: `nekkora-commercial-registros-acesso`), em **`sa-east-1`** | separado do bucket do site; armazenado no Brasil |
| Bloqueio público | os quatro *Block Public Access* ativos | sigilo (art. 15) |
| Object Ownership | `BucketOwnerEnforced` (ACLs desabilitadas) | O v2 usa bucket policy, não ACL. O S3 aceita o cabeçalho `bucket-owner-full-control` com ACLs desabilitadas. **Conferir no §4** que os objetos chegam |
| Criptografia | SSE-S3 (`AES256`) | Com SSE-KMS seria preciso uma chave gerenciada pelo cliente (custo) |
| Política | [`politica-bucket-logs.json`](politica-bucket-logs.json): só `delivery.logs.amazonaws.com` grava, restrito à conta e à *delivery source*; HTTPS obrigatório | menor privilégio |
| Retenção | [`ciclo-de-vida.json`](ciclo-de-vida.json): expiração em **190 dias** | 6 meses mais margem para a expiração assíncrona do S3 |
| Versionamento | desligado | evita cópias que escapariam da expiração |
| Acesso | só a titular (console e CloudShell). As roles de deploy e de auditoria **não** leem os objetos | sigilo |
| Região da API | `us-east-1`, que é exigência do CloudFront para o v2, com entrega cruzada para `sa-east-1` | documentação AWS (standard-logging) |
| Formato | `json`; não pode ser mudado depois | leitura simples |

**Custo:** os documentos da AWS divergem. O guia do CloudFront fala em "no additional charges for log delivery to
Amazon S3"; o do CloudWatch Logs cita cobrança de entrega. No volume da V1 (poucos MB por mês), o armazenamento custa
centavos. A titular confere a fatura do primeiro mês, e um alerta do AWS Budgets (gratuito) é recomendado.

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
  --s3-delivery-configuration 'suffixPath={DistributionId}/{yyyy}/{MM}/{dd},enableHiveCompatiblePath=false'
```

## 4. Conferência (só leitura; a evidência vai sem IPs)

```bash
aws logs describe-deliveries --region us-east-1 --query 'deliveries[?deliverySourceName==`nekkora-commercial-cloudfront`].[id,recordFields]'
aws s3api get-public-access-block --bucket "$LOGS_BUCKET"
aws s3api get-bucket-ownership-controls --bucket "$LOGS_BUCKET"
aws s3api get-bucket-lifecycle-configuration --bucket "$LOGS_BUCKET"
aws s3api get-bucket-location --bucket "$LOGS_BUCKET"            # "sa-east-1"
# Acesse https://dnl1wnnmoqhaj.cloudfront.net/ e espere alguns minutos:
aws s3 ls "s3://$LOGS_BUCKET/AWSLogs/$AWS_ACCOUNT_ID/CloudFront/" --recursive | tail -3
```

Critérios para dar a LOG-01 como aplicada, todos necessários:

1. a entrega existe com exatamente os 5 campos;
2. o bucket está em `sa-east-1`, bloqueado ao público, com `BucketOwnerEnforced` e expiração de 190 dias;
3. pelo menos um objeto chegou, e as chaves dele contêm só esses campos (registrar só os **nomes** dos campos);
4. a auditoria AWS dá 0 falha.

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
