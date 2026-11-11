/** Tipo de publicacao.json (resolvido pelo alias @publicacao em vite.config.ts). */
declare module '@publicacao' {
  const publicacao: {
    canais: { whatsapp: string | null; email: string | null; linkedin: string | null; instagram: string | null };
    /** dominioDoTenant: opcional; só com ele uma caixa *.onmicrosoft.com é aceita (e só a do próprio tenant). */
    agendamento: { url: string | null; obrigatorio: boolean; dominioDoTenant?: string | null };
    envioAutomatico: { endpoint: string | null; chaveDoSiteTurnstile: string | null };
    campanhaLancamento: { inicio: string | null; fim: string | null };
    controlador: { nome: string | null; documento: string | null };
    /** Endereço comercial do fornecedor (Decreto 7.962/2013, art. 2º, II). Só a titular preenche (PUB-22). */
    fornecedor?: { endereco: string | null };
    hospedagem: { provedor: string | null };
    aprovacoes: {
      precos: boolean;
      condicoesComerciais: boolean;
      textosComerciais: boolean;
      avisoDePrivacidade: boolean;
      agendamento: boolean;
      envioAutomatico: boolean;
      publicacao: boolean;
    };
    avisoHomologacao: boolean;
    /** COM-VITRINE-001 §9.3: impressão digital da tabela aprovada (PUB-14) e aprovação da tabela pós-campanha (V-01). */
    tabelaDePrecos?: { impressao: string | null; posCampanha: boolean };
    /** COM-VITRINE-001 §3.1: data de início das novas condições (AAAA-MM-DD), definida pela titular. */
    novasCondicoes?: { inicio: string | null };
    /** COM-VITRINE-001 §7: disponibilidade real de Monitor e AI (PUB-23). */
    servicos?: { monitor: 'em-preparacao' | 'disponivel'; ai: 'em-preparacao' | 'disponivel' };
  };
  export default publicacao;
}

/** Identificação do build (vite.config.ts → define): mostrada no aviso de homologação do rodapé. */
declare const __NEKKORA_BUILD__: { commit: string | null; arvoreLimpa: boolean; servidor: 'build' | 'desenvolvimento' };
