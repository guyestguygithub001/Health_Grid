with open('server/server.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '/api/v1/auth/login' in line:
        insert_idx = i - 1
        break

mock_endpoints = """
    if (req.method === 'GET' && pathname === '/api/v1/beds') {
        const beds = [
            { bedId: 'A1-01', status: 'Occupied', patientId: 'PT-802' },
            { bedId: 'A1-02', status: 'Available', patientId: null },
            { bedId: 'A1-03', status: 'Occupied', patientId: 'PT-814' },
            { bedId: 'A1-04', status: 'Available', patientId: null },
            { bedId: 'B2-01', status: 'Occupied', patientId: 'PT-905' },
            { bedId: 'B2-02', status: 'Occupied', patientId: 'PT-912' },
            { bedId: 'B2-03', status: 'Available', patientId: null },
            { bedId: 'B2-04', status: 'Available', patientId: null }
        ];
        sendJson(res, 200, beds);
        return;
    }

    if (req.method === 'GET' && pathname === '/api/v1/orders') {
        sendJson(res, 200, []);
        return;
    }

    if (req.method === 'GET' && pathname === '/api/v1/audit') {
        const logs = [
            { action: 'Patient Record Updated', user: 'admin', ip: '192.168.1.45', timestamp: new Date().getTime() - 100000 },
            { action: 'Prescription Dispensed', user: 'pharmacy', ip: '192.168.1.88', timestamp: new Date().getTime() - 500000 },
            { action: 'Lab Results Uploaded', user: 'lab', ip: '192.168.1.12', timestamp: new Date().getTime() - 900000 },
            { action: 'User Login', user: 'admin', ip: '192.168.1.45', timestamp: new Date().getTime() - 3600000 }
        ];
        sendJson(res, 200, logs);
        return;
    }

    if (req.method === 'GET' && pathname === '/api/v1/billing/metrics') {
        sendJson(res, 200, {
            todayRevenue: 245000,
            pendingClaims: 12,
            activeInvoices: 45
        });
        return;
    }
"""

lines.insert(insert_idx, mock_endpoints)

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
