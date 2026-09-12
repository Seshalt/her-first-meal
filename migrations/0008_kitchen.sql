-- Metered AI so the house catalog can stay unlimited without an open OpenAI bill.
-- Meeting purchases can wait on Stripe instead of being marked paid on a click.

alter table business_settings
  add column if not exists ai_recipe_per_day integer not null default 3;
alter table business_settings
  add column if not exists ai_nouri_per_day integer not null default 12;
alter table business_settings
  add column if not exists ai_grocery_per_day integer not null default 2;
alter table business_settings
  add column if not exists ai_house_per_day integer not null default 400;

create table if not exists ai_usage (
  user_id text not null,
  day date not null,
  recipes integer not null default 0,
  nouri integer not null default 0,
  grocery integer not null default 0,
  primary key (user_id, day)
);

alter table purchases add column if not exists appointment_id integer;
alter table purchases add column if not exists stripe_session text;
alter table purchases add column if not exists starts_at timestamptz;

create unique index if not exists purchases_stripe_session_uidx
  on purchases (stripe_session)
  where stripe_session is not null;

