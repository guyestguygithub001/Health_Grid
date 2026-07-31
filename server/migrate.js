const fs = require('fs');
const path = require('path');
const db = require('./db');

// UUID mapping maps old IDs to new UUIDs so relationships are maintained
const idMap = {
    facilities: {},
    staff: {},
    patients: {},
    encounters: {},
    beds: {}
};

async function migrate() {
    try {
        console.log('Starting PostgreSQL migration...');

        // Read schema and initialize tables
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        await db.query(schema);
        console.log('Schema initialized.');

        // Read data.json
        const dataPath = path.join(__dirname, 'data.json');
        if (!fs.existsSync(dataPath)) {
            console.log('data.json not found, skipping migration.');
            return;
        }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // 1. Migrate Facilities
        console.log('Migrating facilities...');
        if (data.facilities) {
            for (const f of data.facilities) {
                const res = await db.query(
                    'INSERT INTO facilities (name, type, lga, level, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [f.name, f.type, f.lga, f.level, f.status || 'active']
                );
                idMap.facilities[f.id] = res.rows[0].id;
            }
        }

        // 2. Migrate Staff
        console.log('Migrating staff...');
        if (data.staff) {
            for (const s of data.staff) {
                const fid = s.facilityId ? idMap.facilities[s.facilityId] : null;
                const res = await db.query(
                    'INSERT INTO staff (facility_id, name, role, email, phone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [fid, s.name, s.role, s.email || null, s.phone || null, s.status || 'active']
                );
                idMap.staff[s.id] = res.rows[0].id;
            }
        }

        // 3. Migrate Patients
        console.log('Migrating patients...');
        if (data.patients) {
            for (const p of data.patients) {
                // Approximate first/last name
                const names = p.name ? p.name.split(' ') : ['Unknown', 'Unknown'];
                const firstName = names[0];
                const lastName = names.slice(1).join(' ') || 'Unknown';
                
                const res = await db.query(
                    'INSERT INTO patients (first_name, last_name, dob, gender, phone, blood_group, genotype, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                    [firstName, lastName, p.dob || null, p.gender || null, p.phone || null, p.bloodGroup || null, p.genotype || null, p.status || 'active']
                );
                idMap.patients[p.id] = res.rows[0].id;
            }
        }

        // 4. Migrate Encounters
        console.log('Migrating encounters...');
        if (data.encounters) {
            for (const e of data.encounters) {
                const pid = idMap.patients[e.patientId] || null;
                const sid = idMap.staff[e.staffId] || null;
                const fid = idMap.facilities[e.facilityId] || null;
                
                // If patientId doesn't exist anymore, skip
                if (!pid) continue;

                const res = await db.query(
                    'INSERT INTO encounters (patient_id, staff_id, facility_id, date, type, notes, diagnosis, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                    [pid, sid, fid, e.date || new Date(), e.type || null, e.notes || null, e.diagnosis || null, e.status || 'completed']
                );
                idMap.encounters[e.id] = res.rows[0].id;
            }
        }

        // 5. Migrate Beds / Wards
        console.log('Migrating beds and wards...');
        if (data.facilities) {
            for (const f of data.facilities) {
                const newFid = idMap.facilities[f.id];
                if (f.wards) {
                    for (const ward of f.wards) {
                        if (ward.beds) {
                            for (const bed of ward.beds) {
                                const res = await db.query(
                                    'INSERT INTO beds (facility_id, ward_name, bed_number, status) VALUES ($1, $2, $3, $4) RETURNING id',
                                    [newFid, ward.name, bed.id, bed.status || 'available']
                                );
                                idMap.beds[bed.id] = res.rows[0].id;

                                // If bed is occupied, create an admission record
                                if (bed.status === 'occupied' && bed.patientId) {
                                    const pid = idMap.patients[bed.patientId];
                                    if (pid) {
                                        await db.query(
                                            'INSERT INTO admissions (patient_id, bed_id, status) VALUES ($1, $2, $3)',
                                            [pid, res.rows[0].id, 'admitted']
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 6. Migrate Billing
        console.log('Migrating billing...');
        if (data.billing) {
            for (const b of data.billing) {
                const pid = idMap.patients[b.patientId];
                if (!pid) continue;
                await db.query(
                    'INSERT INTO bills (patient_id, amount, description, status, claim_id) VALUES ($1, $2, $3, $4, $5)',
                    [pid, parseFloat(b.amount || 0), b.description || 'Consultation', b.status || 'unpaid', b.claimId || null]
                );
            }
        }

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await db.pool.end();
    }
}

migrate();
