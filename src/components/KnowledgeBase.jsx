'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Search } from 'lucide-react';
export default function KnowledgeBase({ articles }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All topics');
  const articleCategories = ['All topics', ...new Set(articles.map((article) => article.category))];
  const visible = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory = category === 'All topics' || article.category === category;
        const text =
          `${article.title} ${article.description} ${article.category} ${article.tags.join(' ')}`.toLowerCase();
        return matchesCategory && text.includes(query.toLowerCase());
      }),
    [category, query],
  );

  return (
    <main className="kb-page">
      <section className="kb-hero">
        <div className="wrap">
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE MINERAL OWNER KNOWLEDGE BASE
          </div>
          <h1>
            Clear answers.
            <br />
            <em>One guide at a time.</em>
          </h1>
          <p>
            A growing library for understanding ownership, royalties, records, and your options.
          </p>
          <label className="kb-search">
            <Search size={18} />
            <input
              aria-label="Search guides"
              placeholder="Search topics, questions, and guides"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>SEARCH</kbd>
          </label>
        </div>
      </section>
      <section className="kb-library wrap">
        <div className="kb-library-head">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line" /> BROWSE THE LIBRARY
            </span>
            <h2>Guides for mineral owners</h2>
          </div>
          <span className="kb-count">{articles.length} guides</span>
        </div>
        <div className="kb-categories">
          {articleCategories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? 'kb-chip selected' : 'kb-chip'}
            >
              {item}
            </button>
          ))}
        </div>
        {visible.length > 0 && (
          <div className="kb-grid">
            {visible.map((article) => (
              <Link key={article.slug} href={`/learn/${article.slug}`} className="kb-card">
                <div className="kb-card-icon">
                  <BookOpen size={20} />
                </div>
                <span className="kb-card-category">{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <span className="kb-card-footer">
                  {article.readTime} min read <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        )}
        {visible.length === 0 && (
          <div className="empty-state">
            No guides match that search. Try another phrase or topic.
          </div>
        )}
        <div className="kb-contribute">
          <div>
            <span>FOR MINERAL OWNERS</span>
            <strong>Not sure what to read first?</strong>
            <p>Start with ownership basics, then follow the questions that come up.</p>
          </div>
          <Link className="button button-primary" href="/tools">
            Explore owner tools <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
