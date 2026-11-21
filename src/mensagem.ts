/**
 * Mensagem do formulário de atendimento (NEKKORA-COM-ECOSYSTEM-001 §7): validação dos campos e montagem da mensagem
 * estruturada que vai para o WhatsApp. Funções puras, sem imports (carregadas direto pelo Node nos testes).
 *
 * - Nome e descrição obrigatórios; empresa e e-mail opcionais (e-mail, se informado, tem de ser válido).
 * - Campos vazios não entram na mensagem.
 * - O resumo da simulação só entra se o visitante escolher.
 */
export const FORM_LIMITS = { name: 100, company: 120, email: 254, description: 2000 } as const;

export type RequestFields = { name: string; company: string; email: string; description: string };
export type RequestErrors = Partial<Record<'name' | 'email' | 'description', true>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Remove caracteres de controle (exceto quebra de linha na descrição) e espaços nas pontas. */
const clean = (v: string, multiline = false) =>
  String(v ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(multiline ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ')
    .trim();

export function normalizeFields(f: Partial<RequestFields>): RequestFields {
  return {
    name: clean(f.name ?? '').slice(0, FORM_LIMITS.name),
    company: clean(f.company ?? '').slice(0, FORM_LIMITS.company),
    email: clean(f.email ?? '').slice(0, FORM_LIMITS.email),
    description: clean(f.description ?? '', true).slice(0, FORM_LIMITS.description),
  };
}

export function validateRequest(f: Partial<RequestFields>): RequestErrors {
  const n = normalizeFields(f);
  const errors: RequestErrors = {};
  if (!n.name) errors.name = true;
  if (n.email && !EMAIL_RE.test(n.email)) errors.email = true;
  if (!n.description) errors.description = true;
  return errors;
}

export type MessageLabels = { name: string; company: string; email: string; description: string; services: string; simulation: string };

/**
 * Mensagem estruturada, na ordem do exemplo do §7: saudação, identificação (só o que foi informado), descrição, serviços
 * de interesse (se houver) e simulação (se o visitante escolheu incluí-la).
 */
export function buildMessage(
  greeting: string,
  labels: MessageLabels,
  fields: Partial<RequestFields>,
  services: string[] = [],
  simulation: string | null = null,
): string {
  const f = normalizeFields(fields);
  const blocks = [greeting];
  const id = [
    f.name && `${labels.name}: ${f.name}`,
    f.company && `${labels.company}: ${f.company}`,
    f.email && `${labels.email}: ${f.email}`,
  ].filter(Boolean);
  if (id.length) blocks.push(id.join('\n'));
  if (f.description) blocks.push(`${labels.description}:\n${f.description}`);
  if (services.length) blocks.push(`${labels.services}:\n${services.map((s) => `- ${s}`).join('\n')}`);
  const sim = simulation?.trim();
  if (sim) blocks.push(`${labels.simulation}:\n${sim}`);
  return blocks.join('\n\n');
}
