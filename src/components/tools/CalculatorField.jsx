'use client';

export default function CalculatorField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 'any',
}) {
  return (
    <label className="tool-field">
      {label}
      <span className="input-wrap">
        {prefix && <span>{prefix}</span>}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </span>
    </label>
  );
}
