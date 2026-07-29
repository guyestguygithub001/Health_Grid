import re

def update_server():
    with open('server/server.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add /api/v2/auth/register
    if '/api/v2/auth/register' not in content:
        register_endpoint = """
    // ── 3. Authentication Routes ──────────
    if (req.method === "POST" && pathname === "/api/v2/auth/register") {
      try {
        const body = await collectBody(req);
        if (!body.username || !body.password || !body.role) {
          sendJson(res, 400, { error: "Missing required fields" });
          return;
        }
        
        // Ensure user does not already exist
        if (data.users && data.users.some(u => u.username === body.username)) {
           sendJson(res, 409, { error: "User already exists" });
           return;
        }
        
        if (!data.users) data.users = [];
        const newUser = {
           id: "USR-" + Date.now(),
           username: body.username,
           password: body.password, // In a real app, hash this!
           role: body.role,
           name: body.name || body.username
        };
        data.users.push(newUser);
        queueDatabaseWrite(data);
        
        // Issue token
        const token = "mock-jwt-" + Buffer.from(body.username + ":" + body.role).toString('base64');
        sendJson(res, 201, { success: true, token, role: body.role, message: "Registered successfully" });
      } catch (err) {
        sendJson(res, 500, { error: "Registration failed" });
      }
      return;
    }
"""
        content = content.replace('// ── 3. Authentication Routes ──────────', register_endpoint)
        
    with open('server/server.js', 'w', encoding='utf-8') as f:
        f.write(content)

def update_html():
    with open('public/command.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Add Sign Up button
    if 'id="signupModalBtn"' not in html:
        btn_html = """
        <button type="submit" id="loginBtn"
          style="width:100%;padding:13px;border:none;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.02em;transition:opacity 0.2s; margin-bottom:12px;">
          Sign In
        </button>
        <button type="button" id="signupModalBtn" onclick="document.getElementById('signupModal').style.display='flex'; document.getElementById('loginScreen').style.display='none';"
          style="width:100%;padding:13px;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:transparent;color:#fff;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.02em;transition:background 0.2s;">
          Sign Up as Clinical Staff
        </button>
"""
        html = html.replace("""        <button type="submit" id="loginBtn"
          style="width:100%;padding:13px;border:none;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.02em;transition:opacity 0.2s;">
          Sign In
        </button>""", btn_html)

    # Add Signup Modal
    if 'id="signupModal"' not in html:
        signup_modal = """
  <!-- SIGN UP MODAL -->
  <div id="signupModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:10000; align-items:center; justify-content:center;">
    <div style="width:100%; max-width:450px; background:#1e293b; padding:40px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); max-height:90vh; overflow-y:auto;">
      <h2 style="color:#fff; font-size:24px; font-weight:700; margin-top:0; margin-bottom:8px;">Staff Registration</h2>
      <p style="color:rgba(255,255,255,0.7); font-size:13px; margin-bottom:24px; line-height:1.5;">Create a new clinical or administrative account.</p>
      
      <form id="signupForm">
        <div style="margin-bottom:16px;">
          <label style="display:block;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;margin-bottom:6px;">Full Name</label>
          <input id="signupName" type="text" required style="width:100%;box-sizing:border-box;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none;" />
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;margin-bottom:6px;">Username</label>
          <input id="signupUser" type="text" required style="width:100%;box-sizing:border-box;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none;" />
        </div>
        <div style="margin-bottom:16px;">
          <label style="display:block;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;margin-bottom:6px;">Password</label>
          <input id="signupPass" type="password" required style="width:100%;box-sizing:border-box;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none;" />
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;margin-bottom:6px;">Role</label>
          <select id="signupRole" required style="width:100%;box-sizing:border-box;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:14px;outline:none;">
            <option value="physician">Doctor / Physician</option>
            <option value="nurse">Nurse</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div id="signupError" style="display:none;color:#f87171;font-size:13px;margin-bottom:16px;"></div>
        <div style="display:flex; gap:12px;">
          <button type="button" onclick="document.getElementById('signupModal').style.display='none'; document.getElementById('loginScreen').style.display='flex';" style="flex:1; padding:12px; border:1px solid rgba(255,255,255,0.2); border-radius:8px; background:transparent; color:#fff; cursor:pointer; font-weight:600;">Cancel</button>
          <button type="submit" style="flex:1; padding:12px; border:none; border-radius:8px; background:#10b981; color:#fff; cursor:pointer; font-weight:700;">Register</button>
        </div>
      </form>
    </div>
  </div>
"""
        html = html.replace('<!-- PASSWORD RESET MODAL -->', signup_modal + '\n  <!-- PASSWORD RESET MODAL -->')

    # Add Signup logic
    if 'signupForm' not in html[html.rfind('<script>'):]:
        signup_logic = """
      document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('signupUser').value;
        const pass = document.getElementById('signupPass').value;
        const name = document.getElementById('signupName').value;
        const role = document.getElementById('signupRole').value;
        const errorDiv = document.getElementById('signupError');
        errorDiv.style.display = 'none';
        
        try {
          const res = await fetch('/api/v2/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, name: name, role: role })
          });
          
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('ehr_admin_token', data.token);
            localStorage.setItem('ehr_user_role', data.role);
            document.getElementById('signupModal').style.display = 'none';
            // Trigger UI reset
            window.location.reload();
          } else {
            const data = await res.json();
            errorDiv.style.display = 'block';
            errorDiv.innerText = data.error || 'Registration failed.';
          }
        } catch (err) {
          errorDiv.style.display = 'block';
          errorDiv.innerText = 'Server unreachable.';
        }
      });
"""
        # Inject right after login logic
        html = html.replace('});\n    });', '});\n' + signup_logic + '    });')

    with open('public/command.html', 'w', encoding='utf-8') as f:
        f.write(html)

update_server()
update_html()
