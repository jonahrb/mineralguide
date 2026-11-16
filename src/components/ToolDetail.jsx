import Link from 'next/link';
import {
  Calculator,
  ChartNoAxesCombined,
  Info,
  Layers3,
  ReceiptText,
  Scale,
  TrendingDown,
} from 'lucide-react';

const iconMap = {
  chart: ChartNoAxesCombined,
  layers: Layers3,
  pulse: TrendingDown,
  receipt: ReceiptText,
  scale: Scale,
};

export default function ToolDetail({ tool, children }) {
  const Icon = iconMap[tool.icon] || Calculator;

  return (
    <main className="tools-page">
      <section className="tool-detail wrap">
        <Link href="/tools" className="back-link">
          ← All tools
        </Link>
        <div className="tool-detail-head">
          <div className="tool-tile-icon">
            <Icon size={25} />
          </div>
          <div>
            <span className="tool-category">{tool.category}</span>
            <h1>{tool.title}</h1>
          </div>
        </div>
        <p className="tool-detail-intro">{tool.description}</p>
        <div className="tool-runner">
          <div className="tool-runner-head">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-line" /> INTERACTIVE TOOL
              </span>
              <h2>Enter your assumptions</h2>
            </div>
          </div>
          {children}
        </div>
        <div className="tool-detail-note">
          <Info size={17} aria-hidden="true" />
          <span>
            For education and scenario exploration only. This tool does not provide legal, tax,
            investment, lending, appraisal, or purchase advice.
          </span>
        </div>
      </section>
    </main>
  );
}
