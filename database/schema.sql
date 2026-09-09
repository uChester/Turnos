-- Ejecutar una vez sobre la base de datos de PostgreSQL de la barbería.
-- Ejemplo: psql "$DATABASE_URL" -f database/schema.sql

CREATE TABLE IF NOT EXISTS reservas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME(0) NOT NULL,
  creada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reservas_fecha_hora_unica UNIQUE (fecha, hora)
);

CREATE INDEX IF NOT EXISTS reservas_fecha_idx ON reservas (fecha);
