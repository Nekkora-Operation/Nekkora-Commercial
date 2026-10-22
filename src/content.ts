/**
 * Texto comercial da página — fonte única para revisão.
 *
 * Layout "modelo C — Poster" (mockup da responsável, 2026-10-15). Toda frase segue o contrato comercial
 * (docs/com-001/02-contrato-comercial.md). Os comentários [A-01], [H-03], [PR-01]… apontam a linha da matriz de
 * alegações (docs/com-001/03-matriz-alegacoes.md) que autoriza o trecho. Antes de mudar uma promessa, atualize a matriz.
 */
import type { IconName } from 'nekkora-lib';
import { CHANNELS, DATA_CONTROLLER, HOSTING_PROVIDER, LAUNCH_PERIOD, REQUEST_CHANNEL } from './config';
import { priceFacts } from './precos';

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
        'Entrega considerada pronta só com documentação, desenvolvimento, testes e homologação com você — cada etapa mediante a sua aprovação', // [A-03] [A-14]
        'Entrega e transferência conforme contratado', // [A-13]
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
  // extenso e a página só mostra os preços de lançamento dentro dele (src/precos.ts, launchActive); sem as datas, o
  // deploy de produção fica bloqueado (scripts/verificar-publicacao.mjs).
  launch: {
    badge: 'Lançamento',
    text: LAUNCH_PERIOD
      ? `Preços especiais de lançamento para propostas aprovadas de ${LAUNCH_PERIOD.start} a ${LAUNCH_PERIOD.end}.`
      : 'Preços especiais de lançamento.',
    condition: 'Valem para automações simples e médias com proposta aprovada durante a campanha. A automação complexa tem orçamento individual.',
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
  // [CO-01..CO-06] — modelo de atendimento (NEKKORA-RELEASE-001 §5.5); nada aqui promete prazo, resultado ou disponibilidade
  conditions: {
    title: 'Condições comerciais',
    items: [
      'Desenvolvimento sob demanda, com escopo formalizado em proposta',
      'Preço aprovado por você antes do início do desenvolvimento',
      'Pagamento de 50% na contratação e 50% na entrega, conforme a proposta',
      'Demandas organizadas em fila: o início depende da fila e da aprovação da proposta',
      'Reuniões e acompanhamento conforme as condições acordadas',
      'Licenças e custos externos tratados à parte, quando aplicáveis',
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
      overline: 'Complexa · pacotes',
      title: 'Automação complexa',
      fit: 'Processos ponta a ponta, várias integrações por API ou várias automações contratadas em conjunto.',
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
      // [PR-04] — ferramenta interna, sem nome de produto e sem exigência para o cliente (P-02 continua proibida)
      title: 'Por que os valores são baixos',
      text: 'Usamos uma ferramenta própria que agiliza a documentação e o desenvolvimento de cada automação. Menos horas de levantamento e retrabalho, preço menor para você — sem cortar etapas: documentação, testes e homologação continuam no escopo.',
    },
    {
      icon: 'key' as IconName,
      tone: 'warning' as const,
      // [A-09] [PR-05]
      title: 'Licenças ficam por conta do cliente',
      text: 'Qualquer licença de software ou serviço de terceiros (UiPath, Power Automate, APIs, servidores) é responsabilidade do cliente. Indicamos o que é necessário na proposta; a contratação e o custo não estão incluídos nos valores acima.',
    },
  ],
  hostingNote: 'Hosting tem avaliação e proposta próprias.', // [H-02]
};

/* ------------------------------------------------------------------ */
/* Como funciona                                                      */
/* ------------------------------------------------------------------ */
export const HOW_IT_WORKS = {
  eyebrow: 'Como funciona',
  title: 'Seis etapas. Nenhuma sem a sua aprovação.', // [D-01]
  // [A-03] [A-13]
  steps: [
    { title: 'Entendimento da necessidade', description: 'Você descreve o processo, as regras e o resultado esperado.' },
    { title: 'Viabilidade e dimensionamento', description: 'Analisamos sistemas, acessos e complexidade para dimensionar a automação.' },
    { title: 'Proposta', description: 'Escopo, preço e condições por escrito. O desenvolvimento começa após a sua aprovação.' },
    { title: 'Desenvolvimento e testes', description: 'Construímos e testamos a automação conforme o escopo aprovado.' },
    { title: 'Homologação e aceite', description: 'Você valida a automação no seu cenário e formaliza o aceite.' },
    { title: 'Entrega e transferência', description: 'Entregamos e transferimos o que foi previsto na proposta.' },
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
    items: ['Escopo de cada automação', 'Preço e condições de pagamento', 'Prazo estimado', 'Tecnologias e licenças necessárias', 'Responsabilidades de cada parte', 'Critérios de homologação e aceite'],
  },
  excluded: {
    title: 'Não incluído automaticamente',
    // [A-10] [X-05] [X-06] [X-07] [X-08] [X-09] [PR-05] — bloco de exclusão (data-exclusion)
    items: [
      'Alterações futuras e novas funcionalidades',
      'Sustentação e evolução das automações',
      'Garantia após a entrega, salvo se prevista',
      'Infraestrutura e serviços de Hosting',
      'Licenças e serviços de terceiros — responsabilidade do cliente',
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
  dialogDescription: 'Conte qual processo você quer automatizar. Antes de qualquer envio, você revisa a mensagem. A solicitação inicia uma avaliação — não é uma contratação.',
  formTitle: 'Formulário de solicitação',
  processHint: 'Quais sistemas envolve, com que frequência acontece e qual resultado você espera. Até 1.000 caracteres.',
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
      'Ao continuar, o WhatsApp (serviço da Meta) é aberto em outra aba com esta mensagem — nome, empresa, e-mail e descrição, como estão acima. Ela só chega à Nekkora se você tocar em enviar na conversa. Esta página não guarda o que você digitou.',
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
      'Ao continuar, o seu aplicativo de e-mail é aberto com esta mensagem — nome, empresa, e-mail e descrição, como estão acima. Ela só chega à Nekkora se você a enviar pelo aplicativo. Esta página não guarda o que você digitou.',
    open: 'Abrir no e-mail',
    // A página não sabe se algum aplicativo de e-mail abriu: diz só o que pediu ao navegador (mesma regra da D-18).
    requested: {
      title: 'Pedimos ao navegador para abrir o seu aplicativo de e-mail',
      text: 'Se nenhum aplicativo abriu, copie a mensagem e envie para o endereço abaixo. A mensagem só é enviada quando você a enviar pelo seu e-mail.',
    },
    again: 'Abrir no e-mail novamente',
    manual: 'Se o aplicativo de e-mail não abrir, copie a mensagem e envie para',
  },
  demoResult: {
    title: 'Solicitação validada — envio desativado nesta versão',
    text: 'Nenhum dado foi enviado ou armazenado. Quando os canais oficiais forem publicados, este formulário passará a encaminhar a solicitação.',
  },
};

/* ------------------------------------------------------------------ */
/* Rodapé                                                             */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Barra de navegação                                                 */
/* ------------------------------------------------------------------ */
/**
 * Botão "Entrar" do modelo C (etapa 2), "sem redirecionamento" por decisão da responsável. Não existe área do
 * cliente disponível (Platform em desenvolvimento — P-02): o botão fica marcado como indisponível e explica isso
 * a quem usa leitor de tela ou passa o mouse (D-24, PUB-16).
 */
export const LOGIN = {
  label: 'Entrar',
  unavailable: 'Acesso de clientes ainda não disponível.',
};

/* ------------------------------------------------------------------ */
/* Privacidade (§5.4) — minuta para revisão da titular                */
/* ------------------------------------------------------------------ */
/**
 * Só fatos do código e da hospedagem: sem cookies, sem análise, sem envio pelo formulário. Controlador e provedor de
 * hospedagem vêm de publicacao.json; enquanto pendentes, o texto usa termos genéricos e o deploy de produção fica
 * bloqueado (aprovação "avisoDePrivacidade").
 */
const controller = DATA_CONTROLLER.name ? `${DATA_CONTROLLER.name}${DATA_CONTROLLER.document ? ` (${DATA_CONTROLLER.document})` : ''}` : 'a Nekkora';
export const PRIVACY = {
  eyebrow: 'Privacidade',
  title: 'Como tratamos seus dados',
  description: `Responsável pelos dados pessoais desta página: ${controller}.`,
  items: [
    {
      icon: 'shield' as IconName,
      title: 'O formulário não envia nada',
      text: 'O que você digita fica apenas no seu navegador. Nenhum dado vai para servidores da Nekkora por esta página.',
    },
    // [PV-02] — o item descreve o canal que a jornada usa de fato (WhatsApp ou e-mail; REQUEST_CHANNEL em config.ts)
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
    {
      icon: 'eye' as IconName,
      title: 'Sem cookies nem rastreamento',
      text: 'Não usamos cookies nem ferramentas de análise ou de publicidade. O navegador guarda apenas a sua escolha de tema (claro ou escuro). Fontes e imagens vêm do próprio site.',
    },
    {
      icon: 'server' as IconName,
      title: 'Registros de acesso',
      // [PV-04] — o provedor processa esses dados para entregar as páginas; a página não grava nada além disso
      text: `${HOSTING_PROVIDER ? `A ${HOSTING_PROVIDER}, que hospeda este site,` : 'O provedor de hospedagem'} processa dados técnicos de acesso, como endereço IP e navegador, para entregar as páginas e proteger o serviço.`,
    },
    {
      icon: 'user' as IconName,
      title: 'Uso e seus direitos',
      text: 'Usamos os dados que você nos envia só para responder à solicitação e preparar avaliação e proposta (LGPD, art. 7º, V), pelo tempo necessário a esse atendimento ou exigido por lei. Você pode pedir acesso, correção ou exclusão pelos canais de contato desta página.',
    },
  ],
};

export const FOOTER = {
  privacy: 'Privacidade',
  preview: 'Versão para homologação',
  signature: 'Neko (猫) observa os detalhes.',
};
