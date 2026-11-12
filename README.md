# Treasured Genius — The Art of Giving

Premium Next.js 15 website with the original Emerald & Gold identity and interactive 3D gift hero.

## Requirements
- Node.js 20.9+
- npm 10+

## Local development
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Checks
```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel
Import the repository, select Next.js, root directory `./`, install command `npm install`, build command `npm run build`, and keep the default output directory.

## Store Phase 1: Supabase catalogue and owner admin

Public catalogue: `/shop`; product detail: `/shop/[slug]`; private owner area: `/admin`. The admin route is excluded from indexing and is not linked in public navigation.

### 1. Create Supabase
1. Create a project at https://supabase.com/dashboard.
2. In Project Settings → API, copy the Project URL and anon/public key.
3. In Authentication → Users, create the owner login with a strong password. Its email must match the environment allowlist.
4. Open SQL Editor and run `supabase/migrations/202611120001_store_catalogue.sql`.
5. Replace the example email in this statement and run it in SQL Editor. Keep this list identical to `STORE_OWNER_EMAILS`:

```sql
update public.settings
set value = '["owner@example.com"]'::jsonb, updated_at = now()
where key = 'owner_emails';
```

The migration creates products, product_images, categories, orders, order_items and settings; enables RLS; creates the public-read/owner-write image bucket; and seeds six demo listings with original SVG placeholder artwork. Demo names, descriptions and prices are not real inventory. Replace them with owner-approved content before accepting orders.

### 2. Configure Vercel
In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `STORE_OWNER_EMAILS` | Comma-separated authorised owner emails |

Add the same values to local `.env.local` for development. Never commit `.env.local`. Do not expose service-role, Paystack or Resend secrets in client code. A service-role key is not needed in Phase 1.

### 3. Use the admin
1. Open `/admin/login` on the deployed site.
2. Sign in using the Supabase Auth owner account.
3. Add, edit, hide, show, delete and reorder products.
4. Upload up to eight JPG, PNG, WebP or AVIF images per product (5 MB maximum per image).
5. Set price in GHS, stock, category, featured status and display order.
6. Review the public catalogue at `/shop`.

The owner email must be present in both `STORE_OWNER_EMAILS` and the Supabase `settings.owner_emails` JSON array. Middleware and each server action check the environment allowlist; RLS separately checks the database allowlist. Supabase Auth also applies its configured authentication rate limits.

### 4. Missing configuration
Builds do not require live credentials. Without Supabase URL/anon key, the public shop shows a friendly not-configured message and admin login explains setup is incomplete. Protected admin pages remain behind middleware and server-side owner checks.

## Later phases
- Phase 2: persistent cart, checkout, Paystack GHS test-mode, signed/idempotent webhook handling, stock-safe order processing and Resend email.
- Phase 3: admin order management, dashboard, CSV export, settings and customer tracking.

## Business information
Existing contact/location details on the brand homepage are demonstration content and should be confirmed with the business before public promotion. No customer reviews or real product inventory are fabricated.
