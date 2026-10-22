import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, DescriptionList, Dialog, Divider, Input, Link, Logo, Textarea } from 'nekkora-lib';
import { CHANNELS, hasAnyChannel, whatsappDisplay, whatsappUrl } from '../config';
import { CONTACT_COPY } from '../content';
import { useRequestTrigger } from '../request';

type Field = 'name' | 'email' | 'message';
type Errors = Partial<Record<Field, string>>;
/** Etapas da jornada (§5.2): informar a necessidade → confirmar a mensagem → WhatsApp solicitado ao navegador. */
type Step = 'form' | 'review' | 'requested';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 1000;
const FORM_ID = 'form-solicitacao';

/** Mensagem estruturada enviada ao WhatsApp — exatamente o texto exibido na etapa de confirmação. */
export function buildMessage({ name, company, email, message }: { name: string; company: string; email: string; message: string }) {
  return [
    `Olá! Sou ${name.trim()}${company.trim() ? `, da ${company.trim()}` : ''}.`,
    'Quero solicitar uma avaliação de automação.',
    message.trim(),
    ...(email.trim() ? [`E-mail para retorno: ${email.trim()}`] : []),
  ].join('\n\n');
}

/**
 * Diálogo "Solicitar avaliação" (modelo C, etapa 2; jornada da COM-RELEASE-002). Sem back-end: nada é enviado nem
 * armazenado pela página.
 *
 * Com WhatsApp confirmado em publicacao.json: o formulário valida, a etapa de confirmação mostra a mensagem exata e o que
 * será transferido ao WhatsApp, e só então o visitante abre a conversa por um link comum (target=_blank,
 * rel=noopener noreferrer) — um clique em link não é barrado por bloqueador de pop-up, e o navegador não informa se a
 * aba abriu, por isso a página nunca afirma abertura nem envio (D-18). Alternativas manuais sempre visíveis: copiar a
 * mensagem e o número para digitar. Sem canal confirmado, o formulário funciona em modo de demonstração (K-05).
 */
export function RequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<Step>('form');
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const directWhatsapp = whatsappUrl();
  const canSend = directWhatsapp != null;
  const text = buildMessage({ name, company, email, message });
  const link = whatsappUrl(text);

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Informe como podemos chamar você.';
    if (email.trim() && !EMAIL_RE.test(email.trim())) e.email = 'Confira o e-mail, como nome@empresa.com — ou deixe em branco.';
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
    setCopy('idle');
    setStep('review');
  };

  // A cada troca de etapa, o foco vai para o início do novo conteúdo.
  useEffect(() => {
    if (step !== 'form') stepRef.current?.focus();
  }, [step]);

  const edit = () => {
    setStep('form');
    setCopy('idle');
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
  };

  const manual = (
    <div className="request__manual">
      <Button variant="secondary" size="sm" leftIcon="copy" onClick={copyMessage}>
        {CONTACT_COPY.review.copy}
      </Button>
      <span role="status" className="contact__note" data-testid="status-copia">
        {copy === 'copied' ? CONTACT_COPY.review.copied : copy === 'failed' ? CONTACT_COPY.review.copyFailed : ''}
      </span>
      {CHANNELS.whatsapp && (
        <p className="contact__note">
          {CONTACT_COPY.review.manual} <strong className="request__number">{whatsappDisplay()}</strong>.
        </p>
      )}
      {CHANNELS.email && (
        <p className="contact__note">
          {CONTACT_COPY.review.email} <Link href={`mailto:${CHANNELS.email}`}>{CHANNELS.email}</Link>.
        </p>
      )}
    </div>
  );

  const summary = (
    <DescriptionList
      items={[
        { term: 'Nome', description: name.trim() },
        { term: 'Empresa', description: company.trim() || null },
        { term: 'E-mail', description: email.trim() || null },
        { term: 'Processo', description: message.trim() },
      ]}
    />
  );

  let body;
  let footer;
  if (step === 'form') {
    footer = (
      <>
        <div className="request__actions">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} rightIcon={canSend ? 'arrow-right' : 'check'}>
            {canSend ? CONTACT_COPY.whatsappSubmit : CONTACT_COPY.demoSubmit}
          </Button>
        </div>
        <span className="contact__note request__note">
          {canSend ? CONTACT_COPY.whatsappNote : CONTACT_COPY.demoNote} <Link href="#privacidade" onClick={onClose}>{CONTACT_COPY.privacyLink}</Link>
        </span>
      </>
    );
    body = (
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
            <Input label="Empresa" placeholder="Nome da empresa" leftIcon="building" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} hint="Opcional" fullWidth />
          </div>
          <Input
            label="E-mail"
            type="email"
            placeholder="nome@empresa.com"
            leftIcon="mail"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint={CONTACT_COPY.emailHint}
            fullWidth
          />
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
    );
  } else if (!canSend) {
    // Modo de demonstração: validado, nada enviado.
    footer = (
      <div className="request__actions">
        <Button variant="ghost" leftIcon="edit" onClick={edit}>
          Editar solicitação
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done">
        <Alert tone="info" title={CONTACT_COPY.demoResult.title} live="polite">
          {CONTACT_COPY.demoResult.text}
        </Alert>
        {summary}
      </div>
    );
  } else if (step === 'review') {
    footer = (
      <div className="request__actions">
        <Button variant="ghost" leftIcon="edit" onClick={edit}>
          {CONTACT_COPY.review.back}
        </Button>
        {/* Link comum: aberto pelo próprio clique do visitante (não é pop-up), sem opener e sem Referer. */}
        <Button leftIcon="whatsapp" href={link!} target="_blank" rel="noopener noreferrer" onClick={() => setStep('requested')}>
          {CONTACT_COPY.review.open}
        </Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done" aria-labelledby="request-review-title">
        <h3 id="request-review-title" className="request__step-title">
          {CONTACT_COPY.review.title}
        </h3>
        <p className="contact__note">{CONTACT_COPY.review.intro}</p>
        <pre className="request__message" data-testid="mensagem-whatsapp">
          {text}
        </pre>
        <Alert tone="info" title="Antes de continuar">
          {CONTACT_COPY.review.transfer}
        </Alert>
        {manual}
      </div>
    );
  } else {
    footer = (
      <div className="request__actions">
        <Button variant="ghost" leftIcon="edit" onClick={edit}>
          Editar solicitação
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done">
        <Alert tone="info" title={CONTACT_COPY.whatsappRequested.title} live="polite">
          {CONTACT_COPY.whatsappRequested.text}
        </Alert>
        <Button leftIcon="whatsapp" href={link!} target="_blank" rel="noopener noreferrer">
          {CONTACT_COPY.whatsappManual}
        </Button>
        {manual}
        {summary}
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={CONTACT_COPY.dialogTitle} description={CONTACT_COPY.dialogDescription} footer={footer} size="md" className="request">
      {body}
    </Dialog>
  );
}

/** Canais confirmados e válidos (publicacao.json) — contato direto, sem preencher nada no site. */
function Channels() {
  const wa = whatsappUrl();
  return (
    <div className="contact__direct">
      <span className="contact__caption">{CONTACT_COPY.directTitle}</span>
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
        {CHANNELS.linkedin && (
          <Link href={CHANNELS.linkedin} variant="default" leftIcon="linkedin" external>
            LinkedIn
          </Link>
        )}
        {CHANNELS.instagram && (
          <Link href={CHANNELS.instagram} variant="default" leftIcon="instagram" external>
            Instagram
          </Link>
        )}
      </div>
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
