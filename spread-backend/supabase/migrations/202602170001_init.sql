create extension if not exists pgcrypto;

create type user_role as enum ('creator', 'restaurant', 'admin');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type claim_status as enum ('active', 'submitted', 'approved', 'rejected', 'expired');
create type submission_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  role user_role not null,
  instagram_handle text,
  tiktok_handle text,
  approval_status approval_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  location_lat double precision not null,
  location_lng double precision not null,
  max_concurrent_creators integer not null check (max_concurrent_creators > 0),
  current_active_creators integer not null default 0 check (current_active_creators >= 0),
  expiration_date timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  creator_id uuid not null references public.users(id) on delete cascade,
  status claim_status not null default 'active',
  claimed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  slot_released boolean not null default false
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  proof_image_url text not null,
  tiktok_url text,
  caption_text text,
  status submission_status not null default 'pending',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz
);

create index if not exists idx_offers_restaurant_id on public.offers (restaurant_id);
create index if not exists idx_offers_location on public.offers (location_lat, location_lng);
create index if not exists idx_offers_active_expiration on public.offers (active, expiration_date);
create index if not exists idx_claims_offer_id on public.claims (offer_id);
create index if not exists idx_claims_creator_id on public.claims (creator_id);
create index if not exists idx_claims_status on public.claims (status);
create index if not exists idx_submissions_claim_id on public.submissions (claim_id);
create index if not exists idx_submissions_status on public.submissions (status);

create or replace function public.claim_offer(p_offer_id uuid, p_creator_id uuid, p_expires_at timestamptz)
returns public.claims
language plpgsql
as $$
declare
  v_offer public.offers;
  v_active_claim_count int;
  v_claim public.claims;
begin
  select * into v_offer
  from public.offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Offer not found';
  end if;

  if not v_offer.active or v_offer.expiration_date <= now() then
    raise exception 'Offer is no longer active';
  end if;

  if v_offer.current_active_creators >= v_offer.max_concurrent_creators then
    raise exception 'Offer has no available slots';
  end if;

  select count(*)::int into v_active_claim_count
  from public.claims
  where creator_id = p_creator_id
    and status in ('active', 'submitted')
    and expires_at > now();

  if v_active_claim_count >= 3 then
    raise exception 'Creator already has 3 active claims';
  end if;

  insert into public.claims (offer_id, creator_id, status, expires_at)
  values (p_offer_id, p_creator_id, 'active', p_expires_at)
  returning * into v_claim;

  update public.offers
  set current_active_creators = current_active_creators + 1
  where id = p_offer_id;

  return v_claim;
end;
$$;

create or replace function public.release_offer_slot(p_claim_id uuid)
returns void
language plpgsql
as $$
declare
  v_claim public.claims;
begin
  select * into v_claim
  from public.claims
  where id = p_claim_id
  for update;

  if not found then
    raise exception 'Claim not found';
  end if;

  if v_claim.slot_released then
    return;
  end if;

  update public.offers
  set current_active_creators = greatest(current_active_creators - 1, 0)
  where id = v_claim.offer_id;

  update public.claims
  set slot_released = true
  where id = p_claim_id;
end;
$$;
