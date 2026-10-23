/**
 * Controles contra abuso do recebimento de solicitações (COM-RELEASE-005 §5.5). Nenhum deles sozinho basta — e o CORS
 * não é um deles (só impede que outra página leia a resposta; um script fora do navegador ignora o CORS):
 *
 *   1. throttling do API Gateway (configuração da rota, fora do código) — corta rajadas antes de chegar aqui;
 *   2. armadilha (campo "site" oculto) e tempo mínimo de preenchimento — robôs simples;
 *   3. limite por origem de rede (IP guardado só como HMAC, nunca em claro) e teto diário global — limita o volume de
 *      e-mails mesmo se um robô passar pelo resto;
 *   4. desafio antiautomação (Cloudflare Turnstile), conferido no servidor;
 *   5. a entrega só vai para o endereço fixo da Nekkora (entrega.mjs) — a API não é um serviço de envio de e-mails.
 */
import { createHash, createHmac } from 'node:crypto';

export const DEFAULT_LIMITS = {
  /** Abaixo disso, ninguém lê o formulário, escreve 20 caracteres e confere a mensagem. */
  minFillMs: 3000,
  /** Por origem de rede: 5 por hora e 10 por dia. */
  perIpHour: 5,
  perIpDay: 10,
  /** Teto global diário (fuso de Brasília): acima dele, nenhuma solicitação vira e-mail até o dia seguinte. */
  globalDay: 50,
};

/** HMAC-SHA256 do IP com um segredo próprio: permite contar sem guardar o endereço (dado pessoal). */
export const ipKey = (ip, secret) => createHmac('sha256', secret).update(String(ip ?? 'desconhecido')).digest('hex').slice(0, 32);

/** Identificador do pedido para logs e protocolo: derivado do UUID, sem dado pessoal. */
export const idHash = (id) => createHash('sha256').update(String(id)).digest('hex').slice(0, 12);

/** Data (AAAA-MM-DD) e hora no fuso de Brasília — janelas de contagem. */
export function windows(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  return { day, hour: `${day}T${parts.hour}` };
}

/** Robôs simples: campo-armadilha preenchido ou envio rápido demais. Retorna o motivo ou null. */
export function botSignals(value, limits = DEFAULT_LIMITS) {
  if (value.site !== '') return 'armadilha';
  if (value.preenchimentoMs < limits.minFillMs) return 'rapido-demais';
  return null;
}

/**
 * Contadores de volume. Cada chave expira sozinha (TTL do armazenamento). Retorna { ok } ou { ok: false, escopo,
 * retryAfter } — "global" indica o teto diário (o log operacional registra para a titular ser avisada).
 */
export async function checkRate(store, { ip, secret, now = new Date(), limits = DEFAULT_LIMITS }) {
  const w = windows(now);
  const who = ipKey(ip, secret);
  const hour = await store.increment(`ip#${who}#${w.hour}`, 2 * 3600);
  if (hour > limits.perIpHour) return { ok: false, escopo: 'origem', retryAfter: 3600 - (Math.floor(now.getTime() / 1000) % 3600) };
  const day = await store.increment(`ip#${who}#${w.day}`, 2 * 86400);
  if (day > limits.perIpDay) return { ok: false, escopo: 'origem', retryAfter: 3600 };
  const global = await store.increment(`global#${w.day}`, 2 * 86400);
  if (global > limits.globalDay) return { ok: false, escopo: 'global', retryAfter: 3600 };
  return { ok: true };
}

export const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verificador do Cloudflare Turnstile (siteverify). O token vale uma vez e por 5 minutos; o hostname devolvido precisa
 * ser o do site. Falha de rede da Cloudflare → { ok: false, temporario: true } (a página pode tentar de novo).
 */
export function turnstileVerifier({ secret, hostnames, fetchImpl = fetch, timeoutMs = 5000 }) {
  if (!secret) throw new Error('segredo do Turnstile ausente');
  return async function verify({ token, ip, idempotencyKey }) {
    if (!token) return { ok: false, temporario: false, motivo: 'sem-token' };
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set('remoteip', ip);
    if (idempotencyKey) form.set('idempotency_key', idempotencyKey);
    let data;
    try {
      const res = await fetchImpl(TURNSTILE_VERIFY_URL, { method: 'POST', body: form, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) return { ok: false, temporario: true, motivo: `http-${res.status}` };
      data = await res.json();
    } catch {
      return { ok: false, temporario: true, motivo: 'rede' };
    }
    if (data?.success !== true) return { ok: false, temporario: false, motivo: (data?.['error-codes'] ?? []).join(',') || 'recusado' };
    if (!hostnames.includes(data.hostname)) return { ok: false, temporario: false, motivo: 'hostname' };
    return { ok: true };
  };
}

/** Sem desafio configurado: só para o servidor local de homologação (o portão de publicação exige o Turnstile). */
export const noChallenge = async () => ({ ok: true });
