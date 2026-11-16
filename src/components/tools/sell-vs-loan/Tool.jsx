'use client';

import { useMemo, useState } from 'react';
import useTrackCalculator from '../useTrackCalculator';

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

function Slider({ label, value, onChange, min, max, step, format, hint }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const progress = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  // Keep the text field stable while typing; don't clamp each keystroke.
  // This allows users to select-all, clear, and replace a value naturally.
  const commitDraft = () => {
    const cleaned = draft.replace(/[,$%\\s]/g, '');
    const parsed = cleaned === '' ? NaN : Number(cleaned);
    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
    setEditing(false);
  };

  return (
    <label className="svl-slider">
      <span className="svl-slider-top">
        <span className="svl-slider-label">{label}</span>
        <input
          className="svl-number-input"
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
        style={{ '--svl-progress': `${progress}%` }}
        aria-label={label}
      />
      <span className="svl-slider-bottom">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </span>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function ResultMetric({ label, value, sub }) {
  return (
    <div className="svl-result-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

export default function SellVsLoanDecisionTool() {
  return <Calculator />;
}

function Calculator() {
  const [cashGoal, setCashGoal] = useState(50000);
  const [monthlyRoyalty, setMonthlyRoyalty] = useState(1500);
  const [loanAmount, setLoanAmount] = useState(50000);
  const [annualInterestRate, setAnnualInterestRate] = useState(15);
  const [loanMonths, setLoanMonths] = useState(60);
  const [saleCash, setSaleCash] = useState(65000);
  const [incomeShareSold, setIncomeShareSold] = useState(100);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced assumptions are optional and prefilled with illustrative defaults.
  const [outlookYears, setOutlookYears] = useState(10);
  const [annualDecline, setAnnualDecline] = useState(3);
  const [discountRate, setDiscountRate] = useState(5);
  const [upfrontFees, setUpfrontFees] = useState(0);

  const result = useMemo(() => {
    const annualDiscountRate = discountRate / 100;
    const monthlyDiscount = Math.pow(1 + annualDiscountRate, 1 / 12) - 1;
    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const payment =
      monthlyInterestRate === 0
        ? loanAmount / loanMonths
        : (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanMonths));
    const netLoanCash = Math.max(0, loanAmount - upfrontFees);

    let pvRoyaltySold = 0;
    for (let month = 1; month <= outlookYears * 12; month += 1) {
      const year = Math.floor((month - 1) / 12);
      const income = monthlyRoyalty * Math.pow(1 - annualDecline / 100, year);
      pvRoyaltySold += (income * (incomeShareSold / 100)) / Math.pow(1 + monthlyDiscount, month);
    }

    let pvLoanPayments = 0;
    for (let month = 1; month <= loanMonths; month += 1) {
      pvLoanPayments += payment / Math.pow(1 + monthlyDiscount, month);
    }

    // Fees are assumed to be withheld from the loan proceeds, so they reduce
    // cash received and are not subtracted a second time from present value.
    const difference = netLoanCash - saleCash - pvLoanPayments + pvRoyaltySold;
    const totalPayments = payment * loanMonths;
    const totalInterest = Math.max(0, totalPayments - loanAmount);
    const comparisonBase = Math.max(netLoanCash, saleCash, 1);
    const closeThreshold = comparisonBase * 0.025;

    return {
      payment,
      netLoanCash,
      pvRoyaltySold,
      pvLoanPayments,
      difference,
      closeThreshold,
      loanMeetsGoal: netLoanCash >= cashGoal,
      saleMeetsGoal: saleCash >= cashGoal,
      loanShort: Math.max(0, cashGoal - netLoanCash),
      saleShort: Math.max(0, cashGoal - saleCash),
      totalPayments,
      totalInterest,
    };
  }, [
    cashGoal,
    monthlyRoyalty,
    loanAmount,
    annualInterestRate,
    loanMonths,
    saleCash,
    incomeShareSold,
    outlookYears,
    annualDecline,
    discountRate,
    upfrontFees,
  ]);

  useTrackCalculator('sell-vs-loan', true);

  const recommendation =
    result.loanMeetsGoal && !result.saleMeetsGoal
      ? 'Only the loan reaches your cash goal.'
      : result.saleMeetsGoal && !result.loanMeetsGoal
        ? 'Only the sale reaches your cash goal.'
        : !result.loanMeetsGoal && !result.saleMeetsGoal
          ? 'Neither option reaches your cash goal.'
          : result.difference > result.closeThreshold
            ? 'Borrowing has the higher modeled value.'
            : result.difference < -result.closeThreshold
              ? 'Selling has the higher modeled value.'
              : 'The modeled values are relatively close.';

  return (
    <div className="sell-loan-tool svl-lite">
      <style>{`
        .svl-lite { color:#17212b; font-family:inherit; }
        .svl-lite * { box-sizing:border-box; }
        .svl-lite .svl-intro { margin:0 0 18px; }
        .svl-lite .svl-eyebrow { color:#64748b; font-size:10px; font-weight:800; letter-spacing:.12em; }
        .svl-lite h2 { margin:6px 0; font-size:clamp(23px,3vw,31px); line-height:1.15; }
        .svl-lite .svl-intro p { max-width:680px; margin:0; color:#64748b; font-size:13px; line-height:1.5; }
        .svl-lite .svl-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(290px,.8fr); gap:16px; align-items:start; }
        .svl-lite .svl-controls,.svl-lite .svl-results { padding:18px; border:1px solid #e2e8f0; border-radius:14px; background:#fff; }
        .svl-lite .svl-section-title { margin:0 0 15px; font-size:15px; }
        .svl-lite .svl-slider { display:block; margin:0 0 20px; }
        .svl-lite .svl-slider:last-child { margin-bottom:0; }
        .svl-lite .svl-slider-top,.svl-lite .svl-slider-bottom { display:flex; justify-content:space-between; gap:10px; align-items:baseline; }
        .svl-lite .svl-slider-label { color:#334155; font-size:13px; font-weight:650; }
        .svl-lite .svl-number-input { width:150px; max-width:52%; min-width:105px; padding:7px 9px; border:1px solid #cbd5e1; border-radius:8px; color:#0f172a; background:#fff; font:inherit; font-size:15px; font-weight:750; text-align:right; font-variant-numeric:tabular-nums; transition:border-color .15s,box-shadow .15s; }
        .svl-lite .svl-number-input:hover { border-color:#94a3b8; }
        .svl-lite .svl-number-input:focus { border-color:#2563eb; outline:none; box-shadow:0 0 0 3px rgba(37,99,235,.13); }
        .svl-lite input[type=range] { display:block; width:100%; height:6px; margin:13px 0 7px; border-radius:10px; appearance:none; background:linear-gradient(to right,#2563eb 0%,#2563eb var(--svl-progress),#e2e8f0 var(--svl-progress),#e2e8f0 100%); cursor:pointer; }
        .svl-lite input[type=range]::-webkit-slider-thumb { width:18px; height:18px; border:3px solid #fff; border-radius:50%; appearance:none; background:#2563eb; box-shadow:0 0 0 1px #2563eb,0 1px 3px #64748b; }
        .svl-lite input[type=range]::-moz-range-thumb { width:13px; height:13px; border:3px solid #fff; border-radius:50%; background:#2563eb; box-shadow:0 0 0 1px #2563eb,0 1px 3px #64748b; }
        .svl-lite .svl-slider-bottom { color:#94a3b8; font-size:10px; }
        
        .svl-lite .svl-slider small { display:block; margin-top:5px; color:#94a3b8; font-size:10px; line-height:1.4; }
        .svl-lite .svl-advanced-toggle { display:flex; width:100%; align-items:center; justify-content:space-between; gap:12px; margin-top:18px; padding:13px 0 0; border:0; border-top:1px solid #e2e8f0; background:transparent; color:#1d4ed8; font:inherit; font-size:13px; font-weight:700; text-align:left; cursor:pointer; }
        .svl-lite .svl-advanced-toggle span:last-child { font-size:18px; }
        .svl-lite .svl-advanced-panel { margin-top:14px; padding:14px; border:1px solid #e2e8f0; border-radius:11px; background:#f8fafc; }
        .svl-lite .svl-advanced-panel > p { margin:0 0 15px; color:#64748b; font-size:11px; line-height:1.45; }
        .svl-lite .svl-results { position:sticky; top:16px; background:#f8fafc; }
        .svl-lite .svl-verdict { padding:14px; border:1px solid #bfdbfe; border-radius:11px; background:#eff6ff; }
        .svl-lite .svl-verdict.sell { border-color:#bbf7d0; background:#f0fdf4; }
        .svl-lite .svl-verdict.close { border-color:#e2e8f0; background:#fff; }
        .svl-lite .svl-verdict span { display:block; color:#475569; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .svl-lite .svl-verdict strong { display:block; margin:6px 0; font-size:19px; line-height:1.2; }
        .svl-lite .svl-verdict p { margin:0; color:#475569; font-size:12px; line-height:1.5; }
        .svl-lite .svl-status-grid,.svl-lite .svl-metrics { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .svl-lite .svl-status,.svl-lite .svl-result-metric { min-width:0; padding:11px; border:1px solid #e2e8f0; border-radius:9px; background:#fff; }
        .svl-lite .svl-status span,.svl-lite .svl-result-metric span { display:block; color:#64748b; font-size:10px; line-height:1.35; }
        .svl-lite .svl-status strong,.svl-lite .svl-result-metric strong { display:block; margin-top:5px; font-size:15px; overflow-wrap:anywhere; }
        .svl-lite .svl-status small,.svl-lite .svl-result-metric small { display:block; margin-top:3px; color:#64748b; font-size:10px; }
        .svl-lite .svl-subhead { margin:15px 0 0; color:#475569; font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .svl-lite .svl-footnote { margin:12px 0 0; color:#64748b; font-size:10px; line-height:1.5; }
        .svl-lite .svl-disclaimer { margin-top:13px; color:#64748b; font-size:10px; line-height:1.5; }
        @media(max-width:760px) { .svl-lite .svl-layout { grid-template-columns:1fr; } .svl-lite .svl-results { position:static; } }
        @media(max-width:420px) { .svl-lite .svl-controls,.svl-lite .svl-results { padding:13px; } }
      `}</style>

      <div className="svl-intro">
        <span className="svl-eyebrow">MINERAL RIGHTS DECISION TOOL</span>
        <h2>Should you sell or borrow?</h2>
        <p>
          Compare a fully amortizing loan with a sale offer. Adjust the numbers to match your
          situation; the monthly loan payment is calculated automatically.
        </p>
      </div>

      <div className="svl-layout">
        <section className="svl-controls">
          <h3 className="svl-section-title">Your situation</h3>
          <Slider
            label="Current monthly royalty income"
            value={monthlyRoyalty}
            onChange={setMonthlyRoyalty}
            min={0}
            max={10000}
            step={25}
            format={money}
          />
          <Slider
            label="Cash you need"
            value={cashGoal}
            onChange={setCashGoal}
            min={5000}
            max={250000}
            step={500}
            format={money}
            hint="Used to show whether each option provides enough cash."
          />

          <h3 className="svl-section-title" style={{ marginTop: 22 }}>
            Compare your offers
          </h3>
          <div className="svl-subhead" style={{ margin: '0 0 12px' }}>
            Borrow
          </div>
          <Slider
            label="Loan amount"
            value={loanAmount}
            onChange={(value) => {
              setLoanAmount(value);
              setUpfrontFees((fees) => Math.min(fees, value));
            }}
            min={5000}
            max={250000}
            step={500}
            format={money}
          />
          <Slider
            label="Annual interest rate"
            value={annualInterestRate}
            onChange={setAnnualInterestRate}
            min={0}
            max={30}
            step={0.25}
            format={(v) => `${v}%`}
            hint="The stated annual interest rate, before any fees."
          />
          <Slider
            label="Loan repayment period"
            value={loanMonths}
            onChange={setLoanMonths}
            min={12}
            max={60}
            step={12}
            format={(v) => `${v} months`}
          />
          <div className="svl-status" style={{ marginBottom: 18 }}>
            <span>Calculated monthly payment</span>
            <strong>{money(result.payment)}</strong>
            <small>Fully amortizing; paid monthly over {loanMonths} months</small>
          </div>

          <div className="svl-subhead" style={{ margin: '0 0 12px' }}>
            Sell
          </div>
          <Slider
            label="Sale cash to you"
            value={saleCash}
            onChange={setSaleCash}
            min={5000}
            max={500000}
            step={500}
            format={money}
          />
          <Slider
            label="Estimated royalty income transferred"
            value={incomeShareSold}
            onChange={setIncomeShareSold}
            min={0}
            max={100}
            step={1}
            format={(v) => `${v}%`}
            hint="A simplified estimate of the share of current royalty income conveyed in the sale."
          />

          <button
            type="button"
            className="svl-advanced-toggle"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((open) => !open)}
          >
            <span>{showAdvanced ? 'Hide advanced assumptions' : 'Advanced assumptions'}</span>
            <span>{showAdvanced ? '−' : '+'}</span>
          </button>

          {showAdvanced && (
            <div className="svl-advanced-panel">
              <p>
                These assumptions affect the estimated value of future royalties. Loan payments use
                a standard fully amortizing schedule with no balloon payment. Upfront fees are
                assumed to be deducted from the loan proceeds.
              </p>
              <Slider
                label="Upfront loan fees"
                value={upfrontFees}
                onChange={setUpfrontFees}
                min={0}
                max={Math.min(10000, loanAmount)}
                step={50}
                format={money}
                hint="Assumed to be withheld from the loan amount before cash is paid to you."
              />
              <Slider
                label="Years to project royalty income"
                value={outlookYears}
                onChange={setOutlookYears}
                min={1}
                max={30}
                step={1}
                format={(v) => `${v} years`}
              />
              <Slider
                label="Assumed annual royalty decline"
                value={annualDecline}
                onChange={setAnnualDecline}
                min={0}
                max={20}
                step={0.5}
                format={(v) => `${v}%`}
                hint="Assumes royalty income declines by this rate each year."
              />
              <Slider
                label="Annual discount rate"
                value={discountRate}
                onChange={setDiscountRate}
                min={0}
                max={15}
                step={0.25}
                format={(v) => `${v}%`}
                hint="Converts future dollars into an estimated value in today's dollars."
              />
            </div>
          )}
        </section>

        <aside className="svl-results" aria-live="polite">
          <span className="svl-eyebrow">SIDE-BY-SIDE RESULT</span>
          <div
            className={`svl-verdict ${Math.abs(result.difference) <= result.closeThreshold ? 'close' : result.difference < 0 ? 'sell' : ''}`}
          >
            <span>Based on these example assumptions</span>
            <strong>{recommendation}</strong>
            <p>
              {result.difference >= 0
                ? `Borrowing is ahead by approximately ${money(result.difference)} in modeled present value.`
                : `Selling is ahead by approximately ${money(Math.abs(result.difference))} in modeled present value.`}
            </p>
          </div>

          <div className="svl-status-grid">
            <div className="svl-status">
              <span>Loan vs. cash goal</span>
              <strong>{result.loanMeetsGoal ? 'Meets your goal' : 'Below your goal'}</strong>
              <small>
                {result.loanMeetsGoal
                  ? money(result.netLoanCash - cashGoal) + ' above'
                  : money(result.loanShort) + ' short'}
              </small>
            </div>
            <div className="svl-status">
              <span>Sale vs. cash goal</span>
              <strong>{result.saleMeetsGoal ? 'Meets your goal' : 'Below your goal'}</strong>
              <small>
                {result.saleMeetsGoal
                  ? money(saleCash - cashGoal) + ' above'
                  : money(result.saleShort) + ' short'}
              </small>
            </div>
          </div>

          <div className="svl-subhead">Borrowing</div>
          <div className="svl-metrics">
            <ResultMetric
              label="Cash received after fees"
              value={money(result.netLoanCash)}
              sub={`${money(loanAmount)} loan amount less ${money(upfrontFees)} upfront fees`}
            />
            <ResultMetric
              label="Calculated monthly payment"
              value={money(result.payment)}
              sub={`${loanMonths} fully amortizing payments`}
            />
            <ResultMetric
              label="Total scheduled payments"
              value={money(result.totalPayments)}
              sub="Principal and interest combined"
            />
            <ResultMetric
              label="Total interest cost"
              value={money(result.totalInterest)}
              sub={`At ${annualInterestRate}% annual interest`}
            />
          </div>

          <div className="svl-subhead">Selling</div>
          <div className="svl-metrics">
            <ResultMetric label="Cash received" value={money(saleCash)} />
            <ResultMetric
              label="Future royalties transferred"
              value={money(result.pvRoyaltySold)}
              sub={`Estimated present value over ${outlookYears} years`}
            />
          </div>

          <p className="svl-footnote">
            Assumptions: standard fully amortizing loan with monthly payments; upfront fees deducted
            from proceeds; {outlookYears}-year royalty outlook; {annualDecline}% annual royalty
            decline; and {discountRate}% annual discount rate. The comparison excludes taxes,
            mineral resale value, changing production, and contract-specific terms.
          </p>
        </aside>
      </div>

      <p className="svl-disclaimer">
        Illustrative estimate only. Actual loan collateral, default remedies, royalty assignments,
        and the exact interest transferred in a sale depend on the signed documents. Have the
        agreements reviewed independently before making a decision.
      </p>
    </div>
  );
}
