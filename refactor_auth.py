import re

with open("server/server.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace /api/v2/auth/register
register_old = r"""  if \(req\.method === "POST" && url\.pathname === "/api/v2/auth/register"\) \{
    let body = "";
    req\.on\("data", chunk => body \+= chunk\);
    req\.on\("end", \(\) => \{
      try \{
        const payload = JSON\.parse\(body\);
        if \(!payload\.username \|\| !payload\.password \|\| !payload\.role\) \{
          sendJson\(res, 400, \{ error: "Missing required fields" \}\);
          return;
        \}
        const db = _readFile\(\);
        const existing = db\.staff\.find\(s => s\.username === payload\.username\);
        if \(existing\) \{
          sendJson\(res, 400, \{ error: "Username already exists" \}\);
          return;
        \}
        const newStaff = \{
          id: "STF-" \+ Math\.floor\(Math\.random\(\) \* 900000 \+ 100000\),
          username: payload\.username,
          password: payload\.password, // Plaintext for mock demo
          name: payload\.name \|\| payload\.username,
          role: payload\.role,
          created_at: new Date\(\)\.toISOString\(\)
        \};
        db\.staff\.push\(newStaff\);
        queueDatabaseWrite\(db\);
        sendJson\(res, 201, \{ success: true, user: newStaff \}\);
      \} catch \(e\) \{
        sendJson\(res, 400, \{ error: "Invalid JSON payload" \}\);
      \}
    \}\);
    return;
  \}"""

register_new = """  if (req.method === "POST" && url.pathname === "/api/v2/auth/register") {
    try {
      const payload = await collectBody(req);
      if (!payload.username || !payload.password || !payload.role) {
        sendJson(res, 400, { error: "Missing required fields" });
        return;
      }
      
      const newStaffId = "STF-" + Math.floor(Math.random() * 900000 + 100000);
      const newStaffName = payload.name || payload.username;
      
      try {
        const { query } = require('./db-postgres');
        const existing = await query('SELECT id FROM staff WHERE username = $1', [payload.username]);
        if (existing.rows.length > 0) {
          sendJson(res, 400, { error: "Username already exists" });
          return;
        }
        await query(
          'INSERT INTO staff (id, username, password, name, role) VALUES ($1, $2, $3, $4, $5)',
          [newStaffId, payload.username, payload.password, newStaffName, payload.role]
        );
        sendJson(res, 201, { success: true, user: { id: newStaffId, username: payload.username, name: newStaffName, role: payload.role } });
        return;
      } catch (dbErr) {
        // Fallback to local JSON
        const db = _readFile();
        const existing = db.staff.find(s => s.username === payload.username);
        if (existing) {
          sendJson(res, 400, { error: "Username already exists" });
          return;
        }
        const newStaff = {
          id: newStaffId,
          username: payload.username,
          password: payload.password, // Plaintext for mock demo
          name: newStaffName,
          role: payload.role,
          created_at: new Date().toISOString()
        };
        db.staff.push(newStaff);
        queueDatabaseWrite(db);
        sendJson(res, 201, { success: true, user: newStaff });
      }
    } catch (e) {
      sendJson(res, 400, { error: "Invalid payload or server error" });
    }
    return;
  }"""

# Replace /api/v2/auth/login
login_old = r"""  if \(req\.method === "POST" && url\.pathname === "/api/v2/auth/login"\) \{
    let body = "";
    req\.on\("data", chunk => body \+= chunk\);
    req\.on\("end", \(\) => \{
      try \{
        const payload = JSON\.parse\(body\);

        // Master Admin Override
        if \(payload\.username === 'admin' && payload\.password === 'admin123'\) \{
          const token = "stf_" \+ Date\.now\(\)\.toString\(36\) \+ "_" \+ Math\.random\(\)\.toString\(36\)\.substr\(2\);
          sendJson\(res, 200, \{
            token: token,
            user: \{ id: "ADM-001", name: "System Admin", role: "admin" \}
          \}\);
          return;
        \}

        const db = _readFile\(\);
        const staff = db\.staff\.find\(s => s\.username === payload\.username && s\.password === payload\.password\);
        if \(!staff\) \{
          sendJson\(res, 401, \{ error: "Invalid credentials" \}\);
          return;
        \}
        const token = "stf_" \+ Date\.now\(\)\.toString\(36\) \+ "_" \+ Math\.random\(\)\.toString\(36\)\.substr\(2\);
        sendJson\(res, 200, \{
          token: token,
          user: \{ id: staff\.id, name: staff\.name, role: staff\.role \}
        \}\);
      \} catch \(e\) \{
        sendJson\(res, 400, \{ error: "Invalid JSON payload" \}\);
      \}
    \}\);
    return;
  \}"""

login_new = """  if (req.method === "POST" && url.pathname === "/api/v2/auth/login") {
    try {
      const payload = await collectBody(req);
      
      // Master Admin Override
      if (payload.username === 'admin' && payload.password === 'admin123') {
        const token = "stf_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2);
        sendJson(res, 200, {
          token: token,
          user: { id: "ADM-001", name: "System Admin", role: "admin" }
        });
        return;
      }

      let staff = null;
      try {
        const { query } = require('./db-postgres');
        const resDb = await query('SELECT * FROM staff WHERE username = $1 AND password = $2', [payload.username, payload.password]);
        staff = resDb.rows[0];
      } catch (dbErr) {
        // Fallback to local JSON
        const db = _readFile();
        staff = db.staff.find(s => s.username === payload.username && s.password === payload.password);
      }
      
      if (!staff) {
        sendJson(res, 401, { error: "Invalid credentials" });
        return;
      }
      const token = "stf_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2);
      sendJson(res, 200, {
        token: token,
        user: { id: staff.id, name: staff.name, role: staff.role }
      });
    } catch (e) {
      sendJson(res, 400, { error: "Invalid payload or server error" });
    }
    return;
  }"""

if re.search(register_old, content):
    content = re.sub(register_old, register_new, content)
else:
    print("Warning: Register route not found")

if re.search(login_old, content):
    content = re.sub(login_old, login_new, content)
else:
    print("Warning: Login route not found")

with open("server/server.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Auth endpoints migrated to PostgreSQL!")
