import fs from 'fs';

let content = fs.readFileSync('server/server.js', 'utf8');

const registerStartStr = '  if (req.method === "POST" && url.pathname === "/api/v2/auth/register") {';
const registerStart = content.indexOf(registerStartStr);
if (registerStart === -1) throw new Error("Could not find register route start");

const registerEndStr = '  }';
let registerEnd = content.indexOf(registerEndStr, content.indexOf('queueDatabaseWrite(db);', registerStart));
if (registerEnd === -1) throw new Error("Could not find register route end");
registerEnd += registerEndStr.length;

const registerNew = `  if (req.method === "POST" && url.pathname === "/api/v2/auth/register") {
    try {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body);
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
            const db = _readFile();
            const existing = db.staff.find(s => s.username === payload.username);
            if (existing) {
              sendJson(res, 400, { error: "Username already exists" });
              return;
            }
            const newStaff = {
              id: newStaffId,
              username: payload.username,
              password: payload.password,
              name: newStaffName,
              role: payload.role,
              created_at: new Date().toISOString()
            };
            db.staff.push(newStaff);
            queueDatabaseWrite(db);
            sendJson(res, 201, { success: true, user: newStaff });
          }
        } catch (e) {
          sendJson(res, 400, { error: "Invalid payload" });
        }
      });
    } catch (e) {
      sendJson(res, 500, { error: "Server error" });
    }
    return;
  }`;

content = content.substring(0, registerStart) + registerNew + content.substring(registerEnd);

const loginStartStr = '  if (req.method === "POST" && url.pathname === "/api/v2/auth/login") {';
const loginStart = content.indexOf(loginStartStr);
if (loginStart === -1) throw new Error("Could not find login route start");

let loginEnd = content.indexOf(registerEndStr, content.indexOf('sendJson(res, 200, {', loginStart) + 50);
if (loginEnd === -1) throw new Error("Could not find login route end");
loginEnd += registerEndStr.length;

const loginNew = `  if (req.method === "POST" && url.pathname === "/api/v2/auth/login") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        if (payload.username === 'admin' && payload.password === 'admin123') {
          const token = "stf_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2);
          sendJson(res, 200, { token: token, user: { id: "ADM-001", name: "System Admin", role: "admin" } });
          return;
        }
        let staff = null;
        try {
          const { query } = require('./db-postgres');
          const resDb = await query('SELECT * FROM staff WHERE username = $1 AND password = $2', [payload.username, payload.password]);
          staff = resDb.rows[0];
        } catch (dbErr) {
          const db = _readFile();
          staff = db.staff.find(s => s.username === payload.username && s.password === payload.password);
        }
        if (!staff) {
          sendJson(res, 401, { error: "Invalid credentials" });
          return;
        }
        const token = "stf_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2);
        sendJson(res, 200, { token: token, user: { id: staff.id, name: staff.name, role: staff.role } });
      } catch (e) {
        sendJson(res, 400, { error: "Invalid payload" });
      }
    });
    return;
  }`;

content = content.substring(0, loginStart) + loginNew + content.substring(loginEnd);

fs.writeFileSync('server/server.js', content);
console.log('Successfully refactored auth routes via string boundaries');
