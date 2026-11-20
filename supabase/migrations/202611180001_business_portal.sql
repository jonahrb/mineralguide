create extension if not exists pgcrypto;

create table if not exists public.business_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  business_name text not null check (char_length(business_name) between 1 and 160),
  created_at timestamptz not null default now()
);

create table if not exists public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  credits integer not null check (credits > 0),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency = lower(currency)),
  stripe_price_id text not null unique,
  display_order integer not null default 100,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.service_catalog (
  service_key text primary key check (service_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  credits integer not null check (credits >= 0),
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.business_accounts (id) on delete restrict,
  service_key text not null references public.service_catalog (service_key),
  status text not null default 'submitted' check (
    status in ('submitted', 'in_review', 'needs_information', 'completed', 'failed', 'cancelled')
  ),
  credits_charged integer not null check (credits_charged > 0),
  submission_file_path text not null,
  result_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, submission_file_path)
);
create index if not exists service_orders_account_created_idx
  on public.service_orders (account_id, created_at desc);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.business_accounts (id) on delete restrict,
  amount integer not null check (amount <> 0),
  entry_type text not null check (entry_type in ('purchase', 'service_charge', 'refund', 'adjustment')),
  description text not null,
  source_id text not null unique,
  amount_cents integer,
  currency text,
  stripe_payment_intent_id text,
  service_order_id uuid references public.service_orders (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint purchase_has_payment_details check (
    (entry_type = 'purchase' and amount_cents > 0 and currency is not null)
    or (entry_type <> 'purchase' and amount_cents is null and currency is null)
  )
);
create index if not exists credit_ledger_account_created_idx
  on public.credit_ledger (account_id, created_at desc);

create or replace function public.create_business_account_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.business_accounts (user_id, business_name)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'business_name'), ''), 'My business')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_business_account_for_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_business_account on auth.users;
create trigger on_auth_user_created_business_account
  after insert on auth.users
  for each row execute procedure public.create_business_account_for_new_user();

alter table public.business_accounts enable row level security;
alter table public.credit_packages enable row level security;
alter table public.service_catalog enable row level security;
alter table public.service_orders enable row level security;
alter table public.credit_ledger enable row level security;

revoke all on public.business_accounts, public.credit_packages, public.service_catalog,
  public.service_orders, public.credit_ledger from anon, authenticated;
grant select on public.business_accounts to authenticated;
grant select on public.credit_packages, public.service_catalog,
  public.service_orders, public.credit_ledger to authenticated;
revoke all on public.business_accounts, public.credit_packages, public.service_catalog,
  public.service_orders, public.credit_ledger from service_role;
grant select on public.business_accounts, public.credit_packages to service_role;
grant select, insert on public.credit_ledger to service_role;
grant select on public.service_orders to service_role;
grant update (status, result_file_path, updated_at) on public.service_orders to service_role;

create policy "Users read their business account"
  on public.business_accounts for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Authenticated users read active credit packages"
  on public.credit_packages for select to authenticated
  using (is_active);
create policy "Authenticated users read enabled services"
  on public.service_catalog for select to authenticated
  using (enabled);
create policy "Users read their service orders"
  on public.service_orders for select to authenticated
  using (
    exists (
      select 1 from public.business_accounts a
      where a.id = service_orders.account_id and a.user_id = (select auth.uid())
    )
  );
create policy "Users read their credit ledger"
  on public.credit_ledger for select to authenticated
  using (
    exists (
      select 1 from public.business_accounts a
      where a.id = credit_ledger.account_id and a.user_id = (select auth.uid())
    )
  );

create or replace view public.business_credit_balances
with (security_invoker = true)
as
  select account_id, coalesce(sum(amount), 0)::bigint as balance
  from public.credit_ledger
  group by account_id;
revoke all on public.business_credit_balances from anon, authenticated;
grant select on public.business_credit_balances to authenticated;

create or replace function public.submit_service_order(p_service_key text, p_submission_file_path text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_account_id uuid;
  v_service public.service_catalog%rowtype;
  v_order_id uuid;
  v_balance bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id into v_account_id
  from public.business_accounts
  where user_id = v_user_id
  for update;
  if v_account_id is null then
    raise exception 'Business account not found';
  end if;

  select * into v_service
  from public.service_catalog
  where service_key = p_service_key and enabled;
  if not found or v_service.credits <= 0 then
    raise exception 'Service is not available';
  end if;

  if p_submission_file_path is null
    or p_submission_file_path not like v_user_id::text || '/submissions/%'
    or not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'business-service-files'
        and o.name = p_submission_file_path
        and (storage.foldername(o.name))[1] = v_user_id::text
    ) then
    raise exception 'Submission file is not available to this account';
  end if;

  select coalesce(sum(amount), 0) into v_balance
  from public.credit_ledger
  where account_id = v_account_id;
  if v_balance < v_service.credits then
    raise exception 'Not enough credits';
  end if;

  insert into public.service_orders (account_id, service_key, credits_charged, submission_file_path)
  values (v_account_id, v_service.service_key, v_service.credits, p_submission_file_path)
  returning id into v_order_id;

  insert into public.credit_ledger (account_id, amount, entry_type, description, source_id, service_order_id)
  values (
    v_account_id,
    -v_service.credits,
    'service_charge',
    v_service.name,
    'service_order:' || v_order_id::text,
    v_order_id
  );

  return v_order_id;
end;
$$;
revoke all on function public.submit_service_order(text, text) from public, anon;
grant execute on function public.submit_service_order(text, text) to authenticated;

create or replace function public.refund_failed_service_order(p_service_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.service_orders%rowtype;
begin
  select * into v_order from public.service_orders where id = p_service_order_id for update;
  if not found or v_order.status <> 'failed' then
    raise exception 'Only failed service orders can be refunded';
  end if;

  insert into public.credit_ledger (account_id, amount, entry_type, description, source_id, service_order_id)
  values (
    v_order.account_id,
    v_order.credits_charged,
    'refund',
    'Credit refund for failed service order',
    'refund_service_order:' || v_order.id::text,
    v_order.id
  )
  on conflict (source_id) do nothing;
end;
$$;
revoke all on function public.refund_failed_service_order(uuid) from public, anon, authenticated;
grant execute on function public.refund_failed_service_order(uuid) to service_role;

insert into public.service_catalog (service_key, name, description, credits, enabled)
values (
  'rofr-bulk-search',
  'Bulk ROFR search',
  'Submit a spreadsheet for review of recorded transactions against rights of first refusal.',
  0,
  false
)
on conflict (service_key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-service-files',
  'business-service-files',
  false,
  20971520,
  array['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload their own service submissions"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'business-service-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] = 'submissions'
  );
create policy "Users read their own service files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'business-service-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
