const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Crea .env a partir de .env.example.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Una instancia serverless puede reutilizar este pool entre invocaciones.
  // Un límite bajo evita agotar el pool compartido de Supabase.
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true,
  // Los PostgreSQL administrados (Neon, Supabase, Railway, etc.) exigen SSL.
  // Para una instalación local puede declararse DATABASE_SSL=false en .env.
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

module.exports = pool;
