export const currency = (value) =>
  Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

export function ResultPanel({ label, value, note }) {
  return (
    <div className="tool-result">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

export function InputPrompt() {
  return (
    <div className="tool-result">
      <span>Your estimate</span>
      <strong>Enter your assumptions</strong>
      <p>Results update when the required fields contain valid values.</p>
    </div>
  );
}
