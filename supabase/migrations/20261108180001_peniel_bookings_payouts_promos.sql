-- Migration: 20261108180001_peniel_bookings_payouts_promos.sql
-- Addendum to the core migration. Apply after 20261108180000_peniel_core.sql.

-- ── Bookings ──────────────────────────────────────────────────────────────────

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id),
  customer_id uuid not null references public.profiles(id),
  service_id uuid references public.products(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text not null default '',
  customer_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_time_order check (end_at > start_at)
);

create index bookings_vendor_time_idx on public.bookings(vendor_id, start_at, status);
create index bookings_customer_idx on public.bookings(customer_id, start_at desc);

-- Prevent double-bookings: no two confirmed/pending bookings for the same vendor overlap
create or replace function public.create_booking(
  p_vendor_id uuid,
  p_customer_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_notes text,
  p_customer_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id uuid;
  v_conflict integer;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_customer_id <> auth.uid() then raise exception 'customer mismatch' using errcode = '42501'; end if;
  if p_start_at >= p_end_at then raise exception 'invalid time range' using errcode = '22023'; end if;
  if p_start_at < now() then raise exception 'booking time must be in the future' using errcode = '22023'; end if;

  -- Check for overlapping confirmed/pending bookings
  select count(*) into v_conflict
    from public.bookings b
   where b.vendor_id = p_vendor_id
     and b.status in ('pending', 'confirmed')
     and b.start_at < p_end_at
     and b.end_at > p_start_at;

  if v_conflict > 0 then
    raise exception 'time slot not available' using errcode = '23505';
  end if;

  insert into public.bookings (vendor_id, customer_id, service_id, start_at, end_at, notes, customer_snapshot)
  values (p_vendor_id, p_customer_id, p_service_id, p_start_at, p_end_at,
          left(coalesce(p_notes, ''), 1000), coalesce(p_customer_snapshot, '{}'::jsonb))
  returning id into v_booking_id;

  return jsonb_build_object('booking_id', v_booking_id, 'status', 'pending');
end;
$$;

alter table public.bookings enable row level security;

create policy bookings_customer_read on public.bookings for select
using (customer_id = (select auth.uid()) or public.is_vendor_member(vendor_id) or public.is_admin());

create policy bookings_customer_create on public.bookings for insert
with check (customer_id = (select auth.uid()));

create policy bookings_vendor_update on public.bookings for update
using (public.is_vendor_member(vendor_id) or customer_id = (select auth.uid()) or public.is_admin())
with check (public.is_vendor_member(vendor_id) or customer_id = (select auth.uid()) or public.is_admin());

grant select, insert, update on public.bookings to authenticated;
grant execute on function public.create_booking(uuid, uuid, uuid, timestamptz, timestamptz, text, jsonb) to authenticated;
revoke all on function public.create_booking(uuid, uuid, uuid, timestamptz, timestamptz, text, jsonb) from public, anon;

-- ── Payouts ───────────────────────────────────────────────────────────────────

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  account_last4 text not null,
  idempotency_key text not null unique,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payouts_vendor_idx on public.payouts(vendor_id, created_at desc);
create index payouts_status_idx on public.payouts(status, created_at desc);

alter table public.payouts enable row level security;

create policy payouts_vendor_read on public.payouts for select
using (public.is_vendor_member(vendor_id) or public.is_admin());

create policy payouts_vendor_create on public.payouts for insert
with check (public.is_vendor_member(vendor_id));

create policy payouts_admin_update on public.payouts for update
using (public.is_admin())
with check (public.is_admin());

grant select, insert on public.payouts to authenticated;
grant update on public.payouts to authenticated;

-- ── Promotions ────────────────────────────────────────────────────────────────

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id),
  code text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_order_minor bigint not null default 0 check (min_order_minor >= 0),
  max_uses integer,
  current_uses integer not null default 0 check (current_uses >= 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  -- Unique code per vendor (or platform-wide if vendor_id is null)
  unique (vendor_id, code)
);

create index promotions_code_idx on public.promotions(code, active);
create index promotions_vendor_idx on public.promotions(vendor_id, active);

alter table public.promotions enable row level security;

create policy promotions_public_read on public.promotions for select
using (active = true or public.is_vendor_member(coalesce(vendor_id, '00000000-0000-0000-0000-000000000000'::uuid)) or public.is_admin());

create policy promotions_vendor_write on public.promotions for all
using (public.is_vendor_member(vendor_id) or public.is_admin())
with check (public.is_vendor_member(vendor_id) or public.is_admin());

grant select on public.promotions to anon, authenticated;
grant insert, update on public.promotions to authenticated;
