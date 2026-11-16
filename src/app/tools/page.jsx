import ToolsHub from '../../components/ToolsHub';
import { tools } from '../../lib/tools';

export const metadata = {
  title: 'Tools',
  description: 'Calculators, scenario tools, and decision aids for mineral and royalty owners.',
};

export default function Page() {
  return <ToolsHub tools={tools} />;
}
