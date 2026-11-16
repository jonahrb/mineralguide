// Add one metadata record and one renderer in src/components/tools to publish a tool.
export const tools = [
  {
    slug: 'sell-vs-loan',
    title: 'Sell vs. loan decision planner',
    category: 'Decision support',
    description: 'Compare cash offers, loan payments, and future royalty income side by side.',
    icon: 'scale',
    component: 'sellVsLoan',
  },
  {
    slug: 'royalty-value-estimator',
    title: 'Royalty income multiple scenario',
    category: 'Valuation',
    description: 'Explore how selected income multiples translate into an illustrative range.',
    icon: 'chart',
    component: 'royaltyValue',
  },
  {
    slug: 'net-mineral-acres',
    title: 'Net mineral acres calculator',
    category: 'Ownership',
    description: 'Estimate net mineral acres from gross acreage and an ownership share.',
    icon: 'layers',
    component: 'netAcres',
  },
  {
    slug: 'royalty-income-simulator',
    title: 'Royalty income simulator',
    category: 'Planning',
    description: 'Explore how a selected annual decline assumption changes future income.',
    icon: 'pulse',
    component: 'incomeProjection',
  },
  {
    slug: 'royalty-statement-checker',
    title: 'Production revenue check',
    category: 'Royalties',
    description: 'Compare a simple production and price estimate with reported revenue.',
    icon: 'receipt',
    component: 'statementCheck',
  },
];

export const toolCategories = ['All tools', ...new Set(tools.map((tool) => tool.category))];
