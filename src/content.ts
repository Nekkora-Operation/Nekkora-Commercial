/**
 * Texto comercial da página — fonte única para revisão.
 *
 * Toda frase aqui segue o contrato comercial (docs/com-001/02-contrato-comercial.md). Os comentários [A-01], [H-03]…
 * apontam a linha da matriz de alegações (docs/com-001/03-matriz-alegacoes.md) que autoriza o trecho.
 * Antes de mudar uma promessa, atualize a matriz.
 */
import type { IconName } from 'nekkora-lib';

export interface Feature {
  icon: IconName;
  title: string;
  text: string;
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */
export const HERO = {
  badge: 'Nekkora Delivery · Nekkora Hosting',
  titleLead: 'Automação sob medida,',
  titleAccent: 'da necessidade à execução.',
  // [A-01] [A-02] [H-01] [H-02 → avaliação] [C-01]
  lead:
    'Desenvolvemos automações por demanda, com escopo, preço e aceite definidos em proposta para cada uma. ' +
    'Se fizer sentido para você, avaliamos também a infraestrutura para executá-las. Cada serviço é contratado de forma independente.',
  primaryCta: 'Solicitar avaliação',
  secondaryCta: 'Ver como funciona',
  // [D-01] [D-02] [D-04]
  points: [
    { icon: 'file', label: 'Proposta por automação' },
    { icon: 'check-circle', label: 'Homologação e aceite' },
    { icon: 'layers', label: 'Sem pacote obrigatório' },
  ] as { icon: IconName; label: string }[],
  /** Ilustração da jornada — demonstrativa, sem dados (X-11, X-12). [A-03] */
  journey: {
    label: 'Ilustração',
    title: 'Jornada de uma automação',
    steps: ['Necessidade', 'Avaliação', 'Proposta', 'Desenvolvimento e testes', 'Homologação e aceite', 'Entrega'],
    execution: 'Execução no seu ambiente ou com o Nekkora Hosting, sujeito a avaliação',
  },
};

/* ------------------------------------------------------------------ */
/* Soluções                                                           */
/* ------------------------------------------------------------------ */
export const SOLUTIONS = {
  eyebrow: 'Soluções',
  title: 'Duas ofertas complementares, contratadas como você precisar',
  description: 'Delivery desenvolve a automação. Hosting trata da infraestrutura para executá-la, sujeito a avaliação. Use um, outro ou os dois.',
  cards: [
    {
      id: 'delivery',
      icon: 'code' as IconName,
      name: 'Nekkora Delivery',
      stage: 'Sob proposta',
      stageTone: 'accent' as const,
      summary: 'Desenvolvimento de automações por demanda.', // [A-01]
      items: [
        'Escopo, prazo e preço definidos em proposta para cada automação', // [A-02]
        'Desenvolvimento, testes e homologação com aceite', // [A-03]
        'Entrega e transferência conforme contratado', // [A-13]
      ],
      href: '#delivery',
      cta: 'Conhecer o Delivery',
    },
    {
      id: 'hosting',
      icon: 'server' as IconName,
      name: 'Nekkora Hosting',
      stage: 'Em avaliação de viabilidade',
      stageTone: 'info' as const,
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
  noteLink: 'Ver as combinações',
};

/* ------------------------------------------------------------------ */
/* Delivery                                                           */
/* ------------------------------------------------------------------ */
export const DELIVERY = {
  eyebrow: 'Nekkora Delivery',
  title: 'Automação desenvolvida para o seu processo',
  // [A-04] [A-02]
  description:
    'Cada automação é avaliada e dimensionada individualmente. Antes de qualquer desenvolvimento, você recebe uma proposta com escopo, preço e condições.',
  features: [
    { icon: 'file', title: 'Uma automação, uma proposta', text: 'Cada processo tem escopo, preço, condições e aceite próprios.' }, // [A-02] [A-04]
    { icon: 'layers', title: 'Vários processos, uma fila organizada', text: 'Você pode solicitar mais de uma automação. As demandas seguem a fila operacional da Nekkora.' }, // [A-05] [A-06]
    { icon: 'calendar', title: 'Reuniões quando necessárias', text: 'Os encontros são combinados conforme a etapa e a necessidade do projeto.' }, // [A-07]
    { icon: 'code', title: 'Tecnologia conforme o caso', text: 'Python, UiPath, Power Automate e integrações entre sistemas, escolhidos na avaliação.' }, // [A-08]
  ] as Feature[],
  // [A-09]
  licenses: 'Licenças e serviços de terceiros, quando necessários, dependem de avaliação e constam da proposta.',
  applications: {
    title: 'Exemplos de aplicação',
    // [A-12]
    caption: 'Exemplos ilustrativos. A viabilidade de cada caso é avaliada individualmente.',
    items: [
      'Conciliações e conferências entre planilhas e sistemas',
      'Extração e lançamento de dados em portais e sistemas web',
      'Leitura e triagem de e-mails e documentos',
      'Integração entre sistemas por API',
      'Geração e envio de relatórios recorrentes',
    ],
  },
  cta: 'Solicitar avaliação de uma automação',
};

/* ------------------------------------------------------------------ */
/* Como funciona                                                      */
/* ------------------------------------------------------------------ */
export const HOW_IT_WORKS = {
  eyebrow: 'Como funciona',
  title: 'Da conversa inicial ao aceite, em etapas claras',
  description: 'O caminho de cada automação contratada pelo Delivery. Nada é desenvolvido sem uma proposta aprovada.', // [D-01]
  // [A-03] [A-13]
  steps: [
    { icon: 'message' as IconName, title: 'Entendimento da necessidade', description: 'Você descreve o processo, as regras e o resultado esperado.' },
    { icon: 'search' as IconName, title: 'Viabilidade e dimensionamento', description: 'Analisamos sistemas, acessos e complexidade para dimensionar a automação.' },
    { icon: 'file' as IconName, title: 'Proposta', description: 'Escopo, preço e condições por escrito. O desenvolvimento começa após a sua aprovação.' },
    { icon: 'code' as IconName, title: 'Desenvolvimento e testes', description: 'Construímos e testamos a automação conforme o escopo aprovado.' },
    { icon: 'check-circle' as IconName, title: 'Homologação e aceite', description: 'Você valida a automação no seu cenário e formaliza o aceite.' },
    { icon: 'send' as IconName, title: 'Entrega e transferência', description: 'Entregamos e transferimos o que foi previsto na proposta.' },
  ],
  // [A-11] [A-06]
  timing: {
    title: 'O que influencia o prazo',
    text: 'O prazo é estimado na proposta e depende de fatores que vão além do desenvolvimento:',
    items: ['Posição da demanda na fila operacional', 'Liberação de acessos e credenciais', 'Disponibilidade e estabilidade de sistemas externos', 'Tempo de homologação da sua equipe'],
  },
};

/* ------------------------------------------------------------------ */
/* Hosting                                                            */
/* ------------------------------------------------------------------ */
export const HOSTING = {
  eyebrow: 'Nekkora Hosting',
  title: 'Infraestrutura para executar automações, com responsabilidades delimitadas',
  // [H-03] [C-02]
  description:
    'Hosting reúne serviços distintos. Cada um é avaliado separadamente e só faz parte do contrato quando consta na proposta. Nenhum deles é necessário para contratar o Delivery.',
  // [H-02] [H-05]
  availability: {
    title: 'Disponibilidade em avaliação',
    text: 'A oferta de Hosting está em definição comercial. Uma solicitação inicia uma avaliação de viabilidade e compatibilidade — não representa contratação nem reserva de capacidade.',
  },
  catalogTitle: 'O que cada serviço significa',
  // [H-03] [A-10] — nenhum item é apresentado como incluído
  services: [
    { icon: 'server', title: 'Infraestrutura para execução', text: 'Ambiente (máquinas, servidores ou serviços) onde a automação roda.', terms: 'Avaliada conforme requisitos técnicos e compatibilidade.' },
    { icon: 'settings', title: 'Configuração inicial', text: 'Preparação do ambiente: instalação, dependências e acessos.', terms: 'Definida na proposta, quando contratada.' },
    { icon: 'refresh', title: 'Administração e manutenção do ambiente', text: 'Atualizações e cuidados com o ambiente ao longo do tempo.', terms: 'Serviço à parte, com escopo próprio.' },
    { icon: 'monitor', title: 'Monitoramento técnico', text: 'Acompanhamento da saúde do ambiente: máquinas e serviços.', terms: 'Escopo, horários e forma definidos em proposta, se contratado.' },
    { icon: 'pulse', title: 'Monitoramento de processos', text: 'Acompanhamento das execuções da automação e de seus resultados.', terms: 'Escopo definido em proposta, se contratado.' },
    { icon: 'users', title: 'Operação assistida', text: 'Acompanhamento de execuções em um período combinado, junto à sua equipe.', terms: 'Período e responsabilidades definidos em proposta.' },
    { icon: 'alert', title: 'Correção de incidentes', text: 'Análise e correção de falhas na execução.', terms: 'Abrangência e condições definidas em proposta.' },
    { icon: 'workflow', title: 'Sustentação e evolução das automações', text: 'Ajustes por mudanças no processo ou nos sistemas e novas funcionalidades.', terms: 'Não incluída no desenvolvimento; contratada à parte.' },
  ] as (Feature & { terms: string })[],
  termsLabel: 'Como é contratado',
  accordionHint: 'Toque em um serviço para ver o que ele significa. A forma de contratação aparece em todos.',
  cta: 'Solicitar avaliação de viabilidade',
};

/* ------------------------------------------------------------------ */
/* Solução combinada                                                  */
/* ------------------------------------------------------------------ */
export const COMBINED = {
  eyebrow: 'Delivery, Hosting ou os dois',
  title: 'Você escolhe o arranjo',
  description: 'Cada serviço tem proposta e condições próprias. Nenhuma combinação exige o uso de produtos internos da Nekkora.', // [C-01] [C-02]
  options: [
    {
      icon: 'code' as IconName,
      title: 'Delivery independente',
      text: 'A automação é desenvolvida e entregue para rodar no ambiente que você indicar.',
      fit: 'Faz sentido quando você já tem infraestrutura e equipe para executar as automações.',
      condition: null as string | null,
    },
    {
      icon: 'server' as IconName,
      title: 'Hosting independente',
      text: 'Execução de automações que você já tem, desenvolvidas pela sua equipe ou por terceiros.',
      fit: 'Faz sentido quando a automação existe, mas falta um ambiente adequado para executá-la.',
      condition: 'Sujeito a compatibilidade técnica e disponibilidade, confirmadas em avaliação.', // [H-04]
    },
    {
      icon: 'layers' as IconName,
      title: 'Delivery + Hosting',
      text: 'Desenvolvimento e ambiente de execução avaliados em conjunto.',
      fit: 'Os requisitos do ambiente podem ser considerados desde a proposta, e a passagem da homologação para a execução pode ser planejada junto.', // [C-03]
      condition: 'A parte de Hosting segue a mesma avaliação de viabilidade.', // [H-02]
    },
  ],
  // [A-10] [X-09]
  limits: {
    title: 'Limites da contratação combinada',
    items: [
      'Contratar os dois serviços não inclui automaticamente sustentação, evolução, monitoramento ou correção de incidentes — esses itens valem apenas quando constam na proposta.',
      'Cada serviço mantém escopo, preço, condições e aceite próprios.',
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Diferenciais                                                       */
/* ------------------------------------------------------------------ */
export const DIFFERENTIALS = {
  eyebrow: 'Diferenciais',
  title: 'Eficiência que vem do método',
  description: 'Mecanismos concretos de trabalho, não promessas de resultado.',
  items: [
    { icon: 'file', title: 'Proposta antes do código', text: 'Escopo, preço e condições por escrito antes de iniciar o desenvolvimento.' }, // [D-01]
    { icon: 'check-circle', title: 'Aceite formal', text: 'A entrega passa por homologação com você e termina com aceite.' }, // [D-02]
    { icon: 'search', title: 'Dimensionamento individual', text: 'Cada processo é avaliado separadamente, sem escopos genéricos.' }, // [A-04]
    { icon: 'id-card', title: 'Responsabilidades explícitas', text: 'O que cabe à Nekkora e o que cabe a você fica descrito na proposta.' }, // [D-03]
    { icon: 'layers', title: 'Serviços independentes', text: 'Delivery e Hosting são contratados juntos ou separados, sem pacote obrigatório.' }, // [D-04]
    { icon: 'workflow', title: 'Ferramenta adequada ao caso', text: 'Python, UiPath, Power Automate ou integrações: a escolha parte do processo, não de uma plataforma própria.' }, // [D-05] [A-08]
  ] as Feature[],
  manifesto: { lead: 'Clareza no escopo, eficiência no método', accent: 'e autonomia na escolha.' },
};

/* ------------------------------------------------------------------ */
/* Transparência                                                      */
/* ------------------------------------------------------------------ */
export const TRANSPARENCY = {
  eyebrow: 'Transparência',
  title: 'O que esperar da contratação',
  description: 'O que é definido em proposta, do que o andamento depende e o que não está incluído sem acordo explícito.',
  defined: {
    title: 'Definido em proposta',
    // [A-02] [A-08] [A-09] [D-03] [D-02]
    items: ['Escopo de cada automação', 'Preço e condições de pagamento', 'Prazo estimado', 'Tecnologias e licenças necessárias', 'Responsabilidades de cada parte', 'Critérios de homologação e aceite'],
  },
  excluded: {
    title: 'Não incluído automaticamente',
    // [A-10] [X-05] [X-06] [X-07] [X-08] [X-09] — bloco de exclusão (data-exclusion)
    items: [
      'Alterações futuras e novas funcionalidades',
      'Sustentação e evolução das automações',
      'Garantia após a entrega, salvo se prevista em proposta',
      'Infraestrutura e serviços de Hosting',
      'Licenças e serviços de terceiros',
      'Monitoramento, atendimento 24 horas, alta disponibilidade ou SLA',
    ],
  },
  dependencies: {
    title: 'Depende de você e de terceiros',
    // [A-11] [A-06]
    items: ['Liberação de acessos e credenciais', 'Estabilidade de sistemas e portais externos', 'Disponibilidade da sua equipe para homologação', 'Fila operacional da Nekkora'],
  },
  // [P-01] — única menção permitida aos produtos internos (data-internal-products)
  products: {
    title: 'Produtos em desenvolvimento',
    text: 'A Nekkora também desenvolve o Studio, a Platform e o Agent. Esses produtos estão em desenvolvimento, não fazem parte das ofertas desta página e não são necessários para contratar Delivery ou Hosting.',
  },
};

/* ------------------------------------------------------------------ */
/* Contato                                                            */
/* ------------------------------------------------------------------ */
export const CONTACT_COPY = {
  eyebrow: 'Contato',
  title: 'Solicite uma avaliação',
  description: 'Conte qual processo você quer automatizar ou executar. A solicitação inicia uma avaliação — não é uma contratação e não gera compromisso.',
  // [K-01..K-03] pendentes
  pending: {
    title: 'Canais de contato em definição',
    text: 'Os canais oficiais (WhatsApp, e-mail e redes sociais) ainda não foram publicados. O formulário desta versão é de demonstração: valida os dados, mas não envia nem armazena nada.',
  },
  // [A-03] [A-07] [D-01]
  next: {
    title: 'Como a avaliação acontece',
    items: [
      'Lemos a descrição e, se for preciso, combinamos uma conversa para entender o processo.',
      'Avaliamos a viabilidade e dimensionamos a automação ou o ambiente.',
      'Se fizer sentido, você recebe uma proposta com escopo, preço e condições.',
      'Nada é desenvolvido ou contratado sem a sua aprovação.',
    ],
  },
  formTitle: 'Conte o que você precisa',
  interests: [
    { value: 'delivery', label: 'Delivery', description: 'Desenvolvimento de uma ou mais automações' },
    { value: 'hosting', label: 'Hosting', description: 'Infraestrutura para executar automações (avaliação de viabilidade)' },
    { value: 'combinado', label: 'Delivery e Hosting', description: 'Desenvolvimento e execução avaliados em conjunto' },
    { value: 'indefinido', label: 'Ainda não sei', description: 'Quero ajuda para entender o melhor caminho' },
  ],
  processHint: 'Quais sistemas envolve, com que frequência acontece e qual resultado você espera. Até 1.000 caracteres.',
  // [K-05]
  demoNote: 'Modo de demonstração: nenhum dado é enviado ou armazenado.',
  demoSubmit: 'Revisar solicitação',
  whatsappSubmit: 'Enviar pelo WhatsApp',
  whatsappNote: 'Ao enviar, abrimos o WhatsApp com a sua mensagem pronta. Nada é armazenado nesta página.',
  // Nunca afirmar envio: a página só sabe se a aba foi aberta, não se a mensagem foi enviada.
  whatsappOpened: {
    title: 'WhatsApp aberto em uma nova aba',
    text: 'A mensagem só é enviada quando você a confirmar no WhatsApp. Se a aba não apareceu, use o botão abaixo.',
  },
  whatsappBlocked: {
    title: 'Não foi possível abrir o WhatsApp automaticamente',
    text: 'O navegador bloqueou a nova aba. Use o botão abaixo para abrir a conversa com a mensagem pronta.',
  },
  whatsappManual: 'Abrir conversa no WhatsApp',
  demoResult: {
    title: 'Solicitação validada — envio desativado nesta versão',
    text: 'Nenhum dado foi enviado ou armazenado. Quando os canais oficiais forem publicados, este formulário passará a encaminhar a solicitação.',
  },
};

/* ------------------------------------------------------------------ */
/* Rodapé                                                             */
/* ------------------------------------------------------------------ */
export const FOOTER = {
  tagline: 'Automação sob medida, da necessidade à execução.',
  pendingChannels: 'Canais oficiais em definição.',
  preview: 'Versão para homologação — conteúdo sujeito à aprovação da Nekkora.',
  signature: 'Neko (猫) observa os detalhes.',
};
