/**
 * Envio da solicitação ao backend (COM-RELEASE-005 §5.7). Só existe "recebida" quando o servidor responde 202 com
 * recebida: true para o MESMO idSolicitacao — qualquer outra coisa (rede, tempo esgotado, resposta inesperada) é falha,
 * e a página nunca afirma o recebimento. Os dados vão só no corpo (POST JSON), nunca na URL; sem cookies.
 */
export type LeadPayload = {
  idSolicitacao: string;
  nome: string;
  email: string;
  empresa: string;
  descricao: string;
  desafio: string;
  preenchimentoMs: number;
  site: string;
};

/** Motivos de falha que a página sabe explicar. "recuperavel": vale tentar de novo com os mesmos dados. */
export type LeadFailure = 'rede' | 'limite' | 'desafio' | 'indisponivel' | 'recusada';
export type LeadResult = { ok: true; protocolo: string; duplicada: boolean } | { ok: false; motivo: LeadFailure; recuperavel: boolean };

const RECOVERABLE: Record<LeadFailure, boolean> = { rede: true, limite: true, desafio: true, indisponivel: true, recusada: false };
const fail = (motivo: LeadFailure): LeadResult => ({ ok: false, motivo, recuperavel: RECOVERABLE[motivo] });

/** UUID v4 do pedido — o mesmo em cada nova tentativa, para o servidor não gerar dois e-mails. */
export const newRequestId = () => crypto.randomUUID();

export async function sendLeadRequest(endpoint: string, payload: LeadPayload, { timeoutMs = 20000, fetchImpl = fetch } = {}): Promise<LeadResult> {
  let res: Response;
  try {
    res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return fail('rede');
  }
  let body: { recebida?: unknown; idSolicitacao?: unknown; protocolo?: unknown; duplicada?: unknown; codigo?: unknown } | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.status === 202 && body?.recebida === true && body.idSolicitacao === payload.idSolicitacao && typeof body.protocolo === 'string' && /^NK-[0-9A-F]{8}$/.test(body.protocolo)) {
    return { ok: true, protocolo: body.protocolo, duplicada: body.duplicada === true };
  }
  if (res.status === 429) return fail('limite');
  if (body?.codigo === 'desafio-invalido' || body?.codigo === 'desafio-indisponivel') return fail('desafio');
  if (res.status === 409 && body?.codigo === 'em-processamento') return fail('indisponivel');
  if (res.status >= 500 || res.status === 202) return fail('indisponivel');
  return fail('recusada');
}
