'use client';
import { useState } from 'react';
import CalculatorField from '../CalculatorField';
import { currency, InputPrompt, ResultPanel } from '../ResultPanel';
import useTrackCalculator from '../useTrackCalculator';

export default function RoyaltyValueEstimator() {
  const [monthly, setMonthly] = useState('');
  const [lowMultiple, setLowMultiple] = useState('');
  const [highMultiple, setHighMultiple] = useState('');
  const valid =
    [monthly, lowMultiple, highMultiple].every(
      (v) => v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0,
    ) && Number(highMultiple) >= Number(lowMultiple);
  useTrackCalculator('royalty-value-estimator', valid);
  return (
    <>
      <div className="tool-input-grid">
        <CalculatorField
          label="Average monthly royalty income"
          prefix="$"
          value={monthly}
          onChange={setMonthly}
        />
        <CalculatorField
          label="Low annual income multiple"
          value={lowMultiple}
          onChange={setLowMultiple}
          suffix="×"
        />
        <CalculatorField
          label="High annual income multiple"
          value={highMultiple}
          onChange={setHighMultiple}
          suffix="×"
        />
      </div>
      {valid ? (
        <ResultPanel
          label="Illustrative income-multiple scenario"
          value={`${currency(Number(monthly) * 12 * Number(lowMultiple))} – ${currency(Number(monthly) * 12 * Number(highMultiple))}`}
          note="This is arithmetic based on your inputs, not a property valuation, appraisal, purchase offer, or prediction. Actual offers depend on title, production, lease, market, and other factors."
        />
      ) : (
        <InputPrompt />
      )}
    </>
  );
}
