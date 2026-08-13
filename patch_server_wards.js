const fs = require('fs');
let c = fs.readFileSync('server/server.js', 'utf8');

const wardsApi = `
// ==========================================
// WARDS API ENDPOINTS
// ==========================================

const WARDS_FILE = path.join(__dirname, 'data', 'wards.json');

function getWards() {
    if (!fs.existsSync(WARDS_FILE)) return { wards: [] };
    return JSON.parse(fs.readFileSync(WARDS_FILE, 'utf8'));
}

function saveWards(data) {
    fs.writeFileSync(WARDS_FILE, JSON.stringify(data, null, 2));
}

// 1. GET /api/v2/wards -> Returns all wards and beds (with basic patient info if occupied)
if (pathname === '/api/v2/wards' && req.method === 'GET') {
    if (!checkAuth(req, res)) return;
    const wardsData = getWards();
    
    // Enrich beds with patient details if occupied
    wardsData.wards.forEach(w => {
        w.beds.forEach(b => {
            if (b.status === 'occupied' && b.patientId) {
                const pat = Object.values(db).find(p => p.id === b.patientId);
                if (pat) {
                    b.patientName = pat.name;
                    b.patientAge = pat.age || '?';
                    b.patientGender = pat.gender || pat.sex || '?';
                }
            }
        });
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(wardsData));
    return;
}

// 2. POST /api/v2/wards/admit -> Admit a patient to a bed
if (pathname === '/api/v2/wards/admit' && req.method === 'POST') {
    if (!checkAuth(req, res)) return;
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const { wardId, bedId, patientId } = JSON.parse(body);
            if (!wardId || !bedId || !patientId) throw new Error('Missing fields');
            
            const wardsData = getWards();
            const ward = wardsData.wards.find(w => w.id === wardId);
            if (!ward) throw new Error('Ward not found');
            
            const bed = ward.beds.find(b => b.bedId === bedId);
            if (!bed) throw new Error('Bed not found');
            if (bed.status === 'occupied') throw new Error('Bed is already occupied');
            
            // Check if patient exists
            const patient = Object.values(db).find(p => p.id === patientId);
            if (!patient) throw new Error('Patient not found in MPI');
            
            // Admit
            bed.status = 'occupied';
            bed.patientId = patientId;
            bed.admittedAt = new Date().toISOString();
            
            saveWards(wardsData);
            
            // Also log the admission as an encounter in the timeline
            const enc = {
                id: 'ENC-' + Date.now().toString().slice(-6),
                patientId: patientId,
                date: new Date().toISOString(),
                type: 'Admission',
                text: \`Patient admitted to \${ward.name}, Bed \${bedId}\`,
                status: 'Admitted'
            };
            if(!patient.encounters) patient.encounters = [];
            patient.encounters.push(enc);
            saveDb(db);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, bed }));
        } catch(err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
    });
    return;
}

// 3. POST /api/v2/wards/discharge -> Discharge a patient from a bed
if (pathname === '/api/v2/wards/discharge' && req.method === 'POST') {
    if (!checkAuth(req, res)) return;
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const { wardId, bedId } = JSON.parse(body);
            if (!wardId || !bedId) throw new Error('Missing fields');
            
            const wardsData = getWards();
            const ward = wardsData.wards.find(w => w.id === wardId);
            if (!ward) throw new Error('Ward not found');
            
            const bed = ward.beds.find(b => b.bedId === bedId);
            if (!bed) throw new Error('Bed not found');
            
            if (bed.status !== 'occupied') throw new Error('Bed is already available');
            
            const pid = bed.patientId;
            
            // Discharge
            bed.status = 'available';
            bed.patientId = null;
            bed.admittedAt = null;
            
            saveWards(wardsData);
            
            // Log discharge
            const patient = Object.values(db).find(p => p.id === pid);
            if (patient) {
                const enc = {
                    id: 'ENC-' + Date.now().toString().slice(-6),
                    patientId: pid,
                    date: new Date().toISOString(),
                    type: 'Discharge',
                    text: \`Patient discharged from \${ward.name}, Bed \${bedId}\`,
                    status: 'Discharged'
                };
                if(!patient.encounters) patient.encounters = [];
                patient.encounters.push(enc);
                saveDb(db);
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch(err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
    });
    return;
}

`;

c = c.replace('// === START SERVER ===', wardsApi + '\n// === START SERVER ===');
fs.writeFileSync('server/server.js', c);
console.log('Backend APIs injected');
