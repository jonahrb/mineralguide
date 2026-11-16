# Mineral Guide

Next.js App Router site for mineral and royalty owners.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Lead email setup

The inquiry form posts to `/api/contact`. It sends email through Resend from the server, so API credentials are not exposed in browser code. Copy `.env.example` to `.env.local` and set:

- `RESEND_API_KEY`
- `LEAD_TO_EMAIL`
- `LEAD_FROM_EMAIL` (must be a sender/domain verified with Resend)
- `NEXT_PUBLIC_SITE_URL` (set this to the public site URL after deployment)

Add the same values in the Vercel project's Environment Variables for each environment. Until the three Resend values are set, the endpoint returns a clear configuration error and does not store submissions.

## Adding an article

Add a record in `src/content/articles.js` with a unique `slug`, category, summary, read time, `status: 'published'`, update date, and a list of section objects. A section can have `heading`, `paragraphs`, and/or `bullets`. Drafts stay in the editorial queue and do not get article routes; published records are statically generated at `/learn/[slug]`.

## Adding a tool

Add tool metadata to `src/content/tools.js`, implement its calculator UI in `ToolRunner` in `src/components/ToolsHub.jsx`, and return its slug from the available tool list. The available tool detail pages are generated at `/tools/[slug]`.
