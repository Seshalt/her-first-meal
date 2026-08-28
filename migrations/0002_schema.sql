-- Her First Meal application schema

create table if not exists profiles (
  user_id text primary key,
  role text not null default 'member',
  display_name text,
  email text,
  location text,
  timezone text,
  language text not null default 'en',
  stage text,
  due_date date,
  baby_birthday date,
  previous_pregnancies integer not null default 0,
  is_first_pregnancy boolean,
  is_multiple boolean not null default false,
  household_size integer not null default 2,
  weekly_budget text,
  zip_code text,
  city text,
  location_permission text not null default 'denied',
  onboarding_completed boolean not null default false,
  onboarding_step integer not null default 0,
  theme_preference text not null default 'system',
  notification_prefs jsonb not null default '{}'::jsonb,
  partner_invite_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on profiles (role);
create index if not exists profiles_email_idx on profiles (email);

create table if not exists dietary_profiles (
  user_id text primary key,
  diets jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  avoids text,
  dislikes text,
  loves text,
  cuisines jsonb not null default '[]'::jsonb
);

create table if not exists grocery_preferences (
  user_id text primary key,
  stores jsonb not null default '[]'::jsonb,
  custom_stores text
);

create table if not exists memberships (
  id serial primary key,
  user_id text,
  email text not null,
  plan text not null,
  status text not null default 'active',
  price_cents integer not null,
  checkout_token text unique,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists memberships_user_idx on memberships (user_id);
create index if not exists memberships_email_idx on memberships (email);

create table if not exists business_settings (
  id integer primary key default 1,
  business_name text not null default 'Her First Meal',
  tagline text not null default 'The world celebrates the baby. We remember the mother.',
  monthly_price_cents integer not null default 4900,
  yearly_price_cents integer not null default 49000,
  currency text not null default 'USD',
  timezone text not null default 'America/New_York',
  business_hours jsonb not null default '{"mon":["09:00","17:00"],"tue":["09:00","17:00"],"wed":["09:00","17:00"],"thu":["09:00","17:00"],"fri":["09:00","15:00"],"sat":[],"sun":[]}'::jsonb,
  appointment_duration_minutes integer not null default 45,
  buffer_minutes integer not null default 15,
  daily_appointment_limit integer not null default 6,
  zoom_default_link text,
  payment_processor text not null default 'demo',
  email_notifications_enabled boolean not null default true,
  sms_ready boolean not null default false,
  push_ready boolean not null default false,
  nouri_system_notes text,
  branding jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into business_settings (id) values (1) on conflict (id) do nothing;

create table if not exists discounts (
  id serial primary key,
  code text not null unique,
  percent integer not null,
  active boolean not null default true,
  gift boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id serial primary key,
  user_id text not null,
  type text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed',
  zoom_link text,
  client_notes text,
  owner_notes text,
  created_at timestamptz not null default now()
);
create unique index if not exists appointments_no_double_book
  on appointments (starts_at)
  where status in ('pending', 'confirmed');
create index if not exists appointments_user_idx on appointments (user_id);

create table if not exists blocked_dates (
  id serial primary key,
  day date not null unique,
  reason text
);

create table if not exists meal_plans (
  id serial primary key,
  user_id text not null,
  week_start date not null,
  meals jsonb not null default '[]'::jsonb,
  unique (user_id, week_start)
);

create table if not exists grocery_lists (
  id serial primary key,
  user_id text not null,
  week_start date not null,
  items jsonb not null default '[]'::jsonb,
  unique (user_id, week_start)
);

create table if not exists pantry_items (
  id serial primary key,
  user_id text not null,
  name text not null,
  quantity numeric not null default 1,
  unit text not null default 'item',
  estimated boolean not null default true,
  low boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists pantry_user_idx on pantry_items (user_id);

create table if not exists saved_recipes (
  user_id text not null,
  recipe_id text not null,
  favorite boolean not null default true,
  primary key (user_id, recipe_id)
);

create table if not exists check_ins (
  id serial primary key,
  user_id text not null,
  day date not null,
  hydration integer not null default 0,
  mood text,
  energy text,
  notes text,
  completed jsonb not null default '{}'::jsonb,
  unique (user_id, day)
);

create table if not exists binding_uploads (
  id serial primary key,
  user_id text not null,
  angle text not null,
  image_data text,
  notes text,
  ai_feedback text,
  created_at timestamptz not null default now()
);
create index if not exists binding_user_idx on binding_uploads (user_id);

create table if not exists binding_journal (
  id serial primary key,
  user_id text not null,
  entry text not null,
  created_at timestamptz not null default now()
);

create table if not exists workout_logs (
  id serial primary key,
  user_id text not null,
  workout_id text not null,
  minutes integer,
  created_at timestamptz not null default now()
);

create table if not exists nouri_conversations (
  id serial primary key,
  user_id text not null,
  title text,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists nouri_user_idx on nouri_conversations (user_id);

create table if not exists notifications (
  id serial primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id);

create table if not exists products (
  id serial primary key,
  slug text unique not null,
  name text not null,
  description text not null,
  price_cents integer not null,
  kind text not null,
  image text,
  active boolean not null default true
);

insert into products (slug, name, description, price_cents, kind, image)
values
  ('belly-bind-guide', 'Belly Binding Studio Guide', 'A downloadable companion to the studio: wrapping sequences, rest days, and progress prompts.', 2900, 'digital', '/images/binding-still.jpg'),
  ('first-forty-meals', 'The First Forty Meals', 'Forty nourishing recipes mapped to pregnancy and the fourth trimester.', 3900, 'digital', '/images/meal-bowl.jpg'),
  ('partner-gift', 'Gift Membership', 'Give a year of Her First Meal to a mother you love.', 49000, 'gift', '/images/family-table.jpg'),
  ('consultation', 'Private Consultation', 'A 45-minute live review with Maat — belly binding, meals, or recovery.', 12000, 'consultation', '/images/binding-hands.jpg')
on conflict (slug) do nothing;

create table if not exists purchases (
  id serial primary key,
  user_id text,
  email text not null,
  product_id integer,
  amount_cents integer not null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create table if not exists partner_links (
  id serial primary key,
  mother_user_id text not null,
  partner_user_id text,
  partner_email text,
  created_at timestamptz not null default now()
);

create table if not exists cms_items (
  id serial primary key,
  kind text not null,
  title text not null,
  body text,
  url text,
  image_data text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists owner_notes (
  id serial primary key,
  client_user_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists setup_state (
  id integer primary key default 1,
  completed boolean not null default false,
  step integer not null default 0,
  payload jsonb not null default '{}'::jsonb
);
insert into setup_state (id) values (1) on conflict (id) do nothing;
