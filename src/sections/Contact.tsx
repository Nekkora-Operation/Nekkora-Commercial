import { useState, type FormEvent } from 'react';
import { Badge, Button, Icon, Input, Link, SectionHeader, SelectMenu, Text, Textarea } from 'nekkora-lib';
import { CONTACT, whatsappUrl } from '../config';

const INTERESTS = [
  { value: 'studio', label: 'Studio', icon: 'studio' as const, description: 'Estruturar e documentar automações' },
  { value: 'hospedagem', label: 'Hospedagem', icon: 'server' as const, description: 'Rodar automações em ambiente operado' },
  { value: 'monitoramento', label: 'Monitoramento', icon: 'pulse' as const, description: 'Acompanhar execuções e falhas' },
  { value: 'suporte', label: 'Suporte operacional', icon: 'headset' as const, description: 'Sustentação e evolução' },
  { value: 'completo', label: 'Ecossistema completo', icon: 'layers' as const, description: 'Do Studio ao suporte' },
];

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Formulário sem back-end (fora do escopo desta fase): ao enviar, abre o WhatsApp
 * com a mensagem já montada a partir dos campos.
 */
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [interest, setInterest] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Conte pra gente como podemos te chamar.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Informe um e-mail válido, como nome@empresa.com.';
    if (message.trim().length < 10) e.message = 'Descreva em poucas palavras o que você precisa (mínimo de 10 caracteres).';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const interestLabel = INTERESTS.find((i) => i.value === interest)?.label;
    const text = [
      `Olá! Sou ${name.trim()}${company.trim() ? `, da ${company.trim()}` : ''}.`,
      interestLabel ? `Tenho interesse em: ${interestLabel}.` : null,
      message.trim(),
      `Contato: ${email.trim()}${phone ? ` · ${phone}` : ''}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="contact__form contact__done" role="status">
        <Badge tone="success" variant="solid" icon="check">
          Mensagem pronta
        </Badge>
        <Text variant="h3" as="h3">
          Abrimos o WhatsApp com a sua mensagem.
        </Text>
        <Text color="secondary">
          É só confirmar o envio por lá. Se a janela não abriu, use o botão abaixo ou escreva para{' '}
          <Link href={`mailto:${CONTACT.email}`}>{CONTACT.email}</Link>.
        </Text>
        <div className="hero__ctas">
          <Button leftIcon="whatsapp" href={whatsappUrl()}>
            Abrir WhatsApp
          </Button>
          <Button variant="ghost" onClick={() => setSent(false)}>
            Editar mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="contact__form" onSubmit={submit} noValidate aria-labelledby="form-title">
      <Text id="form-title" variant="h4" as="h3">
        Conte o que você precisa
      </Text>
      <div className="contact__form-grid">
        <Input
          label="Nome"
          required
          placeholder="Seu nome"
          leftIcon="user"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          fullWidth
        />
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
          success={!errors.email && EMAIL_RE.test(email.trim()) ? true : undefined}
          fullWidth
        />
        <Input
          label="Telefone / WhatsApp"
          mask="phone"
          placeholder="(00) 00000-0000"
          leftIcon="phone"
          autoComplete="tel"
          value={phone}
          onValueChange={(masked) => setPhone(masked)}
          fullWidth
        />
        <Input
          label="Empresa"
          placeholder="Opcional"
          leftIcon="building"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          fullWidth
        />
      </div>
      <SelectMenu
        label="Interesse principal"
        placeholder="Selecione (opcional)"
        optionIcon="box"
        options={INTERESTS}
        value={interest}
        onChange={(v) => setInterest(v)}
        clearable
        fullWidth
      />
      <Textarea
        label="Mensagem"
        required
        placeholder="Ex.: temos um processo de conciliação manual e queremos automatizar e acompanhar."
        rows={4}
        maxLength={600}
        showCount
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={errors.message}
        fullWidth
      />
      <Button type="submit" size="lg" rightIcon="send" fullWidth>
        Enviar pelo WhatsApp
      </Button>
      <span className="contact__note">
        Ao enviar, abrimos o WhatsApp com a sua mensagem pronta. Nada é armazenado nesta página.
      </span>
    </form>
  );
}

export function Contact() {
  return (
    <section id="contato" className="section" aria-labelledby="contato-title">
      <div className="wrap">
        <div className="contact">
          <div className="contact__aside">
            <SectionHeader
              titleId="contato-title"
              eyebrow="Contato"
              title="Vamos conversar sobre a sua operação?"
              description="Conte o que você quer automatizar ou o que já roda hoje. Respondemos com um caminho claro, do Studio ao suporte."
            />
            <div className="contact__channels">
              <Button size="lg" leftIcon="whatsapp" href={whatsappUrl()} style={{ alignSelf: 'flex-start' }}>
                Falar no WhatsApp
              </Button>
              <Link href={`mailto:${CONTACT.email}`} variant="default" leftIcon="mail">
                {CONTACT.email}
              </Link>
            </div>
            <div className="contact__socials" aria-label="Redes sociais">
              <Button variant="secondary" leftIcon="instagram" href={CONTACT.instagram}>
                Instagram
              </Button>
              <Button variant="secondary" leftIcon="linkedin" href={CONTACT.linkedin}>
                LinkedIn
              </Button>
            </div>
            <Text variant="caption" color="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size="xs" />
              Atendimento em horário comercial
            </Text>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
