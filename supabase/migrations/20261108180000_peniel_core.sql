create extension if not exists pgcrypto with schema extensions;

create type public.account_role as enum ('customer', 'admin', 'super_admin');
create type public.vendor_status as enum ('draft', 'pending_review', 'active', 'rejected', 'suspended');
create type public.order_status as enum (
  'pending_payment', 'payment_processing', 'paid', 'confirmed', 'preparing',
  'ready_for_pickup', 'shipped', 'out_for_delivery', 'delivered', 'completed',
  'cancelled', 'refund_requested', 'refunded', 'failed'
);
create type public.payment_status as enum ('initialized', 'pending', 'successful', 'failed', 'refunded', 'partially_refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'customer',
  full_name text not null default '',
  phone text,
  suspended_at timestamptz,
  notification_preferences jsonb not null default '{}'::jsonb,
  whatsapp_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(full_name) <= 120)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  attributes_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, name, sort_order) values
  ('restaurants', 'Restaurants', 10),
  ('bars', 'Bars', 20),
  ('grocery', 'Grocery', 30),
  ('fresh-food', 'Fresh Food & Farm', 40),
  ('fashion', 'Fashion', 50),
  ('beauty', 'Beauty', 60),
  ('salons', 'Salons & Barbers', 70),
  ('bakeries', 'Cakes & Bakeries', 80),
  ('electronics', 'Electronics', 90),
  ('gifts', 'Gifts & Florists', 100),
  ('hotels', 'Hotels & Stays', 110),
  ('home-services', 'Home & Personal Services', 120),
  ('events', 'Events & Experiences', 130);

create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.platform_settings (key, value)
values ('commerce', '{"platform_fee_bps":200,"standard_delivery_minor":250000,"currency":"NGN"}'::jsonb);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  slug text not null unique,
  name text not null,
  description text not null default '',
  business_type text not null,
  category_id uuid references public.categories(id),
  address text not null default '',
  location text not null default '',
  phone text,
  whatsapp_number text,
  status public.vendor_status not null default 'draft',
  fulfilment text not null default 'order' check (fulfilment in ('order', 'booking', 'reservation')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint vendors_name_length check (char_length(name) between 2 and 120)
);

create index vendors_owner_idx on public.vendors(owner_id, created_at desc);
create index vendors_discovery_idx on public.vendors(status, category_id, location);

create table public.vendor_members (
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  permissions text[] not null default array['manage_store', 'manage_catalog', 'manage_orders'],
  created_at timestamptz not null default now(),
  primary key (vendor_id, profile_id)
);

create table public.storefronts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null unique references public.vendors(id) on delete cascade,
  template_id text not null default 'cinematic',
  layout text not null default 'grid',
  theme jsonb not null default '{}'::jsonb,
  logo_object_key text,
  cover_object_key text,
  opening_hours jsonb not null default '{}'::jsonb,
  delivery_settings jsonb not null default '{}'::jsonb,
  policies jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  category_id uuid references public.categories(id),
  name text not null,
  description text not null default '',
  group_name text not null default 'General',
  price_minor bigint not null check (price_minor >= 0),
  compare_at_price_minor bigint check (compare_at_price_minor is null or compare_at_price_minor >= price_minor),
  currency text not null default 'NGN' check (currency = 'NGN'),
  sku text,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  published boolean not null default false,
  archived_at timestamptz,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_length check (char_length(name) between 1 and 160)
);

create unique index products_vendor_sku_idx on public.products(vendor_id, sku) where sku is not null;
create index products_public_catalog_idx on public.products(vendor_id, published, category_id, created_at desc) where archived_at is null;

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  option_values jsonb not null default '{}'::jsonb,
  price_minor bigint not null check (price_minor >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_minor bigint not null default 0 check (price_minor >= 0),
  active boolean not null default true
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  address text not null,
  city text not null,
  state text not null,
  delivery_instructions text not null default '',
  created_at timestamptz not null default now()
);
create index customer_addresses_owner_idx on public.customer_addresses(customer_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  reference text not null unique,
  idempotency_key text not null,
  currency text not null default 'NGN' check (currency = 'NGN'),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  delivery_minor bigint not null default 0 check (delivery_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  platform_fee_minor bigint not null default 0 check (platform_fee_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  request_digest text not null,
  status public.order_status not null default 'pending_payment',
  customer_snapshot jsonb not null default '{}'::jsonb,
  delivery_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id, idempotency_key)
);
create index orders_customer_idx on public.orders(customer_id, created_at desc);

create table public.vendor_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  delivery_minor bigint not null default 0 check (delivery_minor >= 0),
  commission_minor bigint not null default 0 check (commission_minor >= 0),
  vendor_net_minor bigint not null default 0 check (vendor_net_minor >= 0),
  status public.order_status not null default 'pending_payment',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id, vendor_id)
);
create index vendor_orders_vendor_idx on public.vendor_orders(vendor_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  vendor_order_id uuid not null references public.vendor_orders(id) on delete cascade,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  product_snapshot jsonb not null,
  quantity integer not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  line_total_minor bigint not null check (line_total_minor >= 0)
);
create index order_items_suborder_idx on public.order_items(vendor_order_id);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  vendor_order_id uuid references public.vendor_orders(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  from_status public.order_status,
  to_status public.order_status not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  provider text not null default 'flutterwave' check (provider = 'flutterwave'),
  reference text not null unique,
  provider_transaction_id text unique,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status public.payment_status not null default 'initialized',
  checkout_url text,
  idempotency_key text not null unique,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments(order_id, created_at desc);

create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  reference text not null,
  payload_digest text not null,
  processed_at timestamptz,
  outcome text not null default 'received',
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id),
  order_id uuid references public.orders(id),
  payment_id uuid references public.payments(id),
  entry_type text not null check (entry_type in ('sale', 'commission', 'refund', 'payout', 'adjustment')),
  amount_minor bigint not null,
  currency text not null default 'NGN' check (currency = 'NGN'),
  source_reference text not null,
  created_at timestamptz not null default now(),
  unique(vendor_id, entry_type, source_reference)
);
create index ledger_vendor_idx on public.ledger_entries(vendor_id, created_at desc);

create table public.media_objects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  vendor_id uuid references public.vendors(id),
  object_key text not null unique,
  visibility text not null check (visibility in ('public', 'private')),
  content_type text not null,
  byte_size bigint not null check (byte_size > 0),
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id),
  customer_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(vendor_id, customer_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  vendor_order_id uuid not null references public.vendor_orders(id),
  vendor_id uuid not null references public.vendors(id),
  rating smallint not null check (rating between 1 and 5),
  body text not null default '',
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  unique(customer_id, vendor_order_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  request_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_target_idx on public.admin_audit_logs(target_type, target_id, created_at desc);

create table public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  vendor_id uuid references public.vendors(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  review_note text not null default ''
);
create index vendor_applications_owner_idx on public.vendor_applications(owner_id, submitted_at desc);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'role changes require administrator authorization' using errcode = '42501';
  end if;
  if new.suspended_at is distinct from old.suspended_at and not public.is_admin() then
    raise exception 'suspension changes require administrator authorization' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
before update on public.profiles
for each row execute function public.guard_profile_role_change();

create or replace function public.guard_vendor_owner_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id and not public.is_admin() then
    raise exception 'vendor ownership cannot be changed by a vendor' using errcode = '42501';
  end if;
  if new.status is distinct from old.status and not public.is_admin() then
    raise exception 'vendor status changes require administrator authorization' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger protect_vendor_state
before update on public.vendors
for each row execute function public.guard_vendor_owner_update();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin', 'super_admin')
      and p.suspended_at is null
  );
$$;

create or replace function public.is_vendor_member(target_vendor uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.vendor_members vm
    where vm.vendor_id = target_vendor
      and vm.profile_id = (select auth.uid())
  ) or exists (
    select 1 from public.vendors v
    where v.id = target_vendor and v.owner_id = (select auth.uid())
  );
$$;

create or replace function public.create_vendor(
  p_name text,
  p_slug text,
  p_description text,
  p_business_type text,
  p_category_slug text,
  p_location text,
  p_address text,
  p_fulfilment text,
  p_template_id text,
  p_layout text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid := auth.uid();
  v_category uuid;
  v_vendor uuid;
begin
  if v_owner is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if length(trim(coalesce(p_name, ''))) not between 2 and 120 then
    raise exception 'invalid business name' using errcode = '22023';
  end if;
  if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) > 80 then
    raise exception 'invalid storefront slug' using errcode = '22023';
  end if;
  if p_fulfilment not in ('order', 'booking', 'reservation') then
    raise exception 'invalid fulfilment type' using errcode = '22023';
  end if;
  select id into v_category from public.categories where slug = p_category_slug and active;
  if v_category is null then raise exception 'category not found' using errcode = 'P0002'; end if;
  insert into public.vendors (
    owner_id, slug, name, description, business_type, category_id, location, address, fulfilment, status
  ) values (
    v_owner, p_slug, trim(p_name), left(coalesce(p_description, ''), 4000),
    left(p_business_type, 80), v_category, left(coalesce(p_location, ''), 160),
    left(coalesce(p_address, ''), 500), p_fulfilment, 'pending_review'
  ) returning id into v_vendor;
  insert into public.vendor_members (vendor_id, profile_id) values (v_vendor, v_owner);
  insert into public.storefronts (vendor_id, template_id, layout)
  values (v_vendor, left(coalesce(p_template_id, 'cinematic'), 80), left(coalesce(p_layout, 'grid'), 80));
  insert into public.vendor_applications (owner_id, vendor_id) values (v_owner, v_vendor);
  return v_vendor;
end;
$$;

create or replace function public.create_checkout(
  p_items jsonb,
  p_idempotency_key text,
  p_customer_snapshot jsonb default '{}'::jsonb,
  p_delivery_snapshot jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer uuid := auth.uid();
  v_order_id uuid;
  v_reference text;
  v_subtotal bigint;
  v_total bigint;
  v_line record;
  v_vendor_order_id uuid;
  v_vendor_subtotal bigint;
  v_vendor record;
  v_price bigint;
  v_stock integer;
  v_product_name text;
  v_product_description text;
  v_product_group text;
  v_fee_bps integer;
  v_delivery_fee bigint;
  v_vendor_count integer;
  v_platform_fee bigint;
  v_existing public.orders%rowtype;
begin
  if v_customer is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_idempotency_key is null or length(p_idempotency_key) not between 8 and 120 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'invalid checkout items' using errcode = '22023';
  end if;

  select * into v_existing from public.orders
   where customer_id = v_customer and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_digest <> md5(p_items::text || coalesce(p_customer_snapshot, '{}'::jsonb)::text || coalesce(p_delivery_snapshot, '{}'::jsonb)::text) then
      raise exception 'idempotency key reused with different checkout data' using errcode = '23505';
    end if;
    return jsonb_build_object('order_id', v_existing.id, 'reference', v_existing.reference,
      'amount_minor', v_existing.total_minor, 'status', v_existing.status, 'replayed', true);
  end if;

  v_subtotal := 0;
  select coalesce((value ->> 'platform_fee_bps')::integer, 0)
    into v_fee_bps from public.platform_settings where key = 'commerce';
  select coalesce((value ->> 'standard_delivery_minor')::bigint, 0)
    into v_delivery_fee from public.platform_settings where key = 'commerce';
  v_fee_bps := coalesce(v_fee_bps, 0);
  v_delivery_fee := coalesce(v_delivery_fee, 0);
  if v_fee_bps not between 0 and 10000 or v_delivery_fee < 0 then
    raise exception 'invalid platform commission configuration' using errcode = '22023';
  end if;

  for v_line in
    select (x ->> 'product_id')::uuid as product_id,
           (x ->> 'quantity')::integer as quantity
      from jsonb_array_elements(p_items) x
  loop
    if v_line.quantity not between 1 and 100 then
      raise exception 'invalid item quantity' using errcode = '22023';
    end if;
    select p.price_minor, p.stock_quantity
      into v_price, v_stock
      from public.products p
      join public.vendors v on v.id = p.vendor_id
     where p.id = v_line.product_id
       and p.published and p.archived_at is null and v.status = 'active' and v.fulfilment = 'order'
     for update of p;
    if not found then raise exception 'product unavailable' using errcode = 'P0002'; end if;
    if v_stock is not null and v_stock < v_line.quantity then
      raise exception 'insufficient stock' using errcode = '23514';
    end if;
    v_subtotal := v_subtotal + v_price * v_line.quantity;
  end loop;

  select count(distinct p.vendor_id)::integer into v_vendor_count
    from jsonb_array_elements(p_items) x
    join public.products p on p.id = (x ->> 'product_id')::uuid;
  select coalesce(sum((vendor_totals.subtotal_minor * v_fee_bps + 5000) / 10000), 0)
    into v_platform_fee
    from (
      select p.vendor_id, sum(p.price_minor * (x ->> 'quantity')::integer) as subtotal_minor
        from jsonb_array_elements(p_items) x
        join public.products p on p.id = (x ->> 'product_id')::uuid
       group by p.vendor_id
    ) vendor_totals;
  v_total := v_subtotal + v_vendor_count * v_delivery_fee + v_platform_fee;
  v_reference := 'PNL-' || upper(encode(extensions.gen_random_bytes(8), 'hex'));
  insert into public.orders (
    customer_id, reference, idempotency_key, subtotal_minor, delivery_minor,
    platform_fee_minor, total_minor, request_digest,
    customer_snapshot, delivery_snapshot
  ) values (
    v_customer, v_reference, p_idempotency_key, v_subtotal,
    (v_vendor_count * v_delivery_fee), v_platform_fee, v_total,
    md5(p_items::text || coalesce(p_customer_snapshot, '{}'::jsonb)::text || coalesce(p_delivery_snapshot, '{}'::jsonb)::text),
    coalesce(p_customer_snapshot, '{}'::jsonb), coalesce(p_delivery_snapshot, '{}'::jsonb)
  ) returning id into v_order_id;

  for v_vendor in
    select distinct p.vendor_id from jsonb_array_elements(p_items) x
    join public.products p on p.id = (x ->> 'product_id')::uuid
  loop
    v_vendor_subtotal := 0;
    insert into public.vendor_orders (order_id, vendor_id, subtotal_minor, vendor_net_minor)
    values (v_order_id, v_vendor.vendor_id, 0, 0)
    returning id into v_vendor_order_id;

    for v_line in
      select (x ->> 'product_id')::uuid as product_id,
             (x ->> 'quantity')::integer as quantity
        from jsonb_array_elements(p_items) x
        join public.products p on p.id = (x ->> 'product_id')::uuid
       where p.vendor_id = v_vendor.vendor_id
    loop
      select p.price_minor, p.stock_quantity, p.name, p.description, p.group_name
        into v_price, v_stock, v_product_name, v_product_description, v_product_group
        from public.products p where p.id = v_line.product_id for update;
      if v_stock is not null then
        update public.products set stock_quantity = stock_quantity - v_line.quantity
        where id = v_line.product_id and stock_quantity >= v_line.quantity;
        if not found then raise exception 'insufficient stock' using errcode = '23514'; end if;
      end if;
      insert into public.order_items (
        vendor_order_id, product_id, product_snapshot, quantity, unit_price_minor, line_total_minor
      ) values (
        v_vendor_order_id, v_line.product_id,
        jsonb_build_object('name', v_product_name, 'description', v_product_description, 'group', v_product_group),
        v_line.quantity, v_price, v_price * v_line.quantity
      );
      v_vendor_subtotal := v_vendor_subtotal + v_price * v_line.quantity;
    end loop;

    update public.vendor_orders
       set subtotal_minor = v_vendor_subtotal,
           delivery_minor = v_delivery_fee,
           commission_minor = ((v_vendor_subtotal * v_fee_bps + 5000) / 10000),
           vendor_net_minor = v_vendor_subtotal + v_delivery_fee - ((v_vendor_subtotal * v_fee_bps + 5000) / 10000)
    where id = v_vendor_order_id;
  end loop;

  insert into public.order_status_events (order_id, to_status, actor_id)
  values (v_order_id, 'pending_payment', v_customer);
  return jsonb_build_object('order_id', v_order_id, 'reference', v_reference,
    'amount_minor', v_total, 'status', 'pending_payment', 'replayed', false);
end;
$$;

create or replace function public.initialize_flutterwave_payment(
  p_order_id uuid,
  p_idempotency_key text,
  p_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '28000'; end if;
  select * into v_order from public.orders where id = p_order_id and customer_id = auth.uid() for update;
  if not found then raise exception 'order not found' using errcode = 'P0002'; end if;
  if p_reference is distinct from v_order.reference then
    raise exception 'payment reference does not match order' using errcode = '22023';
  end if;
  select * into v_payment from public.payments where idempotency_key = p_idempotency_key;
  if found then
    if v_payment.order_id <> v_order.id then raise exception 'idempotency key conflict' using errcode = '23505'; end if;
    return jsonb_build_object('payment_id', v_payment.id, 'reference', v_payment.reference,
      'amount_minor', v_payment.amount_minor, 'checkout_url', v_payment.checkout_url, 'status', v_payment.status);
  end if;
  if v_order.status not in ('pending_payment', 'payment_processing') then
    raise exception 'order is not payable' using errcode = '22023';
  end if;
  insert into public.payments (order_id, reference, amount_minor, idempotency_key)
  values (v_order.id, p_reference, v_order.total_minor, p_idempotency_key)
  returning * into v_payment;
  update public.orders set status = 'payment_processing', updated_at = now() where id = v_order.id;
  update public.vendor_orders set status = 'payment_processing', updated_at = now() where order_id = v_order.id;
  return jsonb_build_object('payment_id', v_payment.id, 'reference', v_payment.reference,
    'amount_minor', v_payment.amount_minor, 'status', v_payment.status);
end;
$$;

create or replace function public.set_flutterwave_checkout_url(p_reference text, p_checkout_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.payments p set checkout_url = p_checkout_url, updated_at = now()
  from public.orders o
  where p.order_id = o.id and p.reference = p_reference and o.customer_id = auth.uid()
    and p.status in ('initialized', 'pending');
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
end;
$$;

create or replace function public.confirm_flutterwave_payment(
  p_event_id text,
  p_reference text,
  p_transaction_id text,
  p_amount_minor bigint,
  p_currency text,
  p_payload_digest text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_event_inserted integer;
  v_entry record;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if nullif(p_event_id, '') is null or nullif(p_reference, '') is null
    or nullif(p_transaction_id, '') is null or p_amount_minor is null or p_amount_minor <= 0
    or p_currency is null or p_currency <> 'NGN' or nullif(p_payload_digest, '') is null then
    raise exception 'invalid provider confirmation data' using errcode = '22023';
  end if;
  insert into public.payment_webhook_events (provider_event_id, reference, payload_digest)
  values (p_event_id, p_reference, p_payload_digest)
  on conflict (provider_event_id) do nothing;
  get diagnostics v_event_inserted = row_count;
  if v_event_inserted = 0 then return null; end if;

  select * into v_payment from public.payments where reference = p_reference for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  if v_payment.amount_minor <> p_amount_minor or v_payment.currency <> p_currency then
    raise exception 'payment amount/currency mismatch' using errcode = '22023';
  end if;
  if v_payment.status = 'successful' then
    if v_payment.provider_transaction_id is distinct from p_transaction_id then
      raise exception 'payment already confirmed with another transaction' using errcode = '23505';
    end if;
    update public.payment_webhook_events set processed_at = now(), outcome = 'already_successful'
    where provider_event_id = p_event_id;
    return v_payment.order_id;
  end if;

  update public.payments set status = 'successful',
    provider_transaction_id = p_transaction_id, verified_at = now(), updated_at = now()
  where id = v_payment.id;
  update public.orders set status = 'paid', updated_at = now() where id = v_payment.order_id;
  update public.vendor_orders set status = 'paid', updated_at = now() where order_id = v_payment.order_id;
  insert into public.order_status_events (order_id, to_status)
  values (v_payment.order_id, 'paid');
  for v_entry in
    select id, vendor_id, subtotal_minor, delivery_minor, commission_minor
    from public.vendor_orders where order_id = v_payment.order_id
  loop
    insert into public.ledger_entries (
      vendor_id, order_id, payment_id, entry_type, amount_minor, source_reference
    ) values
      (v_entry.vendor_id, v_payment.order_id, v_payment.id, 'sale',
        v_entry.subtotal_minor + v_entry.delivery_minor, p_reference),
      (v_entry.vendor_id, v_payment.order_id, v_payment.id, 'commission',
        -v_entry.commission_minor, p_reference)
    on conflict (vendor_id, entry_type, source_reference) do nothing;
  end loop;
  update public.payment_webhook_events set processed_at = now(), outcome = 'successful'
  where provider_event_id = p_event_id;
  return v_payment.order_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.platform_settings enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_members enable row level security;
alter table public.storefronts enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_addons enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.vendor_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.media_objects enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.vendor_applications enable row level security;

create policy profiles_select_self_or_admin on public.profiles for select
using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_self on public.profiles for update
using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy categories_public_read on public.categories for select using (active or public.is_admin());
create policy categories_admin_manage on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy platform_settings_admin_read on public.platform_settings for select using (public.is_admin());
create policy platform_settings_admin_write on public.platform_settings for update using (public.is_admin()) with check (public.is_admin());

create policy vendors_public_active_read on public.vendors for select using (
  (status = 'active') or owner_id = (select auth.uid()) or public.is_vendor_member(id) or public.is_admin()
);
create policy vendors_owner_create on public.vendors for insert
with check (owner_id = (select auth.uid()) and status in ('draft', 'pending_review'));
create policy vendors_owner_update on public.vendors for update
using (owner_id = (select auth.uid()) or public.is_vendor_member(id) or public.is_admin())
with check (owner_id = (select auth.uid()) or public.is_vendor_member(id) or public.is_admin());

create policy vendor_members_self_read on public.vendor_members for select
using (profile_id = (select auth.uid()) or public.is_admin());
create policy storefront_public_read on public.storefronts for select using (
  published_at is not null and exists (
    select 1 from public.vendors v where v.id = vendor_id and v.status = 'active'
  ) or public.is_vendor_member(vendor_id) or public.is_admin()
);
create policy storefront_owner_write on public.storefronts for all
using (public.is_vendor_member(vendor_id) or public.is_admin())
with check (public.is_vendor_member(vendor_id) or public.is_admin());

create policy products_public_read on public.products for select using (
  (published and archived_at is null and exists (
    select 1 from public.vendors v where v.id = vendor_id and v.status = 'active'
  )) or public.is_vendor_member(vendor_id) or public.is_admin()
);
create policy products_vendor_write on public.products for all
using (public.is_vendor_member(vendor_id) or public.is_admin())
with check (public.is_vendor_member(vendor_id) or public.is_admin());

create policy variants_public_read on public.product_variants for select using (
  active and exists (select 1 from public.products p where p.id = product_id and p.published and p.archived_at is null)
  or exists (select 1 from public.products p where p.id = product_id and public.is_vendor_member(p.vendor_id))
  or public.is_admin()
);
create policy variants_vendor_write on public.product_variants for all
using (exists (select 1 from public.products p where p.id = product_id and public.is_vendor_member(p.vendor_id)) or public.is_admin())
with check (exists (select 1 from public.products p where p.id = product_id and public.is_vendor_member(p.vendor_id)) or public.is_admin());
create policy addons_public_read on public.product_addons for select using (
  active and exists (select 1 from public.products p where p.id = product_id and p.published and p.archived_at is null)
  or exists (select 1 from public.products p where p.id = product_id and public.is_vendor_member(p.vendor_id))
  or public.is_admin()
);
create policy addons_vendor_write on public.product_addons for all
using (exists (select 1 from public.products p where p.id = product_id and public.is_vendor_member(p.vendor_id)) or public.is_admin())
with check (exists (select 1 from public.products p where p.id = product_id and public.is_vendor_member(p.vendor_id)) or public.is_admin());

create policy addresses_owner_all on public.customer_addresses for all
using (customer_id = (select auth.uid()) or public.is_admin())
with check (customer_id = (select auth.uid()) or public.is_admin());
create policy orders_customer_read on public.orders for select
using (customer_id = (select auth.uid()) or public.is_admin());
create policy vendor_orders_isolated_read on public.vendor_orders for select
using (public.is_vendor_member(vendor_id) or exists (
  select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())
) or public.is_admin());
create policy order_items_scoped_read on public.order_items for select using (
  exists (
    select 1 from public.vendor_orders vo
    where vo.id = vendor_order_id and (
      public.is_vendor_member(vo.vendor_id) or exists (
        select 1 from public.orders o where o.id = vo.order_id and o.customer_id = (select auth.uid())
      ) or public.is_admin()
    )
  )
);
create policy order_events_scoped_read on public.order_status_events for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid()))
  or exists (select 1 from public.vendor_orders vo where vo.id = vendor_order_id and public.is_vendor_member(vo.vendor_id))
  or public.is_admin()
);
create policy payments_customer_read on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid()))
  or public.is_admin()
);
create policy ledger_vendor_read on public.ledger_entries for select using (public.is_vendor_member(vendor_id) or public.is_admin());
create policy media_owner_read on public.media_objects for select using (
  owner_id = (select auth.uid()) or (visibility = 'public') or public.is_admin()
);
create policy media_owner_insert on public.media_objects for insert
with check (owner_id = (select auth.uid()) and (vendor_id is null or public.is_vendor_member(vendor_id)));
create policy conversations_member_read on public.conversations for select using (
  customer_id = (select auth.uid()) or public.is_vendor_member(vendor_id) or public.is_admin()
);
create policy conversations_customer_create on public.conversations for insert
with check (customer_id = (select auth.uid()));
create policy messages_member_read on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and
    (c.customer_id = (select auth.uid()) or public.is_vendor_member(c.vendor_id) or public.is_admin()))
);
create policy messages_member_send on public.messages for insert with check (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.conversations c where c.id = conversation_id and
    (c.customer_id = (select auth.uid()) or public.is_vendor_member(c.vendor_id))
  )
);
create policy reviews_public_read on public.reviews for select using (moderation_status = 'published' or customer_id = (select auth.uid()) or public.is_admin());
create policy reviews_customer_create on public.reviews for insert with check (
  customer_id = (select auth.uid()) and moderation_status = 'pending' and exists (
    select 1 from public.vendor_orders vo join public.orders o on o.id = vo.order_id
    where vo.id = vendor_order_id and vo.vendor_id = vendor_id and o.customer_id = (select auth.uid())
      and o.status in ('delivered', 'completed')
  )
);
create policy notifications_owner_all on public.notifications for all
using (recipient_id = (select auth.uid()) or public.is_admin())
with check (recipient_id = (select auth.uid()) or public.is_admin());
create policy audit_admin_read on public.admin_audit_logs for select using (public.is_admin());
create policy applications_owner_read on public.vendor_applications for select
using (owner_id = (select auth.uid()) or public.is_admin());
create policy applications_owner_create on public.vendor_applications for insert
with check (owner_id = (select auth.uid()) and status = 'pending');

revoke all on public.payment_webhook_events from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;
grant select on public.categories, public.vendors, public.storefronts, public.products, public.product_variants, public.product_addons, public.reviews to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.vendors, public.storefronts, public.products, public.product_variants, public.product_addons to authenticated;
grant select, insert, update, delete on public.customer_addresses, public.conversations, public.messages, public.reviews, public.notifications, public.vendor_applications, public.media_objects to authenticated;
grant select on public.orders, public.vendor_orders, public.order_items, public.order_status_events, public.payments, public.ledger_entries, public.vendor_members to authenticated;
grant execute on function public.create_checkout(jsonb, text, jsonb, jsonb) to authenticated;
grant execute on function public.create_vendor(text, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.initialize_flutterwave_payment(uuid, text, text) to authenticated;
grant execute on function public.set_flutterwave_checkout_url(text, text) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_vendor_member(uuid) to authenticated;
revoke all on function public.confirm_flutterwave_payment(text, text, text, bigint, text, text) from public, anon, authenticated;
grant execute on function public.confirm_flutterwave_payment(text, text, text, bigint, text, text) to service_role;
revoke all on function public.create_checkout(jsonb, text, jsonb, jsonb) from public, anon;
revoke all on function public.create_vendor(text, text, text, text, text, text, text, text, text, text) from public, anon;
revoke all on function public.initialize_flutterwave_payment(uuid, text, text) from public, anon;
revoke all on function public.set_flutterwave_checkout_url(text, text) from public, anon;
