// Add one record per guide. Keep drafts hidden from readers until their copy is reviewed.
// Published article body can use short paragraphs, subheads, lists, and source links.
export const articles = [
  { slug: 'mineral-rights-vs-surface-rights', title: 'Mineral rights vs. surface rights', category: 'Ownership basics', summary: 'A plain-language guide to the difference between owning the surface and owning the minerals beneath it.', readTime: 8, status: 'draft', updatedAt: '', sections: [] },
  { slug: 'how-to-read-a-royalty-statement', title: 'How to read an oil and gas royalty statement', category: 'Royalties & payments', summary: 'Learn the common line items and questions to ask when reviewing a royalty statement.', readTime: 6, status: 'draft', updatedAt: '', sections: [] },
  { slug: 'inherited-mineral-rights-checklist', title: 'Inherited mineral rights: a first-step checklist', category: 'Inheritance & records', summary: 'A practical starting checklist for gathering records and figuring out what needs attention.', readTime: 10, status: 'draft', updatedAt: '', sections: [] },
];

export const articleCategories = ['All topics', ...new Set(articles.map((article) => article.category))];
