alter table profiles
  add column if not exists email_factor_ok boolean not null default false;

create table if not exists email_factors (
  id text primary key,
  user_id text not null,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists email_factors_user_idx on email_factors (user_id);
