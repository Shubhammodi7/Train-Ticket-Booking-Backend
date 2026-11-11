-- Up Migration
create table train_stops (
  id bigint generated always as identity primary key,
  train_id bigint not null references trains(id) on delete cascade,
  station_id bigint not null references stations(id),
  stop_seq smallint not null,
  arrival_time time,
  departure_time time,
  day_offset smallint not null default 0,
  distance_km integer not null,

  constraint train_stops_seq_chk check (stop_seq >= 1),
  constraint train_stops_day_chk check (day_offset >= 0),
  constraint train_stops_distance_chk check (distance_km >= 0),
  constraint uq_train_stops_seq unique (train_id, stop_seq),
  constraint uq_train_stops_station unique (train_id, station_id)
);

create index idx_train_stops_station ON train_stops (station_id, train_id, stop_seq);

-- Down Migration
drop table if exists train_stops;