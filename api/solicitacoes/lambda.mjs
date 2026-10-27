/**
 * Entrada do AWS Lambda (runtime nodejs22.x, arquitetura arm64) — PREPARADA, NÃO PUBLICADA (COM-RELEASE-005 §5.8).
 * Monta as dependências reais a partir de variáveis de ambiente e delega ao manipulador. Nenhum segredo fica no
 * código, nas variáveis ou no GitHub: o segredo do Turnstile e o do HMAC de IP são lidos do SSM Parameter Store
 * (SecureString) uma vez por instância. A função usa a própria role (credenciais temporárias), sem access keys.
 *
 * Variáveis (docs/release/COM-RELEASE-005-leads.md §6):
 *   ORIGENS_PERMITIDAS      https://nekkora.com (separadas por vírgula)
 *   DESTINO                 contato@nekkora.com — endereço FIXO que recebe as solicitações
 *   REMETENTE               identidade verificada no SES (ex.: formulario@nekkora.com)
 *   CONFIGURATION_SET       opcional — configuration set do SES (eventos de rejeição/reclamação)
 *   TABELA                  tabela do DynamoDB (pk String, TTL em "expira")
 *   PARAMETRO_TURNSTILE     nome do parâmetro SecureString com o segredo do Turnstile
 *   PARAMETRO_SEGREDO_IP    nome do parâmetro SecureString com o segredo do HMAC de IP (32+ caracteres)
 *   HOSTNAMES_DESAFIO       nekkora.com (hostnames aceitos na resposta do Turnstile)
 *   LIMITE_DIARIO           opcional — teto global por dia (padrão 50)
 */
import { DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { turnstileVerifier } from './antiabuso.mjs';
import { dynamoStore } from './armazenamento.mjs';
import { sesProvider } from './entrega.mjs';
import { createHandler } from './manipulador.mjs';

/** Lê a configuração do ambiente; recusa valor ausente ou fora do formato (a função não sobe meio configurada). */
export function configFromEnv(env) {
  const required = (name) => {
    const v = env[name]?.trim();
    if (!v) throw new Error(`variável ${name} ausente`);
    return v;
  };
  const origins = required('ORIGENS_PERMITIDAS').split(',').map((o) => o.trim());
  for (const o of origins) if (!/^https:\/\/[a-z0-9.-]+$/.test(o)) throw new Error(`origem inválida: ${o}`);
  const email = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const to = required('DESTINO');
  const from = required('REMETENTE');
  if (!email.test(to) || !email.test(from)) throw new Error('DESTINO e REMETENTE precisam ser endereços de e-mail');
  const daily = env.LIMITE_DIARIO ? Number(env.LIMITE_DIARIO) : undefined;
  if (daily !== undefined && !(Number.isInteger(daily) && daily > 0 && daily <= 1000)) throw new Error('LIMITE_DIARIO entre 1 e 1000');
  return {
    allowedOrigins: origins,
    to,
    from,
    configurationSet: env.CONFIGURATION_SET?.trim() || undefined,
    table: required('TABELA'),
    turnstileParameter: required('PARAMETRO_TURNSTILE'),
    ipSecretParameter: required('PARAMETRO_SEGREDO_IP'),
    challengeHostnames: required('HOSTNAMES_DESAFIO').split(',').map((h) => h.trim()),
    limits: daily ? { globalDay: daily } : {},
  };
}

/** Monta o manipulador com clientes injetáveis (os testes passam clientes simulados). */
export async function buildHandler({ env = process.env, clients = {}, fetchImpl = fetch, log } = {}) {
  const cfg = configFromEnv(env);
  const ssm = clients.ssm ?? new SSMClient({});
  const secret = async (Name) => (await ssm.send(new GetParameterCommand({ Name, WithDecryption: true }))).Parameter.Value;
  const [turnstileSecret, ipSecret] = await Promise.all([secret(cfg.turnstileParameter), secret(cfg.ipSecretParameter)]);
  return createHandler({
    config: { allowedOrigins: cfg.allowedOrigins, ipSecret, limits: cfg.limits },
    store: dynamoStore({ client: clients.dynamo ?? new DynamoDBClient({}), table: cfg.table, commands: { PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } }),
    deliver: sesProvider({ client: clients.ses ?? new SESv2Client({}), SendEmailCommand, from: cfg.from, to: cfg.to, configurationSet: cfg.configurationSet }),
    verifyChallenge: turnstileVerifier({ secret: turnstileSecret, hostnames: cfg.challengeHostnames, fetchImpl }),
    ...(log ? { log } : {}),
  });
}

let ready;
/** Handler do Lambda: a configuração e os segredos são carregados na primeira invocação de cada instância. */
export const handler = async (event) => {
  ready ??= buildHandler().catch((e) => {
    ready = undefined;
    throw e;
  });
  return (await ready)(event);
};
