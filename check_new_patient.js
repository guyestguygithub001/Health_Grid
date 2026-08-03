const db = require('./server/db-postgres');
db.query("SELECT id, name, phone, tribe, religion, marital_status, occupation, address, community, lga, next_of_kin, next_of_kin_relationship FROM patients WHERE phone = '08011223344'")
  .then(r => {
    console.log('Inserted Data:');
    console.log(r.rows[0]);
    process.exit(0);
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
