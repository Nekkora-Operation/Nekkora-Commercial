import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, DescriptionList, Dialog, Divider, Input, Link, Logo, Textarea } from 'nekkora-lib';
import { CHANNELS, hasAnyChannel, whatsappUrl } from '../config';
import { CONTACT_COPY } from '../content';
import { useRequestTrigger } from '../request';

type Field = 'name' | 'email' | 'message';
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 1000;
const FORM_ID = 'form-solicitacao';

/**
 * Diálogo "Solicitar avaliação" (modelo C, etapa 2): WhatsApp direto ou formulário. Sem back-end (fora do escopo).
 * Com WhatsApp confirmado em config.ts, o formulário abre o WhatsApp com a mensagem montada; sem canal confirmado,
 * funciona em modo de demonstração — valida e mostra o resumo, sem enviar nada (K-05). O atalho "Falar diretamente
 * pelo WhatsApp" só existe com número confirmado (nunca aponta para destino provisório).
 */
export function RequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [reviewed, setReviewed] = useState(false);
  /** Link do WhatsApp com a mensagem montada — exibido sempre como alternativa manual. */
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const directWhatsapp = whatsappUrl();
  const canSend = directWhatsapp != null;

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Informe como podemos chamar você.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Informe um e-mail válido, como nome@empresa.com.';
    if (message.trim().length < 20) e.message = 'Descreva o processo com pelo menos 20 caracteres.';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Leva o foco ao primeiro campo inválido, na ordem do formulário.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if (canSend) {
      const text = [
        `Olá! Sou ${name.trim()}${company.trim() ? `, da ${company.trim()}` : ''}.`,
        'Quero solicitar uma avaliação.',
        message.trim(),
        `Contato: ${email.trim()}${phone ? ` · ${phone}` : ''}`,
      ].join('\n\n');
      const url = whatsappUrl(text)!;
      // noopener,noreferrer desde a abertura: a aba externa nunca recebe referência a esta página nem o Referer.
      // Com essas features o navegador não informa se a aba foi criada, então a página só diz que a abertura foi
      // solicitada e oferece sempre o link manual (D-18).
      window.open(url, '_blank', 'noopener,noreferrer');
      setWhatsapp(url);
    }
    setReviewed(true);
  };

  // Ao trocar o formulário pelo resumo, leva o foco ao resultado.
  useEffect(() => {
    if (reviewed) doneRef.current?.focus();
  }, [reviewed]);

  const edit = () => {
    setReviewed(false);
    setWhatsapp(null);
  };

  const footer = reviewed ? (
    <div className="request__actions">
      <Button variant="ghost" leftIcon="edit" onClick={edit}>
        Editar solicitação
      </Button>
      <Button onClick={onClose}>Fechar</Button>
    </div>
  ) : (
    <>
      <div className="request__actions">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form={FORM_ID} rightIcon={canSend ? 'send' : 'check'}>
          {canSend ? CONTACT_COPY.whatsappSubmit : CONTACT_COPY.demoSubmit}
        </Button>
      </div>
      <span className="contact__note request__note">{canSend ? CONTACT_COPY.whatsappNote : CONTACT_COPY.demoNote}</span>
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} title={CONTACT_COPY.dialogTitle} description={CONTACT_COPY.dialogDescription} footer={footer} size="md" className="request">
      {reviewed ? (
        <div ref={doneRef} tabIndex={-1} className="contact__done">
          {whatsapp ? (
            <>
              <Alert tone="info" title={CONTACT_COPY.whatsappRequested.title} live="polite">
                {CONTACT_COPY.whatsappRequested.text}
              </Alert>
              <Button leftIcon="whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer">
                {CONTACT_COPY.whatsappManual}
              </Button>
            </>
          ) : (
            <Alert tone="info" title={CONTACT_COPY.demoResult.title} live="polite">
              {CONTACT_COPY.demoResult.text}
            </Alert>
          )}
          <DescriptionList
            items={[
              { term: 'Nome', description: name.trim() },
              { term: 'E-mail', description: email.trim() },
              { term: 'Telefone / WhatsApp', description: phone || null },
              { term: 'Empresa', description: company.trim() || null },
              { term: 'Processo', description: message.trim() },
            ]}
          />
        </div>
      ) : (
        <div className="request__body">
          {directWhatsapp ? (
            <>
              <Button variant="secondary" leftIcon="whatsapp" href={directWhatsapp} target="_blank" rel="noopener noreferrer" fullWidth>
                {CONTACT_COPY.whatsappDirect}
              </Button>
              <Divider label={CONTACT_COPY.orForm} />
            </>
          ) : (
            <p className="request__pending">{CONTACT_COPY.pendingCaption}</p>
          )}
          <form id={FORM_ID} ref={formRef} className="request__form" onSubmit={submit} noValidate aria-label={CONTACT_COPY.formTitle}>
            <div className="contact__form-grid">
              <Input label="Nome" required placeholder="Seu nome" leftIcon="user" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} fullWidth />
              <Input
                label="E-mail"
                required
                type="email"
                placeholder="nome@empresa.com"
                leftIcon="mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                fullWidth
              />
              <Input label="Telefone / WhatsApp" mask="phone" placeholder="(00) 00000-0000" leftIcon="phone" autoComplete="tel" value={phone} onValueChange={(masked) => setPhone(masked)} hint="Opcional" fullWidth />
              <Input label="Empresa" placeholder="Nome da empresa" leftIcon="building" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} hint="Opcional" fullWidth />
            </div>
            <Textarea
              label="Descreva o processo"
              required
              placeholder="Ex.: conferimos todo dia os pagamentos do banco com o sistema financeiro, manualmente."
              rows={4}
              maxLength={MAX_MESSAGE}
              hint={CONTACT_COPY.processHint}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              error={errors.message}
              fullWidth
            />
          </form>
        </div>
      )}
    </Dialog>
  );
}

/** Lista apenas os canais confirmados e válidos (config.ts). */
function Channels() {
  const wa = whatsappUrl();
  return (
    <div className="contact__channels">
      {wa && (
        <Button size="lg" pill variant="secondary" leftIcon="whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
          Falar no WhatsApp
        </Button>
      )}
      {CHANNELS.email && (
        <Link href={`mailto:${CHANNELS.email}`} variant="default" leftIcon="mail">
          {CHANNELS.email}
        </Link>
      )}
      {CHANNELS.instagram && (
        <Link href={CHANNELS.instagram} variant="default" leftIcon="instagram" external>
          Instagram
        </Link>
      )}
      {CHANNELS.linkedin && (
        <Link href={CHANNELS.linkedin} variant="default" leftIcon="linkedin" external>
          LinkedIn
        </Link>
      )}
    </div>
  );
}

/** Chamada em pôster centralizado (modelo C). O botão abre o diálogo "Solicitar avaliação" (D-23). */
export function Contact() {
  const trigger = useRequestTrigger();
  return (
    <section id="contato" className="section section--band" aria-labelledby="contato-title">
      <div className="wrap contact" data-contact-status={hasAnyChannel ? 'configurado' : 'pendente'}>
        <div className="contact__poster">
          <Logo variant="symbol" size={44} aria-hidden="true" />
          <h2 id="contato-title" className="contact__title">
            {CONTACT_COPY.title}
          </h2>
          <p className="contact__lead">{CONTACT_COPY.description}</p>
          <Button size="lg" pill rightIcon="arrow-right" {...trigger}>
            {CONTACT_COPY.cta}
          </Button>
          {hasAnyChannel ? <Channels /> : <span className="contact__caption">{CONTACT_COPY.pendingCaption}</span>}
        </div>
      </div>
    </section>
  );
}
