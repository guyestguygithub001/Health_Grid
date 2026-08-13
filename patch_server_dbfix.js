const fs = require('fs');
let c = fs.readFileSync('server/server.js', 'utf8');

c = c.replace(/const pat = Object\.values\(db\)\.find\(p => p\.id === b\.patientId\);/g, 'const pat = data.patients.find(p => p.id === b.patientId);');
c = c.replace(/const patient = Object\.values\(db\)\.find\(p => p\.id === patientId\);/g, 'const patient = data.patients.find(p => p.id === patientId);');
c = c.replace(/const patient = Object\.values\(db\)\.find\(p => p\.id === pid\);/g, 'const patient = data.patients.find(p => p.id === pid);');

c = c.replace(/if\(!patient\.encounters\) patient\.encounters = \[\];\s*patient\.encounters\.push\(enc\);\s*saveDb\(db\);/g, `
            if(!data.emr_encounters) data.emr_encounters = [];
            data.emr_encounters.push(enc);
            const DB_FILE_PATH = path.join(__dirname, 'data', 'database.json');
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
`);

fs.writeFileSync('server/server.js', c);
console.log('Fixed DB logic in server.js');
