import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const toolsDirectory = path.join(process.cwd(), 'src', 'components', 'tools');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const supportedIcons = new Set(['calculator', 'chart', 'layers', 'pulse', 'receipt', 'scale']);

function loadTool(folderName) {
  const toolDirectory = path.join(toolsDirectory, folderName);
  const metadataPath = path.join(toolDirectory, 'tool.json');
  if (!existsSync(metadataPath)) return null;

  let metadata;
  try {
    metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
  } catch (error) {
    throw new Error(`Tool folder "${folderName}" has invalid tool.json: ${error.message}`);
  }

  const {
    slug,
    title,
    category,
    description,
    icon,
    order = 1000,
    status = 'published',
    pageHeading,
    seoTitle,
    seoDescription,
  } = metadata;
  if (!slugPattern.test(folderName) || slug !== folderName) {
    throw new Error(
      `Tool folder "${folderName}" must use the same valid kebab-case slug in tool.json.`,
    );
  }
  if (
    ![title, category, description, icon].every(
      (value) => typeof value === 'string' && value.trim(),
    )
  ) {
    throw new Error(
      `Tool "${slug}" must define non-empty title, category, description, and icon fields.`,
    );
  }
  if (!supportedIcons.has(icon)) {
    throw new Error(
      `Tool "${slug}" uses unsupported icon "${icon}". Choose: ${[...supportedIcons].join(', ')}.`,
    );
  }
  if (!['published', 'draft'].includes(status)) {
    throw new Error(`Tool "${slug}" status must be "published" or "draft".`);
  }
  if (!Number.isFinite(order)) {
    throw new Error(`Tool "${slug}" order must be a number.`);
  }
  for (const [field, value] of Object.entries({ pageHeading, seoTitle, seoDescription })) {
    if (value !== undefined && (typeof value !== 'string' || !value.trim())) {
      throw new Error(`Tool "${slug}" ${field} must be a non-empty string when provided.`);
    }
  }

  if (status === 'published' && !existsSync(path.join(toolDirectory, 'Tool.jsx'))) {
    throw new Error(`Published tool "${slug}" needs a Tool.jsx component in its folder.`);
  }

  return {
    slug,
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    pageHeading: pageHeading?.trim(),
    seoTitle: seoTitle?.trim(),
    seoDescription: seoDescription?.trim(),
    icon,
    order,
    status,
  };
}

export const tools = readdirSync(toolsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => loadTool(entry.name))
  .filter((tool) => tool?.status === 'published')
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export function getTool(slug) {
  return tools.find((tool) => tool.slug === slug) || null;
}

export function getToolGuide(slug) {
  if (!getTool(slug)) return null;
  const guidePath = path.join(toolsDirectory, slug, 'guide.md');
  return existsSync(guidePath) ? readFileSync(guidePath, 'utf8').trim() : null;
}
