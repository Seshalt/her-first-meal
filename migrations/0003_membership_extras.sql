-- Membership covers the house. The only paid extra is a meeting with Maat.
update products
set active = false
where slug in ('belly-bind-guide', 'first-forty-meals', 'partner-gift');

update products
set
  name = 'A meeting with Maat',
  description = 'A 45-minute live session with Maat — belly binding, meals, or recovery. The only extra beyond membership.'
where slug = 'consultation';
