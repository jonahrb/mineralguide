import { notFound } from 'next/navigation';
import ToolDetail from '../../../components/ToolDetail';
import { getTool, tools } from '../../../lib/tools';

export const dynamicParams = false;
export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  return tool ? { title: tool.title, description: tool.description } : {};
}
export default async function Page({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const { default: Tool } = await import(`../../../components/tools/${slug}/Tool.jsx`);
  return (
    <ToolDetail tool={tool}>
      <Tool />
    </ToolDetail>
  );
}
