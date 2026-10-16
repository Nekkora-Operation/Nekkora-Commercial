import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, DescriptionList, Input, Link, Logo, RadioGroup, Text, Textarea } from 'nekkora-lib';
import { CHANNELS, hasAnyChannel, whatsappUrl } from '../config';
import { CONTACT_COPY } from '../content';

type Field = 'name' | 'email' | 'interest' | 'message';
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 1000;

/**
 * Formulário sem back-end (fora do escopo). Com WhatsApp confirmado em config.ts, abre o WhatsApp com a mensagem
 * montada; sem canal confirmado, funciona em modo de demonstração — valida e mostra o resumo, sem enviar nada (K-05).
 */
function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [interest, setInterest] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [reviewed, setReviewed] = useState(false);
  /** Link do WhatsApp com a mensagem montada — exibido sempre como alternativa manual. */
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const canSend = whatsappUrl() != null;
  const interestLabel = CONTACT_COPY.interests.find((i) => i.value === interest)?.label;

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Informe como podemos chamar você.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Informe um e-mail válido, como nome@empresa.com.';
    if (!interest) e.interest = 'Escolha o que você quer avaliar.';
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
        `Quero avaliar: ${interestLabel}.`,
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

  // Ao trocar o formulário pelo resumo, leva foco e rolagem ao resultado (sem ficar sob a barra fixa).
  useEffect(() => {
    if (reviewed) doneRef.current?.focus();
  }, [reviewed]);

  if (reviewed) {
    return (
      <div ref={doneRef} tabIndex={-1} className="contact__form contact__done">
        {whatsapp ? (
          <>
            <Alert tone="info" title={CONTACT_COPY.whatsappRequested.title} live="polite">
              {CONTACT_COPY.whatsappRequested.text}
            </Alert>
            <Button leftIcon="whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
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
            { term: 'Telefone', description: phone || null },
            { term: 'Empresa', description: company.trim() || null },
            { term: 'Quero avaliar', description: interestLabel },
            { term: 'Processo', description: message.trim() },
          ]}
        />
        <Button
          variant="secondary"
          leftIcon="edit"
          onClick={() => {
            setReviewed(false);
            setWhatsapp(null);
          }}
        >
          Editar solicitação
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="contact__form" onSubmit={submit} noValidate aria-labelledby="form-title">
      <Text id="form-title" variant="h4" as="h3">
        {CONTACT_COPY.formTitle}
      </Text>
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
        <Input label="Telefone" mask="phone" placeholder="(00) 00000-0000" leftIcon="phone" autoComplete="tel" value={phone} onValueChange={(masked) => setPhone(masked)} hint="Opcional" fullWidth />
        <Input label="Empresa" placeholder="Nome da empresa" leftIcon="building" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} hint="Opcional" fullWidth />
      </div>
      <RadioGroup legend="O que você quer avaliar?" required options={CONTACT_COPY.interests} value={interest} onChange={setInterest} error={errors.interest} />
      <Textarea
        label="Descreva o processo"
        required
        placeholder="Ex.: conferimos todo dia os pagamentos do banco com o sistema financeiro, manualmente."
        rows={5}
        maxLength={MAX_MESSAGE}
        hint={CONTACT_COPY.processHint}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={errors.message}
        fullWidth
      />
      <Button type="submit" size="lg" rightIcon={canSend ? 'send' : 'check'} fullWidth>
        {canSend ? CONTACT_COPY.whatsappSubmit : CONTACT_COPY.demoSubmit}
      </Button>
      <span className="contact__note">{canSend ? CONTACT_COPY.whatsappNote : CONTACT_COPY.demoNote}</span>
    </form>
  );
}

/** Lista apenas os canais confirmados e válidos (config.ts). */
function Channels() {
  const wa = whatsappUrl();
  return (
    <div className="contact__channels">
      {wa && (
        <Button size="lg" pill variant="secondary" leftIcon="whatsapp" href={wa}>
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

/**
 * Chamada em pôster centralizado (modelo C). O botão leva ao formulário logo abaixo — o mockup tinha href="#", sem
 * destino (D-20). Sem canais confirmados, a legenda avisa que o formulário está em demonstração.
 */
export function Contact() {
  return (
    <section id="contato" className="section section--band" aria-labelledby="contato-title">
      <div className="wrap contact" data-contact-status={hasAnyChannel ? 'configurado' : 'pendente'}>
        <div className="contact__poster">
          <Logo variant="symbol" size={44} aria-hidden="true" />
          <h2 id="contato-title" className="contact__title">
            {CONTACT_COPY.title}
          </h2>
          <p className="contact__lead">{CONTACT_COPY.description}</p>
          <Button size="lg" pill rightIcon="arrow-right" href="#solicitacao">
            {CONTACT_COPY.cta}
          </Button>
          {hasAnyChannel ? <Channels /> : <span className="contact__caption">{CONTACT_COPY.pendingCaption}</span>}
        </div>
        <div id="solicitacao" className="contact__form-wrap">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
