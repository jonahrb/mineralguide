# Mineral Guide

Next.js App Router site for mineral and royalty owners.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Lead email setup

The inquiry form posts to `/api/contact` and sends email through server-side SMTP. Credentials are not exposed in browser code. Copy `.env.example` to `.env.local` and set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEAD_TO_EMAIL`, and optionally `FROM_EMAIL`. Set `NEXT_PUBLIC_SITE_URL` to the public site URL. Add the same required values in the Vercel project's Environment Variables. The endpoint returns a configuration error when email is not configured and does not save submissions in a website database.

## Publishing an article

1. Copy `content/articles/_TEMPLATE.md` to a new Markdown file in `content/articles/`. The filename becomes the URL slug.
2. Fill in the YAML frontmatter: `title`, `description`, `category`, `status`, `publishedAt`, `updatedAt`, `featured`, and `tags`.
3. Write the article in Markdown. Add source links in `sources` and cite them near the claims they support.
4. Use `status: draft` while editing. Drafts do not appear publicly or get a route. Set `status: published` when ready.
5. Run `npm run build` before publishing. Article pages and the sitemap are generated from published files.

The loader in `src/lib/articles.js` validates required metadata and dates. Underscore-prefixed Markdown files are reserved for templates and excluded from the article list.

## Adding a tool

Add a metadata record to `src/content/tools.js`, create a standalone calculator component under `src/components/tools/`, then register it in the `runnerMap` in `src/components/ToolsHub.jsx`. Tool detail routes, navigation cards, and sitemap entries are generated from the metadata list.

## Formatting

Run `npm run format` to format the application and content files, or `npm run format:check` to check formatting.
