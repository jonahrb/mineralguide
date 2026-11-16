'use client';
import { useState } from 'react';
import CalculatorField from './CalculatorField';
import { InputPrompt, ResultPanel } from './ResultPanel';

export default function NetMineralAcresCalculator() {
  const [acres, setAcres] = useState('');
  const [share, setShare] = useState('');
  const valid =
    [acres, share].every((v) => v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) &&
    Number(share) <= 100;
  const result = (Number(acres) * Number(share)) / 100;
  return (
    <>
      <div className="tool-input-grid">
        <CalculatorField label="Gross tract acres" value={acres} onChange={setAcres} />
        <CalculatorField
          label="Your ownership share"
          value={share}
          onChange={setShare}
          suffix="%"
          max="100"
        />
      </div>
      {valid ? (
        <ResultPanel
          label="Estimated net mineral acres"
          value={`${result.toLocaleString('en-US', { maximumFractionDigits: 3 })} NMA`}
          note="A simple acreage × ownership-share calculation. Deeds, title, reservations, pooling, and unit boundaries may affect the actual interest."
        />
      ) : (
        <InputPrompt />
      )}
    </>
  );
}
