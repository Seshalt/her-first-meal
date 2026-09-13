-- Place, language, and letters to the owner. No AI tables.

alter table profiles add column if not exists region text;
alter table profiles add column if not exists state_code text;

create table if not exists house_letters (
  id serial primary key,
  user_id text,
  name text,
  email text not null,
  locale text,
  stage text,
  subject text,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists house_letters_created_idx on house_letters (created_at desc);
