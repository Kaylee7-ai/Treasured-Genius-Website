# Treasured Genius — The Art of Giving

A responsive Next.js website for Treasured Genius, an Accra craft and printing shop. The site combines a public service and sample gallery with custom gift enquiries and a private owner workspace.

## What's included

### Public website
- Emerald and gold visual identity with a photorealistic rotating gift-box hero.
- Business information for custom designs, printing and craft work.
- A public gallery of owner-approved products and sample gifts.
- Search and category filtering.
- A guided custom request form with separate descriptions for “Something else” and “My own artwork”.
- Optional customer photograph, logo or artwork attachments.
- Customer reference numbers and WhatsApp follow-up.

### Private owner workspace
- Email/password sign-in restricted to an owner email allowlist.
- Overview metrics and recent custom requests.
- Customer request details, private artwork access, quotations, staff notes and workflow statuses.
- Product/sample gallery management, multiple image uploads, pricing mode, availability and personalisation options.
- Business settings for public contact details, opening hours, delivery information, services and NFC mobile payment availability.
- Owner workspace refreshes its server-rendered data every minute.

### Security and data
- Supabase Row Level Security restricts owner data to authorised owner accounts.
- Customer artwork is stored in a private Storage bucket and is never exposed through a public URL.
- Artwork is uploaded by the server after file type, size and request validation. Public visitors cannot upload directly to the private bucket.
- A server-side rate limit helps reduce repeated automated custom requests.
- Optional email notification for new enquiries through Resend.
- Vercel Web Analytics integration for page views and visitor trends.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

Run the checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Supabase setup — required for the connected store

**Create a dedicated Supabase project for Treasured Genius.** Do not reuse a database belonging to another shop or project. The website stores customers' contact information and private design files, so it must have its own database and access controls.

1. Create a new project in the Supabase dashboard.
2. In the project SQL Editor, open and run the complete migration file: `supabase/migrations/202611130001_treasured_genius_store.sql`.
3. In **Authentication → Users**, create the owner account using an email address controlled by the business.
4. Add that exact owner email to the `owner_emails` setting. Run the following SQL after replacing the example email:

   ```sql
   insert into public.settings (key, value)
   values ('owner_emails', jsonb_build_array('owner@example.com'))
   on conflict (key) do update
     set value = excluded.value,
         updated_at = now();
   ```

5. In **Project Settings → API Keys**, copy the project URL, a publishable key and a server-only secret key. The legacy service-role key is supported as a fallback, but a new secret key is preferred.
6. Add the environment variables below to Vercel and your local `.env.local`. Redeploy after changing Vercel environment variables.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dedicated Treasured Genius project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public, low-privilege Supabase key |
| `SUPABASE_SECRET_KEY` | Server-only key for validated request intake and private uploads |
| `STORE_OWNER_EMAILS` | Comma-separated authorised owner email addresses |
| `CUSTOM_REQUEST_RATE_LIMIT_SECRET` | Optional random secret used to hash request-source identifiers |
| `RESEND_API_KEY` | Optional Resend API key for new-request emails |
| `RESEND_FROM_EMAIL` | Optional verified sender address for Resend |
| `STORE_OWNER_NOTIFICATION_EMAIL` | Optional mailbox for new-request notifications |

Legacy fallbacks are also supported: `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

**Never** expose `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable, commit real credentials, or paste them into public issues. The secret key bypasses Row Level Security and must only be available to trusted server code.

### Owner login

After the owner Auth account, database setting and Vercel environment variables are configured, open:

`https://YOUR-DOMAIN/admin/login`

The email must be present in both `STORE_OWNER_EMAILS` and the database `settings.owner_emails` JSON array. Use an owner-controlled email and a unique password. Do not create public self-registration for the owner workspace.

## Owner workflow

- **Customer requests:** open a request, review its form details and private artwork, contact the customer through WhatsApp, enter a quotation and update the production status.
- **Products & designs:** add sample gifts, service examples and photographs; use quotation pricing for custom work where the business has not confirmed a fixed price; keep unverified examples hidden.
- **Business settings:** update public opening hours, contact details and delivery information when the owner confirms changes.
- **Website analytics:** open the Vercel project dashboard and choose **Analytics** to see page views, popular pages and referrals.

## Enable Vercel Web Analytics

The `@vercel/analytics` component is included in the root layout. In the Vercel dashboard, open the Treasured Genius project, select **Analytics**, and enable Web Analytics. Deploy the branch after enabling it. Vercel Analytics does not report local development traffic.

## Email notifications

The owner dashboard is the system of record for custom requests. Email notifications are optional: configure all three Resend variables to send a short alert when a new request is saved. If they are not configured, the request is still stored in the dashboard; the customer-facing confirmation is not dependent on email delivery.

## Business information

The public website describes Treasured Genius as a craft and printing shop on Nsakina Street, Accra. The owner should review the Business Settings page before launch and confirm exact daily opening hours, delivery areas/fees, product availability, production methods and current pricing. The public sample gallery should contain only real, owner-approved products and designs. Do not publish demonstration prices or placeholder photos as actual inventory.

## Deployment

The project is hosted on Vercel. Use the repository's pull request preview to review changes before merging to `main`. The GitHub Actions CI workflow runs installation, lint, TypeScript and production build checks.

- Build command: `npm run build`
- Install command: `npm install`
- Output directory: Next.js default

Changes to environment variables require a new deployment. Enabling Vercel Web Analytics in the Vercel dashboard is a separate project setting.
