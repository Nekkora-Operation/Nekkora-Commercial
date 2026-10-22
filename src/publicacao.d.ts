/** Tipo de publicacao.json (resolvido pelo alias @publicacao em vite.config.ts). */
declare module '@publicacao' {
  const publicacao: {
    canais: { whatsapp: string | null; email: string | null; linkedin: string | null; instagram: string | null };
    campanhaLancamento: { inicio: string | null; fim: string | null };
    controlador: { nome: string | null; documento: string | null };
    hospedagem: { provedor: string | null };
    aprovacoes: { precosECondicoes: boolean; textosComerciais: boolean; avisoDePrivacidade: boolean; publicacao: boolean };
    avisoHomologacao: boolean;
  };
  export default publicacao;
}
