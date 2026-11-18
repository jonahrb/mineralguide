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
2. Fill in the YAML frontmatter: `title`, `description`, `author`, `category`, `status`, `publishedAt`, `updatedAt`, `featured`, and `tags`.
3. Write the article in Markdown. Add source links in the frontmatter `sources` list and cite them near the claims they support in the body. The article page displays that list once automatically; do not add a second Sources section to the Markdown body.
4. Use `status: draft` while editing. Drafts do not appear publicly or get a route. Set `status: published` when ready.
5. Run `npm run build` before publishing. Article pages and the sitemap are generated from published files.

The loader in `src/lib/articles.js` validates required metadata and dates. Underscore-prefixed Markdown files are reserved for templates and excluded from the article list.

## Analytics

The root layout includes Vercel Web Analytics for page views across the site. Enable Web Analytics in the Vercel project dashboard and deploy the change to begin collecting data. The inquiry flow emits `Lead Form Opened` and `Lead Form Submitted` custom events with only the selected inquiry type; calculators emit `Calculator Used` once per loaded calculator when its inputs produce a result. These events never include form values or calculator inputs. Custom-event availability depends on the Vercel plan.

## Search visibility

Set `GOOGLE_SITE_VERIFICATION` to the verification token from Google Search Console, deploy, and complete site verification. Then submit the site's `/sitemap.xml` URL and inspect important published pages, including the sell-vs-loan guide. Search Console helps monitor query impressions and indexing; it does not guarantee rankings or AI-feature inclusion.

## Adding a tool

Create a folder at `src/components/tools/<tool-slug>/` containing `tool.json` and `Tool.jsx`. The folder name must be a lowercase kebab-case slug and match the `slug` in `tool.json`. The JSON file defines `title`, `category`, `description`, `icon`, and optional numeric `order`; `icon` can be `calculator`, `chart`, `layers`, `pulse`, `receipt`, or `scale`. Optional `pageHeading`, `seoTitle`, and `seoDescription` fields customize a tool's landing page. Add an optional `guide.md` in the same folder for crawlable explanatory content below the calculator; it is rendered automatically. A missing `status` means published; set `"status": "draft"` to keep a tool out of public routes until it is ready. The React component in `Tool.jsx` is the tool UI. Shared input/result components and analytics tracking are available from the parent `src/components/tools/` folder. Published tool folders are discovered automatically and included in the directory, static routes, and sitemap—no central registry edits are needed.

## Formatting

Run `npm run format` to format the application and content files, or `npm run format:check` to check formatting.
