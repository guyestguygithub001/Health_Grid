import os

with open('server/server.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Ensure staff is initialized
if 'staff:[]' not in code and 'staff: []' not in code:
    code = code.replace(
        'return { patients:[], encounters:[], admissions:[], billing:[], facilities:[],',
        'return { staff:[], patients:[], encounters:[], admissions:[], billing:[], facilities:[],'
    )
    # Also handle the case where data might not have staff
    code = code.replace(
        'const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));\n    return data;',
        'const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));\n    if (!data.staff) { data.staff = []; fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); }\n    return data;'
    )

# 2. Inject API routes for /api/v2/auth/register and /api/v2/auth/login
# I will find a good place, for example, near "/api/v2/patient/login"
auth_routes = """
  // STAFF AUTHENTICATION GATEWAY
  if (req.method === "POST" && url.pathname === "/api/v2/auth/register") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.username || !payload.password || !payload.role) {
          sendJson(res, 400, { error: "Missing required fields" });
          return;
        }
        const db = _readFile();
        const existing = db.staff.find(s => s.username === payload.username);
        if (existing) {
          sendJson(res, 400, { error: "Username already exists" });
          return;
        }
        const newStaff = {
          id: "STF-" + Math.floor(Math.random() * 900000 + 100000),
          username: payload.username,
          password: payload.password, // Plaintext for mock demo
          name: payload.name || payload.username,
          role: payload.role
        };
        db.staff.push(newStaff);
        _writeFile(db);
        sendJson(res, 201, { message: "Staff registered successfully", staff: { id: newStaff.id, name: newStaff.name, role: newStaff.role } });
      } catch (e) {
        sendJson(res, 500, { error: "Internal server error" });
      }
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v2/auth/login") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const db = _readFile();
        const staff = db.staff.find(s => s.username === payload.username && s.password === payload.password);
        if (!staff) {
          sendJson(res, 401, { error: "Invalid credentials" });
          return;
        }
        // Generate mock token
        const token = "stf_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2);
        sendJson(res, 200, {
          token: token,
          user: {
            id: staff.id,
            name: staff.name,
            role: staff.role
          }
        });
      } catch (e) {
        sendJson(res, 500, { error: "Internal server error" });
      }
    });
    return;
  }
"""

if '/api/v2/auth/login' not in code:
    idx = code.find('if (req.method === "POST" && url.pathname === "/api/v2/patient/login")')
    if idx != -1:
        code = code[:idx] + auth_routes + code[idx:]
    else:
        # Fallback, just put it before the catch-all or at the start of the API block
        api_idx = code.find('if (req.method === "GET" && url.pathname === "/api/v2/summary")')
        code = code[:api_idx] + auth_routes + code[api_idx:]

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(code)
    print("Backend API routes injected successfully!")
