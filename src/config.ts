/**
 * Configuração de publicação da página.
 *
 * Os dados que só a titular pode confirmar (canais, campanha, controlador dos dados, hospedagem e aprovações) ficam em
 * `publicacao.json`, na raiz — fonte única lida também por scripts/verificar-publicacao.mjs, que bloqueia o deploy de
 * produção enquanto algum item obrigatório estiver pendente. Enquanto um valor for `null` — ou não passar na validação
 * abaixo — a página não faz a afirmação correspondente: o canal não aparece como link e o botão flutuante e os CTAs de
 * WhatsApp não são exibidos. NEKKORA-COM-CANAIS-001 (titular, 12/11/2026) e NEKKORA-COM-ECOSYSTEM-001 (20/11/2026): o
 * WhatsApp é o único canal público de atendimento comercial; o formulário só prepara a mensagem no navegador (sem envio
 * automático, envio por e-mail nem agendamento pelo Microsoft Bookings).
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

/**
 * Primeira linha de toda mensagem preparada pelo formulário de atendimento (NEKKORA-COM-ECOSYSTEM-001 §7): o visitante
 * revisa e edita a mensagem no WhatsApp, e nada é enviado sem que ele toque em enviar.
 */
export const WHATSAPP_GREETING = 'Olá! Gostaria de conversar com um analista da Nekkora.';

/** Acesso de clientes (NEKKORA-COM-CANAIS-001): a Commercial só leva à Nekkora Platform; não autentica ninguém. */
export const PLATFORM_LOGIN_URL = 'https://platform.nekkora.com/entrar';

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

export const whatsappUrl = (message: string = WHATSAPP_GREETING) =>
  CHANNELS.whatsapp ? `https://wa.me/${CHANNELS.whatsapp}?text=${encodeURIComponent(message)}` : null;

/** Número do WhatsApp por extenso (aviso de privacidade): +55 (11) 93059-7466. */
export const whatsappDisplay = (n: string | null = CHANNELS.whatsapp) => {
  if (!n) return null;
  const m = /^(\d{2})(\d{2})(\d{4,5})(\d{4})$/.exec(n);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : `+${n}`;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const toBr = (iso: string) => iso.split('-').reverse().join('/');

/**
 * Data de vigência da nova estratégia comercial (NEKKORA-COM-ECOSYSTEM-001 §11): a partir dela valem o catálogo e a
 * tabela de AI Piloto, Monitor e Hosting; solicitações e propostas anteriores mantêm as condições em que foram feitas. Só
 * a titular grava em publicacao.json (ecossistema.inicio), quando autorizar a publicação; sem ela, a página diz que a
 * data não foi definida e o portão bloqueia (PUB-13). Não substitui o histórico da PUB-13 anterior
 * (campanhaLancamento e novasCondicoes, que a página deixa de exibir).
 */
export const ECOSYSTEM_START: string | null = (() => {
  const inicio = publicacao.ecossistema?.inicio ?? null;
  return inicio != null && ISO_DATE.test(inicio) ? toBr(inicio) : null;
})();

/** Produtos do ecossistema (NEKKORA-COM-ECOSYSTEM-001 §2): independentes entre si (§3). */
export type ServiceId = 'ai' | 'monitor' | 'hosting';
export const SERVICE_IDS: ServiceId[] = ['ai', 'monitor', 'hosting'];

/**
 * Estado real de cada produto, gravado pela titular em publicacao.json (servicos; PUB-23). Sem o dado, o mais
 * conservador: AI em piloto, Monitor e Hosting sob avaliação. "disponivel" só com aprovação própria (o portão confere).
 */
export const SERVICE_STATES = {
  ai: publicacao.servicos?.ai ?? 'piloto',
  monitor: publicacao.servicos?.monitor ?? 'sob-avaliacao',
  hosting: publicacao.servicos?.hosting ?? 'sob-avaliacao',
} as const;

/** Quem responde pelos dados pessoais (aviso de privacidade). Sem o dado confirmado, o aviso usa "a Nekkora". */
export const DATA_CONTROLLER = {
  name: publicacao.controlador.nome,
  document: publicacao.controlador.documento,
};

/**
 * Endereço comercial do fornecedor, no rodapé (Decreto 7.962/2013, art. 2º, II — NEKKORA-COM-LEGAL-BASE-001). Só a
 * titular preenche; sem ele o rodapé mostra razão social e CNPJ e o portão bloqueia a publicação (PUB-22).
 */
export const SUPPLIER_ADDRESS: string | null = publicacao.fornecedor?.endereco?.trim() || null;

/** Provedor de hospedagem citado no aviso de privacidade (registros técnicos de acesso). */
export const HOSTING_PROVIDER: string | null = publicacao.hospedagem.provedor;

/**
 * Aviso de versão em homologação no rodapé. Desligar só com a autorização de publicação
 * (docs/release/COM-RELEASE-PENDENCIAS.md — PUB-10).
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
