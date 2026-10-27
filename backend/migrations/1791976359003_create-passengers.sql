-- Up Migration
CREATE TABLE passengers (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id),
  name             VARCHAR(100) NOT NULL,
  age              SMALLINT NOT NULL,
  gender           VARCHAR(10) NOT NULL,
  berth_preference VARCHAR(20),
  nationality      VARCHAR(50) NOT NULL DEFAULT 'IN',
  id_proof_type    VARCHAR(20),
  id_proof_number  VARCHAR(50),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT passengers_age_chk CHECK (age BETWEEN 1 AND 120),
  CONSTRAINT passengers_gender_chk CHECK (gender IN ('M','F','OTHER')),
  CONSTRAINT passengers_berth_chk CHECK (berth_preference IS NULL OR berth_preference IN
    ('LOWER','MIDDLE','UPPER','SIDE_LOWER','SIDE_UPPER','WINDOW','NO_PREFERENCE'))
);

CREATE INDEX idx_passengers_user ON passengers (user_id) WHERE is_active = true;

CREATE UNIQUE INDEX uq_passengers_user_idproof
  ON passengers (user_id, id_proof_number)
  WHERE id_proof_number IS NOT NULL AND is_active = true;

CREATE TRIGGER passengers_set_updated_at
BEFORE UPDATE ON passengers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS passengers_set_updated_at ON passengers;
DROP TABLE IF EXISTS passengers;