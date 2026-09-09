const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Crea .env a partir de .env.example.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Los PostgreSQL administrados (Neon, Supabase, Railway, etc.) exigen SSL.
  // Para una instalación local puede declararse DATABASE_SSL=false en .env.
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

module.exports = pool;
