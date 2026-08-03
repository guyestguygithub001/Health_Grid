/**
 * Health Grid EHR — Smart Database Client
 * ========================================
 * Strategy:
 *  - LOCAL/DOCKER: Uses `pg` (standard TCP pool) → zero latency, persistent connections
 *  - VERCEL/NEON:  Uses `@neondatabase/serverless` HTTP driver → no connection pool cold starts
 *                  Each query is an HTTP fetch — no TCP handshake, no pool warmup.
 *
 * This completely eliminates the "cold start" problem on Vercel.
 */

const fs = require('fs');
const path = require('path');

// ─── Detect environment ───────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || '';
const IS_NEON = DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('neon.tech') || process.env.USE_NEON === 'true';
const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.NETLIFY === 'true';

let _pool = null;
let _neonQuery = null;

/**
 * Get database query function.
 * Returns a unified async `query(sql, params)` function.
 */
function getDb() {
  if (IS_NEON || IS_SERVERLESS) {
    // ── Neon Serverless HTTP Driver (no connection pool, no cold start) ──────
    // Uses HTTP-based queries - no TCP pool to warm up, eliminates cold starts
    if (!_neonQuery) {
      const { neons } = require('@neondatabase/serverless');
      const sql = neons({ connectionString: DATABASE_URL });
      _neonQuery = async (text, params = []) => {
        // neons() accepts { query, params } objects and returns { rows, rowCount }
        const result = await sql({ query: text, params });
        return { rows: result.rows || [], rowCount: result.rowCount || 0 };
      };
    }
    return { query: _neonQuery };
  } else {
    // ── Standard pg Pool (for Docker / local Postgres) ───────────────────────
    if (!_pool) {
      const { Pool } = require('pg');
      const config = DATABASE_URL
        ? { connectionString: DATABASE_URL }
        : {
            host:     process.env.POSTGRES_HOST     || 'localhost',
            port:     parseInt(process.env.POSTGRES_PORT || '5432'),
            database: process.env.POSTGRES_DB       || 'healthgrid_db',
            user:     process.env.POSTGRES_USER     || 'healthgrid',
            password: process.env.POSTGRES_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          };

      _pool = new Pool(config);

      _pool.on('error', (err) => {
        console.error('[DB] Pool error:', err.message);
      });

      console.log(`[DB] Connected to PostgreSQL (${DATABASE_URL ? 'URL' : 'local Docker'})`);
    }
    return _pool;
  }
}

/**
 * Primary query function — use this everywhere.
 * @param {string} text  - SQL query with $1, $2 placeholders
 * @param {Array}  params - Positional parameters
 */
async function query(text, params = []) {
  const db = getDb();
  try {
    const result = await db.query(text, params);
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err.message, '\nSQL:', text.slice(0, 200));
    throw err;
  }
}

/**
 * Execute SQL file (for migrations)
 */
async function executeSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const db = getDb();
  await db.query(sql);
}

/**
 * Run all pending migrations in order.
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  // Create migrations tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const file of files) {
    const { rows } = await query('SELECT id FROM _migrations WHERE filename = $1', [file]);
    if (rows.length > 0) {
      console.log(`[DB] Migration already applied: ${file}`);
      continue;
    }
    console.log(`[DB] Applying migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const db = getDb();
    await db.query(sql);
    await query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
    console.log(`[DB] ✓ Applied: ${file}`);
  }

  console.log('[DB] All migrations up to date.');
}

/**
 * Health check
 */
async function healthCheck() {
  const { rows } = await query('SELECT NOW() as time, current_database() as db');
  return rows[0];
}

module.exports = { query, runMigrations, healthCheck, getDb };
