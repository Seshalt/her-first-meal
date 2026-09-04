create table if not exists cookie_notices (
  ip_hash text primary key,
  created_at timestamptz not null default now()
);
