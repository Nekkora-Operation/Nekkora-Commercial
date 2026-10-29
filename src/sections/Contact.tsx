import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Checkbox, DescriptionList, Dialog, Divider, Input, Link, Logo, RadioGroup, Textarea } from 'nekkora-lib';
import { ScheduleButton, ScheduleLink } from '../agendamento';
import { BOOKINGS_URL, CHANNELS, LEAD_API, REQUEST_CHANNEL, hasAnyChannel, mailtoUrl, whatsappDisplay, whatsappUrl } from '../config';
import { CONTACT_COPY, SCHEDULE } from '../content';
import { Challenge } from '../desafio';
import { newRequestId, sendLeadRequest, type LeadFailure } from '../envio';
import { useRequestTrigger, type Demand, type RequestOptions } from '../request';

type Field = 'name' | 'email' | 'message';
type Errors = Partial<Record<Field, string>>;
/**
 * Etapas da jornada (§5.2; COM-RELEASE-005 §5.7):
 *   form → review → requested            WhatsApp ou e-mail: link aberto pelo navegador (a página não sabe se abriu);
 *   form → review → sending → received   envio automático, confirmado pelo backend;
 *                          ↘ failed       falha: dados preservados, nova tentativa (mesmo id) e alternativa por e-mail.
 */
type Step = 'form' | 'review' | 'requested' | 'sending' | 'received' | 'failed';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE = 1000;
const FORM_ID = 'form-solicitacao';

const DEMANDS = CONTACT_COPY.demand.options;
const demandOf = (d: Demand) => DEMANDS.find((o) => o.value === d) ?? DEMANDS[0];

/** Resumo da simulação na mensagem, só quando o visitante o incluiu (NEKKORA-CALC-001 §3.8). */
const simulationBlock = (simulation: string | null | undefined) => (simulation ? [`${CONTACT_COPY.simulation.heading}\n${simulation}`] : []);

/**
 * Mensagem estruturada enviada ao WhatsApp ou ao e-mail — exatamente o texto exibido na etapa de confirmação. A segunda
 * linha diz o tipo de solicitação (AUD-25); para uma automação nova, é a mesma frase de sempre.
 */
export function buildMessage({
  name,
  company,
  email,
  message,
  demand = 'automacao',
  simulation = null,
}: {
  name: string;
  company: string;
  email: string;
  message: string;
  demand?: Demand;
  simulation?: string | null;
}) {
  return [
    `Olá! Sou ${name.trim()}${company.trim() ? `, da ${company.trim()}` : ''}.`,
    demandOf(demand).line,
    message.trim(),
    ...simulationBlock(simulation),
    ...(email.trim() ? [`E-mail para retorno: ${email.trim()}`] : []),
  ].join('\n\n');
}

/**
 * Descrição enviada ao backend (envio automático): o contrato da API não tem campo de tipo nem de simulação, então
 * ambos entram no texto — o tipo só quando não é automação nova. Limite do contrato: 1.000 caracteres no total.
 */
export const apiDescription = (message: string, demand: Demand, simulation: string | null) =>
  [...(demand === 'automacao' ? [] : [demandOf(demand).line]), message.trim(), ...simulationBlock(simulation)].join('\n\n');

/**
 * Diálogo "Solicitar avaliação" (modelo C, etapa 2; jornada da COM-RELEASE-002; envio automático da COM-RELEASE-005).
 *
 * Um único mecanismo de envio por vez, pela precedência de REQUEST_CHANNEL (config.ts):
 *
 * - 'api' (endpoint do backend em publicacao.json): o formulário valida (e-mail obrigatório: é o canal de resposta),
 *   a confirmação mostra os dados e o que acontece com eles, e "Enviar solicitação" faz um POST ao backend. A página
 *   só diz "Solicitação recebida" com a confirmação do servidor para o mesmo idSolicitacao; em qualquer falha, os
 *   dados continuam no formulário, "Tentar novamente" reenvia com o MESMO id (o servidor não gera dois e-mails) e o
 *   e-mail comercial aparece como alternativa de contato — não como segundo envio automático.
 *
 * - 'whatsapp' / 'email': a mensagem confirmada é aberta por um link comum (WhatsApp em outra aba, sem opener nem
 *   Referer; mailto no aplicativo de e-mail). O navegador não informa se abriu, então a página nunca afirma abertura
 *   nem envio (D-18). Alternativas manuais sempre visíveis: copiar a mensagem, o número e o endereço.
 *
 * - null: modo de demonstração (K-05) — valida, mas não envia nada.
 */
export function RequestDialog({ open, options = {}, onClose }: { open: boolean; options?: RequestOptions; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [demand, setDemand] = useState<Demand>('automacao');
  // Resumo vindo do simulador e a escolha do visitante de incluí-lo (desmarcada por padrão: é opcional)
  const [simulation, setSimulation] = useState<string | null>(null);
  const [includeSimulation, setIncludeSimulation] = useState(false);
  const [trap, setTrap] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<Step>('form');
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  // Envio automático
  const [failure, setFailure] = useState<LeadFailure | null>(null);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [challengeDown, setChallengeDown] = useState(false);
  const [challengeReset, setChallengeReset] = useState(0);
  const openedAt = useRef(0);
  /** Id do pedido e o texto para o qual foi gerado: o mesmo texto reenviado usa o mesmo id (idempotência). */
  const request = useRef<{ id: string; text: string } | null>(null);

  const channel = REQUEST_CHANNEL;
  const viaApi = channel === 'api';
  const canSend = channel != null;
  const viaEmail = channel === 'email';
  const flow = viaEmail ? CONTACT_COPY.email : CONTACT_COPY.whatsapp;
  const direct = viaApi ? null : viaEmail ? mailtoUrl() : whatsappUrl();
  const attached = includeSimulation ? simulation : null;
  const text = buildMessage({ name, company, email, message, demand, simulation: attached });
  const link = viaEmail ? mailtoUrl(text) : whatsappUrl(text);
  // WhatsApp abre em outra aba, sem opener nem Referer; o mailto entrega ao aplicativo de e-mail, sem aba nova.
  const linkProps = viaEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' };
  const icon = viaEmail ? 'mail' : 'whatsapp';
  const needsChallenge = viaApi && LEAD_API?.turnstileSiteKey != null;

  useEffect(() => {
    if (open && step === 'form' && openedAt.current === 0) openedAt.current = Date.now();
  }, [open, step]);

  // Ao abrir no formulário: o tipo pedido pelo CTA (o Hosting abre com a hospedagem; sem tipo, mantém a escolha
  // anterior) e o resumo do simulador, se veio de lá — sempre desmarcado: incluí-lo é escolha do visitante. Numa etapa
  // posterior (mensagem já revisada), nada muda.
  const { demand: requestedDemand, simulation: offeredSimulation = null } = options;
  const stepNow = useRef(step);
  stepNow.current = step;
  useEffect(() => {
    if (!open || stepNow.current !== 'form') return;
    if (requestedDemand) setDemand(requestedDemand);
    setSimulation(offeredSimulation);
    setIncludeSimulation(false);
  }, [open, requestedDemand, offeredSimulation]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Informe como podemos chamar você.';
    if (viaApi && !EMAIL_RE.test(email.trim())) e.email = CONTACT_COPY.api.emailRequired;
    else if (email.trim() && !EMAIL_RE.test(email.trim())) e.email = 'Confira o e-mail, como nome@empresa.com — ou deixe em branco.';
    if (message.trim().length < 20) e.message = 'Descreva o processo ou a necessidade com pelo menos 20 caracteres.';
    else if (viaApi && apiDescription(message, demand, attached).length > MAX_MESSAGE)
      e.message = 'Com o tipo de solicitação e o resumo da simulação, a mensagem passa de 1.000 caracteres. Encurte a descrição ou desmarque o resumo.';
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
    if (request.current?.text !== text) request.current = { id: newRequestId(), text };
    setCopy('idle');
    setFailure(null);
    setStep('review');
  };

  // A cada troca de etapa, o foco vai para o início do novo conteúdo (no envio, fica no botão em andamento).
  useEffect(() => {
    if (step !== 'form' && step !== 'sending') stepRef.current?.focus();
  }, [step]);

  const edit = () => {
    setStep('form');
    setCopy('idle');
  };

  const reset = () => {
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
    setDemand('automacao');
    setSimulation(null);
    setIncludeSimulation(false);
    setTrap('');
    setErrors({});
    setStep('form');
    setFailure(null);
    setProtocolo(null);
    setToken(null);
    request.current = null;
    openedAt.current = 0;
  };

  const close = () => {
    onClose();
    // Depois de recebida, o próximo atendimento começa com o formulário vazio.
    if (step === 'received') reset();
  };

  const send = async () => {
    if (!LEAD_API || !request.current || step === 'sending') return;
    setStep('sending');
    const result = await sendLeadRequest(LEAD_API.endpoint, {
      idSolicitacao: request.current.id,
      nome: name.trim(),
      email: email.trim(),
      empresa: company.trim(),
      descricao: apiDescription(message, demand, attached),
      desafio: token ?? '',
      preenchimentoMs: Math.max(0, Date.now() - openedAt.current),
      site: trap,
    });
    if (result.ok) {
      setProtocolo(result.protocolo);
      setStep('received');
      return;
    }
    // O token do desafio vale uma vez: depois de uma recusa do desafio, é preciso refazê-lo.
    // O token usado é descartado na hora: "Tentar novamente" só volta a valer com um token novo.
    if (result.motivo === 'desafio') {
      setToken(null);
      setChallengeReset((n) => n + 1);
    }
    setFailure(result.motivo);
    setStep('failed');
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
  };

  const copyStatus = (
    <span role="status" className="contact__note" data-testid="status-copia">
      {copy === 'copied' ? CONTACT_COPY.review.copied : copy === 'failed' ? CONTACT_COPY.review.copyFailed : ''}
    </span>
  );

  const manual = (
    <div className="request__manual">
      <Button variant="secondary" size="sm" leftIcon="copy" onClick={copyMessage}>
        {CONTACT_COPY.review.copy}
      </Button>
      {copyStatus}
      {CHANNELS.whatsapp && (
        <p className="contact__note">
          {CONTACT_COPY.review.manual} <strong className="request__number">{whatsappDisplay()}</strong>.
        </p>
      )}
      {CHANNELS.email && (
        <p className="contact__note">
          {viaEmail ? CONTACT_COPY.email.manual : CONTACT_COPY.review.email} <Link href={`mailto:${CHANNELS.email}`}>{CHANNELS.email}</Link>.
        </p>
      )}
    </div>
  );

  const summary = (
    <DescriptionList
      items={[
        { term: 'Solicitação', description: demandOf(demand).label },
        { term: 'Nome', description: name.trim() },
        { term: 'Empresa', description: company.trim() || null },
        { term: 'E-mail', description: email.trim() || null },
        { term: 'Processo ou necessidade', description: message.trim() },
        { term: 'Simulação', description: attached },
      ]}
    />
  );

  const challenge = needsChallenge && (
    <div className="request__challenge-box">
      <p className="contact__note">{CONTACT_COPY.api.challenge}</p>
      <Challenge siteKey={LEAD_API!.turnstileSiteKey!} resetKey={challengeReset} onToken={setToken} onUnavailable={() => setChallengeDown(true)} />
      <span role="status" className="contact__note" data-testid="status-desafio">
        {challengeDown && !token ? CONTACT_COPY.api.challengeUnavailable : !token ? CONTACT_COPY.api.challengeWaiting : ''}
      </span>
    </div>
  );

  /** Alternativa de contato na falha do envio automático: a mesma mensagem, pelo e-mail do visitante. */
  const apiAlternative = CHANNELS.email && (
    <div className="request__manual">
      <p className="contact__note">
        {CONTACT_COPY.api.alternative} <Link href={`mailto:${CHANNELS.email}`}>{CHANNELS.email}</Link>.
      </p>
      <div className="request__actions request__actions--start">
        <Button variant="secondary" size="sm" leftIcon="mail" href={mailtoUrl(text)!}>
          {CONTACT_COPY.api.openEmail}
        </Button>
        <Button variant="secondary" size="sm" leftIcon="copy" onClick={copyMessage}>
          {CONTACT_COPY.review.copy}
        </Button>
      </div>
      {copyStatus}
    </div>
  );

  let body;
  let footer;
  if (step === 'form') {
    footer = (
      <>
        <div className="request__actions">
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} rightIcon={canSend ? 'arrow-right' : 'check'}>
            {canSend ? CONTACT_COPY.reviewSubmit : CONTACT_COPY.demoSubmit}
          </Button>
        </div>
        <span className="contact__note request__note">
          {viaApi ? CONTACT_COPY.api.note : canSend ? flow.note : CONTACT_COPY.demoNote}{' '}
          <Link href="#privacidade" onClick={close}>
            {CONTACT_COPY.privacyLink}
          </Link>
        </span>
      </>
    );
    body = (
      <div className="request__body">
        {direct ? (
          <>
            <Button variant="secondary" leftIcon={icon} href={direct} {...linkProps} fullWidth>
              {flow.direct}
            </Button>
            <Divider label={CONTACT_COPY.orForm} />
          </>
        ) : (
          !viaApi && <p className="request__pending">{CONTACT_COPY.pendingCaption}</p>
        )}
        <ScheduleLink />
        <form id={FORM_ID} ref={formRef} className="request__form" onSubmit={submit} noValidate aria-label={CONTACT_COPY.formTitle}>
          <RadioGroup
            legend={CONTACT_COPY.demand.legend}
            name="tipo-solicitacao"
            value={demand}
            onChange={(v) => setDemand(v as Demand)}
            options={DEMANDS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <div className="contact__form-grid">
            <Input label="Nome" required placeholder="Seu nome" leftIcon="user" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} fullWidth />
            <Input label="Empresa" placeholder="Nome da empresa" leftIcon="building" autoComplete="organization" maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} hint="Opcional" fullWidth />
          </div>
          <Input
            label="E-mail"
            type="email"
            required={viaApi}
            placeholder="nome@empresa.com"
            leftIcon="mail"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint={viaApi ? CONTACT_COPY.api.emailHint : CONTACT_COPY.emailHint}
            fullWidth
          />
          <Textarea
            label={CONTACT_COPY.messageLabel}
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
          {simulation && (
            <div className="request__simulation" data-testid="resumo-simulacao">
              <Checkbox label={CONTACT_COPY.simulation.include} hint={CONTACT_COPY.simulation.hint} checked={includeSimulation} onChange={(e) => setIncludeSimulation(e.target.checked)} />
              <pre className="request__message">{simulation}</pre>
            </div>
          )}
          {viaApi && (
            // Armadilha para robôs (§5.5): fora da tela, fora da ordem de foco e escondida de leitores de tela.
            <div className="request__trap" aria-hidden="true">
              <label>
                Não preencha este campo
                <input type="text" name="site" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </label>
            </div>
          )}
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
        <Button onClick={close}>Fechar</Button>
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
  } else if (viaApi && (step === 'review' || step === 'sending')) {
    const sending = step === 'sending';
    footer = (
      <div className="request__actions">
        <Button key="voltar" variant="ghost" leftIcon="edit" onClick={edit} disabled={sending}>
          {CONTACT_COPY.review.back}
        </Button>
        <Button key="enviar" leftIcon="send" onClick={send} loading={sending} disabled={needsChallenge && !token}>
          {sending ? CONTACT_COPY.api.sending : CONTACT_COPY.api.send}
        </Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done" aria-labelledby="request-review-title" aria-busy={sending || undefined}>
        <h3 id="request-review-title" className="request__step-title">
          {CONTACT_COPY.review.title}
        </h3>
        <p className="contact__note">{CONTACT_COPY.api.intro}</p>
        {summary}
        <Alert tone="info" title="Antes de enviar">
          {CONTACT_COPY.api.transfer}
        </Alert>
        {challenge}
        {challengeDown && !token && apiAlternative}
        <span role="status" className="nk-visually-hidden" data-testid="status-envio">
          {sending ? CONTACT_COPY.api.sendingStatus : ''}
        </span>
      </div>
    );
  } else if (viaApi && step === 'received') {
    // key: elementos próprios por etapa — o React não reaproveita o botão "Voltar" (desabilitado no envio) como
    // "Fechar", o que deixava a transição de cor da lib no meio do caminho (contraste medido abaixo do AA no WebKit).
    footer = (
      <div className="request__actions">
        <Button key="fechar" onClick={close}>
          Fechar
        </Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done" data-testid="solicitacao-recebida">
        <Alert tone="success" title={CONTACT_COPY.api.received.title} live="polite">
          {CONTACT_COPY.api.received.text(protocolo!)}
        </Alert>
        {summary}
      </div>
    );
  } else if (viaApi && step === 'failed') {
    footer = (
      <div className="request__actions">
        <Button key="voltar" variant="ghost" leftIcon="edit" onClick={edit}>
          {CONTACT_COPY.review.back}
        </Button>
        {failure !== 'recusada' && (
          <Button key="tentar" leftIcon="refresh" onClick={send} disabled={needsChallenge && !token}>
            {CONTACT_COPY.api.retry}
          </Button>
        )}
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done" data-testid="solicitacao-falhou">
        <Alert tone="danger" title={CONTACT_COPY.api.failed.title}>
          {CONTACT_COPY.api.failed[failure ?? 'indisponivel']}
        </Alert>
        {failure === 'desafio' && challenge}
        {apiAlternative}
        {summary}
      </div>
    );
  } else if (step === 'review') {
    footer = (
      <div className="request__actions">
        <Button variant="ghost" leftIcon="edit" onClick={edit}>
          {CONTACT_COPY.review.back}
        </Button>
        {/* Link comum: aberto pelo próprio clique do visitante (não é pop-up); WhatsApp sem opener e sem Referer. */}
        <Button leftIcon={icon} href={link!} {...linkProps} onClick={() => setStep('requested')}>
          {flow.open}
        </Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done" aria-labelledby="request-review-title">
        <h3 id="request-review-title" className="request__step-title">
          {CONTACT_COPY.review.title}
        </h3>
        <p className="contact__note">{flow.intro}</p>
        <pre className="request__message" data-testid="mensagem-solicitacao">
          {text}
        </pre>
        <Alert tone="info" title="Antes de continuar">
          {flow.transfer}
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
        <Button onClick={close}>Fechar</Button>
      </div>
    );
    body = (
      <div ref={stepRef} tabIndex={-1} className="contact__done">
        <Alert tone="info" title={flow.requested.title} live="polite">
          {flow.requested.text}
        </Alert>
        <Button leftIcon={icon} href={link!} {...linkProps}>
          {flow.again}
        </Button>
        {manual}
        {summary}
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={close} title={CONTACT_COPY.dialogTitle} description={CONTACT_COPY.dialogDescription} footer={footer} size="md" className="request">
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

/**
 * Chamada em pôster centralizado (modelo C). Dois caminhos (COM-RELEASE-005 §4.4): "Solicitar avaliação" abre o
 * diálogo (D-23) e "Agendar conversa" abre o Microsoft Bookings — este só com a URL oficial confirmada.
 */
export function Contact() {
  const trigger = useRequestTrigger();
  return (
    <section id="contato" className="section section--band" aria-labelledby="contato-title">
      <div className="wrap contact" data-contact-status={hasAnyChannel ? 'configurado' : 'pendente'} data-agendamento={BOOKINGS_URL ? 'configurado' : 'pendente'}>
        <div className="contact__poster">
          <Logo variant="symbol" size={44} aria-hidden="true" />
          <h2 id="contato-title" className="contact__title">
            {CONTACT_COPY.title}
          </h2>
          <p className="contact__lead">{CONTACT_COPY.description}</p>
          <div className="contact__ctas">
            <Button size="lg" pill rightIcon="arrow-right" {...trigger}>
              {CONTACT_COPY.cta}
            </Button>
            <ScheduleButton />
          </div>
          {BOOKINGS_URL && <p className="contact__note contact__schedule-note">{SCHEDULE.note}</p>}
          {hasAnyChannel ? <Channels /> : <span className="contact__caption">{CONTACT_COPY.pendingCaption}</span>}
        </div>
      </div>
    </section>
  );
}
