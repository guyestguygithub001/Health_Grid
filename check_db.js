const db = require('./server/db-postgres');
db.query("SELECT name, specialty, consultation_fee FROM staff WHERE role='physician' ORDER BY name")
  .then(r => {
    console.log('Doctors in PostgreSQL:');
    r.rows.forEach(d => console.log(' -', d.name, '|', d.specialty, '| NGN', d.consultation_fee));
    return db.query("SELECT COUNT(*) as cnt FROM pharmacy_products");
  })
  .then(r => { console.log('Pharmacy products:', r.rows[0].cnt); process.exit(0); })
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
