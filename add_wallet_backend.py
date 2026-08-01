import re

with open('server/server.js', 'r', encoding='utf-8') as f:
    server_code = f.read()

wallet_endpoint = """
  if (req.method === "POST" && pathname === "/api/v2/patient/wallet/fund") {
    const body = await collectBody(req);
    const patient = data.patients.find(p => p.id === body.patientId);
    if (!patient) return sendJson(res, 404, { error: "Patient not found" });
    
    patient.walletBalance = (patient.walletBalance || 0) + parseFloat(body.amount);
    queueDatabaseWrite(data);
    sendJson(res, 200, { success: true, newBalance: patient.walletBalance });
    return;
  }
"""

server_code = server_code.replace('if (req.method === "GET" && pathname === "/api/v2/reports/summary") {',
                                  wallet_endpoint + '\n  if (req.method === "GET" && pathname === "/api/v2/reports/summary") {')

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(server_code)

print("Added wallet endpoint to server.js")
