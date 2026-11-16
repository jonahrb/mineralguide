import { notFound } from 'next/navigation';
import ArticlePage from '../../../components/ArticlePage';
import { getPublishedArticle, getPublishedArticles } from '../../../lib/articles';

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
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
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
