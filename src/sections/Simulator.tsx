import { useId, useState, type KeyboardEvent } from 'react';
import { Button, Card, Icon, Input, StatusRegion } from 'nekkora-lib';
import { SIMULATOR as S } from '../content';
import { EMPTY_QUANTITIES, MAX_QUANTITY, PRICE_TABLE, brl, sanitizeQuantity, simulate, type QuantityTier, type Simulation } from '../precos';
import { WhatsappButton } from '../whatsapp';

type Result = { sim: Simulation };

/**
 * Resumo em texto da simulação: anunciado ao leitor de tela e levado à mensagem inicial do WhatsApp
 * (NEKKORA-COM-CANAIS-001), onde o visitante a revisa e edita antes de enviar. Valores de src/precos.ts.
 */
export function simulationSummary({ sim }: Result): string {
  const lines = sim.lines
    .filter((l) => l.quantity > 0)
    .map((l) => `- ${S.count(l.tier, l.quantity)}: ${S.composition(l.packages, l.singles, l.packageLabel, l.individualLabel)} = ${l.totalLabel}`);
  lines.push(`${S.estimateLabel}: ${sim.estimateLabel}`);
  if (sim.savings > 0) lines.push(`${S.individualLabel}: ${sim.individualTotalLabel} · ${S.savingsLabel}: ${sim.savingsLabel}`);
  return lines.join('\n');
}

/**
 * Simulador de Investimento — Nekkora Delivery (NEKKORA-CALC-001), dentro do bloco de preços (data-pricing).
 *
 * - Quantidades de 0 a MAX_QUANTITY por categoria (botões − e +, campo numérico e setas ↑/↓); nada fora disso é aceito.
 * - O resultado só aparece com "Calcular meu investimento" e some se as quantidades mudarem, até um novo cálculo:
 *   nunca há um valor desatualizado na tela.
 * - Tabela única (COM-VITRINE-001): o preço não depende da data; por categoria, pacotes de 3 enquanto houver 3 e o
 *   restante no individual. Só simples e média (V-04).
 * - Nada é enviado nem guardado: o estado vive só na memória da página (sem storage, sem requisição).
 */
export function Simulator() {
  const uid = useId();
  const [raw, setRaw] = useState<Record<QuantityTier, string>>({ simples: '0', media: '0' });
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState<'empty' | 'cleared' | null>(null);
  const [announcement, setAnnouncement] = useState<{ text: string; key: number }>({ text: '', key: 0 });

  const quantities = { ...EMPTY_QUANTITIES, ...Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, sanitizeQuantity(v)])) } as Record<QuantityTier, number>;
  const total = quantities.simples + quantities.media;
  const stale = result != null && (Object.keys(quantities) as QuantityTier[]).some((t) => quantities[t] !== result.sim.quantities[t]);
  const shown = result && !stale ? result : null;
  const summary = shown ? simulationSummary(shown) : null;

  const announce = (text: string) => setAnnouncement((a) => ({ text, key: a.key + 1 }));

  const set = (tier: QuantityTier, value: number) => {
    setRaw((r) => ({ ...r, [tier]: String(sanitizeQuantity(value)) }));
    setNotice(null);
  };
  // Só dígitos (sem sinal, vírgula, ponto ou expoente) e nunca acima do limite.
  const type = (tier: QuantityTier, text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 3);
    setRaw((r) => ({ ...r, [tier]: digits === '' ? '' : String(sanitizeQuantity(digits)) }));
    setNotice(null);
  };
  const keys = (tier: QuantityTier) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      set(tier, quantities[tier] + (e.key === 'ArrowUp' ? 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
    }
  };

  const calculate = () => {
    if (total === 0) {
      setResult(null);
      setNotice('empty');
      announce(S.empty);
      return;
    }
    const next = { sim: simulate(quantities) };
    setRaw({ simples: String(quantities.simples), media: String(quantities.media) });
    setResult(next);
    setNotice(null);
    announce(S.announce(simulationSummary(next).split('\n').map((l) => l.replace(/^- /, '')).join('. ')));
  };

  const clear = () => {
    setRaw({ simples: '0', media: '0' });
    setResult(null);
    setNotice('cleared');
    announce(S.cleared);
  };

  const unit = (tier: QuantityTier) => S.unit(brl(PRICE_TABLE[tier].individual), brl(PRICE_TABLE[tier].pacote));

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
        {S.tiers.map(({ tier, label }) => {
          const q = quantities[tier];
          const labelId = `${uid}-${tier}`;
          return (
            <div key={tier} className="sim__tier" data-sim-tier={tier}>
              <span id={labelId} className="sim__tier-label">
                {label}
              </span>
              <span className="sim__tier-unit">{unit(tier)}</span>
              <div className="sim__stepper">
                <Button
                  variant="secondary"
                  icon="minus"
                  aria-label={S.decrease(label)}
                  aria-disabled={q === 0 || undefined}
                  onClick={() => q > 0 && set(tier, q - 1)}
                  data-sim-action="diminuir"
                />
                <Input
                  className="sim__qty"
                  wrapperClassName="sim__qty-wrap"
                  role="spinbutton"
                  aria-labelledby={labelId}
                  aria-describedby={`${uid}-max`}
                  aria-valuemin={0}
                  aria-valuemax={MAX_QUANTITY}
                  aria-valuenow={q}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  value={raw[tier]}
                  onChange={(e) => type(tier, e.target.value)}
                  onBlur={() => setRaw((r) => ({ ...r, [tier]: String(sanitizeQuantity(r[tier])) }))}
                  onKeyDown={keys(tier)}
                  data-sim-input={tier}
                />
                <Button
                  variant="secondary"
                  icon="plus"
                  aria-label={S.increase(label)}
                  aria-disabled={q >= MAX_QUANTITY || undefined}
                  onClick={() => q < MAX_QUANTITY && set(tier, q + 1)}
                  data-sim-action="aumentar"
                />
              </div>
            </div>
          );
        })}
      </div>

      <p id={`${uid}-max`} className="sim__note">
        {S.max(MAX_QUANTITY)}
      </p>

      <div className="sim__bar">
        <strong className="sim__total" data-sim-total={total}>
          {S.total(total)}
        </strong>
        <div className="sim__actions">
          <Button variant="ghost" leftIcon="refresh" onClick={clear}>
            {S.clear}
          </Button>
          <Button rightIcon="arrow-right" onClick={calculate}>
            {S.calculate}
          </Button>
        </div>
      </div>

      {notice === 'empty' && <p className="sim__warning">{S.empty}</p>}
      {stale && <p className="sim__warning">{S.changed}</p>}

      {shown && (
        <section className="sim__result" aria-labelledby={`${uid}-result`} data-sim-result="" data-sim-pacotes={shown.sim.packages}>
          <h4 id={`${uid}-result`} className="sim__result-title">
            {S.resultTitle}
          </h4>
          <ul className="sim__lines plain-list">
            {shown.sim.lines
              .filter((l) => l.quantity > 0)
              .map((l) => (
                <li key={l.tier} data-sim-line={l.tier}>
                  <span>
                    {S.count(l.tier, l.quantity)}: {S.composition(l.packages, l.singles, l.packageLabel, l.individualLabel)}
                  </span>
                  <span className="sim__line-total">{l.totalLabel}</span>
                </li>
              ))}
          </ul>
          <dl className="sim__figures">
            <div className="sim__figure sim__figure--main">
              <dt>{S.estimateLabel}</dt>
              <dd data-calc="estimativa">{shown.sim.estimateLabel}</dd>
            </div>
            {shown.sim.savings > 0 && (
              <>
                <div className="sim__figure">
                  <dt>{S.individualLabel}</dt>
                  <dd data-calc="individual">{shown.sim.individualTotalLabel}</dd>
                </div>
                <div className="sim__figure">
                  <dt>{S.savingsLabel}</dt>
                  <dd data-calc="economia">{shown.sim.savingsLabel}</dd>
                </div>
              </>
            )}
          </dl>
          <p className="sim__note">{S.packagesRule}</p>
          {shown.sim.savings > 0 && <p className="sim__note">{S.savingsNote}</p>}
          <p className="sim__disclaimer" data-sim-aviso="">
            <Icon name="info" size="sm" />
            <span>{S.disclaimer}</span>
          </p>
          <div className="sim__next">
            <span className="sim__next-label">{S.next}</span>
            <div className="sim__actions">
              {/* NEKKORA-COM-CANAIS-001: a simulação vai junto da mensagem do Delivery; nada é enviado sem o visitante */}
              <WhatsappButton context="delivery" extra={summary && `${S.whatsappIntro}\n${summary}`}>
                {S.request}
              </WhatsappButton>
            </div>
          </div>
        </section>
      )}

      <p className="sim__help">
        <strong>{S.help.title}</strong> {S.help.text}{' '}
        <a href="#criterios-categoria">{S.help.link}</a>.
      </p>
      <StatusRegion visuallyHidden message={announcement.text || null} announceKey={announcement.key} data-testid="status-simulador" />
    </Card>
  );
}
