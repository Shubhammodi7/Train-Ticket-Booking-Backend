-- Up Migration
create table seats (
  id bigint generated always as identity primary key,
  coach_id bigint not null references coaches(id),
  seat_no smallint not null,
  berth_type varchar(12) not null,

  constraint seats_seat_no_chk check (seat_no >= 1),
  constraint seats_berth_type_chk check (berth_type in ('WINDOW', 'MIDDLE', 'AISLE', 'LOWER', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER')),
  constraint unique_seats_coach_seat unique (coach_id, seat_no)
);

-- Down Migration
drop table if exists seats;