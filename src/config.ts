/**
 * Canais de contato da página.
 *
 * Nenhum canal está confirmado (pendências K-01 a K-03 em docs/com-001/08-pendencias-publicacao.md). Enquanto o
 * valor for `null` — ou não passar na validação abaixo — o canal NÃO aparece como link, o botão flutuante de
 * WhatsApp não é exibido e o formulário funciona em modo de demonstração (valida, mas não envia nada).
 *
 * Para publicar um canal, preencha o valor real confirmado pela responsável pela Nekkora.
 */
export const CONTACT: {
  /** WhatsApp com DDI + DDD, só dígitos (ex.: 55 + DDD + número). */
  whatsappNumber: string | null;
  email: string | null;
  /** URL do perfil (não a página inicial da rede). */
  instagram: string | null;
  linkedin: string | null;
} = {
  whatsappNumber: null,
  email: null,
  instagram: null,
  linkedin: null,
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

/**
 * Aviso de versão em homologação no rodapé. Desligar só com a autorização de publicação
 * (docs/com-001/08-pendencias-publicacao.md).
 */
export const PREVIEW_NOTICE = true;

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
