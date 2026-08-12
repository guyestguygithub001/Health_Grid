const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });
pool.query('SELECT * FROM patients LIMIT 1').then(res => { console.log('Columns: ', res.fields.map(f => f.name)); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
