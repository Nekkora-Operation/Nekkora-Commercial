/**
 * Dados de contato da página.
 * TODO: substituir pelos dados reais antes de divulgar a página.
 */
export const CONTACT = {
  /** Número do WhatsApp com DDI + DDD, só dígitos (ex.: 5511999999999). */
  whatsappNumber: '5500000000000',
  whatsappMessage: 'Olá! Quero conhecer a Nekkora e entender como vocês podem ajudar na minha operação.',
  email: 'contato@nekkora.com',
  instagram: 'https://www.instagram.com/',
  linkedin: 'https://www.linkedin.com/',
} as const;

export const whatsappUrl = (message: string = CONTACT.whatsappMessage) =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Studio', href: '#studio' },
  { label: 'Hospedagem', href: '#hospedagem' },
  { label: 'Monitoramento', href: '#monitoramento' },
  { label: 'Suporte', href: '#suporte' },
  { label: 'Contato', href: '#contato' },
];

/** Chave do localStorage com o tema escolhido (Midnight Blue escuro · Sage Light claro). Lida também no index.html. */
export const THEME_STORAGE_KEY = 'nekkora-commercial-theme';
