import HomePage from '../components/HomePage';
import { getFeaturedArticles } from '../lib/articles';

export const metadata = {
  title: 'Make sense of what you own',
  description:
    'Clear answers about mineral rights, royalty income, and options for mineral owners.',
};

export default function Page() {
  return <HomePage featuredArticles={getFeaturedArticles()} />;
}
