/**
 * Entrega da solicitação à caixa comercial (COM-RELEASE-005 §5.6). Alternativa escolhida: Amazon SES (análise em
 * docs/release/COM-RELEASE-005-leads.md §4). Regras que impedem o uso da API como serviço de envio de e-mails:
 *   - destinatário e remetente FIXOS, da configuração — nada vindo do visitante entra em To, Cc, Bcc ou From;
 *   - o e-mail do visitante vai só no Reply-To (já validado, sem CR/LF) e no corpo, para a Nekkora responder;
 *   - assunto fixo com o protocolo; corpo só texto, com os campos rotulados;
 *   - a política IAM da função repete a regra (ses:FromAddress e ses:Recipients) — vale mesmo se o código mudar.
 */

/** Protocolo mostrado ao visitante e no assunto: derivado do UUID, estável entre tentativas. */
export const protocolOf = (idHashHex) => `NK-${idHashHex.slice(0, 8).toUpperCase()}`;

/** Mensagem que chega a contato@: texto simples, sem HTML (nada do visitante é interpretado). */
export function composeMessage(value, { protocolo, recebidaEm }) {
  const lines = [
    `Nova solicitação de avaliação recebida pelo site (protocolo ${protocolo}).`,
    '',
    `Nome: ${value.nome}`,
    `E-mail: ${value.email}`,
    `Empresa: ${value.empresa || '(não informada)'}`,
    '',
    'Processo que deseja automatizar:',
    value.descricao,
    '',
    '—',
    `Recebida em ${recebidaEm} (horário de Brasília). Responda a este e-mail para falar com quem enviou.`,
    'A pessoa revisou esta mensagem antes de enviar e foi informada do tratamento dos dados (aviso de privacidade do site).',
  ];
  return { subject: `Solicitação de avaliação ${protocolo} — site Nekkora`, text: lines.join('\n') };
}

/** Erro de entrega classificado: "temporaria" (vale tentar de novo) ou "permanente". Sem o texto do provedor. */
export class DeliveryError extends Error {
  constructor(kind, code) {
    super(`entrega ${kind}: ${code}`);
    this.kind = kind;
    this.code = code;
  }
}

const TEMPORARY = new Set(['TooManyRequestsException', 'ThrottlingException', 'LimitExceededException', 'SendingPausedException', 'InternalServiceErrorException', 'ServiceUnavailableException', 'TimeoutError', 'AbortError']);

/**
 * Amazon SES v2 (SendEmail). `client` e `SendEmailCommand` vêm do @aws-sdk/client-sesv2 (injetados nos testes).
 * Retorna o MessageId.
 */
export function sesProvider({ client, SendEmailCommand, from, to, configurationSet }) {
  if (!from || !to) throw new Error('remetente e destinatário fixos são obrigatórios');
  return async function deliver(message, { replyTo }) {
    try {
      const out = await client.send(
        new SendEmailCommand({
          FromEmailAddress: from,
          Destination: { ToAddresses: [to] },
          ReplyToAddresses: [replyTo],
          Content: { Simple: { Subject: { Data: message.subject, Charset: 'UTF-8' }, Body: { Text: { Data: message.text, Charset: 'UTF-8' } } } },
          ...(configurationSet ? { ConfigurationSetName: configurationSet } : {}),
        }),
      );
      return out.MessageId;
    } catch (e) {
      const code = e?.name ?? 'Erro';
      throw new DeliveryError(TEMPORARY.has(code) || e?.$retryable ? 'temporaria' : 'permanente', code);
    }
  };
}

/**
 * Entrega SIMULADA (homologação e testes): guarda as mensagens em memória. `failWith('temporaria' | 'permanente')`
 * faz as próximas entregas falharem; `delayMs` simula lentidão.
 */
export function simulatedProvider({ to = 'contato@exemplo.invalid', from = 'formulario@exemplo.invalid' } = {}) {
  const outbox = [];
  let failure = null;
  let delayMs = 0;
  const deliver = async (message, { replyTo }) => {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    if (failure) throw new DeliveryError(failure, failure === 'temporaria' ? 'ServiceUnavailableException' : 'MessageRejected');
    const id = `simulado-${outbox.length + 1}`;
    outbox.push({ id, from, to, replyTo, ...message });
    return id;
  };
  return Object.assign(deliver, {
    outbox,
    failWith(kind) {
      failure = kind;
    },
    setDelay(ms) {
      delayMs = ms;
    },
  });
}
