-- Up Migration
CREATE TABLE stations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT stations_code_chk CHECK (code = upper(code))
);

CREATE INDEX idx_stations_name_lower ON stations (lower(name) text_pattern_ops);

CREATE TRIGGER stations_set_updated_at 
BEFORE UPDATE ON stations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS stations_set_updated_at ON stations;
DROP TABLE IF EXISTS stations;