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

/** Número do WhatsApp para digitar à mão (alternativa quando o link não abre): +55 11 91234-5678. */
export const whatsappDisplay = (n: string | null = CHANNELS.whatsapp) => {
  if (!n) return null;
  const m = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(n);
  return m ? `+${m[1]} ${m[2]} ${m[3]}-${m[4]}` : `+${n}`;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const toBr = (iso: string) => iso.split('-').reverse().join('/');

/**
 * Vigência da campanha de lançamento (PUB-13). Com as duas datas definidas e válidas, a página informa o período
 * ("de 01/11/2026 a 31/12/2026"); sem elas, mantém o texto do mockup e a publicação fica bloqueada.
 */
export const LAUNCH_PERIOD = (() => {
  const { inicio, fim } = publicacao.campanhaLancamento;
  if (inicio == null || fim == null || !ISO_DATE.test(inicio) || !ISO_DATE.test(fim) || inicio > fim) return null;
  return { start: toBr(inicio), end: toBr(fim) };
})();

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
