-- Up Migration
create table coaches (
  id bigint generated always as identity primary key,
  train_id bigint not null references trains(id),
  class_id bigint not null references classes(id),
  coach_no varchar(4) not null,
  total_seats smallint not null,
  created_at timestamptz NOT null default now(),
  updated_at timestamptz not null default now(),

  constraint coaches_total_seats_chk check (total_seats between 1 and 150),
  constraint coaches_coach_no_chk    check (coach_no ~ '^[A-Z][0-9]{1,2}$'),
  constraint uq_coaches_train_coach  unique (train_id, coach_no)
);

create index idx_coaches_train_class on coaches (train_id, class_id);

CREATE TRIGGER coaches_set_updated_at
BEFORE UPDATE ON coaches
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS coaches_set_updated_at ON coaches;
DROP TABLE IF EXISTS coaches;