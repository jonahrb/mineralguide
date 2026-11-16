import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';

export default function ArticlePage({ article }) {
  return <main className="kb-article wrap"><Link className="back-link" href="/learn"><ArrowLeft size={15}/> All guides</Link><div className="eyebrow"><span className="eyebrow-line"/> {article.category.toUpperCase()}</div><h1>{article.title}</h1><div className="kb-byline"><Clock3 size={14}/> {article.readTime} min read{article.updatedAt && ` · Updated ${article.updatedAt}`}</div><p className="kb-summary">{article.summary}</p>
    {(article.sections || []).map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets?.length > 0 && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
  </main>;
}
