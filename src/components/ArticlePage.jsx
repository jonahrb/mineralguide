import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSiteUrl } from '../lib/site';

export default function ArticlePage({ article }) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(`/learn/${article.slug}`, siteUrl).toString();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mineral Guide',
      url: siteUrl,
    },
    articleSection: article.category,
    keywords: article.tags.join(', '),
    inLanguage: 'en-US',
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };

  return (
    <main className="kb-article wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <Link className="back-link" href="/learn">
        <ArrowLeft size={15} /> All guides
      </Link>
      <div className="eyebrow">
        <span className="eyebrow-line" /> {article.category.toUpperCase()}
      </div>
      <h1>{article.title}</h1>
      <div className="kb-byline">
        <Clock3 size={14} /> Published by {article.author} <span>·</span> Published{' '}
        <time dateTime={article.publishedAt}>{article.publishedAt}</time> <span>·</span> Updated{' '}
        <time dateTime={article.updatedAt || article.publishedAt}>
          {article.updatedAt || article.publishedAt}
        </time>{' '}
        <span>·</span> {article.readTime} min read
      </div>
      <p className="kb-summary">{article.description}</p>
      <div className="article-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ node, children, ...props }) => (
              <div
                className="article-table-scroll"
                role="region"
                aria-label="Scrollable comparison table"
                tabIndex={0}
              >
                <table {...props}>{children}</table>
              </div>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
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
