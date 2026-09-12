-- Precise place so grocery and Nouri can cook from where she shops.
alter table profiles add column if not exists latitude double precision;
alter table profiles add column if not exists longitude double precision;
