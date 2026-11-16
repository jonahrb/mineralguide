import { notFound } from 'next/navigation';
import ToolsHub from '../../../components/ToolsHub';
import { tools } from '../../../content/tools';

export const dynamicParams = false;
export function generateStaticParams() { return tools.filter((tool) => tool.status === 'available').map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug && item.status === 'available');
  return tool ? { title: tool.title, description: tool.description } : {};
}
export default async function Page({ params }) {
  const { slug } = await params;
  const tool = tools.find((item) => item.slug === slug && item.status === 'available');
  if (!tool) notFound();
  return <ToolsHub slug={slug}/>;
}
