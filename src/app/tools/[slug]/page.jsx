import { notFound } from 'next/navigation';
import ToolDetail from '../../../components/ToolDetail';
import { getTool, getToolGuide, tools } from '../../../lib/tools';

export const dynamicParams = false;
export function generateStaticParams() {
  return tools.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  return tool
    ? {
        title: tool.seoTitle || tool.title,
        description: tool.seoDescription || tool.description,
        alternates: { canonical: `/tools/${tool.slug}` },
      }
    : {};
}
export default async function Page({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const { default: Tool } = await import(`../../../components/tools/${slug}/Tool.jsx`);
  const guide = getToolGuide(slug);
  return (
    <ToolDetail tool={tool} guide={guide}>
      <Tool />
    </ToolDetail>
  );
}
