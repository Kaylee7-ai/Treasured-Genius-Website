create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.settings(key, value) values
  ('owner_emails', '[]'::jsonb),
  ('shop_open', 'true'::jsonb),
  ('contact_phone', '"+233277018939"'::jsonb)
on conflict (key) do nothing;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text check (char_length(coalesce(short_description, '')) <= 240),
  description text,
  price_mode text not null default 'quote' check (price_mode in ('quote', 'fixed')),
  price_ghs numeric(12,2),
  availability text not null default 'made_to_order' check (availability in ('in_stock', 'made_to_order', 'unavailable')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  personalisation_options text[] not null default '{}',
  is_active boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_mode_check check (
    (price_mode = 'quote' and (price_ghs is null or price_ghs >= 0))
    or (price_mode = 'fixed' and price_ghs is not null and price_ghs > 0)
  )
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null check (image_url ~ '^https://'),
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (storage_path)
);

create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique default (
    'TG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 120),
  customer_phone text not null check (char_length(trim(customer_phone)) between 7 and 40),
  customer_email text check (customer_email is null or char_length(customer_email) <= 254),
  product_id uuid references public.products(id) on delete set null,
  product_label text not null check (char_length(trim(product_label)) between 2 and 160),
  item_description text,
  design_type text not null,
  artwork_description text,
  design_placement text,
  quantity integer not null default 1 check (quantity between 1 and 500),
  occasion text,
  requested_date date,
  extra_notes text,
  artwork_paths text[] not null default '{}',
  status text not null default 'new' check (status in (
    'new', 'reviewing', 'quote_sent', 'awaiting_customer_approval',
    'approved', 'payment_confirmed', 'in_production',
    'ready_for_collection', 'delivered', 'cancelled'
  )),
  quoted_price_ghs numeric(12,2) check (quoted_price_ghs is null or quoted_price_ghs >= 0),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_public_sort_idx
  on public.products (is_active, sort_order, created_at desc);
create index if not exists product_images_product_sort_idx
  on public.product_images (product_id, sort_order);
create index if not exists custom_requests_status_created_idx
  on public.custom_requests (status, created_at desc);

create or replace function private.is_store_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.settings as s
      cross join lateral jsonb_array_elements_text(
        case
          when s.key = 'owner_emails' and jsonb_typeof(s.value) = 'array'
          then s.value
          else '[]'::jsonb
        end
      ) as allowed(email)
      where s.key = 'owner_emails'
        and lower(allowed.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    );
$$;

revoke all on function private.is_store_owner() from public, anon;
grant execute on function private.is_store_owner() to authenticated;

alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.custom_requests enable row level security;

drop policy if exists "TG owner manages settings" on public.settings;
create policy "TG owner manages settings"
  on public.settings for all to authenticated
  using (private.is_store_owner())
  with check (private.is_store_owner());

drop policy if exists "TG public reads active categories" on public.categories;
create policy "TG public reads active categories"
  on public.categories for select to anon, authenticated
  using (is_active or private.is_store_owner());

drop policy if exists "TG owner manages categories" on public.categories;
create policy "TG owner manages categories"
  on public.categories for all to authenticated
  using (private.is_store_owner())
  with check (private.is_store_owner());

drop policy if exists "TG public reads active products" on public.products;
create policy "TG public reads active products"
  on public.products for select to anon, authenticated
  using (is_active or private.is_store_owner());

drop policy if exists "TG owner manages products" on public.products;
create policy "TG owner manages products"
  on public.products for all to authenticated
  using (private.is_store_owner())
  with check (private.is_store_owner());

drop policy if exists "TG public reads published product images" on public.product_images;
create policy "TG public reads published product images"
  on public.product_images for select to anon, authenticated
  using (
    exists (
      select 1 from public.products as p
      where p.id = product_id and (p.is_active or private.is_store_owner())
    )
  );

drop policy if exists "TG owner manages product images" on public.product_images;
create policy "TG owner manages product images"
  on public.product_images for all to authenticated
  using (private.is_store_owner())
  with check (private.is_store_owner());

drop policy if exists "TG owner reads custom requests" on public.custom_requests;
create policy "TG owner reads custom requests"
  on public.custom_requests for select to authenticated
  using (private.is_store_owner());

drop policy if exists "TG owner updates custom requests" on public.custom_requests;
create policy "TG owner updates custom requests"
  on public.custom_requests for update to authenticated
  using (private.is_store_owner())
  with check (private.is_store_owner());

grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
grant select, update on public.custom_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tg-product-images',
  'tg-product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tg-custom-artwork',
  'tg-custom-artwork',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "TG public reads product image objects" on storage.objects;
create policy "TG public reads product image objects"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'tg-product-images');

drop policy if exists "TG owner uploads product image objects" on storage.objects;
create policy "TG owner uploads product image objects"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'tg-product-images' and private.is_store_owner());

drop policy if exists "TG owner updates product image objects" on storage.objects;
create policy "TG owner updates product image objects"
  on storage.objects for update to authenticated
  using (bucket_id = 'tg-product-images' and private.is_store_owner())
  with check (bucket_id = 'tg-product-images' and private.is_store_owner());

drop policy if exists "TG owner deletes product image objects" on storage.objects;
create policy "TG owner deletes product image objects"
  on storage.objects for delete to authenticated
  using (bucket_id = 'tg-product-images' and private.is_store_owner());

drop policy if exists "TG owner reads private customer artwork" on storage.objects;
create policy "TG owner reads private customer artwork"
  on storage.objects for select to authenticated
  using (bucket_id = 'tg-custom-artwork' and private.is_store_owner());

drop policy if exists "TG owner deletes private customer artwork" on storage.objects;
create policy "TG owner deletes private customer artwork"
  on storage.objects for delete to authenticated
  using (bucket_id = 'tg-custom-artwork' and private.is_store_owner());

comment on table public.custom_requests is
  'Private custom-gift enquiries submitted by customers. Only authorised store owners can read or update rows.';
comment on column public.custom_requests.artwork_paths is
  'Object paths inside the private tg-custom-artwork bucket; never expose these as public URLs.';


-- Customer files are written by a server-only service key after validation and rate limiting.
-- No public upload policy is granted on the private artwork bucket.


create table if not exists private.custom_request_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists custom_request_rate_limits_ip_time_idx
  on private.custom_request_rate_limits (ip_hash, created_at desc);
revoke all on private.custom_request_rate_limits from public, anon, authenticated;

create or replace function public.check_custom_request_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_count integer;
begin
  if p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_ip_hash));
  delete from private.custom_request_rate_limits
    where created_at < now() - interval '2 hours';

  select count(*)::integer into attempt_count
    from private.custom_request_rate_limits
    where ip_hash = p_ip_hash
      and created_at > now() - interval '1 hour';

  if attempt_count >= 5 then
    return false;
  end if;

  insert into private.custom_request_rate_limits (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

revoke all on function public.check_custom_request_rate_limit(text) from public, anon, authenticated;
grant execute on function public.check_custom_request_rate_limit(text) to service_role;

grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
grant select, update on public.custom_requests to authenticated;
grant all on public.custom_requests to service_role;
grant all on public.settings, public.categories, public.products, public.product_images to service_role;
