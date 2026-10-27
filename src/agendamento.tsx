import { Button, Link } from 'nekkora-lib';
import { BOOKINGS_URL } from './config';
import { SCHEDULE } from './content';

/**
 * "Agendar conversa" (COM-RELEASE-005 §4.4/§4.6): página externa oficial do Microsoft Bookings, em outra aba, por um
 * link comum — sem window.open, sem iframe, sem opener e sem Referer (rel="noopener noreferrer"). Sem a URL oficial
 * confirmada, não renderiza nada: o agendamento não aparece como disponível.
 */
export function ScheduleButton({ size = 'lg', variant = 'secondary' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'primary' | 'secondary' | 'outline' }) {
  if (!BOOKINGS_URL) return null;
  return (
    <Button size={size} pill variant={variant} leftIcon="calendar" href={BOOKINGS_URL} target="_blank" rel="noopener noreferrer" data-agendar="">
      {SCHEDULE.cta}
      <span className="nk-visually-hidden"> {SCHEDULE.srExternal}</span>
    </Button>
  );
}

/** Versão em linha, para o diálogo "Solicitar avaliação". */
export function ScheduleLink() {
  if (!BOOKINGS_URL) return null;
  return (
    <p className="contact__note request__schedule">
      {SCHEDULE.dialogPrompt}{' '}
      <Link href={BOOKINGS_URL} leftIcon="calendar" external data-agendar="">
        {SCHEDULE.cta}
        <span className="nk-visually-hidden"> {SCHEDULE.srExternal}</span>
      </Link>
    </p>
  );
}
