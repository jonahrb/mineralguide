import KnowledgeBase from '../../components/KnowledgeBase';
import { getPublishedArticles } from '../../lib/articles';

export const metadata = {
  title: 'Learn',
  description:
    'Browse guides about mineral rights ownership, royalty income, records, and decisions.',
};

export default function Page() {
  return <KnowledgeBase articles={getPublishedArticles()} />;
}
