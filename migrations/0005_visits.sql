create table if not exists page_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_visits_created_idx on page_visits (created_at desc);
