/**
 * Configuração de publicação da página.
 *
 * Os dados que só a titular pode confirmar (canais, campanha, controlador dos dados, hospedagem e aprovações) ficam em
 * `publicacao.json`, na raiz — fonte única lida também por scripts/verificar-publicacao.mjs, que bloqueia o deploy de
 * produção enquanto algum item obrigatório estiver pendente. Enquanto um valor for `null` — ou não passar na validação
 * abaixo — a página não faz a afirmação correspondente: o canal não aparece como link, o botão flutuante de WhatsApp não
 * é exibido e o formulário funciona em modo de demonstração (valida, mas não envia nada).
 *
 * Builds de homologação trocam o arquivo por scripts/fixtures/publicacao-homologacao.json (dados sintéticos) com
 * NEKKORA_PUBLICACAO — veja vite.config.ts.
 */
import publicacao from '@publicacao';
import { launchActive, todayInBrazil } from './precos';

/** WhatsApp com DDI + DDD, só dígitos. E-mail. URLs de perfil (não a página inicial da rede). */
export const CONTACT: { whatsappNumber: string | null; email: string | null; instagram: string | null; linkedin: string | null } = {
  whatsappNumber: publicacao.canais.whatsapp,
  email: publicacao.canais.email,
  instagram: publicacao.canais.instagram,
  linkedin: publicacao.canais.linkedin,
};

export const WHATSAPP_MESSAGE = 'Olá! Quero solicitar uma avaliação com a Nekkora.';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Número com DDI+DDD (12 ou 13 dígitos) que não seja um marcador de posição (só zeros depois do DDI). */
export const isValidWhatsapp = (n: string | null): n is string => n != null && /^\d{12,13}$/.test(n) && !/^\d{2}0+$/.test(n);
export const isValidEmail = (e: string | null): e is string => e != null && EMAIL_RE.test(e);
/** URL https de um perfil: precisa ter caminho além da raiz do domínio. */
export const isProfileUrl = (u: string | null): u is string => {
  if (u == null) return false;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && url.pathname.replace(/\/+$/, '').length > 1;
  } catch {
    return false;
  }
};

/** Canais confirmados e válidos — só estes viram links na página. */
export const CHANNELS = {
  whatsapp: isValidWhatsapp(CONTACT.whatsappNumber) ? CONTACT.whatsappNumber : null,
  email: isValidEmail(CONTACT.email) ? CONTACT.email : null,
  instagram: isProfileUrl(CONTACT.instagram) ? CONTACT.instagram : null,
  linkedin: isProfileUrl(CONTACT.linkedin) ? CONTACT.linkedin : null,
};

export const hasAnyChannel = Object.values(CHANNELS).some((c) => c != null);

export const whatsappUrl = (message: string = WHATSAPP_MESSAGE) =>
  CHANNELS.whatsapp ? `https://wa.me/${CHANNELS.whatsapp}?text=${encodeURIComponent(message)}` : null;

/** Hosts da página pública do Microsoft Bookings. */
const BOOKINGS_HOSTS = ['outlook.office365.com', 'outlook.office.com'];

/**
 * Página pública oficial do Microsoft Bookings (COM-RELEASE-005 §4.5): https, host da Microsoft, caminho de uma página
 * de reservas (/book/… ou /owa/calendar/…/bookings) e caixa de reservas do próprio domínio da Nekkora — o do e-mail
 * comercial — ou do tenant (*.onmicrosoft.com). Recusa a página inicial, URLs de outras organizações e domínios de
 * exemplo. Mesma regra em scripts/verificar-publicacao.mjs.
 */
export function isBookingsUrl(u: string | null, emailDomain: string | null): u is string {
  if (u == null || emailDomain == null) return false;
  try {
    const url = new URL(u);
    const path = decodeURIComponent(url.pathname).toLowerCase();
    const mailbox = /^\/(?:book|owa\/calendar)\/[^/@]+@([^/]+)\//.exec(path.endsWith('/') ? path : `${path}/`);
    const okPath = path.startsWith('/book/') || (path.startsWith('/owa/calendar/') && path.includes('/bookings'));
    const domain = mailbox?.[1] ?? '';
    return (
      url.protocol === 'https:' &&
      BOOKINGS_HOSTS.includes(url.hostname.toLowerCase()) &&
      url.username === '' &&
      okPath &&
      (domain === emailDomain.toLowerCase() || /^[a-z0-9-]+\.onmicrosoft\.com$/.test(domain))
    );
  } catch {
    return false;
  }
}

const EMAIL_DOMAIN = CHANNELS.email ? CHANNELS.email.split('@')[1] : null;

/**
 * "Agendar conversa" (COM-RELEASE-005 §4): só com a URL oficial e válida do Bookings em publicacao.json. Sem ela, o
 * botão não aparece — a página não apresenta o agendamento como disponível nem aponta para um endereço inexistente.
 * O Bookings é quem confirma a reserva: a página nunca afirma que uma reunião foi agendada.
 */
export const BOOKINGS_URL: string | null = isBookingsUrl(publicacao.agendamento.url, EMAIL_DOMAIN) ? publicacao.agendamento.url : null;

/** Caminho do contrato da API de solicitações (COM-RELEASE-005 §5.4). */
export const LEAD_API_PATH = '/v1/commercial/requests';

/**
 * Endpoint do recebimento automático (COM-RELEASE-005 §5): https e o caminho do contrato. http só para o servidor
 * local da homologação (127.0.0.1/localhost) — o portão de publicação exige https.
 */
export function isLeadApiEndpoint(u: string | null): u is string {
  if (u == null) return false;
  try {
    const url = new URL(u);
    const local = url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);
    return (url.protocol === 'https:' || local) && url.username === '' && url.search === '' && url.hash === '' && url.pathname === LEAD_API_PATH;
  } catch {
    return false;
  }
}

/** Chave pública do Cloudflare Turnstile (desafio antiautomação, §5.5). Não é segredo: a chave secreta fica no backend. */
const isTurnstileSiteKey = (k: string | null): k is string => k != null && /^[0-9a-zA-Z_-]{10,64}$/.test(k);

/**
 * Recebimento automático: ativo só com endpoint válido. A chave do desafio é opcional no código (homologação local) e
 * obrigatória no portão de publicação.
 */
export const LEAD_API = isLeadApiEndpoint(publicacao.envioAutomatico.endpoint)
  ? { endpoint: publicacao.envioAutomatico.endpoint, turnstileSiteKey: isTurnstileSiteKey(publicacao.envioAutomatico.chaveDoSiteTurnstile) ? publicacao.envioAutomatico.chaveDoSiteTurnstile : null }
  : null;

/**
 * Canal da jornada "Solicitar avaliação", em ordem de precedência — um único mecanismo de envio ativo por vez
 * (COM-RELEASE-005 §5.8):
 *   1. 'api': recebimento automático (a página envia ao backend e só confirma o recebimento com a resposta dele);
 *   2. 'whatsapp': mensagem aberta no WhatsApp, quando houver número confirmado;
 *   3. 'email': mensagem aberta no aplicativo de e-mail do visitante (mailto) — o canal atual;
 *   null: modo de demonstração.
 * Com a API ativa, o e-mail continua só como alternativa de contato na falha do envio, nunca como segundo envio.
 * Decisão da titular em 22/10/2026: por enquanto só e-mail e LinkedIn (sem WhatsApp).
 */
export const REQUEST_CHANNEL: 'api' | 'whatsapp' | 'email' | null = LEAD_API ? 'api' : CHANNELS.whatsapp ? 'whatsapp' : CHANNELS.email ? 'email' : null;

export const EMAIL_SUBJECT = 'Solicitação de avaliação — Nekkora';

/** mailto com assunto e, se houver, corpo. Quebras de linha como CRLF (RFC 6068). */
export const mailtoUrl = (body?: string) =>
  CHANNELS.email
    ? `mailto:${CHANNELS.email}?subject=${encodeURIComponent(EMAIL_SUBJECT)}${body ? `&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}` : ''}`
    : null;

/** Número do WhatsApp para digitar à mão (alternativa quando o link não abre): +55 11 91234-5678. */
export const whatsappDisplay = (n: string | null = CHANNELS.whatsapp) => {
  if (!n) return null;
  const m = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(n);
  return m ? `+${m[1]} ${m[2]} ${m[3]}-${m[4]}` : `+${n}`;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const toBr = (iso: string) => iso.split('-').reverse().join('/');

/** Datas da campanha de lançamento (PUB-13) — só quando as duas existem, são AAAA-MM-DD e estão em ordem. */
export const LAUNCH_DATES = (() => {
  const { inicio, fim } = publicacao.campanhaLancamento;
  if (inicio == null || fim == null || !ISO_DATE.test(inicio) || !ISO_DATE.test(fim) || inicio > fim) return null;
  return { inicio, fim };
})();

/**
 * Vigência da campanha de lançamento (PUB-13). Com as duas datas definidas e válidas, a página informa o período
 * ("de 01/11/2026 a 31/12/2026") e só mostra os preços de lançamento dentro dele (isLaunchActive).
 */
export const LAUNCH_PERIOD = LAUNCH_DATES && { start: toBr(LAUNCH_DATES.inicio), end: toBr(LAUNCH_DATES.fim) };

/** Preços de lançamento em vigor hoje (fuso de Brasília)? Sem datas aprovadas: sim, para revisão (o deploy fica bloqueado). */
export const isLaunchActive = (now: Date = new Date()) =>
  launchActive(LAUNCH_DATES ?? { inicio: null, fim: null }, todayInBrazil(now));

/** Quem responde pelos dados pessoais (aviso de privacidade). Sem o dado confirmado, o aviso usa "a Nekkora". */
export const DATA_CONTROLLER = {
  name: publicacao.controlador.nome,
  document: publicacao.controlador.documento,
};

/** Provedor de hospedagem citado no aviso de privacidade (registros técnicos de acesso). */
export const HOSTING_PROVIDER: string | null = publicacao.hospedagem.provedor;

/**
 * Aviso de versão em homologação no rodapé. Desligar só com a autorização de publicação
 * (docs/com-001/08-pendencias-publicacao.md — PUB-10).
 */
export const PREVIEW_NOTICE: boolean = publicacao.avisoHomologacao;

export const NAV_LINKS = [
  { label: 'Soluções', href: '#solucoes' },
  { label: 'Preços', href: '#precos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Hosting', href: '#hosting' },
  { label: 'Transparência', href: '#transparencia' },
];

/**
 * Chave do localStorage com o tema escolhido (Sage Light, padrão desde o modelo C ↔ Sakura Dark). Lida também no
 * index.html. Chave nova na COM-001: a preferência antiga (Midnight Blue / Sage Light) não é migrada — decisão D-06.
 */
export const THEME_STORAGE_KEY = 'nekkora-commercial-tema';
