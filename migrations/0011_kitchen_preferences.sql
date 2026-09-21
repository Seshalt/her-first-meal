alter table grocery_preferences
  add column if not exists appliances jsonb not null default '[]'::jsonb;
