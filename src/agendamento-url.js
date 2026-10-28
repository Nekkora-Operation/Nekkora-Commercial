/**
 * Validação da URL pública do Microsoft Bookings (COM-RELEASE-005 §4.5, NEKKORA-COM-007). Fonte ÚNICA da regra: a
 * página (src/config.ts) e o portão de publicação (scripts/verificar-publicacao.mjs) importam esta função, então os dois
 * aceitam exatamente as mesmas URLs. JavaScript puro, sem dependências, para rodar no navegador e no Node sem build;
 * tipos em agendamento-url.d.ts.
 *
 * Aceita só:
 *   https://bookings.cloud.microsoft/book/<caixa>@<domínio>/            (endereço atual gerado pelo Bookings)
 *   https://outlook.office365.com/book/<caixa>@<domínio>/               (formato legado)
 *   https://outlook.office.com/book/<caixa>@<domínio>/                  (formato legado)
 *   https://outlook.office(365).com/owa/calendar/<caixa>@<domínio>/bookings/  (formato legado)
 * em que <domínio> é o do e-mail comercial da Nekkora — ou, só se declarado em publicacao.json
 * (agendamento.dominioDoTenant), o domínio *.onmicrosoft.com do próprio tenant.
 *
 * Recusa: http, host fora da lista (inclusive parecidos, subdomínios e o ponto final "host."), porta, usuário/senha,
 * query e fragmento, página inicial, caminho fora do formato, caixa de outra organização, qualquer caractere codificado
 * no caminho além de %40 ("@") — %2F, %5C, %2E etc. seriam lidos de um jeito aqui e de outro no servidor — e URL que não
 * esteja na forma canônica (espaços, maiúsculas no host, tabulações). Com { producao: true }, recusa também domínios
 * reservados para exemplo (.invalid, .example, .test, .localhost), como no e-mail.
 */

/** Hosts oficiais da página pública de reservas. Lista explícita: nada de "termina com microsoft.com". */
export const BOOKINGS_HOSTS = ['bookings.cloud.microsoft', 'outlook.office365.com', 'outlook.office.com'];

const MAILBOX = '([a-z0-9][a-z0-9._+-]*)@([a-z0-9-]+(?:\\.[a-z0-9-]+)+)';
const SEGMENTS = '(?:/[a-z0-9._~-]+)*/?';
const BOOK_PATH = new RegExp(`^/book/${MAILBOX}${SEGMENTS}$`, 'i');
const OWA_PATH = new RegExp(`^/owa/calendar/${MAILBOX}/bookings${SEGMENTS}$`, 'i');
const TENANT = /^[a-z0-9-]+\.onmicrosoft\.com$/;
const RESERVED = /\.(invalid|example|test|localhost)$/;

/**
 * @param {unknown} u URL candidata (publicacao.json → agendamento.url)
 * @param {{ emailDomain: string | null, tenantDomain?: string | null, producao?: boolean }} opcoes
 */
export function isBookingsUrl(u, { emailDomain, tenantDomain = null, producao = false }) {
  if (typeof u !== 'string' || typeof emailDomain !== 'string' || emailDomain === '') return false;
  let url;
  try {
    url = new URL(u);
  } catch {
    return false;
  }
  if (url.href !== u) return false;
  if (url.protocol !== 'https:' || url.username !== '' || url.password !== '' || url.port !== '') return false;
  if (!BOOKINGS_HOSTS.includes(url.hostname) || url.search !== '' || url.hash !== '') return false;

  const path = url.pathname.replace(/%40/gi, '@');
  if (path.includes('%')) return false;
  const m = BOOK_PATH.exec(path) ?? (url.hostname !== 'bookings.cloud.microsoft' ? OWA_PATH.exec(path) : null);
  if (!m) return false;

  const domain = m[2].toLowerCase();
  const tenant = typeof tenantDomain === 'string' ? tenantDomain.toLowerCase() : null;
  const ours = domain === emailDomain.toLowerCase() || (tenant != null && TENANT.test(tenant) && domain === tenant);
  return ours && !(producao && RESERVED.test(domain));
}
