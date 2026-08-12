const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

async function run() {
  const files = ['001_initial_schema.sql', '002_seed_data.sql', '003_patient_demographics.sql', '004_otp_security.sql', '005_mpi_demographics.sql'];
  for (const file of files) {
    console.log('Running ' + file);
    const sql = fs.readFileSync('server/migrations/' + file, 'utf8');
    await pool.query(sql);
  }
  console.log('All migrations applied.');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
