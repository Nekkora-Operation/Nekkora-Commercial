import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, DescriptionList, Input, Link, RadioGroup, SectionHeader, Text, Textarea } from 'nekkora-lib';
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
      window.open(whatsappUrl(text)!, '_blank', 'noopener,noreferrer');
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
        {canSend ? (
          <Alert tone="success" title="Abrimos o WhatsApp com a sua mensagem." live="polite">
            É só confirmar o envio por lá.
          </Alert>
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
        <Button variant="secondary" leftIcon="edit" onClick={() => setReviewed(false)}>
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
        <Button size="lg" leftIcon="whatsapp" href={wa} style={{ alignSelf: 'flex-start' }}>
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

export function Contact() {
  return (
    <section id="contato" className="section" aria-labelledby="contato-title">
      <div className="wrap">
        <div className="contact" data-contact-status={hasAnyChannel ? 'configurado' : 'pendente'}>
          <div className="contact__aside">
            <SectionHeader titleId="contato-title" eyebrow={CONTACT_COPY.eyebrow} title={CONTACT_COPY.title} description={CONTACT_COPY.description} />
            {hasAnyChannel ? (
              <Channels />
            ) : (
              <Alert tone="warning" title={CONTACT_COPY.pending.title} live="off">
                {CONTACT_COPY.pending.text}
              </Alert>
            )}
            <div className="contact__next">
              <Text variant="h4" as="h3">
                {CONTACT_COPY.next.title}
              </Text>
              <ol>
                {CONTACT_COPY.next.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
