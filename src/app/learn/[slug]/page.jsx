import { notFound } from 'next/navigation';
import ArticlePage from '../../../components/ArticlePage';
import { articles } from '../../../content/articles';

export const dynamicParams = false;
export function generateStaticParams() { return articles.filter((article) => article.status === 'published').map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug && item.status === 'published');
  return article ? { title: article.title, description: article.summary } : {};
}
export default async function Page({ params }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug && item.status === 'published');
  if (!article) notFound();
  return <ArticlePage article={article}/>;
}
