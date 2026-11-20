import { useId, useState, type KeyboardEvent } from 'react';
import { Button, Card, Icon, Input, StatusRegion } from 'nekkora-lib';
import type { ServiceId } from '../config';
import { SIMULATOR as S } from '../content';
import { PRICE_TABLE, SIM_FIELDS, SIM_LIMITS, brl, sanitizeQuantity, simulate, type SimField, type Simulation } from '../precos';
import { RequestButton } from '../atendimento';

/**
 * Resumo em texto da simulação: anunciado ao leitor de tela e oferecido ao formulário de atendimento, onde o visitante
 * escolhe se ele entra na mensagem do WhatsApp. Só as linhas com quantidade; valores de src/precos.ts.
 */
export function simulationSummary(sim: Simulation): string {
  const q = sim.quantities;
  const lines: string[] = [];
  if (q.ai > 0) lines.push(`- Nekkora AI (piloto): ${S.count('ai', q.ai)} × ${brl(PRICE_TABLE.ai.porAutomacao)} = ${S.aiValue(sim.labels.ai)}`);
  if (q.monitor > 0) lines.push(`- Nekkora Monitor: ${S.count('monitor', q.monitor)} × ${brl(PRICE_TABLE.monitor.porAutomacaoMes)} = ${S.monitorValue(sim.labels.monitor)}`);
  if (q.windows > 0) lines.push(`- Nekkora Hosting Windows: ${S.count('windows', q.windows)} × ${brl(PRICE_TABLE.hosting.windowsPorHora)} = ${sim.labels.windows}`);
  if (q.linux > 0) lines.push(`- Nekkora Hosting Linux: ${S.count('linux', q.linux)} × ${brl(PRICE_TABLE.hosting.linuxPorHora)} = ${sim.labels.linux}`);
  lines.push(`${S.combined}: ${sim.labels.combined} (${S.combinedNote})`);
  return lines.join('\n');
}

/** Serviços com quantidade na simulação — já marcados no formulário de atendimento. */
const servicesOf = (sim: Simulation): ServiceId[] =>
  [sim.quantities.ai > 0 && 'ai', sim.quantities.monitor > 0 && 'monitor', (sim.quantities.windows > 0 || sim.quantities.linux > 0) && 'hosting'].filter(Boolean) as ServiceId[];

const ZERO: Record<SimField, string> = { ai: '0', monitor: '0', windows: '0', linux: '0' };

/**
 * Simulador de investimento (NEKKORA-COM-ECOSYSTEM-001 §4), dentro do bloco de preços (data-pricing).
 *
 * - Quatro campos, todos começando em zero; nenhum produto obrigatório. Só inteiros de 0 ao limite de cada campo
 *   (botões − e +, campo numérico e setas ↑/↓); nada fora disso é aceito.
 * - A estimativa acompanha as quantidades na hora: nunca há valor desatualizado na tela.
 * - Cobranças separadas: inicial (AI Piloto), mensal (Monitor), por hora (Hosting) e o combinado, que inclui só o
 *   primeiro mês do Monitor e nunca é chamado de mensalidade.
 * - Nada é enviado nem guardado: o estado vive só na memória da página (sem storage, sem requisição).
 */
export function Simulator() {
  const uid = useId();
  const [raw, setRaw] = useState<Record<SimField, string>>(ZERO);
  const [announcement, setAnnouncement] = useState<{ text: string; key: number }>({ text: '', key: 0 });

  const sim = simulate(Object.fromEntries(SIM_FIELDS.map((f) => [f, sanitizeQuantity(raw[f], SIM_LIMITS[f])])));
  const summary = sim.empty ? null : simulationSummary(sim);

  const announce = (text: string) => setAnnouncement((a) => ({ text, key: a.key + 1 }));
  const after = (next: Record<SimField, string>) => {
    const s = simulate(next);
    announce(s.empty ? S.empty : S.announce(simulationSummary(s).split('\n').map((l) => l.replace(/^- /, '')).join('. ')));
  };

  const set = (field: SimField, value: number) => {
    const next = { ...raw, [field]: String(sanitizeQuantity(value, SIM_LIMITS[field])) };
    setRaw(next);
    after(next);
  };
  // Só dígitos (sem sinal, vírgula, ponto ou expoente) e nunca acima do limite.
  const type = (field: SimField, text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, String(SIM_LIMITS[field]).length + 1);
    setRaw((r) => ({ ...r, [field]: digits === '' ? '' : String(sanitizeQuantity(digits, SIM_LIMITS[field])) }));
  };
  const keys = (field: SimField, q: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      set(field, q + (e.key === 'ArrowUp' ? 1 : -1));
    }
  };
  const clear = () => {
    setRaw(ZERO);
    announce(S.cleared);
  };

  return (
    <Card variant="raised" padding="lg" className="sim" data-simulator="">
      <div className="sim__head">
        <Icon name="chart" size="lg" color="var(--nk-color-accent)" />
        <div>
          <h3 id={`${uid}-title`} className="sim__title">
            {S.title}
          </h3>
          <p className="sim__description">{S.description}</p>
        </div>
      </div>

      <div className="sim__tiers" role="group" aria-labelledby={`${uid}-title`}>
        {S.fields.map(({ field, group, label, unit }) => {
          const q = sim.quantities[field];
          const max = SIM_LIMITS[field];
          const labelId = `${uid}-${field}`;
          return (
            <div key={field} className="sim__tier" data-sim-campo={field}>
              <span className="sim__tier-group">{group}</span>
              <span id={labelId} className="sim__tier-label">
                {label}
              </span>
              <span className="sim__tier-unit">{unit}</span>
              <div className="sim__stepper">
                <Button variant="secondary" icon="minus" aria-label={S.decrease(label)} aria-disabled={q === 0 || undefined} onClick={() => q > 0 && set(field, q - 1)} data-sim-action="diminuir" />
                <Input
                  className="sim__qty"
                  wrapperClassName="sim__qty-wrap"
                  role="spinbutton"
                  aria-labelledby={`${uid}-${field}-group ${labelId}`}
                  aria-describedby={`${uid}-max`}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  aria-valuenow={q}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={String(max).length + 1}
                  value={raw[field]}
                  onChange={(e) => type(field, e.target.value)}
                  onBlur={() => {
                    const next = { ...raw, [field]: String(sanitizeQuantity(raw[field], max)) };
                    setRaw(next);
                    after(next);
                  }}
                  onKeyDown={keys(field, q)}
                  data-sim-input={field}
                />
                <Button variant="secondary" icon="plus" aria-label={S.increase(label)} aria-disabled={q >= max || undefined} onClick={() => q < max && set(field, q + 1)} data-sim-action="aumentar" />
              </div>
              <span id={`${uid}-${field}-group`} className="nk-visually-hidden">
                {group}
              </span>
            </div>
          );
        })}
      </div>

      <p id={`${uid}-max`} className="sim__note">
        {S.limits}
      </p>

      <section className="sim__result" aria-labelledby={`${uid}-result`} data-sim-result={sim.empty ? 'vazio' : 'calculado'}>
        <div className="sim__result-head">
          <h4 id={`${uid}-result`} className="sim__result-title">
            {S.resultTitle}
          </h4>
          <Button variant="ghost" size="sm" leftIcon="refresh" onClick={clear} data-sim-action="limpar">
            {S.clear}
          </Button>
        </div>
        {sim.empty ? (
          <p className="sim__warning">{S.empty}</p>
        ) : (
          <>
            <dl className="sim__figures">
              {sim.quantities.ai > 0 && (
                <div className="sim__figure">
                  <dt>{S.ai}</dt>
                  <dd data-calc="ai">{S.aiValue(sim.labels.ai)}</dd>
                </div>
              )}
              {sim.quantities.monitor > 0 && (
                <div className="sim__figure">
                  <dt>{S.monitor}</dt>
                  <dd data-calc="monitor">{S.monitorValue(sim.labels.monitor)}</dd>
                </div>
              )}
              {sim.hosting > 0 && (
                <div className="sim__figure">
                  <dt>{S.hosting}</dt>
                  <dd data-calc="hosting">{sim.labels.hosting}</dd>
                </div>
              )}
              <div className="sim__figure sim__figure--main">
                <dt>{S.combined}</dt>
                <dd data-calc="combinado">{sim.labels.combined}</dd>
              </div>
            </dl>
            <p className="sim__note">{S.combinedNote}</p>
            <p className="sim__disclaimer" data-sim-aviso="">
              <Icon name="info" size="sm" />
              <span>{S.disclaimer}</span>
            </p>
            <div className="sim__next">
              <RequestButton options={{ services: servicesOf(sim), simulation: summary }} data-atendimento-origem="simulador">
                {S.request}
              </RequestButton>
            </div>
          </>
        )}
      </section>
      <StatusRegion visuallyHidden message={announcement.text || null} announceKey={announcement.key} data-testid="status-simulador" />
    </Card>
  );
}
