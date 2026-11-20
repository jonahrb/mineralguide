create table if not exists public.business_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.business_admins enable row level security;
revoke all on public.business_admins from public, anon, authenticated, service_role;

alter table public.credit_ledger
  add column if not exists admin_user_id uuid references auth.users (id) on delete set null;

revoke select on public.credit_ledger from authenticated;
grant select (id, account_id, amount, entry_type, description, created_at)
  on public.credit_ledger to authenticated;

create or replace function public.is_business_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.business_admins a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_business_admin() from public, anon;
grant execute on function public.is_business_admin() to authenticated;

create or replace function public.admin_list_business_accounts(p_search text default null)
returns table (
  account_id uuid,
  business_name text,
  email text,
  credit_balance bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_business_admin() then
    raise exception 'Administrator access required';
  end if;

  return query
  select
    a.id,
    a.business_name,
    u.email::text,
    coalesce(sum(l.amount), 0)::bigint
  from public.business_accounts a
  left join auth.users u on u.id = a.user_id
  left join public.credit_ledger l on l.account_id = a.id
  where p_search is null
    or a.business_name ilike '%' || btrim(p_search) || '%'
    or coalesce(u.email, '') ilike '%' || btrim(p_search) || '%'
  group by a.id, a.business_name, u.email
  order by a.business_name, u.email nulls last
  limit 100;
end;
$$;
revoke all on function public.admin_list_business_accounts(text) from public, anon;
grant execute on function public.admin_list_business_accounts(text) to authenticated;

create or replace function public.admin_get_credit_history(p_account_id uuid)
returns table (
  entry_id uuid,
  credit_amount integer,
  entry_type text,
  description text,
  created_at timestamptz,
  admin_user_id uuid,
  admin_email text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_business_admin() then
    raise exception 'Administrator access required';
  end if;

  if not exists (select 1 from public.business_accounts a where a.id = p_account_id) then
    raise exception 'Business account not found';
  end if;

  return query
  select l.id, l.amount, l.entry_type, l.description, l.created_at,
    l.admin_user_id, u.email::text
  from public.credit_ledger l
  left join auth.users u on u.id = l.admin_user_id
  where l.account_id = p_account_id
  order by l.created_at desc
  limit 100;
end;
$$;
revoke all on function public.admin_get_credit_history(uuid) from public, anon;
grant execute on function public.admin_get_credit_history(uuid) to authenticated;

create or replace function public.admin_adjust_credits(
  p_account_id uuid,
  p_amount integer,
  p_reason text,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_user_id uuid := auth.uid();
  v_account_id uuid;
  v_reason text := btrim(coalesce(p_reason, ''));
  v_source_id text := 'admin_adjustment:' || p_request_id::text;
  v_balance bigint;
  v_existing public.credit_ledger%rowtype;
  v_entry_id uuid;
begin
  if v_admin_user_id is null or not public.is_business_admin() then
    raise exception 'Administrator access required';
  end if;
  if p_request_id is null then
    raise exception 'Adjustment request ID is required';
  end if;
  if p_amount is null or p_amount = 0 or p_amount < -1000000 or p_amount > 1000000 then
    raise exception 'Adjustment must be between -1,000,000 and 1,000,000 credits, excluding zero';
  end if;
  if char_length(v_reason) < 3 or char_length(v_reason) > 500 then
    raise exception 'Enter a reason between 3 and 500 characters';
  end if;

  select a.id into v_account_id
  from public.business_accounts a
  where a.id = p_account_id
  for update;
  if v_account_id is null then
    raise exception 'Business account not found';
  end if;

  select l.* into v_existing
  from public.credit_ledger l
  where l.source_id = v_source_id;
  if found then
    if v_existing.account_id = p_account_id
      and v_existing.amount = p_amount
      and v_existing.description = v_reason
      and v_existing.admin_user_id = v_admin_user_id then
      return v_existing.id;
    end if;
    raise exception 'Adjustment request ID has already been used';
  end if;

  select coalesce(sum(l.amount), 0)::bigint into v_balance
  from public.credit_ledger l
  where l.account_id = p_account_id;
  if v_balance + p_amount < 0 then
    raise exception 'Credit removal cannot make the account balance negative';
  end if;

  insert into public.credit_ledger (
    account_id, amount, entry_type, description, source_id, admin_user_id
  )
  values (
    p_account_id, p_amount, 'adjustment', v_reason, v_source_id, v_admin_user_id
  )
  returning id into v_entry_id;

  return v_entry_id;
end;
$$;
revoke all on function public.admin_adjust_credits(uuid, integer, text, uuid) from public, anon;
grant execute on function public.admin_adjust_credits(uuid, integer, text, uuid) to authenticated;

