import { notFound } from 'next/navigation';
import ArticlePage from '../../../components/ArticlePage';
import { getPublishedArticle, getPublishedArticles } from '../../../lib/articles';
import { getSiteUrl } from '../../../lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return getPublishedArticles().map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getPublishedArticle(slug);
  return article
    ? {
        title: article.title,
        description: article.description,
        alternates: { canonical: `/learn/${article.slug}` },
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
          url: new URL(`/learn/${article.slug}`, getSiteUrl()).toString(),
          publishedTime: article.publishedAt,
          modifiedTime: article.updatedAt || article.publishedAt,
        },
      }
    : {};
}
export default async function Page({ params }) {
  const { slug } = await params;
  const article = getPublishedArticle(slug);
  if (!article) notFound();
  return <ArticlePage article={article} />;
}
