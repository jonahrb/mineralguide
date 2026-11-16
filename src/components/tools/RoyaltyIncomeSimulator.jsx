'use client';
import { useState } from 'react';
import CalculatorField from './CalculatorField';
import { currency, InputPrompt, ResultPanel } from './ResultPanel';
import useTrackCalculator from './useTrackCalculator';

export default function RoyaltyIncomeSimulator() {
  const [monthly, setMonthly] = useState('');
  const [decline, setDecline] = useState('');
  const [years, setYears] = useState('');
  const valid =
    monthly !== '' &&
    decline !== '' &&
    years !== '' &&
    Number(monthly) >= 0 &&
    Number(decline) >= 0 &&
    Number(decline) <= 100 &&
    Number(years) >= 1 &&
    Number(years) <= 50;
  useTrackCalculator('royalty-income-simulator', valid);
  const n = Math.floor(Number(years));
  const d = Number(decline) / 100;
  const total = Array.from({ length: n }, (_, i) => Number(monthly) * 12 * (1 - d) ** i).reduce(
    (sum, value) => sum + value,
    0,
  );
  const endMonthly = Number(monthly) * (1 - d) ** n;
  return (
    <>
      <div className="tool-input-grid">
        <CalculatorField
          label="Current monthly royalty income"
          prefix="$"
          value={monthly}
          onChange={setMonthly}
        />
        <CalculatorField
          label="Assumed annual decline"
          value={decline}
          onChange={setDecline}
          suffix="%"
          max="100"
        />
      </div>
      <div className="tool-input-grid one-field">
        <CalculatorField
          label="Projection period"
          value={years}
          onChange={setYears}
          suffix="years"
          min="1"
          max="50"
          step="1"
        />
      </div>
      {valid ? (
        <ResultPanel
          label={`Illustrative total over ${n} years`}
          value={currency(total)}
          note={`Assumes the current monthly income continues for year one and declines by ${decline}% each year after that. Year ${n + 1} run-rate monthly income would be about ${currency(endMonthly)}. Prices, ownership, and production can change.`}
        />
      ) : (
        <InputPrompt />
      )}
    </>
  );
}
