'use client';

import { useMemo, useState } from 'react';
import useTrackCalculator from '../useTrackCalculator';

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const percent = (value) => (Number.isFinite(value) ? `${value.toFixed(2)}%` : 'N/A');

function Slider({ label, value, onChange, min, max, step, format, hint }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const progress =
    max === min ? 0 : Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const commitDraft = () => {
    const cleaned = draft.replace(/[,$%\s]/g, '');
    const parsed = cleaned === '' ? NaN : Number(cleaned);
    if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
    setEditing(false);
  };

  return (
    <label className="mnpv-slider">
      <span className="mnpv-slider-top">
        <span className="mnpv-slider-label">{label}</span>
        <input
          className="mnpv-number-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck="false"
          value={editing ? draft : format(value)}
          aria-label={`${label} exact value`}
          onFocus={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            } else if (event.key === 'Escape') {
              setDraft(String(value));
              setEditing(false);
              event.currentTarget.blur();
            }
          }}
        />
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--mnpv-progress': `${progress}%` }}
        aria-label={label}
      />
      <span className="mnpv-slider-bottom">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </span>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Metric({ label, value, sub }) {
  return (
    <div className="mnpv-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function NpvChart({ purchasePrice, monthlyRoyalty, monthlyDiscountRate, years }) {
  const width = 640;
  const height = 250;
  const pad = { top: 18, right: 18, bottom: 36, left: 82 };
  const points = Array.from({ length: years }, (_, index) => {
    const year = index + 1;
    let pv = 0;
    for (let month = 1; month <= year * 12; month += 1) {
      pv += monthlyRoyalty / Math.pow(1 + monthlyDiscountRate, month);
    }
    return { year, npv: pv - purchasePrice };
  });
  const minY = Math.min(0, ...points.map((point) => point.npv));
  const maxY = Math.max(0, ...points.map((point) => point.npv));
  const range = Math.max(1, maxY - minY);
  const x = (year) =>
    pad.left + ((year - 1) / Math.max(1, years - 1)) * (width - pad.left - pad.right);
  const y = (value) => pad.top + ((maxY - value) / range) * (height - pad.top - pad.bottom);
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.year)} ${y(point.npv)}`)
    .join(' ');
  const zeroY = y(0);
  const labels = [1, Math.max(1, Math.round(years / 2)), years].filter(
    (value, index, array) => array.indexOf(value) === index,
  );

  return (
    <div className="mnpv-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Net present value by projection year"
      >
        <line
          x1={pad.left}
          y1={zeroY}
          x2={width - pad.right}
          y2={zeroY}
          stroke="#94a3b8"
          strokeDasharray="4 4"
        />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#cbd5e1" />
        <line
          x1={pad.left}
          y1={height - pad.bottom}
          x2={width - pad.right}
          y2={height - pad.bottom}
          stroke="#cbd5e1"
        />
        <path
          d={line}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <circle key={point.year} cx={x(point.year)} cy={y(point.npv)} r="3" fill="#2563eb" />
        ))}
        <text x={pad.left - 10} y={pad.top + 4} textAnchor="end">
          {money(maxY)}
        </text>
        <text x={pad.left - 10} y={zeroY + 4} textAnchor="end">
          $0
        </text>
        <text x={pad.left - 10} y={height - pad.bottom + 4} textAnchor="end">
          {money(minY)}
        </text>
        {labels.map((year) => (
          <text key={year} x={x(year)} y={height - 12} textAnchor="middle">
            {year} yr
          </text>
        ))}
      </svg>
      <small>
        NPV at each holding period, using the same monthly royalty and discount-rate assumptions.
      </small>
    </div>
  );
}

function calculateMonthlyIrr(price, royalty, months) {
  if (price <= 0 || royalty <= 0 || months <= 0) return null;
  const pvAt = (rate) => {
    if (Math.abs(rate) < 1e-12) return royalty * months;
    return (royalty * (1 - Math.pow(1 + rate, -months))) / rate;
  };
  let low = -0.99;
  let high = 1;
  if (pvAt(low) < price) return null;
  while (pvAt(high) > price && high < 1e6) high = high * 2 + 1;
  if (pvAt(high) > price) return null;
  for (let i = 0; i < 120; i += 1) {
    const mid = (low + high) / 2;
    if (pvAt(mid) > price) low = mid;
    else high = mid;
  }
  const monthlyRate = (low + high) / 2;
  return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
}

export default function MineralNpvCalculator() {
  return <Calculator />;
}

function Calculator() {
  const [purchasePrice, setPurchasePrice] = useState(60000);
  const [monthlyRoyalty, setMonthlyRoyalty] = useState(1200);
  const [discountRate, setDiscountRate] = useState(10);
  const [years, setYears] = useState(10);

  useTrackCalculator('mineral-npv', true);

  const result = useMemo(() => {
    const monthlyDiscountRate = Math.pow(1 + discountRate / 100, 1 / 12) - 1;
    let presentValue = 0;
    for (let month = 1; month <= years * 12; month += 1) {
      presentValue += monthlyRoyalty / Math.pow(1 + monthlyDiscountRate, month);
    }
    const npv = presentValue - purchasePrice;
    const totalRoyalties = monthlyRoyalty * years * 12;
    const paybackMonths = monthlyRoyalty > 0 ? purchasePrice / monthlyRoyalty : Infinity;
    const irr = calculateMonthlyIrr(purchasePrice, monthlyRoyalty, years * 12);
    return {
      monthlyDiscountRate,
      presentValue,
      npv,
      totalRoyalties,
      paybackMonths,
      irr,
      maxPurchasePrice: presentValue,
    };
  }, [purchasePrice, monthlyRoyalty, discountRate, years]);

  const verdict =
    result.npv > 0
      ? 'The projected royalties exceed your purchase price.'
      : result.npv < 0
        ? 'The purchase price exceeds the present value of projected royalties.'
        : 'The purchase price equals the present value of projected royalties.';

  return (
    <div className="mineral-npv-tool mnpv-lite">
      <style>{`
        .mnpv-lite{color:#17212b;font-family:inherit}.mnpv-lite *{box-sizing:border-box}.mnpv-lite .mnpv-intro{margin:0 0 18px}.mnpv-lite .mnpv-eyebrow{color:#64748b;font-size:10px;font-weight:800;letter-spacing:.12em}.mnpv-lite h2{margin:6px 0;font-size:clamp(23px,3vw,31px);line-height:1.15}.mnpv-lite .mnpv-intro p{max-width:700px;margin:0;color:#64748b;font-size:13px;line-height:1.5}.mnpv-lite .mnpv-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(290px,.85fr);gap:16px;align-items:start}.mnpv-lite .mnpv-controls,.mnpv-lite .mnpv-results,.mnpv-lite .mnpv-chart{padding:18px;border:1px solid #e2e8f0;border-radius:14px;background:#fff}.mnpv-lite .mnpv-section-title{margin:0 0 15px;font-size:15px}.mnpv-lite .mnpv-slider{display:block;margin:0 0 20px}.mnpv-lite .mnpv-slider:last-child{margin-bottom:0}.mnpv-lite .mnpv-slider-top,.mnpv-lite .mnpv-slider-bottom{display:flex;justify-content:space-between;gap:10px;align-items:baseline}.mnpv-lite .mnpv-slider-label{color:#334155;font-size:13px;font-weight:650}.mnpv-lite .mnpv-number-input{width:150px;max-width:52%;min-width:105px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:8px;color:#0f172a;background:#fff;font:inherit;font-size:15px;font-weight:750;text-align:right;font-variant-numeric:tabular-nums}.mnpv-lite .mnpv-number-input:focus{border-color:#2563eb;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.13)}.mnpv-lite input[type=range]{display:block;width:100%;height:6px;margin:13px 0 7px;border-radius:10px;appearance:none;background:linear-gradient(to right,#2563eb 0%,#2563eb var(--mnpv-progress),#e2e8f0 var(--mnpv-progress),#e2e8f0 100%);cursor:pointer}.mnpv-lite input[type=range]::-webkit-slider-thumb{width:18px;height:18px;border:3px solid #fff;border-radius:50%;appearance:none;background:#2563eb;box-shadow:0 0 0 1px #2563eb,0 1px 3px #64748b}.mnpv-lite input[type=range]::-moz-range-thumb{width:13px;height:13px;border:3px solid #fff;border-radius:50%;background:#2563eb;box-shadow:0 0 0 1px #2563eb,0 1px 3px #64748b}.mnpv-lite .mnpv-slider-bottom{color:#94a3b8;font-size:10px}.mnpv-lite .mnpv-slider small{display:block;margin-top:5px;color:#94a3b8;font-size:10px;line-height:1.4}.mnpv-lite .mnpv-results{position:sticky;top:16px;background:#f8fafc}.mnpv-lite .mnpv-verdict{padding:14px;border:1px solid #bfdbfe;border-radius:11px;background:#eff6ff}.mnpv-lite .mnpv-verdict.negative{border-color:#fecaca;background:#fef2f2}.mnpv-lite .mnpv-verdict.neutral{border-color:#e2e8f0;background:#fff}.mnpv-lite .mnpv-verdict span{display:block;color:#475569;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.mnpv-lite .mnpv-verdict strong{display:block;margin:6px 0;font-size:23px;line-height:1.2}.mnpv-lite .mnpv-verdict p{margin:0;color:#475569;font-size:12px;line-height:1.5}.mnpv-lite .mnpv-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.mnpv-lite .mnpv-metric{min-width:0;padding:11px;border:1px solid #e2e8f0;border-radius:9px;background:#fff}.mnpv-lite .mnpv-metric span{display:block;color:#64748b;font-size:10px;line-height:1.35}.mnpv-lite .mnpv-metric strong{display:block;margin-top:5px;font-size:16px;overflow-wrap:anywhere}.mnpv-lite .mnpv-metric small{display:block;margin-top:3px;color:#64748b;font-size:10px;line-height:1.4}.mnpv-lite .mnpv-subhead{margin:15px 0 0;color:#475569;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.mnpv-lite .mnpv-chart{margin-top:16px}.mnpv-lite .mnpv-chart h3{margin:0 0 8px;font-size:14px}.mnpv-lite .mnpv-chart-wrap svg{display:block;width:100%;height:auto;overflow:visible}.mnpv-lite .mnpv-chart-wrap text{fill:#64748b;font-size:10px}.mnpv-lite .mnpv-chart-wrap small{display:block;color:#64748b;font-size:10px;line-height:1.45}.mnpv-lite .mnpv-footnote,.mnpv-lite .mnpv-disclaimer{margin:12px 0 0;color:#64748b;font-size:10px;line-height:1.5}@media(max-width:760px){.mnpv-lite .mnpv-layout{grid-template-columns:1fr}.mnpv-lite .mnpv-results{position:static}}@media(max-width:420px){.mnpv-lite .mnpv-controls,.mnpv-lite .mnpv-results,.mnpv-lite .mnpv-chart{padding:13px}}
      `}</style>

      <div className="mnpv-intro">
        <span className="mnpv-eyebrow">MINERAL ACQUISITION ANALYSIS</span>
        <h2>Mineral Rights NPV Calculator</h2>
        <p>
          Estimate what a producing mineral interest is worth based on its current royalty income,
          your required return, and how long you expect to hold it.
        </p>
      </div>

      <div className="mnpv-layout">
        <section className="mnpv-controls">
          <h3 className="mnpv-section-title">Purchase assumptions</h3>
          <Slider
            label="Purchase price"
            value={purchasePrice}
            onChange={setPurchasePrice}
            min={1000}
            max={1000000}
            step={1000}
            format={money}
          />
          <Slider
            label="Current monthly royalty income"
            value={monthlyRoyalty}
            onChange={setMonthlyRoyalty}
            min={0}
            max={50000}
            step={25}
            format={money}
          />
          <Slider
            label="Required annual return (discount rate)"
            value={discountRate}
            onChange={setDiscountRate}
            min={0}
            max={30}
            step={0.25}
            format={(value) => `${value}%`}
            hint="Your required annual return. Future monthly royalties are discounted using the equivalent monthly rate."
          />
          <Slider
            label="Projection period"
            value={years}
            onChange={setYears}
            min={1}
            max={30}
            step={1}
            format={(value) => `${value} years`}
          />
        </section>

        <aside className="mnpv-results" aria-live="polite">
          <span className="mnpv-eyebrow">DEAL VALUATION</span>
          <div
            className={`mnpv-verdict ${result.npv < 0 ? 'negative' : result.npv === 0 ? 'neutral' : ''}`}
          >
            <span>Net present value</span>
            <strong>{money(result.npv)}</strong>
            <p>{verdict}</p>
          </div>
          <div className="mnpv-metrics">
            <Metric
              label="Present value of royalties"
              value={money(result.presentValue)}
              sub={`Over ${years} years, discounted monthly`}
            />
            <Metric
              label="Maximum purchase price"
              value={money(result.maxPurchasePrice)}
              sub={`At your ${discountRate}% required return`}
            />
            <Metric
              label="Estimated annual IRR"
              value={percent(result.irr)}
              sub="Based on the projected monthly cash flows"
            />
            <Metric
              label="Simple payback period"
              value={
                Number.isFinite(result.paybackMonths)
                  ? `${(result.paybackMonths / 12).toFixed(1)} years`
                  : 'N/A'
              }
              sub="Purchase price divided by current annual royalties"
            />
            <Metric
              label="Total projected royalties"
              value={money(result.totalRoyalties)}
              sub="Undiscounted over the projection period"
            />
            <Metric
              label="Purchase price / annual royalties"
              value={
                monthlyRoyalty > 0
                  ? `${(purchasePrice / (monthlyRoyalty * 12)).toFixed(2)}×`
                  : 'N/A'
              }
              sub="Price-to-current-annual-income multiple"
            />
          </div>
        </aside>
      </div>

      <section className="mnpv-chart">
        <h3>NPV by holding period</h3>
        <NpvChart
          purchasePrice={purchasePrice}
          monthlyRoyalty={monthlyRoyalty}
          monthlyDiscountRate={result.monthlyDiscountRate}
          years={years}
        />
      </section>

      <p className="mnpv-footnote">
        Model assumptions: current monthly royalty income remains constant; royalties are received
        at the end of each month; purchase price is paid upfront; and the annual discount rate is
        converted to an equivalent monthly rate. The model does not include production decline,
        future wells, commodity-price changes, taxes, transaction costs, or other expenses.
      </p>
      <p className="mnpv-disclaimer">
        Illustrative estimate only. Actual mineral value depends on title, lease terms, production
        history, operator activity, commodity prices, and other property-specific factors. This
        calculator is not an appraisal or an offer to purchase.
      </p>
    </div>
  );
}
