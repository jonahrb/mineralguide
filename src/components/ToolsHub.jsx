 'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Calculator, ChartNoAxesCombined, CheckCircle2, Compass, Layers3, ReceiptText, TrendingDown } from 'lucide-react';
import { tools, toolCategories } from '../content/tools';

const iconMap = { chart: ChartNoAxesCombined, layers: Layers3, pulse: TrendingDown, receipt: ReceiptText, compare: Calculator, compass: Compass };
const currency = (value) => Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const ToolField = ({ label, value, onChange, prefix, suffix, min = 0, step = 'any' }) => <label className="tool-field">{label}<span className="input-wrap">{prefix && <span>{prefix}</span>}<input type="number" min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)}/>{suffix && <span className="suffix">{suffix}</span>}</span></label>;

function ToolRunner({ tool }) {
  const [monthly, setMonthly] = useState('850');
  const [multiple, setMultiple] = useState('12');
  const [grossAcres, setGrossAcres] = useState('640');
  const [ownership, setOwnership] = useState('25');
  const [decline, setDecline] = useState('15');
  const [years, setYears] = useState('5');
  const [volume, setVolume] = useState('100');
  const [price, setPrice] = useState('70');
  const [decimal, setDecimal] = useState('0.125');
  const [deductions, setDeductions] = useState('0');

  if (tool.component === 'royaltyValue') {
    const range = [Number(multiple) || 0, (Number(multiple) || 0) + 4];
    const low = Math.round((Number(monthly) || 0) * 12 * range[0] * .72);
    const high = Math.round((Number(monthly) || 0) * 12 * range[1] * .72);
    return <><div className="tool-input-grid"><ToolField label="Average monthly royalty income" prefix="$" value={monthly} onChange={setMonthly}/><ToolField label="Illustrative income multiple" value={multiple} onChange={setMultiple} suffix="years" min="1"/></div><Result label="Illustrative income-based range" value={`${currency(low)} – ${currency(high)}`} note="Uses a 72% factor as a placeholder and does not account for property-specific factors. Not an appraisal or offer."/></>;
  }
  if (tool.component === 'netAcres') {
    const result = (Number(grossAcres) || 0) * (Number(ownership) || 0) / 100;
    return <><div className="tool-input-grid"><ToolField label="Gross tract acres" value={grossAcres} onChange={setGrossAcres}/><ToolField label="Your ownership share" value={ownership} onChange={setOwnership} suffix="%"/></div><Result label="Estimated net mineral acres" value={`${result.toLocaleString('en-US', { maximumFractionDigits: 3 })} NMA`} note="Simple acreage × ownership-share calculation. Deeds, leases, pooling, and title records may affect the actual interest."/></>;
  }
  if (tool.component === 'incomeProjection') {
    const start = Number(monthly) || 0, d = Math.max(0, Math.min(100, Number(decline) || 0)) / 100, n = Math.max(1, Math.min(50, Number(years) || 1));
    const projected = Array.from({ length: n }, (_, index) => start * 12 * ((1 - d) ** (index + 1))).reduce((sum, year) => sum + year, 0);
    const end = start * ((1 - d) ** n);
    return <><div className="tool-input-grid"><ToolField label="Current monthly royalty income" prefix="$" value={monthly} onChange={setMonthly}/><ToolField label="Assumed annual decline" value={decline} onChange={setDecline} suffix="%"/></div><div className="tool-input-grid one-field"><ToolField label="Projection period" value={years} onChange={setYears} suffix="years" min="1" step="1"/></div><Result label={`Illustrative total over ${n} years`} value={currency(projected)} note={`At the selected decline, year ${n} monthly income would be about ${currency(end)}. This simple scenario holds prices and ownership constant; actual income can vary.`}/></>;
  }
  const gross = (Number(volume) || 0) * (Number(price) || 0) * (Number(decimal) || 0);
  const net = gross - (Number(deductions) || 0);
  return <><div className="tool-input-grid"><ToolField label="Reported production volume" value={volume} onChange={setVolume} suffix="units"/><ToolField label="Price per unit" prefix="$" value={price} onChange={setPrice}/><ToolField label="Royalty decimal" value={decimal} onChange={setDecimal} step="0.001"/><ToolField label="Deductions shown" prefix="$" value={deductions} onChange={setDeductions}/></div><Result label="Simple estimated net amount" value={currency(net)} note={`Estimated gross revenue share: ${currency(gross)}. This simplified check omits contract terms, product mix, adjustments, timing, and other statement details.`}/></>;
}

function Result({ label, value, note }) { return <div className="tool-result"><span>{label}</span><strong>{value}</strong><p>{note}</p></div>; }

export default function ToolsHub({ slug }) {
  const [category, setCategory] = useState('All tools');
  const activeTool = tools.find((tool) => tool.slug === slug);
  const filtered = useMemo(() => tools.filter((tool) => category === 'All tools' || tool.category === category), [category]);
  if (activeTool) {
    const Icon = iconMap[activeTool.icon] || Calculator;
    return <main className="tools-page"><section className="tool-detail wrap"><Link href="/tools" className="back-link">← All tools</Link><div className="tool-detail-head"><div className="tool-tile-icon"><Icon size={25}/></div><div><span className="tool-category">{activeTool.category}</span><h1>{activeTool.title}</h1></div></div><p className="tool-detail-intro">{activeTool.description}</p><div className="tool-runner"><div className="tool-runner-head"><div><span className="eyebrow"><span className="eyebrow-line"/> INTERACTIVE ESTIMATOR</span><h2>Enter your assumptions</h2></div><span className="live-pill"><i/> LIVE</span></div><ToolRunner tool={activeTool}/></div><div className="tool-detail-note"><CheckCircle2 size={17}/><span>This tool is for education and scenario exploration. It is not legal, tax, investment, lending, appraisal, or purchase advice.</span></div></section></main>;
  }
  return <main className="tools-page"><section className="tools-hero"><div className="wrap"><div className="eyebrow"><span className="eyebrow-line"/> OWNER TOOLS</div><h1>Explore the numbers.<br/><em>Understand your options.</em></h1><p>Calculators, scenario tools, and decision aids designed for mineral and royalty owners.</p></div></section><section className="tools-library wrap"><div className="tool-directory-head"><div><span className="eyebrow"><span className="eyebrow-line"/> TOOL DIRECTORY</span><h2>What would you like to figure out?</h2></div><span className="kb-count">{tools.filter((tool) => tool.status === 'available').length} available · {tools.filter((tool) => tool.status !== 'available').length} planned</span></div><div className="kb-categories">{toolCategories.map((item) => <button key={item} className={category === item ? 'kb-chip selected' : 'kb-chip'} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="tools-grid">{filtered.map((tool) => { const Icon = iconMap[tool.icon] || Calculator; const card = <><div className="tool-card-top"><span className="tool-tile-icon"><Icon size={21}/></span><span className={tool.status === 'available' ? 'tool-status ready' : 'tool-status planned'}>{tool.status === 'available' ? 'AVAILABLE' : 'PLANNED'}</span></div><span className="tool-category">{tool.category}</span><h3>{tool.title}</h3><p>{tool.description}</p><span className="tool-card-link">{tool.status === 'available' ? <>Open tool <ArrowUpRight size={15}/></> : <>In the roadmap <ArrowRight size={15}/></>}</span></>; return tool.status === 'available' ? <Link href={`/tools/${tool.slug}`} key={tool.slug} className="tool-card">{card}</Link> : <div key={tool.slug} className="tool-card planned-card">{card}</div>; })}</div><div className="tools-feedback"><div><span className="eyebrow"><span className="eyebrow-line"/> WHAT'S NEXT</span><strong>Have a tool in mind?</strong><p>New tools can be added as standalone modules without changing this directory.</p></div><Link href="/learn" className="button button-outline">Browse the knowledge base <ArrowRight size={16}/></Link></div></section></main>;
}
