// Tool records drive the directory. Add a new record and a matching renderer to extend it.
export const tools = [
  { slug: 'royalty-value-estimator', title: 'Royalty value estimator', category: 'Valuation', description: 'Explore an illustrative income-multiple range from monthly royalty income.', icon: 'chart', status: 'available', component: 'royaltyValue' },
  { slug: 'net-mineral-acres', title: 'Net mineral acres calculator', category: 'Ownership', description: 'Estimate your net mineral acres from gross acreage and your ownership share.', icon: 'layers', status: 'available', component: 'netAcres' },
  { slug: 'royalty-income-simulator', title: 'Royalty income simulator', category: 'Planning', description: 'Explore how a chosen annual decline assumption changes future royalty income.', icon: 'pulse', status: 'available', component: 'incomeProjection' },
  { slug: 'royalty-statement-checker', title: 'Royalty statement checker', category: 'Royalties', description: 'Compare reported revenue with a simple volume, price, and decimal-interest estimate.', icon: 'receipt', status: 'available', component: 'statementCheck' },
  { slug: 'offer-comparison', title: 'Offer comparison worksheet', category: 'Decision support', description: 'Organize the terms and assumptions behind multiple purchase offers.', icon: 'compare', status: 'planned', component: null },
  { slug: 'inheritance-next-steps', title: 'Inherited rights next-step guide', category: 'Decision support', description: 'A guided set of questions to help organize records and identify next steps.', icon: 'compass', status: 'planned', component: null },
];

export const toolCategories = ['All tools', ...new Set(tools.map((tool) => tool.category))];
