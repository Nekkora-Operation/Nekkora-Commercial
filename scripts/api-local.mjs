#!/usr/bin/env node
/**
 * Backend de solicitações LOCAL para a homologação (COM-RELEASE-005 §5.8): o mesmo manipulador do Lambda
 * (api/solicitacoes/manipulador.mjs), com armazenamento em memória, entrega de e-mail SIMULADA (nenhuma mensagem sai
 * da máquina) e um verificador de desafio que aceita só o token de teste da Cloudflare.
 *
 *   node scripts/api-local.mjs --porta 4178 --origem http://127.0.0.1:4177
 *
 * Rotas de controle, só neste servidor (nunca no Lambda):
 *   GET  /__teste/caixa             mensagens "entregues" (simuladas)
 *   GET  /__teste/logs              linhas de log operacional
 *   POST /__teste/modo?entrega=ok|temporaria|permanente&atraso=<ms>&desafio=ok|recusado|indisponivel
 *   POST /__teste/limpar            zera caixa, logs, contadores e idempotência
 */
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { memoryStore } from '../api/solicitacoes/armazenamento.mjs';
import { simulatedProvider } from '../api/solicitacoes/entrega.mjs';
import { createHandler } from '../api/solicitacoes/manipulador.mjs';

/** Token devolvido pelas chaves de teste do Turnstile (documentação da Cloudflare). */
export const TURNSTILE_TEST_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

export function createLocalApi({ origins, limits } = {}) {
  const logs = [];
  let store = memoryStore();
  const deliver = simulatedProvider();
  let challengeMode = 'ok';
  const verifyChallenge = async ({ token }) => {
    if (challengeMode === 'indisponivel') return { ok: false, temporario: true, motivo: 'rede' };
    if (challengeMode === 'recusado' || token !== TURNSTILE_TEST_TOKEN) return { ok: false, temporario: false, motivo: 'recusado' };
    return { ok: true };
  };
  let handler;
  const build = () => {
    handler = createHandler({ config: { allowedOrigins: origins, ipSecret: 'segredo-local-de-homologacao', limits }, store, deliver, verifyChallenge, log: (l) => logs.push(l) });
  };
  build();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local');
    const json = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(body));
    };
    if (url.pathname === '/__teste/caixa') return json(200, deliver.outbox);
    if (url.pathname === '/__teste/logs') return json(200, logs);
    if (url.pathname === '/__teste/limpar' && req.method === 'POST') {
      deliver.outbox.length = 0;
      logs.length = 0;
      store = memoryStore();
      deliver.failWith(null);
      deliver.setDelay(0);
      challengeMode = 'ok';
      build();
      return json(200, { ok: true });
    }
    if (url.pathname === '/__teste/modo' && req.method === 'POST') {
      const e = url.searchParams.get('entrega');
      if (e) deliver.failWith(e === 'ok' ? null : e);
      if (url.searchParams.has('atraso')) deliver.setDelay(Number(url.searchParams.get('atraso')));
      if (url.searchParams.get('desafio')) challengeMode = url.searchParams.get('desafio');
      return json(200, { ok: true });
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    // Evento no formato do API Gateway HTTP API (payload 2.0), como o Lambda recebe.
    const event = {
      version: '2.0',
      rawPath: url.pathname,
      headers: Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])),
      body: body.length ? body.toString('base64') : undefined,
      isBase64Encoded: true,
      requestContext: { requestId: `local-${Date.now()}`, http: { method: req.method, path: url.pathname, sourceIp: req.socket.remoteAddress } },
    };
    const out = await handler(event);
    res.writeHead(out.statusCode, out.headers);
    res.end(out.body);
  });
  return { server, logs, outbox: deliver.outbox };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
  const port = Number(opt('--porta', 4178));
  const { server } = createLocalApi({ origins: opt('--origem', 'http://127.0.0.1:4177').split(',') });
  server.listen(port, '127.0.0.1', () => console.log(`API de solicitações (local, entrega simulada): http://127.0.0.1:${port}/v1/commercial/requests`));
}
