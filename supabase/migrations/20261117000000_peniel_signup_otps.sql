-- Migration: 20261117000000_peniel_signup_otps.sql
-- One-time password codes for email-based signup verification via Brevo.
-- Mirrors password_reset_otps so every OTP (signup + reset) is sent and logged
-- through Brevo instead of Supabase's built-in email service.

create table if not exists public.signup_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists signup_otps_email_idx on public.signup_otps(email, used);
create index if not exists signup_otps_expires_idx on public.signup_otps(expires_at);

-- Cleanup expired signup OTPs (extends the existing cleanup function).
create or replace function public.cleanup_expired_otps()
returns void language plpgsql as $$
begin
  delete from public.password_reset_otps where expires_at < now() or used;
  delete from public.signup_otps where expires_at < now() or used;
end;
$$;

-- RLS: only the service role can manage signup OTPs; public cannot read them.
alter table public.signup_otps enable row level security;

drop policy if exists "service role manages signup otps" on public.signup_otps;
create policy "service role manages signup otps"
  on public.signup_otps
  for all
  to service_role
  using (true);