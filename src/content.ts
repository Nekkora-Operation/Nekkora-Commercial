/**
 * Texto comercial da página — fonte única para revisão.
 *
 * Layout "modelo C — Poster" (mockup da responsável, 2026-10-15). Toda frase segue o contrato comercial
 * (docs/com-001/02-contrato-comercial.md). Os comentários [A-01], [H-03], [PR-01]… apontam a linha da matriz de
 * alegações (docs/com-001/03-matriz-alegacoes.md) que autoriza o trecho. Antes de mudar uma promessa, atualize a matriz.
 */
import type { IconName } from 'nekkora-lib';

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
 * Valores e desconto de lançamento do mockup "modelo C" da responsável [PR-01..PR-05]. Só podem aparecer dentro do
 * bloco `data-pricing` (verificado por scripts/homologacao.mjs). Datas da campanha e confirmação final dos valores
 * antes da publicação: pendências PUB-13 e PUB-14.
 */
export const PRICING = {
  eyebrow: 'Preços · Nekkora Delivery',
  title: 'Quanto custa uma automação',
  // [PR-01]
  description: 'Valores por automação. A faixa é confirmada na avaliação e fica registrada na proposta, junto com escopo e condições.',
  // [PR-02]
  launch: {
    badge: 'Lançamento',
    text: '50% de desconto em todas as automações nos próximos 2 meses.',
    condition: 'Vale para propostas aprovadas no período.',
  },
  // [PR-01] [PR-02]
  tiers: [
    {
      overline: 'Simples',
      title: 'Automação simples',
      fit: 'Um sistema ou planilha, regras diretas, poucas exceções.',
      variant: 'surface' as const,
      price: { from: 'R$ 1.000', to: 'R$ 500', discount: '−50%', unit: 'por automação · lançamento' },
    },
    {
      overline: 'Média',
      title: 'Automação média',
      fit: 'Mais de um sistema, validações, tratamento de exceções e relatórios.',
      variant: 'raised' as const,
      price: { from: 'R$ 2.800', to: 'R$ 1.400', discount: '−50%', unit: 'por automação · lançamento' },
    },
    {
      overline: 'Completa · pacotes',
      title: 'Automações completas e pacotes',
      fit: 'Processos ponta a ponta, integrações por API ou várias automações contratadas em conjunto.',
      variant: 'outlined' as const,
      // [PR-03]
      negotiated: { label: 'Negociação à parte', unit: 'dimensionada na avaliação · desconto de lançamento aplicável' },
      cta: 'Solicitar avaliação',
    },
  ],
  /** Rótulos lidos por leitor de tela (o valor riscado não é anunciado como riscado). */
  srFrom: 'Valor sem desconto:',
  srTo: 'Valor com desconto de lançamento:',
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
  // [K-01..K-03] pendentes
  pendingCaption: 'Canais oficiais em definição · formulário em modo de demonstração',
  // Diálogo "Solicitar avaliação" (modelo C, etapa 2)
  dialogTitle: 'Solicitar avaliação',
  dialogDescription: 'Deixe seus dados e um resumo do processo. A solicitação inicia uma avaliação — não é uma contratação.',
  /** Só aparece com WhatsApp confirmado em config.ts (PUB-01). */
  whatsappDirect: 'Falar diretamente pelo WhatsApp',
  orForm: 'ou preencha o formulário',
  formTitle: 'Formulário de solicitação',
  processHint: 'Quais sistemas envolve, com que frequência acontece e qual resultado você espera. Até 1.000 caracteres.',
  // [K-05]
  demoNote: 'Modo de demonstração: nenhum dado é enviado ou armazenado.',
  demoSubmit: 'Revisar solicitação',
  whatsappSubmit: 'Enviar pelo WhatsApp',
  whatsappNote: 'Ao enviar, abrimos o WhatsApp com a sua mensagem pronta. Nada é armazenado nesta página.',
  // Nunca afirmar abertura nem envio: com noopener o navegador não informa se a aba foi criada (D-18).
  whatsappRequested: {
    title: 'Pedimos ao navegador para abrir o WhatsApp',
    text: 'Se a conversa não apareceu em uma nova aba, use o botão abaixo. A mensagem só é enviada quando você a confirmar no WhatsApp.',
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

export const FOOTER = {
  preview: 'Versão para homologação',
  signature: 'Neko (猫) observa os detalhes.',
};
