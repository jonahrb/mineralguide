import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content', 'articles');
const wordCount = (content) => content.trim().split(/\s+/).filter(Boolean).length;
const readingTime = (content) => Math.max(1, Math.ceil(wordCount(content) / 220));

function normalizeDate(value, field, filename) {
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
    throw new Error(`Article ${filename} needs a valid ${field} date in YYYY-MM-DD format.`);
  }
  return date;
}

function readArticle(filename) {
  const slug = filename.replace(/\.md$/, '');
  const parsed = matter(readFileSync(path.join(articlesDirectory, filename), 'utf8'));
  const {
    title,
    description,
    category,
    status = 'draft',
    publishedAt,
    updatedAt,
    featured = false,
    tags = [],
    sources = [],
  } = parsed.data;
  if (!title || !description || !category) {
    throw new Error(
      `Article ${filename} must define title, description, and category in its frontmatter.`,
    );
  }
  if (!['draft', 'published'].includes(status)) {
    throw new Error(`Article ${filename} status must be either "draft" or "published".`);
  }
  if (!Array.isArray(tags) || !Array.isArray(sources)) {
    throw new Error(`Article ${filename} tags and sources must be lists.`);
  }

  return {
    slug,
    title,
    description,
    category,
    status,
    publishedAt: publishedAt ? normalizeDate(publishedAt, 'publishedAt', filename) : null,
    updatedAt: updatedAt ? normalizeDate(updatedAt, 'updatedAt', filename) : null,
    featured: Boolean(featured),
    tags: tags.map(String),
    sources,
    readTime: readingTime(parsed.content),
    content: parsed.content.trim(),
  };
}

function readAllArticles() {
  return readdirSync(articlesDirectory)
    .filter((filename) => filename.endsWith('.md') && !filename.startsWith('_'))
    .map(readArticle)
    .sort(
      (a, b) =>
        (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.title.localeCompare(b.title),
    );
}

function toListing(article) {
  const { content, sources, ...listing } = article;
  return listing;
}

export function getPublishedArticles() {
  return readAllArticles()
    .filter((article) => article.status === 'published')
    .map(toListing);
}

export function getFeaturedArticles(limit = 3) {
  const published = readAllArticles().filter((article) => article.status === 'published');
  const featured = published.filter((article) => article.featured);
  return (featured.length ? featured : published).slice(0, limit).map(toListing);
}

export function getPublishedArticle(slug) {
  const article = readAllArticles().find(
    (item) => item.slug === slug && item.status === 'published',
  );
  return article || null;
}
