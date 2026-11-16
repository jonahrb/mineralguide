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
  TrendingDown,
} from 'lucide-react';
import { tools, toolCategories } from '../content/tools';
import RoyaltyValueEstimator from './tools/RoyaltyValueEstimator';
import NetMineralAcresCalculator from './tools/NetMineralAcresCalculator';
import RoyaltyIncomeSimulator from './tools/RoyaltyIncomeSimulator';
import ProductionRevenueCheck from './tools/ProductionRevenueCheck';

const iconMap = {
  chart: ChartNoAxesCombined,
  layers: Layers3,
  pulse: TrendingDown,
  receipt: ReceiptText,
};
const runnerMap = {
  royaltyValue: RoyaltyValueEstimator,
  netAcres: NetMineralAcresCalculator,
  incomeProjection: RoyaltyIncomeSimulator,
  statementCheck: ProductionRevenueCheck,
};

export default function ToolsHub({ slug }) {
  const [category, setCategory] = useState('All tools');
  const activeTool = tools.find((tool) => tool.slug === slug);
  const filtered = useMemo(
    () => tools.filter((tool) => category === 'All tools' || tool.category === category),
    [category],
  );

  if (activeTool) {
    const Icon = iconMap[activeTool.icon] || Calculator;
    const Runner = runnerMap[activeTool.component];
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
              <span className="tool-category">{activeTool.category}</span>
              <h1>{activeTool.title}</h1>
            </div>
          </div>
          <p className="tool-detail-intro">{activeTool.description}</p>
          <div className="tool-runner">
            <div className="tool-runner-head">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-line" /> INTERACTIVE TOOL
                </span>
                <h2>Enter your assumptions</h2>
              </div>
            </div>
            {Runner ? <Runner /> : <p>This tool is being prepared.</p>}
          </div>
          <div className="tool-detail-note">
            <span aria-hidden="true">ⓘ</span>
            <span>
              For education and scenario exploration only. This tool does not provide legal, tax,
              investment, lending, appraisal, or purchase advice.
            </span>
          </div>
        </section>
      </main>
    );
  }

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
