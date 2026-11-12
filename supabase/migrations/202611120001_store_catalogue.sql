create extension if not exists pgcrypto;
create table if not exists public.categories(id uuid primary key default gen_random_uuid(),name text not null check(char_length(name) between 2 and 80),slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),description text,is_active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.products(id uuid primary key default gen_random_uuid(),category_id uuid references public.categories(id) on delete set null,name text not null check(char_length(name) between 2 and 120),slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),short_description text check(char_length(coalesce(short_description,''))<=240),description text,price_ghs numeric(12,2) not null check(price_ghs>0),stock_quantity integer not null default 0 check(stock_quantity>=0),is_active boolean not null default false,is_featured boolean not null default false,is_demo boolean not null default false,sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.product_images(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,image_url text not null,storage_path text,alt_text text,sort_order integer not null default 0,created_at timestamptz not null default now());
create table if not exists public.orders(id uuid primary key default gen_random_uuid(),order_number text not null unique,customer_name text not null,customer_phone text not null,customer_email text,status text not null default 'pending',subtotal_ghs numeric(12,2) not null default 0,delivery_fee_ghs numeric(12,2) not null default 0,total_ghs numeric(12,2) not null default 0,delivery_method text,delivery_address text,gift_message text,delivery_date date,payment_reference text unique,payment_status text not null default 'unpaid',notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,product_id uuid references public.products(id) on delete set null,product_name text not null,quantity integer not null check(quantity>0),unit_price_ghs numeric(12,2) not null check(unit_price_ghs>0),line_total_ghs numeric(12,2) not null check(line_total_ghs>0));
create table if not exists public.settings(key text primary key,value jsonb not null default '{}'::jsonb,updated_at timestamptz not null default now());
insert into public.settings(key,value) values('owner_emails','[]'::jsonb),('shop_open','true'::jsonb),('contact_phone','"+233277018939"'::jsonb) on conflict(key) do nothing;
create or replace function public.is_store_owner() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.settings s, jsonb_array_elements_text(case when s.key = 'owner_emails' and jsonb_typeof(s.value) = 'array' then s.value else '[]'::jsonb end) as owner(owner_email) where s.key='owner_emails' and lower(owner.owner_email)=lower(coalesce(auth.jwt()->>'email','')));
$$;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;
create policy "Public reads active categories" on public.categories for select to anon,authenticated using(is_active or public.is_store_owner());
create policy "Owner manages categories" on public.categories for all to authenticated using(public.is_store_owner()) with check(public.is_store_owner());
create policy "Public reads active products" on public.products for select to anon,authenticated using(is_active or public.is_store_owner());
create policy "Owner manages products" on public.products for all to authenticated using(public.is_store_owner()) with check(public.is_store_owner());
create policy "Public reads images for active products" on public.product_images for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and (p.is_active or public.is_store_owner())));
create policy "Owner manages product images" on public.product_images for all to authenticated using(public.is_store_owner()) with check(public.is_store_owner());
create policy "Owner manages orders" on public.orders for all to authenticated using(public.is_store_owner()) with check(public.is_store_owner());
create policy "Owner manages order items" on public.order_items for all to authenticated using(public.is_store_owner()) with check(public.is_store_owner());
create policy "Owner manages settings" on public.settings for all to authenticated using(public.is_store_owner()) with check(public.is_store_owner());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy "Public reads product images" on storage.objects for select to anon,authenticated using(bucket_id='product-images');
create policy "Owner uploads product images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_store_owner());
create policy "Owner updates product images" on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_store_owner()) with check(bucket_id='product-images' and public.is_store_owner());
create policy "Owner deletes product images" on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_store_owner());
insert into public.categories(id,name,slug,description,sort_order) values
('10000000-0000-4000-8000-000000000001','Celebrations','celebrations','Gifts for milestones and memorable occasions.',1),
('10000000-0000-4000-8000-000000000002','For Someone Special','for-someone-special','Thoughtful gestures for the people who matter.',2),
('10000000-0000-4000-8000-000000000003','Hampers & Keepsakes','hampers-keepsakes','Curated gift ideas and keepsakes.',3) on conflict(id) do nothing;
insert into public.products(id,category_id,name,slug,short_description,description,price_ghs,stock_quantity,is_active,is_featured,is_demo,sort_order) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','The Thoughtful Hamper','the-thoughtful-hamper','A curated hamper concept for a meaningful moment.','DEMO ONLY: Replace description, image and sample price with approved business information before accepting orders.',450,0,true,true,true,1),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','The Golden Gesture Box','the-golden-gesture-box','A refined presentation for someone special.','DEMO ONLY: Replace description, image and sample price with approved business information before accepting orders.',320,0,true,true,true,2),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','Celebration Edit','celebration-edit','A gift concept for life’s special milestones.','DEMO ONLY: Replace description, image and sample price with approved business information before accepting orders.',280,0,true,false,true,3),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003','The Gratitude Collection','the-gratitude-collection','A considered way to say thank you.','DEMO ONLY: Replace description, image and sample price with approved business information before accepting orders.',390,0,true,false,true,4),
('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','Little Luxuries Set','little-luxuries-set','A small collection of thoughtful details.','DEMO ONLY: Replace description, image and sample price with approved business information before accepting orders.',220,0,true,false,true,5),
('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001','The Occasion Keepsake','the-occasion-keepsake','A keepsake-inspired gift for a day worth remembering.','DEMO ONLY: Replace description, image and sample price with approved business information before accepting orders.',180,0,true,false,true,6) on conflict(id) do nothing;
insert into public.product_images(product_id,image_url,alt_text,sort_order) values
('20000000-0000-4000-8000-000000000001','/placeholders/thoughtful-hamper.svg','Demo placeholder artwork for The Thoughtful Hamper',0),
('20000000-0000-4000-8000-000000000002','/placeholders/golden-gesture.svg','Demo placeholder artwork for The Golden Gesture Box',0),
('20000000-0000-4000-8000-000000000003','/placeholders/celebration-edit.svg','Demo placeholder artwork for Celebration Edit',0),
('20000000-0000-4000-8000-000000000004','/placeholders/gratitude-collection.svg','Demo placeholder artwork for The Gratitude Collection',0),
('20000000-0000-4000-8000-000000000005','/placeholders/little-luxuries.svg','Demo placeholder artwork for Little Luxuries Set',0),
('20000000-0000-4000-8000-000000000006','/placeholders/occasion-keepsake.svg','Demo placeholder artwork for The Occasion Keepsake',0);
