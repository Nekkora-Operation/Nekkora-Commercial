/**
 * Texto comercial da página — fonte única para revisão.
 *
 * Layout "modelo C — Poster" (mockup da responsável, 2026-10-15). Toda frase segue o contrato comercial
 * (docs/com-001/02-contrato-comercial.md). Os comentários [A-01], [H-03], [PR-01]… apontam a linha da matriz de
 * alegações (docs/com-001/03-matriz-alegacoes.md) que autoriza o trecho. Antes de mudar uma promessa, atualize a matriz.
 *
 * NEKKORA-COM-008-C: textos ajustados às decisões da titular na COM-008-B (campanha, condições, várias automações,
 * licenças, homologação, Hosting, botão "Entrar" e privacidade). Redação em revisão: aprovacoes.textosComerciais,
 * condicoesComerciais e avisoDePrivacidade continuam false, e a revisão jurídica é obrigatória antes da aprovação.
 */
import type { IconName } from 'nekkora-lib';
import { BOOKINGS_URL, CHANNELS, DATA_CONTROLLER, HOSTING_PROVIDER, LAUNCH_PERIOD, LEAD_API, REQUEST_CHANNEL } from './config';
import { priceFacts, type CampaignState } from './precos';

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */
export const HERO = {
  badge: 'Delivery · Hosting',
  titleLead: 'Automação sob medida,',
  titleAccent: 'da necessidade à execução.',
  // [A-01] [A-02] [H-01] [H-02 → avaliação] [C-01]
  lead:
    'Automações por demanda, com escopo, preço e aceite definidos em proposta para cada uma. ' +
    'Infraestrutura para executá-las, sujeita a avaliação. Cada serviço contratado de forma independente.',
  primaryCta: 'Solicitar avaliação',
  secondaryCta: 'Ver como funciona',
  // [D-01] [D-02] [D-04]
  points: [
    { icon: 'file', label: 'Proposta por automação' },
    { icon: 'check-circle', label: 'Homologação e aceite' },
    { icon: 'layers', label: 'Sem pacote obrigatório' },
  ] as { icon: IconName; label: string }[],
};

/* ------------------------------------------------------------------ */
/* Soluções                                                           */
/* ------------------------------------------------------------------ */
export const SOLUTIONS = {
  eyebrow: 'Soluções',
  title: 'Duas ofertas. Você escolhe o arranjo.',
  cards: [
    {
      id: 'delivery',
      number: '01',
      name: 'Nekkora Delivery',
      stage: 'Sob proposta',
      stageTone: 'accent' as const,
      variant: 'raised' as const,
      summary: 'Desenvolvimento de automações por demanda.', // [A-01]
      items: [
        'Escopo, prazo e preço definidos em proposta para cada automação', // [A-02]
        // [A-03] [A-14] — AUD-19: aprovação nos pontos de decisão, não em todas as etapas
        'A entrega só é concluída depois de documentação, desenvolvimento, testes, da sua homologação e do aceite formal',
        // [A-13] — AUD-20: entrega definitiva com documentação e dependências identificadas; direitos conforme o contrato
        'Entrega definitiva com documentação e dependências identificadas, nos termos do contrato',
      ],
      // [A-15] [A-16] — tecnologias com que a Nekkora trabalha; nenhuma promessa de compatibilidade universal
      technologies: {
        label: 'Tecnologias, conforme o caso',
        items: ['Python', 'UiPath', 'Power Automate', 'Integrações via API', 'Sistemas web', 'Dados e planilhas'],
        note: 'A viabilidade com cada sistema é confirmada na avaliação.',
      },
      href: '#precos',
      cta: 'Conhecer o Delivery',
    },
    {
      id: 'hosting',
      number: '02',
      name: 'Nekkora Hosting',
      stage: 'Em avaliação de viabilidade',
      stageTone: 'info' as const,
      variant: 'raised' as const,
      summary: 'Infraestrutura e serviços associados à execução de automações.', // [H-01]
      items: [
        'Componentes escolhidos conforme a necessidade, nenhum obrigatório', // [H-03]
        'Responsabilidades de cada parte delimitadas por escrito', // [D-03]
        'Disponibilidade confirmada em avaliação de viabilidade', // [H-02]
      ],
      href: '#hosting',
      cta: 'Entender o Hosting',
    },
  ],
  // [C-01] [C-02]
  note: 'Delivery e Hosting podem ser contratados separadamente ou em conjunto. Nenhum deles exige o uso de produtos próprios da Nekkora.',
};

/* ------------------------------------------------------------------ */
/* Preços do Delivery — bloco data-pricing                            */
/* ------------------------------------------------------------------ */
/**
 * Tabela oficial de 22/10/2026 (COM-RELEASE-003-R1) no layout do mockup "modelo C" [PR-01..PR-06]. Valores e
 * percentuais só podem aparecer dentro do bloco `data-pricing` (verificado por scripts/homologacao.mjs). Datas da
 * campanha antes da publicação: pendência PUB-13.
 */
export const PRICING = {
  eyebrow: 'Preços · Nekkora Delivery',
  title: 'Quanto custa uma automação',
  // [PR-01] [PR-06]
  description: 'Valores por automação. A categoria é definida na avaliação e fica registrada na proposta, junto com escopo e condições.',
  // [PR-02] Preços especiais de lançamento (COM-RELEASE-003-R1): nunca um percentual único para todas as categorias —
  // cada preço mostra a própria economia. Com as datas da campanha em publicacao.json (PUB-13), o período aparece por
  // extenso e a página só mostra os preços de lançamento dentro dele (config.ts, isLaunchActive); sem as datas, só como
  // prévia de homologação, e o deploy de produção fica bloqueado (scripts/verificar-publicacao.mjs).
  // [PR-07] Regras aprovadas na COM-008-B (AUD-04, AUD-06): dois meses a partir da publicação oficial; vale a data da
  // SOLICITAÇÃO; proposta com prazo de aceite de 7 dias corridos; preço individual por automação.
  launch: {
    badge: 'Lançamento',
    text: LAUNCH_PERIOD
      ? `Preços especiais de lançamento para solicitações de avaliação recebidas de ${LAUNCH_PERIOD.start} a ${LAUNCH_PERIOD.end}.`
      : 'Preços especiais de lançamento.',
    condition:
      'Valem para automações simples e médias solicitadas durante a campanha, conforme a categoria definida na avaliação. A proposta pode ser aceita em até 7 dias corridos da emissão. A automação complexa tem orçamento individual.',
    /** Só na prévia de homologação, sem datas aprovadas: nenhuma elegibilidade antes do início oficial. */
    pendingDates: 'Prévia para revisão: as datas da campanha ainda não foram definidas. Nenhuma solicitação é elegível antes do início oficial.',
  },
  // [PR-06] — nenhum processo é enquadrado de antemão como simples ou médio
  criteria: {
    title: 'O que define a categoria',
    items: [
      'Quantidade de sistemas envolvidos',
      'Complexidade das integrações',
      'Regras de negócio e exceções',
      'Volume de processamento',
      'Exigências de infraestrutura',
      'Necessidade de licenciamento',
    ],
    note: 'Nem todo processo é simples ou médio: a avaliação indica a categoria antes de qualquer proposta.',
  },
  // [CO-01..CO-08] — modelo de atendimento (NEKKORA-RELEASE-001 §5.5) com as condições da COM-008-B; nada aqui promete
  // prazo, resultado ou disponibilidade. Minuta das cláusulas: docs/comercial/condicoes-comerciais-minuta.md (não
  // aprovada juridicamente).
  conditions: {
    title: 'Condições comerciais',
    items: [
      'Desenvolvimento sob demanda, com escopo formalizado em proposta',
      // [CO-07] AUD-07/AUD-13 — contratar várias automações juntas não as transforma em uma complexa
      'Pode solicitar várias automações: cada uma tem categoria, escopo, preço e aceite próprios',
      'Preço aprovado por você antes do início do desenvolvimento',
      // [CO-03] AUD-16 — 50/50 é condição de PAGAMENTO, não percentual de desconto
      'Pagamento de 50% após a aprovação da proposta e a formalização da contratação, e 50% após a homologação e o aceite formal',
      'Demandas organizadas em fila: o início depende da fila e da aprovação da proposta',
      'Reuniões e acompanhamento conforme as condições acordadas',
      'Licenças e custos externos tratados à parte, quando aplicáveis',
      // [CO-08] AUD-17/AUD-18 — sem cláusula absoluta: as regras ficam na proposta e no contrato, com os direitos legais
      'Cancelamento, reembolso e garantia conforme a proposta e o contrato, preservados os direitos previstos em lei',
    ],
  },
  // [PR-01] [PR-02] — valores, economia e percentual vêm de src/precos.ts (calculados, nunca digitados)
  tiers: [
    {
      overline: 'Simples',
      title: 'Automação simples',
      fit: 'Um sistema ou planilha, regras diretas, poucas exceções.',
      variant: 'surface' as const,
      price: { tier: 'simples' as const, ...priceFacts('simples') },
    },
    {
      overline: 'Média',
      title: 'Automação média',
      fit: 'Mais de um sistema, validações, tratamento de exceções e relatórios.',
      variant: 'raised' as const,
      price: { tier: 'media' as const, ...priceFacts('media') },
    },
    {
      overline: 'Complexa',
      title: 'Automação complexa',
      // AUD-07: contratar várias automações juntas não as torna complexas
      fit: 'Processos ponta a ponta ou com várias integrações por API.',
      variant: 'outlined' as const,
      // [PR-03] — sem desconto automático: o valor depende do dimensionamento e da aprovação comercial
      negotiated: { label: 'Sob orçamento', unit: 'dimensionada na avaliação · orçamento individual' },
      cta: 'Solicitar avaliação',
    },
  ],
  unit: 'por automação',
  launchUnit: 'por automação · preço de lançamento',
  /** "Economia de <valor>" — o valor economizado (padrão − lançamento), ao lado do percentual. */
  savings: (label: string) => `Economia de ${label}`,
  /** Rótulos lidos por leitor de tela: o valor riscado não é anunciado como riscado, então cada valor diz o que é. */
  srFrom: 'Preço padrão:',
  srTo: 'Preço especial de lançamento:',
  srPercent: 'Desconto de',
  notes: [
    {
      icon: 'studio' as IconName,
      tone: 'accent' as const,
      // [PR-04] — AUD-09, opção A (COM-008-B): processo e ferramentas internas, sem nome de produto, sem exigência para
      // o cliente (P-02) e sem afirmar redução de horas, de retrabalho ou ROI, que não foram medidos
      title: 'Como chegamos a esses valores',
      text: 'Trabalhamos com processos padronizados e ferramentas internas de documentação e desenvolvimento. Isso nos permite oferecer estes valores sem retirar etapas: documentação, desenvolvimento, testes e homologação continuam no escopo.',
    },
    {
      icon: 'key' as IconName,
      tone: 'warning' as const,
      // [A-09] [PR-05] — AUD-10: licenças de terceiros × infraestrutura do cliente × Nekkora Hosting
      title: 'Licenças e infraestrutura',
      text: 'Indicamos na proposta as licenças e os serviços de terceiros necessários (UiPath, Power Automate, APIs pagas); em regra, a contratação é do cliente, e esses custos não estão incluídos nos valores acima. A automação pode rodar na infraestrutura do próprio cliente ou, se contratado à parte, no Nekkora Hosting.',
    },
  ],
  hostingNote: 'Hosting tem avaliação e proposta próprias.', // [H-02]
};

/* ------------------------------------------------------------------ */
/* Simulador de investimento — dentro do bloco data-pricing           */
/* ------------------------------------------------------------------ */
/**
 * NEKKORA-CALC-001. Valores sempre de src/precos.ts (simulate): nada aqui tem número de preço ou percentual. Sem ROI,
 * horas economizadas ou classificação automática da automação: a categoria é confirmada na avaliação [PR-06] [X-03].
 * A economia exibida é a diferença entre os preços comerciais, nunca economia operacional [PR-08].
 */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const SIMULATOR = {
  title: 'Simulador de Investimento — Nekkora Delivery',
  description: 'Escolha quantas automações de cada categoria você tem em mente e veja uma estimativa do investimento. Sem cadastro: nada do que você seleciona é enviado ou guardado.',
  tiers: [
    { tier: 'simples' as const, label: 'Automações simples', one: 'automação simples', many: 'automações simples' },
    { tier: 'media' as const, label: 'Automações médias', one: 'automação média', many: 'automações médias' },
    { tier: 'complexa' as const, label: 'Automações complexas', one: 'automação complexa', many: 'automações complexas' },
  ],
  decrease: (label: string) => `Diminuir ${label.toLowerCase()}`,
  increase: (label: string) => `Aumentar ${label.toLowerCase()}`,
  max: (n: number) => `Até ${n} por categoria. Para mais, fale com a Nekkora.`,
  total: (n: number) => `Total selecionado: ${plural(n, 'automação', 'automações')}`,
  calculate: 'Calcular meu investimento',
  clear: 'Limpar simulação',
  empty: 'Selecione ao menos uma automação para calcular.',
  changed: 'As quantidades mudaram. Clique em "Calcular meu investimento" para atualizar a estimativa.',
  cleared: 'Simulação limpa.',
  help: {
    title: 'Não sabe a categoria da sua automação?',
    text: 'A categoria depende de sistemas, integrações, regras, volume e licenças, e é confirmada na avaliação. Na dúvida, solicite uma avaliação ou veja',
    link: 'o que define a categoria',
  },
  resultTitle: 'Resultado da simulação',
  /** "2 automações simples" — para o resumo. */
  count: (tier: 'simples' | 'media' | 'complexa', n: number) => {
    const t = SIMULATOR.tiers.find((x) => x.tier === tier)!;
    return plural(n, t.one, t.many);
  },
  estimateLabel: (launch: boolean, partial: boolean) =>
    partial ? (launch ? 'Subtotal estimado com preços de lançamento' : 'Subtotal estimado') : launch ? 'Investimento estimado com preços de lançamento' : 'Investimento estimado',
  standardLabel: 'Pelo preço padrão',
  savingsLabel: 'Economia promocional',
  percentLabel: 'Desconto equivalente sobre o total calculável',
  each: 'cada',
  complexLine: 'sob orçamento individual',
  partialNote: (n: number) =>
    `${n === 1 ? 'A automação complexa exige' : 'As automações complexas exigem'} orçamento individual e não ${n === 1 ? 'entra' : 'entram'} no valor acima, que não é o preço completo da contratação.`,
  onlyComplex: 'Automações complexas têm orçamento individual, definido na avaliação. Por isso, esta simulação não mostra um valor.',
  savingsNote: 'A economia é a diferença entre o preço padrão e o preço de lançamento das categorias selecionadas — não é uma economia operacional comprovada.',
  /** Por situação da campanha (src/precos.ts, campaignState). */
  campaign: {
    vigente: 'Preços de lançamento em vigor para solicitações recebidas durante a campanha.',
    pendente: 'Prévia para revisão: as datas da campanha ainda não foram definidas. Nenhuma solicitação é elegível antes do início oficial.',
    futura: 'Valores pelo preço padrão. Os preços de lançamento ainda não estão em vigor.',
    encerrada: 'Valores pelo preço padrão. A campanha de lançamento foi encerrada.',
  } satisfies Record<CampaignState, string>,
  // Texto obrigatório (NEKKORA-CALC-001 §3.7)
  disclaimer:
    'Esta simulação é uma estimativa baseada nas categorias selecionadas. A classificação, o escopo e o investimento definitivo serão confirmados na avaliação e registrados em proposta comercial.',
  next: 'Próximo passo',
  schedule: 'Agendar uma conversa',
  request: 'Solicitar avaliação',
  /** Anúncio para leitores de tela (região viva), sem mover o foco. */
  announce: (summary: string) => `Resultado da simulação atualizado. ${summary}`,
};

/* ------------------------------------------------------------------ */
/* Como funciona                                                      */
/* ------------------------------------------------------------------ */
export const HOW_IT_WORKS = {
  eyebrow: 'Como funciona',
  title: 'Seis etapas, com a sua aprovação nos pontos de decisão.', // [D-01] — AUD-19
  // [A-03] [A-13]
  steps: [
    { title: 'Entendimento da necessidade', description: 'Você descreve o processo, as regras e o resultado esperado.' },
    { title: 'Viabilidade e dimensionamento', description: 'Analisamos sistemas, acessos e complexidade para dimensionar a automação.' },
    { title: 'Proposta', description: 'Escopo, preço e condições por escrito. O desenvolvimento começa após a sua aprovação.' },
    { title: 'Desenvolvimento e testes', description: 'Construímos e testamos a automação conforme o escopo aprovado.' },
    // COM-008-B §5.4: disponibilização, registro e correção de defeitos, aceite formal — o silêncio não vale como aceite
    {
      title: 'Homologação e aceite',
      description: 'Você valida a automação no seu cenário e registra os defeitos encontrados. Depois das correções, a homologação só é concluída com o seu aceite formal.',
    },
    {
      title: 'Entrega definitiva',
      description: 'Após o aceite e a confirmação do pagamento, entregamos o que foi previsto na proposta, com documentação e dependências identificadas.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Hosting — faixa pôster                                             */
/* ------------------------------------------------------------------ */
export const HOSTING = {
  eyebrow: 'Nekkora Hosting',
  title: 'Infraestrutura para executar automações, com responsabilidades delimitadas.',
  // [H-03] [A-10] — nenhum serviço apresentado como incluído
  description:
    'Hosting reúne serviços distintos — infraestrutura, configuração, administração, monitoramento, operação assistida, correção de incidentes, sustentação. Cada um é avaliado separadamente e só faz parte do contrato quando consta na proposta.',
  // [H-02] [H-05]
  availability: {
    title: 'Disponibilidade em avaliação.',
    text: 'Uma solicitação inicia uma avaliação de viabilidade e compatibilidade — não representa contratação nem reserva de capacidade.',
  },
  cta: 'Solicitar avaliação de viabilidade',
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
    // [A-02] [A-08] [A-09] [D-03] [D-02]
    // AUD-18 (F.5): correção de defeitos definida em proposta, sem afastar as garantias legais
    items: [
      'Escopo de cada automação',
      'Preço e condições de pagamento',
      'Prazo estimado',
      'Tecnologias e licenças necessárias',
      'Responsabilidades de cada parte',
      'Critérios de homologação e aceite',
      'Correção de defeitos do que foi entregue: prazo e condições, além das garantias legais',
    ],
  },
  excluded: {
    title: 'Não incluído automaticamente',
    // [A-10] [X-05] [X-06] [X-07] [X-08] [X-09] [PR-05] — bloco de exclusão (data-exclusion)
    items: [
      'Alterações futuras e novas funcionalidades',
      'Sustentação e evolução das automações',
      'Suporte, sustentação e garantia adicional após a entrega, salvo se previstos',
      'Infraestrutura e serviços de Hosting',
      'Licenças e serviços de terceiros — em regra, contratados pelo cliente',
      'Monitoramento, 24 horas, alta disponibilidade ou SLA',
    ],
  },
  dependencies: {
    title: 'Depende de você e de terceiros',
    // [A-11] [A-06]
    items: ['Liberação de acessos e credenciais', 'Estabilidade de sistemas externos', 'Disponibilidade da sua equipe para homologação', 'Fila operacional da Nekkora'],
  },
};

/* ------------------------------------------------------------------ */
/* Contato                                                            */
/* ------------------------------------------------------------------ */
export const CONTACT_COPY = {
  title: 'Vamos olhar o seu processo de perto?',
  description: 'A solicitação inicia uma avaliação — não é uma contratação e não gera compromisso.',
  cta: 'Solicitar avaliação',
  // Alternativa sem formulário (§5.4): canais diretos, sem preencher nada no site
  directTitle: 'Prefere falar direto?',
  // [K-01..K-03] pendentes
  pendingCaption: 'Canais oficiais em definição · formulário em modo de demonstração',
  // Diálogo "Solicitar avaliação" (modelo C, etapa 2)
  dialogTitle: 'Solicitar avaliação',
  // AUD-25 (F.6): o diálogo serve a quem quer uma automação nova e a quem precisa de hospedagem ou infraestrutura
  dialogDescription:
    'Conte o que você precisa: uma automação nova, a hospedagem de uma automação existente ou infraestrutura e serviços relacionados. Antes de qualquer envio, você revisa a mensagem. A solicitação inicia uma avaliação — não é uma contratação.',
  formTitle: 'Formulário de solicitação',
  /** Tipo de solicitação (COM-008-C §8). A primeira linha da mensagem diz qual é; o CTA do Hosting já abre com a hospedagem. */
  demand: {
    legend: 'O que você precisa?',
    options: [
      { value: 'automacao', label: 'Desenvolver uma nova automação', line: 'Quero solicitar uma avaliação de automação.' },
      {
        value: 'hospedagem',
        label: 'Hospedar uma automação existente',
        line: 'Quero solicitar uma avaliação de viabilidade para hospedar uma automação existente (Nekkora Hosting).',
      },
      {
        value: 'infraestrutura',
        label: 'Infraestrutura e serviços relacionados',
        line: 'Quero solicitar uma avaliação de infraestrutura e serviços relacionados (Nekkora Hosting).',
      },
    ],
  },
  messageLabel: 'Descreva o processo ou a necessidade',
  processHint: 'O que acontece hoje, quais sistemas envolve, com que frequência e qual resultado você espera. Até 1.000 caracteres.',
  /**
   * Resumo do simulador (NEKKORA-CALC-001 §3.8): só entra na mensagem se o visitante marcar a opção, e aparece na
   * etapa de confirmação antes de qualquer envio. Nada é guardado.
   */
  simulation: {
    include: 'Incluir o resumo da minha simulação na mensagem',
    hint: 'Opcional. Você confere o texto antes de enviar; a simulação não é guardada.',
    heading: 'Simulação feita no site (estimativa, sujeita à avaliação):',
  },
  emailHint: 'Opcional — só se preferir retorno por e-mail.',
  privacyLink: 'Como tratamos seus dados',
  orForm: 'ou preencha o formulário',
  // [K-05]
  demoNote: 'Modo de demonstração: nenhum dado é enviado ou armazenado.',
  demoSubmit: 'Revisar solicitação',
  reviewSubmit: 'Revisar mensagem',
  // Etapa "Confirmar solicitação" (§5.2/§5.3) — textos comuns aos dois canais
  review: {
    title: 'Confirme a sua solicitação',
    back: 'Voltar e editar',
    copy: 'Copiar mensagem',
    copied: 'Mensagem copiada.',
    copyFailed: 'Não foi possível copiar automaticamente — selecione o texto da mensagem acima.',
    manual: 'Se o WhatsApp não abrir, copie a mensagem e envie para',
    email: 'Prefere e-mail? Escreva para',
  },
  /** Jornada pelo WhatsApp — só com número confirmado em publicacao.json (PUB-01). */
  whatsapp: {
    direct: 'Falar diretamente pelo WhatsApp',
    note: 'Na próxima etapa você confere a mensagem antes de abrir o WhatsApp. Nada é armazenado nesta página.',
    intro: 'Esta é a mensagem que será aberta no WhatsApp. Confira antes de continuar.',
    transfer:
      'Ao continuar, o WhatsApp (serviço da Meta) é aberto em outra aba com esta mensagem — tipo de solicitação, nome, empresa, e-mail, descrição e, se você o incluiu, o resumo da simulação, como estão acima. Ela só chega à Nekkora se você tocar em enviar na conversa. Esta página não guarda o que você digitou.',
    open: 'Abrir no WhatsApp',
    // Nunca afirmar abertura nem envio: com noopener o navegador não informa se a aba foi criada (D-18).
    requested: {
      title: 'Pedimos ao navegador para abrir o WhatsApp',
      text: 'Se a conversa não apareceu em uma nova aba, use o botão abaixo. A mensagem só é enviada quando você a confirmar no WhatsApp.',
    },
    again: 'Abrir conversa no WhatsApp',
  },
  /** Jornada pelo e-mail — canal da publicação enquanto não houver WhatsApp (decisão da titular, 22/10/2026) [K-02]. */
  email: {
    direct: 'Escrever diretamente por e-mail',
    note: 'Na próxima etapa você confere a mensagem antes de abrir o seu aplicativo de e-mail. Nada é armazenado nesta página.',
    intro: 'Esta é a mensagem que será aberta no seu aplicativo de e-mail, endereçada à Nekkora. Confira antes de continuar.',
    transfer:
      'Ao continuar, o seu aplicativo de e-mail é aberto com esta mensagem — tipo de solicitação, nome, empresa, e-mail, descrição e, se você o incluiu, o resumo da simulação, como estão acima. Ela só chega à Nekkora se você a enviar pelo aplicativo. Esta página não guarda o que você digitou.',
    open: 'Abrir no e-mail',
    // A página não sabe se algum aplicativo de e-mail abriu: diz só o que pediu ao navegador (mesma regra da D-18).
    requested: {
      title: 'Pedimos ao navegador para abrir o seu aplicativo de e-mail',
      text: 'Se nenhum aplicativo abriu, copie a mensagem e envie para o endereço abaixo. A mensagem só é enviada quando você a enviar pelo seu e-mail.',
    },
    again: 'Abrir no e-mail novamente',
    manual: 'Se o aplicativo de e-mail não abrir, copie a mensagem e envie para',
  },
  /**
   * Recebimento automático (COM-RELEASE-005 §5.7) — só com o endpoint do backend em publicacao.json. "Recebida" só
   * com a confirmação do servidor; na falha, os dados ficam no formulário e o e-mail aparece como alternativa.
   */
  api: {
    note: 'Na próxima etapa você confere os dados antes de enviar.',
    emailHint: 'Obrigatório — é por ele que respondemos.',
    emailRequired: 'Informe um e-mail para recebermos e respondermos a sua solicitação, como nome@empresa.com.',
    intro: 'Confira os dados abaixo. Eles serão enviados à Nekkora quando você tocar em "Enviar solicitação".',
    transfer:
      'Ao enviar, tipo de solicitação, nome, empresa, e-mail, descrição e, se incluído, o resumo da simulação vão para a Nekkora por um serviço da AWS, que entrega a solicitação na caixa de e-mail comercial. Só usamos os dados para responder e preparar a avaliação.',
    challenge: 'Verificação de segurança automática (Cloudflare Turnstile) para evitar envios por robôs.',
    challengeWaiting: 'Aguardando a verificação de segurança…',
    challengeUnavailable: 'A verificação de segurança não carregou. Você pode tentar de novo ou usar o e-mail abaixo.',
    send: 'Enviar solicitação',
    sending: 'Enviando…',
    sendingStatus: 'Enviando a solicitação. Aguarde a confirmação.',
    received: {
      title: 'Solicitação recebida',
      text: (protocolo: string) => `Protocolo ${protocolo}. Vamos responder pelo e-mail informado. A solicitação inicia uma avaliação — não é uma contratação.`,
    },
    failed: {
      title: 'A solicitação não foi enviada',
      rede: 'Não conseguimos falar com o servidor. Confira a sua conexão e tente de novo — os dados continuam aqui.',
      limite: 'Recebemos muitas solicitações em pouco tempo. Tente de novo mais tarde ou use o e-mail abaixo.',
      desafio: 'Não foi possível confirmar a verificação de segurança. Faça a verificação de novo e tente enviar.',
      indisponivel: 'O envio não foi concluído por uma falha temporária. Os dados continuam aqui: tente de novo em instantes ou use o e-mail abaixo.',
      recusada: 'Não foi possível enviar esta solicitação. Revise os dados ou escreva diretamente para o e-mail abaixo.',
    },
    retry: 'Tentar novamente',
    alternative: 'Se preferir, envie a mesma mensagem pelo seu e-mail para',
    openEmail: 'Abrir no e-mail',
  },
  demoResult: {
    title: 'Solicitação validada — envio desativado nesta versão',
    text: 'Nenhum dado foi enviado ou armazenado. Quando os canais oficiais forem publicados, este formulário passará a encaminhar a solicitação.',
  },
};

/* ------------------------------------------------------------------ */
/* Agendamento — Microsoft Bookings (COM-RELEASE-005 §4)              */
/* ------------------------------------------------------------------ */
/**
 * Só aparece com a URL oficial do Bookings em publicacao.json. Duração, plataforma e antecedência são configuradas no
 * Bookings e não são prometidas aqui antes de confirmadas. A página nunca diz que a reunião foi marcada: quem confirma
 * é o Bookings.
 */
export const SCHEDULE = {
  cta: 'Agendar conversa',
  /** Completa o nome acessível do botão (o destino abre em outra aba). */
  srExternal: '(abre o Microsoft Bookings em outra aba)',
  note: 'Escolha um horário na agenda da Nekkora, no Microsoft Bookings. A conversa só fica marcada quando o Bookings confirmar.',
  dialogPrompt: 'Prefere conversar antes?',
};

/* ------------------------------------------------------------------ */
/* Barra de navegação                                                 */
/* ------------------------------------------------------------------ */
/*
 * Botão "Entrar" (modelo C, etapa 2): OCULTO por decisão da titular na COM-008-B (AUD-26, PUB-16) enquanto não houver
 * área de clientes. Cadastro, autenticação e área do cliente ficam para a futura Nekkora Platform
 * (docs/roadmap/NEKKORA-PLATFORM-POLITICAS-BACKLOG.md), não para o Commercial.
 */

/* ------------------------------------------------------------------ */
/* Privacidade (§5.4) — minuta para revisão da titular                */
/* ------------------------------------------------------------------ */
/**
 * Só fatos do código e da hospedagem: sem cookies, sem análise, sem envio pelo formulário. Controlador e provedor de
 * hospedagem vêm de publicacao.json; enquanto pendentes, o texto usa termos genéricos e o deploy de produção fica
 * bloqueado (aprovação "avisoDePrivacidade").
 */
// AUD-33: com o CNPJ confirmado, o aviso o mostra mesmo sem a razão social (que continua pendente e não é inventada)
const controller = `${DATA_CONTROLLER.name ?? 'a Nekkora'}${DATA_CONTROLLER.document ? ` (CNPJ ${DATA_CONTROLLER.document})` : ''}`;
const viaApi = REQUEST_CHANNEL === 'api';
/**
 * Minuta revisada na COM-RELEASE-005 §6 (envio automático e Microsoft Bookings). Cada item descreve o que acontece DE
 * FATO na configuração publicada: sem endpoint, o formulário não envia nada; sem a URL do Bookings, o item do
 * agendamento não aparece. Bases legais por finalidade (LGPD, art. 7º) documentadas em
 * docs/release/COM-RELEASE-005-privacidade.md — submetida à titular para aprovação (PUB-09).
 */
export const PRIVACY = {
  eyebrow: 'Privacidade',
  title: 'Como tratamos seus dados',
  description: `Responsável pelos dados pessoais desta página: ${controller}.`,
  items: [
    viaApi
      ? {
          icon: 'send' as IconName,
          title: 'O que o formulário envia',
          // [PV-05] — envio automático: só depois da confirmação; o que é guardado e por quanto tempo
          text: `Só quando você toca em "Enviar solicitação": nome, e-mail, empresa (se informada) e a descrição do processo vão para um serviço da Nekkora na ${HOSTING_PROVIDER ?? 'nuvem'}, que entrega a solicitação na caixa comercial ${CHANNELS.email ?? 'da Nekkora'} (Microsoft 365). O serviço não guarda o conteúdo: mantém por 24 horas só um código técnico do pedido, para não receber a mesma solicitação duas vezes.`,
        }
      : {
          icon: 'shield' as IconName,
          title: 'O formulário não envia nada',
          text: 'O que você digita fica apenas no seu navegador. Nenhum dado vai para servidores da Nekkora por esta página.',
        },
    // [PV-02] — o item descreve o canal que a jornada usa de fato (WhatsApp ou e-mail; REQUEST_CHANNEL em config.ts)
    ...(viaApi
      ? []
      : [
          REQUEST_CHANNEL === 'email'
            ? {
                icon: 'mail' as IconName,
                title: 'O que vai para o e-mail',
                text: `Só quando você confirma: nome, empresa e e-mail (se informados) e a descrição do processo vão para uma mensagem aberta no seu aplicativo de e-mail, endereçada a ${CHANNELS.email}. Ela só é enviada se você a enviar pelo aplicativo.`,
              }
            : {
                icon: 'whatsapp' as IconName,
                title: 'O que vai para o WhatsApp',
                text: 'Só quando você confirma: nome, empresa e e-mail (se informados) e a descrição do processo seguem no texto da mensagem para o WhatsApp, serviço da Meta, sujeito aos termos e à política de privacidade dele. A mensagem só é enviada se você tocar em enviar na conversa.',
              },
        ]),
    // [PV-06] — agendamento: só com a URL oficial do Bookings; o Bookings armazena a reserva
    ...(BOOKINGS_URL
      ? [
          {
            icon: 'calendar' as IconName,
            title: 'Agendamento pelo Microsoft Bookings',
            // AUD-38 (F.8): a conversa é pelo Microsoft Teams
            text: 'Ao agendar, você sai desta página para o Microsoft Bookings, serviço da Microsoft usado pela Nekkora. Nome, e-mail, respostas às perguntas do agendamento e o horário escolhido ficam registrados na agenda da Nekkora no Microsoft 365 e são usados para confirmar e lembrar o horário e realizar a conversa pelo Microsoft Teams. Não informe senhas, credenciais nem documentos sigilosos.',
          },
        ]
      : []),
    {
      icon: 'eye' as IconName,
      title: 'Sem cookies nem rastreamento',
      // [PV-03] AUD-43: o escopo é esta página; o Bookings segue as regras da Microsoft
      text:
        'Esta página não usa cookies nem ferramentas de análise ou de publicidade. O navegador guarda apenas a sua escolha de tema (claro ou escuro); o simulador de investimento não guarda nem envia o que você seleciona. Fontes e imagens vêm do próprio site.' +
        (BOOKINGS_URL ? ' O Microsoft Bookings, para onde leva o botão "Agendar conversa", segue as regras da Microsoft.' : '') +
        // [PV-07] — o desafio antiautomação é de terceiro e só carrega na confirmação do envio
        (LEAD_API?.turnstileSiteKey
          ? ' Na confirmação do envio, uma verificação de segurança da Cloudflare (Turnstile) analisa sinais técnicos do navegador para impedir envios por robôs.'
          : ''),
    },
    {
      icon: 'server' as IconName,
      title: 'Registros de acesso',
      // [PV-04] — o provedor processa esses dados para entregar as páginas; a página não grava nada além disso
      text:
        `${HOSTING_PROVIDER ? `A ${HOSTING_PROVIDER}, que hospeda este site,` : 'O provedor de hospedagem'} processa dados técnicos de acesso, como endereço IP e navegador, para entregar as páginas e proteger o serviço.` +
        (viaApi ? ' Para limitar abusos, o serviço de solicitações conta envios por endereço IP sem guardar o endereço (só um código derivado dele), por até 2 dias.' : ''),
    },
    // [PV-09] AUD-39: prazos aprovados na COM-008-B. A eliminação é feita pela Nekkora (não há rotina automática): o texto
    // descreve o prazo, não uma execução automática
    {
      icon: 'clock' as IconName,
      title: 'Por quanto tempo guardamos',
      text: `Mensagens e dados de contato de quem não chegou a contratar ficam guardados por até seis meses após o último contato relevante.${BOOKINGS_URL ? ' Reservas do Microsoft Bookings, por até 90 dias após a reunião ou o cancelamento.' : ''} Dados ligados a uma contratação seguem os prazos do contrato e os exigidos por lei.`,
    },
    // [PV-10] AUD-40: transferência internacional (regiões dos provedores a confirmar — revisão jurídica)
    {
      icon: 'link' as IconName,
      title: 'Onde os dados são processados',
      text: `Os serviços da Microsoft (Microsoft 365${BOOKINGS_URL ? ', Bookings e Teams' : ''}) e ${HOSTING_PROVIDER ? `da ${HOSTING_PROVIDER}` : 'do provedor de hospedagem'} usados pela Nekkora podem processar dados em servidores fora do Brasil.`,
    },
    // [PV-08] COM-008-B §9: base legal ≠ ciência da política ≠ consentimento
    {
      icon: 'user' as IconName,
      title: 'Uso e seus direitos',
      text: `Usamos os dados que você nos envia só para responder à solicitação${BOOKINGS_URL ? ', realizar a conversa agendada' : ''} e preparar avaliação e proposta, a seu pedido (LGPD, art. 7º, V). Para isso não pedimos consentimento: os dados são necessários para atender ao seu pedido. Se algum outro uso depender de consentimento, ele será pedido à parte. Você pode pedir confirmação, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade e informações sobre o compartilhamento dos seus dados e, quando houver consentimento, revogá-lo (LGPD, art. 18)${CHANNELS.email ? `, pelo e-mail ${CHANNELS.email}` : ', pelos canais de contato desta página'}.`,
    },
  ],
};

export const FOOTER = {
  privacy: 'Privacidade',
  preview: 'Versão para homologação',
  build: 'build',
  dirty: 'com alterações locais',
  devServer: 'servidor de desenvolvimento',
  signature: 'Neko (猫) observa os detalhes.',
};
