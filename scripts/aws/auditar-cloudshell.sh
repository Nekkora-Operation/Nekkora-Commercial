#!/usr/bin/env bash
# Auditoria SOMENTE LEITURA no AWS CloudShell (COM-RELEASE-003-A) — sem instalar nada no Windows e sem chaves:
# o CloudShell já está autenticado com a identidade do console (use o usuário administrativo com MFA, nunca o root).
#
#   curl -fsSL https://raw.githubusercontent.com/Nekkora-Operation/Nekkora-Commercial/feat/com-release-003-aws/scripts/aws/auditar-cloudshell.sh -o auditar.sh
#   bash auditar.sh [nome-do-bucket]
#
# Clona a branch, instala só o AWS SDK (versões fixas do lockfile, sem scripts de instalação), descobre o bucket se
# não for informado e roda scripts/aws/auditar.mjs. Só chamadas Get/List/Describe: nada é criado, alterado ou apagado.
# O relatório (auditoria/auditoria.md) tem IDs e ARNs, mas nenhum segredo — pode ser copiado para a revisão.
set -euo pipefail

BRANCH=feat/com-release-003-aws
DIR=nekkora-commercial-auditoria

node -e 'const [maj] = process.versions.node.split(".").map(Number); if (maj < 18) { console.error(`Node ${process.versions.node}: é preciso 18 ou mais`); process.exit(1); }'
echo "Identidade: $(aws sts get-caller-identity --query Arn --output text)"
case "$(aws sts get-caller-identity --query Arn --output text)" in
  *:root) echo "Use o usuário administrativo, não o root." >&2; exit 1 ;;
esac

if [ ! -d "$DIR" ]; then
  git clone --quiet --depth 1 --branch "$BRANCH" https://github.com/Nekkora-Operation/Nekkora-Commercial.git "$DIR"
fi
cd "$DIR"
git pull --quiet --ff-only || true
echo "Código auditado: commit $(git rev-parse --short HEAD)"

# Só o SDK, nas versões do package.json (sem Playwright, sem scripts de instalação)
mkdir -p aws-sdk-auditoria && (cd aws-sdk-auditoria && npm init -y >/dev/null && npm install --silent --no-audit --no-fund --ignore-scripts \
  @aws-sdk/client-s3@3.1147.0 @aws-sdk/client-cloudfront@3.1147.0 @aws-sdk/client-acm@3.1147.0 @aws-sdk/client-sts@3.1147.0)
# Os imports ESM do auditar.mjs resolvem pelo node_modules da raiz (NODE_PATH não vale para import())
ln -sfn "$PWD/aws-sdk-auditoria/node_modules" node_modules

BUCKET="${1:-}"
if [ -z "$BUCKET" ]; then
  echo "Buckets da conta:"
  aws s3api list-buckets --query 'Buckets[].Name' --output text | tr '\t' '\n' | sed 's/^/  - /'
  read -r -p "Nome do bucket do Commercial: " BUCKET
fi
REGION=$(aws s3api get-bucket-location --bucket "$BUCKET" --query LocationConstraint --output text)
[ "$REGION" = "None" ] && REGION=us-east-1
export AWS_REGION="$REGION"

echo
echo "Certificados ACM para nekkora.com (o CloudFront só aceita os de us-east-1):"
for r in us-east-1 $([ "$REGION" != us-east-1 ] && echo "$REGION"); do
  aws acm list-certificates --region "$r" --includes keyTypes=RSA_2048,RSA_3072,RSA_4096,EC_prime256v1,EC_secp384r1 \
    --query "CertificateSummaryList[?contains(DomainName, 'nekkora.com')].[DomainName,Status]" --output text \
    | sed "s/^/  $r: /" || true
done

echo
node scripts/aws/auditar.mjs --bucket "$BUCKET" --saida auditoria || true
echo
echo "Resumo:"
node -e '
  const r = require("./auditoria/auditoria.json");
  const by = (s) => r.checks.filter((c) => c.status === s);
  console.log(`  ok ${by("ok").length} · pendente ${by("pendente").length} · falha ${by("falha").length} · info ${by("info").length}`);
  for (const c of [...by("falha"), ...by("pendente")]) console.log(`  [${c.status}] ${c.id} ${c.title} — ${c.detail}`);
'
echo
echo "Relatório completo: $PWD/auditoria/auditoria.md  (cat auditoria/auditoria.md para copiar)"
