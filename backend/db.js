const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS dispositivos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        ip TEXT NOT NULL,
        porta INTEGER DEFAULT 80,
        status TEXT DEFAULT 'desconhecido',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS automacoes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        acoes JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS presets (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        data TIMESTAMPTZ NOT NULL,
        acao TEXT NOT NULL,
        usuario TEXT NOT NULL,
        resultado TEXT NOT NULL,
        detalhes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Banco de dados inicializado');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
