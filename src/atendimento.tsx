import { createContext, useCallback, useContext, useRef, useState, type ComponentProps, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { Alert, Button, Checkbox, Dialog, Fieldset, Input, Textarea } from 'nekkora-lib';
import { SERVICE_IDS, WHATSAPP_GREETING, whatsappUrl, type ServiceId } from './config';
import { REQUEST_FORM as F, SERVICE_NAMES } from './content';
import { FORM_LIMITS, buildMessage, validateRequest, type RequestErrors, type RequestFields } from './mensagem';

/** Como o formulário abre: serviços já marcados (vindo de um produto ou da calculadora) e o resumo da simulação. */
export type RequestOptions = { services?: ServiceId[]; simulation?: string | null };

const RequestContext = createContext<(options?: RequestOptions) => void>(() => {});

/** O formulário só existe com o WhatsApp confirmado em publicacao.json (o portão de publicação exige o número). */
export const REQUEST_AVAILABLE = whatsappUrl() != null;

/**
 * Props para os CTAs que abrem o formulário (botões, links e o botão flutuante). href="#contato" é o destino de reserva
 * (nova aba, script indisponível); o clique normal abre o formulário.
 */
export function useRequestTrigger(options?: RequestOptions) {
  const open = useContext(RequestContext);
  return {
    href: '#contato',
    'aria-haspopup': 'dialog' as const,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(options);
    },
  };
}

const EMPTY: RequestFields = { name: '', company: '', email: '', description: '' };

/**
 * Formulário de atendimento (NEKKORA-COM-ECOSYSTEM-001 §7). Só prepara a mensagem no navegador e abre o WhatsApp em outra
 * aba, sem opener e sem Referer. Nada é enviado à Nekkora pela página: sem endpoint, banco de dados, e-mail, API do
 * WhatsApp nem armazenamento persistente (o estado vive só na memória da página). Abrir o WhatsApp não é o recebimento:
 * a mensagem só chega quando o visitante a envia.
 */
export function RequestProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<RequestFields>(EMPTY);
  const [services, setServices] = useState<ServiceId[]>([]);
  const [simulation, setSimulation] = useState<string | null>(null);
  const [includeSimulation, setIncludeSimulation] = useState(false);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [link, setLink] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const show = useCallback((options?: RequestOptions) => {
    setServices(options?.services ?? []);
    setSimulation(options?.simulation ?? null);
    // o resumo da simulação começa DESMARCADO (titular, 20/11/2026): só entra na mensagem se o visitante marcar
    setIncludeSimulation(false);
    setErrors({});
    setLink(null);
    setOpen(true);
  }, []);

  const close = () => {
    setOpen(false);
    // depois de abrir o WhatsApp, nada fica na memória da página
    if (link) {
      setFields(EMPTY);
      setSimulation(null);
      setLink(null);
    }
  };

  const set = (k: keyof RequestFields) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setFields((f) => ({ ...f, [k]: value }));
    if (errors[k as keyof RequestErrors]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const toggle = (id: ServiceId) => setServices((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateRequest(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      // foco no primeiro campo com erro
      const first = (['name', 'email', 'description'] as const).find((k) => found[k]);
      formRef.current?.querySelector<HTMLElement>(`[data-campo="${first}"]`)?.focus();
      return;
    }
    const chosen = SERVICE_IDS.filter((id) => services.includes(id)).map((id) => SERVICE_NAMES[id]);
    const message = buildMessage(WHATSAPP_GREETING, F.message, fields, chosen, includeSimulation ? simulation : null);
    const url = whatsappUrl(message);
    if (!url) return;
    setLink(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const footer = link ? (
    <>
      <Button variant="ghost" onClick={() => setLink(null)}>
        {F.back}
      </Button>
      <Button onClick={close}>{F.close}</Button>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={close}>
        {F.cancel}
      </Button>
      <Button type="submit" form="atendimento-form" leftIcon="whatsapp">
        {F.submit}
        <span className="nk-visually-hidden"> (abre o WhatsApp em outra aba)</span>
      </Button>
    </>
  );

  return (
    <RequestContext.Provider value={show}>
      {children}
      {REQUEST_AVAILABLE && (
        <Dialog open={open} onClose={close} title={F.title} description={link ? undefined : F.description} footer={footer} size="md" className="request" data-atendimento="">
          {link ? (
            <div className="request__done" data-atendimento-aberto="">
              <Alert tone="info" title={F.opened.title} live="polite">
                {F.opened.text}
              </Alert>
              <Button variant="secondary" leftIcon="whatsapp" href={link} target="_blank" rel="noopener noreferrer" data-whatsapp="formulario">
                {F.again}
                <span className="nk-visually-hidden"> (abre o WhatsApp em outra aba)</span>
              </Button>
            </div>
          ) : (
            <form id="atendimento-form" ref={formRef} className="request__form" onSubmit={submit} noValidate aria-label={F.title}>
              <div className="request__grid">
                <Input label={F.name.label} required placeholder={F.name.placeholder} autoComplete="name" maxLength={FORM_LIMITS.name} value={fields.name} onChange={set('name')} error={errors.name && F.name.error} data-campo="name" fullWidth />
                <Input label={F.company.label} placeholder={F.company.placeholder} hint={F.company.hint} autoComplete="organization" maxLength={FORM_LIMITS.company} value={fields.company} onChange={set('company')} data-campo="company" fullWidth />
              </div>
              <Input label={F.email.label} type="email" placeholder={F.email.placeholder} hint={F.email.hint} autoComplete="email" maxLength={FORM_LIMITS.email} value={fields.email} onChange={set('email')} error={errors.email && F.email.error} data-campo="email" fullWidth />
              <Textarea
                label={F.description_.label}
                required
                placeholder={F.description_.placeholder}
                hint={F.description_.hint}
                rows={4}
                maxLength={FORM_LIMITS.description}
                value={fields.description}
                onChange={set('description')}
                error={errors.description && F.description_.error}
                data-campo="description"
                fullWidth
              />
              <Fieldset legend={F.services.legend} description={F.services.description} variant="plain" columns={3}>
                {SERVICE_IDS.map((id) => (
                  <Checkbox key={id} label={SERVICE_NAMES[id]} checked={services.includes(id)} onChange={() => toggle(id)} data-servico-interesse={id} />
                ))}
              </Fieldset>
              {simulation && (
                <div className="request__simulation">
                  <Checkbox label={F.simulation.include} hint={F.simulation.hint} checked={includeSimulation} onChange={(e) => setIncludeSimulation(e.target.checked)} data-incluir-simulacao="" />
                  <pre className="request__message">{simulation}</pre>
                </div>
              )}
            </form>
          )}
        </Dialog>
      )}
    </RequestContext.Provider>
  );
}

/** Botão que abre o formulário — mesmo visual do Button da nekkora-lib. */
export function RequestButton({ options, children, ...rest }: { options?: RequestOptions; children: ReactNode } & Omit<ComponentProps<typeof Button>, 'href' | 'children' | 'onClick'>) {
  const trigger = useRequestTrigger(options);
  if (!REQUEST_AVAILABLE) return null;
  return (
    <Button leftIcon="whatsapp" {...rest} {...trigger}>
      {children}
    </Button>
  );
}
