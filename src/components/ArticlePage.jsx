import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticlePage({ article }) {
  return (
    <main className="kb-article wrap">
      <Link className="back-link" href="/learn">
        <ArrowLeft size={15} /> All guides
      </Link>
      <div className="eyebrow">
        <span className="eyebrow-line" /> {article.category.toUpperCase()}
      </div>
      <h1>{article.title}</h1>
      <div className="kb-byline">
        <Clock3 size={14} /> {article.readTime} min read <span>·</span> Updated{' '}
        {article.updatedAt || article.publishedAt}
      </div>
      <p className="kb-summary">{article.description}</p>
      <div className="article-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>
      {article.tags.length > 0 && (
        <div className="article-tags" aria-label="Article topics">
          {article.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {article.sources.length > 0 && (
        <section className="article-sources">
          <h2>Sources</h2>
          <ul>
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
