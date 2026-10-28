/** Tipos de agendamento-url.js (regra única da URL do Microsoft Bookings, usada pela página e pelo portão). */
export declare const BOOKINGS_HOSTS: readonly string[];
export declare function isBookingsUrl(
  u: unknown,
  opcoes: { emailDomain: string | null; tenantDomain?: string | null; producao?: boolean },
): u is string;
