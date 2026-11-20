/**
 * Texto comercial da página — fonte única para revisão.
 *
 * Layout "modelo C — Poster" (mockup da responsável, 2026-10-15). NEKKORA-COM-ECOSYSTEM-001 (titular, 20/11/2026):
 * a narrativa do Nekkora Delivery dá lugar ao ecossistema "Crie. Monitore. Execute." — três produtos independentes
 * (Nekkora AI em piloto, Nekkora Monitor e Nekkora Hosting), sem pacote nem desconto. Os textos anteriores (Delivery,
 * categorias simples e média, pacotes de 3, campanha de lançamento) ficam no histórico do git e dos documentos.
 *
 * A aprovação deste texto não fica registrada aqui: vale a impressão de PUB-17/PUB-19 aprovada em publicacao.json, com o
 * registro da titular em $origem (scripts/comercial/impressao-conteudo.mjs). Qualquer mudança neste arquivo muda a
 * impressão e exige nova aprovação. Textos NOVOS desta missão, pendentes de aprovação (PUB-17, PUB-19 e PUB-09).
 */
import type { IconName } from 'nekkora-lib';
import { CHANNELS, DATA_CONTROLLER, ECOSYSTEM_START, HOSTING_PROVIDER, SERVICE_STATES, SUPPLIER_ADDRESS, whatsappDisplay, type ServiceId } from './config';
import { PRICE_TABLE, SIM_LIMITS, brl, type SimField } from './precos';

/* ------------------------------------------------------------------ */
/* Estados dos produtos (PUB-23)                                      */
/* ------------------------------------------------------------------ */
/** Rótulo do estado real de cada produto, gravado pela titular em publicacao.json (servicos). */
export const STATE_LABELS = {
  piloto: 'Piloto',
  'sob-avaliacao': 'Disponibilidade sob avaliação',
  'em-preparacao': 'Em preparação',
  disponivel: 'Disponível',
} as const;
const stage = (id: ServiceId) => STATE_LABELS[SERVICE_STATES[id]];

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */
export const HERO = {
  badge: 'AI · Monitor · Hosting',
  titleLead: 'Sua operação automatizada,',
  titleAccent: 'do início à execução.',
  lead: 'Crie automações com inteligência artificial, monitore suas execuções e utilize infraestrutura preparada para sua operação. Escolha os serviços que fazem sentido para sua empresa.',
  // abre o formulário de atendimento, que prepara a mensagem e leva ao WhatsApp
  primaryCta: 'Fale com um analista',
  secondaryCta: 'Ver como funciona',
  pillarsLabel: 'Crie. Monitore. Execute.',
  points: [
    { icon: 'robot', label: 'Crie' },
    { icon: 'monitor', label: 'Monitore' },
    { icon: 'server', label: 'Execute' },
  ] as { icon: IconName; label: string }[],
};

/* ------------------------------------------------------------------ */
/* Soluções                                                           */
/* ------------------------------------------------------------------ */
/**
 * Catálogo dos três produtos (§2), com o estado real de cada um (§10). Nenhum depende dos outros (§3). Valores só no
 * bloco de preços (data-pricing). O AI está em piloto: nada de maturidade definitiva, conclusão instantânea ou
 * compatibilidade universal.
 */
export const SOLUTIONS = {
  eyebrow: 'Soluções',
  title: 'Crie. Monitore. Execute.',
  description: 'Três serviços independentes. Contrate um, dois ou os três — separadamente ou em conjunto.',
  cards: [
    {
      id: 'ai' as const,
      number: '01',
      name: 'Nekkora AI',
      stage: stage('ai'),
      icon: 'robot' as IconName,
      summary: 'Criação de automações com inteligência artificial, em fase piloto.',
      items: [
        'Você solicita cada automação individualmente',
        'A necessidade é avaliada antes de qualquer proposta',
        'Sem mensalidade obrigatória',
        'Sem promessa de conclusão instantânea nem de compatibilidade com qualquer processo',
      ],
      cta: 'Solicitar uma automação',
    },
    {
      id: 'monitor' as const,
      number: '02',
      name: 'Nekkora Monitor',
      stage: stage('monitor'),
      icon: 'monitor' as IconName,
      summary: 'Acompanhamento das execuções das suas automações.',
      items: [
        'Contratação independente do AI e do Hosting',
        'Também para automações que não foram criadas pela Nekkora',
        'Compatibilidade técnica verificada antes da contratação',
        'Cobrança mensal por automação monitorada',
      ],
      cta: 'Falar sobre o Monitor',
    },
    {
      id: 'hosting' as const,
      number: '03',
      name: 'Nekkora Hosting',
      stage: stage('hosting'),
      icon: 'server' as IconName,
      summary: 'Infraestrutura para executar as suas automações.',
      items: [
        'Contratação independente do AI e do Monitor',
        'Você escolhe o sistema operacional: Windows ou Linux',
        'Cobrança por hora-máquina',
        'Disponibilidade e condições confirmadas antes da contratação',
      ],
      cta: 'Falar sobre o Hosting',
    },
  ],
  note: 'Nenhum serviço exige os outros e não há pacote obrigatório nem desconto por combinação.',
};

/* ------------------------------------------------------------------ */
/* Preços — bloco data-pricing                                        */
/* ------------------------------------------------------------------ */
/**
 * Tabela do §2 (valores de src/precos.ts, nunca digitados aqui). Valores só podem aparecer dentro do bloco data-pricing
 * (verificado por scripts/homologacao.mjs). A vigência (§11) é gravada pela titular em publicacao.json quando autorizar
 * a publicação; os compromissos anteriores (Delivery e campanha de lançamento) são preservados.
 */
export const PRICING = {
  eyebrow: 'Preços',
  title: 'Quanto custa cada serviço',
  description: 'Valores por serviço, sem pacote obrigatório. Escopo, condições e valores definitivos ficam na proposta de cada solicitação.',
  validity: ECOSYSTEM_START
    ? `Valores para solicitações recebidas a partir de ${ECOSYSTEM_START}. Solicitações e propostas anteriores mantêm as condições em que foram feitas.`
    : 'Prévia para revisão: a data de vigência destes valores ainda não foi definida. Solicitações e propostas anteriores mantêm as condições em que foram feitas.',
  cards: [
    {
      id: 'ai' as const,
      overline: 'Nekkora AI · Piloto',
      title: 'Criação de automações',
      rows: [{ id: 'ai', prefix: 'A partir de', value: brl(PRICE_TABLE.ai.porAutomacao), unit: 'por automação' }],
      note: 'Valor inicial de referência. Se o processo exigir investimento maior, o valor é apresentado para sua aprovação antes de qualquer compromisso. Sem mensalidade obrigatória.',
    },
    {
      id: 'monitor' as const,
      overline: 'Nekkora Monitor',
      title: 'Monitoramento de execuções',
      rows: [{ id: 'monitor', prefix: null, value: brl(PRICE_TABLE.monitor.porAutomacaoMes), unit: 'por automação, por mês' }],
      note: 'Cobrança mensal por automação monitorada, depois de verificada a compatibilidade técnica.',
    },
    {
      id: 'hosting' as const,
      overline: 'Nekkora Hosting',
      title: 'Execução em máquina',
      rows: [
        { id: 'windows', prefix: 'Windows', value: brl(PRICE_TABLE.hosting.windowsPorHora), unit: 'por hora-máquina' },
        { id: 'linux', prefix: 'Linux', value: brl(PRICE_TABLE.hosting.linuxPorHora), unit: 'por hora-máquina' },
      ],
      note: 'Sem franquia mínima. Critério de cobrança por hora, licenciamento Windows e disponibilidade são formalizados antes da contratação.',
    },
  ],
  // §11: condições do novo modelo — as regras antigas do Delivery (pacotes, 50/50, fila, categorias, licenças) NÃO se
  // aplicam automaticamente ao AI Piloto. Texto NOVO, pendente de aprovação (PUB-19).
  conditions: {
    title: 'Condições comerciais',
    items: [
      'Cada serviço é contratado de forma independente: AI, Monitor e Hosting, em qualquer combinação',
      'Escopo, valores, periodicidade de cobrança e condições de pagamento definidos em proposta, aprovada por você antes do início',
      'Nekkora AI em fase piloto: cada automação é avaliada antes da proposta, sem promessa de conclusão instantânea nem de compatibilidade com qualquer processo; se o processo exigir investimento maior que o valor inicial, ele é apresentado para sua aprovação antes de qualquer compromisso',
      'Propriedade e direitos sobre as automações criadas no Nekkora AI são definidos em proposta contratual específica',
      'Nekkora Monitor: cobrança mensal por automação monitorada, depois de verificada a compatibilidade técnica',
      'Nekkora Hosting: cobrança por hora-máquina, sem franquia mínima; o critério de cobrança das horas, o licenciamento Windows e a disponibilidade são formalizados antes da contratação',
      'Licenças e serviços de terceiros não estão incluídos, salvo se previstos na proposta',
      'Sem pacotes nem descontos por combinação de serviços',
      'Solicitações recebidas e propostas emitidas antes desta tabela mantêm as condições em que foram feitas',
      'Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei',
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Simulador de investimento — dentro do bloco data-pricing           */
/* ------------------------------------------------------------------ */
/**
 * §4: quatro entradas, todas começando em zero, nenhuma obrigatória. Cada natureza de cobrança aparece separada
 * (inicial, mensal, por hora) e o combinado nunca é chamado de mensalidade. Valores sempre de src/precos.ts.
 */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const SIMULATOR = {
  title: 'Simulador de investimento',
  description: 'Escolha só o que faz sentido para você: todos os campos começam em zero e nenhum serviço é obrigatório. Nada do que você seleciona é enviado ou guardado.',
  fields: [
    { field: 'ai', group: 'Nekkora AI · Piloto', label: 'Automações solicitadas', unit: `A partir de ${brl(PRICE_TABLE.ai.porAutomacao)} por automação`, one: 'automação', many: 'automações' },
    { field: 'monitor', group: 'Nekkora Monitor', label: 'Automações monitoradas', unit: `${brl(PRICE_TABLE.monitor.porAutomacaoMes)} por automação, por mês`, one: 'automação', many: 'automações' },
    { field: 'windows', group: 'Nekkora Hosting', label: 'Horas-máquina Windows', unit: `${brl(PRICE_TABLE.hosting.windowsPorHora)} por hora-máquina`, one: 'hora', many: 'horas' },
    { field: 'linux', group: 'Nekkora Hosting', label: 'Horas-máquina Linux', unit: `${brl(PRICE_TABLE.hosting.linuxPorHora)} por hora-máquina`, one: 'hora', many: 'horas' },
  ] as { field: SimField; group: string; label: string; unit: string; one: string; many: string }[],
  decrease: (label: string) => `Diminuir ${label.toLowerCase()}`,
  increase: (label: string) => `Aumentar ${label.toLowerCase()}`,
  limits: `Limites provisórios, só desta simulação: até ${SIM_LIMITS.ai} automações por serviço e até ${SIM_LIMITS.windows} horas-máquina por sistema, em horas inteiras. Para mais, fale com a Nekkora.`,
  clear: 'Limpar simulação',
  cleared: 'Simulação limpa.',
  empty: 'Informe ao menos uma quantidade para ver a estimativa.',
  resultTitle: 'Estimativa',
  ai: 'Investimento inicial estimado no AI Piloto',
  aiValue: (v: string) => `a partir de ${v}`,
  monitor: 'Valor mensal estimado do Monitor',
  monitorValue: (v: string) => `${v} por mês`,
  hosting: 'Hosting para as horas selecionadas',
  combined: 'Investimento combinado estimado',
  combinedNote: 'Soma do AI Piloto, do primeiro mês do Monitor e das horas de Hosting selecionadas. Não é uma mensalidade.',
  disclaimer: 'Esta simulação é só uma estimativa. Não é proposta nem contratação: escopo, condições e valores definitivos são confirmados na avaliação e registrados em proposta comercial.',
  request: 'Solicitar atendimento com esta simulação',
  count: (field: SimField, n: number) => {
    const f = SIMULATOR.fields.find((x) => x.field === field)!;
    return plural(n, f.one, f.many);
  },
  /** Anúncio para leitores de tela (região viva), sem mover o foco. */
  announce: (summary: string) => `Estimativa atualizada. ${summary}`,
};

/* ------------------------------------------------------------------ */
/* Como funciona                                                      */
/* ------------------------------------------------------------------ */
export const HOW_IT_WORKS = {
  eyebrow: 'Como funciona',
  title: 'Do pedido à execução, com a sua aprovação nos pontos de decisão.',
  steps: [
    { title: 'Você descreve a necessidade', description: 'O formulário de atendimento prepara uma mensagem, que você revisa e envia pelo WhatsApp.' },
    { title: 'Avaliação', description: 'Avaliamos o processo, os sistemas envolvidos e a compatibilidade técnica de cada serviço escolhido.' },
    { title: 'Proposta', description: 'Escopo, valores, periodicidade de cobrança e condições por escrito. Nada começa antes da sua aprovação.' },
    { title: 'Criação, monitoramento e execução', description: 'Conforme os serviços contratados: a automação criada no AI Piloto, o Monitor acompanhando as execuções, o Hosting executando as automações.' },
    { title: 'Validação', description: 'Você confere o resultado no seu cenário, pelos critérios definidos na proposta.' },
  ],
};

/* ------------------------------------------------------------------ */
/* Hosting — faixa pôster                                             */
/* ------------------------------------------------------------------ */
export const HOSTING = {
  eyebrow: 'Nekkora Hosting',
  title: 'Infraestrutura para executar suas automações, em Windows ou Linux.',
  description: 'Você escolhe o sistema operacional e a quantidade de horas-máquina. O Hosting pode ser contratado sozinho, sem o AI ou o Monitor.',
  availability: {
    title: 'Condições a confirmar antes da contratação.',
    text: 'Sem franquia mínima. Disponibilidade de infraestrutura, licenciamento Windows, critério de cobrança por hora (fração e arredondamento) e responsabilidades de cada parte são formalizados na proposta. Uma solicitação não representa contratação nem reserva de capacidade.',
  },
  cta: 'Falar sobre o Hosting',
};

/* ------------------------------------------------------------------ */
/* Transparência                                                      */
/* ------------------------------------------------------------------ */
export const TRANSPARENCY = {
  eyebrow: 'Transparência',
  title: 'Letras grandes, não miúdas',
  description: 'O que é definido em proposta, o que não está incluído sem acordo explícito e do que o andamento depende.',
  defined: {
    title: 'Definido em proposta',
    items: [
      'Serviços escolhidos e quantidades',
      'Valores e periodicidade de cobrança',
      'Condições de pagamento',
      'Prazo estimado',
      'Tecnologias e licenças necessárias',
      'Responsabilidades de cada parte',
      'Critérios de validação e aceite',
    ],
  },
  excluded: {
    title: 'Não incluído automaticamente',
    // bloco de exclusão (data-exclusion)
    items: [
      'Serviços que você não escolheu: nenhum é obrigatório',
      'Licenças e serviços de terceiros — em regra, contratados pelo cliente',
      'Alterações futuras e novas funcionalidades',
      'Suporte além do previsto em proposta',
      'Disponibilidade 24 horas, alta disponibilidade ou SLA, salvo se previstos em proposta',
    ],
  },
  dependencies: {
    title: 'Depende de você e de terceiros',
    items: ['Liberação de acessos e credenciais', 'Estabilidade de sistemas externos', 'Compatibilidade técnica dos seus sistemas', 'Disponibilidade da sua equipe para validação'],
  },
};

/* ------------------------------------------------------------------ */
/* Contato e formulário de atendimento (§7)                           */
/* ------------------------------------------------------------------ */
export const CONTACT_COPY = {
  title: 'Vamos conversar sobre a sua operação?',
  description: 'A conversa inicia uma avaliação — não é uma contratação e não gera compromisso.',
  cta: 'Fale com um analista',
  note: 'O formulário prepara a sua mensagem e abre o WhatsApp. Você revisa a mensagem antes de enviar.',
  // LinkedIn e Instagram: redes institucionais, não canais de atendimento
  socialTitle: 'Acompanhe a Nekkora',
  pendingCaption: 'Canal de atendimento em definição',
};

/** Serviços que o visitante pode marcar no formulário (todos opcionais). */
export const SERVICE_NAMES: Record<ServiceId, string> = { ai: 'Nekkora AI (piloto)', monitor: 'Nekkora Monitor', hosting: 'Nekkora Hosting' };

/**
 * Formulário de atendimento (§7): só prepara a mensagem no navegador e abre o WhatsApp. Sem envio automático, banco de
 * dados, e-mail, API do WhatsApp ou armazenamento persistente.
 */
export const REQUEST_FORM = {
  title: 'Fale com um analista',
  description: 'Preencha os campos e revise a mensagem no WhatsApp antes de enviar. Nada é enviado pela página.',
  name: { label: 'Nome', placeholder: 'Seu nome', error: 'Informe o seu nome.' },
  company: { label: 'Empresa', placeholder: 'Nome da empresa', hint: 'Opcional' },
  email: { label: 'E-mail', placeholder: 'nome@empresa.com', hint: 'Opcional', error: 'Informe um e-mail válido ou deixe o campo em branco.' },
  description_: {
    label: 'Descrição do processo ou necessidade',
    placeholder: 'Ex.: conferimos todo dia os pagamentos do banco com o sistema financeiro, manualmente.',
    hint: 'Não informe senhas, credenciais nem dados confidenciais.',
    error: 'Descreva o processo ou a necessidade.',
  },
  services: { legend: 'Serviços de interesse', description: 'Opcional. Marque os que quiser.' },
  simulation: { include: 'Incluir o resumo da simulação na mensagem', hint: 'Você pode desmarcar.' },
  submit: 'Abrir o WhatsApp',
  cancel: 'Cancelar',
  opened: {
    title: 'Mensagem preparada no WhatsApp',
    text: 'Abrimos o WhatsApp em outra aba com a sua mensagem. Ela só chega à Nekkora quando você tocar em enviar — abrir o WhatsApp não é o envio.',
  },
  again: 'Abrir o WhatsApp novamente',
  back: 'Voltar ao formulário',
  close: 'Fechar',
  // Rótulos da mensagem estruturada (exemplo do §7)
  message: { name: 'Nome', company: 'Empresa', email: 'E-mail', description: 'Descrição do processo', services: 'Serviços de interesse', simulation: 'Simulação de investimento' },
};

/* ------------------------------------------------------------------ */
/* Barra de navegação                                                 */
/* ------------------------------------------------------------------ */
/*
 * Botão "Entrar": NEKKORA-COM-CANAIS-001 (PUB-16, confirmado pela titular em 13/11/2026). Ele leva a
 * https://platform.nekkora.com/entrar (PLATFORM_LOGIN_URL, em config.ts); cadastro, autenticação e área do cliente são
 * da Nekkora Platform, não do Commercial (App.tsx).
 */

/* ------------------------------------------------------------------ */
/* Privacidade (§5.4) — minuta para revisão da titular                */
/* ------------------------------------------------------------------ */
/**
 * Só fatos do código e da hospedagem: sem cookies, sem análise, sem envio pelo formulário. Controlador e provedor de
 * hospedagem vêm de publicacao.json; enquanto pendentes, o texto usa termos genéricos e o deploy de produção fica
 * bloqueado (aprovação "avisoDePrivacidade").
 */
// AUD-33: razão social e CNPJ vêm de publicacao.json (ambos informados pela titular em 04/11/2026); sem o nome, o
// aviso usa "a Nekkora" e mostra só o CNPJ
const controller = `${DATA_CONTROLLER.name ?? 'a Nekkora'}${DATA_CONTROLLER.document ? ` (CNPJ ${DATA_CONTROLLER.document})` : ''}`;
/**
 * NEKKORA-COM-ECOSYSTEM-001 §11 — PROPOSTA pendente de aprovação da titular (PUB-09): o formulário de atendimento só
 * prepara a mensagem no navegador; a página não recebe nem guarda o formulário, e o visitante decide abrir o WhatsApp e
 * enviar. O e-mail continua como canal dos direitos do titular, ao lado do WhatsApp, e na identificação do fornecedor
 * (rodapé, Decreto 7.962/2013). Revisões anteriores (NEKKORA-COM-CANAIS-001, aprovada em 13/11/2026; COM-RELEASE-005 §6;
 * golive-001) ficam no histórico.
 */
/** Canais dos direitos do titular (LGPD, art. 18): WhatsApp e e-mail, quando confirmados. */
const rightsChannels = [CHANNELS.whatsapp && `pelo WhatsApp ${whatsappDisplay()}`, CHANNELS.email && `pelo e-mail ${CHANNELS.email}`].filter(Boolean).join(' ou ');

export const PRIVACY = {
  eyebrow: 'Privacidade',
  title: 'Como tratamos seus dados',
  description: `Responsável pelos dados pessoais desta página: ${controller}.`,
  items: [
    {
      icon: 'shield' as IconName,
      title: 'Formulário só no seu navegador',
      // Ajuste da titular (13/11/2026) mantido: sem afirmação absoluta de que a página não coleta dados — o acesso envolve
      // dados técnicos de navegação e os registros de acesso descritos no item "Registros de acesso"
      text: 'O formulário de atendimento só prepara uma mensagem. Nome, empresa, e-mail, descrição e, se você escolher, o resumo da simulação são processados no seu navegador: a página não os envia à Nekkora, não tem envio automático de solicitações e não os guarda depois que você sai. O simulador de investimento também funciona só no seu navegador. Como em qualquer site, o acesso envolve dados técnicos de navegação, tratados pelo provedor de hospedagem e guardados nos registros de acesso descritos abaixo.',
    },
    // [PV-02] — o canal de atendimento é o WhatsApp, aberto pelo visitante
    {
      icon: 'whatsapp' as IconName,
      title: 'Conversa pelo WhatsApp',
      text: 'Ao concluir o formulário, a página abre o WhatsApp, serviço da Meta, em outra aba, com a mensagem preparada. Continuar é escolha sua: você pode revisar, editar ou apagar a mensagem, e ela só chega à Nekkora se você tocar em enviar. Depois disso, seu número, seu nome de perfil e o que você escrever na conversa são usados pela Nekkora para responder. O WhatsApp segue os termos e a política de privacidade da Meta.',
    },
    {
      icon: 'eye' as IconName,
      title: 'Sem cookies nem rastreamento',
      // [PV-03] AUD-43: o escopo é esta página; WhatsApp, redes sociais e a Platform seguem regras próprias. Ajuste da
      // titular (13/11/2026): a Platform é citada só como destino do botão "Entrar"
      text: 'Esta página não usa cookies nem ferramentas de análise ou de publicidade. O navegador guarda apenas a sua escolha de tema (claro ou escuro). Fontes e imagens vêm do próprio site. O WhatsApp, o LinkedIn e o Instagram seguem regras próprias. O botão "Entrar" leva à Nekkora Platform, uma aplicação separada, que também segue regras próprias.',
    },
    {
      icon: 'server' as IconName,
      title: 'Registros de acesso',
      // [PV-04] — o provedor processa esses dados para entregar as páginas; a página não grava nada além disso.
      // [PV-12] LOG-01 (NEKKORA-COM-GOLIVE-001, 06/11/2026): guarda mínima de 6 meses (Marco Civil, art. 15). O texto descreve
      // exatamente os campos de deploy/aws/logs/entrega.json (date, time, c-ip, c-port, x-host-header: sem URL, sem user agent)
      // e a expiração de ciclo-de-vida.json (190 dias, assíncrona no S3). Mudou a configuração, muda o texto.
      // Integrado em 10/11/2026, depois de os logs v2 estarem ativos e conferidos na AWS (E4:
      // docs/release/evidencias/golive-001/log-01-2026-11-10.md). Se os logs forem desligados, este texto sai antes.
      // Nova aprovação: PUB-17 e PUB-09 (não presume aprovação jurídica). Revisão interna de 10/11/2026 (sem parecer
      // externo, ajuste 3 da titular): registros de acesso dependem de ordem judicial (Marco Civil, art. 10, §1º, e art.
      // 15, §3º); o pedido de guarda cautelar (art. 15, §2º) não dá acesso; dados cadastrais (art. 10, §3º) têm regra
      // própria e não estão nestes registros. A base da guarda (art. 7º, II) ficou numa frase própria.
      text:
        `${HOSTING_PROVIDER ? `A ${HOSTING_PROVIDER}, que hospeda este site,` : 'O provedor de hospedagem'} processa dados técnicos de acesso, como endereço IP e navegador, para entregar as páginas e proteger o serviço.` +
        ' Por exigência do Marco Civil da Internet (Lei 12.965/2014, art. 15), a Nekkora guarda registros de acesso a este site com cinco informações: data, horário (UTC), endereço IP e porta de origem da conexão e o domínio acessado. Esses registros não indicam a página visitada nem o navegador usado. Eles ficam guardados por pelo menos 6 meses, sob sigilo e com acesso restrito. A exclusão automática está programada para 190 dias após a gravação de cada registro e pode levar alguns dias a mais para ser concluída pelo provedor. A guarda cumpre uma obrigação legal (LGPD, art. 7º, II). Pela lei, a disponibilização desses registros a terceiros depende de ordem judicial (Marco Civil da Internet, art. 10, §1º, e art. 15, §3º). Autoridades podem pedir que eles sejam guardados por mais tempo (art. 15, §2º), mas o acesso continua dependendo de ordem judicial. Os registros não contêm dados cadastrais, como nome ou endereço, que seguem regras legais próprias (art. 10, §3º).',
    },
    // [PV-09] AUD-39: prazos aprovados na COM-008-B. A eliminação é feita pela Nekkora (não há rotina automática): o texto
    // descreve o prazo, não uma execução automática
    {
      icon: 'clock' as IconName,
      title: 'Por quanto tempo guardamos',
      text: `Mensagens e dados de contato de quem não chegou a contratar ficam guardados por até seis meses após o último contato relevante. Dados ligados a uma contratação seguem os prazos do contrato e os exigidos por lei.`,
    },
    // [PV-10] AUD-40: transferência internacional. Revisão interna de 10/11/2026 (sem parecer externo): o texto diz só o
    // que foi verificado e não cita nenhum mecanismo do art. 33 que não esteja comprovado (JUR-07). Fatos: site e logs
    // em sa-east-1 (auditoria 42809550459 e E4); e-mail e arquivos do M365 em repouso no Brasil (E3). Possível
    // tratamento no exterior: entrega pelo CloudFront, API dos logs v2 em us-east-1, DPA da Microsoft com transferência
    // para os EUA, acesso de suporte. Bookings e mídia do Teams estão fora do E3, por isso não são dados como no Brasil.
    {
      icon: 'link' as IconName,
      title: 'Onde os dados são processados',
      text: `Os arquivos deste site e os registros de acesso ficam armazenados ${HOSTING_PROVIDER ? `na ${HOSTING_PROVIDER}` : 'no provedor de hospedagem'}, na região de São Paulo. O e-mail e os arquivos da Nekkora no Microsoft 365 ficam armazenados no Brasil. Ainda assim, parte do tratamento pode ocorrer fora do Brasil, inclusive nos Estados Unidos: a entrega das páginas pode passar por servidores do provedor em outros países, e os provedores podem processar dados ou acessá-los para suporte a partir de outros países. As conversas pelo WhatsApp passam pelos servidores da Meta, que podem estar fora do Brasil.`,
    },
    // [PV-08] COM-008-B §9: base legal ≠ ciência da política ≠ consentimento. Revisão interna de 10/11/2026 (sem parecer
    // externo): aplica a redação já proposta na privacidade-minuta §2 (LEGAL-BASE-001), em que o representante de empresa
    // fica no art. 7º, IX, porque o V supõe que o titular seja parte. Avaliação do legítimo interesse documentada em
    // docs/release/NEKKORA-COM-GOLIVE-001-revisao-interna.md §2 (pendente de aprovação da titular; não é parecer). Dela vêm
    // a menção à oposição (art. 18, §2º) e a retirada de "os dados são necessários", que não serve ao IX. Não resolve o
    // mecanismo do art. 33 para esse fluxo (J7-4).
    {
      icon: 'user' as IconName,
      title: 'Uso e seus direitos',
      text: `Usamos os dados que você nos envia só para responder à sua mensagem e preparar avaliação e proposta, a seu pedido (LGPD, art. 7º, V) ou, quando você fala em nome de uma empresa, no interesse legítimo de responder ao contato dessa empresa (LGPD, art. 7º, IX). Para isso não pedimos consentimento. Se algum outro uso depender de consentimento, ele será pedido à parte. Você pode pedir confirmação, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade e informações sobre o compartilhamento dos seus dados, opor-se ao tratamento feito com base no interesse legítimo e, quando houver consentimento, revogá-lo (LGPD, art. 18)${rightsChannels ? `, ${rightsChannels}` : ', pelos canais de contato desta página'}.`,
    },
  ],
};

/**
 * Identificação do fornecedor no rodapé (Decreto 7.962/2013, art. 2º, I e II — NEKKORA-COM-LEGAL-BASE-001): nome
 * empresarial e CNPJ em local de fácil visualização, e o endereço comercial quando a titular o definir (PUB-22). Os
 * dados vêm de publicacao.json; nada é presumido.
 */
const supplierParts = [
  DATA_CONTROLLER.name,
  DATA_CONTROLLER.document ? `CNPJ ${DATA_CONTROLLER.document}` : null,
  SUPPLIER_ADDRESS,
  CHANNELS.email,
].filter(Boolean);

export const FOOTER = {
  /** "NOME EMPRESARIAL · CNPJ … · endereço · e-mail" — vazio se nada estiver confirmado. */
  supplier: DATA_CONTROLLER.name ? supplierParts.join(' · ') : null,
  privacy: 'Privacidade',
  preview: 'Versão para homologação',
  build: 'build',
  dirty: 'com alterações locais',
  devServer: 'servidor de desenvolvimento',
  signature: 'Neko (猫) observa os detalhes.',
};
