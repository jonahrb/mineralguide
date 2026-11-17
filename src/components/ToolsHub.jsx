'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  ChartNoAxesCombined,
  Layers3,
  ReceiptText,
  Scale,
  TrendingDown,
} from 'lucide-react';

const iconMap = {
  calculator: Calculator,
  chart: ChartNoAxesCombined,
  layers: Layers3,
  pulse: TrendingDown,
  receipt: ReceiptText,
  scale: Scale,
};

export default function ToolsHub({ tools }) {
  const [category, setCategory] = useState('All tools');
  const toolCategories = useMemo(
    () => ['All tools', ...new Set(tools.map((tool) => tool.category))],
    [tools],
  );
  const filtered = useMemo(
    () => tools.filter((tool) => category === 'All tools' || tool.category === category),
    [category, tools],
  );

  return (
    <main className="tools-page">
      <section className="tools-hero">
        <div className="wrap">
          <div className="eyebrow">
            <span className="eyebrow-line" /> OWNER TOOLS
          </div>
          <h1>
            Explore the numbers.
            <br />
            <em>Understand your options.</em>
          </h1>
          <p>
            Calculators, scenario tools, and decision aids designed for mineral and royalty owners.
          </p>
        </div>
      </section>
      <section className="tools-library wrap">
        <div className="tool-directory-head">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line" /> TOOL DIRECTORY
            </span>
            <h2>What would you like to figure out?</h2>
          </div>
          <span className="kb-count">{tools.length} tools</span>
        </div>
        <div className="kb-categories" aria-label="Filter tools by category">
          {toolCategories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={category === item ? 'kb-chip selected' : 'kb-chip'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="tools-grid">
          {filtered.map((tool) => {
            const Icon = iconMap[tool.icon] || Calculator;
            return (
              <Link href={`/tools/${tool.slug}`} key={tool.slug} className="tool-card">
                <div className="tool-card-top">
                  <span className="tool-tile-icon">
                    <Icon size={21} />
                  </span>
                </div>
                <span className="tool-category">{tool.category}</span>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span className="tool-card-link">
                  Open tool <ArrowUpRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
        <div className="tools-feedback">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line" /> MORE TOOLS
            </span>
            <strong>Looking for a specific calculation?</strong>
            <p>Browse the knowledge base for guidance and explainers.</p>
          </div>
          <Link href="/learn" className="button button-outline">
            Browse the knowledge base <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
