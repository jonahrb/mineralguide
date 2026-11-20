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

## Business portal architecture

The business portal lives under `/business` in the same Next.js app and has a separate navigation shell from the public guide. It is designed for one user per business account. Supabase Auth provides email/password accounts and cookie-based server sessions; Postgres stores account data, service requests, credit packages, and an append-only credit ledger. Row Level Security scopes customer reads to the signed-in account. Submission files use a private Supabase Storage bucket. Service charges are recorded transactionally by a database function that checks the balance before creating a request. When a service fails, its credit charge can be refunded once in credits by a server-only function. A separate admin allowlist and server-checked RPCs expose customer lookup and audited credit adjustments without granting customers direct ledger write access.

Stripe Checkout sells prepaid credit packages. Credits are added only by the signed webhook after payment is verified; the webhook checks the paid amount and currency against the configured package and uses a unique checkout reference so retries cannot double-credit an account. Package prices are records in `public.credit_packages`, not hard-coded in the UI. Service pricing and availability are stored in `public.service_catalog`.

To enable business accounts and credit administration:

1. Create a Supabase project and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in local and Vercel environments. Keep the secret key server-only; the legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted.
2. Apply `supabase/migrations/202611180001_business_portal.sql` to the project's database. The migration creates account, ledger, package, service-request, RLS, and private-upload structures. The ROFR service starts disabled until its credit price and processing workflow are configured.
3. Configure Supabase Auth email settings and allow the redirect URL `/business/auth/callback` on your production domain (and local development URL).
4. Apply `supabase/migrations/202611190001_business_admin_credits.sql` after the main business portal migration. The admin allowlist can be created before any accounts exist.
5. Apply `supabase/migrations/202611190002_credit_test_service.sql` to enable the one-credit sample service. It appears on the business dashboard and validates service submission, balance deduction, and ledger history without performing research.
6. Sign up and confirm your admin email, then bootstrap your administrator once in Supabase SQL Editor:

   ```sql
   insert into public.business_admins (user_id)
   select id from auth.users where lower(email) = lower('your-email@example.com')
   on conflict (user_id) do nothing;
   ```

   Confirm the query inserts one row, then refresh the portal. Open `/business/admin` to search accounts, review ledger entries, and add or remove credits with a recorded reason.

Credit purchasing setup is optional until you are ready to use Stripe:

1. Create one-time Stripe Products and Prices for credit packages. Insert each Stripe Price ID, displayed amount, currency, and credit quantity into `public.credit_packages`; activate it only after the values match Stripe. Treat configured package rows as versioned: deactivate old rows and add a new row when a Stripe price or credit amount changes, so already completed checkouts can still be fulfilled accurately.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, then register `https://<your-domain>/api/business/credits/webhook` for `checkout.session.completed` events. Test checkout and webhook fulfillment in Stripe test mode before enabling live prices.

Account sign-up, balances, and admin credit adjustments work without Stripe after the Supabase setup steps. Credit purchases stay unavailable until Stripe and package records are configured. Service submission and deliverable workflows are represented in the database model; the ROFR processing tool itself is not implemented here.

## Formatting

Run `npm run format` to format the application and content files, or `npm run format:check` to check formatting.
