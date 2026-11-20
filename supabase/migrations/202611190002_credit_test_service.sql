insert into public.service_catalog (service_key, name, description, credits, enabled)
values (
  'credit-test',
  'Credit test',
  'A sample service request that verifies one credit is deducted and recorded in your ledger.',
  1,
  true
)
on conflict (service_key) do update set
  name = excluded.name,
  description = excluded.description,
  credits = excluded.credits,
  enabled = excluded.enabled;
