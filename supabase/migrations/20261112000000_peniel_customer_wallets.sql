create table if not exists public.customer_wallets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.profiles(id) on delete cascade,
  balance_minor bigint not null default 0 check (balance_minor >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  updated_at timestamptz not null default now()
);
create index customer_wallets_owner_idx on public.customer_wallets(customer_id);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('credit', 'debit')),
  amount_minor bigint not null check (amount_minor > 0),
  reference text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);
create index wallet_transactions_customer_idx on public.wallet_transactions(customer_id, created_at desc);
create index wallet_transactions_reference_idx on public.wallet_transactions(reference);

alter table public.customer_wallets enable row level security;
alter table public.wallet_transactions enable row level security;

create policy wallets_owner_all on public.customer_wallets for all
using (customer_id = (select auth.uid()) or public.is_admin())
with check (customer_id = (select auth.uid()) or public.is_admin());

create policy wallet_transactions_owner_read on public.wallet_transactions for select
using (customer_id = (select auth.uid()) or public.is_admin());

create policy wallet_transactions_owner_insert on public.wallet_transactions for insert
with check (customer_id = (select auth.uid()) or public.is_admin());

create table if not exists public.wallet_topups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  reference text not null unique,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status public.payment_status not null default 'initialized',
  provider_transaction_id text,
  checkout_url text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index wallet_topups_customer_idx on public.wallet_topups(customer_id, created_at desc);
create index wallet_topups_reference_idx on public.wallet_topups(reference);

alter table public.wallet_topups enable row level security;

create policy wallet_topups_owner_all on public.wallet_topups for all
using (customer_id = (select auth.uid()) or public.is_admin())
with check (customer_id = (select auth.uid()) or public.is_admin());

grant select, insert on public.wallet_topups to authenticated;
