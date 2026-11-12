-- Up Migration
create table classes (
  id bigint generated always as identity primary key,
  code varchar(4) not null unique,
  name varchar(100) not null unique,
  coach_prefix CHAR(1) not null unique,
  seat_type varchar(20) not null,
  seats_per_coach smallint not null,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  constraint code_upper_chk check (code = upper(code)),
  constraint prefix_chk CHECK (coach_prefix ~ '^[A-Z]$'),
  constraint seat_type_chk check (seat_type in ('CHAIR', 'BERTH')),
  constraint seats_chk check (seats_per_coach between 1 and 150)
);

create trigger classes_set_updated_at
before update on classes
for each row execute function set_updated_at();

-- Down Migration
drop trigger if exists classes_set_updated_at on classes;
drop table if exists classes;