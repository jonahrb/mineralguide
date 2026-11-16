import { getPublishedArticles } from '../lib/articles';
import { getSiteUrl } from '../lib/site';
import { tools } from '../lib/tools';

export default function sitemap() {
  const base = getSiteUrl();
  const staticRoutes = ['', '/learn', '/tools', '/privacy'].map((route) => ({
    url: `${base}${route}`,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
  const articles = getPublishedArticles().map((article) => ({
    url: `${base}/learn/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const toolRoutes = tools.map((tool) => ({
    url: `${base}/tools/${tool.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  return [...staticRoutes, ...articles, ...toolRoutes];
}
