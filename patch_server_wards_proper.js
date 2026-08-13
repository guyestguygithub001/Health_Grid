const fs = require('fs');
let c = fs.readFileSync('server/server.js', 'utf8');

const wardsApiInjection = `
      // ==========================
      // WARDS API (Injected)
      // ==========================
      const WARDS_FILE = path.join(__dirname, 'data', 'wards.json');
      function getWardsData() {
          if (!fs.existsSync(WARDS_FILE)) return { wards: [] };
          return JSON.parse(fs.readFileSync(WARDS_FILE, 'utf8'));
      }
      function saveWardsData(d) {
          fs.writeFileSync(WARDS_FILE, JSON.stringify(d, null, 2));
      }

      if (req.method === "GET" && pathname === "/api/v2/wards") {
          const wardsData = getWardsData();
          wardsData.wards.forEach(w => {
              w.beds.forEach(b => {
                  if (b.status === 'occupied' && b.patientId) {
                      const pat = data.patients.find(p => p.id === b.patientId);
                      if (pat) {
                          b.patientName = pat.name;
                          b.patientAge = pat.age || '?';
                          b.patientGender = pat.gender || pat.sex || '?';
                      }
                  }
              });
          });
          sendJson(res, 200, wardsData);
          return;
      }

      if (req.method === "POST" && pathname === "/api/v2/wards/admit") {
          const body = await collectBody(req);
          const { wardId, bedId, patientId } = body;
          
          if (!wardId || !bedId || !patientId) {
              sendJson(res, 400, { success: false, error: 'Missing fields' });
              return;
          }
          
          const wardsData = getWardsData();
          const ward = wardsData.wards.find(w => w.id === wardId);
          if (!ward) {
              sendJson(res, 404, { success: false, error: 'Ward not found' });
              return;
          }
          
          const bed = ward.beds.find(b => b.bedId === bedId);
          if (!bed) {
              sendJson(res, 404, { success: false, error: 'Bed not found' });
              return;
          }
          if (bed.status === 'occupied') {
              sendJson(res, 400, { success: false, error: 'Bed is already occupied' });
              return;
          }
          
          const patient = data.patients.find(p => p.id === patientId);
          if (!patient) {
              sendJson(res, 404, { success: false, error: 'Patient not found' });
              return;
          }
          
          // Admit
          bed.status = 'occupied';
          bed.patientId = patientId;
          bed.admittedAt = new Date().toISOString();
          saveWardsData(wardsData);
          
          // Create Encounter
          const enc = {
              id: 'ENC-' + Date.now().toString().slice(-6),
              patientId: patientId,
              date: new Date().toISOString(),
              type: 'Admission',
              text: \`Patient admitted to \${ward.name}, Bed \${bedId}\`,
              status: 'Admitted'
          };
          if(!data.emr_encounters) data.emr_encounters = [];
          data.emr_encounters.push(enc);
          const DB_FILE_PATH = path.join(__dirname, 'data', 'database.json');
          fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
          
          sendJson(res, 200, { success: true, bed });
          return;
      }

      if (req.method === "POST" && pathname === "/api/v2/wards/discharge") {
          const body = await collectBody(req);
          const { wardId, bedId } = body;
          
          if (!wardId || !bedId) {
              sendJson(res, 400, { success: false, error: 'Missing fields' });
              return;
          }
          
          const wardsData = getWardsData();
          const ward = wardsData.wards.find(w => w.id === wardId);
          if (!ward) {
              sendJson(res, 404, { success: false, error: 'Ward not found' });
              return;
          }
          
          const bed = ward.beds.find(b => b.bedId === bedId);
          if (!bed) {
              sendJson(res, 404, { success: false, error: 'Bed not found' });
              return;
          }
          
          if (bed.status !== 'occupied') {
              sendJson(res, 400, { success: false, error: 'Bed is already available' });
              return;
          }
          
          const pid = bed.patientId;
          
          // Discharge
          bed.status = 'available';
          bed.patientId = null;
          bed.admittedAt = null;
          saveWardsData(wardsData);
          
          const patient = data.patients.find(p => p.id === pid);
          if (patient) {
              const enc = {
                  id: 'ENC-' + Date.now().toString().slice(-6),
                  patientId: pid,
                  date: new Date().toISOString(),
                  type: 'Discharge',
                  text: \`Patient discharged from \${ward.name}, Bed \${bedId}\`,
                  status: 'Discharged'
              };
              if(!data.emr_encounters) data.emr_encounters = [];
              data.emr_encounters.push(enc);
              const DB_FILE_PATH = path.join(__dirname, 'data', 'database.json');
              fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
          }
          
          sendJson(res, 200, { success: true });
          return;
      }
      
      // Timeline Load`;

c = c.replace('      // Timeline Load', wardsApiInjection);
fs.writeFileSync('server/server.js', c);
console.log('Injected properly into http.createServer block');
