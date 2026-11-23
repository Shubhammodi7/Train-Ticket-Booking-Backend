-- Up Migration
create table train_schedules (
  id bigint generated always as identity primary key,
  train_id bigint not null unique references trains(id) on delete cascade,
  running_days smallint[] not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint running_days_len_chk CHECK (cardinality(running_days) between 1 and 7),
  constraint running_days_vals_chk  CHECK (running_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[])
);

create trigger train_schedules_set_updated_at
before update on train_schedules
for each row execute function set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS train_schedules_set_updated_at ON train_schedules;
DROP TABLE IF EXISTS train_schedules;