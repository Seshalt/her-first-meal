-- Privacy hardening for Her First Meal.
-- Precise coordinates are intentionally not retained. The columns remain for
-- backward-compatible application code, but existing values are cleared.
update profiles set latitude = null, longitude = null
where latitude is not null or longitude is not null;

-- Verification codes are short-lived and should never survive their purpose.
delete from email_factors where expires_at < now();

-- Remove legacy generated feedback/usage data. Current product personalization
-- uses the built-in content library rather than generative AI.
update binding_uploads set ai_feedback = null where ai_feedback is not null;
delete from ai_usage;

-- Anonymous operational records have bounded retention.
delete from page_visits where created_at < now() - interval '90 days';
delete from cookie_notices where created_at < now() - interval '180 days';


-- Enforce retention opportunistically whenever a new anonymous record arrives.
create or replace function prune_hfm_operational_data()
returns trigger language plpgsql as $$
begin
  delete from page_visits where created_at < now() - interval '90 days';
  delete from cookie_notices where created_at < now() - interval '180 days';
  delete from email_factors where expires_at < now();
  return new;
end;
$$;

drop trigger if exists prune_page_visits_retention on page_visits;
create trigger prune_page_visits_retention
after insert on page_visits
for each statement execute function prune_hfm_operational_data();

drop trigger if exists prune_cookie_notices_retention on cookie_notices;
create trigger prune_cookie_notices_retention
after insert on cookie_notices
for each statement execute function prune_hfm_operational_data();
