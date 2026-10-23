/** Tipo de publicacao.json (resolvido pelo alias @publicacao em vite.config.ts). */
declare module '@publicacao' {
  const publicacao: {
    canais: { whatsapp: string | null; email: string | null; linkedin: string | null; instagram: string | null };
    agendamento: { url: string | null; obrigatorio: boolean };
    envioAutomatico: { endpoint: string | null; chaveDoSiteTurnstile: string | null };
    campanhaLancamento: { inicio: string | null; fim: string | null };
    controlador: { nome: string | null; documento: string | null };
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
  };
  export default publicacao;
}

/** Identificação do build (vite.config.ts → define): mostrada no aviso de homologação do rodapé. */
declare const __NEKKORA_BUILD__: { commit: string | null; arvoreLimpa: boolean; servidor: 'build' | 'desenvolvimento' };
