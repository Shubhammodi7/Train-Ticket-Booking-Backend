-- Up Migration
CREATE TABLE trains (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  number VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  source_station_id BIGINT NOT NULL REFERENCES stations(id),
  destination_station_id BIGINT NOT NULL REFERENCES stations(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at timestamp NOT null default now(),
  updated_at timestamp not null default now()
);

create trigger trains_set_updated_at
before update on trains 
for each row execute function set_updated_at();

-- Down Migration
drop trigger if exists trains_set_updated_at on trains;
drop table if exists trains;