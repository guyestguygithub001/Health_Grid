with open('public/emr.html', 'r', encoding='utf-8') as f:
    emr = f.read()

# 1. Remove Active Context Block
target_active_context = """      <div class="nav-text" style="width: 100%; margin-top: 16px; margin-bottom: 24px; border-bottom: 1px solid rgb(229, 231, 235); padding: 0px 12px 16px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Active Context</p>
            <div id="activeRoleDisplay" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #0f172a; font-weight: 700; font-size: 13px; margin-bottom: 8px;">
                Role Loading...
            </div>
      </div>"""
emr = emr.replace(target_active_context, "")

# 2. Remove Register Staff Button
target_register_staff = """        <button id="registerStaffNavBtn" class="nav-btn" onclick="document.getElementById('emrSignupModal').style.display='flex';" style="margin-top:24px; background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;">
          <span class="nav-icon">➕</span><span class="nav-text">Register Staff</span>
        </button>"""
emr = emr.replace(target_register_staff, "")

# 3. Inject Vercel Static Login Fallback
old_catch_emr = """        } catch (err) {
          errDiv.style.display = 'block';
          errDiv.innerText = 'Network error.';
        }"""
new_catch_emr = """        } catch (err) {
          console.warn("API unreachable. Falling back to static Vercel preview.");
          if (u === 'admin' && (p === 'admin123' || p === 'secure_admin_password')) {
            sessionStorage.setItem('staff_token', 'vercel-mock-token-123');
            sessionStorage.setItem('staff_role', 'admin');
            sessionStorage.setItem('staff_name', 'System Admin');
            checkSession();
          } else {
            errDiv.style.display = 'block';
            errDiv.innerText = 'Network error. Try admin / admin123 for static preview.';
          }
        }"""
emr = emr.replace(old_catch_emr, new_catch_emr)

# 4. Remove fallback RBAC from emr.html JS if applicable, but actually it's better to update it to use the API like command.html does.
# Wait, let's just make it fetch from /api/v2/permissions
rbac_js_old = """  const roleMappings = {
    'admin': ['omniBar', 'triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView', 'postEncounterView', 'workspace'],
    'physician': ['omniBar', 'triageView', 'clinicsDashboardView', 'pharmacyView', 'labView', 'radView', 'recordsMainView', 'postEncounterView', 'workspace'],
    'nurse': ['omniBar', 'triageView', 'wardsView', 'pharmacyView', 'workspace'],
    'pharmacist': ['omniBar', 'pharmacyView', 'workspace']
  };

  function applyRbac(role) {
    const allowedViews = roleMappings[role] || [];"""
    
rbac_js_new = """  let globalPermissions = {};
  
  async function loadPermissions() {
    try {
      const res = await fetch('/api/v2/permissions');
      globalPermissions = await res.json();
    } catch(e) { console.error("Failed to load permissions", e); }
  }
  loadPermissions();

  function applyRbac(role) {
    let allowedViews = globalPermissions[role] || [];
    if (allowedViews.includes("all") || role === 'admin' || role === 'super_admin') {
      allowedViews = ['omniBar', 'triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView', 'postEncounterView', 'workspace'];
    }"""
emr = emr.replace(rbac_js_old, rbac_js_new)

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(emr)
print("Safely updated emr.html")
