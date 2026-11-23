-- Up Migration
create table train_runs(
  id bigint generated always as identity primary key,
  train_id bigint not null references trains(id) on delete cascade,
  schedule_id bigint not null references train_schedules(id) on delete restrict,
  journey_date date not null,
  status varchar(20) not null default 'SCHEDULED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_train_run_date UNIQUE (train_id, journey_date),
  constraint train_run_status_chk CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED'))
);

create trigger train_runs_set_updated_at
before update on train_runs
for each row execute function set_updated_at();

create index idx_train_runs_date_status on train_runs (journey_date, status);

-- Down Migration
DROP INDEX IF EXISTS idx_train_runs_date_status;
DROP TRIGGER IF EXISTS train_runs_set_updated_at ON train_runs;
DROP TABLE IF EXISTS train_runs;