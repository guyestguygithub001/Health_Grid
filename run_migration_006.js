const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
pool.query(fs.readFileSync('server/migrations/006_free_tier_indices.sql', 'utf8')).then(() => { console.log('Migration 006 applied'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
