import { notFound } from 'next/navigation';
import ToolsHub from '../../../components/ToolsHub';
import { tools } from '../../../content/tools';

export const dynamicParams = false;
export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  return tool ? { title: tool.title, description: tool.description } : {};
}
export default async function Page({ params }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) notFound();
  return <ToolsHub slug={slug} />;
}
