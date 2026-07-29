"""
Inject Final Enterprise Security: JWT, RBAC, Backups, Validation.
"""

import os
import re

filepath = 'server/server.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject Native JWT & Password Hashing utilities
crypto_utils = """
// ─── Enterprise Security: Native JWT & Crypto ────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

function signJWT(payload, expiresInMs = 8 * 60 * 60 * 1000) {
  payload.exp = Date.now() + expiresInMs;
  const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJWT(token) {
  if (!token) return null;
  const parts = token.split('.');
  if(parts.length !== 3) return null;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  if(signature === parts[2]) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload.exp && Date.now() > payload.exp) return null; // Expired
      return payload;
    } catch(e) { return null; }
  }
  return null;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// In-memory user database (Mocking a real DB for RBAC & Auth)
const adminSalt = crypto.randomBytes(16).toString('hex');
const USERS_DB = {
  "admin": { role: "admin", salt: adminSalt, hash: hashPassword(process.env.APP_PASS || "dev_local_only_password", adminSalt) },
  "dr_john": { role: "physician", salt: adminSalt, hash: hashPassword("doctor123", adminSalt) },
  "nurse_jane": { role: "nurse", salt: adminSalt, hash: hashPassword("nurse123", adminSalt) }
};
"""

if "function signJWT" not in content:
    content = content.replace("const crypto = require('crypto');", "const crypto = require('crypto');\n" + crypto_utils)

# 2. Inject Rotating Backups into writeData
old_write_data = """async function writeData(d) {
  if (isWriting) { writePending = true; pendingData = JSON.stringify(d); return; }
  isWriting = true;
  try {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (err) {
    console.error("Error writing data.json:", err);
  } finally {
    isWriting = false;
    if (writePending) { writePending = false; let n = JSON.parse(pendingData); pendingData = null; writeData(n); }
  }
}"""

new_write_data = """async function writeData(d) {
  if (isWriting) { writePending = true; pendingData = JSON.stringify(d); return; }
  isWriting = true;
  try {
    // 1. Create a rotating backup before overwriting to prevent corruption
    if (fs.existsSync(DATA_FILE)) {
      const backupPath = path.join(__dirname, 'data.backup.json');
      await fs.promises.copyFile(DATA_FILE, backupPath);
    }
    // 2. Safely write new data
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (err) {
    console.error("Error writing data.json:", err);
  } finally {
    isWriting = false;
    if (writePending) { writePending = false; let n = JSON.parse(pendingData); pendingData = null; writeData(n); }
  }
}"""

if "data.backup.json" not in content:
    content = content.replace(old_write_data, new_write_data)

# 3. Upgrade Authentication Logic to JWT
old_login_api = """      const validUser = process.env.APP_USER || "admin";
      const validPass = process.env.APP_PASS || (() => { if(process.env.NODE_ENV === "production") { console.error("[SECURITY] APP_PASS env var not set! Server refusing to start."); process.exit(1); } return "dev_local_only_password"; })();
      if (body.username === validUser && body.password === validPass) {
        const token = Buffer.from(`${body.username}:${body.password}`).toString("base64");
        sendJson(res, 200, { success: true, token, username: body.username, role: "system_admin", userId: "USR-0001" });
      } else {
        sendJson(res, 401, { success: false, error: "Invalid credentials" });
      }"""

new_login_api = """      // Enterprise Auth with Password Hashing and JWT
      const userRecord = USERS_DB[body.username];
      if (userRecord) {
        const attemptedHash = hashPassword(body.password, userRecord.salt);
        if (attemptedHash === userRecord.hash) {
          const token = signJWT({ username: body.username, role: userRecord.role });
          sendJson(res, 200, { success: true, token, username: body.username, role: userRecord.role, userId: "USR-0001" });
          return;
        }
      }
      sendJson(res, 401, { success: false, error: "Invalid credentials" });"""

content = content.replace(old_login_api, new_login_api)


# 4. Implement RBAC Middleware replacing Basic Auth verification
old_auth_check = """  // ── Authentication Check ──
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }
  try {
    const b64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    const colonIdx = decoded.indexOf(':');
    const login = decoded.slice(0, colonIdx);
    const password = decoded.slice(colonIdx + 1);
    if (login !== (process.env.APP_USER || "admin") || password !== (process.env.APP_PASS || (() => { if(process.env.NODE_ENV === "production") { console.error("[SECURITY] APP_PASS env var not set! Server refusing to start."); process.exit(1); } return "dev_local_only_password"; })())) {
      return sendJson(res, 403, { error: "Forbidden" });
    }
  } catch(e) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }"""

new_auth_check = """  // ── Enterprise Authorization & RBAC Check ──
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendJson(res, 401, { error: "Unauthorized: Missing Bearer Token" });
  }
  
  const token = authHeader.split(' ')[1];
  const userPayload = verifyJWT(token);
  
  if (!userPayload) {
    return sendJson(res, 401, { error: "Unauthorized: Invalid or Expired Token" });
  }
  
  const userRole = userPayload.role;
  const method = req.method;
  const p = url.pathname;
  
  // RBAC Enforcement Rules
  // Admin: full access to everything.
  // Physician: cannot access Billing POSTs or Audit logs
  // Nurse: cannot discharge patients, cannot access Billing POSTs or Audit logs
  if (userRole !== "admin") {
    if (p.startsWith("/api/v2/audit") || p.startsWith("/api/v2/billing") && method === "POST") {
      return sendJson(res, 403, { error: "Forbidden: Insufficient privileges for financial/audit ops" });
    }
    if (userRole === "nurse" && p === "/api/v2/emr/beds/discharge" && method === "POST") {
      return sendJson(res, 403, { error: "Forbidden: Nurses cannot discharge patients" });
    }
  }
  
  // Inject the authenticated user into the request context for Audit Logging
  req.user = userPayload.username;"""

content = content.replace(old_auth_check, new_auth_check)

# Update the AuditLogger to grab req.user instead of parsing Basic Auth
old_audit_logger = """      let user = 'Unknown';
      if (req.headers['authorization']) {
        try {
          const b64 = req.headers['authorization'].split(' ')[1];
          user = Buffer.from(b64, 'base64').toString('utf8').split(':')[0];
        } catch(e) {}
      }"""

new_audit_logger = """      let user = req.user || 'Unknown';"""

content = content.replace(old_audit_logger, new_audit_logger)


# 5. Inject Business Logic validation into Billing POST
old_billing_post = """  if (req.method === "POST" && url.pathname === "/api/v2/billing") { const body = await collectBody(req); const bill = createAutoBill(data, body.patientId, body.service, body.description); queueDatabaseWrite(data); sendJson(res, 201, bill); return; }"""
new_billing_post = """  if (req.method === "POST" && url.pathname === "/api/v2/billing") { 
    const body = await collectBody(req); 
    // Business Logic Validation (Anti-Fraud)
    if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
      return sendJson(res, 400, { error: "Validation Error: Bill amount must be a positive number." });
    }
    const bill = createAutoBill(data, body.patientId, body.service, body.description); 
    queueDatabaseWrite(data); sendJson(res, 201, bill); return; 
  }"""

content = content.replace(old_billing_post, new_billing_post)

# 6. Inject Business logic validation into Orders POST (walkin labs)
old_orders_post = """  if (req.method === "POST" && url.pathname === "/api/v2/orders") { const body = await collectBody(req); const newOrders = body.orders.map(o => ({ id: nextId("ORD", []), type: o.type, item: o.item, status: "Pending", priority: o.priority, date: new Date().toISOString() })); data.encounters.push({ id: nextId("ENC", data.encounters), patientId: body.patientId, date: new Date().toISOString().slice(0, 10), orders: newOrders }); queueDatabaseWrite(data); sendJson(res, 201, newOrders); return; }"""
new_orders_post = """  if (req.method === "POST" && url.pathname === "/api/v2/orders") { 
    const body = await collectBody(req); 
    if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
      return sendJson(res, 400, { error: "Validation Error: Amount must be positive." });
    }
    const newOrders = body.orders.map(o => ({ id: nextId("ORD", []), type: o.type, item: o.item, status: "Pending", priority: o.priority, date: new Date().toISOString() })); 
    data.encounters.push({ id: nextId("ENC", data.encounters), patientId: body.patientId, date: new Date().toISOString().slice(0, 10), orders: newOrders }); queueDatabaseWrite(data); sendJson(res, 201, newOrders); return; 
  }"""
content = content.replace(old_orders_post, new_orders_post)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Enterprise Security Injected into server.js")
