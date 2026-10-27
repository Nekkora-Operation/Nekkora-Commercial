/**
 * Estado mínimo do recebimento (COM-RELEASE-005 §5.5): idempotência por idSolicitacao e contadores de volume. Sem
 * PostgreSQL nem Redis — em produção, uma tabela do DynamoDB sob demanda com TTL; nos testes e no servidor local, a
 * memória. Nenhum dado pessoal é guardado: só o UUID do pedido, um hash do conteúdo, o protocolo e contadores por HMAC
 * do IP. O conteúdo da solicitação existe apenas no e-mail entregue à Nekkora.
 *
 * Interface:
 *   claim(id, fingerprint, ttlSec) → { state: 'novo' } | { state: 'entregue', protocolo, fingerprint }
 *                                   | { state: 'processando', fingerprint }
 *   complete(id, protocolo)        → marca como entregue (uma nova tentativa recebe o mesmo protocolo, sem reenvio)
 *   release(id)                    → desfaz o claim depois de uma falha de entrega (a nova tentativa reenvia)
 *   increment(key, ttlSec)         → contador atualizado
 */

export function memoryStore({ now = () => Date.now() } = {}) {
  const items = new Map();
  const live = (key) => {
    const it = items.get(key);
    if (it && it.expires <= now()) {
      items.delete(key);
      return null;
    }
    return it ?? null;
  };
  return {
    items,
    async claim(id, fingerprint, ttlSec) {
      const it = live(`sol#${id}`);
      if (it) return { state: it.status, protocolo: it.protocolo, fingerprint: it.fingerprint };
      items.set(`sol#${id}`, { status: 'processando', fingerprint, expires: now() + ttlSec * 1000 });
      return { state: 'novo' };
    },
    async complete(id, protocolo) {
      const it = live(`sol#${id}`);
      if (it) Object.assign(it, { status: 'entregue', protocolo });
    },
    async release(id) {
      items.delete(`sol#${id}`);
    },
    async increment(key, ttlSec) {
      const it = live(`n#${key}`) ?? { count: 0, expires: now() + ttlSec * 1000 };
      it.count++;
      items.set(`n#${key}`, it);
      return it.count;
    },
  };
}

/**
 * DynamoDB (tabela com chave de partição "pk" do tipo String e TTL no atributo "expira"). Recebe o cliente e as classes
 * de comando do @aws-sdk/client-dynamodb (injetados: os testes usam um cliente simulado).
 */
export function dynamoStore({ client, table, commands, now = () => Date.now() }) {
  const { PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = commands;
  const expires = (ttlSec) => String(Math.floor(now() / 1000) + ttlSec);
  return {
    async claim(id, fingerprint, ttlSec) {
      try {
        await client.send(
          new PutItemCommand({
            TableName: table,
            Item: { pk: { S: `sol#${id}` }, estado: { S: 'processando' }, impressao: { S: fingerprint }, expira: { N: expires(ttlSec) } },
            // Já existe e não expirou: é uma nova tentativa (ou uma duplicata). O TTL do DynamoDB apaga com atraso,
            // então o item vencido é tratado como inexistente.
            ConditionExpression: 'attribute_not_exists(pk) OR expira < :agora',
            ExpressionAttributeValues: { ':agora': { N: String(Math.floor(now() / 1000)) } },
          }),
        );
        return { state: 'novo' };
      } catch (e) {
        if (e?.name !== 'ConditionalCheckFailedException') throw e;
      }
      const { Item } = await client.send(new GetItemCommand({ TableName: table, Key: { pk: { S: `sol#${id}` } }, ConsistentRead: true }));
      return { state: Item?.estado?.S ?? 'processando', protocolo: Item?.protocolo?.S, fingerprint: Item?.impressao?.S };
    },
    async complete(id, protocolo) {
      await client.send(
        new UpdateItemCommand({
          TableName: table,
          Key: { pk: { S: `sol#${id}` } },
          UpdateExpression: 'SET estado = :e, protocolo = :p',
          ExpressionAttributeValues: { ':e': { S: 'entregue' }, ':p': { S: protocolo } },
        }),
      );
    },
    async release(id) {
      await client.send(new DeleteItemCommand({ TableName: table, Key: { pk: { S: `sol#${id}` } } }));
    },
    async increment(key, ttlSec) {
      const { Attributes } = await client.send(
        new UpdateItemCommand({
          TableName: table,
          Key: { pk: { S: `n#${key}` } },
          UpdateExpression: 'ADD contagem :um SET expira = if_not_exists(expira, :expira)',
          ExpressionAttributeValues: { ':um': { N: '1' }, ':expira': { N: expires(ttlSec) } },
          ReturnValues: 'UPDATED_NEW',
        }),
      );
      return Number(Attributes.contagem.N);
    },
  };
}
