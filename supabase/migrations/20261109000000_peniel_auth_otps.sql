-- Migration: 20261109000000_peniel_auth_otps.sql
-- One-time password codes for email-based password reset via Brevo.

create table public.password_reset_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  reset_token text,
  created_at timestamptz not null default now()
);

create index password_reset_otps_email_idx on public.password_reset_otps(email, used);
create index password_reset_otps_expires_idx on public.password_reset_otps(expires_at);
create index password_reset_otps_token_idx on public.password_reset_otps(reset_token);

-- Cleanup expired OTPs on demand.
create or replace function public.cleanup_expired_otps()
returns void language plpgsql as $$
begin
  delete from public.password_reset_otps where expires_at < now() or used;
end;
$$;

-- RLS: only the service role can manage OTPs; public cannot read them.
alter table public.password_reset_otps enable row level security;

create policy "service role manages password reset otps"
  on public.password_reset_otps
  for all
  to service_role
  using (true);
