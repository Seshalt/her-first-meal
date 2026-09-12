-- Unique Stripe session so a meeting is never recorded twice after checkout return.
create unique index if not exists purchases_stripe_session_uidx
  on purchases (stripe_session)
  where stripe_session is not null;
