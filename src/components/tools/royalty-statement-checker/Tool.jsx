'use client';
import { useState } from 'react';
import CalculatorField from '../CalculatorField';
import { currency, InputPrompt, ResultPanel } from '../ResultPanel';
import useTrackCalculator from '../useTrackCalculator';

export default function ProductionRevenueCheck() {
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [decimal, setDecimal] = useState('');
  const [deductions, setDeductions] = useState('');
  const values = [volume, price, decimal, deductions];
  const valid =
    values.every((v) => v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) &&
    Number(decimal) <= 1;
  useTrackCalculator('royalty-statement-checker', valid);
  const gross = Number(volume) * Number(price) * Number(decimal);
  const net = gross - Number(deductions);
  return (
    <>
      <div className="tool-input-grid">
        <CalculatorField
          label="Reported production volume"
          value={volume}
          onChange={setVolume}
          suffix="units"
        />
        <CalculatorField label="Price per unit" prefix="$" value={price} onChange={setPrice} />
        <CalculatorField
          label="Royalty decimal"
          value={decimal}
          onChange={setDecimal}
          min="0"
          max="1"
          step="0.001"
        />
        <CalculatorField
          label="Deductions shown"
          prefix="$"
          value={deductions}
          onChange={setDeductions}
        />
      </div>
      {valid ? (
        <ResultPanel
          label="Simple estimated net amount"
          value={currency(net)}
          note={`Estimated gross revenue share: ${currency(gross)}. This omits contract terms, product mix, adjustments, timing, and other statement details; it is not an audit.`}
        />
      ) : (
        <InputPrompt />
      )}
    </>
  );
}
